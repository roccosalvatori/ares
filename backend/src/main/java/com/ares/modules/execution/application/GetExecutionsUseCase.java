package com.ares.modules.execution.application;

import com.ares.modules.execution.domain.Execution;
import com.ares.modules.execution.domain.ExecutionCache;
import com.ares.modules.execution.domain.ExecutionGenerator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Use case for getting executions.
 * This is the application layer - orchestrates domain logic.
 */
@Service
public class GetExecutionsUseCase {
    
    private final ExecutionCache cache;
    private final ExecutionGenerator generator;
    
    public GetExecutionsUseCase(ExecutionCache cache, ExecutionGenerator generator) {
        this.cache = cache;
        this.generator = generator;
    }
    
    public List<Execution> execute(int count) {
        // Check cache first
        List<Execution> cached = cache.get(count);
        if (cached != null) {
            return new ArrayList<>(cached); // Return copy
        }
        
        // Generate new executions
        List<Execution> executions = generator.generate(count);
        
        // Cache the result
        cache.put(count, executions);
        
        return executions;
    }
}

