package com.natixis.ares.modules.execution.domain;

import java.util.List;
import java.util.Set;

/**
 * Port interface for execution caching.
 * Implementation will be in infrastructure layer.
 */
public interface ExecutionCache {
    List<Execution> get(int count);
    void put(int count, List<Execution> executions);
    
    /**
     * Gets all cached real API executions.
     * @return List of all cached executions
     */
    List<Execution> getAllRealApiExecutions();
    
    /**
     * Gets executions from cache filtered by date (executions on or after the startTimestamp).
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     * @return List of executions on or after the start timestamp
     */
    List<Execution> getRealApiExecutionsByDate(String startTimestamp);
    
    /**
     * Checks if a date has been loaded into the cache.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     * @return true if the date has been loaded, false otherwise
     */
    boolean isDateLoaded(String startTimestamp);
    
    /**
     * Marks a date as loaded in the cache.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     */
    void markDateAsLoaded(String startTimestamp);
    
    /**
     * Adds executions to the cache, avoiding duplicates based on tradeId.
     * Only adds executions that don't already exist in cache (by tradeId).
     * @param executions The executions to add to cache
     */
    void addRealApiExecutions(List<Execution> executions);
    
    /**
     * Gets all cached mock API executions.
     * @return List of all cached executions
     */
    List<Execution> getAllMockApiExecutions();
    
    /**
     * Gets executions from cache filtered by date (executions on or after the startTimestamp).
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     * @return List of executions on or after the start timestamp
     */
    List<Execution> getMockApiExecutionsByDate(String startTimestamp);
    
    /**
     * Checks if a date has been loaded into the cache for mock API.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     * @return true if the date has been loaded, false otherwise
     */
    boolean isMockApiDateLoaded(String startTimestamp);
    
    /**
     * Marks a date as loaded in the cache for mock API.
     * @param startTimestamp The start timestamp in format YYYY-MM-DD HH:MM:SS
     */
    void markMockApiDateAsLoaded(String startTimestamp);
    
    /**
     * Adds executions to the cache for mock API, avoiding duplicates based on tradeId.
     * Only adds executions that don't already exist in cache (by tradeId).
     * @param executions The executions to add to cache
     */
    void addMockApiExecutions(List<Execution> executions);
    
    void clear();
}

