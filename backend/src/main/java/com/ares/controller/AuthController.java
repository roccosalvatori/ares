package com.ares.controller;

import com.ares.dto.LoginRequest;
import com.ares.dto.LoginResponse;
import com.ares.service.LdapAuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final LdapAuthenticationService ldapAuthenticationService;

    public AuthController(LdapAuthenticationService ldapAuthenticationService) {
        this.ldapAuthenticationService = ldapAuthenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = ldapAuthenticationService.authenticate(
                request.getUsername(),
                request.getPassword(),
                request.getLdapUrl()
        );

        return ResponseEntity.ok(new LoginResponse(token, "Authentication successful"));
    }

    @PostMapping("/test-connection")
    public ResponseEntity<ConnectionTestResponse> testConnection(@Valid @RequestBody LoginRequest request) {
        boolean isConnected = ldapAuthenticationService.testConnection(
                request.getLdapUrl(),
                request.getUsername(),
                request.getPassword()
        );

        if (isConnected) {
            return ResponseEntity.ok(new ConnectionTestResponse(true, "Connection successful"));
        } else {
            return ResponseEntity.ok(new ConnectionTestResponse(false, "Connection failed"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    public record ConnectionTestResponse(boolean success, String message) {}
}

