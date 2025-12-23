package com.natixis.ares.modules.shared.infrastructure.cache;

import com.natixis.ares.modules.shared.infrastructure.cache.CacheProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis implementation of CacheProvider.
 * All modules use this through the CacheProvider interface.
 */
@Component
public class RedisCacheProvider implements CacheProvider {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    
    public RedisCacheProvider(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> type) {
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                if (cached instanceof List) {
                    // Handle list deserialization
                    List<?> rawList = (List<?>) cached;
                    return objectMapper.convertValue(cached, type);
                }
                return objectMapper.convertValue(cached, type);
            }
        } catch (Exception e) {
            // Log error but continue without cache
            System.err.println("Error reading from Redis cache: " + e.getMessage());
        }
        return null;
    }
    
    @Override
    public void put(String key, Object value, long ttl, TimeUnit timeUnit) {
        try {
            redisTemplate.opsForValue().set(key, value, ttl, timeUnit);
        } catch (Exception e) {
            // Log error but continue without cache
            System.err.println("Error storing in Redis cache: " + e.getMessage());
        }
    }
    
    @Override
    public void delete(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("Error deleting from Redis cache: " + e.getMessage());
        }
    }
    
    @Override
    public void deletePattern(String pattern) {
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            System.err.println("Error deleting pattern from Redis cache: " + e.getMessage());
        }
    }
    
    @Override
    public boolean exists(String key) {
        try {
            Boolean result = redisTemplate.hasKey(key);
            return result != null && result;
        } catch (Exception e) {
            return false;
        }
    }
}

