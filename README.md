# Project Title
Esprit Learning Platform - Frontend and Back-office

## Overview
This project was developed as part of the PIDEV Engineering Program at **Esprit School of Engineering** (Academic Year 2026-2027).
It provides a complete e-learning platform with student and teacher spaces, course and parcours flows, feedback/rating mechanisms, and admin analytics.

## Features
- Student and teacher interfaces with role-based flows
- Course catalog, enrollment, and progress tracking
- Parcours by level/chapter with lessons and quizzes
- Course and chapter feedback with rating analytics
- Admin back-office dashboards and content management

## Tech Stack

### Frontend
- Angular
- HTML/CSS/TypeScript
- Static front-office HTML integration

### Backend
- Node.js + Express
- MySQL (XAMPP)
- Keycloak (IAM)

## Architecture
- Microservice-oriented integration (Eureka, API Gateway, dedicated services)
- Node.js API layer for pedagogical content and front/back-office static delivery
- Separate front-office and back-office applications connected to shared APIs

## Contributors
- Rahali and team members (PIDEV)

## Academic Context
Developed at **Esprit School of Engineering - Tunisia**  
PIDEV - Engineering Program - 2026-2027

## Getting Started

### Prerequisites
- Node.js
- MySQL (XAMPP)
- (Optional) Java services and Keycloak for full integration mode

### Installation
```bash
git clone https://github.com/brouri12/angular-app.git
cd angular-app
```

### Run
1. Start backend API:
```bash
cd pi
node xampp-mysql-dashboard.js
```

2. Start frontend Angular app:
```bash
cd frontend/angular-app
npm install
npm start
```

3. Start back-office Angular app:
```bash
cd back-office
npm install
npm start
```

## Acknowledgments
- Esprit School of Engineering teaching staff and tutors
- Open-source ecosystem used in this project
