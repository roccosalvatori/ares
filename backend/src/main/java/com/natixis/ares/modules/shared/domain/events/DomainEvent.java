package com.natixis.ares.modules.shared.domain.events;

import java.time.Instant;

/**
 * Base interface for domain events.
 * Modules can publish and subscribe to events for loose coupling.
 */
public interface DomainEvent {
    Instant getOccurredOn();
    String getEventType();
}

