# Challenge Frontend - Complete Testing Guide

## ✅ What We've Built

### Frontend Pages Created:
1. **Challenges Browser** (`/challenges`) - Browse all available challenges
2. **Challenge Detail** (`/challenge/:id`) - Take the challenge quiz
3. **Challenge Result** (`/challenge-result/:id`) - View results and explanations

### Features:
- Browse challenges with filters (level, type, search)
- Take challenges with timer support
- Multiple question types (Multiple Choice, True/False, Fill in Blank, Open Ended)
- Real-time progress tracking
- Question navigation
- Auto-submit when time runs out
- Detailed results with explanations
- Retry functionality

---

## 🚀 Step-by-Step Testing

### Step 1: Start All Services

#### 1.1 Start Eureka Discovery Server
```bash
# In IntelliJ, run:
# EurekaServerApplication.java (port 8761)
```

#### 1.2 Start Challenge Service
```bash
# In IntelliJ, run:
# ChallengeService/src/main/java/tn/esprit/challenge/ChallengeApplication.java
# Should start on port 8086
```

#### 1.3 Start API Gateway
```bash
# In IntelliJ, run:
# ApiGateway/src/main/java/tn/esprit/gateway/ApiGatewayApplication.java
# Should start on port 8888
```

#### 1.4 Verify Services in Eureka
Open: `http://localhost:8761`
You should see:
- CHALLENGE-SERVICE (1 instance)
- API-GATEWAY (1 instance)

---

### Step 2: Create Sample Challenges

Use Postman or curl to create test challenges:

#### Sample Challenge 1: Vocabulary (A1 Level)
```bash
POST http://localhost:8888/challenge-service/api/challenges
Content-Type: application/json

{
  "title": "Basic English Vocabulary",
  "description": "Test your knowledge of common English words",
  "type": "VOCABULARY",
  "skillFocus": "VOCABULARY",
  "level": "A1",
  "category": "Beginner Words",
  "points": 20,
  "timeLimit": 5,
  "isPublic": true,
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "What is the opposite of 'hot'?",
      "options": ["Cold", "Warm", "Cool", "Freezing"],
      "correctAnswer": "Cold",
      "explanation": "The opposite of hot is cold. Warm and cool are in between.",
      "points": 5,
      "orderIndex": 0
    },
    {
      "type": "FILL_BLANK",
      "questionText": "I ___ a student. (am/is/are)",
      "correctAnswer": "am",
      "acceptableAnswers": ["am", "AM", "'m"],
      "explanation": "Use 'am' with 'I'. Example: I am a student.",
      "points": 5,
      "orderIndex": 1
    },
    {
      "type": "TRUE_FALSE",
      "questionText": "The word 'cat' is a noun.",
      "correctAnswer": "True",
      "explanation": "Yes, 'cat' is a noun because it names an animal.",
      "points": 5,
      "orderIndex": 2
    },
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "How do you say 'hello' in a formal way?",
      "options": ["Hi", "Hey", "Good morning", "Yo"],
      "correctAnswer": "Good morning",
      "explanation": "Good morning/afternoon/evening are formal greetings.",
      "points": 5,
      "orderIndex": 3
    }
  ]
}
```

#### Sample Challenge 2: Grammar (B1 Level)
```bash
POST http://localhost:8888/challenge-service/api/challenges
Content-Type: application/json

{
  "title": "Present Perfect Tense",
  "description": "Master the present perfect tense",
  "type": "GRAMMAR",
  "skillFocus": "GRAMMAR",
  "level": "B1",
  "category": "Verb Tenses",
  "points": 50,
  "timeLimit": 10,
  "isPublic": true,
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "I ___ to Paris three times.",
      "options": ["have been", "was", "am", "have go"],
      "correctAnswer": "have been",
      "explanation": "Use 'have been' for experiences up to now.",
      "points": 10,
      "orderIndex": 0
    },
    {
      "type": "FILL_BLANK",
      "questionText": "She ___ (finish) her homework already.",
      "correctAnswer": "has finished",
      "acceptableAnswers": ["has finished", "finished"],
      "explanation": "Use 'has finished' with 'already' for completed actions.",
      "points": 10,
      "orderIndex": 1
    },
    {
      "type": "TRUE_FALSE",
      "questionText": "Present perfect uses 'have/has + past participle'.",
      "correctAnswer": "True",
      "explanation": "Correct! Present perfect = have/has + past participle.",
      "points": 10,
      "orderIndex": 2
    },
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "They ___ each other since 2010.",
      "options": ["have known", "know", "knew", "are knowing"],
      "correctAnswer": "have known",
      "explanation": "Use present perfect with 'since' for duration from past to now.",
      "points": 10,
      "orderIndex": 3
    },
    {
      "type": "OPEN_ENDED",
      "questionText": "Write a sentence using present perfect with 'just'.",
      "correctAnswer": "I have just finished my work.",
      "explanation": "Example: I have just finished. 'Just' goes between have/has and past participle.",
      "points": 10,
      "orderIndex": 4
    }
  ]
}
```

