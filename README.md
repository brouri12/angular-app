# JUNGLE IN ENGLISH - E-Learning Platform

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)](https://esprit.tn)
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2026--2027-blue)](https://esprit.tn)
[![PIDEV](https://img.shields.io/badge/Project-PIDEV-green)](https://esprit.tn)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-brightgreen)](https://spring.io)
[![Angular](https://img.shields.io/badge/Angular-21-red)](https://angular.io)
[![Java](https://img.shields.io/badge/Java-17-orange)](https://java.com)

## Overview

**Jungle in English** is a full-stack e-learning platform built with a microservices architecture.
It allows students to discover events, join clubs, receive digital badges with QR codes, and interact via a real-time club chat.
Administrators manage clubs, events, registrations, and monitor statistics from a dedicated back-office.

Developed at **Esprit School of Engineering – Tunisia** | Academic Year 2026–2027

---

## Features

### User Features
- 🔐 **Authentication** – Secure login via Keycloak (JWT)
- 🎉 **Event Discovery** – Browse and register for events
- 🏫 **Club Membership** – Join clubs, chat with members
- 💬 **Club Chat** – Real-time messaging with spam & profanity filtering
- 🏆 **Gamification** – Score system with badge levels (Bronze → Premium)
- 🎖️ **Digital Badge** – PDF badge with QR code sent by email
- 🌐 **Translation** – Club descriptions translated to FR/AR via Google Translate API
- 🏆 **Event Sponsoring** – Club presidents can sponsor events via Stripe payment

### Admin Features
- 📊 **Dashboard** – Statistics on events, clubs, members
- 🎯 **Event Management** – Create, edit, delete events with map location
- 🏫 **Club Management** – Manage clubs and logos
- 👥 **Member Management** – Accept/deny members, assign roles
- 📋 **Registrations** – View and manage all registrations

---

## Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| Angular 21 | Main framework |
| Tailwind CSS | Styling |
| Vitest | Unit testing |
| Stripe.js | Payment integration |

### Backend
| Technology | Usage |
|---|---|
| Spring Boot 4.x | Microservices framework |
| Java 17 | Language |
| Spring Data JPA | ORM |
| Spring Security + OAuth2 | JWT validation via Keycloak |
| OpenFeign | Inter-service communication |
| Eureka | Service discovery |
| API Gateway | Request routing |
| MySQL | Database |
| PDFBox | Badge PDF generation |
| ZXing | QR code generation |
| Mockito / JUnit 5 | Unit testing |

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Angular Frontend (4200)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      API Gateway (8888) + Keycloak JWT  │
└─────────────────────────────────────────┘
                    ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Club Service │ │Event Service │ │Member Service│
│  Port: 8089  │ │  Port: 8086  │ │  Port: 8087  │
└──────────────┘ └──────────────┘ └──────────────┘
        ↑ OpenFeign inter-service communication ↑
                    ↓
┌─────────────────────────────────────────┐
│   MySQL (Clubdb, Eventdb, Membredb)     │
└─────────────────────────────────────────┘
```

---

## Microservices

### Club Service (Port: 8089)
- CRUD clubs + logo upload
- Club chat with profanity filter (purgomalum API) + spam detection
- Event sponsoring with Stripe payment
- Score notification via OpenFeign → Member Service

### Event Service (Port: 8086)
- CRUD events with map location (Leaflet + Nominatim)
- Event status (OPEN/CLOSED) with scheduler
- Sponsoring expiry scheduler (60s) + email notification

### Member Service (Port: 8087)
- Club membership management
- **President uniqueness**: one president per club, one club per president
- Score gamification (+5 message, +30 accepted, +10 badge, -10 bad words/spam)
- Badge level: BRONZE → SILVER → GOLD → PREMIUM
- PDF badge generation (PDFBox) + QR code (ZXing) sent by email
- JWT validation via Keycloak OAuth2 Resource Server

---

## Security

JWT tokens validated at two levels:
1. **API Gateway** – Routes requests with JWT verification
2. **Microservices** – Each service validates JWT independently via Keycloak

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9090/realms/wordly-realm
```

---

## Tests

### Backend (JUnit 5 + Mockito)
```bash
cd member-service
mvn test
# Tests run: 9, Failures: 0
```

Tests cover: president uniqueness, score validation, badge level computation, member creation rules.

### Frontend (Vitest)
```bash
cd frontend/angular-app
ng test --watch=false
# Test Files: 3 passed | Tests: 14 passed
```

Tests cover: club loading, translation cache, isJoined logic, HTTP calls with JWT header.

---

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven
- Keycloak 23 (port 9090)

### Installation

```bash
# 1. Clone
git clone https://github.com/brouri12/angular-app.git

# 2. Start Eureka
cd EurekaServer && mvn spring-boot:run

# 3. Start API Gateway
cd ApiGateway && mvn spring-boot:run

# 4. Start microservices
cd member-service && mvn spring-boot:run
cd club-service && mvn spring-boot:run
cd event-service && mvn spring-boot:run

# 5. Start frontend
cd frontend/angular-app && npm install && ng serve

# 6. Start back-office
cd back-office && npm install && ng serve --port 4201
```

---

## API Endpoints

### Club Service (8089)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/clubs` | List all clubs |
| POST | `/clubs` | Create club |
| GET | `/clubs/{id}/chat/messages` | Get chat messages |
| POST | `/clubs/{id}/chat/messages` | Send message |
| PUT | `/clubs/{id}/sponsor` | Sponsor event |

### Member Service (8087)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/membres` | Join club |
| PUT | `/membres/{id}/role` | Update role |
| PUT | `/membres/{id}/status` | Update status |
| POST | `/membres/score` | Update score |
| GET | `/membres/badge/{idUser}/{idClub}` | Send badge email |

---

## Contributors

Developed by students of **Esprit School of Engineering** – PIDEV Module  
Academic Year: 2026–2027 | Tunisia
