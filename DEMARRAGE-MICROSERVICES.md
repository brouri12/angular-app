# Démarrage des microservices (Eureka + Formation + Gateway)

## Ordre de démarrage

Ouvrir **4 terminaux** (PowerShell ou CMD). Eureka doit être démarré en premier.

### 1. Eureka Server (port 8761)

```powershell
cd c:\Users\Rahali\Desktop\pi06\pi\eureka-server
.\mvnw.cmd spring-boot:run
```

→ Attendre "Started EurekaServerApplication".  
→ Dashboard : **http://localhost:8761**

---

### 2. Formation Service (port 8081)

```powershell
cd c:\Users\Rahali\Desktop\pi06\pi\formation-service
.\mvnw.cmd spring-boot:run
```

→ Attendre "Started FormationServiceApplication".  
→ Le service s’enregistre dans Eureka sous le nom **FORMATION-SERVICE**.

---

### 3. Quiz-Badge Service (port 8082)

Le fichier dupliqué `BadgeAttributionServiceSimple.java` a été supprimé ; le service compile et peut s’enregistrer dans Eureka.

```powershell
cd c:\Users\Rahali\Desktop\pi06\pi\quiz-badge-service
.\mvnw.cmd spring-boot:run
```

→ S’enregistre dans Eureka sous **QUIZ-BADGE-SERVICE**.

---

### 4. API Gateway (port 8080)

Démarrer **après** Eureka et au moins un des services (formation ou quiz-badge) :

```powershell
cd c:\Users\Rahali\Desktop\pi06\pi\api-gateway
.\mvnw.cmd spring-boot:run
```

→ S’enregistre dans Eureka sous **API-GATEWAY**.  
→ Toutes les requêtes passent par : **http://localhost:8080**  
  (ex. http://localhost:8080/api/students si l’API Node est sur 8083 et configurée dans la gateway).

---

## Vérification dans Eureka

1. Ouvrir **http://localhost:8761**
2. Dans **"Instances currently registered with Eureka"** vous devriez voir :
   - **FORMATION-SERVICE** (après démarrage du formation-service)
   - **API-GATEWAY** (après démarrage de la gateway)
   - **QUIZ-BADGE-SERVICE** (après correction du code et démarrage)

---

## Ports récapitulatifs

| Service            | Port | URL principale        |
|--------------------|------|------------------------|
| Eureka Server      | 8761 | http://localhost:8761 |
| Formation Service  | 8081 | http://localhost:8081 |
| Quiz-Badge Service | 8082 | http://localhost:8082 |
| API Gateway        | 8080 | http://localhost:8080 |
| API Node (backend) | 8083 | http://localhost:8083 |

---

## Modifications effectuées

- **eureka-server** : déjà configuré, aucun changement.
- **formation-service** : ajout de l’URL Eureka dans `application.properties` ; H2 en scope `runtime` pour que le service démarre avec la config actuelle (H2 en mémoire).
- **quiz-badge-service** : dépendance Eureka + `@EnableDiscoveryClient` + URL Eureka dans `application.properties`. Le projet ne compile pas encore (à corriger).
- **api-gateway** : déjà configuré pour Eureka et les routes.
