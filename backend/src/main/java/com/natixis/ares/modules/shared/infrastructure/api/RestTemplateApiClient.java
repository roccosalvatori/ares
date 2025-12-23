package com.natixis.ares.modules.shared.infrastructure.api;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Default implementation of ApiClient using RestTemplate.
 * Can be extended with retry logic, circuit breaker, rate limiting, etc.
 */
@Component
public class RestTemplateApiClient implements ApiClient {
    
    private final RestTemplate restTemplate;
    
    public RestTemplateApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    @Override
    public <T> T get(String url, Class<T> responseType) {
        try {
            ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                responseType
            );
            return response.getBody();
        } catch (Exception e) {
            throw new ApiClientException("Failed to execute GET request to: " + url, e);
        }
    }
    
    @Override
    public <T> T post(String url, Object body, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            
            ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                responseType
            );
            return response.getBody();
        } catch (Exception e) {
            throw new ApiClientException("Failed to execute POST request to: " + url, e);
        }
    }
    
    @Override
    public <T> T put(String url, Object body, Class<T> responseType) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            
            ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.PUT,
                entity,
                responseType
            );
            return response.getBody();
        } catch (Exception e) {
            throw new ApiClientException("Failed to execute PUT request to: " + url, e);
        }
    }
    
    @Override
    public void delete(String url) {
        try {
            restTemplate.exchange(url, HttpMethod.DELETE, null, Void.class);
        } catch (Exception e) {
            throw new ApiClientException("Failed to execute DELETE request to: " + url, e);
        }
    }
    
    public static class ApiClientException extends RuntimeException {
        public ApiClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}

