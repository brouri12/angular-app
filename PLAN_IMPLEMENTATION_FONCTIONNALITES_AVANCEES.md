# Plan d'Implémentation - Fonctionnalités Avancées
## Projet Gestions_Ramzi (SkillForge)

---

## 📊 1. ANALYTIQUE ET STATISTIQUES

### 1.1 Endpoints de Statistiques (Feedbacks)

**Fichier à modifier :** `FeedbackController.java`

```
java
@GetMapping("/stats")
public FeedbackStats getStats(
        @RequestParam(required = false) Long moduleId,
        @RequestParam(required = false) Long userId) {
    return service.getStats(moduleId, userId);
}
```

**DTO à créer :** `FeedbackStats.java`
```
java
public class FeedbackStats {
    private double moyenneNote;
    private long totalFeedbacks;
    private Map<Integer, Long> repartitionNotes; // {1: 5, 2: 10, ...}
    private Map<String, Long> feedbacksParMois;
    private long nouveauxAujourdhui;
}
```

**Service :** `FeedbackService.java` - Ajouter méthode `getStats()`

---

### 1.2 Endpoints Analytiques (Réclamations)

**Fichier à modifier :** `ReclamationController.java`

```
java
@GetMapping("/analytics")
public ReclamationAnalytics getAnalytics(
        @RequestParam(required = false) String dateDebut,
        @RequestParam(required = false) String dateFin) {
    return service.getAnalytics(dateDebut, dateFin);
}
```

**DTO :** `ReclamationAnalytics.java`
```
java
public class ReclamationAnalytics {
    private long totalReclamations;
    private Map<String, Long> parStatus; // {EN_ATTENTE: 5, RESOLUE: 10}
    private long tempsResolutionMoyen; // en heures
    private Map<String, Long> parMois;
    private List<Reclamation> nonResolues depuis X jours;
}
```

---

### 1.3 Génération de Rapports PDF/Excel

**Dépendance Maven (pom.xml) :**
```
xml
<!-- Apache POI pour Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- iText pour PDF -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>
```

**Nouveau Controller :** `ReportController.java`
```
java
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @GetMapping("/feedbacks/excel")
    public ResponseEntity<byte[]> exportFeedbacksExcel() { ... }
    
    @GetMapping("/feedbacks/pdf")
    public ResponseEntity<byte[]> exportFeedbacksPdf() { ... }
    
    @GetMapping("/reclamations/excel")
    public ResponseEntity<byte[]> exportReclamationsExcel() { ... }
    
    @GetMapping("/reclamations/pdf")
    public ResponseEntity<byte[]> exportReclamationsPdf() { ... }
}
```

---

## 🔔 2. NOTIFICATIONS

### 2.1 Configuration des Notifications

**Dépendance :**
```
xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

**Fichier de configuration :** `application.yml`
```
yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

### 2.2 Service de Notification

**Créer :** `NotificationService.java`
```
java
@Service
public class NotificationService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void notifierNouvelleReclamation(Reclamation reclamation) {
        // Envoyer email à l'admin
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("admin@skillforge.com");
        message.setSubject("Nouvelle réclamation #" + reclamation.getId());
        message.setText("Une nouvelle réclamation a été soumise...");
        mailSender.send(message);
    }
    
    public void notifierFeedbackNegatif(Feedback feedback) {
        if (feedback.getNote() <= 2) {
            // Envoyer alerte
        }
    }
    
    public void verifierReclamationsNonRepondues() {
        // Vérifier chaque jour les réclamations > 7 jours sans réponse
    }
}
```

### 2.3 Intégrer dans les Controllers

**FeedbackController.java** - Ajouter :
```
java
@PostMapping
public FeedbackResponse create(@Valid @RequestBody Feedback feedback) {
    Feedback saved = service.create(feedback);
    if (saved.getNote() <= 2) {
        notificationService.notifierFeedbackNegatif(saved);
    }
    return FeedbackResponse.from(saved);
}
```

**ReclamationController.java** - Ajouter :
```
java
@PostMapping
public Reclamation create(@RequestBody Reclamation reclamation) {
    Reclamation saved = service.create(reclamation);
    notificationService.notifierNouvelleReclamation(saved);
    return saved;
}
```

