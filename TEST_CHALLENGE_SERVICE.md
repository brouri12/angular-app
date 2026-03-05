# Test Challenge Service - Step by Step Guide

## ✅ Backend Complete!

We've created:
- ✅ 5 Enums
- ✅ 4 Entities
- ✅ 4 Repositories
- ✅ 6 DTOs
- ✅ 2 Mappers
- ✅ 2 Services (with auto-grading logic!)
- ✅ 2 Controllers

**Total: 25 Java files created!**

---

## 🚀 Step 1: Start the Service (5 minutes)

### 1.1 Open in IntelliJ
1. Open IntelliJ IDEA
2. File → Open → Select `ChallengeService` folder
3. Wait for Maven to download dependencies

### 1.2 Start MySQL
Make sure MySQL is running on port 3307

### 1.3 Run the Application
1. Find `ChallengeApplication.java`
2. Right-click → Run 'ChallengeApplication'
3. Wait for "Started ChallengeApplication" message

### 1.4 Verify
Check console for:
```
Tomcat started on port(s): 8086
Started ChallengeApplication
```

Check database:
- Database `challenge_db` should be created
- Tables: `challenges`, `questions`, `submissions`, `hints`, etc.

---

## 🧪 Step 2: Test with Postman (10 minutes)

### 2.1 Create a Challenge

**POST** `http://localhost:8086/api/challenges`

**Headers:**
```
Content-Type: application/json
```

**Body:** (Use the content from `TEST_SAMPLE_DATA.json`)

**Expected Response:** 201 Created with challenge data

### 2.2 Get All Challenges

**GET** `http://localhost:8086/api/challenges`

**Expected Response:** Array of challenges

### 2.3 Get Challenge by ID

**GET** `http://localhost:8086/api/challenges/1`

**Expected Response:** Challenge details (without answers)

### 2.4 Submit Answers

**POST** `http://localhost:8086/api/submissions`

**Body:**
```json
{
  "challengeId": 1,
  "userId": 1,
  "answers": {
    "1": "Good morning",
    "2": "I'm fine, thank you",
    "3": "meet"
  },
  "completionTime": 120,
  "hintsUsed": 0
}
```

**Expected Response:** 
- Score: 30/30
- Status: PASSED
- Feedback: "Excellent work!"
- Question results with explanations

### 2.5 Get Submission Results

**GET** `http://localhost:8086/api/submissions/1`

**Expected Response:** Detailed submission with all answers and explanations

### 2.6 Get User's Total Score

**GET** `http://localhost:8086/api/submissions/user/1/total-score`

**Expected Response:** Total points earned

---

## 📊 Step 3: Verify Database (5 minutes)

Open MySQL Workbench or phpMyAdmin:

```sql
-- Check challenges
SELECT * FROM challenges;

-- Check questions
SELECT * FROM questions;

-- Check submissions
SELECT * FROM submissions;

-- Check submission answers
SELECT * FROM submission_answers;
```

---

## 🎯 Step 4: Test Different Scenarios

### Scenario 1: Perfect Score
Submit all correct answers → Should get PASSED status

### Scenario 2: Partial Score
Submit some wrong answers → Should get PARTIAL or FAILED status

### Scenario 3: With Hints
Submit with `hintsUsed: 2` → Score should be reduced by 10 points

### Scenario 4: Empty Answers
Submit empty answers → Should get 0 score

---

## 🔧 Step 5: Add to API Gateway (5 minutes)

Update `ApiGateway/src/main/resources/application.properties`:

```properties
# Challenge Service Route
spring.cloud.gateway.routes[3].id=challenge-service
spring.cloud.gateway.routes[3].uri=lb://challenge-service
spring.cloud.gateway.routes[3].predicates[0]=Path=/challenge-service/**
spring.cloud.gateway.routes[3].filters[0]=StripPrefix=1
```

Restart API Gateway.

Test via Gateway:
```
GET http://localhost:8888/challenge-service/api/challenges
POST http://localhost:8888/challenge-service/api/submissions
```

---

## ✅ Success Criteria

- [ ] Service starts without errors
- [ ] Database tables created
- [ ] Can create a challenge
- [ ] Can get challenges
- [ ] Can submit answers
- [ ] Auto-grading works correctly
- [ ] Scores calculated properly
- [ ] Feedback generated
- [ ] API Gateway routes work

---

## 🐛 Troubleshooting

### Service won't start
- Check MySQL is running
- Check port 8086 is not in use
- Check Maven dependencies downloaded

### Database not created
- Check MySQL credentials in application.properties
- Check MySQL user has CREATE DATABASE permission

### 404 Not Found
- Check service is registered with Eureka
- Check API Gateway routes configured
- Check URL is correct

---

## 📝 Sample Test Data

I've created `TEST_SAMPLE_DATA.json` with a complete challenge you can use for testing.

---

## 🎉 Next Steps

Once backend testing is complete:
1. Create Angular frontend pages
2. Integrate with your theme
3. Add navigation
4. End-to-end testing

---

**Current Status**: Backend complete and ready to test! 🚀

Start the service and let me know if you encounter any issues!
