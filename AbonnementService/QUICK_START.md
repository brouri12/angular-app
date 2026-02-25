# ⚡ DÉMARRAGE RAPIDE - 5 MINUTES

## 🎯 Objectif
Avoir votre microservice fonctionnel en moins de 5 minutes!

## ✅ Prérequis (à vérifier avant de commencer)
```bash
# Vérifier Java 17+
java -version

# Vérifier Maven
mvn -version

# Vérifier MySQL (doit être démarré)
mysql --version
```

## 🚀 MÉTHODE 1: Script Automatique

### Windows
```bash
cd AbonnementService
START.bat
```

### Linux/Mac
```bash
cd AbonnementService
chmod +x start.sh
./start.sh
```

## 🚀 MÉTHODE 2: Commandes Manuelles

### Étape 1: Compiler (30 secondes)
```bash
cd AbonnementService
mvn clean install
```

### Étape 2: Démarrer (10 secondes)
```bash
mvn spring-boot:run
```

### Étape 3: Tester (5 secondes)
Ouvrez votre navigateur:
```
http://localhost:8084/api/abonnements/hello
```

Vous devriez voir:
```
Bienvenue dans le microservice de gestion des abonnements!
```

## 🚀 MÉTHODE 3: IntelliJ IDEA

### Étape 1: Ouvrir le projet
1. File → Open
2. Sélectionner le dossier `AbonnementService`
3. Attendre le chargement Maven (barre de progression en bas)

### Étape 2: Lancer
1. Ouvrir `AbonnementApplication.java`
2. Cliquer sur ▶️ (Run) à côté de la classe
3. Attendre 10 secondes

### Étape 3: Vérifier
Console devrait afficher:
```
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
```

## 🧪 TESTS RAPIDES

### Test 1: Hello World
```bash
curl http://localhost:8084/api/abonnements/hello
```

### Test 2: Liste des abonnements
```bash
curl http://localhost:8084/api/abonnements
```

### Test 3: Créer un abonnement
```bash
curl -X POST http://localhost:8084/api/abonnements \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "description": "Abonnement de test",
    "prix": 19.99,
    "duree_jours": 30,
    "niveau_acces": "Test",
    "acces_illimite": false,
    "support_prioritaire": false,
    "statut": "Actif"
  }'
```

## 📊 Vérifier la Base de Données

### MySQL Workbench
1. Ouvrir MySQL Workbench
2. Se connecter à localhost:3306
3. Voir la base `abonnement_db`
4. Tables: `abonnements` (3 lignes), `historique_abonnements` (2 lignes)

### Ligne de commande
```bash
mysql -u root -p
USE abonnement_db;
SELECT * FROM abonnements;
SELECT * FROM historique_abonnements;
```

## 🎯 Checklist de Succès

- [ ] Le service démarre sans erreur
- [ ] Port 8084 est accessible
- [ ] `/hello` retourne un message
- [ ] `/api/abonnements` retourne 3 abonnements
- [ ] La base de données contient les données
- [ ] Vous pouvez créer un nouvel abonnement

## 🐛 Problèmes Courants

### "Port 8084 already in use"
**Solution:** Changez le port dans `application.properties`
```properties
server.port=8085
```

### "Access denied for user 'root'"
**Solution:** Mettez à jour le mot de passe dans `application.properties`
```properties
spring.datasource.password=votre_mot_de_passe
```

### "Cannot connect to MySQL"
**Solution:** Démarrez MySQL
```bash
# Windows (XAMPP)
Démarrer XAMPP → Start MySQL

# Windows (Service)
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
```

### Maven ne télécharge pas les dépendances
**Solution:** Vérifiez votre connexion Internet et réessayez
```bash
mvn clean install -U
```

## 📱 Tester avec Postman

### Import rapide
1. Ouvrir Postman
2. File → Import
3. Sélectionner `Postman_Collection.json`
4. Exécuter les requêtes

## 🎉 Félicitations!

Si tous les tests passent, votre microservice est opérationnel! 🚀

### Prochaines étapes:
1. Explorez les autres endpoints dans `README.md`
2. Testez avec le fichier `api-tests.http`
3. Consultez `GUIDE_INTELLIJ.md` pour plus de détails
4. Lisez `RESUME_COMPLET.md` pour comprendre l'architecture

---

**Temps total: ~5 minutes** ⏱️

**Besoin d'aide?** Consultez les autres fichiers de documentation!
