# 🎓 English Proficiency Evaluation System

## 📋 Overview

The **English Proficiency Evaluation System** is a comprehensive platform designed to streamline the process of creating, distributing, and grading English language assessments. Built with modern web technologies, it provides separate interfaces for administrators/teachers (back-office) and students (front-office), featuring real-time scoring, automatic evaluation closing, and detailed performance analytics.

### 🎯 Project Goals

- **Automate Assessment**: Reduce manual grading time with intelligent automatic scoring
- **Enhance User Experience**: Provide intuitive interfaces for both teachers and students
- **Real-time Feedback**: Deliver instant score calculations and detailed breakdowns
- **Scalability**: Support multiple concurrent evaluations and users
- **Flexibility**: Accommodate various question types (grammar, listening, essay)

---

## ✨ Features

### 👨‍🏫 For Teachers (Back-Office)

- **📝 Evaluation Management**
  - Create, edit, and delete evaluations
  - Add multiple question types (Grammar, Listening, Essay)
  - Define correct answers for automatic scoring
  - Upload audio files for listening sections
  - Set custom scoring weights per section

- **⏰ Automatic Scheduling**
  - Set deadlines for automatic evaluation closing
  - Real-time scheduler monitoring
  - Manual override options
  - Scheduler statistics dashboard

- **📊 Visual Indicators**
  - Green badges showing entered correct answers
  - Warning alerts for missing correct answers
  - Status indicators (OPEN/CLOSED)
  - Scheduled task counters

- **🎨 Modern UI**
  - Dark mode support
  - Responsive design
  - Gradient-styled sections
  - Real-time form validation

### 👨‍🎓 For Students (Front-Office)

- **📖 Exam Taking**
  - Browse available evaluations
  - Take exams with countdown timer
  - Auto-save draft answers
  - Audio playback for listening sections
  - Word count tracking for essays

- **⚡ Instant Feedback**
  - Beautiful score popup immediately after submission
  - Detailed breakdown by section
  - Percentage calculation
  - Visual score cards with icons

- **📱 Responsive Interface**
  - Split-screen exam view
  - Progress indicators
  - Time warnings
  - Auto-submit on timer expiration

### 🤖 Automatic Scoring System

- **Intelligent Comparison**
  - Case-insensitive answer matching
  - Whitespace normalization
  - Proportional scoring (e.g., 2/3 correct = 66.67%)
  - JSON-based answer storage

- **Multi-Section Support**
  - Grammar questions scoring
  - Listening comprehension scoring
  - Essay section (manual grading)
  - Customizable weights per section

- **Automatic Note Generation**
  - Creates grade records automatically
  - Links scores to answers and evaluations
  - Stores detailed score breakdowns

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17 | Core programming language |
| **Spring Boot** | 3.3.0 | Application framework |
| **Spring Cloud** | 2023.0.2 | Microservices support (Eureka) |
| **Spring Data JPA** | - | Database ORM |
| **MySQL** | 8.0+ | Relational database |
| **Maven** | - | Dependency management |
| **Lombok** | - | Boilerplate code reduction |
| **JSON Library** | 20230227 | JSON parsing for scoring |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 18 | Frontend framework |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.x | Utility-first CSS |
| **RxJS** | 7.x | Reactive programming |
| **Angular Signals** | - | State management |

### DevOps & Tools

- **Git** - Version control
- **npm** - Package management
- **Maven Wrapper** - Build automation
- **CORS** - Cross-origin resource sharing
- **REST API** - Communication protocol

---

## 🏗️ Architecture

### System Architecture
┌───────────────────────────────┐
│           Client              │
│  Back-Office (4200)           │
│  Front-Office (4201)          │
└─────────────┬─────────────────┘
              │ HTTP/REST
              ▼
┌───────────────────────────────┐
│        API Gateway            │
│          Port 8085            │
│  - Routes requests            │
│  - Auth / Logging / Proxy     │
└─────────────┬─────────────────┘
              │ Forward requests
              ▼
