# English Learning Challenges Microservice - Design Document

## 🎯 Overview

A microservice dedicated to managing English language learning challenges, exercises, and assessments. This service will gamify English learning and provide interactive practice for students at all proficiency levels.

---

## 💡 Challenge Types for English Learning

### 1. Vocabulary Challenges

#### Word Matching
- Match words with their definitions
- Match synonyms/antonyms
- Match words with images
- Match idioms with meanings

#### Fill in the Blanks
- Complete sentences with correct vocabulary
- Choose the right word from options
- Context-based word selection

#### Word Building
- Form words from scrambled letters
- Build compound words
- Create words from prefixes/suffixes

#### Spelling Challenges
- Spell words correctly after hearing them
- Identify misspelled words
- Correct spelling errors in sentences

### 2. Grammar Challenges

#### Sentence Correction
- Fix grammatical errors
- Identify incorrect sentences
- Choose correct sentence structure

#### Tense Practice
- Convert sentences to different tenses
- Fill in correct verb forms
- Identify tense usage errors

#### Parts of Speech
- Identify nouns, verbs, adjectives, etc.
- Choose correct word forms
- Sentence structure analysis

#### Punctuation
- Add correct punctuation
- Fix punctuation errors
- Comma placement exercises

### 3. Reading Comprehension

#### Short Passages
- Read and answer questions
- Multiple choice comprehension
- True/False statements
- Fill in missing information

#### Long Articles
- Detailed reading with questions
- Main idea identification
- Inference questions
- Vocabulary in context

#### Speed Reading
- Timed reading challenges
- Quick comprehension tests
- Skim and scan exercises

### 4. Listening Challenges

#### Audio Comprehension
- Listen to audio and answer questions
- Dictation exercises
- Fill in missing words from audio
- Identify accents/speakers

#### Pronunciation Practice
- Record and compare pronunciation
- Identify correct pronunciation
- Stress and intonation exercises

#### Conversation Understanding
- Listen to dialogues
- Answer questions about conversations
- Identify context and emotions

### 5. Writing Challenges

#### Sentence Writing
- Write sentences using given words
- Rewrite sentences (active/passive)
- Combine sentences
- Expand simple sentences

#### Paragraph Writing
- Write descriptive paragraphs
- Write opinion paragraphs
- Summarize passages
- Write conclusions

#### Essay Writing
- Argumentative essays
- Descriptive essays
- Narrative essays
- Compare and contrast

#### Creative Writing
- Story completion
- Dialogue writing
- Letter writing (formal/informal)
- Email writing

### 6. Speaking Challenges

#### Pronunciation
- Record specific words/phrases
- Minimal pairs practice
- Tongue twisters
- Stress patterns

#### Fluency Practice
- Describe images
- Answer questions verbally
- Tell stories
- Role-play scenarios

#### Presentation Skills
- Prepare and deliver short talks
- Explain concepts
- Persuasive speaking

### 7. Idioms & Expressions

#### Idiom Matching
- Match idioms with meanings
- Use idioms in context
- Identify idiom usage

#### Phrasal Verbs
- Match phrasal verbs with meanings
- Complete sentences with phrasal verbs
- Replace verbs with phrasal verbs

#### Common Expressions
- Everyday expressions
- Business English expressions
- Slang and informal language

### 8. Cultural & Contextual

#### Cultural Knowledge
- British vs American English
- Cultural references
- Social etiquette in English

#### Real-World Scenarios
- Restaurant ordering
- Job interviews
- Making appointments
- Shopping conversations

---

## 🎓 Proficiency Levels

### A1 - Beginner
- Basic vocabulary (colors, numbers, family)
- Simple present tense
- Basic greetings and introductions
- Simple sentences

### A2 - Elementary
- Everyday vocabulary
- Past and future tenses
- Simple conversations
- Short paragraphs

### B1 - Intermediate
- Broader vocabulary
- Complex sentences
- Longer texts
- Express opinions

### B2 - Upper Intermediate
- Advanced vocabulary
- All tenses and aspects
- Detailed texts
- Formal and informal writing

### C1 - Advanced
- Sophisticated vocabulary
- Complex grammar structures
- Academic writing
- Nuanced understanding

### C2 - Proficient
- Native-like proficiency
- Idiomatic expressions
- Professional writing
- Literary analysis

---

## 🏗️ Database Schema

