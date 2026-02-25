# 🧪 COMMENT TESTER - Guide Ultra Simple

## 🎯 VOUS N'AVEZ PAS MAVEN? PAS DE PROBLÈME!

### ✅ SOLUTION 1: Utiliser IntelliJ IDEA (LE PLUS SIMPLE!)

IntelliJ IDEA inclut Maven automatiquement. C'est la méthode la plus simple!

#### Étape 1: Télécharger IntelliJ IDEA
1. Aller sur: https://www.jetbrains.com/idea/download/
2. Télécharger **IntelliJ IDEA Community Edition** (GRATUIT)
3. Installer

#### Étape 2: Ouvrir le projet
1. Lancer IntelliJ IDEA
2. Cliquer sur **"Open"**
3. Sélectionner le dossier `AbonnementService`
4. Cliquer sur **"OK"**
5. Attendre que Maven télécharge les dépendances (barre en bas)

#### Étape 3: Démarrer MySQL
```bash
# Si vous avez XAMPP
Ouvrir XAMPP Control Panel → Start MySQL

# Ou démarrer le service Windows
net start MySQL80
```

#### Étape 4: Lancer le service
1. Dans IntelliJ, ouvrir: `src/main/java/tn/esprit/abonnement/AbonnementApplication.java`
2. Clic droit dans le fichier
3. Sélectionner **"Run 'AbonnementApplication'"**
4. Attendre 10-15 secondes

#### Étape 5: Tester dans le navigateur
Ouvrir votre navigateur et aller sur:
```
http://localhost:8084/api/abonnements/hello
```

**✅ Si vous voyez un message de bienvenue, ça marche!**

---

### ✅ SOLUTION 2: Tester avec le Navigateur (SANS CODER!)

Une fois le service démarré (avec IntelliJ), vous pouvez tout tester dans votre navigateur!

#### Test 1: Hello World
```
http://localhost:8084/api/abonnements/hello
```
**Attendu**: Message de bienvenue

#### Test 2: Voir tous les abonnements
```
http://localhost:8084/api/abonnements
```
**Attendu**: JSON avec 3 abonnements (Basic, Premium, Enterprise)

#### Test 3: Voir un abonnement spécifique
```
http://localhost:8084/api/abonnements/1
```
**Attendu**: JSON avec l'abonnement Basic

#### Test 4: Voir tous les paiements
```
http://localhost:8084/api/abonnements/paiements
```
**Attendu**: JSON avec 2 paiements

#### Test 5: Rechercher par nom
```
http://localhost:8084/api/abonnements/search/byNom?nom=Premium&page=0&size=10
```
**Attendu**: JSON avec l'abonnement Premium

---

### ✅ SOLUTION 3: Tester avec PowerShell (POUR LES TESTS AVANCÉS)

#### Test Simple (GET)
```powershell
# Ouvrir PowerShell et exécuter:
Invoke-WebRequest -Uri "http://localhost:8084/api/abonnements/hello"
```

#### Créer un abonnement (POST)
```powershell
$body = @{
    nom = "Test"
    description = "Test"
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

#### Script de test automatique
```powershell
# Exécuter le script de test complet
cd AbonnementService
.\test-api.ps1
```

---

### ✅ SOLUTION 4: Tester avec IntelliJ HTTP Client

#### Étape 1: Ouvrir le fichier de test
Dans IntelliJ, ouvrir: `api-tests.http`

#### Étape 2: Exécuter les tests
1. Vous verrez 31 requêtes prêtes
2. Cliquer sur l'icône ▶️ verte à côté de chaque requête
3. Les résultats s'affichent en bas

**C'est la méthode la plus professionnelle!**

---

## 📊 VÉRIFIER LA BASE DE DONNÉES

### Avec MySQL Workbench

#### Étape 1: Ouvrir MySQL Workbench
1. Lancer MySQL Workbench
2. Se connecter à localhost:3306
3. Username: `root`
4. Password: (vide ou votre mot de passe)

#### Étape 2: Voir les données
```sql
-- Utiliser la base
USE abonnement_db;

-- Voir les tables
SHOW TABLES;

-- Voir les abonnements
SELECT * FROM abonnements;

-- Voir les paiements
SELECT * FROM historique_abonnements;
```

**✅ Vous devriez voir**:
- 3 abonnements (Basic, Premium, Enterprise)
- 2 paiements

---

## 🎯 CHECKLIST RAPIDE

### Avant de tester:
- [ ] MySQL est démarré
- [ ] IntelliJ IDEA est installé (ou Maven)
- [ ] Le projet est ouvert dans IntelliJ
- [ ] Le service est démarré (voir les logs)

### Tests de base:
- [ ] http://localhost:8084/api/abonnements/hello fonctionne
- [ ] http://localhost:8084/api/abonnements retourne 3 abonnements
- [ ] La base de données contient les données

### Si ça ne marche pas:
1. Vérifier que MySQL tourne
2. Vérifier les logs dans IntelliJ (erreurs en rouge)
3. Vérifier que le port 8084 n'est pas utilisé
4. Redémarrer le service

---

## 🚀 DÉMARRAGE RAPIDE (RÉSUMÉ)

```
1. Installer IntelliJ IDEA Community (gratuit)
2. Ouvrir le projet AbonnementService
3. Démarrer MySQL
4. Run 'AbonnementApplication' dans IntelliJ
5. Ouvrir http://localhost:8084/api/abonnements/hello
6. ✅ Ça marche!
```

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez:
- **GUIDE_TEST_COMPLET.md** - Guide exhaustif de test
- **GUIDE_INTELLIJ.md** - Configuration IntelliJ détaillée
- **README.md** - Documentation complète de l'API

---

## 🆘 BESOIN D'AIDE?

### Problème: "Maven n'est pas reconnu"
**Solution**: Utilisez IntelliJ IDEA qui inclut Maven!

### Problème: "Cannot connect to localhost:8084"
**Solution**: Le service n'est pas démarré. Lancez-le dans IntelliJ.

### Problème: "Access denied for MySQL"
**Solution**: Vérifiez le mot de passe dans `application.properties`

### Problème: "Port 8084 already in use"
**Solution**: 
```powershell
# Trouver et tuer le processus
netstat -ano | findstr :8084
taskkill /PID <PID> /F
```

---

## 🎉 C'EST TOUT!

Avec IntelliJ IDEA, vous n'avez pas besoin d'installer Maven séparément.
Tout est inclus et prêt à l'emploi!

**Bonne chance! 🚀**