┌───────────────────────────────┐
│           Backend             │
│          Port 8087            │
│ ┌─ Controllers ────────────┐ │
│ │ EvaluationController      │ │
│ │ AnswerController          │ │
│ │ NoteController            │ │
│ │ FileUploadController      │ │
│ └───────────────────────────┘ │
│ ┌─ Services ───────────────┐ │
│ │ EvaluationService         │ │
│ │ AnswerService             │ │
│ │ NoteService               │ │
│ │ AutomaticScoringService ⭐ │ │
│ │ EvaluationScheduler       │ │
│ └───────────────────────────┘ │
│ ┌─ Repositories ────────────┐ │
│ │ EvaluationRepo            │ │
│ │ AnswerRepo                │ │
│ │ NoteRepo                  │ │
│ └───────────────────────────┘ │
└─────────────┬─────────────────┘
              │ JPA/Hibernate
              ▼
┌───────────────────────────────┐
│           MySQL DB            │
│  - evaluation                 │
│  - answer                     │
│  - note                       │
└───────────────────────────────┘

### Data Flow - Automatic Scoring

```
1. Teacher Creates Evaluation
   ├─ Enters questions: ["Q1", "Q2", "Q3"]
   ├─ Enters correct answers: ["A1", "A2", "A3"]
   └─ Saves as JSON: {"questions":["A1","A2","A3"]}

2. Student Takes Evaluation
   ├─ Answers questions: ["A1", "Wrong", "A3"]
   └─ Submits as JSON: {"questions":["A1","Wrong","A3"]}

3. Backend Processes
   ├─ AutomaticScoringService.scoreAnswer()
   │   ├─ Parse student answers
   │   ├─ Parse correct answers
   │   ├─ Compare (normalized, case-insensitive)
   │   ├─ Calculate proportional score: 2/3 = 66.67%
   │   └─ Return ScoreResponseDTO
   ├─ Create Note entity with score
   └─ Return score to frontend

4. Frontend Displays
   └─ Show beautiful score popup with breakdown
```

### Project Structure

```
project-root/
├── jasser/demo/                          # Backend (Spring Boot)
│   ├── src/main/java/com/esprit/demo/
│   │   ├── entity/                       # JPA Entities
│   │   │   ├── Evaluation.java
│   │   │   ├── Answer.java
│   │   │   ├── Note.java
│   │   │   └── AutomaticScoringService.java
│   │   ├── controllers/                  # REST Controllers
│   │   │   ├── EvaluationController.java
│   │   │   ├── AnswerController.java
│   │   │   └── NoteController.java
│   │   ├── service/                      # Business Logic
│   │   │   ├── EvaluationServiceImp.java
│   │   │   ├── AnswerService.java
│   │   │   ├── NoteService.java
│   │   │   └── EvaluationSchedulerService.java
│   │   ├── repository/                   # Data Access
│   │   │   ├── EvaluationRepo.java
│   │   │   ├── AnswerRepo.java
│   │   │   └── NoteRepo.java
│   │   ├── dto/                          # Data Transfer Objects
│   │   │   ├── AnswerDTO.java
│   │   │   ├── ScoreResponseDTO.java
│   │   │   └── AnswerResponseDTO.java
│   │   └── config/                       # Configuration
│   │       ├── WebConfig.java
│   │       └── SchedulerConfig.java
│   └── pom.xml                           # Maven dependencies
│
├── pidev/angular-app/                    # Frontend (Angular)
│   ├── back-office/                      # Teacher Dashboard
│   │   └── src/app/
│   │       ├── pages/exam/
│   │       │   ├── exam.ts               # Evaluation creation
│   │       │   ├── exam.html             # UI with correct answers
│   │       │   └── exam.css
│   │       └── services/
│   │           └── evaluation-service.ts
│   │
│   └── frontend/angular-app/             # Student Portal
│       └── src/app/
│           ├── pages/exams/
│           │   ├── exams.ts              # Exam taking
│           │   ├── exams.html            # UI with score popup
│           │   └── exams.css
│           └── services/
│               ├── evaluation.service.ts
│               └── answer.service.ts
│
├── PROJECT_DOCUMENTATION.md              # Detailed documentation
└── README.md                             # This file
```

