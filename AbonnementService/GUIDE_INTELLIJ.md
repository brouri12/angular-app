# 📘 Guide d'Installation avec IntelliJ IDEA

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir installé:
- ✅ Java JDK 17 ou supérieur
- ✅ IntelliJ IDEA (Community ou Ultimate)
- ✅ MySQL Server
- ✅ Maven (généralement inclus avec IntelliJ)

## 📥 Étape 1: Importer le Projet dans IntelliJ

### Option A: Ouvrir le projet existant
1. Lancez IntelliJ IDEA
2. Cliquez sur **File** → **Open**
3. Naviguez vers le dossier `AbonnementService`
4. Sélectionnez le dossier et cliquez sur **OK**
5. IntelliJ détectera automatiquement le fichier `pom.xml`
6. Cliquez sur **Trust Project** si demandé

### Option B: Créer un nouveau projet Spring Boot
1. Lancez IntelliJ IDEA
2. Cliquez sur **File** → **New** → **Project**
3. Sélectionnez **Spring Initializr** dans le menu de gauche
4. Configurez:
   - **Name**: AbonnementService
   - **Group**: tn.esprit
   - **Artifact**: abonnement-service
   - **Type**: Maven
   - **Language**: Java
   - **Packaging**: Jar
   - **Java**: 17
   - **Spring Boot**: 3.2.0
5. Cliquez sur **Next**
6. Ajoutez les dépendances:
   - Spring Web
   - Spring Data JPA
   - MySQL Driver
   - Eureka Discovery Client
7. Cliquez sur **Create**

## ⚙️ Étape 2: Configuration du Projet

### 2.1 Vérifier la configuration Maven
1. Ouvrez le fichier `pom.xml`
2. IntelliJ devrait automatiquement télécharger les dépendances
3. Si ce n'est pas le cas, clic droit sur `pom.xml` → **Maven** → **Reload Project**
4. Attendez que toutes les dépendances soient téléchargées (barre de progression en bas)

### 2.2 Configurer le JDK
1. Allez dans **File** → **Project Structure** (Ctrl+Alt+Shift+S)
2. Dans **Project Settings** → **Project**
3. Vérifiez que **SDK** est configuré sur Java 17
4. Si Java 17 n'est pas disponible:
   - Cliquez sur **Add SDK** → **Download JDK**
   - Sélectionnez **Version 17** et un vendor (ex: Oracle OpenJDK)
   - Cliquez sur **Download**

### 2.3 Activer l'annotation processing (pour Lombok)
1. Allez dans **File** → **Settings** (Ctrl+Alt+S)
2. Naviguez vers **Build, Execution, Deployment** → **Compiler** → **Annotation Processors**
3. Cochez **Enable annotation processing**
4. Cliquez sur **Apply** puis **OK**

## 🗄️ Étape 3: Configuration de MySQL

### 3.1 Démarrer MySQL
```bash
# Windows (avec XAMPP)
Démarrez XAMPP Control Panel et cliquez sur "Start" pour MySQL

# Windows (service)
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
# ou
sudo service mysql start
```

### 3.2 Vérifier la connexion MySQL
1. Ouvrez MySQL Workbench ou un client MySQL
2. Connectez-vous avec:
   - Host: localhost
   - Port: 3306
   - Username: root
   - Password: (vide ou votre mot de passe)

### 3.3 Configurer application.properties
1. Ouvrez `src/main/resources/application.properties`
2. Modifiez si nécessaire:
```properties
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

## 🚀 Étape 4: Lancer le Microservice

### 4.1 Première méthode: Via la classe principale
1. Ouvrez `AbonnementApplication.java`
2. Clic droit dans le fichier
3. Sélectionnez **Run 'AbonnementApplication'**
4. Ou cliquez sur l'icône ▶️ verte à côté de la classe

### 4.2 Deuxième méthode: Via Maven
1. Ouvrez le panneau **Maven** (View → Tool Windows → Maven)
2. Dépliez **AbonnementService** → **Plugins** → **spring-boot**
3. Double-cliquez sur **spring-boot:run**

### 4.3 Troisième méthode: Via le terminal IntelliJ
1. Ouvrez le terminal intégré (Alt+F12)
2. Exécutez:
```bash
mvn clean install
mvn spring-boot:run
```

## ✅ Étape 5: Vérifier le Démarrage

### 5.1 Console IntelliJ
Vous devriez voir dans la console:
```
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
🌐 URL: http://localhost:8084/api/abonnements
🔍 Eureka: http://localhost:8761
```

### 5.2 Tester l'endpoint
1. Ouvrez votre navigateur
2. Allez sur: http://localhost:8084/api/abonnements/hello
3. Vous devriez voir: "Bienvenue dans le microservice de gestion des abonnements!"

### 5.3 Vérifier la base de données
1. Ouvrez MySQL Workbench
2. Vous devriez voir une nouvelle base `abonnement_db`
3. Vérifiez les tables:
   - `abonnements` (3 lignes)
   - `historique_abonnements` (2 lignes)

## 🔧 Étape 6: Configuration d'Eureka (Optionnel)

### Si vous n'avez pas de serveur Eureka:

#### Option 1: Désactiver Eureka
1. Ouvrez `AbonnementApplication.java`
2. Commentez l'annotation:
```java
// @EnableDiscoveryClient
```

3. Ouvrez `application.properties`
4. Ajoutez:
```properties
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

