# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the ARES application.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured to access your cluster
- Docker images built and pushed to a container registry

## Deployment Steps

### 1. Build and Push Docker Images

```bash
# Build backend image
cd backend
docker build -t <your-registry>/ares-backend:latest .
docker push <your-registry>/ares-backend:latest

# Build frontend image
cd ../frontend
docker build -t <your-registry>/ares-frontend:latest .
docker push <your-registry>/ares-frontend:latest
```

### 2. Update Image References

Update the image references in:
- `backend-deployment.yaml` - change `ares-backend:latest` to your registry path
- `frontend-deployment.yaml` - change `ares-frontend:latest` to your registry path

### 3. Configure Secrets

**IMPORTANT**: Update `secrets.yaml` with your actual secrets before deploying:

```bash
# Edit secrets.yaml and replace placeholder values
# Use base64 encoding for sensitive data or kubectl create secret
kubectl create secret generic ares-secrets \
  --from-literal=redis-password='your-redis-password' \
  --from-literal=jwt-secret='your-jwt-secret-minimum-256-bits' \
  --from-literal=ldap-username='your-ldap-username' \
  --from-literal=ldap-password='your-ldap-password' \
  --namespace=ares \
  --dry-run=client -o yaml > secrets.yaml
```

### 4. Update ConfigMap

Edit `configmap.yaml` with your LDAP configuration values.

### 5. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create secrets (update values first!)
kubectl apply -f secrets.yaml

# Create configmap
kubectl apply -f configmap.yaml

# Deploy Redis
kubectl apply -f redis-deployment.yaml

# Deploy backend
kubectl apply -f backend-deployment.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml

# Deploy ingress (optional, requires ingress controller)
kubectl apply -f ingress.yaml
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -n ares

# Check services
kubectl get svc -n ares

# Check logs
kubectl logs -f deployment/ares-backend -n ares
kubectl logs -f deployment/ares-frontend -n ares
kubectl logs -f deployment/redis -n ares
```

## Configuration

### Environment Variables

The backend uses the following environment variables (configured via ConfigMap and Secrets):

- `REDIS_HOST` - Redis hostname (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (from secret)
- `JWT_SECRET` - JWT signing secret (from secret)
- `LDAP_URLS` - LDAP server URLs (from configmap)
- `LDAP_BASE` - LDAP base DN (from configmap)
- `LDAP_USERNAME` - LDAP username (from secret)
- `LDAP_PASSWORD` - LDAP password (from secret)
- `AD_DOMAIN` - Active Directory domain (from configmap)
- `AD_URL` - Active Directory URL (from configmap)
- `CORS_ALLOWED_ORIGINS` - Comma-separated list of allowed origins (optional)

### Scaling

To scale the application:

```bash
# Scale backend
kubectl scale deployment ares-backend --replicas=3 -n ares

# Scale frontend
kubectl scale deployment ares-frontend --replicas=3 -n ares
```

### Redis Persistence

Currently, Redis uses `emptyDir` for storage. For production, consider using:
- PersistentVolumeClaim (PVC) for persistent storage
- Redis Sentinel for high availability
- Redis Cluster for distributed caching

## Troubleshooting

### Check pod status
```bash
kubectl describe pod <pod-name> -n ares
```

### Check events
```bash
kubectl get events -n ares --sort-by='.lastTimestamp'
```

### Access Redis CLI
```bash
kubectl exec -it deployment/redis -n ares -- redis-cli -a <redis-password>
```

### Port forwarding for local testing
```bash
# Backend
kubectl port-forward svc/ares-backend 8080:8080 -n ares

# Frontend
kubectl port-forward svc/ares-frontend 80:80 -n ares

# Redis
kubectl port-forward svc/redis 6379:6379 -n ares
```