---

## 👥 Contributors

### Development Team

| Name | Role | Responsibilities |
|------|------|------------------|
| **Jasser** | Full-Stack Developer | Backend development, API design, database schema |
| **[Your Name]** | Frontend Developer | Angular components, UI/UX design, state management |
| **[Team Member]** | DevOps Engineer | Deployment, CI/CD, server configuration |

### Academic Supervision

- **Supervisor**: [Professor Name]
- **Institution**: ESPRIT (École Supérieure Privée d'Ingénierie et de Technologies)
- **Academic Year**: 2024-2025
- **Course**: [Course Name/Code]

---

## 🎓 Academic Context

### Project Information

- **Type**: Academic Project / End-of-Year Project
- **Institution**: ESPRIT
- **Department**: Computer Science / Software Engineering
- **Level**: [Year/Level]
- **Duration**: [Start Date] - [End Date]

### Learning Objectives

1. **Full-Stack Development**
   - Master Spring Boot backend development
   - Build modern Angular applications
   - Implement RESTful APIs

2. **Software Architecture**
   - Design scalable microservices
   - Implement design patterns (DTO, Service Layer, Repository)
   - Understand separation of concerns

3. **Database Management**
   - Design relational database schemas
   - Implement JPA/Hibernate ORM
   - Optimize queries and relationships

4. **DevOps Practices**
   - Version control with Git
   - Dependency management (Maven, npm)
   - Application deployment

5. **Problem Solving**
   - Implement automatic scoring algorithms
   - Handle real-time scheduling
   - Manage state in reactive applications

### Technologies Learned

- ✅ Spring Boot & Spring Cloud
- ✅ Angular 18 with Signals
- ✅ RESTful API design
- ✅ MySQL database design
- ✅ JSON data handling
- ✅ Reactive programming (RxJS)
- ✅ Tailwind CSS
- ✅ TypeScript

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)** 17 or higher
- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **MySQL** 8.0 or higher
- **Maven** (or use included Maven Wrapper)
- **Git** for version control

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-root
```

#### 2. Database Setup

```sql
-- Create database
CREATE DATABASE evaluation_db;

-- Use database
USE evaluation_db;

-- Tables will be auto-created by Spring Boot JPA
-- Or manually ensure correct_answers column exists:
ALTER TABLE evaluation 
ADD COLUMN correct_answers TEXT NULL;
```

#### 3. Backend Setup

```bash
# Navigate to backend directory
cd jasser/demo

# Install dependencies and build
.\mvnw.cmd clean install

# Run the application
.\mvnw.cmd spring-boot:run

# Backend will start on http://localhost:8087
```

**Configuration** (`application.properties`):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/evaluation_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
server.port=8087
```

#### 4. Back-Office Setup (Teacher Dashboard)

```bash
# Navigate to back-office directory
cd pidev/angular-app/back-office

# Install dependencies
npm install

# Run development server
npm start

# Back-office will start on http://localhost:4200
```

#### 5. Front-Office Setup (Student Portal)

```bash
# Navigate to front-office directory
cd pidev/angular-app/frontend/angular-app

# Install dependencies
npm install

# Run development server
npm start

# Front-office will start on http://localhost:4201
```

### Quick Test

1. **Create Evaluation** (Back-Office)
   - Open `http://localhost:4200`
   - Create new evaluation
   - Add questions: "What is 2+2?", "What is the capital of France?"
   - Enter correct answers: "4", "Paris"
   - Set weights: Grammar=10, Listening=5, Essay=5
   - Save

2. **Take Evaluation** (Front-Office)
   - Open `http://localhost:4201`
   - Select the evaluation
   - Answer questions
   - Submit and see instant score!

---

## 📖 Documentation

### Available Documentation

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete technical documentation
  - Detailed system architecture
  - API endpoints reference
  - Database schema
  - DTO explanation
  - Automatic scoring algorithm
  - Testing guide

### Key Concepts

#### Why We Use DTOs