#### Option 2: Créer un serveur Eureka
1. Créez un nouveau projet Spring Boot
2. Ajoutez la dépendance **Eureka Server**
3. Annotez la classe principale avec `@EnableEurekaServer`
4. Configurez le port 8761 dans application.properties
5. Démarrez le serveur avant votre microservice

## 🧪 Étape 7: Tester avec l'outil HTTP d'IntelliJ

### 7.1 Créer un fichier de requêtes HTTP
1. Clic droit sur le dossier racine → **New** → **HTTP Request**
2. Nommez-le `api-tests.http`
3. Ajoutez vos requêtes:

```http
### Test Hello
GET http://localhost:8084/api/abonnements/hello

### Get All Abonnements
GET http://localhost:8084/api/abonnements

### Get Abonnement By ID
GET http://localhost:8084/api/abonnements/1

### Create Abonnement
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

### Update Statut
PATCH http://localhost:8084/api/abonnements/1/statut?statut=Inactif

### Delete Abonnement
DELETE http://localhost:8084/api/abonnements/1
```

4. Cliquez sur l'icône ▶️ à côté de chaque requête pour l'exécuter

## 🐛 Résolution des Problèmes Courants

### Problème 1: "Cannot resolve symbol 'springframework'"
**Solution:**
1. Clic droit sur `pom.xml` → **Maven** → **Reload Project**
2. **File** → **Invalidate Caches** → **Invalidate and Restart**

### Problème 2: "Port 8084 already in use"
**Solution:**
1. Changez le port dans `application.properties`:
```properties
server.port=8085
```
2. Ou arrêtez l'application qui utilise le port 8084

### Problème 3: "Access denied for user 'root'@'localhost'"
**Solution:**
1. Vérifiez votre mot de passe MySQL
2. Mettez à jour `application.properties`:
```properties
spring.datasource.password=votre_mot_de_passe
```

### Problème 4: "Table 'abonnement_db.abonnements' doesn't exist"
**Solution:**
1. Vérifiez que `spring.jpa.hibernate.ddl-auto=create` dans application.properties
2. Redémarrez l'application
3. Les tables seront créées automatiquement

### Problème 5: Maven ne télécharge pas les dépendances
**Solution:**
1. Vérifiez votre connexion Internet
2. **File** → **Settings** → **Build, Execution, Deployment** → **Maven**
3. Vérifiez que "Work offline" n'est PAS coché
4. Clic droit sur `pom.xml` → **Maven** → **Reimport**

## 📊 Étape 8: Visualiser la Base de Données dans IntelliJ

### 8.1 Configurer la connexion (IntelliJ Ultimate uniquement)
1. Ouvrez **View** → **Tool Windows** → **Database**
2. Cliquez sur **+** → **Data Source** → **MySQL**
3. Configurez:
   - Host: localhost
   - Port: 3306
   - Database: abonnement_db
   - User: root
   - Password: (votre mot de passe)
4. Cliquez sur **Test Connection**
5. Si succès, cliquez sur **OK**

### 8.2 Explorer les données
1. Dépliez **abonnement_db** → **tables**
2. Double-cliquez sur une table pour voir les données
3. Vous pouvez exécuter des requêtes SQL directement

## 🎯 Étape 9: Déboguer l'Application

### 9.1 Ajouter des points d'arrêt
1. Cliquez dans la marge gauche d'une ligne de code
2. Un point rouge apparaît

### 9.2 Lancer en mode debug
1. Clic droit sur `AbonnementApplication.java`
2. Sélectionnez **Debug 'AbonnementApplication'**
3. Ou cliquez sur l'icône 🐛 debug

### 9.3 Utiliser le debugger
- **F8**: Step Over (ligne suivante)
- **F7**: Step Into (entrer dans la méthode)
- **F9**: Resume (continuer jusqu'au prochain breakpoint)

## 📝 Raccourcis Clavier Utiles

- **Ctrl + Alt + L**: Formater le code
- **Ctrl + Space**: Auto-complétion
- **Ctrl + B**: Aller à la définition
- **Alt + Enter**: Actions rapides / corrections
- **Shift + F10**: Run
- **Shift + F9**: Debug
- **Ctrl + F9**: Build project
- **Alt + F12**: Terminal

## ✨ Félicitations!

Votre microservice est maintenant configuré et prêt à l'emploi dans IntelliJ IDEA! 🎉

Pour toute question, consultez:
- La documentation Spring Boot: https://spring.io/projects/spring-boot
- La documentation IntelliJ: https://www.jetbrains.com/help/idea/
