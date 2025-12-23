package com.natixis.ares.modules.execution.infrastructure;

import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Service for calling the real external execution API.
 * Uses basic authentication to connect to the external API.
 */
@Component
public class RealExecutionApiService {
    
    private static final String BASE_URL = "http://slulfrnxcvh0190:8080";
    private static final String API_PATH = "/api/executions";
    private static final String USERNAME = "salvatoriro";
    private static final String PASSWORD = "Mcsuaptesbuf2112.";
    private static final String START_TIMESTAMP = "2025-12-23T00:00+02:00";
    
    private final RestTemplate restTemplate;
    
    public RealExecutionApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Fetches executions from the real external API.
     * Uses basic authentication and the configured timestamp parameter.
     */
    public ApiExecutionResponse fetchExecutions() {
        String url = BASE_URL + API_PATH + "?startTimestamp=" + START_TIMESTAMP;
        
        // Create basic auth header
        String auth = USERNAME + ":" + PASSWORD;
        byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
        String authHeader = "Basic " + new String(encodedAuth);
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        headers.set("Accept", "application/json");
        
        HttpEntity<?> entity = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<ApiExecutionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                ApiExecutionResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch executions from real API: " + url, e);
        }
    }
}

