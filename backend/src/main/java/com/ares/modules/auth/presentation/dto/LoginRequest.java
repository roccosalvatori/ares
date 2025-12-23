package com.ares.modules.auth.presentation.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for login request.
 */
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    private String ldapUrl;

    public LoginRequest() {
    }

    public LoginRequest(String username, String password, String ldapUrl) {
        this.username = username;
        this.password = password;
        this.ldapUrl = ldapUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLdapUrl() {
        return ldapUrl;
    }

    public void setLdapUrl(String ldapUrl) {
        this.ldapUrl = ldapUrl;
    }
}

