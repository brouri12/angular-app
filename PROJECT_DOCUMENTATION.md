# 📚 English Proficiency Evaluation System - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Key Features](#key-features)
4. [Automatic Scoring System](#automatic-scoring-system)
5. [Why We Use DTOs](#why-we-use-dtos)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [How to Run](#how-to-run)
10. [Testing Guide](#testing-guide)

---

## 📖 Project Overview

This is a comprehensive English proficiency evaluation system that allows teachers to create exams and students to take them online. The system features automatic scoring, scheduled evaluation closing, file uploads (audio for listening sections), and real-time score calculation.

### Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.3.0
- Spring Cloud 2023.0.2
- MySQL Database
- Maven

**Frontend:**
- Angular 18
- TypeScript
- Tailwind CSS
- Two separate applications:
  - Back-Office (Admin/Teacher panel) - Port 4200
  - Front-Office (Student portal) - Port 4201

**Backend Port:** 8087

---

## 🏗️ System Architecture

### Backend Structure
```
jasser/demo/src/main/java/com/esprit/demo/
├── entity/                          # Domain models (JPA entities)
│   ├── Evaluation.java              # Exam definition with questions and correct answers
│   ├── Answer.java                  # Student answers
│   ├── Note.java                    # Calculated scores
│   ├── Question.java                # Question entity (optional)
│   ├── QuestionSection.java         # Enum: GRAMMAR, LISTENING, ESSAY
│   ├── EvaluationStatus.java        # Enum: OPEN, CLOSED
│   └── AutomaticScoringService.java # Scoring logic
├── controllers/                     # REST API endpoints
│   ├── EvaluationController.java    # CRUD for evaluations
│   ├── AnswerController.java        # Answer submission + scoring
│   ├── NoteController.java          # Score management
│   └── FileUploadController.java    # File uploads (audio, etc.)
├── service/                         # Business logic
│   ├── EvaluationServiceImp.java    # Evaluation operations
│   ├── AnswerService.java           # Answer operations
│   ├── NoteService.java             # Note operations
│   └── EvaluationSchedulerService.java # Auto-close scheduling
├── repository/                      # Data access layer
│   ├── EvaluationRepo.java
│   ├── AnswerRepo.java
│   └── NoteRepo.java
├── dto/                             # Data Transfer Objects
│   ├── AnswerDTO.java               # Request: Submit answer
│   ├── AnswerResponseDTO.java       # Response: Answer data
│   ├── ScoreResponseDTO.java        # Response: Score breakdown
│   ├── SectionScoreDTO.java         # Score per section
│   └── EvaluationResultDTO.java     # Evaluation results
└── config/                          # Configuration
    ├── WebConfig.java               # CORS configuration
    └── SchedulerConfig.java         # Task scheduler setup
```

### Frontend Structure
```
pidev/angular-app/
├── back-office/                     # Teacher/Admin panel
│   └── src/app/
│       ├── pages/exam/
│       │   ├── exam.ts              # Evaluation creation logic
│       │   ├── exam.html            # Evaluation form UI
│       │   └── exam.css             # Styles
│       └── services/
│           └── evaluation-service.ts # API calls
└── frontend/angular-app/            # Student portal
    └── src/app/
        ├── pages/exams/
        │   ├── exams.ts             # Exam taking logic
        │   ├── exams.html           # Exam UI + score popup
        │   └── exams.css            # Styles
        └── services/
            ├── evaluation.service.ts # Evaluation API
            └── answer.service.ts     # Answer submission API
```

---

## 🎯 Key Features

### 1. Evaluation Management
- Create, read, update, delete evaluations
- Three sections: Grammar Questions, Listening Section, Essay Section
- Configurable scoring weights (default: Grammar=10, Listening=5, Essay=5)
- File upload support (audio files for listening section)
- Status management (OPEN/CLOSED)

### 2. Automatic Scheduling
- Set deadline for automatic evaluation closing
- Background scheduler monitors deadlines
- Automatically closes evaluations when deadline is reached
- Thread-safe implementation using ConcurrentHashMap

### 3. Automatic Scoring System ⭐
- Teachers define correct answers for each question
- System automatically compares student answers with correct answers
- Proportional scoring (e.g., 2/3 correct = 66.67% of section weight)
- Case-insensitive and whitespace-normalized comparison
- Instant score calculation and display
- Automatic Note (grade) creation

### 4. Real-Time Feedback
- Students see scores immediately after submission
- Score popup with breakdown by section
- Visual indicators (trophy icon, percentage, color-coded sections)

---

## 🎓 Automatic Scoring System (Detailed)

### How It Works

#### Step 1: Teacher Creates Evaluation with Correct Answers

**Back-Office UI:**
```
┌─────────────────────────────────────────────────────┐
│ Questions:                                          │
│ 1. What is 2+2?                                     │
│ 2. What is the capital of France?                  │
│ 3. What is H2O?                                     │
├─────────────────────────────────────────────────────┤
│ ✓ Correct Answers (For Automatic Scoring)          │
│ ✓ 3 answers entered                                 │
│                                                     │
│ 1. [4                                          ]    │
│ 2. [Paris                                      ]    │
│ 3. [Water                                      ]    │
└─────────────────────────────────────────────────────┘
```

**Data Stored in Database:**
```json
{
  "question": "[\"What is 2+2?\",\"What is the capital of France?\",\"What is H2O?\"]",
  "correctAnswers": "{\"questions\":[\"4\",\"Paris\",\"Water\"]}"
}
```

#### Step 2: Student Takes Evaluation

**Front-Office UI:**
```
┌─────────────────────────────────────────────────────┐
│ Question 1: What is 2+2?                            │
│ Answer: [4                                     ]    │
│                                                     │
│ Question 2: What is the capital of France?         │
│ Answer: [London                                ]    │
│                                                     │
│ Question 3: What is H2O?                           │
│ Answer: [Water                                 ]    │
│                                                     │
│ [Submit Answers]                                    │
└─────────────────────────────────────────────────────┘
```

**Data Sent to Backend:**
```json
{
  "answer": "{\"questions\":[\"4\",\"London\",\"Water\"]}",
  "idEval": 1
}
```

#### Step 3: Backend Calculates Score

**File:** `AutomaticScoringService.java`

```java
public ScoreResponseDTO scoreAnswer(Answer answer) {
    Evaluation evaluation = answer.getEval();
    
    // Get weights
    Double grammarWeight = evaluation.getGrammarWeight(); // 10.0
    
    // Parse JSONs
    JSONObject studentAnswers = new JSONObject(answer.getAnswer());
    JSONObject correctAnswers = new JSONObject(evaluation.getCorrectAnswers());
    
    // Score each section
    double grammarScore = scoreSection(
        studentAnswers.getJSONArray("questions"),  // ["4", "London", "Water"]
        correctAnswers.getJSONArray("questions"),  // ["4", "Paris", "Water"]
        grammarWeight                              // 10.0
    );
    
    return new ScoreResponseDTO(totalScore, grammarScore, listeningScore, essayScore);
}

private double scoreSection(JSONArray studentAnswers, JSONArray correctAnswers, double weight) {
    int correctCount = 0;
    int totalQuestions = correctAnswers.length(); // 3
    
    for (int i = 0; i < totalQuestions; i++) {
        String student = normalize(studentAnswers.getString(i));
        String correct = normalize(correctAnswers.getString(i));
        
        if (student.equals(correct)) {
            correctCount++;
        }
    }
    
    // Proportional scoring
    // Example: 2/3 correct = (2/3) * 10 = 6.67 points
    return ((double) correctCount / totalQuestions) * weight;
}

private String normalize(String answer) {
    // "Paris" → "paris"
    // " WATER " → "water"
    // "H  2  O" → "h 2 o"
    return answer.trim().toLowerCase().replaceAll("\\s+", " ");
}
```

**Scoring Calculation:**
```
Question 1: "4" == "4" → ✅ CORRECT
Question 2: "london" == "paris" → ❌ INCORRECT
Question 3: "water" == "water" → ✅ CORRECT

Correct Count: 2 out of 3
Score: (2 / 3) × 10 = 6.67 points
```

#### Step 4: Create Note (Grade) Automatically

**File:** `AnswerController.java`

```java
@PostMapping("/add")
public ResponseEntity<ScoreResponseDTO> addAnswer(@RequestBody AnswerDTO answerDTO) {
    // 1. Save answer
    Answer savedAnswer = answerService.addAnswer(answer);
    
    // 2. Calculate score
    ScoreResponseDTO scoreResponse = scoringService.scoreAnswer(savedAnswer);
    
    // 3. Create note (grade)
    Note note = new Note();
    note.setValue(scoreResponse.getTotalScore()); // 6.67
    note.setAnswer(savedAnswer);
    note.setEvaluation(savedAnswer.getEval());
    noteService.addNote(note);
    
    // 4. Return score to frontend
    return ResponseEntity.ok(scoreResponse);
}
```

#### Step 5: Display Score to Student

**Front-Office Score Popup:**
```
┌─────────────────────────────────────────────────────┐
│                  🏆 Your Score                      │
│                                                     │
│                   6.67 / 20                         │
│                     33%                             │
├─────────────────────────────────────────────────────┤
│ Grammar Questions:      6.67 / 10.0                 │
│ Listening Section:      0.0 / 5.0                   │
│ Essay Section:          0.0 / 5.0 (Manual Grading)  │
├─────────────────────────────────────────────────────┤
│            [Back to Evaluations]                    │
└─────────────────────────────────────────────────────┘
```

### Scoring Examples

#### Example 1: All Correct
```
Questions: 3
Correct Answers: ["4", "Paris", "Water"]
Student Answers: ["4", "Paris", "Water"]
Result: 3/3 correct = 100% × 10 = 10.0 points
```

#### Example 2: Partial Correct
```
Questions: 3
Correct Answers: ["4", "Paris", "Water"]
Student Answers: ["4", "London", "Water"]
Result: 2/3 correct = 66.67% × 10 = 6.67 points
```

#### Example 3: All Wrong
```
Questions: 3
Correct Answers: ["4", "Paris", "Water"]
Student Answers: ["5", "London", "H2O"]
Result: 0/3 correct = 0% × 10 = 0.0 points
```

#### Example 4: Case Insensitive
```
Correct Answer: "Paris"
Student Answer: "paris" → ✅ CORRECT (normalized)
Student Answer: "PARIS" → ✅ CORRECT (normalized)
Student Answer: " Paris " → ✅ CORRECT (trimmed)
```

### Backward Compatibility

If an evaluation doesn't have correct answers defined (old evaluations), the system awards full points for completion:

```java
if (correctAnswerJson == null || correctAnswerJson.trim().isEmpty()) {
    // Backward compatibility mode
    grammarScore = grammarWeight;    // Full points
    listeningScore = listeningWeight; // Full points
    essayScore = essayWeight;         // Full points
}
```

---

## 🎯 Why We Use DTOs (Data Transfer Objects)

### What is a DTO?

A DTO is a simple object that carries data between processes. It's a design pattern used to transfer data between the frontend and backend without exposing the internal structure of domain entities.

### Problem Without DTOs

**Scenario:** Student submits an answer

**Without DTO (using Entity directly):**
```java
@PostMapping("/add")
public Answer addAnswer(@RequestBody Answer answer) {
    return answerService.addAnswer(answer);
}
```

**Problems:**
1. **Circular Reference:** Answer → Evaluation → List<Answer> → Evaluation → ...
   - Results in infinite JSON serialization loop
   - Error: `StackOverflowError` or `JsonMappingException`

2. **Over-fetching:** Entity includes ALL fields and relationships
   ```json
   {
     "idAnswer": 1,
     "answer": "{...}",
     "eval": {
       "idEval": 1,
       "title": "Test",
       "answers": [
         {
           "idAnswer": 1,
           "eval": { ... } // Circular!
         }
       ]
     }
   }
   ```

3. **Security Risk:** Exposes internal database structure
   - Client can see all entity relationships
   - Potential for SQL injection or data manipulation

4. **Tight Coupling:** Frontend depends on backend entity structure
   - If you change entity, frontend breaks
   - Hard to maintain and evolve

### Solution With DTOs

**Request DTO (AnswerDTO):**
```java
public class AnswerDTO {
    private String answer;      // Only what we need from client
    private Long idEval;        // Reference to evaluation
    private Long idAnswer;      // For updates
    
    // No circular references
    // No unnecessary fields
    // Clean and simple
}
```

**Response DTO (ScoreResponseDTO):**
```java
public class ScoreResponseDTO {
    private Long answerId;
    private Double totalScore;
    private Double grammarScore;
    private Double listeningScore;
    private Double essayScore;
    private String message;
    
    // Only what frontend needs
    // No entity relationships
    // No circular references
}
```

**Controller with DTOs:**
```java
@PostMapping("/add")
public ResponseEntity<ScoreResponseDTO> addAnswer(@RequestBody AnswerDTO answerDTO) {
    // 1. Convert DTO to Entity
    Answer answer = new Answer();
    answer.setAnswer(answerDTO.getAnswer());
    
    Evaluation evaluation = evaluationRepo.findById(answerDTO.getIdEval())
            .orElseThrow(() -> new RuntimeException("Evaluation not found"));
    answer.setEval(evaluation);
    
    // 2. Save entity
    Answer savedAnswer = answerService.addAnswer(answer);
    
    // 3. Calculate score
    ScoreResponseDTO scoreResponse = scoringService.scoreAnswer(savedAnswer);
    
    // 4. Return DTO (not entity)
    return ResponseEntity.ok(scoreResponse);
}
```

### Benefits of DTOs

#### 1. **Prevents Circular References**
```
Entity: Answer ↔ Evaluation ↔ Answer (infinite loop ❌)
DTO: AnswerDTO → ScoreResponseDTO (clean ✅)
```

#### 2. **Data Shaping**
Send only what's needed:
```json
// Without DTO (Entity)
{
  "idAnswer": 1,
  "answer": "{...}",
  "eval": { /* 50 fields */ },
  "notes": [ /* array */ ],
  "createdAt": "...",
  "updatedAt": "..."
}

// With DTO
{
  "answerId": 1,
  "totalScore": 6.67,
  "grammarScore": 6.67,
  "listeningScore": 0.0,
  "essayScore": 0.0
}
```

#### 3. **Versioning**
```java
// API v1
public class AnswerDTOv1 {
    private String answer;
}

// API v2 (add new field without breaking v1)
public class AnswerDTOv2 {
    private String answer;
    private String studentName; // New field
}
```

#### 4. **Validation**
```java
public class AnswerDTO {
    @NotNull(message = "Answer cannot be null")
    @Size(min = 1, message = "Answer cannot be empty")
    private String answer;
    
    @NotNull(message = "Evaluation ID is required")
    @Positive(message = "Evaluation ID must be positive")
    private Long idEval;
}
```

#### 5. **Security**
```java
// Entity (exposes everything)
public class User {
    private Long id;
    private String username;
    private String password;  // ❌ Exposed!
    private String email;
    private String role;
}

// DTO (only safe fields)
public class UserDTO {
    private Long id;
    private String username;
    // No password!
    private String email;
}
```

### DTOs in This Project

#### AnswerDTO (Request)
**Purpose:** Submit student answer
```java
{
    "answer": "{\"questions\":[\"4\",\"Paris\",\"Water\"]}",
    "idEval": 1
}
```

#### ScoreResponseDTO (Response)
**Purpose:** Return calculated score
```java
{
    "answerId": 1,
    "totalScore": 6.67,
    "grammarScore": 6.67,
    "listeningScore": 0.0,
    "essayScore": 0.0,
    "message": "Score calculated successfully"
}
```

#### AnswerResponseDTO (Response)
**Purpose:** Return answer data without circular references
```java
{
    "idAnswer": 1,
    "answer": "{...}",
    "idEval": 1  // Just the ID, not the whole object
}
```

### When to Use DTOs

✅ **Use DTOs when:**
- Communicating between frontend and backend (REST API)
- Data needs transformation or shaping
- Preventing circular references
- Validating input data
- Versioning APIs
- Security concerns (hiding sensitive data)

❌ **Don't use DTOs when:**
- Internal service-to-service communication (same application)
- Simple CRUD operations with no relationships
- Prototyping (can add later)

---

## 💾 Database Schema

### Evaluation Table
```sql
CREATE TABLE evaluation (
    id_eval BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(10),
    duration BIGINT,
    description TEXT,
    question TEXT,                    -- JSON array of questions
    file_path VARCHAR(500),
    listening_url VARCHAR(500),
    listening_questions TEXT,         -- JSON array
    essay_prompt TEXT,
    essay_min_words INT,
    essay_max_words INT,
    status VARCHAR(20) DEFAULT 'OPEN',
    deadline DATETIME,
    grammar_weight DOUBLE DEFAULT 10.0,
    listening_weight DOUBLE DEFAULT 5.0,
    essay_weight DOUBLE DEFAULT 5.0,
    correct_answers TEXT              -- JSON: {"questions":["a1","a2"],"listening":["l1","l2"]}
);
```

### Answer Table
```sql
CREATE TABLE answer (
    id_answer BIGINT PRIMARY KEY AUTO_INCREMENT,
    answer TEXT NOT NULL,             -- JSON: {"questions":["a1","a2"],"listening":["l1"],"essay":"text"}
    id_eval BIGINT,
    FOREIGN KEY (id_eval) REFERENCES evaluation(id_eval)
);
```

### Note Table
```sql
CREATE TABLE note (
    id_note BIGINT PRIMARY KEY AUTO_INCREMENT,
    value DOUBLE NOT NULL,            -- Calculated score
    section VARCHAR(50),              -- GRAMMAR, LISTENING, ESSAY
    id_answer BIGINT,
    id_eval BIGINT,
    FOREIGN KEY (id_answer) REFERENCES answer(id_answer),
    FOREIGN KEY (id_eval) REFERENCES evaluation(id_eval)
);
```

---

## 🔌 API Endpoints

### Evaluation Endpoints

#### Get All Evaluations
```
GET /evaluation/eval/all
Response: List<Evaluation>
```

#### Get Evaluation by ID
```
GET /evaluation/eval/all/{idEval}
Response: Evaluation
```

#### Create Evaluation
```
POST /evaluation/eval/add
Body: Evaluation
Response: Evaluation
```

#### Update Evaluation
```
PUT /evaluation/eval/update
Body: Evaluation
Response: Evaluation
```

#### Delete Evaluation
```
DELETE /evaluation/eval/delete/{idEval}
Response: void
```

#### Close Evaluation Manually
```
POST /evaluation/eval/close/{idEval}
Response: {"message": "Evaluation closed successfully"}
```

#### Cancel Scheduled Task
```
POST /evaluation/eval/cancel-schedule/{idEval}
Response: {"message": "Scheduled task cancelled"}
```

#### Get Scheduler Status
```
GET /evaluation/eval/scheduler/status/{idEval}
Response: {"isScheduled": true}
```

#### Get Scheduler Stats
```
GET /evaluation/eval/scheduler/stats
Response: {"scheduledTasksCount": 5}
```

### Answer Endpoints

#### Submit Answer (with Automatic Scoring)
```
POST /answer/add
Body: {
    "answer": "{\"questions\":[\"4\",\"Paris\",\"Water\"]}",
    "idEval": 1
}
Response: {
    "answerId": 1,
    "totalScore": 6.67,
    "grammarScore": 6.67,
    "listeningScore": 0.0,
    "essayScore": 0.0,
    "message": "Score calculated successfully"
}
```

#### Update Answer
```
PUT /answer/update
Body: AnswerDTO
Response: AnswerResponseDTO
```

#### Get All Answers
```
GET /answer/all
Response: List<AnswerResponseDTO>
```

#### Get Answer by ID
```
GET /answer/all/{idAnswer}
Response: AnswerResponseDTO
```

#### Delete Answer
```
DELETE /answer/delete/{idAnswer}
Response: void
```

#### Debug Evaluation (Check Correct Answers)
```
GET /answer/debug/evaluation/{idEval}
Response: {
    "idEval": 1,
    "title": "Test",
    "correctAnswers": "{\"questions\":[\"4\",\"Paris\",\"Water\"]}",
    "correctAnswersIsNull": false,
    "correctAnswersIsEmpty": false,
    "grammarWeight": 10.0,
    "listeningWeight": 5.0,
    "essayWeight": 5.0
}
```

### File Upload Endpoints

#### Upload File
```
POST /evaluation/eval/files/upload
Body: multipart/form-data (file)
Response: String (file URL)
```

---

## 🖥️ Frontend Components

### Back-Office (Teacher Panel)

#### Exam Component (`exam.ts` / `exam.html`)
**Features:**
- Create/edit evaluations
- Add questions (grammar, listening, essay)
- Enter correct answers for automatic scoring
- Upload audio files
- Set scoring weights
- Set deadline for auto-close
- Visual indicators (green badge when correct answers entered)
- Warning if publishing without correct answers

**Key Methods:**
- `addEvaluation()` - Create new evaluation
- `updateEvaluation()` - Update existing evaluation
- `updateCorrectAnswer(index, value)` - Update correct answer array
- `getCorrectAnswersCount()` - Count entered correct answers
- `publishExam()` - Validate and save evaluation

### Front-Office (Student Portal)

#### Exams Component (`exams.ts` / `exams.html`)
**Features:**
- View available evaluations
- Take exams with timer
- Submit answers
- See score popup immediately
- Score breakdown by section
- Auto-submit when timer expires

**Key Methods:**
- `submitAnswers()` - Submit student answers
- `showScorePopup()` - Display score modal
- `calculateTimeRemaining()` - Timer logic

---

## 🚀 How to Run

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

### Backend Setup
```bash
cd jasser/demo

# Install dependencies
.\mvnw.cmd clean install

# Run application
.\mvnw.cmd spring-boot:run

# Backend will start on http://localhost:8087
```

### Back-Office Setup
```bash
cd pidev/angular-app/back-office

# Install dependencies
npm install

# Run development server
npm start

# Back-office will start on http://localhost:4200
```

### Front-Office Setup
```bash
cd pidev/angular-app/frontend/angular-app

# Install dependencies
npm install

# Run development server
npm start

# Front-office will start on http://localhost:4201
```

### Database Setup
```sql
CREATE DATABASE evaluation_db;

-- Tables are auto-created by Spring Boot JPA
-- Or run this to ensure correct_answers column exists:
ALTER TABLE evaluation 
ADD COLUMN correct_answers TEXT NULL;
```

---

## 🧪 Testing Guide

### Test Automatic Scoring

#### Step 1: Create Evaluation
1. Open back-office: `http://localhost:4200`
2. Create evaluation:
   - Title: "Test Scoring"
   - Add 3 questions
   - Enter correct answers (watch for green badge "✓ 3 answers entered")
   - Set weights: Grammar=10, Listening=5, Essay=5
3. Save

#### Step 2: Verify Database
```sql
SELECT id_eval, title, correct_answers 
FROM evaluation 
WHERE title = 'Test Scoring';

-- Should show: {"questions":["answer1","answer2","answer3"]}
```

#### Step 3: Take Evaluation
1. Open front-office: `http://localhost:4201`
2. Take "Test Scoring"
3. Answer 2 out of 3 correctly
4. Submit

#### Step 4: Verify Score
- Expected: 6.67/20 (66.67% of 10 points)
- Check backend logs for scoring details
- Check database for Note record

---

## 📞 Support

For issues or questions, check:
- Backend logs: Console output
- Frontend console: Browser DevTools (F12)
- Database: MySQL Workbench

---

**Project completed with automatic scoring, scheduled closing, and real-time feedback!** 🎉
