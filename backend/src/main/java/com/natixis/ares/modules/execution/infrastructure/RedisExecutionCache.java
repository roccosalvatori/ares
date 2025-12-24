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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.concurrent.TimeUnit;

/**
 * Redis implementation of ExecutionCache.
 * Uses shared CacheProvider interface - no direct Redis dependency.
 */
@Component
public class RedisExecutionCache implements ExecutionCache {
    
    private static final String CACHE_KEY_PREFIX = "executions:count:";
    private static final String REAL_API_CACHE_KEY = "executions:real-api:data";
    private static final String REAL_API_LOADED_DATES_KEY = "executions:real-api:loaded-dates";
    private static final String MOCK_API_CACHE_KEY = "executions:mock-api:data";
    private static final String MOCK_API_LOADED_DATES_KEY = "executions:mock-api:loaded-dates";
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
    public List<Execution> getAllRealApiExecutions() {
        Object cached = cacheProvider.get(REAL_API_CACHE_KEY, Object.class);
        
        if (cached != null) {
            try {
                return deserializeExecutions(cached);
            } catch (Exception e) {
                System.err.println("Error deserializing cached real API executions: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return new ArrayList<>();
    }
    
    @Override
    public List<Execution> getRealApiExecutionsByDate(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Execution> allExecutions = getAllRealApiExecutions();
        
        // Parse the start timestamp to compare with executionTime
        try {
            LocalDateTime startDateTime = LocalDateTime.parse(startTimestamp, DATE_TIME_FORMATTER);
            
            // Filter executions on or after the start timestamp
            return allExecutions.stream()
                .filter(execution -> {
                    LocalDateTime execTime = execution.getExecutionTime();
                    return execTime != null && !execTime.isBefore(startDateTime);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error parsing start timestamp: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    @Override
    public boolean isDateLoaded(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return false;
        }
        
        Set<String> loadedDates = getLoadedDates();
        return loadedDates.contains(startTimestamp);
    }
    
    @Override
    public void markDateAsLoaded(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return;
        }
        
        Set<String> loadedDates = getLoadedDates();
        loadedDates.add(startTimestamp);
        cacheProvider.put(REAL_API_LOADED_DATES_KEY, new ArrayList<>(loadedDates), CACHE_TTL_HOURS, TimeUnit.HOURS);
    }
    
    @Override
    public void addRealApiExecutions(List<Execution> executions) {
        if (executions == null || executions.isEmpty()) {
            return;
        }
        
        // Get existing executions
        List<Execution> existingExecutions = getAllRealApiExecutions();
        
        // Create a set of existing tradeIds for quick lookup
        Set<String> existingTradeIds = existingExecutions.stream()
            .map(Execution::getTradeId)
            .filter(tradeId -> tradeId != null && !tradeId.trim().isEmpty())
            .collect(Collectors.toSet());
        
        // Filter out duplicates based on tradeId
        List<Execution> newExecutions = executions.stream()
            .filter(execution -> {
                String tradeId = execution.getTradeId();
                return tradeId != null && !tradeId.trim().isEmpty() && !existingTradeIds.contains(tradeId);
            })
            .collect(Collectors.toList());
        
        // Merge new executions with existing ones
        existingExecutions.addAll(newExecutions);
        
        // Convert to CachedExecution and store
        List<CachedExecution> cachedExecutions = existingExecutions.stream()
            .map(CachedExecution::fromExecution)
            .collect(Collectors.toList());
        
        cacheProvider.put(REAL_API_CACHE_KEY, cachedExecutions, CACHE_TTL_HOURS, TimeUnit.HOURS);
    }
    
    private List<Execution> deserializeExecutions(Object cached) {
        List<Execution> executions = new ArrayList<>();
        if (cached instanceof List) {
            List<?> rawList = (List<?>) cached;
            for (Object item : rawList) {
                if (item instanceof CachedExecution) {
                    executions.add(((CachedExecution) item).toExecution());
                } else {
                    CachedExecution cachedExecution = objectMapper.convertValue(item, CachedExecution.class);
                    executions.add(cachedExecution.toExecution());
                }
            }
        } else {
            CachedExecution cachedExecution = objectMapper.convertValue(cached, CachedExecution.class);
            executions.add(cachedExecution.toExecution());
        }
        return executions;
    }
    
    private Set<String> getLoadedDates() {
        Object cached = cacheProvider.get(REAL_API_LOADED_DATES_KEY, Object.class);
        if (cached != null) {
            try {
                if (cached instanceof List) {
                    List<?> rawList = (List<?>) cached;
                    Set<String> dates = new HashSet<>();
                    for (Object item : rawList) {
                        if (item != null) {
                            dates.add(item.toString());
                        }
                    }
                    return dates;
                }
            } catch (Exception e) {
                System.err.println("Error deserializing loaded dates: " + e.getMessage());
            }
        }
        return new HashSet<>();
    }
    
    @Override
    public List<Execution> getAllMockApiExecutions() {
        Object cached = cacheProvider.get(MOCK_API_CACHE_KEY, Object.class);
        
        if (cached != null) {
            try {
                return deserializeExecutions(cached);
            } catch (Exception e) {
                System.err.println("Error deserializing cached mock API executions: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return new ArrayList<>();
    }
    
    @Override
    public List<Execution> getMockApiExecutionsByDate(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Execution> allExecutions = getAllMockApiExecutions();
        
        // Parse the start timestamp to compare with executionTime
        try {
            LocalDateTime startDateTime = LocalDateTime.parse(startTimestamp, DATE_TIME_FORMATTER);
            
            // Filter executions on or after the start timestamp
            return allExecutions.stream()
                .filter(execution -> {
                    LocalDateTime execTime = execution.getExecutionTime();
                    return execTime != null && !execTime.isBefore(startDateTime);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error parsing start timestamp: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    @Override
    public boolean isMockApiDateLoaded(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return false;
        }
        
        Set<String> loadedDates = getMockApiLoadedDates();
        return loadedDates.contains(startTimestamp);
    }
    
    @Override
    public void markMockApiDateAsLoaded(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return;
        }
        
        Set<String> loadedDates = getMockApiLoadedDates();
        loadedDates.add(startTimestamp);
        cacheProvider.put(MOCK_API_LOADED_DATES_KEY, new ArrayList<>(loadedDates), CACHE_TTL_HOURS, TimeUnit.HOURS);
    }
    
    @Override
    public void addMockApiExecutions(List<Execution> executions) {
        if (executions == null || executions.isEmpty()) {
            return;
        }
        
        // Get existing executions
        List<Execution> existingExecutions = getAllMockApiExecutions();
        
        // Create a set of existing tradeIds for quick lookup
        Set<String> existingTradeIds = existingExecutions.stream()
            .map(Execution::getTradeId)
            .filter(tradeId -> tradeId != null && !tradeId.trim().isEmpty())
            .collect(Collectors.toSet());
        
        // Filter out duplicates based on tradeId
        List<Execution> newExecutions = executions.stream()
            .filter(execution -> {
                String tradeId = execution.getTradeId();
                return tradeId != null && !tradeId.trim().isEmpty() && !existingTradeIds.contains(tradeId);
            })
            .collect(Collectors.toList());
        
        // Merge new executions with existing ones
        existingExecutions.addAll(newExecutions);
        
        // Convert to CachedExecution and store
        List<CachedExecution> cachedExecutions = existingExecutions.stream()
            .map(CachedExecution::fromExecution)
            .collect(Collectors.toList());
        
        cacheProvider.put(MOCK_API_CACHE_KEY, cachedExecutions, CACHE_TTL_HOURS, TimeUnit.HOURS);
    }
    
    private Set<String> getMockApiLoadedDates() {
        Object cached = cacheProvider.get(MOCK_API_LOADED_DATES_KEY, Object.class);
        if (cached != null) {
            try {
                if (cached instanceof List) {
                    List<?> rawList = (List<?>) cached;
                    Set<String> dates = new HashSet<>();
                    for (Object item : rawList) {
                        if (item != null) {
                            dates.add(item.toString());
                        }
                    }
                    return dates;
                }
            } catch (Exception e) {
                System.err.println("Error deserializing mock API loaded dates: " + e.getMessage());
            }
        }
        return new HashSet<>();
    }
    
    @Override
    public void clear() {
        cacheProvider.deletePattern(CACHE_KEY_PREFIX + "*");
        cacheProvider.delete(REAL_API_CACHE_KEY);
        cacheProvider.delete(REAL_API_LOADED_DATES_KEY);
        cacheProvider.delete(MOCK_API_CACHE_KEY);
        cacheProvider.delete(MOCK_API_LOADED_DATES_KEY);
    }
}

