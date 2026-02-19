# Plateforme E-Learning – Tout le projet (pi)

Ce dossier contient **toute la plateforme** : backend API, microservices (optionnel), frontend et back-office Angular.

---

## Structure des dossiers

| Dossier | Rôle |
|---------|------|
| **e_learnig-platform/** | Frontend (Angular) + Back-office (Angular) |
| **e_learnig-platform/frontend/angular-app** | Site public – cours, inscription, etc. |
| **e_learnig-platform/back-office** | Interface admin – gestion cours, utilisateurs, etc. |
| **xampp-mysql-dashboard.js** | API Node/Express (port **8081**) – students, courses, enrollments, questions, badges |
| **server-api-8081.js** | API de test sans MySQL (port 8081) |
| **eureka-server/** | Serveur Eureka (port **8761**) – découverte des microservices |
| **api-gateway/** | Gateway Spring (port **8080**) – routes vers Formation / Quiz-Badge |
| **formation-service/** | Microservice formations (Spring Boot) |
| **quiz-badge-service/** | Microservice quiz / badges (Spring Boot) |
| **front-office/** | Page HTML simple (servie par le backend sur /front-office/) |
| **back-office/** | Page HTML simple (servie par le backend sur /back-office/) |
| **postman/** | Collection Postman pour tester l’API |

---

## Démarrage rapide (tout intégré)

### 1. Backend API (obligatoire)

Depuis la racine `pi` :

```powershell
cd C:\Users\Rahali\Desktop\pi
node xampp-mysql-dashboard.js
```

- API : **http://localhost:8081**
- Dashboard carte : http://localhost:8081/
- Front HTML : http://localhost:8081/front-office/
- Back HTML : http://localhost:8081/back-office/

*(Si MySQL n’est pas démarré : `node server-api-8081.js`.)*

### 2. Frontend Angular (site public)

```powershell
cd C:\Users\Rahali\Desktop\pi\e_learnig-platform\frontend\angular-app
npm install
npm start
```

→ Ouvrir l’URL affichée (souvent **http://localhost:4200**). La page **Courses** utilise l’API sur le port 8081.

### 3. Back-office Angular (admin)

```powershell
cd C:\Users\Rahali\Desktop\pi\e_learnig-platform\back-office
npm install
npm start
```

→ Ouvrir l’URL affichée (souvent **http://localhost:4201** ou autre). La page **Courses** utilise la même API.

---

## Option : microservices (Eureka + Gateway)

Si tu utilises les services Spring Boot :

1. **Eureka** (port 8761) :
   ```powershell
   cd C:\Users\Rahali\Desktop\pi\eureka-server
   .\mvnw.cmd spring-boot:run
   ```

2. **Formation Service** + **Quiz-Badge Service** :
   ```powershell
   cd C:\Users\Rahali\Desktop\pi\formation-service
   .\mvnw.cmd spring-boot:run
   ```
   *(Idem dans un autre terminal pour quiz-badge-service.)*

3. **API Gateway** (port 8080) :
   ```powershell
   cd C:\Users\Rahali\Desktop\pi\api-gateway
   .\mvnw.cmd spring-boot:run
   ```

Les Angular (e_learnig-platform) sont actuellement branchés sur l’API **Node 8081**. Pour passer par le Gateway 8080, change **API_BASE_URL** en `http://localhost:8080` dans les deux `api.config.ts` et adapte les routes côté Gateway si besoin.

---

## Récapitulatif des ports

| Port | Service |
|------|---------|
| **8081** | API Node (principale) – students, courses, enrollments, questions, badges |
| **4200** | Frontend Angular (après `npm start`) |
| **4201** (ou autre) | Back-office Angular |
| **8761** | Eureka |
| **8080** | API Gateway (Spring) |

---

## Intégration

- **e_learnig-platform** : voir **e_learnig-platform/INTEGRATION-BACKEND.md**.
- **API** : voir **postman/README.md** et la collection Postman pour tester les tables.
