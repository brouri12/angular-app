# JUNGLE IN ENGLISH - E-Learning Platform

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)](https://esprit.tn)
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2026--2027-blue)](https://esprit.tn)
[![PIDEV](https://img.shields.io/badge/Project-PIDEV-green)](https://esprit.tn)






Overview

The Event Management Platform is a full-stack web application designed to manage university clubs, events, and member participation.

The platform allows students to discover events, register for them, join clubs, and receive a digital badge with QR Code confirming their membership.

Administrators can manage clubs, events, registrations, and monitor participation statistics.

The system is built using a microservices architecture to ensure scalability, modularity, and maintainability.

Developed at Esprit School of Engineering – Tunisia

Features
User Features

🔐 Authentication & Authorization – Secure login system

🎉 Event Discovery – Browse available events

📝 Event Registration – Register for events with capacity management

🏫 Club Membership – Join university clubs

📅 Event Status Management – Events automatically close after their date

📩 QR Code Badge – Members receive a digital badge with QR code

👤 User Profile – View personal information and participation

Admin Features

📊 Dashboard & Statistics – View event and club statistics

🎯 Event Management – Create, update, and delete events

🏫 Club Management – Manage clubs and their information

👥 Member Management – View and manage club members

📉 Capacity Control – Automatic decrement/increment of event capacity

📄 Badge Generation – Generate QR code badges for members

Technical Features

🏗 Microservices Architecture

🔗 API Gateway Routing

🔄 Inter-Service Communication

📊 Event Statistics API

📦 RESTful APIs

📱 Responsive Frontend

Tech Stack
Frontend

Framework: Angular

Styling: Tailwind CSS

Charts: Chart.js

HTTP Client: Angular HttpClient

Backend

Framework: Spring Boot 3.x

Language: Java 17

ORM: Spring Data JPA / Hibernate

Security: Spring Security

Database: MySQL

QR Code: ZXing

PDF Generation: OpenPDF

API Communication: RestTemplate

Dev Tools

Build Tool: Maven

Version Control: Git / GitHub

API Testing: Postman

Database Management: phpMyAdmin

IDE: IntelliJ IDEA / VS Code

Architecture

┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                      │
│                                                             │
│                  Angular Frontend                           │
│                     Port: 4200                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        API GATEWAY                          │
│                    Port: 8888                               │
│                 Request Routing + CORS                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       MICROSERVICES                         │
│                                                             │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│   │ Club Service │   │ Event Service│   │Member Service│    │
│   │ Port: 8081   │   │ Port: 8082   │   │ Port: 8083   │    │
│   └──────────────┘   └──────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                          DATABASE                           │
│                                                             │
│        MySQL Databases (club_db, event_db, member_db)       │
└─────────────────────────────────────────────────────────────┘
Microservices
Club Service

Manages clubs.

Functions:

Create club

Upload club logo

View clubs

Manage club information

Event Service

Manages events.

Functions:

Create events

Event capacity management

Event status (OPEN / CLOSED)

Event statistics

Member Service

Manages members.

Functions:

Join clubs

Generate QR Code badge

Send email confirmation

Member participation tracking

Getting Started
Prerequisites

Before running the project make sure you have installed:

Java 17+

Node.js

MySQL

Maven

Git

Installation
1 Clone the Repository
git clone https://github.com/your-username/event-management-platform.git
cd event-management-platform
2 Setup Database
CREATE DATABASE club_db;
CREATE DATABASE event_db;
CREATE DATABASE member_db;
3 Start Backend Services

Terminal 1

cd club-service
mvn spring-boot:run

Terminal 2

cd event-service
mvn spring-boot:run

Terminal 3

cd member-service
mvn spring-boot:run

Terminal 4

cd api-gateway
mvn spring-boot:run
4 Start Frontend
cd frontend
npm install
npm start

Access the application at:

http://localhost:4200
Project Structure
event-management-platform/

├── club-service/
│   ├── src/main/java/
│   └── src/main/resources/
│
├── event-service/
│   ├── src/main/java/
│   └── src/main/resources/
│
├── member-service/
│   ├── src/main/java/
│   └── src/main/resources/
│
├── api-gateway/
│   ├── src/main/java/
│   └── src/main/resources/
│
├── frontend/
│   ├── src/app/
│   └── package.json
│
└── README.md

API Endpoints
Event Service
GET /events
POST /events
GET /events/{id}
DELETE /events/{id}
Club Service
GET /clubs
POST /clubs
POST /clubs/{id}/logo
Member Service
POST /members
GET /members
POST /members/badge
Contributors

Developed by students of Esprit School of Engineering.

Academic Context

Project developed as part of the PIDEV module.

Institution: Esprit School of Engineering

Academic Year: 2025–2026

Country: Tunisia

License

This project is developed for academic purposes.

If you want, I can also help you create a SUPER PROFESSIONAL README (like big GitHub projects) with:

🚀 animated badges

📸 screenshots of your app

📊 architecture diagrams

🧠 features table

🏆 contributors section

It will make your GitHub look very professional for recruiters.
