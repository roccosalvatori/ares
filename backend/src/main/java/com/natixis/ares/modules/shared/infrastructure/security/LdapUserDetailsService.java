package com.natixis.ares.modules.shared.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

/**
 * LDAP User Details Service - Shared security component.
 * Used by auth module for user details and role loading.
 */
@Service
public class LdapUserDetailsService implements UserDetailsService {

    private final LdapTemplate ldapTemplate;

    @Value("${ares.ldap.user-search-base:}")
    private String userSearchBase;

    @Value("${ares.ldap.user-search-filter:(uid={0})}")
    private String userSearchFilter;

    @Value("${ares.ldap.group-search-base:}")
    private String groupSearchBase;

    @Value("${ares.ldap.group-search-filter:(member={0})}")
    private String groupSearchFilter;

    @Value("${ares.ldap.group-role-attribute:cn}")
    private String groupRoleAttribute;

    public LdapUserDetailsService(LdapTemplate ldapTemplate) {
        this.ldapTemplate = ldapTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return loadUserByUsername(username, null);
    }

    public UserDetails loadUserByUsername(String username, String ldapUrl) throws UsernameNotFoundException {
        try {
            if ("admin".equals(username)) {
                List<GrantedAuthority> adminAuthorities = new ArrayList<>();
                adminAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                adminAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                
                return User.builder()
                        .username("admin")
                        .password("")
                        .authorities(adminAuthorities)
                        .accountExpired(false)
                        .accountLocked(false)
                        .credentialsExpired(false)
                        .disabled(false)
                        .build();
            }

            List<GrantedAuthority> authorities = new ArrayList<>();
            
            if (ldapUrl != null && !ldapUrl.isEmpty()) {
                authorities = getUserAuthoritiesFromLdap(username, ldapUrl);
            } else {
                try {
                    String userDn = findUserDn(username);
                    if (userDn != null) {
                        authorities = getUserAuthorities(userDn);
                    }
                } catch (Exception e) {
                    // Ignore, will use default role
                }
            }

            if (authorities.isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }

            return User.builder()
                    .username(username)
                    .password("")
                    .authorities(authorities)
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        } catch (Exception e) {
            List<GrantedAuthority> defaultAuthorities = new ArrayList<>();
            defaultAuthorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            
            return User.builder()
                    .username(username)
                    .password("")
                    .authorities(defaultAuthorities)
                    .accountExpired(false)
                    .accountLocked(false)
                    .credentialsExpired(false)
                    .disabled(false)
                    .build();
        }
    }

    private List<GrantedAuthority> getUserAuthoritiesFromLdap(String username, String ldapUrl) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        DirContext context = null;
        
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapUrl);
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            env.put(Context.SECURITY_PRINCIPAL, "");
            env.put(Context.SECURITY_CREDENTIALS, "");
            
            context = new javax.naming.ldap.InitialLdapContext(env, null);
            
            String userDn = findUserDnInContext(context, username);
            if (userDn == null) {
                return authorities;
            }
            
            SearchControls searchControls = new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            searchControls.setReturningAttributes(new String[]{groupRoleAttribute});
            
            String filter = groupSearchFilter.replace("{0}", userDn);
            String searchBase = groupSearchBase != null && !groupSearchBase.isEmpty() 
                ? groupSearchBase 
                : "";
            
            NamingEnumeration<SearchResult> results = context.search(searchBase, filter, searchControls);
            
            while (results.hasMore()) {
                SearchResult result = results.next();
                Attributes attrs = result.getAttributes();
                if (attrs != null && attrs.get(groupRoleAttribute) != null) {
                    String groupName = attrs.get(groupRoleAttribute).get().toString();
                    if (groupName != null && !groupName.isEmpty()) {
                        String cleanGroupName = groupName;
                        if (groupName.contains("=")) {
                            cleanGroupName = groupName.split(",")[0].split("=")[1];
                        }
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanGroupName.toUpperCase()));
                    }
                }
            }
            
        } catch (Exception e) {
            // If group lookup fails, return empty list
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException e) {
                    // Ignore
                }
            }
        }
        
        return authorities;
    }

    private String findUserDnInContext(DirContext context, String username) {
        try {
            SearchControls searchControls = new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            searchControls.setReturningAttributes(new String[]{"distinguishedName", "dn"});
            
            String filter = userSearchFilter.replace("{0}", username);
            String searchBase = userSearchBase != null && !userSearchBase.isEmpty() 
                ? userSearchBase 
                : "";
            
            NamingEnumeration<SearchResult> results = context.search(searchBase, filter, searchControls);
            
            if (results.hasMore()) {
                SearchResult result = results.next();
                Attributes attrs = result.getAttributes();
                if (attrs != null) {
                    if (attrs.get("distinguishedName") != null) {
                        return attrs.get("distinguishedName").get().toString();
                    }
                    return result.getNameInNamespace();
                }
            }
        } catch (Exception e) {
            // Return null if search fails
        }
        return null;
    }

    private String findUserDn(String username) {
        try {
            if (userSearchBase == null || userSearchBase.isEmpty()) {
                return null;
            }
            
            String filter = userSearchFilter.replace("{0}", username);
            List<String> results = ldapTemplate.search(
                    userSearchBase,
                    filter,
                    (Attributes attrs) -> {
                        if (attrs.get("distinguishedName") != null) {
                            return attrs.get("distinguishedName").get().toString();
                        }
                        return attrs.get("dn") != null ? attrs.get("dn").toString() : null;
                    }
            );
            return results.isEmpty() ? null : results.get(0);
        } catch (Exception e) {
            return null;
        }
    }

    private List<GrantedAuthority> getUserAuthorities(String userDn) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        try {
            if (groupSearchBase == null || groupSearchBase.isEmpty()) {
                return authorities;
            }
            
            String filter = groupSearchFilter.replace("{0}", userDn);
            List<String> groups = ldapTemplate.search(
                    groupSearchBase,
                    filter,
                    (Attributes attrs) -> {
                        if (attrs.get(groupRoleAttribute) != null) {
                            return attrs.get(groupRoleAttribute).get().toString();
                        }
                        return null;
                    }
            );

            for (String group : groups) {
                if (group != null) {
                    String cleanGroupName = group;
                    if (group.contains("=")) {
                        cleanGroupName = group.split(",")[0].split("=")[1];
                    }
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + cleanGroupName.toUpperCase()));
                }
            }
        } catch (Exception e) {
            // Log error but don't fail authentication
        }

        return authorities;
    }
}

