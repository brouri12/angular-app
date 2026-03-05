# PLATEFORME ÉDUCATIVE - E-Learning Platform

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)](https://esprit.tn)
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2025--2026-blue)](https://esprit.tn)
[![PIDEV](https://img.shields.io/badge/Project-PIDEV-green)](https://esprit.tn)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-18.0-red)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)

## Overview

Plateforme Éducative is a comprehensive e-learning platform designed to provide an interactive and engaging learning experience. The platform features a microservices architecture with separate frontend applications for users and administrators, offering advanced forum discussions, multimedia content sharing, recruitment management, and real-time notifications.

*Developed at Esprit School of Engineering – Tunisia*

## Features

### User Features
- **Authentication & Authorization**
  - Secure login and registration system
  - Role-based access control (Student, Teacher, Admin)
  
- **Interactive Forums**
  - Create and participate in discussion forums
  - Like, reply, and share messages
  - Report inappropriate content
  - Real-time message updates
  
- **Multimedia Content**
  - Upload images (JPG, PNG, GIF, WebP - max 5MB)
  - Upload audio files (MP3, WAV, OGG - max 10MB)
  - Upload documents (PDF, ZIP, DOC, XLS - max 20MB)
  - Embed YouTube/Vimeo videos
  - Automatic thumbnail generation
  
- **Intelligent Chatbot**
  - AI-powered virtual assistant
  - Context-aware responses
  - Local knowledge base
  - Conversation history
  
- **Email Notifications**
  - Customizable notification preferences
  - New message alerts
  - Reply notifications
  - Like notifications
  - Mention alerts (@username)
  
- **Recruitment System**
  - Browse job offers
  - Submit applications with CV upload
  - Track application status
  - Automated validation
  
- **Internationalization**
  - French (default)
  - English
  - Real-time language switching
  
- **User Interface**
  - Dark mode / Light mode
  - Responsive design (mobile, tablet, desktop)
  - Modern and intuitive interface

### Admin Features
- **Analytics Dashboard**
  - Real-time forum statistics
  - User engagement metrics
  - Interactive charts and graphs
  
- **Forum Management**
  - Create and manage forums
  - Moderate messages
  - Handle user reports
  - Archive/delete content
  
- **Recruitment Management**
  - Create job offers
  - Review applications
  - Manage candidate CVs
  - Update application status
  
- **User Management**
  - User administration
  - Role assignment
  - Activity monitoring
  
- **Content Moderation**
  - Review reported content
  - Automated content filtering
  - Manual moderation tools

### Technical Features
- **Microservices Architecture**
  - Scalable and maintainable service-oriented design
  - Independent service deployment
  
- **API Gateway**
  - Centralized routing and load balancing
  - CORS configuration
  
- **Service Discovery**
  - Eureka server for service registration
  - Dynamic service discovery
  
- **Database Per Service**
  - Independent data management
  - MySQL databases
  
- **File Storage**
  - Secure file upload and storage
  - Automatic file validation
  - Thumbnail generation for images
  
- **Email System**
  - SMTP integration (Gmail)
  - HTML email templates
  - Automated retry mechanism
  
- **Scheduled Tasks**
  - Automated subscription checks
  - Periodic data cleanup
  
- **API Documentation**
  - Swagger/OpenAPI 3.0
  - Interactive API testing

## Tech Stack

### Frontend
- **Framework**: Angular 18
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4
- **Charts**: Chart.js (for analytics)
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS Observables
- **Internationalization**: ngx-translate
- **Icons**: Font Awesome

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Eureka Server
- **Security**: Spring Security
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Email**: Spring Mail + Thymeleaf
- **File Storage**: Local file system
- **Validation**: Bean Validation
- **Documentation**: SpringDoc OpenAPI

### DevOps & Tools
- **Build Tool**: Maven 3.8+
- **Version Control**: Git / GitHub
- **API Testing**: Postman
- **Database Management**: MySQL Workbench
- **IDE**: IntelliJ IDEA, VS Code

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  User Frontend   │         │  Admin Backend   │         │
│  │  (Angular)       │         │  (Angular)       │         │
│  │  Port: 4300      │         │  Port: 4301      │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│         Spring Cloud Gateway (Port: 8888)                    │
│                CORS + Routing + Load Balancing               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   EUREKA SERVER                              │
│              Service Discovery (Port: 8761)                  │
│              Service Registration & Health Check             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     MICROSERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Forum        │  │ Recrutement  │  │   Config     │     │
│  │ Service      │  │ Service      │  │   Server     │     │
│  │ Port: 8082   │  │ Port: 8083   │  │   Port: 8888 │     │
│  │              │  │              │  │              │     │
│  │ - Forums     │  │ - Offres     │  │ - Central    │     │
│  │ - Messages   │  │ - Candidats  │  │   Config     │     │
│  │ - Multimedia │  │ - CV Upload  │  │              │     │
│  │ - Email      │  │ - Validation │  │              │     │
│  │ - Chatbot    │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   forum_db   │  │ recrutement  │  │   config_db  │     │
│  │   (MySQL)    │  │     _db      │  │   (MySQL)    │     │
│  │              │  │   (MySQL)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Microservices

1. **Forum Service** (Port 8082)
   - Forum and message management
   - Multimedia file handling (images, audio, documents, videos)
   - Email notification system
   - Like and reply system
   - Content moderation
   - Analytics and statistics
   - Database: forum_db

2. **Recrutement Service** (Port 8083)
   - Job offer management
   - Application processing
   - CV upload and storage (BLOB)
   - Candidate validation
   - Application status tracking
   - Database: recrutement_db

3. **API Gateway** (Port 8888)
   - Request routing
   - CORS configuration
   - Load balancing
   - Rate limiting

4. **Eureka Server** (Port 8761)
   - Service discovery
   - Service registration
   - Health monitoring
   - Load balancing support

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- MySQL 8.0
- Maven 3.8+
- Git

### Installation

1. **Clone the repositories**

```bash
# Backend (Spring Boot)
git clone https://github.com/brouri12/spring-app.git
cd spring-app
git checkout rahma

# Frontend (Angular)
git clone https://github.com/brouri12/angular-app.git
cd angular-app
git checkout rahma
```

2. **Setup MySQL Databases**

```sql
-- Create databases
CREATE DATABASE forum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE recrutement_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'pidev_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON forum_db.* TO 'pidev_user'@'localhost';
GRANT ALL PRIVILEGES ON recrutement_db.* TO 'pidev_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configure Backend Services**

Update `application.properties` in each service:

**Forum Service**:
```properties
# Server
server.port=8082
spring.application.name=forum-service

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/forum_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# File Upload
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB

# Email (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
```

**Recrutement Service**:
```properties
# Server
server.port=8083
spring.application.name=recrutement-service

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/recrutement_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

4. **Start Backend Services**

**Terminal 1 - Eureka Server**:
```bash
cd eureka-server
mvn spring-boot:run
# Access: http://localhost:8761
```

**Terminal 2 - API Gateway**:
```bash
cd api-gateway
mvn spring-boot:run
# Access: http://localhost:8888
```

**Terminal 3 - Forum Service**:
```bash
cd forum-service
mvn spring-boot:run
# Access: http://localhost:8082
```

**Terminal 4 - Recrutement Service**:
```bash
cd recrutement-service
mvn spring-boot:run
# Access: http://localhost:8083
```

5. **Start Frontend Applications**

**Terminal 5 - User Frontend**:
```bash
cd angular-app/frontend/angular-app
npm install
ng serve --port 4300
# Access: http://localhost:4300
```

**Terminal 6 - Admin Back-Office**:
```bash
cd angular-app/back-office
npm install
ng serve --port 4301
# Access: http://localhost:4301
```

### Quick Start Script

**Windows** (create `start-all.bat`):
```batch
@echo off
start cmd /k "cd eureka-server && mvn spring-boot:run"
timeout /t 30
start cmd /k "cd api-gateway && mvn spring-boot:run"
timeout /t 20
start cmd /k "cd forum-service && mvn spring-boot:run"
start cmd /k "cd recrutement-service && mvn spring-boot:run"
timeout /t 30
start cmd /k "cd angular-app\frontend\angular-app && ng serve --port 4300"
start cmd /k "cd angular-app\back-office && ng serve --port 4301"
```

**Linux/Mac** (create `start-all.sh`):
```bash
#!/bin/bash
gnome-terminal -- bash -c "cd eureka-server && mvn spring-boot:run; exec bash"
sleep 30
gnome-terminal -- bash -c "cd api-gateway && mvn spring-boot:run; exec bash"
sleep 20
gnome-terminal -- bash -c "cd forum-service && mvn spring-boot:run; exec bash"
gnome-terminal -- bash -c "cd recrutement-service && mvn spring-boot:run; exec bash"
sleep 30
gnome-terminal -- bash -c "cd angular-app/frontend/angular-app && ng serve --port 4300; exec bash"
gnome-terminal -- bash -c "cd angular-app/back-office && ng serve --port 4301; exec bash"
```

## Project Structure

```
plateforme-educative/
├── eureka-server/              # Service Discovery
│   ├── src/main/java/
│   └── src/main/resources/
│       └── application.properties
│
├── api-gateway/                # API Gateway
│   ├── src/main/java/
│   └── src/main/resources/
│       └── application.properties
│
├── forum-service/              # Forum Microservice
│   ├── src/main/java/
│   │   └── tn/esprit/forum/
│   │       ├── controller/     # REST Controllers
│   │       │   ├── ForumRestAPI.java
│   │       │   ├── MultimediaController.java
│   │       │   ├── EmailController.java
│   │       │   ├── InteractionController.java
│   │       │   └── AnalyseController.java
│   │       ├── service/        # Business Logic
│   │       │   ├── ForumService.java
│   │       │   ├── MultimediaService.java
│   │       │   ├── EmailService.java
│   │       │   └── FileStorageService.java
│   │       ├── repository/     # Data Access
│   │       │   ├── ForumRepository.java
│   │       │   ├── MediaFileRepository.java
│   │       │   └── EmailPreferenceRepository.java
│   │       ├── entity/         # JPA Entities
│   │       │   ├── Forum.java
│   │       │   ├── MessageForum.java
│   │       │   ├── MediaFile.java
│   │       │   ├── EmailPreference.java
│   │       │   └── EmailLog.java
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── config/         # Configuration
│   │       └── exception/      # Exception Handling
│   └── src/main/resources/
│       ├── application.properties
│       └── templates/          # Email Templates
│           └── email/
│
├── recrutement-service/        # Recruitment Microservice
│   ├── src/main/java/
│   │   └── tn/esprit/recrutement/
│   │       ├── controller/
│   │       │   └── RecrutementRestAPI.java
│   │       ├── service/
│   │       │   ├── OffreService.java
│   │       │   └── CandidatureService.java
│   │       ├── repository/
│   │       │   ├── OffreRepository.java
│   │       │   └── CandidatureRepository.java
│   │       └── entity/
│   │           ├── OffreEmploi.java
│   │           └── CandidatureEnseignant.java
│   └── src/main/resources/
│       └── application.properties
│
└── angular-app/                # Frontend Applications
    ├── frontend/angular-app/   # User Frontend
    │   ├── src/app/
    │   │   ├── components/
    │   │   │   ├── chatbot-widget/
    │   │   │   ├── email-preferences/
    │   │   │   ├── language-switcher/
    │   │   │   ├── header/
    │   │   │   └── footer/
    │   │   ├── pages/
    │   │   │   ├── home/
    │   │   │   ├── forums-public/
    │   │   │   └── recrutement-public/
    │   │   ├── services/
    │   │   │   ├── forum.service.ts
    │   │   │   ├── multimedia.service.ts
    │   │   │   ├── chatbot.service.ts
    │   │   │   └── email-preference.service.ts
    │   │   └── models/
    │   └── public/i18n/
    │       ├── en.json
    │       └── fr.json
    │
    └── back-office/            # Admin Frontend
        ├── src/app/
        │   ├── components/
        │   │   ├── sidebar/
        │   │   └── topbar/
        │   ├── pages/
        │   │   ├── dashboard/
        │   │   ├── forum/
        │   │   ├── recrutement/
        │   │   └── analytics/
        │   └── services/
        └── src/assets/i18n/
```

## API Documentation

### Forum Service Endpoints

#### Forums
```http
GET    /api/forum/forums              # Get all forums
GET    /api/forum/forums/{id}         # Get forum by ID
POST   /api/forum/forums              # Create forum
PUT    /api/forum/forums/{id}         # Update forum
DELETE /api/forum/forums/{id}         # Delete forum
```

#### Messages
```http
GET    /api/forum/messages             # Get all messages
GET    /api/forum/messages/{id}        # Get message by ID
POST   /api/forum/messages             # Create message
PUT    /api/forum/messages/{id}        # Update message
DELETE /api/forum/messages/{id}        # Delete message
GET    /api/forum/forums/{id}/messages # Get messages by forum
```

#### Multimedia
```http
POST   /api/forum/multimedia/upload/image      # Upload image
POST   /api/forum/multimedia/upload/audio      # Upload audio
POST   /api/forum/multimedia/upload/document   # Upload document
POST   /api/forum/multimedia/embed/video       # Embed video
GET    /api/forum/multimedia/file/{id}         # Download file
GET    /api/forum/multimedia/thumbnail/{id}    # Get thumbnail
DELETE /api/forum/multimedia/file/{id}         # Delete file
GET    /api/forum/multimedia/message/{id}      # Get media by message
GET    /api/forum/multimedia/gallery/{forumId} # Get forum gallery
```

#### Email Notifications
```http
POST   /api/forum/email/preferences        # Create preferences
GET    /api/forum/email/preferences/{id}   # Get preferences
PUT    /api/forum/email/preferences/{id}   # Update preferences
POST   /api/forum/email/test               # Send test email
```

#### Interactions
```http
POST   /api/forum/likes                    # Like message
DELETE /api/forum/likes/{id}               # Unlike message
GET    /api/forum/messages/{id}/likes      # Get message likes
POST   /api/forum/replies                  # Reply to message
GET    /api/forum/messages/{id}/replies    # Get message replies
POST   /api/forum/signalements             # Report content
```

### Recrutement Service Endpoints

#### Job Offers
```http
GET    /api/recrutement/offres             # Get all offers
GET    /api/recrutement/offres/{id}        # Get offer by ID
POST   /api/recrutement/offres             # Create offer
PUT    /api/recrutement/offres/{id}        # Update offer
DELETE /api/recrutement/offres/{id}        # Delete offer
GET    /api/recrutement/offres/actives     # Get active offers
```

#### Applications
```http
GET    /api/recrutement/candidatures       # Get all applications
GET    /api/recrutement/candidatures/{id}  # Get application by ID
POST   /api/recrutement/candidatures       # Submit application
PUT    /api/recrutement/candidatures/{id}  # Update application
GET    /api/recrutement/candidatures/cv/{id} # Download CV
GET    /api/recrutement/offres/{id}/candidatures # Get offer applications
```

### API Gateway Routes

- **Base URL**: http://localhost:8888
- **Forum Service**: `/forum-service/**` → http://localhost:8082
- **Recrutement Service**: `/recrutement-service/**` → http://localhost:8083

### Interactive API Documentation

- **Swagger Forum**: http://localhost:8082/swagger-ui.html
- **Swagger Recrutement**: http://localhost:8083/swagger-ui.html
- **Eureka Dashboard**: http://localhost:8761

## Testing

### Run Backend Tests

```bash
# Forum Service
cd forum-service
mvn test

# Recrutement Service
cd recrutement-service
mvn test

# Run all tests with coverage
mvn clean test jacoco:report
```

### Run Frontend Tests

```bash
# User Frontend
cd angular-app/frontend/angular-app
npm test

# Admin Back-Office
cd angular-app/back-office
npm test

# E2E Tests
npm run e2e
```

### API Testing with Postman

Import the Postman collection: `Microservices_Tests.postman_collection.json`

1. Import collection in Postman
2. Configure environment variables
3. Run test suites

## Deployment

### Build for Production

**Backend**:
```bash
# Build all services
cd forum-service && mvn clean package
cd recrutement-service && mvn clean package
cd api-gateway && mvn clean package
cd eureka-server && mvn clean package
```

**Frontend**:
```bash
# Build user frontend
cd angular-app/frontend/angular-app
ng build --configuration=production

# Build admin back-office
cd angular-app/back-office
ng build --configuration=production
```

### Docker Deployment (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: forum_db
    ports:
      - "3306:3306"
  
  eureka-server:
    build: ./eureka-server
    ports:
      - "8761:8761"
  
  forum-service:
    build: ./forum-service
    ports:
      - "8082:8082"
    depends_on:
      - mysql
      - eureka-server
```

## Contributors

- **Development Team** - Esprit School of Engineering Students
- **Academic Supervisor** - [Supervisor Name]
- **Project Manager** - [PM Name]

## Academic Context

**Developed at Esprit School of Engineering - Tunisia**

- **Project Type**: PIDEV (Projet Intégré de Développement)
- **Class**: 4A (Fourth Year)
- **Academic Year**: 2025–2026
- **Institution**: Esprit School of Engineering
- **Location**: Tunisia
- **Branch**: `rahma`

This project was developed as part of the integrated development project curriculum at Esprit, focusing on building a complete full-stack application using modern technologies and microservices architecture.

## Key Learning Outcomes

- Microservices architecture design and implementation
- RESTful API development with Spring Boot
- Frontend development with Angular
- Database design and management
- File upload and storage systems
- Email notification systems
- Real-time communication
- Security and authentication
- API documentation with Swagger
- Version control with Git
- Agile development methodology

## Acknowledgments

- **Esprit School of Engineering** for providing the academic framework and resources
- **Spring Boot** and **Angular** communities for excellent documentation
- **MySQL** for reliable database management
- **Tailwind CSS** for modern UI components
- All open-source contributors whose libraries made this project possible

## License

This project is developed for academic purposes at Esprit School of Engineering.

## Contact

For questions or support:
- **GitHub**: [brouri12](https://github.com/brouri12)
- **Repositories**:
  - Backend: https://github.com/brouri12/spring-app
  - Frontend: https://github.com/brouri12/angular-app

---

**© 2025-2026 Esprit School of Engineering - Tunisia**

*Developed with ❤️ for education*
