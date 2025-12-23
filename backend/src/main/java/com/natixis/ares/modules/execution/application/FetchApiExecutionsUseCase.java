package com.natixis.ares.modules.execution.application;

import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.domain.ExecutionCache;
import com.natixis.ares.modules.execution.infrastructure.MockExecutionApiService;
import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import com.natixis.ares.modules.execution.presentation.mapper.ApiExecutionMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Use case for fetching executions from external API and caching them.
 * This orchestrates the workflow: fetch from API -> map to domain -> cache -> return.
 */
@Service
public class FetchApiExecutionsUseCase {
    
    // Use a special count value (-1) to represent API executions in cache
    private static final int API_EXECUTIONS_CACHE_COUNT = -1;
    
    private final MockExecutionApiService apiService;
    private final ApiExecutionMapper mapper;
    private final ExecutionCache cache;
    
    public FetchApiExecutionsUseCase(
            MockExecutionApiService apiService,
            ApiExecutionMapper mapper,
            ExecutionCache cache) {
        this.apiService = apiService;
        this.mapper = mapper;
        this.cache = cache;
    }
    
    /**
     * Fetches executions from external API, maps them to domain model,
     * stores them in cache, and returns them.
     */
    public List<Execution> execute() {
        // Always fetch fresh from API and update cache
        // This ensures side values are always converted correctly
        ApiExecutionResponse apiResponse = apiService.fetchExecutions();
        
        // Map API response to domain model
        List<Execution> executions = apiResponse.getExecutions().stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
        
        // Cache the results using the special count value
        if (!executions.isEmpty()) {
            cache.put(API_EXECUTIONS_CACHE_COUNT, executions);
        }
        
        return executions;
    }
}

