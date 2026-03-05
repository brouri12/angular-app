# JUNGLE IN ENGLISH - E-Learning Platform

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)](https://esprit.tn)
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2026--2027-blue)](https://esprit.tn)
[![PIDEV](https://img.shields.io/badge/Project-PIDEV-green)](https://esprit.tn)

## Overview

JUNGLE IN ENGLISH is a comprehensive e-learning platform designed to provide an interactive and engaging learning experience. The platform features a microservices architecture with separate frontend applications for users and administrators, offering subscription-based access to educational content with integrated payment processing and real-time notifications.

**Developed at Esprit School of Engineering – Tunisia**

## Features

### User Features
- 🔐 **Authentication & Authorization** - Secure login with Keycloak integration
- 📚 **Course Access** - Browse and access educational content based on subscription level
- 💳 **Subscription Management** - Multiple subscription tiers (Basic, Premium, Enterprise)
- 💰 **Payment Processing** - Integrated Stripe payment gateway with multiple payment methods
- 🔔 **Subscription Reminders** - Automated notifications for expiring subscriptions
- 👤 **User Profile** - Personalized user dashboard and profile management
- 🌙 **Dark Mode** - Toggle between light and dark themes

### Admin Features
- 📊 **Analytics Dashboard** - Real-time subscription and revenue analytics with interactive charts
- 👥 **User Management** - Comprehensive user administration
- 💼 **Subscription Management** - Create and manage subscription plans
- 💸 **Payment Validation** - Review and validate bank transfer payments
- 📈 **Visual Reports** - Doughnut, pie, and bar charts for data visualization

### Technical Features
- 🏗️ **Microservices Architecture** - Scalable and maintainable service-oriented design
- 🔄 **API Gateway** - Centralized routing and load balancing
- 🗄️ **Database Per Service** - Independent data management for each microservice
- ⏰ **Scheduled Tasks** - Automated subscription expiration checks
- 🎨 **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: Angular 19
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **HTTP Client**: Angular HttpClient
- **State Management**: Angular Signals
- **Authentication**: Keycloak Angular adapter

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **API Gateway**: Spring Cloud Gateway
- **Security**: Spring Security + Keycloak
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Payment**: Stripe API
- **Scheduler**: Spring @Scheduled

### DevOps & Tools
- **Build Tool**: Maven
- **Version Control**: Git
- **API Testing**: Postman
- **Database Management**: phpMyAdmin
- **IDE**: IntelliJ IDEA, VS Code

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  User Frontend   │         │  Admin Backend   │         │
│  │  (Angular)       │         │  (Angular)       │         │
│  │  Port: 4200      │         │  Port: 4201      │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│              Spring Cloud Gateway (Port: 8888)               │
│                    CORS + Routing                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     MICROSERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ UserService  │  │ Abonnement   │  │   Keycloak   │     │
│  │ Port: 8085   │  │ Service      │  │   Port: 8080 │     │
│  │              │  │ Port: 8084   │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATABASES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   user_db    │  │ abonnement_db│  │  keycloak_db │     │
│  │   (MySQL)    │  │   (MySQL)    │  │    (H2)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Microservices

1. **UserService** (Port 8085)
   - User management and authentication
   - Payment processing with Stripe
   - User subscriptions tracking
   - Database: `user_db`

2. **AbonnementService** (Port 8084)
   - Subscription plan management
   - Subscription analytics
   - Expiration reminders (scheduled every 2 minutes)
   - Database: `abonnement_db`

3. **API Gateway** (Port 8888)
   - Request routing
   - CORS configuration
   - Load balancing

4. **Keycloak** (Port 8080)
   - Identity and access management
   - OAuth2/OpenID Connect
   - User authentication

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 18+ and npm
- MySQL 8.0
- Maven 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/e_learnig-platform.git
   cd e_learnig-platform
   ```

2. **Setup MySQL Databases**
   ```sql
   CREATE DATABASE user_db;
   CREATE DATABASE abonnement_db;
   ```

3. **Configure Keycloak**
   ```bash
   # Download and extract Keycloak
   # Start Keycloak
   cd keycloak-23.0.0/bin
   ./kc.bat start-dev  # Windows
   ./kc.sh start-dev   # Linux/Mac
   
   # Access: http://localhost:8080
   # Create admin user and configure realm
   ```

4. **Start Backend Services**
   
   Terminal 1 - UserService:
   ```bash
   cd UserService
   mvn spring-boot:run
   ```
   
   Terminal 2 - AbonnementService:
   ```bash
   cd AbonnementService
   mvn spring-boot:run
   ```
   
   Terminal 3 - API Gateway:
   ```bash
   cd ApiGateway
   mvn spring-boot:run
   ```

5. **Start Frontend Applications**
   
   Terminal 4 - User Frontend:
   ```bash
   cd frontend/angular-app
   npm install
   npm start
   # Access: http://localhost:4200
   ```
   
   Terminal 5 - Admin Back-Office:
   ```bash
   cd back-office
   npm install
   npm start
   # Access: http://localhost:4201
   ```

### Configuration

Update `application.properties` in each service:

**UserService**:
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/user_db
spring.datasource.username=root
spring.datasource.password=
stripe.api.key=your_stripe_key
```

**AbonnementService**:
```properties
spring.datasource.url=jdbc:mysql://localhost:3307/abonnement_db
spring.datasource.username=root
spring.datasource.password=
```

### Default Credentials

**Admin Account**:
- Email: `admin@wordly.com`
- Password: `admin123`

**Test Stripe Card**:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## Project Structure

```
e_learnig-platform/
├── UserService/              # User management microservice
│   ├── src/main/java/
│   └── src/main/resources/
├── AbonnementService/        # Subscription microservice
│   ├── src/main/java/
│   └── src/main/resources/
├── ApiGateway/              # API Gateway
│   ├── src/main/java/
│   └── src/main/resources/
├── frontend/                # User frontend
│   └── angular-app/
│       ├── src/app/
│       └── package.json
├── back-office/            # Admin frontend
│   ├── src/app/
│   └── package.json
└── README.md
```

## API Documentation

### User Service Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `POST /api/payments` - Create payment
- `GET /api/payments/validated` - Get validated payments

### Abonnement Service Endpoints
- `GET /api/abonnements` - Get all subscriptions
- `POST /api/abonnements` - Create subscription
- `GET /api/abonnements/analytics` - Get analytics
- `GET /api/subscription-reminders/user/{userId}` - Get user reminders

### API Gateway
- Base URL: `http://localhost:8888`
- User Service: `/user-service/**`
- Abonnement Service: `/abonnement-service/**`

## Testing

### Run Backend Tests
```bash
cd UserService
mvn test

cd AbonnementService
mvn test
```

### Run Frontend Tests
```bash
cd frontend/angular-app
npm test

cd back-office
npm test
```

## Contributors

- **Team Members** - Esprit School of Engineering Students
- **Academic Supervisor** - [Supervisor Name]

## Academic Context

**Developed at Esprit School of Engineering - Tunisia**

- **Project Type**: PIDEV (Projet Intégré de Développement)
- **Class**: 4SAE
- **Academic Year**: 2026–2027
- **Institution**: Esprit School of Engineering
- **Location**: Tunisia

This project was developed as part of the integrated development project curriculum at Esprit, focusing on building a complete full-stack application using modern technologies and microservices architecture.

## Acknowledgments

- **Esprit School of Engineering** for providing the academic framework and resources
- **Spring Boot** and **Angular** communities for excellent documentation
- **Stripe** for payment processing capabilities
- **Keycloak** for identity management
- All open-source contributors whose libraries made this project possible

## License

This project is developed for academic purposes at Esprit School of Engineering.

---

**© 2026-2027 Esprit School of Engineering - Tunisia**
