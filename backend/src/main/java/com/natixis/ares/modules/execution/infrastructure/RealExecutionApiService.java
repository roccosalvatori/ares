package com.natixis.ares.modules.execution.infrastructure;

import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Base64;

/**
 * Service for calling the real external API.
 * Uses basic authentication to connect to the external API.
 */
@Component
public class RealExecutionApiService {
    
    private static final String BASE_URL = "http://slulfrnxcvh0190:8080";
    private static final String API_PATH = "/api/executions";
    private static final String USERNAME = "salvatoriro";
    private static final String PASSWORD = "Mcsuaptesbuf2112.";
    
    private final RestTemplate restTemplate;
    
    public RealExecutionApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Fetches executions from the real external API.
     * Uses basic authentication and the provided timestamp parameter.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS (optional)
     */
    public ApiExecutionResponse fetchExecutions(String startTimestamp) {
        String formattedTimestamp = formatTimestamp(startTimestamp);
        String url = BASE_URL + API_PATH + "?startTimestamp=" + formattedTimestamp;
        
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
    
    /**
     * Converts timestamp from format "YYYY-MM-DD HH:MM:SS" to ISO 8601 format with timezone "YYYY-MM-DDTHH:MM+02:00"
     * If timestamp is null or empty, uses current date at midnight in Europe/Paris timezone.
     */
    private String formatTimestamp(String startTimestamp) {
        LocalDateTime dateTime;
        
        if (startTimestamp != null && !startTimestamp.trim().isEmpty()) {
            try {
                // Parse "YYYY-MM-DD HH:MM:SS" format
                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                dateTime = LocalDateTime.parse(startTimestamp, inputFormatter);
            } catch (Exception e) {
                // If parsing fails, use current date at midnight
                dateTime = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
            }
        } else {
            // Use current date at midnight if no timestamp provided
            dateTime = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        }
        
        // Convert to Europe/Paris timezone (UTC+2)
        ZonedDateTime zonedDateTime = dateTime.atZone(ZoneId.of("Europe/Paris"));
        
        // Format as ISO 8601 with timezone offset
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mmXXX");
        return zonedDateTime.format(outputFormatter);
    }
}

