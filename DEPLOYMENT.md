# ARES - Complete Deployment & Run Guide

This comprehensive guide covers everything you need to know: how to run the application, what changed, and why.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [How to Run](#how-to-run)
   - [Option 1: Docker Compose (Recommended)](#option-1-docker-compose-recommended)
   - [Option 2: Using start.sh Script](#option-2-using-startsh-script-local-development)
   - [Option 3: Local Development (Manual)](#option-3-local-development-without-docker)
   - [Option 4: Kubernetes Deployment](#option-4-kubernetes-deployment)
4. [Architecture & Changes](#architecture--changes)
5. [Configuration Reference](#configuration-reference)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Production Considerations](#production-considerations)

---

## Quick Start

**Fastest way to run:**

```bash
cd /Users/roccosalvatori/Documents/ARES
docker compose up -d
```

Wait ~1-2 minutes for builds, then access:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api/health

**Stop everything:**

```bash
docker compose down
```

---

## Prerequisites

### Required Software

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
  - Check installation: `docker --version` and `docker compose version`
  - Download: https://www.docker.com/get-started

- **Java 17** (only if running backend locally)
  - Check: `java -version`
  - Download: https://adoptium.net/

- **Node.js 18+** and **npm** (only if running frontend locally)
  - Check: `node --version` and `npm --version`
  - Download: https://nodejs.org/

- **Maven 3.9+** (only if building backend locally)
  - Check: `mvn --version`
  - Download: https://maven.apache.org/download.cgi

### Optional (for Kubernetes)
- **kubectl** (Kubernetes CLI)
- **minikube** or access to a Kubernetes cluster

---

## How to Run

### Option 1: Docker Compose (Recommended)

This is the **easiest and recommended** way to run the entire application.

#### Step 1: Navigate to Project Directory

```bash
cd /Users/roccosalvatori/Documents/ARES
```

#### Step 2: Create Environment File (Optional)

Create a `.env` file in the project root to customize configuration:

```bash
cat > .env << EOF
# Redis Configuration
REDIS_PASSWORD=my-secure-redis-password-123

# JWT Configuration
JWT_SECRET=my-super-secret-jwt-key-minimum-256-bits-required-for-production-use

# LDAP Configuration (optional - defaults provided)
LDAP_URLS=ldap://your-ldap-server:389
LDAP_BASE=dc=example,dc=com
LDAP_USERNAME=your-ldap-username
LDAP_PASSWORD=your-ldap-password
AD_DOMAIN=example.com
AD_URL=ldap://ad.example.com:389
EOF
```

**Note**: If you don't create `.env`, Docker Compose will use default values from `docker-compose.yml`.

#### Step 3: Build and Start All Services

```bash
# Build images and start all containers
docker compose up -d

# Or with build flag (if you made code changes)
docker compose up -d --build
```

This will:
- Build the backend Docker image
- Build the frontend Docker image
- Pull the Redis image
- Start all three services
- Set up networking between containers

#### Step 4: Check Service Status

```bash
# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f redis
```

#### Step 5: Access the Application

Once all containers are running (check with `docker compose ps`):

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health

#### Step 6: Stop the Application

```bash
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove everything including volumes
docker compose down -v
```

#### Step 7: Rebuild After Code Changes

```bash
# Stop services
docker compose down

# Rebuild and start
docker compose up -d --build
```

---

### Option 2: Using start.sh Script (Docker Compose)

The `start.sh` script provides a convenient wrapper around Docker Compose to start all services.

#### Prerequisites

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- Docker daemon must be running

#### Run the Application

```bash
# Make script executable (first time only)
chmod +x start.sh

# Run the application
./start.sh
```

The script will:
- Check if Docker and Docker Compose are installed and running
- Build Docker images for backend and frontend (if needed)
- Start all containers (Redis, Backend, Frontend) using Docker Compose
- Display live logs from all services
- Show container status and service URLs
- Clean up containers when you press Ctrl+C

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/api/health

**Stop the application:**
- Press `Ctrl+C` in the terminal where `start.sh` is running
- The script will automatically run `docker compose down` to stop all containers

**Note**: This script uses Docker Compose, so it's equivalent to running `docker compose up -d --build` followed by `docker compose logs -f`, but with a nicer interface and automatic cleanup.

---

### Option 3: Local Development (Without Docker)

Run each component separately on your local machine.

#### Part A: Start Redis

**Option 2A.1: Using Docker (Easiest)**

```bash
docker run -d \
  --name ares-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes --requirepass change-me-redis-password
```

**Option 2A.2: Using Local Redis Installation**

```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

#### Part B: Start Backend

**Step 1: Navigate to Backend Directory**

```bash
cd backend
```

**Step 2: Set Environment Variables**

```bash
# macOS/Linux
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=change-me-redis-password
export JWT_SECRET=your-secret-key-change-in-production-min-256-bits
export LDAP_URLS=ldap://localhost:389
export LDAP_BASE=dc=example,dc=com
export LDAP_USERNAME=
export LDAP_PASSWORD=
export AD_DOMAIN=example.com
export AD_URL=ldap://ad.example.com:389

# Windows (PowerShell)
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:REDIS_PASSWORD="change-me-redis-password"
$env:JWT_SECRET="your-secret-key-change-in-production-min-256-bits"
```

**Step 3: Build and Run**

```bash
# Build the application
mvn clean package -DskipTests

# Run the application
java -jar target/ares-backend-1.0.0.jar

# Or run directly with Maven
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**

#### Part C: Start Frontend

**Step 1: Navigate to Frontend Directory**

```bash
cd frontend
```

**Step 2: Install Dependencies**

```bash
npm install
```

**Step 3: Start Development Server**

```bash
npm start
# or
ng serve
```

The frontend will start on **http://localhost:4200**

**Note**: The frontend is configured to connect to `http://localhost:8080/api` by default.

---

### Option 4: Kubernetes Deployment

For production-like deployment on Kubernetes.

#### Step 1: Build Docker Images

```bash
# Build backend
cd backend
docker build -t ares-backend:latest .
cd ..

# Build frontend
cd frontend
docker build -t ares-frontend:latest .
cd ..
```

#### Step 2: Push to Container Registry (if needed)

```bash
# Tag for your registry
docker tag ares-backend:latest your-registry/ares-backend:latest
docker tag ares-frontend:latest your-registry/ares-frontend:latest

# Push
docker push your-registry/ares-backend:latest
docker push your-registry/ares-frontend:latest
```

#### Step 3: Update Kubernetes Manifests

Edit `k8s/secrets.yaml` with your actual secrets:

```bash
# Generate base64 encoded secrets
echo -n 'your-redis-password' | base64
echo -n 'your-jwt-secret' | base64

# Update secrets.yaml with encoded values
```

Edit `k8s/configmap.yaml` with your LDAP configuration.

Update image references in:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`

#### Step 4: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl apply -f k8s/secrets.yaml

# Create configmap
kubectl apply -f k8s/configmap.yaml

# Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress (optional)
kubectl apply -f k8s/ingress.yaml
```

#### Step 5: Check Deployment Status

```bash
# Check pods
kubectl get pods -n ares

# Check services
kubectl get svc -n ares

# View logs
kubectl logs -f deployment/ares-backend -n ares
kubectl logs -f deployment/ares-frontend -n ares
```

#### Step 6: Access the Application

```bash
# Port forward to access locally
kubectl port-forward svc/ares-frontend 80:80 -n ares
kubectl port-forward svc/ares-backend 8080:8080 -n ares

# Or use ingress if configured
# Access via ingress hostname
```

See `k8s/README.md` for detailed Kubernetes instructions.

---

## Architecture & Changes

### Overview of Changes

The application has been refactored into a **Modular Monolith** architecture and containerized for cloud deployment with externalized caching using Redis.

### Modular Monolith Architecture

The backend follows a **Modular Monolith** pattern with Clean Architecture principles:

#### Module Structure

```
backend/src/main/java/com/natixis/ares/modules/
├── auth/                    # Authentication module
│   ├── domain/             # Auth domain logic (AuthProvider interface)
│   ├── application/        # Use cases (LoginUseCase, TestConnectionUseCase)
│   ├── infrastructure/     # LDAP adapter (LdapAuthProvider)
│   └── presentation/       # REST controllers & DTOs (AuthController)
│
├── execution/               # Execution module
│   ├── domain/             # Execution entity, ExecutionCache interface, ExecutionGenerator
│   ├── application/        # Use cases (GetExecutionsUseCase, ClearCacheUseCase)
│   ├── infrastructure/     # Redis cache adapter (RedisExecutionCache)
│   └── presentation/       # REST controllers, DTOs, mappers
│
├── datasource/             # Datasource module
│   ├── application/        # Use cases (PingDatasourceUseCase)
│   └── presentation/       # REST controllers (DatasourceController)
│
└── shared/                 # Shared infrastructure
    ├── domain/             # Domain events (DomainEvent interface)
    ├── infrastructure/     # Shared adapters
    │   ├── api/            # API client (ApiClient, RestTemplateApiClient)
    │   ├── cache/          # Cache provider (CacheProvider, RedisCacheProvider)
    │   └── security/       # Security components (JWT, LDAP)
    └── presentation/       # Shared controllers (HealthController)
```

#### Benefits

- **Modularity**: Each module is self-contained and can evolve independently
- **Maintainability**: Clear separation of concerns (domain, application, infrastructure, presentation)
- **Scalability**: Modules can be extracted to microservices if needed
- **Testability**: Each layer can be tested independently
- **Team Organization**: Teams can own specific modules

#### Module Isolation Rules

- ✅ **DO**: Use interfaces for module communication, use shared infrastructure, keep domain pure
- ❌ **DON'T**: Import directly from other modules, create cross-module dependencies, put framework code in domain layer

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

### Overview of Technical Changes

The application was containerized and adapted for cloud deployment with externalized caching using Redis.

### 1. Redis Integration for Caching

**Problem**: The application was using in-memory caching (`ConcurrentHashMap`) which doesn't work in a distributed/cloud environment where multiple instances share the same cache.

**Solution**: Replaced in-memory cache with Redis, an external distributed cache.

#### Changes Made:

1. **Added Redis Dependencies** (`backend/pom.xml`):
   - `spring-boot-starter-data-redis` - Spring Data Redis integration
   - `jackson-databind` - JSON serialization for Redis

2. **Created Redis Configuration** (`backend/src/main/java/com/natixis/ares/config/RedisConfig.java`):
   - Configures Redis connection using Lettuce client
   - Sets up RedisTemplate with proper JSON serialization
   - Supports password-protected Redis instances
   - Configurable via environment variables

3. **Refactored Execution Module** (`backend/src/main/java/com/natixis/ares/modules/execution/`):
   - Removed `ConcurrentHashMap` in-memory cache
   - Implemented modular architecture with domain, application, infrastructure, and presentation layers
   - Added Redis-based caching via `RedisExecutionCache` adapter
   - Cache keys follow pattern: `executions:count:{count}` with 24-hour TTL
   - Graceful fallback if Redis is unavailable (logs error but continues)
   - Use cases (`GetExecutionsUseCase`, `ClearCacheUseCase`) orchestrate business logic

4. **Updated Application Configuration** (`backend/src/main/resources/application.yml`):
   - Added Redis connection properties
   - Configurable via environment variables: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### 2. Docker Containerization

#### Backend Dockerfile (`backend/Dockerfile`):
- **Multi-stage build** for smaller final image
- Uses Maven for building, Eclipse Temurin JRE for runtime
- Non-root user for security
- Health check endpoint configured
- Exposes port 8080

#### Frontend Dockerfile (`frontend/Dockerfile`):
- **Multi-stage build** with Node.js for building, Nginx for serving
- Production-optimized Angular build
- Nginx configuration for SPA routing
- Health check endpoint
- Exposes port 80

#### Nginx Configuration (`frontend/nginx.conf`):
- SPA routing support (serves index.html for all routes)
- Gzip compression enabled
- Security headers configured
- Static asset caching (1 year)
- Health check endpoint at `/health`

### 3. Kubernetes Deployment

All Kubernetes manifests are in the `k8s/` directory:

#### Core Components:

1. **Namespace** (`namespace.yaml`):
   - Isolates ARES resources in dedicated namespace

2. **Redis Deployment** (`redis-deployment.yaml`):
   - Single Redis instance (can be scaled to cluster)
   - Persistent storage via emptyDir (upgrade to PVC for production)
   - Password-protected
   - Health checks configured

3. **Backend Deployment** (`backend-deployment.yaml`):
   - 2 replicas for high availability
   - Environment variables from ConfigMap and Secrets
   - Liveness and readiness probes
   - Resource limits configured
   - Connects to Redis service

4. **Frontend Deployment** (`frontend-deployment.yaml`):
   - 2 replicas for high availability
   - Health checks configured
   - Resource limits configured

5. **ConfigMap** (`configmap.yaml`):
   - Non-sensitive configuration (LDAP URLs, domains)
   - Easy to update without redeploying

6. **Secrets** (`secrets.yaml`):
   - Sensitive data (passwords, JWT secrets)
   - **MUST be updated before deployment**

7. **Ingress** (`ingress.yaml`):
   - Routes traffic to frontend and backend
   - Configured for nginx ingress controller
   - TLS support (commented out, uncomment and configure)

### 4. Docker Compose for Local Development

**File**: `docker-compose.yml`

Provides a complete local development environment:
- Redis service
- Backend service
- Frontend service
- Network isolation
- Volume persistence for Redis data

### 5. Additional Improvements

1. **Health Endpoint** (`backend/src/main/java/com/natixis/ares/modules/shared/presentation/HealthController.java`):
   - Dedicated health check endpoint at `/api/health`
   - Located in shared module for reuse across modules
   - Used by Kubernetes liveness/readiness probes

2. **CORS Configuration** (`backend/src/main/java/com/natixis/ares/config/SecurityConfig.java`):
   - Made configurable via `CORS_ALLOWED_ORIGINS` environment variable
   - Defaults to allow all origins for cloud deployment
   - Can be restricted in production

3. **Docker Ignore** (`.dockerignore`):
   - Excludes unnecessary files from Docker build context
   - Reduces build time and image size

### Architecture Benefits

#### Before (Monolithic with In-Memory Cache):
- ❌ Cache lost on restart
- ❌ No cache sharing between instances
- ❌ Not suitable for horizontal scaling
- ❌ Single point of failure

#### After (Containerized with Redis):
- ✅ Persistent cache survives restarts
- ✅ Shared cache across all instances
- ✅ Horizontal scaling ready
- ✅ High availability with multiple replicas
- ✅ Cloud-native architecture
- ✅ Easy to deploy and manage

---

## Configuration Reference

### Environment Variables

#### Backend:
- `REDIS_HOST` - Redis hostname (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password
- `JWT_SECRET` - JWT signing secret (min 256 bits)
- `LDAP_URLS` - LDAP server URLs
- `LDAP_BASE` - LDAP base DN
- `LDAP_USERNAME` - LDAP username
- `LDAP_PASSWORD` - LDAP password
- `AD_DOMAIN` - Active Directory domain
- `AD_URL` - Active Directory URL
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins (optional)

#### Frontend:
- Configured via build-time environment variables if needed
- API URL configured in Angular service (update for production)

---

## Verification & Testing

### 1. Check Health Endpoints

```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend health (if running in Docker)
curl http://localhost/health
```

Expected response: `{"status":"UP"}`

### 2. Test Backend API

```bash
# Get test execution
curl http://localhost:8080/api/test-execution

# Get list of executions
curl http://localhost:8080/api/test-execution/list?count=10
```

### 3. Test Redis Connection

```bash
# If using Docker Compose
docker compose exec redis redis-cli -a change-me-redis-password ping

# Should return: PONG
```

### 4. Access Frontend

Open your browser and navigate to:
- **Docker Compose**: http://localhost
- **Local Development**: http://localhost:4200

You should see the ARES application interface.

---

## Troubleshooting

### Problem: Containers won't start

**Solution**:
```bash
# Check logs
docker compose logs

# Check if ports are already in use
lsof -i :80
lsof -i :8080
lsof -i :6379

# Stop conflicting services or change ports in docker-compose.yml
```

### Problem: Backend can't connect to Redis

**Solution**:
```bash
# Check Redis is running
docker compose ps redis

# Check Redis logs
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli -a change-me-redis-password ping

# Verify environment variables
docker compose exec backend env | grep REDIS
```

### Problem: Frontend can't connect to Backend

**Solution**:
```bash
# Check backend is running
docker compose ps backend

# Check backend logs
docker compose logs backend

# Test backend endpoint
curl http://localhost:8080/api/health

# Verify CORS configuration in SecurityConfig.java
```

### Problem: Build fails

**Solution**:
```bash
# Clean Docker cache
docker compose down -v
docker system prune -a

# Rebuild without cache
docker compose build --no-cache

# Check for syntax errors
docker compose config
```

### Problem: Port already in use

**Solution**: Edit `docker-compose.yml` to use different ports:

```yaml
ports:
  - "8081:8080"  # Change host port
```

### Problem: Out of memory

**Solution**:
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or reduce resource limits in docker-compose.yml
```

### Problem: Frontend shows blank page

**Solution**:
```bash
# Check browser console for errors
# Verify API URL in frontend services
# Check CORS configuration
# Verify backend is accessible
```

### Problem: Cache not working

**Solution**:
```bash
# Check Redis connection
docker compose exec redis redis-cli -a change-me-redis-password

# Check keys
KEYS *

# Check backend logs for Redis errors
docker compose logs backend | grep -i redis
```

### Problem: Redis Connection Issues (Kubernetes)

**Solution**:
```bash
# Check Redis logs
kubectl logs deployment/redis -n ares

# Test Redis connection
kubectl exec -it deployment/redis -n ares -- redis-cli -a <password> ping
```

### Problem: Backend Issues (Kubernetes)

**Solution**:
```bash
# Check backend logs
kubectl logs deployment/ares-backend -n ares

# Check if Redis is accessible
kubectl exec -it deployment/ares-backend -n ares -- wget -O- http://redis:6379
```

### Common Commands Reference

```bash
# View all running containers
docker compose ps

# View logs (last 100 lines)
docker compose logs --tail=100

# Restart a specific service
docker compose restart backend

# Execute command in container
docker compose exec backend sh
docker compose exec redis redis-cli -a change-me-redis-password

# Remove everything and start fresh
docker compose down -v
docker compose up -d --build

# Check resource usage
docker stats
```

---

## Production Considerations

### 1. Redis
- Use Redis Sentinel or Cluster for high availability
- Use PersistentVolumeClaim for data persistence
- Configure memory limits and eviction policies
- Enable Redis AUTH (password protection)

### 2. Secrets Management
- Use Kubernetes Secrets or external secret management (Vault, AWS Secrets Manager)
- Rotate secrets regularly
- Never commit secrets to version control

### 3. Monitoring
- Add Prometheus metrics
- Configure logging aggregation (ELK, Loki)
- Set up alerts for Redis and application health

### 4. Security
- Enable TLS for Redis connections
- Use TLS certificates for ingress
- Implement network policies
- Regular security scanning of images

### 5. Scaling
- Use HorizontalPodAutoscaler for automatic scaling
- Configure resource requests/limits appropriately
- Consider Redis Cluster for high-throughput scenarios

### Migration Notes

When migrating from the old in-memory cache:
1. Existing cached data will be lost (expected)
2. First request after deployment will regenerate cache
3. Cache will be shared across all backend instances
4. Cache TTL is 24 hours (configurable in ExecutionController)

---

## Support

If you encounter issues:
1. Check logs: `docker compose logs` or `kubectl logs -n ares`
2. Verify prerequisites are installed
3. Check port availability
4. Review this troubleshooting section
5. Check `k8s/README.md` for Kubernetes-specific issues
