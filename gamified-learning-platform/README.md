# Game Service - Gamified English Learning Platform

A standalone microservice for managing educational games for kids learning English.

## Overview

This service provides a complete game management system with multiple game types:
- **Card Flip Games**: Memory matching games
- **Vocabulary Games**: Word learning and practice
- **Quiz Games**: Interactive question-answer games
- **Sentence Completion**: Fill-in-the-blank exercises

## Technology Stack

- **Java 21**
- **Spring Boot 3.2.0**
- **Spring Cloud (Eureka Client)**
- **MySQL Database**
- **Lombok**
- **Maven**

## Prerequisites

- Java 21 or higher
- Maven 3.6+
- MySQL 8.0+
- Eureka Server running on port 8761

## Configuration

The service runs on **port 9001** and registers with Eureka as `GAME-SERVICE`.

### Database Configuration

```yaml
Database: gamified_learning
Port: 3309
Username: root
Password: (empty)
```

## Quick Start

### Using PowerShell Script
```powershell
.\start-game-service.ps1
```

### Using Maven
```bash
mvn clean install
mvn spring-boot:run
```

### Using Java
```bash
mvn clean package
java -jar target/gamified-learning-platform-1.0.0.jar
```

## API Gateway Integration

The service is accessible through the API Gateway at:
```
http://localhost:8888/game-service/**
```

## Key Features

- **Game Management**: Create, update, and manage educational games
- **Player Sessions**: Track player progress and scores
- **Game Submissions**: Handle player answers and scoring
- **Admin Controls**: Administrative endpoints for game management
- **Content Management**: JSON-based game content storage

## Project Structure

```
src/main/java/org/example/
├── controller/          # REST API endpoints
├── service/            # Business logic
├── repository/         # Data access layer
├── entity/             # JPA entities
├── dto/                # Data transfer objects
├── engine/             # Game logic engines
└── config/             # Configuration classes

src/main/resources/
├── application.yml     # Application configuration
└── game-content/       # JSON game content files
```

## API Documentation

See `API_EXAMPLES.http` for example API calls.

## Development

### Build
```bash
mvn clean install
```

### Run Tests
```bash
mvn test
```

### Package
```bash
mvn clean package
```

## Deployment

The service is designed to work as part of a microservices architecture with:
- **Eureka Server** (Service Discovery) - Port 8761
- **API Gateway** - Port 8888

## Notes

- The service automatically creates the database if it doesn't exist
- Game content is stored in JSON files under `resources/game-content/`
- All endpoints are prefixed with `/game-service/` when accessed through the gateway