#### Sample Challenge 3: Reading (C1 Level)
```bash
POST http://localhost:8888/challenge-service/api/challenges
Content-Type: application/json

{
  "title": "Advanced Reading Comprehension",
  "description": "Analyze complex texts and infer meaning",
  "type": "READING",
  "skillFocus": "READING",
  "level": "C1",
  "category": "Critical Reading",
  "points": 200,
  "timeLimit": 20,
  "isPublic": true,
  "content": "Climate change represents one of the most pressing challenges of our time. While scientific consensus is clear, public discourse remains fragmented. The complexity of climate systems, coupled with economic and political considerations, creates a multifaceted problem requiring interdisciplinary solutions.",
  "questions": [
    {
      "type": "MULTIPLE_CHOICE",
      "questionText": "What is the main idea of the passage?",
      "options": [
        "Climate change is simple to solve",
        "Climate change is a complex, multifaceted challenge",
        "Scientists disagree about climate change",
        "Economic factors are irrelevant"
      ],
      "correctAnswer": "Climate change is a complex, multifaceted challenge",
      "explanation": "The passage emphasizes complexity and the need for interdisciplinary solutions.",
      "points": 50,
      "orderIndex": 0
    },
    {
      "type": "FILL_BLANK",
      "questionText": "The passage suggests that public discourse is ___.",
      "correctAnswer": "fragmented",
      "acceptableAnswers": ["fragmented", "divided", "split"],
      "explanation": "The text explicitly states 'public discourse remains fragmented'.",
      "points": 50,
      "orderIndex": 1
    },
    {
      "type": "TRUE_FALSE",
      "questionText": "According to the passage, there is scientific consensus on climate change.",
      "correctAnswer": "True",
      "explanation": "The passage states 'scientific consensus is clear'.",
      "points": 50,
      "orderIndex": 2
    },
    {
      "type": "OPEN_ENDED",
      "questionText": "What does 'interdisciplinary solutions' mean in this context?",
      "correctAnswer": "Solutions that involve multiple fields of study",
      "explanation": "Interdisciplinary means combining different academic disciplines or fields.",
      "points": 50,
      "orderIndex": 3
    }
  ]
}
```

---

### Step 3: Start Frontend

```bash
cd frontend/angular-app
npm start
```

Frontend should start on `http://localhost:4200`

---

### Step 4: Test the Complete Flow

#### 4.1 Browse Challenges
1. Go to `http://localhost:4200/challenges`
2. You should see 3 challenges created above
3. Test filters:
   - Select "A1" level → Should show only Vocabulary challenge
   - Select "Grammar" type → Should show only Grammar challenge
   - Search "reading" → Should show only Reading challenge
   - Clear filters → Should show all 3

#### 4.2 Take a Challenge
1. Click "Start Challenge" on "Basic English Vocabulary"
2. You should see:
   - Timer counting down (5 minutes)
   - Progress bar (0/4 answered)
   - Question navigation buttons (1, 2, 3, 4)
   - First question displayed

3. Answer questions:
   - Question 1: Select "Cold"
   - Click "Next"
   - Question 2: Type "am"
   - Click "Next"
   - Question 3: Select "True"
   - Click "Next"
   - Question 4: Select "Good morning"

4. Check progress:
   - Progress bar should show 100%
   - All navigation buttons should be green
   - "Submit Challenge" button should be enabled

5. Click "Submit Challenge"

#### 4.3 View Results
1. You should be redirected to results page
2. You should see:
   - 🎉 "Passed!" (if you got 70%+ correct)
   - Score: 20 points (if all correct)
   - Accuracy: 100%
   - Correct: 4/4
   - Time taken

3. Scroll down to "Question Review"
4. Each question shows:
   - ✅ or ❌ icon
   - Your answer
   - Correct answer (if wrong)
   - Points earned
   - Explanation (toggle on/off)

