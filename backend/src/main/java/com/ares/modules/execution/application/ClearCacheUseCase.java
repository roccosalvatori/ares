package com.ares.modules.execution.application;

import com.ares.modules.execution.domain.ExecutionCache;
import org.springframework.stereotype.Service;

/**
 * Use case for clearing execution cache.
 */
@Service
public class ClearCacheUseCase {
    
    private final ExecutionCache cache;
    
    public ClearCacheUseCase(ExecutionCache cache) {
        this.cache = cache;
    }
    
    public void execute() {
        cache.clear();
    }
}