---

## 🔒 3. SÉCURITÉ ET AUTHENTIFICATION JWT

### 3.1 Dépendances Maven

```
xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 3.2 Structure des fichiers de sécurité

```
src/main/java/com/gestions/ramzi/servicefeedback/
├── config/
│   ├── SecurityConfig.java
│   └── JwtTokenProvider.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── models/
│   ├── User.java
│   └── Role.java (enum: ADMIN, USER, MODERATOR)
└── dto/
    ├── LoginRequest.java
    ├── LoginResponse.java
    └── JwtResponse.java
```

### 3.3 Configuration Security

**SecurityConfig.java :**
```
java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/feedbacks/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/reclamations/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 3.4 JWT Token Provider

```
java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(String username, Set<Role> roles) {
        // Générer token JWT
    }
    
    public boolean validateToken(String token) {
        // Valider token
    }
    
    public String getUsernameFromToken(String token) {
        // Extraire username
    }
}
```

### 3.5 Journal d'Audit (Audit Trail)

**Créer entité :** `AuditLog.java`
```
java
@Entity
@Table(name = "audit_log")
public class AuditLog {
    @Id
    @GeneratedValue
    private Long id;
    
    private String username;
    private String action; // CREATE, UPDATE, DELETE
    private String entity; // Feedback, Reclamation
    private Long entityId;
    private LocalDateTime timestamp;
    private String details;
}
```

**Service d'audit :**
```
java
@Service
public class AuditService {
    
    public void log(String username, String action, String entity, Long entityId) {
        AuditLog log = AuditLog.builder()
            .username(username)
            .action(action)
            .entity(entity)
            .entityId(entityId)
            .timestamp(LocalDateTime.now())
            .build();
        auditRepo.save(log);
    }
}
```

---

## 🤖 4. INTELLIGENCE ARTIFICIELLE

### 4.1 Analyse de Sentiment (NLP)

**Option A : Intégration Python (Microservice séparé)**

```
microservices/
├── service-nlp/              # Nouveau microservice Python
│   ├── app.py               # FastAPI
│   ├── requirements.txt
│   └── models/
│       └── sentiment_model/
```

**Microservice Python (FastAPI) :**
```
python
# service-nlp/app.py
from fastapi import FastAPI
from pydantic import BaseModel
import tensorflow as tf
from transformers import pipeline

app = FastAPI()
sentiment_analyzer = pipeline("sentiment-analysis")

class TextRequest(BaseModel):
    text: str

@app.post("/analyze/sentiment")
def analyze_sentiment(request: TextRequest):
    result = sentiment_analyzer(request.text)
    return {
        "sentiment": result[0]['label'],
        "score": result[0]['score']
    }

@app.post("/classify/reclamation")
def classify_reclamation(request: TextRequest):
    # Classification par catégorie: TECHNIQUE, FACTURATION, AUTRE
    categories = ["TECHNIQUE", "FACTURATION", "QUALITÉ", "AUTRE"]
    # Logique de classification
    return {"category": "TECHNIQUE", "confidence": 0.95}
```

**Appel depuis Spring Boot :**
```
java
// Feign Client vers service-nlp
@FeignClient(name = "service-nlp", url = "${nlp.service.url}")
public interface NlpClient {
    
    @PostMapping("/analyze/sentiment")
    SentimentResponse analyzeSentiment(@Body TextRequest request);
    
    @PostMapping("/classify/reclamation")
    ClassificationResponse classifyReclamation(@Body TextRequest request);
}
```

**Option B : bibliothèque Java locale**
```
xml
<dependency>
    <groupId>com.deeplearning4j</groupId>
    <artifactId>deeplearning4j-nlp</artifactId>
    <version>1.0.0-beta3</version>
</dependency>
```

---

## 📈 5. AMÉLIORATION DES DONNÉES

### 5.1 Pagination Avancée

