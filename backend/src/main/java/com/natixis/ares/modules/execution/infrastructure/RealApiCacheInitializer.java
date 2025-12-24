package com.natixis.ares.modules.execution.infrastructure;

import com.natixis.ares.modules.execution.application.FetchApiExecutionsUseCase;
import com.natixis.ares.modules.execution.application.FetchRealApiExecutionsUseCase;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Initializes both real API and mock API caches with today's date on application startup.
 */
@Component
public class RealApiCacheInitializer implements ApplicationListener<ApplicationReadyEvent> {
    
    private final FetchRealApiExecutionsUseCase fetchRealApiExecutionsUseCase;
    private final FetchApiExecutionsUseCase fetchApiExecutionsUseCase;
    
    public RealApiCacheInitializer(
            FetchRealApiExecutionsUseCase fetchRealApiExecutionsUseCase,
            FetchApiExecutionsUseCase fetchApiExecutionsUseCase) {
        this.fetchRealApiExecutionsUseCase = fetchRealApiExecutionsUseCase;
        this.fetchApiExecutionsUseCase = fetchApiExecutionsUseCase;
    }
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        // Initialize both caches with today's date on application startup
        fetchRealApiExecutionsUseCase.initializeCache();
        fetchApiExecutionsUseCase.initializeCache();
    }
}