### Challenge Entity
```java
@Entity
public class Challenge {
    @Id
    @GeneratedValue
    private Long id;
    
    private String title;
    private String description;
    private ChallengeType type; // VOCABULARY, GRAMMAR, READING, LISTENING, WRITING, SPEAKING
    private SkillFocus skillFocus; // READING, WRITING, LISTENING, SPEAKING
    private ProficiencyLevel level; // A1, A2, B1, B2, C1, C2
    private String category; // Tenses, Vocabulary, Idioms, etc.
    private Integer points;
    private Integer timeLimit; // In minutes
    
    @Column(columnDefinition = "TEXT")
    private String content; // Main content (passage, audio URL, etc.)
    
    @OneToMany
    private List<Question> questions;
    
    @OneToMany
    private List<Hint> hints;
    
    private Long createdBy;
    private LocalDateTime createdAt;
    private Boolean isPublic;
    private String tags;
    private Double averageRating;
    private Integer totalAttempts;
    private Integer successfulCompletions;
    private String audioUrl; // For listening challenges
    private String imageUrl; // For visual challenges
}
```

### Question Entity
```java
@Entity
public class Question {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long challengeId;
    private QuestionType type; // MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK, OPEN_ENDED
    private String questionText;
    
    @ElementCollection
    private List<String> options; // For multiple choice
    
    private String correctAnswer;
    
    @ElementCollection
    private List<String> acceptableAnswers; // Alternative correct answers
    
    private String explanation;
    private Integer points;
    private Integer orderIndex;
}
```

### Submission Entity
```java
@Entity
public class Submission {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long challengeId;
    private Long userId;
    
    @ElementCollection
    private Map<Long, String> answers; // QuestionId -> Answer
    
    private SubmissionStatus status; // PASSED, FAILED, PARTIAL
    private Integer score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private LocalDateTime submittedAt;
    private Long completionTime; // In seconds
    private String feedback;
    private Integer hintsUsed;
    
    // For writing/speaking challenges
    private String writtenResponse;
    private String audioResponseUrl;
    private String teacherFeedback;
    private Boolean requiresManualGrading;
}
```

### UserProgress Entity
```java
@Entity
public class UserProgress {
    @Id
    @GeneratedValue
    private Long id;
    
    private Long userId;
    private ProficiencyLevel currentLevel; // A1, A2, B1, B2, C1, C2
    private Integer totalPoints;
    private Integer experiencePoints;
    private Integer currentStreak;
    private Integer longestStreak;
    private LocalDateTime lastActivityDate;
    
    // Skill breakdown
    private Integer vocabularyScore;
    private Integer grammarScore;
    private Integer readingScore;
    private Integer listeningScore;
    private Integer writingScore;
    private Integer speakingScore;
    
    @OneToMany
    private List<Badge> badges;
    
    private Integer challengesCompleted;
    private Integer challengesAttempted;
    
    @ElementCollection
    private Map<String, Integer> categoryMastery; // Category -> Mastery %
}
```

### Badge Entity
```java
@Entity
public class Badge {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    private String description;
    private String iconUrl;
    private BadgeCategory category; // VOCABULARY, GRAMMAR, STREAK, ACHIEVEMENT
    private String criteria;
    private Integer requiredPoints;
    private ProficiencyLevel requiredLevel;
}
```

### DailyChallenge Entity
```java
@Entity
public class DailyChallenge {
    @Id
    @GeneratedValue
    private Long id;
    
    private LocalDate date;
    private Long challengeId;
    private ProficiencyLevel level;
    private Integer bonusPoints; // Extra points for daily challenge
    private Boolean isActive;
}
```

### Vocabulary Entity
```java
@Entity
public class Vocabulary {
    @Id
    @GeneratedValue
    private Long id;
    
    private String word;
    private String definition;
    private String pronunciation; // IPA notation
    private String audioUrl; // Pronunciation audio
    private PartOfSpeech partOfSpeech;
    private ProficiencyLevel level;
    
    @ElementCollection
    private List<String> examples; // Example sentences
    
    @ElementCollection
    private List<String> synonyms;
    
    @ElementCollection
    private List<String> antonyms;
    
    private String imageUrl;
    private String category; // Business, Academic, Everyday, etc.
}
```

---

## 🔌 API Endpoints

### Challenge Management
```
GET    /api/challenges                          - Get all challenges (with filters)
GET    /api/challenges/{id}                     - Get challenge details
POST   /api/challenges                          - Create challenge (Teacher)
PUT    /api/challenges/{id}                     - Update challenge
DELETE /api/challenges/{id}                     - Delete challenge
GET    /api/challenges/level/{level}            - Get by proficiency level
GET    /api/challenges/type/{type}              - Get by challenge type
GET    /api/challenges/daily                    - Get today's daily challenge
GET    /api/challenges/recommended              - Get personalized recommendations
```

