# ARES - Analytics, Reporting & Executions Status

A client-server web application built with Angular (frontend) and Spring Boot (backend), featuring Active Directory/LDAP authentication.

## Project Structure

```
ares/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ares/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── angular.json
│   └── package.json
└── README.md
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- Angular CLI 17+

## Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure LDAP/AD settings in `src/main/resources/application.yml`:
   ```yaml
   spring:
     ldap:
       urls: ldap://your-ad-server:389
       base: dc=yourdomain,dc=com
   ares:
     ldap:
       ad:
         domain: yourdomain.com
         url: ldap://your-ad-server:389
   ```

3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

## Frontend Setup (Angular)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:4200`

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

- `LDAP_URLS` - LDAP server URL
- `LDAP_BASE` - LDAP base DN
- `LDAP_USERNAME` - LDAP bind username (optional)
- `LDAP_PASSWORD` - LDAP bind password (optional)
- `AD_DOMAIN` - Active Directory domain
- `AD_URL` - Active Directory server URL
- `JWT_SECRET` - JWT signing secret (change in production!)

## Development

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security with LDAP
- JWT for token-based authentication

### Frontend
- Angular 17
- Reactive Forms
- Modern UI with CSS animations

## Next Steps

After successful authentication, you can extend the application with:
- Dashboard component
- API integration endpoints
- User management
- Role-based access control

