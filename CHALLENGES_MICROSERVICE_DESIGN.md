# Challenges Microservice - Design Document

## 🎯 Overview

A microservice dedicated to managing coding challenges, quizzes, and assessments for the e-learning platform. This service will gamify learning and provide hands-on practice for students.

---

## 💡 Feature Ideas

### Core Features

#### 1. Challenge Types
- **Coding Challenges** - Write code to solve problems
- **Multiple Choice Quizzes** - Test theoretical knowledge
- **True/False Questions** - Quick knowledge checks
- **Fill in the Blank** - Complete code snippets
- **Code Review Challenges** - Find bugs in code
- **Project Challenges** - Build complete mini-projects

#### 2. Difficulty Levels
- 🟢 **Beginner** - Easy, introductory challenges
- 🟡 **Intermediate** - Moderate difficulty
- 🔴 **Advanced** - Complex, real-world problems
- 🟣 **Expert** - Very challenging, competitive programming

#### 3. Challenge Categories
- **Programming Languages** (Java, Python, JavaScript, etc.)
- **Data Structures** (Arrays, Trees, Graphs, etc.)
- **Algorithms** (Sorting, Searching, Dynamic Programming)
- **Web Development** (HTML/CSS, React, Angular)
- **Database** (SQL queries, NoSQL)
- **System Design** (Architecture, Scalability)

#### 4. Gamification Features
- 🏆 **Points System** - Earn points for completing challenges
- 🥇 **Leaderboards** - Global and course-specific rankings
- 🎖️ **Badges/Achievements** - Unlock badges for milestones
- 🔥 **Streaks** - Daily challenge completion streaks
- ⭐ **Star Ratings** - Rate challenges (1-5 stars)
- 💎 **XP Levels** - Level up based on experience points

#### 5. Social Features
- 👥 **Challenge Sharing** - Share challenges with friends
- 💬 **Discussion Forums** - Discuss solutions
- 🤝 **Peer Review** - Review others' solutions
- 📊 **Solution Comparison** - Compare your solution with others
- 👍 **Upvote/Downvote** - Vote on best solutions

#### 6. Learning Features
- 💡 **Hints System** - Progressive hints (costs points)
- 📚 **Related Resources** - Links to learning materials
- 🎓 **Solution Explanations** - Detailed explanations after completion
- 📝 **Test Cases** - Show sample inputs/outputs
- 🔍 **Step-by-Step Walkthrough** - Guided solutions for beginners

#### 7. Assessment Features
- ⏱️ **Timed Challenges** - Complete within time limit
- 🎯 **Skill Assessments** - Evaluate proficiency in topics
- 📊 **Progress Tracking** - Track completion and performance
- 📈 **Analytics Dashboard** - Visualize strengths/weaknesses
- 🎓 **Certificates** - Earn certificates for completing challenge sets

#### 8. Teacher/Admin Features
- ➕ **Create Custom Challenges** - Teachers create challenges
- 📦 **Challenge Collections** - Group challenges into sets
- 👨‍🎓 **Assign to Students** - Assign specific challenges
- 📊 **Student Analytics** - View student performance
- ✅ **Manual Grading** - Review and grade submissions
- 🔒 **Private Challenges** - Course-specific challenges

---

## 🏗️ Technical Architecture

### Database Schema

#### Challenge Entity
```java
@Entity
public class Challenge {
    @Id
    @GeneratedValue
    private Long id;
    
    private String title;
    private String description;
    private ChallengeType type; // CODING, QUIZ, TRUE_FALSE, etc.
    private DifficultyLevel difficulty; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    private String category; // Programming language or topic
    private Integer points; // Points awarded
    private Integer timeLimit; // In minutes (optional)
    private String starterCode; // For coding challenges
    private String solution; // Hidden from students
    private String explanation; // Shown after completion
    
    @OneToMany
    private List<TestCase> testCases;
    
    @OneToMany
    private List<Hint> hints;
    
    private Long createdBy; // Teacher/Admin ID
    private LocalDateTime createdAt;
    private Boolean isPublic; // Public or course-specific
    private String tags; // Comma-separated tags
    private Double averageRating;
    private Integer totalAttempts;
    private Integer successfulCompletions;
}
```

#### Submission Entity
```java
@Entity
public class Submission {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long challengeId;
    private Long userId;
    private String code; // User's solution
    private SubmissionStatus status; // PENDING, PASSED, FAILED, PARTIAL
    private Integer score; // Points earned
    private Integer testCasesPassed;
    private Integer totalTestCases;
    private LocalDateTime submittedAt;
    private Long executionTime; // In milliseconds
    private String feedback; // Error messages or feedback
    private Integer hintsUsed;
}
```

