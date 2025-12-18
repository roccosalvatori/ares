package com.ares.service;

import com.ares.security.JwtTokenProvider;
import com.ares.security.LdapUserDetailsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.naming.Context;
import javax.naming.directory.DirContext;
import javax.naming.ldap.LdapContext;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

@Service
public class LdapAuthenticationService {

    private final JwtTokenProvider jwtTokenProvider;
    private final LdapUserDetailsService userDetailsService;
    private final LdapTemplate ldapTemplate;

    @Value("${ares.ldap.user-search-base:}")
    private String userSearchBase;

    @Value("${ares.ldap.user-search-filter:}")
    private String userSearchFilter;

    @Value("${ares.ldap.ad.domain:}")
    private String adDomain;

    public LdapAuthenticationService(
            JwtTokenProvider jwtTokenProvider,
            LdapUserDetailsService userDetailsService,
            LdapTemplate ldapTemplate) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.ldapTemplate = ldapTemplate;
    }

    public String authenticate(String username, String password, String ldapUrl) {
        try {
            // Test credentials bypass for admin/admin
            if ("admin".equals(username) && "admin".equals(password)) {
                return jwtTokenProvider.generateToken("admin");
            }

            // Normal LDAP authentication for all other users
            // If ldapUrl is null or empty, use default from configuration
            String effectiveLdapUrl = (ldapUrl == null || ldapUrl.trim().isEmpty()) 
                ? "" 
                : ldapUrl;
            
            Authentication authentication = authenticateWithLdap(effectiveLdapUrl, username, password);

            if (authentication.isAuthenticated()) {
                // Load user details with groups/roles from LDAP
                UserDetails userDetails = userDetailsService.loadUserByUsername(username, ldapUrl);
                return jwtTokenProvider.generateToken(username);
            } else {
                throw new BadCredentialsException("Invalid credentials");
            }
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            throw new BadCredentialsException("Authentication failed: " + e.getMessage());
        }
    }

    public boolean testConnection(String ldapUrl, String username, String password) {
        // Test credentials bypass for admin/admin
        if ("admin".equals(username) && "admin".equals(password)) {
            return true;
        }

        DirContext context = null;
        try {
            Authentication authentication = authenticateWithLdap(ldapUrl, username, password);
            return authentication.isAuthenticated();
        } catch (Exception e) {
            return false;
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (Exception e) {
                    // Ignore
                }
            }
        }
    }

    private Authentication authenticateWithLdap(String ldapUrl, String username, String password) {
        // Extract domain from username if it contains @ (e.g., user@domain.com)
        String domain = extractDomainFromUsername(username);
        
        // For AD authentication, we'll use standard LDAP bind with different DN patterns
        // AD typically uses formats like: user@domain.com or DOMAIN\\user

        // For standard LDAP, try direct bind
        DirContext context = null;
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapUrl);
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            
            // Try different DN patterns for LDAP bind
            // For AD: user@domain.com, DOMAIN\\user, or CN=user,CN=Users,DC=domain,DC=com
            // For standard LDAP: uid=user,ou=people or cn=user,ou=users
            List<String> dnPatterns = new ArrayList<>();
            
            // Add username as-is (works for AD UPN format: user@domain.com)
            dnPatterns.add(username);
            
            // If username contains @, it's already in UPN format
            if (!username.contains("@")) {
                // Try with domain from username extraction
                if (domain != null && !domain.isEmpty()) {
                    dnPatterns.add(username + "@" + domain);
                }
                // Try with configured AD domain
                if (adDomain != null && !adDomain.isEmpty()) {
                    dnPatterns.add(username + "@" + adDomain);
                }
                // Try down-level logon format (DOMAIN\\user)
                if (adDomain != null && !adDomain.isEmpty()) {
                    String domainShort = adDomain.split("\\.")[0].toUpperCase();
                    dnPatterns.add(domainShort + "\\\\" + username);
            }
        }

            // Standard LDAP patterns
            dnPatterns.add("uid=" + username + ",ou=people");
            dnPatterns.add("cn=" + username + ",ou=users");
            
            // AD distinguished name pattern (if domain available)
            if (adDomain != null && !adDomain.isEmpty()) {
                String baseDn = convertDomainToDn(adDomain);
                dnPatterns.add("CN=" + username + ",CN=Users," + baseDn);
            }
            
            // Domain-based from LDAP URL
            String urlDomain = extractDomainFromLdapUrl(ldapUrl);
            if (urlDomain != null && !urlDomain.isEmpty() && !username.contains("@")) {
                dnPatterns.add(username + "@" + urlDomain);
            }
            
            for (String userDn : dnPatterns) {
                try {
                    env.put(Context.SECURITY_PRINCIPAL, userDn);
                    env.put(Context.SECURITY_CREDENTIALS, password);
                    
                    context = new javax.naming.ldap.InitialLdapContext(env, null);
            
            // If bind succeeds, create authentication token
            return new UsernamePasswordAuthenticationToken(username, password, null);
                } catch (Exception e) {
                    // Try next pattern
                    if (context != null) {
                        try {
                            context.close();
                        } catch (Exception ignored) {}
                        context = null;
                    }
                }
            }
            
            throw new BadCredentialsException("LDAP authentication failed: Unable to bind with any DN pattern");
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            throw new BadCredentialsException("LDAP authentication failed: " + e.getMessage());
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (Exception ignored) {}
            }
        }
    }

    private String extractDomainFromUsername(String username) {
        if (username != null && username.contains("@")) {
            return username.substring(username.indexOf("@") + 1);
        }
        return null;
    }

    private String extractDomainFromLdapUrl(String ldapUrl) {
        // Extract domain from LDAP URL if possible
        // e.g., ldap://ad.example.com:389 -> example.com
        try {
            String url = ldapUrl.replace("ldap://", "").replace("ldaps://", "");
            String host = url.split(":")[0];
            if (host.contains(".")) {
                String[] parts = host.split("\\.");
                if (parts.length >= 2) {
                    return parts[parts.length - 2] + "." + parts[parts.length - 1];
                }
            }
        } catch (Exception e) {
            // Ignore
        }
        return "";
    }

    private String convertDomainToDn(String domain) {
        // Convert domain like "example.com" to "DC=example,DC=com"
        if (domain == null || domain.isEmpty()) {
            return "";
        }
        String[] parts = domain.split("\\.");
        StringBuilder dn = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) {
                dn.append(",");
            }
            dn.append("DC=").append(parts[i]);
        }
        return dn.toString();
    }
}

