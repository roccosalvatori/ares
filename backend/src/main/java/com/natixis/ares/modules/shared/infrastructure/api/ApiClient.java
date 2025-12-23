package com.natixis.ares.modules.shared.infrastructure.api;

/**
 * Interface for making external API calls.
 * All modules should use this interface instead of direct HTTP clients.
 */
public interface ApiClient {
    
    /**
     * Perform a GET request
     */
    <T> T get(String url, Class<T> responseType);
    
    /**
     * Perform a POST request
     */
    <T> T post(String url, Object body, Class<T> responseType);
    
    /**
     * Perform a PUT request
     */
    <T> T put(String url, Object body, Class<T> responseType);
    
    /**
     * Perform a DELETE request
     */
    void delete(String url);
}

