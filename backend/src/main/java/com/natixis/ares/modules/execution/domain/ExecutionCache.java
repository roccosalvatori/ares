package com.natixis.ares.modules.execution.domain;

import java.util.List;

/**
 * Port interface for execution caching.
 * Implementation will be in infrastructure layer.
 */
public interface ExecutionCache {
    List<Execution> get(int count);
    void put(int count, List<Execution> executions);
    void clear();
}

