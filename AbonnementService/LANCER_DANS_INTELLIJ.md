# 🚀 COMMENT LANCER L'APPLICATION DANS INTELLIJ

## ❌ ERREUR QUE VOUS AVEZ RENCONTRÉE

```
[ERROR] No goals have been specified for this build.
```

**Cause**: Vous avez essayé de lancer Maven sans spécifier ce qu'il doit faire.

## ✅ SOLUTION: Lancer l'Application Java Directement

### Méthode 1: Lancer la Classe Principale (RECOMMANDÉ)

#### Étape 1: Ouvrir la classe principale
1. Dans IntelliJ, naviguer vers:
   ```
   src/main/java/tn/esprit/abonnement/AbonnementApplication.java
   ```

2. Double-cliquer pour ouvrir le fichier

#### Étape 2: Lancer l'application
Vous avez 3 options:

**Option A: Clic droit**
1. Clic droit n'importe où dans le fichier `AbonnementApplication.java`
2. Sélectionner **"Run 'AbonnementApplication.main()'"**

**Option B: Icône verte**
1. Chercher l'icône ▶️ verte à côté de la ligne:
   ```java
   public class AbonnementApplication {
   ```
2. Cliquer sur l'icône ▶️
3. Sélectionner **"Run 'AbonnementApplication'"**

**Option C: Raccourci clavier**
1. Placer le curseur dans le fichier `AbonnementApplication.java`
2. Appuyer sur **Shift + F10** (Windows/Linux) ou **Ctrl + R** (Mac)

#### Étape 3: Vérifier le démarrage
Dans la console en bas, vous devriez voir:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

🔄 Initialisation des données par défaut...
✅ 3 abonnements créés avec succès!
✅ 2 paiements créés avec succès!
📊 Base de données initialisée!
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
```

---

### Méthode 2: Utiliser Maven dans IntelliJ

#### Étape 1: Ouvrir le panneau Maven
1. Cliquer sur **"Maven"** dans la barre latérale droite
2. Ou aller dans **View → Tool Windows → Maven**

#### Étape 2: Exécuter spring-boot:run
1. Dérouler **AbonnementService**
2. Dérouler **Plugins**
3. Dérouler **spring-boot**
4. Double-cliquer sur **spring-boot:run**

---

### Méthode 3: Créer une Configuration de Lancement

#### Étape 1: Créer la configuration
1. Cliquer sur le menu déroulant en haut à droite (à côté de ▶️)
2. Sélectionner **"Edit Configurations..."**

#### Étape 2: Ajouter une nouvelle configuration
1. Cliquer sur **"+"** en haut à gauche
2. Sélectionner **"Application"**

#### Étape 3: Configurer
- **Name**: `AbonnementService`
- **Main class**: Cliquer sur **"..."** et chercher `AbonnementApplication`
- **Module**: Sélectionner `AbonnementService`
- **JRE**: Java 17 ou supérieur

#### Étape 4: Appliquer et lancer
1. Cliquer sur **"Apply"** puis **"OK"**
2. Cliquer sur l'icône ▶️ verte en haut à droite

---

## 🔧 AVANT DE LANCER: VÉRIFICATIONS

### 1. MySQL est démarré
```bash
# Windows (XAMPP)
Ouvrir XAMPP Control Panel → Start MySQL

# Windows (Service)
net start MySQL80
```

### 2. Le port 8084 est libre
```powershell
# Vérifier si le port est utilisé
netstat -ano | findstr :8084

