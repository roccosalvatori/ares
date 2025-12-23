package com.natixis.ares.modules.execution.infrastructure;

import com.natixis.ares.modules.execution.domain.CachedExecution;
import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.domain.ExecutionCache;
import com.natixis.ares.modules.shared.infrastructure.cache.CacheProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.TimeUnit;

/**
 * Redis implementation of ExecutionCache.
 * Uses shared CacheProvider interface - no direct Redis dependency.
 */
@Component
public class RedisExecutionCache implements ExecutionCache {
    
    private static final String CACHE_KEY_PREFIX = "executions:count:";
    private static final long CACHE_TTL_HOURS = 24;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    private final CacheProvider cacheProvider;
    private final ObjectMapper objectMapper;
    
    public RedisExecutionCache(CacheProvider cacheProvider, ObjectMapper objectMapper) {
        this.cacheProvider = cacheProvider;
        // Create a copy of ObjectMapper with LocalDateTime support for deserialization
        // Configure to handle the date format used in the DTO
        JavaTimeModule timeModule = new JavaTimeModule();
        timeModule.addDeserializer(LocalDateTime.class, 
            new LocalDateTimeDeserializer(DATE_TIME_FORMATTER));
        this.objectMapper = objectMapper.copy().registerModule(timeModule);
    }
    
    @Override
    public List<Execution> get(int count) {
        String key = CACHE_KEY_PREFIX + count;
        Object cached = cacheProvider.get(key, Object.class);
        
        if (cached != null) {
            try {
                // Redis returns List<LinkedHashMap> when deserializing JSON
                // Convert to List<Execution> via CachedExecution
                List<Execution> executions = new ArrayList<>();
                if (cached instanceof List) {
                    List<?> rawList = (List<?>) cached;
                    for (Object item : rawList) {
                        if (item instanceof CachedExecution) {
                            executions.add(((CachedExecution) item).toExecution());
                        } else {
                            // Convert LinkedHashMap to CachedExecution, then to Execution
                            CachedExecution cachedExecution = objectMapper.convertValue(item, CachedExecution.class);
                            executions.add(cachedExecution.toExecution());
                        }
                    }
                } else {
                    // Single object case
                    CachedExecution cachedExecution = objectMapper.convertValue(cached, CachedExecution.class);
                    executions.add(cachedExecution.toExecution());
                }
                
                if (!executions.isEmpty()) {
                    return executions;
                }
            } catch (Exception e) {
                System.err.println("Error deserializing cached executions: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return null;
    }
    
    @Override
    public void put(int count, List<Execution> executions) {
        String key = CACHE_KEY_PREFIX + count;
        // Convert to CachedExecution to only store table fields
        List<CachedExecution> cachedExecutions = executions.stream()
            .map(CachedExecution::fromExecution)
            .collect(Collectors.toList());
        cacheProvider.put(key, cachedExecutions, CACHE_TTL_HOURS, TimeUnit.HOURS);
    }
    
    @Override
    public void clear() {
        cacheProvider.deletePattern(CACHE_KEY_PREFIX + "*");
    }
}

