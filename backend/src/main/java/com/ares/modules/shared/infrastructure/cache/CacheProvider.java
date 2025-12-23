package com.ares.modules.shared.infrastructure.cache;

import java.util.concurrent.TimeUnit;

/**
 * Interface for caching operations.
 * Modules should use this interface instead of directly accessing Redis.
 */
public interface CacheProvider {
    
    /**
     * Get value from cache
     */
    <T> T get(String key, Class<T> type);
    
    /**
     * Put value in cache with TTL
     */
    void put(String key, Object value, long ttl, TimeUnit timeUnit);
    
    /**
     * Delete value from cache
     */
    void delete(String key);
    
    /**
     * Delete all keys matching pattern
     */
    void deletePattern(String pattern);
    
    /**
     * Check if key exists
     */
    boolean exists(String key);
}