# Si occupé, tuer le processus
taskkill /PID <PID> /F
```

### 3. Les dépendances Maven sont téléchargées
- Regarder la barre de progression en bas d'IntelliJ
- Attendre que "Indexing" soit terminé
- Si problème: Clic droit sur `pom.xml` → **Maven → Reload Project**

---

## 🧪 TESTER L'APPLICATION

### Test 1: Dans le navigateur
```
http://localhost:8084/api/abonnements/hello
```

**✅ Attendu**: Message de bienvenue

### Test 2: Avec IntelliJ HTTP Client
1. Ouvrir le fichier: `api-tests.http`
2. Cliquer sur ▶️ à côté de la première requête:
   ```http
   GET http://localhost:8084/api/abonnements/hello
   ```

### Test 3: Voir les logs
Dans la console IntelliJ, vous devriez voir:
- Aucune erreur en rouge
- Le message de démarrage réussi
- Les logs SQL (création des tables)

---

## 🐛 RÉSOLUTION DES PROBLÈMES

### Problème 1: "Cannot resolve symbol 'springframework'"

**Solution**:
1. Clic droit sur `pom.xml`
2. Sélectionner **Maven → Reload Project**
3. Attendre le téléchargement des dépendances

### Problème 2: "Port 8084 already in use"

**Solution**:
```powershell
# Trouver le processus
netstat -ano | findstr :8084

# Tuer le processus (remplacer <PID>)
taskkill /PID <PID> /F
```

### Problème 3: "Access denied for user 'root'@'localhost'"

**Solution**:
1. Ouvrir: `src/main/resources/application.properties`
2. Modifier:
   ```properties
   spring.datasource.password=votre_mot_de_passe
   ```
3. Relancer l'application

### Problème 4: "Table doesn't exist"

**Solution**:
1. Vérifier dans `application.properties`:
   ```properties
   spring.jpa.hibernate.ddl-auto=create
   ```
2. Redémarrer l'application
3. Les tables seront créées automatiquement

### Problème 5: Java version incorrecte

**Solution**:
1. **File → Project Structure** (Ctrl+Alt+Shift+S)
2. **Project Settings → Project**
3. **SDK**: Sélectionner Java 17 ou supérieur
4. Si Java 17 n'est pas disponible:
   - Cliquer sur **Add SDK → Download JDK**
   - Sélectionner **Version 17**
   - Télécharger et installer

---

## 📊 VÉRIFIER QUE ÇA MARCHE

### Checklist:
- [ ] L'application démarre sans erreur
- [ ] Vous voyez le logo Spring Boot dans la console
- [ ] Vous voyez "✅ Microservice Abonnement démarré avec succès!"
- [ ] http://localhost:8084/api/abonnements/hello retourne un message
- [ ] http://localhost:8084/api/abonnements retourne 3 abonnements

---

## 🎯 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────────────────┐
│  1. Ouvrir AbonnementApplication.java                       │
│  2. Clic droit → Run 'AbonnementApplication.main()'         │
│  3. Attendre 10-15 secondes                                 │
│  4. Voir le message de succès dans la console               │
│  5. Tester: http://localhost:8084/api/abonnements/hello     │
│  6. ✅ Ça marche!                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚫 NE PAS FAIRE

❌ Ne pas lancer Maven sans goal
❌ Ne pas essayer de compiler manuellement
❌ Ne pas modifier le pom.xml sans raison

## ✅ À FAIRE

✅ Lancer directement la classe `AbonnementApplication`
✅ Utiliser les configurations de lancement IntelliJ
✅ Vérifier les logs dans la console

---

## 📞 BESOIN D'AIDE?

Si ça ne marche toujours pas:

1. **Vérifier les logs**: Regarder les erreurs en rouge dans la console
2. **Vérifier MySQL**: S'assurer que MySQL tourne
3. **Vérifier Java**: S'assurer d'utiliser Java 17+
4. **Redémarrer IntelliJ**: Parfois ça aide!

---

## 🎉 FÉLICITATIONS!

Une fois que vous voyez le message de succès, votre microservice est opérationnel!

Vous pouvez maintenant:
- Tester les endpoints dans le navigateur
- Utiliser le fichier `api-tests.http`
- Exécuter le script PowerShell `test-api.ps1`
- Importer la collection Postman

**Bonne chance! 🚀**
