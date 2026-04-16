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
- 💳 **Event Sponsoring** – Club presidents can sponsor events via Stripe payment
- 📅 **Reservations** – Register and manage event registrations

### Admin Features
- 📊 **Dashboard** – Statistics on events, clubs, members, payments
- 🎯 **Event Management** – Create, edit, delete events with map location
- 🏫 **Club Management** – Manage clubs and logos
- 👥 **Member Management** – Accept/deny members, assign roles (ADMIN only)
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
| Leaflet + Nominatim | Map & geolocation |

### Backend
| Technology | Usage |
|---|---|
| Spring Boot 4.x | Microservices framework |
| Java 17 | Language |
| Spring Data JPA | ORM |
| Spring Security + OAuth2 | JWT validation via Keycloak |
| OpenFeign | Inter-service communication |
| Eureka | Service discovery |
| API Gateway | Request routing + CORS |
| MySQL | Database |
| PDFBox | Badge PDF generation |
| ZXing | QR code generation |
| Mockito / JUnit 5 | Unit testing |
| Purgomalum API | Profanity filtering |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│         Angular Frontend (4200)                  │
│         Angular Back-Office (4201)               │
└──────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────┐
│      API Gateway (8888) — CORS + JWT routing     │
└──────────────────────────────────────────────────┘
                        ↓
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│Club Service│ │Event Svc   │ │Member Svc  │ │Reservation │
│ Port: 8089 │ │ Port: 8086 │ │ Port: 8087 │ │ Port: 8083 │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
        ↑ OpenFeign inter-service communication ↑
                        ↓
┌──────────────────────────────────────────────────┐
│  MySQL (Clubdb · Eventdb · Membredb · Regdb)     │
└──────────────────────────────────────────────────┘
        ↑ Service Discovery via Eureka (8761) ↑
```

---

## Microservices

### Club Service (Port: 8089)
- CRUD clubs with logo upload
- Club chat with profanity filter (Purgomalum API) + spam detection (3 identical messages)
- Optimistic UI update + polling every 5s
- Event sponsoring with Stripe payment
- Score notification via **OpenFeign → Member Service**
- Translation via Google Translate API (FR/AR)

### Event Service (Port: 8086)
- CRUD events with map location (Leaflet + Nominatim geocoding)
- Event status (OPEN/CLOSED) with scheduler
- Sponsoring expiry scheduler + email notification
- Statistics: total, by status, by type, by mode

### Member Service (Port: 8087)
- Club membership management (PENDING / ACCEPTED / DENIED)
- **President uniqueness**: one president per club, one club per president
- Score gamification: +5 message, +30 accepted, +10 badge, -10 bad words/spam
- Badge levels: BRONZE → SILVER → GOLD → PREMIUM
- PDF badge generation (PDFBox) + QR code (ZXing) sent by email
- Badge verification via public URL
- **Role-based security**: accept, deny, role, delete → ADMIN only (`@PreAuthorize`)

### Reservation Service (Port: 8083)
- Register/cancel event registrations
- Status management: PENDING / CONFIRMED / CANCELED
- View my registrations with club chat integration
- Admin: view all registrations, filter by event/status

---

## Security

JWT tokens validated at two levels:

1. **API Gateway** – Routes all requests, handles CORS centrally
2. **Microservices** – Each service validates JWT via Keycloak

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9090/realms/wordly-realm
```

Role-based access control with `@PreAuthorize("hasRole('ADMIN')")` on sensitive endpoints:
- `PUT /membres/{id}/accept`
- `PUT /membres/{id}/deny`
- `PUT /membres/{id}/role`
- `DELETE /membres/{id}`

---

## Tests

### Backend (JUnit 5 + Mockito)
```bash
cd member-service
mvn test
# Tests run: 9, Failures: 0
```
Covers: president uniqueness, score computation, badge levels, member creation rules, spam detection.

### Frontend (Vitest)
```bash
cd frontend/angular-app
ng test --watch=false
# Test Files: 3 passed | Tests: 14 passed
```
Covers: club loading, translation cache, isJoined logic, HTTP calls with JWT header, chat service endpoints.

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
cd reservation-service && mvn spring-boot:run

# 5. Start frontend
cd frontend/angular-app && npm install && ng serve

# 6. Start back-office
cd back-office && npm install && ng serve --port 4201
```

---

## API Endpoints

### Club Service (via Gateway: 8888/clubs)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/clubs` | Public | List all clubs |
| POST | `/clubs` | JWT | Create club |
| GET | `/clubs/{id}` | Public | Get club by ID |
| PUT | `/clubs/{id}` | JWT | Update club |
| DELETE | `/clubs/{id}` | JWT | Delete club |
| POST | `/clubs/create-with-logo` | JWT | Create with logo |
| GET | `/clubs/{id}/chat/messages` | JWT | Get chat messages |
| POST | `/clubs/{id}/chat/messages` | JWT | Send message |
| PUT | `/clubs/{id}/sponsor` | JWT | Sponsor event |

### Member Service (via Gateway: 8888/membres)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/membres` | JWT | Join club |
| GET | `/membres/by-user/{id}` | Public | Get memberships |
| GET | `/membres/club/{id}` | Public | Get club members |
| PUT | `/membres/{id}/accept` | **ADMIN** | Accept member |
| PUT | `/membres/{id}/deny` | **ADMIN** | Deny member |
| PUT | `/membres/{id}/role` | **ADMIN** | Update role |
| DELETE | `/membres/{id}` | **ADMIN** | Delete member |
| POST | `/membres/score` | JWT | Update score |
| POST | `/membres/badge/{idUser}/{idClub}` | JWT | Send badge email |
| GET | `/membres/badge/pdf/{idUser}/{idClub}` | JWT | Download badge PDF |
| GET | `/membres/verify/{badgeId}` | Public | Verify badge |

### Event Service (via Gateway: 8888/events)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | Public | List all events |
| POST | `/events` | JWT | Create event |
| PUT | `/events/{id}` | JWT | Update event |
| DELETE | `/events/{id}` | JWT | Delete event |
| GET | `/events/stats/total` | JWT | Total events |
| GET | `/events/stats/status` | JWT | Stats by status |
| GET | `/events/stats/type` | JWT | Stats by type |
| GET | `/events/stats/mode` | JWT | Stats by mode |

### Reservation Service (via Gateway: 8888/registrations)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/registrations` | JWT | List all |
| POST | `/registrations` | JWT | Create registration |
| GET | `/registrations/event/{id}` | JWT | By event |
| PUT | `/registrations/{id}` | JWT | Update status |
| DELETE | `/registrations/{id}` | JWT | Delete |

---

## Contributors

Developed by students of **Esprit School of Engineering** – PIDEV Module
Academic Year: 2026–2027 | Tunisia
