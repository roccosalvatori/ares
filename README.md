# ARES - Analytics, Reporting & Executions Status

A client-server web application built with Angular (frontend) and Spring Boot (backend), featuring Active Directory/LDAP authentication.

## Project Structure

```
ares/
├── backend/
│   ├── src/main/java/com/natixis/ares/
│   │   ├── modules/              # Modular monolith structure
│   │   │   ├── auth/            # Authentication module
│   │   │   ├── execution/       # Execution module
│   │   │   ├── datasource/      # Datasource module
│   │   │   └── shared/          # Shared infrastructure
│   │   ├── config/              # Spring configuration
│   │   └── AresApplication.java # Main application class
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── src/app/
│   ├── angular.json
│   └── package.json
├── k8s/                         # Kubernetes manifests
├── docker-compose.yml          # Local development setup
├── start.sh                    # Local development script
└── README.md
```

## Quick Start

**🚀 Fastest way to run (Docker Compose):**

```bash
docker compose up -d
```

Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/api/health

**🚀 Alternative: Use start.sh script (requires Redis):**

```bash
./start.sh
```

This will start both backend and frontend locally (requires Redis running).

**📖 For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## Prerequisites

### For Docker Compose (Recommended)
- Docker 20.10+ and Docker Compose 2.0+

### For Local Development
- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- Angular CLI 17+
- Redis (required - can use Docker: `docker run -d -p 6379:6379 redis:7-alpine`)

## Architecture

The application follows a **Modular Monolith** architecture and is containerized for cloud deployment:

- **Backend**: Spring Boot application with modular architecture (auth, execution, datasource modules)
- **Frontend**: Angular SPA served by Nginx in Docker container  
- **Cache**: Redis for distributed caching (externalized from in-memory)
- **Modular Structure**: Clean Architecture with domain, application, infrastructure, and presentation layers

### Module Structure

- **auth**: Authentication and LDAP integration
- **execution**: Execution data management with Redis caching
- **datasource**: Datasource connectivity and health checks
- **shared**: Common infrastructure (API clients, cache providers, security)

See [DEPLOYMENT.md](DEPLOYMENT.md) and [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.

## Setup Options

### Option 1: Docker Compose (Recommended)
See [DEPLOYMENT.md](DEPLOYMENT.md#option-1-docker-compose-recommended) for detailed steps.

### Option 2: Local Development
See [DEPLOYMENT.md](DEPLOYMENT.md#option-2-local-development-without-docker) for step-by-step instructions.

### Option 3: Kubernetes
See [DEPLOYMENT.md](DEPLOYMENT.md#option-3-kubernetes-deployment) or [k8s/README.md](k8s/README.md) for Kubernetes deployment.

## Features

### Authentication Screen
- LDAP connection string input
- Username and password fields
- Connection test functionality
- AD/LDAP group-based authorization
- JWT token-based authentication

### Backend Endpoints

- `POST /api/auth/login` - Authenticate user and receive JWT token
- `POST /api/auth/test-connection` - Test LDAP connection
- `GET /api/auth/health` - Health check endpoint

## Configuration

### Environment Variables

You can configure the application using environment variables:

**Backend:**
- `REDIS_HOST` - Redis hostname (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password
- `LDAP_URLS` - LDAP server URL
- `LDAP_BASE` - LDAP base DN
- `LDAP_USERNAME` - LDAP bind username (optional)
- `LDAP_PASSWORD` - LDAP bind password (optional)
- `AD_DOMAIN` - Active Directory domain
- `AD_URL` - Active Directory server URL
- `JWT_SECRET` - JWT signing secret (minimum 256 bits, change in production!)
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional)

See [DEPLOYMENT.md](DEPLOYMENT.md#configuration-reference) for configuration examples.

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with LDAP
- JWT for token-based authentication
- Spring Data Redis for caching
- Maven for build management

### Frontend
- Angular 17
- Reactive Forms
- Modern UI with CSS animations
- Nginx for production serving

### Infrastructure
- Docker & Docker Compose
- Kubernetes manifests included
- Redis for distributed caching

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide: how to run, architecture, and deployment
- **[k8s/README.md](k8s/README.md)** - Kubernetes-specific deployment guide

## Features

### Authentication Screen
- LDAP connection string input
- Username and password fields
- Connection test functionality
- AD/LDAP group-based authorization
- JWT token-based authentication

### Backend Endpoints

- `POST /api/auth/login` - Authenticate user and receive JWT token
- `POST /api/auth/test-connection` - Test LDAP connection
- `GET /api/health` - Health check endpoint
- `GET /api/test-execution` - Get single test execution
- `GET /api/test-execution/list?count=N` - Get list of test executions (cached in Redis)
- `DELETE /api/test-execution/cache` - Clear execution cache

## Troubleshooting

See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) for common issues and solutions.

