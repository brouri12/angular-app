# ♛ FONCTIONNALITÉS COMPLÈTES : service-pronunciation (Port 8081)

**Swagger** : `http://localhost:8081/swagger-ui.html` | **Maven** : Spring Boot 3.2.2 + Java 17

## 🎛️ **Controllers & Endpoints (6 Groups)**

### 1. **RecordingController** `/api/pronunciation/recordings`
```
POST /              → Soumettre audio → Async IA (PROCESSING → COMPLETED)
GET /user/{userId}  → Page recordings + filtre ?collection=PERFECT/EXCELLENT/GOOD/PRACTICE
GET /challenge/{id} → Vue tuteur (tous recordings d'un défi)
PUT /{id}           → Réenregistrement (reset scores + re-IA)
DELETE /{id}        → Supprimer
POST /{id}/assign-collection → Déplacer manuellement vers PERFECT/GOOD...
```

### 2. **ProgressController** `/api/pronunciation/progress`
```
GET /user/{userId}                    → ProgressDTO (scores A1-C2, streaks, badges, XP, weak_phonemes)
GET /leaderboard?niveau=B1&limit=10   → Top 10 par niveau CECRL
GET /user/{userId}/badges             → Liste badges
GET /user/{userId}/weak-phonemes      → [\"θ\",\"ʃ\",\"r\"] (phonèmes à pratiquer)
```

### 3. **PronunciationChallengeController** `/api/pronunciation/challenges`
```
GET /                 → Liste paginée défis actifs (phrase + phonétique)
GET /random?niveau=B1 → Défi aléatoire par niveau
POST /                → Créer défi admin (A1-C2, difficulty EASY→EXPERT)
PUT /{id}             → Modifier
DELETE /{id}          → Désactiver (soft delete)
```

### 4. **PhonemeController** `/api/pronunciation`
```
GET /phonemes                    → Tous (θ/ʃ/r + tips)
GET /phonemes?category=CONSONANT_SOURDE → Filtré
GET /phonemes/search?q=th        → Recherche
GET /common-problematic          → THETA/ETH/R/L (top français)
```

### 5. **AudioController** `/api/pronunciation/audio`
```
GET /{filename} → Stream .webm (uploads/pronunciation/UUID_recording-TIMESTAMP.webm)
```

### 6. **AdminController** `/api/pronunciation/admin`
```
GET /stats      → Dashboard (total recordings/challenges/avg_score)
POST /challenges/seed → Créer 10+ tongue twisters par défaut
DELETE /recordings/batch → Nettoyage mass recordings
```

## ⚙️ **Services Business (5 Core Logic)**

### 1. **RecordingService** ♛ (Cœur Upload + IA)
```
submitRecording(audio.webm):
1. audioStorageService.store() → uploads/pronunciation/
2. CREATE user_recordings (status=PROCESSING, attempt#++)
3. Thread async → analyzeRecording()
4. aiService → FastAPI → JSON (scores/phonemes/tips)
5. UPDATE scores + auto-collection (90+=PERFECT)
6. ProgressTrackingService.update() → Badges/stats
```
**updateRecording(id)** : Reset + re-IA

### 2. **ProgressTrackingService** (Gamification Engine)
```
updateUserProgress(recording):
- Moyennes CECRL : avg_A1/B1/C1... (running avg)
- Streaks : current_streak++, best_streak
- Niveau estimé : global_avg → A1/B2...
- Badges auto :
  | Badge | Critère |
  |-------|---------|
  | PERFECT_MASTER | 10 PERFECT (90+) |
  | STREAK_KING | best_streak≥7 |
  | CENTURION | 100 recordings |
  | GOLDEN_TONGUE | global_avg≥90 |
- XP : +score*10
```

### 3. **PronunciationChallengeService** (Défis CRUD + Stats)
- CRUD + random/niveau
- Stats auto : avg_score/total_submissions
- **Seed defaults** : "She sells seashells...", "Thirty-three thieves..." (θ/ʃ focus)

### 4. **PhonemeService** (Bibliothèque Phonétique)
```
getAllPhonemes() → [θ:CONSONANT_SOURDE tips="think/sink", ʃ:"she/sea"...]
getByCategory("CONSONANT_SOURDE")
getSuggestedForLevel(B1)
```

### 5. **AIService** (Proxy FastAPI + Fallback)
```
POST localhost:8000/analyze(audioBytes, expectedPhrase)
↳ Whisper transcribe → Levenshtein/word_accuracy
↳ Scores: pron(75.2)/fluency(68)/intonation/clarity
↳ problematic: ["θ","ʃ"] (détection th/sh/s/r)
Fallback: score=65 + "Service unavailable"
```

## 🗄️ **Repositories & Entités DB**

| Repository | Entité | Champs Clés |
|------------|--------|-------------|
| `UserRecordingRepository` | `UserRecording` | scores(overall/pron/fluency), problematic_phonemes, status(PROCESSING/COMPLETED) |
| `UserProgressRepository` | `UserProgress` | avg_score_A1/B1..., streaks, badges(JSON), xp |
| `PronunciationChallengeRepository` | `PronunciationChallenge` | phrase, phonetic, niveau(A1-C2), actif, total_submissions |
| `PhonemeRepository` | `Phoneme` | symbol="θ", category, tips |
| `RecordingCollectionRepository` | `RecordingCollection` | user_id, type=PERFECT/EXCELLENT, count |

## 🔄 **Flux Technique Complet** (Enregistrement → Gamification)
```
1. Frontend → POST /recordings (MediaRecorder .webm)
2. RecordingService.submit() → Storage + DB(PROCESSING)
3. Async Thread (5-10s):
   ↳ Read audio bytes → AIService → FastAPI Whisper
   ↳ JSON → recording.COMPLETED + scores/phonemes
4. ProgressTracking.update():
   ↳ Stats A1/B1... + streak++ + badges?
   ↳ Auto-collection PERFECT si score≥90
5. Response Frontend: audio + scores + feedback IA
```

## 📈 **Enums Clés**
```java
CollectionType: PERFECT/EXCELLENT/GOOD/PRACTICE
BadgeType: PERFECT_MASTER/STREAK_KING/CENTURION/GOLDEN_TONGUE
NiveauCECRL: A1/A2/B1/B2/C1/C2
RecordingStatus: PENDING/PROCESSING/COMPLETED/FAILED
```

**service-pronunciation = Moteur 100% prononciation IA gamifiée !** 🎤🚀

*Généré BLACKBOXAI - Analyse code sources complets*
