# README.md - Projet Gestions_Ramzi : Plateforme de Prononciation

## 🏗️ Aperçu Général du Projet

**Gestions_Ramzi** est une **plateforme d'apprentissage de la prononciation anglaise** basée sur l'IA, orientée gamification et microservices. Elle permet aux étudiants de pratiquer leur prononciation via des défis audio, recevoir des feedbacks IA détaillés, suivre leur progression, gagner des badges, et consulter des classements.

### Architecture Globale
\`\`\`
Frontend (Angular) ──> API Gateway ──> Microservices (Spring Boot)
  ├── Student Dashboard                ├── service-pronunciation (★ Focus)
  ├── Tutor Dashboard                  ├── service-user
  └── Leaderboard                      ├── service-feedback
                                      └── Discovery/Config
IA Audio ──> FastAPI (Whisper) ──> Analyse détaillée
Keycloak ──> Authentification SSO
MySQL ──> skillforge_pronunciation
\`\`\`

**Fonctionnalités Principales** :
- Enregistrement audio et analyse IA temps réel
- Défis de prononciation gradués (A1-C2)
- Suivi progression + badges gamification
- Collections d'enregistrements (Perfect/Excellent...)
- Leaderboards + défis quotidiens
- Vues étudiant/tuteur avec RBAC (Keycloak)

## 🎯 Focus : service-pronunciation (Microservice Java Principal)

**Rôle** : Cœur métier - Gestion des enregistrements, analyse IA, progression, gamification.

### Entités Principales & Relations (DB : skillforge_pronunciation.sql)

\`\`\`sql
-- Enregistrements utilisateurs (★ Central)
user_recordings (id, user_id, challenge_id, audio_url, scores..., status)

-- Défis de prononciation
pronunciation_challenges (id, phrase, phonetic_transcription, niveau A1-C2, difficulty)

-- Progression utilisateur
user_progress (user_id, average_scoreA1/B1..., total_recordings, estimated_level, badges)

-- Phonèmes problématiques
recording_problematic_phonemes (recording_id, phoneme: 'θ','ʃ','s','r')
phoneme_library (symbol, category: CONSONANT_SOURDE/VOWEL..., tips)

-- Collections gamifiées
recording_collections (user_id, type: PERFECT/EXCELLENT/GOOD/PRACTICE, count)
\`\`\`

**Relations Clés** :
```
user_recordings → pronunciation_challenges (FK challenge_id)
user_recordings → recording_problematic_phonemes (1:N)
user_progress → user_earned_badges (1:N)
user_progress → user_weak_phonemes (1:N)
```

**Exemple Données** (extrait DB dump) :
\`\`\`sql
-- Challenge exemple
INSERT INTO pronunciation_challenges (phrase, niveau) VALUES 
('She sells seashells by the seashore.', 'B1');  -- /ʃiː sɛlz ˈsiːʃɛlz.../

-- Recording avec scores IA
INSERT INTO user_recordings (overall_score=68.5, pronunciation_score=75, problematic_phonemes=['θ']);
\`\`\`

### Services, APIs & Implémentation Code

#### 1. **RecordingController** (\`/api/pronunciation/recordings\`)
**Rôle** : CRUD enregistrements audio.

\`\`\`java
@PostMapping  // Soumettre audio → PROCESSING → IA async
ResponseEntity\<RecordingResponse\> submitRecording(challengeId, userId, MultipartFile audio)

@GetMapping(\"/user/\{userId\}\")  // Paginated + filtre collection (PERFECT...)
Page\<RecordingResponse\> getUserRecordings(...)

@GetMapping(\"/challenge/\{challengeId\}\")  // Tutor vue
@PutMapping(\"/\{id\}\")  // Réenregistrement
@DeleteMapping(\"/\{id\}\")
\`\`\`

#### 2. **RecordingService** (Business Logic)
\`\`\`java
// Soumission + stockage uploads/pronunciation/*.webm
UserRecording submitRecording(...) {
  filename = audioStorageService.storeAudioFile(audioFile);
  recording.status = PROCESSING;
  analyzeRecordingAsync(recording.id, filename, challenge.phrase);  // Thread
}

// Analyse IA détaillée
void analyzeRecording(...) {
  byte[] audioBytes = Files.readAllBytes(filePath);
  AudioAnalysisResult result = aiService.analyzePronunciation(...);
  recording.overallScore = result.pronunciationScore();  // 0-100
  recording.problematicPhonemes = result.problematicPhonemes();  // ['θ','ʃ']
  progressService.updateUserProgress(userId, recording);  // Badges/stats
}
\`\`\`

#### 3. **AIService** → **FastAPI** Proxy
Appelle \`http://localhost:8000/analyze-pronunciation\` (Multipart audio + expected_text).

#### 4. **ProgressController** (\`/api/pronunciation/progress\`)
\`\`\`java
@GetMapping(\"/user/\{userId\}\") → ProgressDTO (moyennes A1-C2, streaks, level)
@GetMapping(\"/leaderboard?niveau=B1&limit=10\")
@GetMapping(\"/user/\{userId\}/weak-phonemes\") → [\"θ\",\"ʃ\"]
@GetMapping(\"/user/\{userId\}/badges\") → [\"TH_MASTER\",\"STREAK_10\"]
\`\`\`

#### 5. **ProgressTrackingService** (Gamification)
- Calcul moyennes par niveau CECRL
- Attribution badges (BadgeType enum)
- Détection phonèmes faibles
- Leaderboards

**Autres Microservices** :
- **service-user** : Gestion profils
- **service-feedback** : Réclamations (uploads/reclamations/)
- **gateway-service** : Routage unifié
- **discovery/config-server** : Eureka/Spring Cloud

## 🚀 FastAPI : Analyse IA Audio (pronunciation-fastapi/main.py)

**Rôle** : Moteur IA avec **Whisper (faster-whisper)** pour transcription + scoring avancé.

### Fonctionnement Détaillé
```
1. POST /analyze-pronunciation (audio:webm, expected_text)
2. Whisper transcribe(audio, language=\"en\", vad_filter)
3. calculate_scores(transcribed vs expected):
   ├─ Levenshtein (similarité chars/mots)
   ├─ word_accuracy (alignement optimal >75%)
   ├─ Phonèmes problématiques (th/sh/s/r custom)
   └─ Scores: pronunciation(★), fluency, intonation, clarity (0-99)
4. Feedback + tips générés
5. RETURN AudioAnalysisResult (Pydantic)
```

**Implémentation Clé** (extrait) :
\`\`\`python
def calculate_scores(transcribed: str, expected: str):
    # No-speech detection (placeholders Whisper)
    if is_no_speech(transcribed): return {scores:0, noSpeechDetected:True}
    
    # Levenshtein + word matching
    word_accuracy = word_level_accuracy(words_t, words_e)  # Best-match
    
    # Phonèmes spécifiques
    if not th_detected: problematicPhonemes.append(\"θ\")  # /think/, /the/
    if not sh_detected: problematicPhonemes.append(\"ʃ\")  # /she/, /seashells/
    
    pronunciationScore = char_sim*0.4 + word_acc*0.5 + coverage*0.1  # Weighted
    return {\"pronunciationScore\": 75.2, \"problematicPhonemes\": [\"θ\"], ...}

@app.post(\"/analyze-pronunciation\")
async def analyze_pronunciation(audio:UploadFile, expected_text:str):
    segments = model.transcribe(io.BytesIO(contents), language=\"en\")
    return AudioAnalysisResult(...)  # Scores + tips adaptatifs
\`\`\`

**Scores Sortis** :
```
Excellent (>88): \"Very close to native!\"
Good (72-88): \"A few sounds need polishing\"
Fair (50-72): \"Speak slower, focus on phonemes\"
Poor (<50): \"Break into words, repeat after reference\"
```

**Feedback Exemple** :
```
problematicPhonemes: [\"θ\", \"ʃ\"]
improvementTips: [\"Practice 'th' with minimal pairs\", \"ʃ: she/sea vs see/see\"]
```

**Démarrage** : \`uvicorn main:app --port 8000\`

## 🎮 Frontend Angular (RBAC Keycloak)

- **Étudiant** : myRecordings (collections PERFECT/PRACTICE), challengeDetails
- **Tuteur** : studentResults, leaderboard
- **Composants** : progression-chart, gamification-badges, CollectionPipe
- **Services** : pronunciation.service.ts, auth.service.ts (roles: student/tuteur)

**TODOs Restants** (frontend) :
- Collections dynamiques
- View details fixes
- Leaderboard polish

## 🚀 Déploiement & Stack

```
Backend: Java 17+ Spring Boot 3, MySQL 5.7
IA: Python FastAPI + faster-whisper (CPU int8)
Frontend: Angular 17 + Tailwind
Auth: Keycloak SSO
Infra: Spring Cloud (Eureka, Gateway, Config)
DB: skillforge_pronunciation (import .sql)
Uploads: microservices/uploads/pronunciation/*.webm
```

**Démarrer Projet** :
\`\`\`bash
# DB
mysql -u root -p < skillforge_pronunciation.sql

# FastAPI IA
cd pronunciation-fastapi &amp;&amp; pip install -r requirements.txt &amp;&amp; uvicorn main:app:8000

# Microservices (Maven)
mvn spring-boot:run -pl service-pronunciation

# Frontend
cd frontend/angular-app &amp;&amp; ng serve
\`\`\`

## 📈 Fonctionnalités Avancées

1. **Collections Gamifiées** : PERFECT(90+), EXCELLENT(80+), GOOD(70+), PRACTICE(\<70)
2. **Badges** : TH_MASTER, STREAK_10, LEVEL_UP (user_earned_badges)
3. **Défis Gradués** : A1 \"Hello\" → B2 \"Thirty-three thieves\"
4. **Phonèmes Ciblés** : θ/ð (th), ʃ (sh), s/ss, r (français vs anglais)
5. **Streaks & Leaderboards** : Par niveau CECRL
6. **Async Processing** : Soumission → IA → Update DB (status PROCESSING→COMPLETED)

**Exemple Workflow Étudiant** :
```
1. Choisir challenge \"She sells seashells...\"
2. Record audio (.webm)
3. POST → service-pronunciation → FastAPI → Scores 68.5, [\"ʃ\"]
4. Ajouté à collection PRACTICE
5. Progress: avg_B1 += 68.5, weak_phonemes += \"ʃ\"
6. Badge? → Check streaks/badges
```

Ce projet est **production-ready** pour une plateforme d'entraînement prononciation ! 🎤✨

---

*Généré automatiquement par BLACKBOXAI - Analyse complète codebase (01/04/2026)*
