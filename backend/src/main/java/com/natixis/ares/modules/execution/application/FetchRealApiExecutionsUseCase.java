package com.natixis.ares.modules.execution.application;

import com.natixis.ares.modules.execution.domain.Execution;
import com.natixis.ares.modules.execution.domain.ExecutionCache;
import com.natixis.ares.modules.execution.infrastructure.RealExecutionApiService;
import com.natixis.ares.modules.execution.presentation.dto.ApiExecutionResponse;
import com.natixis.ares.modules.execution.presentation.mapper.ApiExecutionMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Use case for fetching executions from real external API and caching them.
 * This orchestrates the workflow: fetch from real API -> map to domain -> cache -> return.
 */
@Service
public class FetchRealApiExecutionsUseCase {
    
    // Use a special count value (-2) to represent real API executions in cache
    private static final int REAL_API_EXECUTIONS_CACHE_COUNT = -2;
    
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
     * stores them in cache, and returns them.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS (optional)
     */
    public List<Execution> execute(String startTimestamp) {
        // Always fetch fresh from real API and update cache
        ApiExecutionResponse apiResponse = apiService.fetchExecutions(startTimestamp);
        
        // Map API response to domain model
        List<Execution> executions = apiResponse.getExecutions().stream()
            .map(mapper::toDomain)
            .collect(Collectors.toList());
        
        // Cache the results using the special count value
        if (!executions.isEmpty()) {
            cache.put(REAL_API_EXECUTIONS_CACHE_COUNT, executions);
        }
        
        return executions;
    }
}

