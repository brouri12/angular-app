# 🧪 GUIDE COMPLET DE TEST - Microservice Abonnement

## 📋 TABLE DES MATIÈRES
1. [Prérequis](#prérequis)
2. [Installation des Outils](#installation-des-outils)
3. [Démarrage du Service](#démarrage-du-service)
4. [Méthodes de Test](#méthodes-de-test)
5. [Tests Pas à Pas](#tests-pas-à-pas)
6. [Résolution des Problèmes](#résolution-des-problèmes)

---

## 🎯 PRÉREQUIS

### Vérifier ce qui est installé

#### 1. Vérifier Java
```bash
java -version
```
✅ **Attendu**: Java version 17 ou supérieur
❌ **Si erreur**: Installer Java JDK 17

#### 2. Vérifier Maven
```bash
mvn -version
```
✅ **Attendu**: Apache Maven 3.6+
❌ **Si erreur**: Installer Maven (voir ci-dessous)

#### 3. Vérifier MySQL
```bash
mysql --version
```
✅ **Attendu**: MySQL 8.0+
❌ **Si erreur**: Installer MySQL ou XAMPP

---

## 📥 INSTALLATION DES OUTILS

### Option A: Installer Maven (Recommandé)

#### Windows
1. **Télécharger Maven**
   - Aller sur: https://maven.apache.org/download.cgi
   - Télécharger `apache-maven-3.9.x-bin.zip`

2. **Extraire**
   - Extraire dans `C:\Program Files\Apache\maven`

3. **Configurer les Variables d'Environnement**
   ```
   Variable: MAVEN_HOME
   Valeur: C:\Program Files\Apache\maven
   
   Ajouter à PATH: %MAVEN_HOME%\bin
   ```

4. **Vérifier**
   ```bash
   mvn -version
   ```

#### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install maven

# Mac (avec Homebrew)
brew install maven

# Vérifier
mvn -version
```

### Option B: Utiliser IntelliJ IDEA (Plus Simple!)

IntelliJ IDEA inclut Maven automatiquement!
1. Télécharger IntelliJ IDEA Community (gratuit)
2. Installer
3. Ouvrir le projet `AbonnementService`
4. Maven sera configuré automatiquement

---

## 🚀 DÉMARRAGE DU SERVICE

### Méthode 1: Avec Maven (Ligne de commande)

#### Étape 1: Compiler le projet
```bash
cd AbonnementService
mvn clean install
```

**Attendu**: 
```
[INFO] BUILD SUCCESS
[INFO] Total time: 30 s
```

#### Étape 2: Démarrer le service
```bash
mvn spring-boot:run
```

**Attendu**:
```
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
🌐 URL: http://localhost:8084/api/abonnements
```

### Méthode 2: Avec IntelliJ IDEA (Recommandé pour débutants)

#### Étape 1: Ouvrir le projet
1. Lancer IntelliJ IDEA
2. File → Open
3. Sélectionner le dossier `AbonnementService`
4. Attendre le chargement (barre de progression en bas)

#### Étape 2: Configurer MySQL
1. Démarrer MySQL (XAMPP ou service Windows)
2. Vérifier que MySQL tourne sur le port 3306

#### Étape 3: Lancer l'application
1. Ouvrir `src/main/java/tn/esprit/abonnement/AbonnementApplication.java`
2. Clic droit dans le fichier
3. Sélectionner **"Run 'AbonnementApplication'"**
4. Attendre 10-15 secondes

#### Étape 4: Vérifier les logs
Dans la console IntelliJ, vous devriez voir:
```
🔄 Initialisation des données par défaut...
✅ 3 abonnements créés avec succès!
✅ 2 paiements créés avec succès!
📊 Base de données initialisée!
```

### Méthode 3: Avec le Script (Si Maven est installé)

#### Windows
```bash
cd AbonnementService
START.bat
```

#### Linux/Mac
```bash
cd AbonnementService
chmod +x start.sh
./start.sh
```

---

## 🧪 MÉTHODES DE TEST

### Méthode 1: Navigateur Web (Le Plus Simple!)

#### Test 1: Hello World
1. Ouvrir votre navigateur (Chrome, Firefox, Edge)
2. Aller sur: `http://localhost:8084/api/abonnements/hello`
3. **Attendu**: Message de bienvenue

#### Test 2: Liste des abonnements
1. Aller sur: `http://localhost:8084/api/abonnements`
2. **Attendu**: JSON avec 3 abonnements

```json
[
  {
    "id_abonnement": 1,
    "nom": "Basic",
    "prix": 9.99,
    "duree_jours": 30,
    "statut": "Actif"
  },
  ...
]
```

### Méthode 2: PowerShell/CMD (Windows)

#### Test avec Invoke-WebRequest (PowerShell)
```powershell
# Test Hello
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/hello" | Select-Object -ExpandProperty Content

# Test GET tous les abonnements
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements" | Select-Object -ExpandProperty Content

# Test GET un abonnement
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/1" | Select-Object -ExpandProperty Content
```

#### Test POST (Créer un abonnement)
```powershell
$body = @{
    nom = "Gold"
    description = "Abonnement Gold"
    prix = 49.99
    duree_jours = 90
    niveau_acces = "Gold"
    acces_illimite = $true
    support_prioritaire = $true
    statut = "Actif"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Méthode 3: IntelliJ HTTP Client (Recommandé!)

#### Étape 1: Ouvrir le fichier de test
1. Dans IntelliJ, ouvrir `api-tests.http`
2. Vous verrez 31 requêtes prêtes à l'emploi

#### Étape 2: Exécuter les tests
1. Cliquer sur l'icône ▶️ verte à côté de chaque requête
2. Les résultats s'affichent dans le panneau du bas

#### Exemple de requêtes disponibles:
```http
### 1. Test Hello
GET http://localhost:8084/api/abonnements/hello

### 2. Get All Abonnements
GET http://localhost:8084/api/abonnements

### 3. Get By ID
GET http://localhost:8084/api/abonnements/1

### 4. Create Abonnement
POST http://localhost:8084/api/abonnements
Content-Type: application/json

{
  "nom": "Gold",
  "description": "Abonnement Gold",
  "prix": 49.99,
  "duree_jours": 90,
  "niveau_acces": "Gold",
  "acces_illimite": true,
  "support_prioritaire": true,
  "statut": "Actif"
}
```

### Méthode 4: Postman (Professionnel)

#### Étape 1: Installer Postman
1. Télécharger: https://www.postman.com/downloads/
2. Installer et lancer

#### Étape 2: Importer la collection
1. Dans Postman: File → Import
2. Sélectionner `Postman_Collection.json`
3. La collection "Abonnement Service API" apparaît

#### Étape 3: Tester
1. Dérouler la collection
2. Cliquer sur une requête
3. Cliquer sur "Send"
4. Voir la réponse en bas

---

## 📝 TESTS PAS À PAS

### 🎯 TEST 1: Vérifier que le service fonctionne

#### Avec le navigateur:
```
http://localhost:8084/api/abonnements/hello
```

**✅ Succès si vous voyez**:
```
Bienvenue dans le microservice de gestion des abonnements!
```

**❌ Échec si**:
- "Cette page est inaccessible" → Le service n'est pas démarré
- "Connection refused" → Vérifier le port 8084

---

### 🎯 TEST 2: Récupérer tous les abonnements

#### Avec le navigateur:
```
http://localhost:8084/api/abonnements
```

**✅ Succès si vous voyez un JSON avec 3 abonnements**:
```json
[
  {
    "id_abonnement": 1,
    "nom": "Basic",
    "description": "Abonnement de base pour débutants",
    "prix": 9.99,
    "duree_jours": 30,
    "niveau_acces": "Basique",
    "acces_illimite": false,
    "support_prioritaire": false,
    "statut": "Actif",
    "date_creation": "2024-..."
  },
  {
    "id_abonnement": 2,
    "nom": "Premium",
    ...
  },
  {
    "id_abonnement": 3,
    "nom": "Enterprise",
    ...
  }
]
```

---

### 🎯 TEST 3: Récupérer un abonnement spécifique

#### Avec le navigateur:
```
http://localhost:8084/api/abonnements/1
```

**✅ Succès**: JSON avec l'abonnement Basic

---

### 🎯 TEST 4: Créer un nouvel abonnement (POST)

#### Avec PowerShell:
```powershell
$body = @{
    nom = "Test"
    description = "Abonnement de test"
    prix = 19.99
    duree_jours = 30
    niveau_acces = "Test"
    acces_illimite = $false
    support_prioritaire = $false
    statut = "Actif"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**✅ Succès**: Status Code 201 (Created)

#### Vérifier la création:
```
http://localhost:8084/api/abonnements
```
Vous devriez maintenant voir 4 abonnements!

---

### 🎯 TEST 5: Modifier un abonnement (PUT)

#### Avec PowerShell:
```powershell
$body = @{
    nom = "Basic Updated"
    description = "Description modifiée"
    prix = 12.99
    duree_jours = 30
    niveau_acces = "Basique"
    acces_illimite = $false
    support_prioritaire = $false
    statut = "Actif"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/1" `
    -Method PUT `
    -Body $body `
    -ContentType "application/json"
```

**✅ Succès**: Status Code 200 (OK)

---

### 🎯 TEST 6: Changer le statut (PATCH)

#### Avec PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/1/statut?statut=Inactif" `
    -Method PATCH
```

**✅ Succès**: L'abonnement 1 est maintenant "Inactif"

---

### 🎯 TEST 7: Supprimer un abonnement (DELETE)

#### Avec PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/4" `
    -Method DELETE
```

**✅ Succès**: Status Code 204 (No Content)

---

### 🎯 TEST 8: Tester les paiements

#### Récupérer tous les paiements:
```
http://localhost:8084/api/abonnements/paiements
```

**✅ Succès**: JSON avec 2 paiements

#### Créer un nouveau paiement (PowerShell):
```powershell
$body = @{
    nom_client = "Test Client"
    email_client = "test@email.com"
    type_abonnement = "Premium"
    montant = 29.99
    methode_paiement = "Carte bancaire"
    reference_transaction = "TXN-TEST-001"
    statut = "Validé"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/paiements" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 🗄️ VÉRIFIER LA BASE DE DONNÉES

### Avec MySQL Workbench

#### Étape 1: Se connecter
1. Ouvrir MySQL Workbench
2. Se connecter à localhost:3306
3. Username: root
4. Password: (vide ou votre mot de passe)

#### Étape 2: Voir la base de données
```sql
USE abonnement_db;
```

#### Étape 3: Voir les tables
```sql
SHOW TABLES;
```

**✅ Attendu**:
```
+--------------------------------+
| Tables_in_abonnement_db        |
+--------------------------------+
| abonnements                    |
| historique_abonnements         |
+--------------------------------+
```

#### Étape 4: Voir les données
```sql
-- Voir tous les abonnements
SELECT * FROM abonnements;

-- Voir tous les paiements
SELECT * FROM historique_abonnements;

-- Compter les abonnements
SELECT COUNT(*) FROM abonnements;
```

### Avec la ligne de commande MySQL

```bash
# Se connecter
mysql -u root -p

# Utiliser la base
USE abonnement_db;

# Voir les abonnements
SELECT id_abonnement, nom, prix, statut FROM abonnements;

# Voir les paiements
SELECT id_paiement, nom_client, montant, statut FROM historique_abonnements;
```

---

## 🐛 RÉSOLUTION DES PROBLÈMES

### Problème 1: "Cannot connect to localhost:8084"

**Cause**: Le service n'est pas démarré

**Solution**:
1. Vérifier que le service tourne
2. Regarder les logs dans la console
3. Vérifier qu'il n'y a pas d'erreur au démarrage

### Problème 2: "Port 8084 already in use"

**Cause**: Un autre processus utilise le port 8084

**Solution 1**: Arrêter l'autre processus
```powershell
# Trouver le processus
netstat -ano | findstr :8084

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

**Solution 2**: Changer le port
```properties
# Dans application.properties
server.port=8085
```

### Problème 3: "Access denied for user 'root'@'localhost'"

**Cause**: Mauvais mot de passe MySQL

**Solution**:
```properties
# Dans application.properties
spring.datasource.password=votre_mot_de_passe
```

### Problème 4: "Table 'abonnement_db.abonnements' doesn't exist"

**Cause**: Les tables ne sont pas créées

**Solution**:
1. Vérifier `spring.jpa.hibernate.ddl-auto=create` dans application.properties
2. Redémarrer l'application
3. Les tables seront créées automatiquement

### Problème 5: Maven n'est pas installé

**Solution 1**: Installer Maven (voir section Installation)

**Solution 2**: Utiliser IntelliJ IDEA qui inclut Maven

---

## ✅ CHECKLIST DE TEST COMPLÈTE

### Tests de Base
- [ ] Le service démarre sans erreur
- [ ] GET /hello retourne un message
- [ ] GET /api/abonnements retourne 3 abonnements
- [ ] GET /api/abonnements/1 retourne l'abonnement Basic
- [ ] GET /api/abonnements/paiements retourne 2 paiements

### Tests CRUD Abonnements
- [ ] POST /api/abonnements crée un nouvel abonnement
- [ ] PUT /api/abonnements/1 modifie un abonnement
- [ ] PATCH /api/abonnements/1/statut change le statut
- [ ] DELETE /api/abonnements/4 supprime un abonnement

### Tests Recherche
- [ ] GET /api/abonnements/search/byNom?nom=Premium fonctionne
- [ ] GET /api/abonnements/search/byStatut?statut=Actif fonctionne
- [ ] GET /api/abonnements/search/byPrixMax?prix=50 fonctionne

### Tests Paiements
- [ ] POST /api/abonnements/paiements crée un paiement
- [ ] GET /api/abonnements/paiements/client/email fonctionne
- [ ] PATCH /api/abonnements/paiements/1/statut change le statut

### Tests Base de Données
- [ ] La base abonnement_db existe
- [ ] La table abonnements contient 3 lignes
- [ ] La table historique_abonnements contient 2 lignes

---

## 🎯 SCÉNARIO DE TEST COMPLET

### Scénario: Cycle de vie d'un abonnement

```
1. Démarrer le service
2. Vérifier qu'il y a 3 abonnements
3. Créer un nouvel abonnement "Gold"
4. Vérifier qu'il y a maintenant 4 abonnements
5. Modifier l'abonnement "Gold"
6. Changer son statut en "Inactif"
7. Créer un paiement pour cet abonnement
8. Vérifier le paiement dans la base
9. Supprimer l'abonnement "Gold"
10. Vérifier qu'il reste 3 abonnements
```

---

## 📊 RÉSULTATS ATTENDUS

### Après tous les tests, vous devriez avoir:

✅ Service démarré sur le port 8084
✅ Base de données `abonnement_db` créée
✅ 3 abonnements par défaut (Basic, Premium, Enterprise)
✅ 2 paiements par défaut
✅ Tous les endpoints fonctionnels
✅ CRUD complet opérationnel

---

## 🎉 FÉLICITATIONS!

Si tous les tests passent, votre microservice est **100% fonctionnel**! 🚀

### Prochaines étapes:
1. Intégrer avec le frontend Angular
2. Ajouter plus de fonctionnalités
3. Créer des tests automatisés
4. Déployer en production

---

**Besoin d'aide?** Consultez les autres fichiers de documentation!