5. Test buttons:
   - Click "Try Again" → Should go back to challenge
   - Click "Back to Challenges" → Should go to challenges list

---

### Step 5: Test Edge Cases

#### 5.1 Test Timer
1. Start "Basic English Vocabulary" (5 min timer)
2. Wait for timer to reach 0
3. Challenge should auto-submit

#### 5.2 Test Incomplete Submission
1. Start a challenge
2. Answer only 2 out of 4 questions
3. Try to click "Submit Challenge"
4. Button should be disabled
5. Message should say "Please answer all questions"

#### 5.3 Test Navigation
1. Start a challenge
2. Answer question 1
3. Click question 3 button (skip question 2)
4. Answer question 3
5. Click question 2 button (go back)
6. Answer question 2
7. All should work smoothly

#### 5.4 Test Different Question Types
1. Multiple Choice: Click radio button
2. True/False: Click True or False
3. Fill in Blank: Type answer
4. Open Ended: Type paragraph

---

### Step 6: Test Back-Office

1. Go to `http://localhost:4201` (back-office)
2. Login as admin
3. Click "Challenges" in sidebar
4. You should see all 3 challenges
5. Test CRUD operations:
   - Create new challenge
   - Edit existing challenge
   - Delete challenge
   - View submissions (coming soon)

---

## 🎯 Expected Results

### Passing Criteria:
- 70%+ correct = PASSED (green)
- 50-69% correct = PARTIAL (yellow)
- <50% correct = FAILED (red)

### Points Calculation:
- Base points = sum of correct answers
- Hints penalty = -5 points per hint
- Final score = max(0, base - hints)

### Example Scores:
- 4/4 correct, no hints = 20 points (100%)
- 3/4 correct, no hints = 15 points (75%)
- 2/4 correct, no hints = 10 points (50%)
- 4/4 correct, 2 hints = 10 points (100% but -10 for hints)

---

## 🐛 Troubleshooting

### Challenge Service Not Starting
```bash
# Check if port 8086 is available
netstat -ano | findstr :8086

# Check MySQL connection
# Database: challenge_db
# User: root
# Password: (your MySQL password)
```

### API Gateway Not Routing
```bash
# Check Eureka dashboard
http://localhost:8761

# Verify CHALLENGE-SERVICE is registered
# Restart API Gateway if needed
```

### Frontend Not Loading Challenges
```bash
# Check browser console for errors
# Verify API Gateway is running on 8888
# Test direct API call:
curl http://localhost:8888/challenge-service/api/challenges
```

### CORS Errors
```bash
# Verify CorsConfig.java in API Gateway
# Should allow http://localhost:4200
# Restart API Gateway after changes
```

---

## 📊 Testing Checklist

- [ ] All services start successfully
- [ ] Challenges appear in browser
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] Can start a challenge
- [ ] Timer counts down
- [ ] Can answer all question types
- [ ] Progress bar updates
- [ ] Question navigation works
- [ ] Submit button enables when complete
- [ ] Results page shows correct data
- [ ] Explanations toggle works
- [ ] Retry button works
- [ ] Back button works
- [ ] Auto-submit on timer expiry
- [ ] Back-office CRUD works

---

## 🎉 Success Indicators

If everything works, you should be able to:
1. Browse challenges by level and type
2. Take a timed challenge
3. Answer different question types
4. Submit and see results
5. View explanations for each question
6. Retry the challenge
7. Create/edit challenges in back-office

---

## 📝 Next Steps

After testing, you can:
1. Add more challenges via back-office
2. Create user progress dashboard
3. Add badges and achievements
4. Add leaderboards
5. Add challenge recommendations
6. Add social features (share results)

---

## 🚀 Quick Test Commands

```bash
# Start all services (run in separate terminals)
# Terminal 1: Eureka
cd EurekaServer && mvn spring-boot:run

# Terminal 2: Challenge Service
cd ChallengeService && mvn spring-boot:run

# Terminal 3: API Gateway
cd ApiGateway && mvn spring-boot:run

# Terminal 4: Frontend
cd frontend/angular-app && npm start

# Terminal 5: Back-Office
cd back-office && npm start
```

---

## ✅ You're All Set!

The Challenge microservice is now fully integrated with your English e-learning platform. Users can browse, take, and review challenges while admins can manage them through the back-office.

Happy testing! 🎓
