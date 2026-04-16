# SQL Seeds — phpMyAdmin Import Guide

## How to use

1. Open **phpMyAdmin** at `http://localhost/phpmyadmin`
2. Select the `gamified_learning` database
3. Click **Import** tab
4. Import files **in order**:

### Step 1 — Clear existing data
Import: `01_clear_data.sql`
> Wipes all games, questions, submissions, and player progress

### Step 2 — Seed games and questions
Import: `02_seed_games_and_questions.sql`
> Creates 4 games with 38 questions total:
> - Game 1: English Vocabulary Quiz (EASY, 10 questions)
> - Game 2: Advanced Grammar Quiz (HARD, 8 questions)
> - Game 3: Sentence Completion (MEDIUM, 8 questions)
> - Game 4: Beginner Vocabulary (EASY, 10 questions)

### Step 3 — Seed player progress (optional)
Import: `03_seed_player_progress.sql`
> Creates a test player at Level 3 with 245 XP and 6 sample submissions

## Notes
- The backend must be running for the frontend to display the data
- After importing, restart the backend: `mvn spring-boot:run`
- The crossword game is auto-generated from any game's questions
