# Architecture Diagram - After Fix

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │   Frontend (4200)    │      │  Back-Office (4201)  │       │
│  │   Angular 21         │      │   Angular 21         │       │
│  │   - Home             │      │   - Dashboard        │       │
│  │   - Courses          │      │   - Subscriptions    │       │
│  │   - Profile          │      │   - Users            │       │
│  │   - Auth Modal       │      │   - Auth Modal       │       │
│  └──────────┬───────────┘      └──────────┬───────────┘       │
│             │                              │                   │
└─────────────┼──────────────────────────────┼───────────────────┘
              │                              │
              │         HTTP Requests        │
              │                              │
              └──────────────┬───────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      API GATEWAY (8888)                          │
│                    Spring Cloud Gateway                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CORS Configuration (allows localhost:*)                   │ │
│  │  - Allowed Origins: http://localhost:*                     │ │
│  │  - Allowed Methods: GET, POST, PUT, DELETE, OPTIONS        │ │
│  │  - Allowed Headers: *                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Routes:                                                   │ │
│  │  - /user-service/** → lb://USER-SERVICE                    │ │
│  │  - /abonnement-service/** → lb://ABONNEMENT-SERVICE        │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
┌─────────────▼──────────┐    ┌────────────▼─────────────┐
│  UserService (8085)    │    │ AbonnementService (8084) │
│  Spring Boot 3.2.0     │    │ Spring Boot 3.2.0        │
│  ┌──────────────────┐  │    │ ┌──────────────────────┐ │
│  │ AuthController   │  │    │ │ AbonnementRestAPI    │ │
│  │ UserController   │  │    │ │ - CRUD operations    │ │
│  │ KeycloakService  │  │    │ │ - Statistics         │ │
│  └──────────────────┘  │    │ └──────────────────────┘ │
└────────┬───────────────┘    └────────┬─────────────────┘
         │                              │
         │ Registers with              │ Registers with
         │                              │
         └──────────────┬───────────────┘
                        │
              ┌─────────▼──────────┐
              │  Eureka (8761)     │
              │  Service Discovery │
              │  - USER-SERVICE    │
              │  - ABONNEMENT-SVC  │
              └────────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────────┐
│   Browser    │
│ (localhost:  │
│  4200/4201)  │
└──────┬───────┘
       │ 1. Login (email + password)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend Auth Service                                   │
│  1. GET /user-by-email?email=xxx → Get username         │
│  2. POST to Keycloak with username + password           │
└──────┬───────────────────────────────────────────────────┘
       │ 2. POST /realms/wordly-realm/protocol/openid-connect/token
       │    Body: username, password, client_id, client_secret
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Keycloak (9090)                                         │
│  Database: H2 (embedded)                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Realm: wordly-realm                               │  │
│  │  Client: wordly-client                             │  │
│  │  Secret: v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy          │  │
│  │  Roles: TEACHER, STUDENT, ADMIN                    │  │
│  └────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────┘
       │ 3. Returns JWT token
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend Auth Service                                   │
│  - Saves token to localStorage                           │
│  - Decodes token to get role                             │
│  - Redirects based on role:                              │
│    * ADMIN → http://localhost:4201/dashboard             │
│    * TEACHER/STUDENT → http://localhost:4200             │
└──────────────────────────────────────────────────────────┘
```

## 🗄️ Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASES                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐      ┌──────────────────────┐   │
│  │  Keycloak H2 (9090)  │      │  MySQL (3307)        │   │
│  │  Embedded Database   │      │  XAMPP               │   │
│  │                      │      │                      │   │
│  │  Stores:             │      │  Databases:          │   │
│  │  - Users (auth)      │      │  - user_db           │   │
│  │  - Passwords         │      │  - abonnement_db     │   │
│  │  - Roles (minimal)   │      │                      │   │
│  │  - Sessions          │      │  Stores:             │   │
│  │  - Tokens            │      │  - User details      │   │
│  │                      │      │  - Subscriptions     │   │
│  │  Location:           │      │  - History           │   │
│  │  C:\keycloak-23.0.0\ │      │                      │   │
│  │  data\h2\            │      │                      │   │
│  └──────────────────────┘      └──────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow - User Registration

```
1. User fills registration form (Frontend)
   ↓
2. POST /api/auth/register → API Gateway (8888)
   ↓
3. Gateway routes to UserService (8085)
   ↓
4. UserService.createUser()
   ├─→ 5a. KeycloakService.createKeycloakUser()
   │   ├─→ Create user in Keycloak
   │   ├─→ Set password in Keycloak
   │   └─→ Assign role in Keycloak
   │   └─→ Returns keycloak_id
   │
   └─→ 5b. Save user to MySQL (user_db)
       ├─→ Store: username, email, role, nom, prenom, etc.
       ├─→ Store: keycloak_id (link to Keycloak)
       └─→ password field = NULL (stored only in Keycloak)
   ↓
6. Return UserDTO to Frontend
```

## 🔄 Data Flow - User Login

```
1. User enters email + password (Frontend)
   ↓
2. GET /api/auth/user-by-email?email=xxx → UserService
   ├─→ Query MySQL for username
   └─→ Return username
   ↓
3. POST to Keycloak with username + password
   ├─→ URL: http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
   ├─→ Body: username, password, client_id, client_secret
   └─→ Keycloak validates credentials
   ↓
4. Keycloak returns JWT token
   ├─→ Token contains: sub (keycloak_id), preferred_username, roles
   └─→ Frontend saves to localStorage
   ↓
5. GET /api/auth/me with Bearer token → UserService
   ├─→ UserService validates token with Keycloak
   ├─→ Extracts preferred_username from token
   ├─→ Query MySQL for user details
   └─→ Return complete UserDTO
   ↓
6. Frontend decodes token to get role
   ├─→ If ADMIN → redirect to http://localhost:4201/dashboard
   └─→ If TEACHER/STUDENT → stay on http://localhost:4200
```

## 🔑 Security Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: API Gateway (8888)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CORS Configuration                                   │  │
│  │  - Allows: http://localhost:*                         │  │
│  │  - Methods: GET, POST, PUT, DELETE, OPTIONS           │  │
│  │  - Headers: Authorization, Content-Type, etc.         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 2: UserService (8085)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Spring Security + OAuth2 Resource Server            │  │
│  │  - JWT validation via Keycloak                        │  │
│  │  - Public endpoints: /register, /user-by-email        │  │
│  │  - Protected endpoints: /me (requires Bearer token)   │  │
│  │  - CORS disabled (handled by Gateway)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Layer 3: Keycloak (9090)                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  OAuth2 / OpenID Connect                              │  │
│  │  - Issues JWT tokens                                  │  │
│  │  - Validates credentials                              │  │
│  │  - Manages sessions                                   │  │
│  │  - Role-based access control                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Configuration Summary

```
┌─────────────────────────────────────────────────────────────┐
│                  CONFIGURATION VALUES                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Keycloak:                                                  │
│  - URL: http://localhost:9090                               │
│  - Realm: wordly-realm                                      │
│  - Client: wordly-client                                    │
│  - Secret: v9BVegPOBMnWfQHJHdswfY0EQXUIFSyy                 │
│  - Database: H2 (embedded)                                  │
│  - Admin: admin / admin                                     │
│                                                             │
│  Services:                                                  │
│  - Frontend: http://localhost:4200                          │
│  - Back-Office: http://localhost:4201                       │
│  - API Gateway: http://localhost:8888                       │
│  - UserService: http://localhost:8085                       │
│  - AbonnementService: http://localhost:8084                 │
│  - Eureka: http://localhost:8761                            │
│                                                             │
│  MySQL:                                                     │
│  - Host: localhost:3307                                     │
│  - User: root                                               │
│  - Password: (empty)                                        │
│  - Databases: user_db, abonnement_db                        │
│                                                             │
│  Admin Account:                                             │
│  - Email: admin@wordly.com                                  │
│  - Password: Admin123!                                      │
│  - Role: ADMIN                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Points

1. **CORS is handled ONLY by API Gateway** - prevents duplicate CORS headers
2. **Passwords stored ONLY in Keycloak** - MySQL password field is NULL
3. **Login uses EMAIL** - frontend fetches username from email first
4. **Role-based redirection** - ADMIN goes to back-office, others stay on frontend
5. **Token transfer** - When ADMIN logs in from frontend, token passed via URL to back-office
6. **H2 database** - Keycloak uses embedded H2, no external database needed
7. **Service discovery** - All services register with Eureka for load balancing
