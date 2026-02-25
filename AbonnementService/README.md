# 🚀 Microservice de Gestion des Abonnements

## 📋 Description
Microservice Spring Boot pour la gestion des abonnements et de l'historique des paiements.

## 🛠️ Technologies Utilisées
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL
- Spring Cloud Netflix Eureka Client
- Maven

## 📁 Structure du Projet
```
AbonnementService/
├── src/
│   └── main/
│       ├── java/
│       │   └── tn/esprit/abonnement/
│       │       ├── entity/
│       │       │   ├── Abonnement.java
│       │       │   └── HistoriqueAbonnement.java
│       │       ├── repository/
│       │       │   ├── AbonnementRepository.java
│       │       │   └── HistoriqueAbonnementRepository.java
│       │       ├── service/
│       │       │   ├── AbonnementService.java
│       │       │   └── HistoriqueAbonnementService.java
│       │       ├── controller/
│       │       │   └── AbonnementRestAPI.java
│       │       └── AbonnementApplication.java
│       └── resources/
│           └── application.properties
└── pom.xml
```

## 🚀 PHASE 4 - EXÉCUTION ET TESTS

### Étape 1: Démarrer MySQL
```bash
# Assurez-vous que MySQL est installé et démarré
# Le service créera automatiquement la base de données 'abonnement_db'

# Vérifiez que MySQL fonctionne sur le port 3306
# Username: root
# Password: (vide par défaut, modifiez dans application.properties si nécessaire)
```

### Étape 2: Démarrer le serveur Eureka
```bash
# Vous devez avoir un serveur Eureka qui tourne sur le port 8761
# Si vous n'en avez pas, créez-en un ou commentez @EnableDiscoveryClient
```

### Étape 3: Compiler et lancer le microservice

#### Option A: Avec Maven (ligne de commande)
```bash
cd AbonnementService
mvn clean install
mvn spring-boot:run
```

#### Option B: Avec IntelliJ IDEA
1. Ouvrez le projet dans IntelliJ
2. Attendez que Maven télécharge toutes les dépendances
3. Clic droit sur `AbonnementApplication.java`
4. Sélectionnez "Run 'AbonnementApplication'"

### Étape 4: Vérifier le démarrage
Vous devriez voir dans la console:
```
✅ Microservice Abonnement démarré avec succès!
📍 Port: 8084
🌐 URL: http://localhost:8084/api/abonnements
🔍 Eureka: http://localhost:8761
```

### Étape 5: Vérifier l'enregistrement dans Eureka
Ouvrez votre navigateur: http://localhost:8761
Vous devriez voir "ABONNEMENT-SERVICE" dans la liste des services enregistrés.

## 📡 PHASE 5 - URLS DES ENDPOINTS

### 🧪 Endpoint de Test
```
GET http://localhost:8084/api/abonnements/hello
```

### 📦 Endpoints Abonnements

#### 1. Récupérer tous les abonnements
```
GET http://localhost:8084/api/abonnements
```

#### 2. Récupérer un abonnement par ID
```
GET http://localhost:8084/api/abonnements/1
```

#### 3. Rechercher par nom (avec pagination)
```
GET http://localhost:8084/api/abonnements/search/byNom?nom=Premium&page=0&size=10
```

#### 4. Rechercher par statut
```
GET http://localhost:8084/api/abonnements/search/byStatut?statut=Actif
```

#### 5. Rechercher par prix maximum
```
GET http://localhost:8084/api/abonnements/search/byPrixMax?prix=50.00
```

#### 6. Ajouter un nouvel abonnement
```
POST http://localhost:8084/api/abonnements
Content-Type: application/json

{
  "nom": "Gold",
  "description": "Abonnement Gold avec avantages exclusifs",
  "prix": 49.99,
  "duree_jours": 90,
  "niveau_acces": "Gold",
  "acces_illimite": true,
  "support_prioritaire": true,
  "statut": "Actif"
}
```

#### 7. Mettre à jour un abonnement
```
PUT http://localhost:8084/api/abonnements/1
Content-Type: application/json

{
  "nom": "Basic Updated",
  "description": "Description mise à jour",
  "prix": 12.99,
  "duree_jours": 30,
  "niveau_acces": "Basique",
  "acces_illimite": false,
  "support_prioritaire": false,
  "statut": "Actif"
}
```

