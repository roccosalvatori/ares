package com.natixis.ares.modules.auth.application;

import com.natixis.ares.modules.auth.domain.AuthProvider;
import org.springframework.stereotype.Service;

/**
 * Use case for testing LDAP connection.
 */
@Service
public class TestConnectionUseCase {
    
    private final AuthProvider authProvider;
    
    public TestConnectionUseCase(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }
    
    public boolean execute(String ldapUrl, String username, String password) {
        return authProvider.testConnection(ldapUrl, username, password);
    }
}

