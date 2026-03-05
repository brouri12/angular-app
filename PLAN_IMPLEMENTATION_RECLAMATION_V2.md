# 📋 Plan d'Implémentation - Fonctionnalités Réclamation V2

## 1. NIVEAUX DE PRIORITÉ (Priority Levels)

### 🔴 Critique / 🟠 Haute / 🟡 Moyenne / 🟢 Basse

---

### 1.1 Modèle de Données

#### Entité `Reclamation` - Ajout du champ priorité:

```
java
// Nouvelle énumération pour les niveaux de priorité
public enum Priorite {
    CRITIQUE("🔴", "Critique"),
    HAUTE("🟠", "Haute"),
    MOYENNE("🟡", "Moyenne"),
    BASSE("🟢", "Basse")
}

// Dans l'entité Reclamation
@Enumerated(EnumType.STRING)
@Column(name = "priorite")
private Priorite priorite;
```

---

### 1.2 Scénario de Fonctionnement

```
┌─────────────────────────────────────────────────────────────────┐
│                 CRÉATION RÉCLAMATION AVEC PRIORITÉ             │
└─────────────────────────────────────────────────────────────────┘

1. UTILISATEUR crée une réclamation
   │
   ├──► Formulaire avec champ "Priorité" (dropdown)
   │    ├── 🔴 Critique - Problème bloquant, urgent
   │    ├── 🟠 Haute - Problème important
   │    ├── 🟡 Moyenne - Problème standard
   │    └── 🟢 Basse - Amélioration, suggestion
   │
   ├──► Valeur par défaut: MOYENNE
   │
   └──► Envoi au backend

2. BACKEND reçoit la réclamation
   │
   ├──► Sauvegarde avec le niveau de priorité
   │
   └──► Notification admin si CRITIQUE ou HAUTE

3. ADMIN voit les priorités dans le tableau
   │
   ├──► Filtrage par priorité
   │
   ├──► Tri par priorité (CRITIQUE en haut)
   │
   └──► Indicateur visuel (emoji + couleur)

4. ANALYTICS inclut les statistiques par priorité
```

---

### 1.3 Endpoints API Impactés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/reclamations` | Liste avec champ `priorite` |
| GET | `/api/reclamations/{id}` | Détail avec `priorite` |
| POST | `/api/reclamations` | Création avec `priorite` (optionnel) |
| PUT | `/api/reclamations/{id}` | Modification priorité |
| GET | `/api/reclamations/analytics` | Stats par priorité |

---

### 1.4 Impact Frontend

- **Formulaire création**: Ajout dropdown priorité
- **Tableau列表**: Colonne priorité avec badge couleur
- **Filtres**: Filter par priorité
- **Detail**: Affichage priorité

---

## 2. PIÈCES JOINTES (Attachments)

---

### 2.1 Modèle de Données

#### Nouvelle entité `PieceJointe`:

```
java
@Entity
@Table(name = "piece_jointe")
@Data
public class PieceJointe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reclamation_id")
    private Long reclamationId;

    private String nomFichier;
    private String typeContenu; // image/jpeg, application/pdf, etc.
    private String url; // Chemin de stockage
    private Long taille; // en octets

    private LocalDateTime dateAjout;
}
```

#### Relation avec Reclamation:

```
java
@OneToMany(mappedBy = "reclamationId", cascade = CascadeType.ALL)
private List<PieceJointe> piecesJointes;
```

---

### 2.2 Scénario de Fonctionnement

```
┌─────────────────────────────────────────────────────────────────┐
│              UPLOAD PIÈCES JOINTES RÉCLAMATION                 │
└─────────────────────────────────────────────────────────────────┘

1. UTILISATEUR crée/modifie une réclamation
   │
   ├──► Zone de téléchargement (drag & drop)
   │    ├── Images: jpg, png, gif
   │    ├── Documents: pdf, doc, docx
   │    └── Taille max: 10MB par fichier
   │
   ├──► Prévisualisation des fichiers uploadés
   │
   ├──► Bouton suppression par fichier
   │
   └──► Envoi multipart/form-data

2. BACKEND reçoit la requête
   │
   ├──► Extraction des fichiers
   │
   ├──► Sauvegarde sur disque/s3:
   │    └── /uploads/reclamations/{id}/{uuid}_{filename}
   │
   ├──► Création entrées en base
   │
   └──► Retourne URLs des fichiers

3. AFFICHAGE dans la liste et détail
   │
   ├──► Miniatures pour images
   │
   ├──► Icônes pour documents
   │
   └──► Lien download

4. SUPPRESSION (optionnelle)
   │
   ├──► Suppression fichier physique
   │
   └──► Suppression entrée base
```

---

### 2.3 Endpoints API Nouveaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/reclamations/{id}/pieces-jointes` | Upload fichiers |
| GET | `/api/reclamations/{id}/pieces-jointes` | Liste fichiers |
| GET | `/api/pieces-jointes/{id}/download` | Download fichier |
| DELETE | `/api/pieces-jointes/{id}` | Supprimer fichier |

---

### 2.4 Configuration Stockage

```
yaml
# application.yml
file:
  upload:
    directory: ./uploads/reclamations
    max-size: 10485760  # 10MB
    allowed-types:
      - image/jpeg
      - image/png
      - image/gif
      - application/pdf
      - application/msword
      - application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

---

## 3. RÉSUMÉ DES ÉTAPES D'IMPLÉMENTATION

### Phase 1: Backend
- [ ] 1.1 Créer énumération `Priorite`
- [ ] 1.2 Ajouter champ `priorite` à `Reclamation`
- [ ] 1.3 Mettre à jour `ReclamationService`
- [ ] 1.4 Mettre à jour `ReclamationController`
- [ ] 1.5 Créer entité `PieceJointe`
- [ ] 1.6 Créer service upload fichier
- [ ] 1.7 Créer endpoints pièces jointes

### Phase 2: Frontend
- [ ] 2.1 Ajouter champ priorité au formulaire
- [ ] 2.2 Ajouter colonne priorité au tableau
- [ ] 2.3 Implémenter upload fichiers (drag & drop)
- [ ] 2.4 Afficher prévisualisations
- [ ] 2.5 Ajouter filtres par priorité

### Phase 3: Tests
- [ ] 3.1 Test création avec priorité
- [ ] 3.2 Test upload fichier
- [ ] 3.3 Test download fichier
- [ ] 3.4 Test intégration frontend

---

## 4. DÉPENDANCES REQUISES

### Backend (pom.xml)
```
xml
<!-- Pour upload de fichiers -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.15.1</version>
</dependency>
```

### Frontend
-现有的 Angular material ou composant custom pour upload
-Intégration已有的文件上传组件

---

## 5. EXEMPLE DE REQUÊTE API

### Création réclamation avec priorité:
```
json
POST /api/reclamations
{
  "userId": 1,
  "objet": "Problème de connexion",
  "description": "Je n'arrive pas à me connecter",
  "priorite": "HAUTE"
}
```

### Upload pièce jointe:
```
POST /api/reclamations/1/pieces-jointes
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="screenshot.png"
[binary data]
--boundary--
