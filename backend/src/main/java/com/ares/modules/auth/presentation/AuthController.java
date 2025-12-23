package com.ares.modules.auth.presentation;

import com.ares.modules.auth.application.LoginUseCase;
import com.ares.modules.auth.application.TestConnectionUseCase;
import com.ares.modules.auth.presentation.dto.LoginRequest;
import com.ares.modules.auth.presentation.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Presentation layer - only handles HTTP concerns.
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final LoginUseCase loginUseCase;
    private final TestConnectionUseCase testConnectionUseCase;
    
    public AuthController(LoginUseCase loginUseCase, TestConnectionUseCase testConnectionUseCase) {
        this.loginUseCase = loginUseCase;
        this.testConnectionUseCase = testConnectionUseCase;
    }
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = loginUseCase.execute(
            request.getUsername(),
            request.getPassword(),
            request.getLdapUrl()
        );
        return ResponseEntity.ok(new LoginResponse(token, "Authentication successful"));
    }
    
    @PostMapping("/test-connection")
    public ResponseEntity<ConnectionTestResponse> testConnection(@Valid @RequestBody LoginRequest request) {
        boolean isConnected = testConnectionUseCase.execute(
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