**Modifier les Controllers :**
```
java
@GetMapping
public Page<FeedbackResponse> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "date") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir,
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) Long moduleId,
        @RequestParam(required = false) Integer noteMin,
        @RequestParam(required = false) Integer noteMax,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String dateDebut,
        @RequestParam(required = false) String dateFin) {
    
    Sort sort = sortDir.equalsIgnoreCase("asc") ? 
        Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
    
    Pageable pageable = PageRequest.of(page, size, sort);
    return service.search(userId, moduleId, noteMin, noteMax, search, dateDebut, dateFin, pageable);
}
```

### 5.2 Filtres Avancés

**DTO pour les critères :** `FeedbackSearchCriteria.java`
```
java
public class FeedbackSearchCriteria {
    private Long userId;
    private Long moduleId;
    private Integer noteMin;
    private Integer noteMax;
    private String search; // texte dans commentaire
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
}
```

**Service avec Specification JPA :**
```java
public Specification<Feedback> withFilters(FeedbackSearchCriteria criteria) {
    return Specification.where(hasUserId(criteria.getUserId()))
        .and(hasModuleId(criteria.getModuleId()))
        .and(hasNoteMin(criteria.getNoteMin()))
        .and(hasNoteMax(criteria.getNoteMax()))
        .and(containsSearch(criteria.getSearch()))
        .and(dateBetween(criteria.getDateDebut(), criteria.getDateFin()));
}
```

### 5.3 Export/Import CSV

**Nouveau Controller :** `ExportController.java`
```
java
@GetMapping("/export/feedbacks/csv")
public ResponseEntity<byte[]> exportFeedbacksCsv(
        @RequestParam(required = false) Long moduleId,
        @RequestParam(required = false) String status) {
    
    List<Feedback> feedbacks = feedbackService.getAll(moduleId);
    
    StringBuilder csv = new StringBuilder();
    csv.append("ID,UserID,ModuleID,Note,Commentaire,Date\n");
    
    for (Feedback f : feedbacks) {
        csv.append(String.format("%d,%d,%d,%d,\"%s\",%s\n",
            f.getId(), f.getUserId(), f.getModuleId(),
            f.getNote(), f.getCommentaire(), f.getDate()));
    }
    
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=feedbacks.csv")
        .body(csv.toString().getBytes());
}

@PostMapping("/import/feedbacks/csv")
public ResponseEntity<String> importFeedbacksCsv(@RequestParam("file") MultipartFile file) {
    // Parser le CSV et importer
}
```

---

## 📋 RÉSUMÉ - ORDRE D'IMPLÉMENTATION RECOMMANDÉ

| Phase | Fonctionnalités | Difficulté | Temps estimé |
|-------|----------------|-------------|--------------|
| **1** | Pagination + Filtres + Export CSV | ⭐ | 2-3 jours |
| **2** | Sécurité JWT + Rôles | ⭐⭐ | 3-4 jours |
| **3** | Analytics + Stats API | ⭐⭐ | 2-3 jours |
| **4** | Notifications Email | ⭐⭐ | 2 jours |
| **5** | Audit Trail | ⭐⭐ | 1-2 jours |
| **6** | IA (Sentiment + Classification) | ⭐⭐⭐ | 5-7 jours |

---

## 📁 FICHIERS À CRÉER

```
microservices/service-feedback/src/main/java/com/gestions/ramzi/servicefeedback/
├── controllers/
│   ├── ReportController.java          # Export PDF/Excel
│   └── ExportController.java         # Import/Export CSV
├── dto/
│   ├── FeedbackStats.java
│   ├── ReclamationAnalytics.java
│   ├── FeedbackSearchCriteria.java
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   └── JwtResponse.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── config/
│   ├── SecurityConfig.java
│   └── MailConfig.java
├── services/
│   ├── NotificationService.java
│   ├── AuditService.java
│   ├── ReportService.java
│   └── ExportService.java
├── models/
│   ├── Role.java
│   └── AuditLog.java
├── repositories/
│   ├── AuditLogRepository.java
│   └── Specification/
│       └── FeedbackSpecification.java
└── clients/
    └── NlpClient.java                 # Feign Client pour IA
```

---

Ce plan vous offre une roadmap complète pour enrichir votre projet avec des fonctionnalités professionnelles.
