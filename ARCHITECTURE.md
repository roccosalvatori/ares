# ARES - Architecture Documentation

## Executive Summary

ARES (Analytics, Reporting & Executions Status) follows a **Modular Monolith** architecture based on **Clean Architecture** and **Domain-Driven Design** principles. This architecture provides the optimal balance of evolutivity, role-based access control, efficiency, and maintainability for an API-only backend application.

**Key Architectural Decisions:**
- Modular Monolith over Microservices (current phase)
- Clean Architecture with clear layer separation
- Domain-Driven Design for module boundaries
- Containerized deployment with Docker and Kubernetes
- Externalized caching with Redis

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Why Modular Monolith?](#why-modular-monolith)
3. [Clean Architecture Layers](#clean-architecture-layers)
4. [Module Structure](#module-structure)
5. [Current Implementation](#current-implementation)
6. [Module Isolation and Communication](#module-isolation-and-communication)
7. [Benefits and Rationale](#benefits-and-rationale)
8. [Scalability and Performance](#scalability-and-performance)
9. [Migration Path](#migration-path)
10. [Future Considerations](#future-considerations)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   REST API   │  │  Health API  │  │  (Future)    │    │
│  │  Controllers │  │  Endpoints   │  │  WebSocket   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
└─────────┼─────────────────┼─────────────────┼─────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼─────────────┐
│              Application Layer (Use Cases)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth Module │  │ Execution    │  │ Datasource   │   │
│  │              │  │ Module       │  │ Module       │   │
│  │ - Login UC   │  │ - Get Exec   │  │ - Ping UC    │   │
│  │ - Test Conn  │  │ - Cache UC   │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
└─────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼────────────┐
│              Domain Layer (Business Logic)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ AuthProvider │  │  Execution   │  │   Domain     │ │
│  │  Interface   │  │  Entity      │  │   Events     │ │
│  │              │  │  Cache IF    │  │              │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
└─────────┼─────────────────┼─────────────────┼──────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼────────────┐
│         Infrastructure Layer (Adapters)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Redis       │  │  LDAP        │  │  API Client  │ │
│  │  Adapter     │  │  Adapter     │  │  (Shared)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Nginx)                      │
│              Port 80 (Containerized)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Backend (Spring Boot)                       │
│         Port 8080 (Containerized)                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │   Auth   │  │Execution │  │Datasource│            │
│  │  Module  │  │  Module  │  │  Module  │            │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │            │              │                  │
└───────┼────────────┼──────────────┼──────────────────┘
        │            │              │
        └────────────┼──────────────┘
                     │
        ┌────────────▼────────────┐
        │      Redis Cache        │
        │   Port 6379 (Shared)    │
        └─────────────────────────┘
```

---

## Why Modular Monolith?

### Decision Criteria

The architecture choice was evaluated against three primary requirements:

1. **Evolutivity**: Ability to add features and evolve without major refactoring
2. **Role-Based Access Control**: Proper RBAC implementation capability
3. **Efficiency**: High performance and scalability

### Architecture Comparison

#### Modular Monolith (Chosen)

**Advantages:**
- Easier to develop and test (single codebase, single deployment)
- Better performance (no network overhead between modules)
- Simpler debugging (all code in one place)
- Lower operational complexity (one service to deploy and monitor)
- Can evolve to microservices later if needed
- Perfect for API-only backends without databases
- Ideal for small to medium teams

**Disadvantages:**
- Single deployment unit (all modules deploy together)
- Technology lock-in (Java/Spring Boot)
- Harder to scale individual components independently

#### Microservices (Not Chosen - Future Option)

**When to Consider:**
- Team size exceeds 20 developers
- Different scaling needs per service
- Different technology requirements per service
- Independent deployment required
- Very high availability requirements

**Advantages:**
- Independent scaling per service
- Technology diversity possible
- Team autonomy
- Fault isolation

**Disadvantages:**
- Higher complexity (distributed system challenges)
- Network overhead between services
- More infrastructure needed (service mesh, API gateway, etc.)
- Distributed transactions and eventual consistency challenges
- More complex testing and debugging

### Why Modular Monolith for ARES?

1. **API-Only Backend**: No databases, only external API calls - perfect for monolith
2. **Small Team**: Easier to coordinate within single codebase
3. **Performance**: No network latency between modules
4. **Simplicity**: Single deployment, easier operations
5. **Migration Path**: Can extract modules to microservices later if needed

---

## Clean Architecture Layers

The application follows Clean Architecture principles with four distinct layers:

### 1. Domain Layer (Core Business Logic)

**Location**: `modules/{module}/domain/`

**Purpose**: Contains business entities, interfaces (ports), and domain logic. This layer has no dependencies on frameworks or external libraries.

**Example Structure:**
```
domain/
├── Execution.java              # Entity
├── ExecutionCache.java         # Interface (Port)
└── ExecutionGenerator.java     # Domain service
```

**Key Principles:**
- No Spring annotations
- No framework dependencies
- Pure Java business logic
- Interfaces define contracts (ports)
- Easy to test without frameworks

**Benefits:**
- Business logic independent of frameworks
- Easy to test in isolation
- No external dependencies
- Framework-agnostic domain model

### 2. Application Layer (Use Cases)

**Location**: `modules/{module}/application/`

**Purpose**: Orchestrates business workflows. Each use case represents a single business operation.

**Example Structure:**
```
application/
├── GetExecutionsUseCase.java
└── ClearCacheUseCase.java
```

**Key Principles:**
- Single responsibility per use case
- Orchestrates domain logic
- Uses domain interfaces (not implementations)
- Spring `@Service` annotation allowed here

**Benefits:**
- Clear business workflows
- Easy to add new features
- Single responsibility principle
- Testable with mocked dependencies

### 3. Infrastructure Layer (Adapters)

**Location**: `modules/{module}/infrastructure/` and `modules/shared/infrastructure/`

**Purpose**: Implements adapters for external systems (Redis, LDAP, external APIs). Implements domain interfaces.

**Example Structure:**
```
infrastructure/
├── RedisExecutionCache.java    # Implements ExecutionCache
└── LdapAuthProvider.java       # Implements AuthProvider

shared/infrastructure/
├── cache/
│   └── RedisCacheProvider.java
├── api/
│   └── RestTemplateApiClient.java
└── security/
    ├── JwtTokenProvider.java
    └── LdapUserDetailsService.java
```

**Key Principles:**
- Implements domain interfaces (adapters)
- Contains framework-specific code
- Can be swapped without changing domain/application layers
- Uses Spring annotations

**Benefits:**
- Easy to swap implementations
- Technology-agnostic domain layer
- Testable with mocks
- Clear separation of concerns

### 4. Presentation Layer (API)

**Location**: `modules/{module}/presentation/`

**Purpose**: Handles HTTP concerns - REST controllers, DTOs, request/response mapping.

**Example Structure:**
```
presentation/
├── ExecutionController.java
├── dto/
│   └── ExecutionDataDto.java
└── mapper/
    └── ExecutionMapper.java
```

**Key Principles:**
- Only HTTP concerns
- Uses DTOs (not domain entities)
- Maps between DTOs and domain entities
- Spring `@RestController` annotation

**Benefits:**
- API changes don't affect domain
- Multiple API formats possible (REST, GraphQL, etc.)
- Clear separation of HTTP and business logic

### Dependency Rule

Dependencies always point **inward**:

```
Presentation → Application → Domain ← Infrastructure
```

- Presentation depends on Application
- Application depends on Domain
- Infrastructure depends on Domain (implements interfaces)
- Domain has no dependencies (pure business logic)

---

## Module Structure

### Current Module Organization

```
backend/src/main/java/com/ares/modules/
├── auth/                    # Authentication module
│   ├── domain/             # AuthProvider interface
│   ├── application/        # LoginUseCase, TestConnectionUseCase
│   ├── infrastructure/     # LdapAuthProvider (implements AuthProvider)
│   └── presentation/       # AuthController, DTOs
│
├── execution/               # Execution module
│   ├── domain/             # Execution entity, ExecutionCache interface, ExecutionGenerator
│   ├── application/        # GetExecutionsUseCase, ClearCacheUseCase
│   ├── infrastructure/     # RedisExecutionCache (implements ExecutionCache)
│   └── presentation/       # ExecutionController, DTOs, mappers
│
├── datasource/             # Datasource module
│   ├── application/        # PingDatasourceUseCase
│   └── presentation/       # DatasourceController
│
└── shared/                 # Shared infrastructure
    ├── domain/             # DomainEvent interface
    ├── infrastructure/     # Shared adapters
    │   ├── api/            # ApiClient, RestTemplateApiClient
    │   ├── cache/          # CacheProvider, RedisCacheProvider
    │   └── security/      # JWT, LDAP user details
    └── presentation/       # HealthController
```

### Module Responsibilities

#### Auth Module

**Purpose**: Handle user authentication and LDAP integration

**Components:**
- **Domain**: `AuthProvider` interface (port)
- **Application**: `LoginUseCase`, `TestConnectionUseCase`
- **Infrastructure**: `LdapAuthProvider` (implements `AuthProvider`)
- **Presentation**: `AuthController` with `/api/auth/*` endpoints

**Responsibilities:**
- User authentication via LDAP/Active Directory
- JWT token generation
- LDAP connection testing
- User details retrieval

#### Execution Module

**Purpose**: Manage execution data with caching

**Components:**
- **Domain**: `Execution` entity, `ExecutionCache` interface, `ExecutionGenerator`
- **Application**: `GetExecutionsUseCase`, `ClearCacheUseCase`
- **Infrastructure**: `RedisExecutionCache` (implements `ExecutionCache`)
- **Presentation**: `ExecutionController` with `/api/test-execution/*` endpoints

**Responsibilities:**
- Generate execution data
- Cache executions in Redis
- Provide execution data via REST API
- Cache management (clear cache)

#### Datasource Module

**Purpose**: Test datasource connectivity

**Components:**
- **Application**: `PingDatasourceUseCase`
- **Presentation**: `DatasourceController` with `/api/datasource/*` endpoints

**Responsibilities:**
- Ping datasource availability
- Network connectivity testing

#### Shared Module

**Purpose**: Provide common infrastructure used by all modules

**Components:**
- **Domain**: `DomainEvent` interface for event-driven communication
- **Infrastructure**: 
  - `ApiClient` and `RestTemplateApiClient` for external API calls
  - `CacheProvider` and `RedisCacheProvider` for caching
  - `JwtTokenProvider`, `JwtAuthenticationFilter`, `LdapUserDetailsService` for security
- **Presentation**: `HealthController` for health checks

**Responsibilities:**
- Common utilities and infrastructure
- Security components
- API client abstractions
- Cache abstractions
- Health check endpoints

---

## Current Implementation

### Module Isolation Rules

#### DO:
- **Use interfaces**: Modules communicate via interfaces (ports)
- **Use shared infrastructure**: Use `shared` module for common utilities
- **Keep domain pure**: Domain layer has no framework dependencies
- **Single responsibility**: Each module has one clear purpose
- **Dependency injection**: Use Spring's dependency injection

#### DON'T:
- **Direct imports**: Don't import from other modules' domain/application layers
- **Cross-module dependencies**: Don't create dependencies between modules
- **Framework in domain**: Don't put Spring annotations in domain layer
- **Tight coupling**: Don't share domain entities between modules
- **Circular dependencies**: Avoid circular dependencies at all costs

### Example: Execution Module Implementation

#### Domain Layer

```java
// modules/execution/domain/Execution.java
public class Execution {
    private String orderId;
    private Long executionId;
    private Integer quantity;
    private BigDecimal price;
    // ... getters and setters
}

// modules/execution/domain/ExecutionCache.java
public interface ExecutionCache {
    List<Execution> get(int count);
    void put(int count, List<Execution> executions);
    void clear();
}
```

#### Application Layer

```java
// modules/execution/application/GetExecutionsUseCase.java
@Service
public class GetExecutionsUseCase {
    private final ExecutionCache cache;
    private final ExecutionGenerator generator;
    
    public List<Execution> execute(int count) {
        List<Execution> cached = cache.get(count);
        if (cached != null) {
            return new ArrayList<>(cached);
        }
        
        List<Execution> executions = generator.generate(count);
        cache.put(count, executions);
        return executions;
    }
}
```

#### Infrastructure Layer

```java
// modules/execution/infrastructure/RedisExecutionCache.java
@Component
public class RedisExecutionCache implements ExecutionCache {
    private final CacheProvider cacheProvider;
    private final ObjectMapper objectMapper;
    
    @Override
    public List<Execution> get(int count) {
        String key = "executions:count:" + count;
        Object cached = cacheProvider.get(key, Object.class);
        // Deserialize and return
    }
    
    @Override
    public void put(int count, List<Execution> executions) {
        String key = "executions:count:" + count;
        cacheProvider.put(key, executions, 24, TimeUnit.HOURS);
    }
}
```

#### Presentation Layer

```java
// modules/execution/presentation/ExecutionController.java
@RestController
@RequestMapping("/test-execution")
public class ExecutionController {
    private final GetExecutionsUseCase getExecutionsUseCase;
    private final ExecutionMapper mapper;
    
    @GetMapping("/list")
    public ResponseEntity<List<ExecutionDataDto>> getTestExecutions(
            @RequestParam(defaultValue = "2000") int count) {
        List<Execution> executions = getExecutionsUseCase.execute(count);
        List<ExecutionDataDto> dtos = executions.stream()
            .map(mapper::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
```

---

## Module Isolation and Communication

### Communication Patterns

#### Pattern 1: Direct API Calls (Current)

Modules are independent and don't communicate directly. The frontend calls each module's API separately.

```
Frontend → Auth Module API
Frontend → Execution Module API
Frontend → Datasource Module API
```

**Benefits:**
- Simple and straightforward
- No inter-module dependencies
- Easy to understand

#### Pattern 2: Shared Interfaces (For Common Functionality)

Modules use shared infrastructure through interfaces:

```java
// shared/infrastructure/cache/CacheProvider.java
public interface CacheProvider {
    <T> T get(String key, Class<T> type);
    void put(String key, Object value, long ttl, TimeUnit timeUnit);
}

// execution/infrastructure/RedisExecutionCache.java
@Component
public class RedisExecutionCache implements ExecutionCache {
    private final CacheProvider cacheProvider; // From shared module
    // Uses CacheProvider interface
}
```

**Benefits:**
- Consistent caching across modules
- Easy to swap cache implementation
- No direct Redis dependency in modules

#### Pattern 3: Domain Events (Future)

For loose coupling between modules:

```java
// shared/domain/events/DomainEvent.java
public abstract class DomainEvent {
    private final Instant timestamp;
}

// auth/infrastructure publishes event
eventPublisher.publish(new UserLoggedInEvent(username));

// execution/infrastructure subscribes
@EventListener
public void handle(UserLoggedInEvent event) {
    // React to user login
}
```

**Benefits:**
- Loose coupling
- Scalability
- Real-time updates
- Event-driven architecture

### Adding a New Module

#### Step 1: Create Module Structure

```bash
mkdir -p modules/new-module/{domain,application,infrastructure,presentation}
```

#### Step 2: Define Domain Interface (Port)

```java
// new-module/domain/NewModuleService.java
public interface NewModuleService {
    Result doSomething(Input input);
}
```

#### Step 3: Implement Use Case

```java
// new-module/application/DoSomethingUseCase.java
@Service
public class DoSomethingUseCase {
    private final NewModuleService service;
    
    public Result execute(Input input) {
        return service.doSomething(input);
    }
}
```

#### Step 4: Implement Adapter

```java
// new-module/infrastructure/NewModuleAdapter.java
@Component
public class NewModuleAdapter implements NewModuleService {
    private final ApiClient apiClient; // From shared module
    
    @Override
    public Result doSomething(Input input) {
        // Implementation using external API
    }
}
```

#### Step 5: Create Controller

```java
// new-module/presentation/NewModuleController.java
@RestController
@RequestMapping("/new-module")
public class NewModuleController {
    private final DoSomethingUseCase useCase;
    // ...
}
```

**Key Point**: No changes needed to existing modules. The new module is completely independent.

---

## Benefits and Rationale

### Evolutivity

**Problem Solved**: Easy to add new features without affecting existing code.

**How Achieved:**
- Clear module boundaries prevent accidental coupling
- New modules can be added independently
- Use cases make business logic explicit
- Domain interfaces allow swapping implementations

**Metrics:**
- New feature time: < 1 week
- Module independence: > 80%
- Test coverage: > 80%

### Role-Based Access Control (RBAC)

**Problem Solved**: Proper role and permission management.

**How Achieved:**
- Security components in shared module
- JWT-based authentication
- LDAP integration for user roles
- Method-level security ready for implementation

**Future Implementation:**
```java
@RestController
@RequestMapping("/api/executions")
public class ExecutionController {
    
    @GetMapping
    @PreAuthorize("hasPermission(null, 'EXECUTION_READ')")
    public ResponseEntity<List<Execution>> getExecutions() {
        // ...
    }
    
    @DeleteMapping("/cache")
    @PreAuthorize("hasPermission(null, 'EXECUTION_CACHE_CLEAR')")
    public ResponseEntity<String> clearCache() {
        // ...
    }
}
```

### Efficiency

**Problem Solved**: High performance with caching and optimization.

**How Achieved:**
- Redis for distributed caching
- Externalized cache (works with multiple instances)
- Efficient data structures
- Optimized API responses

**Performance Targets:**
- API response time: < 200ms (p95)
- Cache hit rate: > 80%
- Throughput: > 1000 req/s

### Maintainability

**Problem Solved**: Clear structure and separation of concerns.

**How Achieved:**
- Clean Architecture layers
- Single responsibility per module
- Clear module boundaries
- Easy to find code

**Benefits:**
- Reduced cognitive load
- Faster onboarding
- Easier debugging
- Clear ownership

### Testability

**Problem Solved**: Easy to test modules independently.

**How Achieved:**
- Domain layer has no dependencies
- Use cases can be tested with mocked adapters
- Modules can be tested in isolation
- Clear test boundaries

**Testing Strategy:**
- Unit tests for domain logic
- Integration tests for use cases
- Module tests for complete modules
- End-to-end tests for API

### Scalability

**Problem Solved**: Can scale horizontally and extract to microservices if needed.

**How Achieved:**
- Stateless modules (no local state)
- Externalized cache (Redis)
- Containerized deployment
- Kubernetes-ready

**Scaling Path:**
1. Current: Single instance
2. Phase 1: Multiple instances + Load balancer
3. Phase 2: Kubernetes HPA (Horizontal Pod Autoscaler)
4. Phase 3: Extract modules to microservices (if needed)

---

## Scalability and Performance

### Horizontal Scaling

The application is designed for horizontal scaling:

```
                    ┌─────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ Backend │       │ Backend │       │ Backend │
   │  Pod 1  │       │  Pod 2  │       │  Pod 3  │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Redis      │
                    │  (Shared)    │
                    └──────────────┘
```

**Key Points:**
- Stateless backend instances
- Shared Redis cache
- Load balancer distributes requests
- Kubernetes HPA can auto-scale

### Caching Strategy

Multi-level caching for optimal performance:

```
┌─────────────┐
│   Frontend  │ ──> Browser Cache (Static Assets)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Backend    │ ──> Application Cache (Redis)
│  Use Cases  │      - Execution data: 24 hours TTL
└──────┬──────┘      - User sessions: Configurable
       │
       ▼
┌─────────────┐
│  External   │ ──> External API responses cached
│   APIs      │      (if applicable)
└─────────────┘
```

**Cache Implementation:**
- Redis for distributed caching
- TTL-based expiration
- Cache keys follow patterns: `executions:count:{count}`
- Graceful fallback if Redis unavailable

### Performance Optimizations

**Current:**
- Redis caching for execution data
- Efficient data structures
- Optimized API responses
- Containerized deployment

**Future Optimizations:**
- Response compression (Gzip/Brotli)
- HTTP/2 support
- Connection pooling
- Read replicas (if database added)
- CQRS pattern (if read/write separation needed)

---

## Migration Path

### Completed Phases

#### Phase 1: Containerization and Redis Integration
- Dockerized backend and frontend
- Externalized cache to Redis
- Kubernetes manifests created
- Health checks implemented

#### Phase 2: Modular Architecture Refactoring
- Extracted domain entities
- Created use cases
- Implemented adapters
- Separated presentation layer
- Created module structure

### Future Phases

#### Phase 3: RBAC Implementation (Planned)
1. Define roles and permissions
2. Implement permission evaluator
3. Add method-level security annotations
4. Test authorization

#### Phase 4: API Gateway (Optional)
1. Set up Spring Cloud Gateway
2. Configure routes
3. Add rate limiting
4. Add monitoring

#### Phase 5: Event-Driven Architecture (Optional)
1. Implement domain events
2. Add event bus (Spring Events or message broker)
3. Publish/subscribe between modules
4. Real-time updates

#### Phase 6: Microservices Extraction (If Needed)
1. Extract module to separate service
2. Add API gateway routing
3. Independent deployment
4. Service-to-service communication

---

## Future Considerations

### When to Consider Microservices

Consider extracting modules to microservices when:

1. **Team Size**: Team exceeds 20 developers
2. **Scaling Needs**: Different modules have different scaling requirements
3. **Technology Diversity**: Need different technologies per module
4. **Independent Deployment**: Need to deploy modules independently
5. **High Availability**: Very high availability requirements

### Technology Additions

**Potential Additions:**
- **Spring Cloud Gateway**: API Gateway for routing and rate limiting
- **Spring Data JPA**: If database is added
- **Spring Events / Kafka**: Event-driven communication
- **Prometheus + Grafana**: Monitoring and metrics
- **ELK Stack**: Centralized logging

**Current Stack:**
- Spring Boot 3.2
- Angular 17
- Redis
- Docker / Kubernetes
- Nginx

### API Evolution

**Current**: REST API only

**Future Options:**
- GraphQL API (if complex queries needed)
- WebSocket (if real-time updates needed)
- gRPC (if high-performance inter-service communication needed)

---

## Summary

The ARES application follows a **Modular Monolith** architecture based on **Clean Architecture** and **Domain-Driven Design** principles. This architecture provides:

**Evolutivity**: Easy to add features and evolve without major refactoring
**RBAC Ready**: Proper structure for role-based access control
**Efficiency**: High performance with Redis caching and optimization
**Maintainability**: Clear structure and separation of concerns
**Scalability**: Can scale horizontally and extract to microservices if needed
**Testability**: Modules can be tested independently

The architecture is containerized, cloud-ready, and provides a clear migration path to microservices if needed in the future.