**Data Transfer Objects (DTOs)** are used to:
- Prevent circular reference errors in JSON serialization
- Shape data for specific use cases
- Hide sensitive information
- Validate input data
- Version APIs independently

**Example:**
```java
// Without DTO (❌ Circular reference)
Answer → Evaluation → List<Answer> → Evaluation → ...

// With DTO (✅ Clean)
AnswerDTO → ScoreResponseDTO (no circular references)
```

#### Automatic Scoring Algorithm

```java
// Proportional scoring
correctCount = 0
for each question:
    if normalize(studentAnswer) == normalize(correctAnswer):
        correctCount++

score = (correctCount / totalQuestions) × sectionWeight

// Example: 2/3 correct = (2/3) × 10 = 6.67 points
```

#### Answer Normalization

```java
normalize(answer):
    - Trim whitespace: " Paris " → "Paris"
    - Convert to lowercase: "PARIS" → "paris"
    - Remove extra spaces: "H  2  O" → "h 2 o"
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:8087/evaluation
```

### Key Endpoints

#### Evaluations

```http
GET    /eval/all                    # Get all evaluations
GET    /eval/all/{id}               # Get evaluation by ID
POST   /eval/add                    # Create evaluation
PUT    /eval/update                 # Update evaluation
DELETE /eval/delete/{id}            # Delete evaluation
POST   /eval/close/{id}             # Close evaluation manually
GET    /eval/scheduler/stats        # Get scheduler statistics
```

#### Answers (with Automatic Scoring)

```http
POST   /answer/add                  # Submit answer + get score
PUT    /answer/update               # Update answer
GET    /answer/all                  # Get all answers
GET    /answer/all/{id}             # Get answer by ID
DELETE /answer/delete/{id}          # Delete answer
```

**Submit Answer Example:**
```json
POST /answer/add
{
  "answer": "{\"questions\":[\"4\",\"Paris\",\"Water\"]}",
  "idEval": 1
}

Response:
{
  "answerId": 1,
  "totalScore": 6.67,
  "grammarScore": 6.67,
  "listeningScore": 0.0,
  "essayScore": 0.0,
  "message": "Score calculated successfully"
}
```

---

## 🧪 Testing

### Manual Testing

1. **Create Evaluation with Correct Answers**
   ```
   Questions: ["What is 2+2?", "What is the capital of France?"]
   Correct Answers: ["4", "Paris"]
   ```

2. **Test Scenarios**
   - All correct: Expected 10/10
   - One wrong: Expected 5/10
   - All wrong: Expected 0/10
   - Case insensitive: "paris" = "Paris" ✅

3. **Verify Database**
   ```sql
   SELECT id_eval, title, correct_answers 
   FROM evaluation 
   WHERE id_eval = 1;
   ```

### Automated Testing

```bash
# Backend tests
cd jasser/demo
.\mvnw.cmd test

# Frontend tests
cd pidev/angular-app/back-office
npm test
```

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check if port 8087 is in use
netstat -ano | findstr :8087

# Kill process if needed
taskkill /PID <process_id> /F
```

#### Database connection error
- Verify MySQL is running
- Check credentials in `application.properties`
- Ensure database `evaluation_db` exists

#### Frontend compilation errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Score always shows 20/20
- Check if correct answers are saved in database
- Verify `correct_answers` column exists
- Create NEW evaluation (old ones may not have correct answers)

---

## 📝 License

This project is developed for academic purposes at ESPRIT.

**Academic Use Only** - Not for commercial distribution.

---

## 🙏 Acknowledgments

- **ESPRIT** for providing the academic framework
- **Spring Boot Team** for the excellent framework
- **Angular Team** for the modern frontend framework
- **Stack Overflow Community** for troubleshooting help
- **Open Source Contributors** for the libraries used

---

## 📧 Contact

For questions or support:

- **Email**: [your.email@esprit.tn]
- **GitHub**: [your-github-username]
- **LinkedIn**: [your-linkedin-profile]

---

<div align="center">

**Made by ESPRIT Students**

⭐ Star this repo if you found it helpful!

</div>
