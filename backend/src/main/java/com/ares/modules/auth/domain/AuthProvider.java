package com.ares.modules.auth.domain;

/**
 * Port interface for authentication providers.
 * Implementation will be in infrastructure layer (LDAP adapter).
 */
public interface AuthProvider {
    String authenticate(String username, String password, String ldapUrl);
    boolean testConnection(String ldapUrl, String username, String password);
}