### Submissions
```
POST   /api/submissions                         - Submit answers
GET    /api/submissions/{id}                    - Get submission details
GET    /api/submissions/user/{userId}           - Get user submissions
POST   /api/submissions/{id}/grade              - Manual grading (Teacher)
POST   /api/submissions/audio                   - Upload audio response
```

### Progress & Gamification
```
GET    /api/progress/user/{userId}              - Get user progress
GET    /api/progress/skills/{userId}            - Get skill breakdown
GET    /api/leaderboard                         - Global leaderboard
GET    /api/leaderboard/level/{level}           - Leaderboard by level
GET    /api/badges                              - All available badges
GET    /api/badges/user/{userId}                - User's badges
POST   /api/hints/{hintId}/unlock               - Unlock hint
GET    /api/streak/{userId}                     - Get user's streak
```

### Vocabulary
```
GET    /api/vocabulary                          - Get vocabulary list
GET    /api/vocabulary/{id}                     - Get word details
GET    /api/vocabulary/level/{level}            - Get words by level
GET    /api/vocabulary/random                   - Get random words for practice
POST   /api/vocabulary/save                     - Save word to personal list
```

### Analytics
```
GET    /api/analytics/user/{userId}             - User performance analytics
GET    /api/analytics/skills/{userId}           - Skill-specific analytics
GET    /api/analytics/progress/{userId}         - Progress over time
```

---

## 🎨 Frontend Features

### Student View

#### 1. Challenge Dashboard
- **Daily Challenge** - Featured challenge of the day
- **Recommended Challenges** - Based on level and weak areas
- **Challenge Categories** - Browse by type (Vocabulary, Grammar, etc.)
- **Difficulty Filter** - Filter by proficiency level
- **Progress Overview** - Visual progress indicators

#### 2. Challenge Page
- **Challenge Instructions** - Clear instructions
- **Timer** - Countdown timer (if timed)
- **Question Display** - Interactive question interface
- **Audio Player** - For listening challenges
- **Text Editor** - For writing challenges
- **Voice Recorder** - For speaking challenges
- **Hint Button** - Progressive hints
- **Submit Button** - Submit answers

#### 3. Progress Dashboard
- **Proficiency Level** - Current level with progress bar
- **Skills Radar Chart** - 6 skills visualization
- **Total Points** - Points earned
- **Streak Counter** - Current and longest streak
- **Badges Display** - Earned badges
- **Recent Activity** - Last completed challenges
- **Weak Areas** - Areas needing improvement
- **Achievements Timeline** - Progress milestones

#### 4. Leaderboard
- **Global Ranking** - All users
- **Level-based Ranking** - Users at same level
- **Friends Ranking** - Compare with friends
- **Weekly/Monthly/All-time** - Time period filters

#### 5. Vocabulary Builder
- **Personal Word List** - Saved vocabulary
- **Flashcards** - Interactive flashcards
- **Spaced Repetition** - Review schedule
- **Word of the Day** - Daily vocabulary
- **Practice Exercises** - Vocabulary drills

#### 6. Results & Feedback
- **Score Display** - Points earned
- **Correct/Incorrect Answers** - Detailed breakdown
- **Explanations** - Why answers are correct/incorrect
- **Improvement Tips** - Personalized suggestions
- **Share Results** - Social sharing

### Teacher View

#### 1. Challenge Creator
- **Challenge Type Selection** - Choose challenge type
- **Content Editor** - Rich text editor
- **Question Builder** - Add multiple questions
- **Audio Upload** - Upload listening materials
- **Image Upload** - Add visual content
- **Answer Key** - Set correct answers
- **Difficulty Setting** - Set proficiency level
- **Points Assignment** - Set point values
- **Preview Mode** - Test before publishing

#### 2. Student Management
- **Student List** - All enrolled students
- **Progress Tracking** - Individual student progress
- **Performance Analytics** - Class performance overview
- **Assignment Management** - Assign specific challenges
- **Grading Queue** - Pending manual grading

#### 3. Analytics Dashboard
- **Class Performance** - Overall statistics
- **Challenge Statistics** - Completion rates
- **Skill Distribution** - Class skill levels
- **Engagement Metrics** - Active users, time spent
- **Difficulty Analysis** - Challenge difficulty effectiveness

---

## 🎮 Gamification Features

### Points System
- **A1 Challenges**: 10-30 points
- **A2 Challenges**: 30-60 points
- **B1 Challenges**: 60-100 points
- **B2 Challenges**: 100-150 points
- **C1 Challenges**: 150-200 points
- **C2 Challenges**: 200-300 points
- **Daily Challenge Bonus**: +50% points
- **Perfect Score Bonus**: +20% points
- **Speed Bonus**: Complete quickly for extra points
- **Streak Bonus**: +10 points per day of streak