#### UserProgress Entity
```java
@Entity
public class UserProgress {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    private Integer totalPoints;
    private Integer level;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDateTime lastActivityDate;
    
    @OneToMany
    private List<Badge> badges;
    
    private Integer challengesCompleted;
    private Integer challengesAttempted;
    private Map<String, Integer> categoryScores; // Category -> Points
}
```

#### Leaderboard Entity
```java
@Entity
public class Leaderboard {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    private String username;
    private Integer totalPoints;
    private Integer rank;
    private String category; // Global, Java, Python, etc.
    private LocalDateTime lastUpdated;
}
```

#### Badge Entity
```java
@Entity
public class Badge {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    private String description;
    private String iconUrl;
    private BadgeType type; // COMPLETION, STREAK, MASTERY, SPECIAL
    private String criteria; // How to earn it
    private Integer requiredPoints;
}
```

#### TestCase Entity
```java
@Entity
public class TestCase {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long challengeId;
    private String input;
    private String expectedOutput;
    private Boolean isHidden; // Hidden test cases
    private Integer weight; // Points for this test case
}
```

#### Hint Entity
```java
@Entity
public class Hint {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long challengeId;
    private Integer level; // 1, 2, 3 (progressive hints)
    private String content;
    private Integer pointsCost; // Points deducted for using hint
}
```

---

## 🔌 API Endpoints

### Challenge Management

```
GET    /api/challenges                    - Get all challenges (with filters)
GET    /api/challenges/{id}               - Get challenge details
POST   /api/challenges                    - Create new challenge (Teacher/Admin)
PUT    /api/challenges/{id}               - Update challenge
DELETE /api/challenges/{id}               - Delete challenge
GET    /api/challenges/category/{category} - Get challenges by category
GET    /api/challenges/difficulty/{level} - Get challenges by difficulty
GET    /api/challenges/recommended        - Get recommended challenges for user
```

### Submissions

```
POST   /api/submissions                   - Submit solution
GET    /api/submissions/{id}              - Get submission details
GET    /api/submissions/user/{userId}     - Get user's submissions
GET    /api/submissions/challenge/{id}    - Get all submissions for challenge
POST   /api/submissions/{id}/run          - Run code against test cases
```

### Progress & Gamification

```
GET    /api/progress/user/{userId}        - Get user progress
GET    /api/leaderboard                   - Get global leaderboard
GET    /api/leaderboard/category/{cat}    - Get category leaderboard
GET    /api/badges                        - Get all available badges
GET    /api/badges/user/{userId}          - Get user's badges
POST   /api/hints/{hintId}/unlock         - Unlock a hint (costs points)
```

### Analytics

```
GET    /api/analytics/user/{userId}       - Get user analytics
GET    /api/analytics/challenge/{id}      - Get challenge statistics
GET    /api/analytics/category/{category} - Get category performance
```

---

## 🎨 Frontend Features

### Student View

#### 1. Challenge Browser
- Grid/List view of challenges
- Filters: Difficulty, Category, Type, Status
- Search by title/tags
- Sort by: Popularity, Difficulty, Points, Date

#### 2. Challenge Detail Page
- Challenge description
- Difficulty badge
- Points available
- Time limit (if any)
- Success rate
- Star rating
- Code editor (for coding challenges)
- Test cases (sample)
- Submit button
- Hint buttons

#### 3. Code Editor
- Syntax highlighting
- Multiple language support
- Run code button
- Submit button
- Reset button
- Full-screen mode
- Theme toggle (light/dark)

#### 4. Progress Dashboard
- Total points
- Current level
- Challenges completed
- Current streak
- Badges earned
- Category breakdown (radar chart)
- Recent activity
- Recommended challenges

#### 5. Leaderboard Page
- Global leaderboard
- Category leaderboards
- Friends leaderboard
- Your rank
- Top performers
- Filter by time period (week, month, all-time)

#### 6. Badges & Achievements
- All available badges
- Earned badges (highlighted)
- Progress towards next badge
- Badge details on hover

### Teacher/Admin View

#### 1. Challenge Management
- Create new challenge
- Edit existing challenges
- Delete challenges
- Preview challenges
- Bulk import challenges

#### 2. Analytics Dashboard
- Challenge completion rates
- Average scores
- Most difficult challenges
- Most popular challenges
- Student performance overview

#### 3. Student Monitoring
- View student submissions
- Manual grading interface
- Provide feedback
- Track student progress

---

## 🚀 Advanced Features (Future)

### 1. Code Execution Engine
- **Sandboxed Environment** - Secure code execution
- **Multiple Languages** - Java, Python, JavaScript, C++, etc.
- **Resource Limits** - CPU, Memory, Time limits
- **Real-time Feedback** - Show test results immediately

