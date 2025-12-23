package com.ares.modules.auth.application;

import com.ares.modules.auth.domain.AuthProvider;
import org.springframework.stereotype.Service;

/**
 * Use case for user login.
 * Application layer - orchestrates authentication flow.
 */
@Service
public class LoginUseCase {
    
    private final AuthProvider authProvider;
    
    public LoginUseCase(AuthProvider authProvider) {
        this.authProvider = authProvider;
    }
    
    public String execute(String username, String password, String ldapUrl) {
        return authProvider.authenticate(username, password, ldapUrl);
    }
}

