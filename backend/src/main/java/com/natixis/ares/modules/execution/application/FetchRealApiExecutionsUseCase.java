package com.natixis.ares.modules.execution.application;

import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.domain.ExecutionCache;
import com.natixis.ares.modules.execution.infrastructure.RealExecutionApiService;
import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import com.natixis.ares.modules.execution.presentation.mapper.ApiExecutionMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Use case for fetching executions from real external API and caching them.
 * This orchestrates the workflow: check cache -> if miss, fetch from real API -> map to domain -> cache -> return.
 */
@Service
public class FetchRealApiExecutionsUseCase {
    
    private final RealExecutionApiService apiService;
    private final ApiExecutionMapper mapper;
    private final ExecutionCache cache;
    
    public FetchRealApiExecutionsUseCase(
            RealExecutionApiService apiService,
            ApiExecutionMapper mapper,
            ExecutionCache cache) {
        this.apiService = apiService;
        this.mapper = mapper;
        this.cache = cache;
    }
    
    /**
     * Fetches executions from real external API, maps them to domain model,
     * adds them to cache (avoiding duplicates by tradeId), and returns them.
     * First checks if the date has been loaded - if yes, returns filtered cached data.
     * If not loaded, fetches from external API and merges into cache.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS (optional)
     */
    public List<Execution> execute(String startTimestamp) {
        if (startTimestamp == null || startTimestamp.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        // Check if this date has already been loaded
        if (cache.isDateLoaded(startTimestamp)) {
            // Date already loaded - return filtered executions from cache
            return cache.getRealApiExecutionsByDate(startTimestamp);
        }
        
        // Date not loaded - fetch from external API
        // The API returns executions FROM startTimestamp TO today
        ApiExecutionResponse apiResponse = apiService.fetchExecutions(startTimestamp);
        
        // Map API response to domain model
        List<Execution> executions = apiResponse.getExecutions().stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
        
        // Add executions to cache (will avoid duplicates by tradeId)
        if (!executions.isEmpty()) {
            cache.addRealApiExecutions(executions);
        }
        
        // Mark this date as loaded
        cache.markDateAsLoaded(startTimestamp);
        
        // Return executions filtered by the requested date
        return cache.getRealApiExecutionsByDate(startTimestamp);
    }
    
    /**
     * Initializes the cache with today's date executions.
     * Called on application startup.
     */
    public void initializeCache() {
        // Get today's date at midnight in format YYYY-MM-DD HH:MM:SS
        java.time.LocalDate today = java.time.LocalDate.now();
        String todayTimestamp = String.format("%04d-%02d-%02d 00:00:00", 
            today.getYear(), today.getMonthValue(), today.getDayOfMonth());
        
        // Check if today's date has already been loaded
        if (cache.isDateLoaded(todayTimestamp)) {
            // Already loaded - no need to fetch
            return;
        }
        
        // Fetch and cache today's executions
        try {
            execute(todayTimestamp);
        } catch (Exception e) {
            System.err.println("Failed to initialize cache with today's date: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