### 2. AI-Powered Features
- **Auto-grading** - AI evaluates code quality
- **Hint Generation** - AI generates contextual hints
- **Solution Suggestions** - AI suggests improvements
- **Plagiarism Detection** - Detect copied solutions

### 3. Collaborative Challenges
- **Pair Programming** - Two students solve together
- **Team Challenges** - Groups work on projects
- **Code Review Sessions** - Peer review practice

### 4. Live Competitions
- **Hackathons** - Timed competitions
- **Weekly Contests** - Regular challenges
- **Prize Pools** - Rewards for winners
- **Live Leaderboard** - Real-time rankings

### 5. Integration Features
- **GitHub Integration** - Submit via GitHub
- **IDE Plugins** - Solve in your IDE
- **Slack/Discord Bots** - Daily challenges
- **Calendar Integration** - Schedule practice

---

## 📊 Gamification System Details

### Points System
- **Easy Challenge**: 10-50 points
- **Medium Challenge**: 50-150 points
- **Hard Challenge**: 150-300 points
- **Expert Challenge**: 300-500 points
- **Bonus Points**: First attempt success, speed bonus
- **Penalty**: Using hints (-5 to -20 points per hint)

### Level System
- **Level 1**: 0-100 points (Novice)
- **Level 2**: 100-300 points (Beginner)
- **Level 3**: 300-600 points (Intermediate)
- **Level 4**: 600-1000 points (Advanced)
- **Level 5**: 1000-1500 points (Expert)
- **Level 6+**: +500 points per level (Master)

### Badge Examples
- 🎯 **First Blood** - Complete your first challenge
- 🔥 **On Fire** - 7-day streak
- 💯 **Perfectionist** - 10 challenges with 100% score
- 🏃 **Speed Demon** - Complete challenge in under 5 minutes
- 🧠 **Problem Solver** - Complete 50 challenges
- 🌟 **Rising Star** - Reach top 10 on leaderboard
- 🎓 **Java Master** - Complete all Java challenges
- 🤝 **Helpful** - 10 upvoted solutions

---

## 🔧 Technology Stack

### Backend
- **Framework**: Spring Boot
- **Database**: MySQL (or PostgreSQL)
- **Cache**: Redis (for leaderboards)
- **Message Queue**: RabbitMQ (for async processing)
- **Code Execution**: Docker containers (sandboxed)

### Frontend
- **Framework**: Angular 21
- **Code Editor**: Monaco Editor (VS Code editor)
- **Charts**: Chart.js or D3.js
- **Styling**: Tailwind CSS

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

---

## 📝 Implementation Priority

### Phase 1 (MVP) - 2-3 weeks
1. ✅ Basic Challenge CRUD
2. ✅ Multiple choice quizzes
3. ✅ Simple coding challenges (no execution)
4. ✅ Submission system
5. ✅ Basic points system
6. ✅ Simple leaderboard

### Phase 2 - 2-3 weeks
1. ✅ Code execution engine
2. ✅ Test cases
3. ✅ Hints system
4. ✅ Progress tracking
5. ✅ Badges system
6. ✅ Category filtering

### Phase 3 - 2-3 weeks
1. ✅ Advanced analytics
2. ✅ Teacher dashboard
3. ✅ Manual grading
4. ✅ Solution explanations
5. ✅ Discussion forums
6. ✅ Peer review

### Phase 4 (Advanced) - Future
1. ✅ AI-powered features
2. ✅ Live competitions
3. ✅ Collaborative challenges
4. ✅ External integrations

---

## 🎯 Success Metrics

- **Engagement**: Daily active users completing challenges
- **Completion Rate**: % of started challenges completed
- **Retention**: Users returning after 7/30 days
- **Learning Outcomes**: Improvement in assessment scores
- **User Satisfaction**: Challenge ratings and feedback

---

## 🔐 Security Considerations

1. **Code Execution**: Sandboxed, resource-limited containers
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Prevent spam submissions
4. **Authentication**: JWT tokens, role-based access
5. **Data Privacy**: Encrypt sensitive data
6. **Plagiarism**: Hash solutions, detect similarities

---

## 💰 Monetization Ideas (Optional)

- **Premium Challenges**: Exclusive challenges for paid users
- **Certificates**: Paid certificates for completion
- **Private Competitions**: Companies pay for hiring challenges
- **API Access**: Sell API access to challenge database
- **White Label**: License platform to other institutions

---

This is a comprehensive design for a Challenges microservice! Would you like me to start implementing it? I can begin with:

1. **Project scaffolding** - Create the Spring Boot project structure
2. **Database schema** - Create entities and repositories
3. **Basic CRUD APIs** - Implement challenge management
4. **Frontend pages** - Create Angular components

Let me know which part you'd like to start with! 🚀