### Badge Examples

#### Skill Badges
- 📚 **Bookworm** - Complete 10 reading challenges
- ✍️ **Wordsmith** - Complete 10 writing challenges
- 👂 **Good Listener** - Complete 10 listening challenges
- 🗣️ **Chatterbox** - Complete 10 speaking challenges
- 📖 **Grammar Guru** - Master all grammar challenges
- 🔤 **Vocabulary Master** - Learn 500 new words

#### Achievement Badges
- 🔥 **7-Day Streak** - Complete challenges for 7 days
- ⚡ **30-Day Streak** - Complete challenges for 30 days
- 🎯 **Perfectionist** - Get 100% on 10 challenges
- 🏃 **Speed Demon** - Complete 5 challenges in under 5 minutes
- 🌟 **Rising Star** - Reach B1 level
- 👑 **English Master** - Reach C2 level

#### Social Badges
- 🤝 **Helpful** - Help 10 other students
- 💬 **Conversationalist** - Participate in 20 discussions
- 🏆 **Top 10** - Reach top 10 on leaderboard

### Level Progression
- **A1 (Beginner)**: 0-500 points
- **A2 (Elementary)**: 500-1500 points
- **B1 (Intermediate)**: 1500-3000 points
- **B2 (Upper Intermediate)**: 3000-5000 points
- **C1 (Advanced)**: 5000-8000 points
- **C2 (Proficient)**: 8000+ points

---

## 📊 Challenge Examples

### Example 1: Vocabulary Challenge (A2)
**Title**: "Common Verbs in Daily Life"
**Type**: Multiple Choice
**Points**: 40
**Time**: 10 minutes

**Questions**:
1. I usually _____ breakfast at 7 AM.
   - a) make
   - b) do
   - c) have ✓
   - d) take

2. Can you _____ me a favor?
   - a) make
   - b) do ✓
   - c) have
   - d) take

### Example 2: Grammar Challenge (B1)
**Title**: "Present Perfect vs Past Simple"
**Type**: Fill in the Blank
**Points**: 60
**Time**: 15 minutes

**Questions**:
1. I _____ (visit) Paris three times in my life.
   **Answer**: have visited

2. I _____ (visit) Paris last summer.
   **Answer**: visited

### Example 3: Reading Comprehension (B2)
**Title**: "Climate Change Article"
**Type**: Reading + Questions
**Points**: 100
**Time**: 20 minutes

**Passage**: [300-word article about climate change]

**Questions**:
1. What is the main idea of the passage?
2. According to the author, what are the three main causes?
3. True or False: The article suggests immediate action is needed.

### Example 4: Listening Challenge (A1)
**Title**: "At the Restaurant"
**Type**: Audio Comprehension
**Points**: 30
**Time**: 10 minutes

**Audio**: [Dialogue between waiter and customer]

**Questions**:
1. What does the customer order?
2. How much does it cost?
3. What time is the reservation?

---

## 🚀 Implementation Priority

### Phase 1 (MVP) - 2-3 weeks
1. ✅ Basic Challenge CRUD
2. ✅ Multiple choice questions
3. ✅ Fill in the blank questions
4. ✅ Submission system
5. ✅ Basic scoring
6. ✅ Proficiency levels (A1-C2)

### Phase 2 - 2-3 weeks
1. ✅ Reading comprehension challenges
2. ✅ Vocabulary builder
3. ✅ Progress tracking
4. ✅ Points and badges system
5. ✅ Daily challenges
6. ✅ Leaderboard

### Phase 3 - 2-3 weeks
1. ✅ Listening challenges (audio upload)
2. ✅ Writing challenges (manual grading)
3. ✅ Teacher dashboard
4. ✅ Analytics
5. ✅ Hints system
6. ✅ Streak tracking

### Phase 4 (Advanced) - Future
1. ✅ Speaking challenges (voice recording)
2. ✅ AI-powered grading
3. ✅ Spaced repetition system
4. ✅ Peer review
5. ✅ Live competitions
6. ✅ Mobile app

---

## 🎯 Success Metrics

- **Engagement**: Daily active users completing challenges
- **Completion Rate**: % of started challenges completed
- **Learning Progress**: Users advancing proficiency levels
- **Retention**: Users returning after 7/30 days
- **Skill Improvement**: Improvement in weak areas
- **User Satisfaction**: Challenge ratings and feedback

---

This design is specifically tailored for an English learning platform! Would you like me to start implementing it? 🚀
