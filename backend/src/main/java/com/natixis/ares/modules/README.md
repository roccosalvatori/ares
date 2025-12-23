# Modular Architecture

## Module Structure

Each module is self-contained and follows this structure:

```
module-name/
├── domain/           # Domain entities and interfaces (ports)
├── application/       # Use cases (application logic)
├── infrastructure/    # Adapters (implementations)
└── presentation/      # REST controllers and DTOs
```

## Module Isolation Rules

1. **No Direct Dependencies**: Modules cannot directly import from other modules
2. **Communication via Interfaces**: Use shared interfaces/events
3. **Shared Kernel**: Common code goes in `shared/` module
4. **Event-Driven**: Modules communicate via events when needed

## Adding a New Module

1. Create module directory: `modules/new-module/`
2. Follow the structure above
3. Register module in `AresApplication.java` (component scan)
4. Add module-specific configuration if needed
5. No changes needed to existing modules!

## Current Modules

- **auth**: Authentication and authorization
- **execution**: Test execution management and caching
- **datasource**: Datasource connectivity checks
- **shared**: Common utilities, events, interfaces

