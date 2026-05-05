# Game Service — Gamified Learning Platform

Microservice for the gamified English learning module. Runs on **port 9001** and registers with the shared Eureka Server.

---

## Stack
- Java 17 · Spring Boot 3.2.0 · Spring Cloud 2023.0.0
- MySQL (port 3307 via XAMPP)
- JUnit 5 + Mockito (68 tests)

---

## Quick Start

### Prerequisites
- JDK 17 (`C:\Users\hsaya\.jdks\ms-17.0.14` or any JDK 17)
- XAMPP MySQL running on port 3307
- Eureka Server running on port 8761

### Run
```bash
cd gamified-learning-platform
mvn spring-boot:run
```

Service starts at: `http://localhost:9001`
Registers as: `GAME-SERVICE` in Eureka

### Run Tests (JDK 17 required)
```bash
$env:JAVA_HOME = "C:\Users\hsaya\.jdks\ms-17.0.14"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
mvn clean test
```

---

## Database Setup

1. Start XAMPP MySQL on port 3307
2. Open phpMyAdmin → create database `gamified_learning`
3. Run SQL seeds in order:
   - `sql-seeds/01_clear_data.sql`
   - `sql-seeds/02_seed_games_and_questions.sql`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/games` | List active games |
| GET | `/api/games/{id}` | Game details + questions |
| POST | `/api/submissions` | Submit answers |
| GET | `/api/session` | Player XP/level session |
| GET | `/api/stats/global` | Platform statistics |
| GET | `/api/stats/leaderboard` | Top players |
| GET | `/api/crossword/generate` | Generate crossword puzzle |
| GET | `/api/wordladder/generate` | Generate word ladder |
| GET | `/api/admin/games` | Admin: list all games |
| POST | `/api/admin/games` | Admin: create game |
| PUT | `/api/admin/games/{id}` | Admin: update game |
| DELETE | `/api/admin/games/{id}` | Admin: delete game |
| GET | `/health` | Health check |

---

## API Gateway Integration

The API Gateway routes all `/api/**` traffic to this service via Eureka (`lb://GAME-SERVICE`).

Direct access: `http://localhost:9001/api/...`  
Via Gateway: `http://localhost:8888/api/...`

---

## Special Game IDs

| gameId | Game |
|--------|------|
| `> 0` | Regular DB game (Quiz / Sentence) |
| `0` | Crossword (no DB entry) |
| `-1` | Word Ladder (no DB entry) |

---

## Configuration

`src/main/resources/application.yml`:
- `server.port`: 9001
- `spring.application.name`: GAME-SERVICE
- `eureka.client.service-url.defaultZone`: http://localhost:8761/eureka/
- `apiverve.key`: APIVerve key (crossword/word-ladder generation)