#### 8. Mettre à jour uniquement le statut
```
PATCH http://localhost:8084/api/abonnements/1/statut?statut=Inactif
```

#### 9. Supprimer un abonnement
```
DELETE http://localhost:8084/api/abonnements/1
```

### 💳 Endpoints Historique Paiements

#### 10. Ajouter un nouveau paiement
```
POST http://localhost:8084/api/abonnements/paiements
Content-Type: application/json

{
  "nom_client": "Sophie Dubois",
  "email_client": "sophie.dubois@email.com",
  "type_abonnement": "Premium",
  "montant": 29.99,
  "methode_paiement": "Carte bancaire",
  "reference_transaction": "TXN-2024-003",
  "statut": "Validé"
}
```

#### 11. Récupérer tous les paiements
```
GET http://localhost:8084/api/abonnements/paiements
```

#### 12. Récupérer un paiement par ID
```
GET http://localhost:8084/api/abonnements/paiements/1
```

#### 13. Récupérer les paiements d'un client
```
GET http://localhost:8084/api/abonnements/paiements/client/jean.dupont@email.com
```

#### 14. Rechercher les paiements par statut
```
GET http://localhost:8084/api/abonnements/paiements/search/byStatut?statut=Validé
```

#### 15. Mettre à jour le statut d'un paiement
```
PATCH http://localhost:8084/api/abonnements/paiements/1/statut?statut=Remboursé
```

#### 16. Supprimer un paiement
```
DELETE http://localhost:8084/api/abonnements/paiements/1
```

## 🧪 Tester avec Postman

### Import dans Postman
1. Créez une nouvelle collection "Abonnement Service"
2. Ajoutez les requêtes ci-dessus
3. Testez chaque endpoint

### Exemple de test complet:
1. **GET /hello** → Vérifier que le service répond
2. **GET /api/abonnements** → Voir les 3 abonnements par défaut
3. **POST /api/abonnements** → Créer un nouvel abonnement
4. **GET /api/abonnements/4** → Récupérer l'abonnement créé
5. **PUT /api/abonnements/4** → Modifier l'abonnement
6. **PATCH /api/abonnements/4/statut?statut=Inactif** → Changer le statut
7. **DELETE /api/abonnements/4** → Supprimer l'abonnement

## 📊 Données par Défaut

### Abonnements créés automatiquement:
1. **Basic** - 9.99€/mois
2. **Premium** - 29.99€/mois
3. **Enterprise** - 99.99€/an

### Paiements créés automatiquement:
1. Jean Dupont - Premium - 29.99€
2. Marie Martin - Basic - 9.99€

## ⚙️ Configuration

### Modifier le port
Dans `application.properties`:
```properties
server.port=8084
```

### Modifier la base de données
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/abonnement_db
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

### Désactiver Eureka (si non disponible)
Commentez dans `AbonnementApplication.java`:
```java
// @EnableDiscoveryClient
```

Et dans `application.properties`:
```properties
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

## 🐛 Résolution des Problèmes

### Erreur de connexion MySQL
- Vérifiez que MySQL est démarré
- Vérifiez le username/password dans application.properties
- Vérifiez que le port 3306 est disponible

### Port 8084 déjà utilisé
Changez le port dans application.properties:
```properties
server.port=8085
```

### Eureka non disponible
Commentez `@EnableDiscoveryClient` ou démarrez un serveur Eureka

## 📝 Bonnes Pratiques Implémentées

✅ Gestion des erreurs avec ResponseEntity et HttpStatus
✅ Utilisation d'Optional pour éviter les NullPointerException
✅ Séparation des couches (Entity, Repository, Service, Controller)
✅ Annotations JPA correctes
✅ CORS activé pour les appels depuis le frontend
✅ Pagination pour les recherches
✅ Données de test insérées automatiquement

## 🎯 Prochaines Étapes

1. Ajouter la validation des données (@Valid, @NotNull, etc.)
2. Implémenter la sécurité avec Spring Security
3. Ajouter des tests unitaires et d'intégration
4. Documenter l'API avec Swagger/OpenAPI
5. Ajouter un système de logs avec Logback
6. Implémenter un système de cache avec Redis

## 📞 Support

Pour toute question ou problème, vérifiez:
- Les logs de la console
- La base de données MySQL
- Le serveur Eureka
- Les ports utilisés

---
✨ **Microservice créé avec succès!** ✨
