# 📚 PROJET COMPLET - E-LEARNING PLATFORM

## 🎯 Vue d'Ensemble du Projet

Ce repository contient une plateforme d'apprentissage en ligne complète avec:

### 🎨 Frontend (Angular 21)
- **Localisation**: `frontend/angular-app/`
- **Port**: 4200
- **Pages**: Home, Courses, About, Pricing
- **Features**: Dark mode, animations, responsive design

### 🔐 Back-Office (Angular 21)
- **Localisation**: `back-office/`
- **Port**: 4201
- **Pages**: Dashboard, Courses, Users, Analytics
- **Features**: Admin panel, statistics, management

### ⚙️ Microservice Abonnements (Spring Boot)
- **Localisation**: `AbonnementService/`
- **Port**: 8084
- **API**: 16 endpoints REST
- **Database**: MySQL (port 3306)
- **Features**: CRUD complet, gestion paiements

## 📁 Structure Complète

```
e_learnig-platform/
├── frontend/
│   └── angular-app/          → Application frontend (port 4200)
│       ├── src/app/
│       │   ├── components/   → Header, Footer
│       │   ├── pages/        → Home, Courses, About, Pricing
│       │   └── services/     → Theme service
│       └── tailwind.config.js
│
├── back-office/              → Dashboard admin (port 4201)
│   ├── src/app/
│   │   ├── components/       → Sidebar, Topbar
│   │   ├── pages/            → Dashboard, Courses, Users, Analytics
│   │   └── services/         → Theme service
│   └── tailwind.config.js
│
├── AbonnementService/        → Microservice Spring Boot (port 8084)
│   ├── src/main/java/
│   │   └── tn/esprit/abonnement/
│   │       ├── entity/       → Abonnement, HistoriqueAbonnement
│   │       ├── repository/   → Data access
│   │       ├── service/      → Business logic
│   │       └── controller/   → REST API
│   ├── 📚 Documentation (10 fichiers)
│   └── 🧪 Tests (api-tests.http, Postman)
│
├── UI_UX Design for Learning Platform/  → Template React original
└── README.md                 → Ce fichier
```

## 🚀 Démarrage Rapide

### 1️⃣ Frontend Angular
```bash
cd frontend/angular-app
npm install
ng serve
# Ouvrir: http://localhost:4200
```

### 2️⃣ Back-Office Angular
```bash
cd back-office
npm install
ng serve --port 4201
# Ouvrir: http://localhost:4201
```

### 3️⃣ Microservice Spring Boot
```bash
cd AbonnementService

# Windows
START.bat

# Linux/Mac
chmod +x start.sh && ./start.sh

# Ou avec Maven
mvn spring-boot:run

# Tester: http://localhost:8084/api/abonnements/hello
```

## 🌐 URLs des Applications

| Application | URL | Port |
|------------|-----|------|
| Frontend | http://localhost:4200 | 4200 |
| Back-Office | http://localhost:4201 | 4201 |
| API Abonnements | http://localhost:8084/api/abonnements | 8084 |
| MySQL | localhost | 3306 |
| Eureka (optionnel) | http://localhost:8761 | 8761 |

## 🎨 Design System

### Couleurs Principales
- **Primary**: `rgb(0,200,151)` - Vert
- **Accent**: `rgb(255,127,80)` - Orange
- **Dark Mode**: Supporté partout

### Logo
- Logo "Wordly" avec gradient coloré
- Présent dans le frontend et back-office

## 📊 Fonctionnalités

### Frontend
✅ Page d'accueil avec hero section
✅ Catalogue de cours avec filtres
✅ Page À propos
✅ Page Pricing avec toggle mensuel/annuel
✅ Dark/Light mode
✅ Responsive design
✅ Animations smooth

### Back-Office
✅ Dashboard avec statistiques
✅ Gestion des cours
✅ Gestion des utilisateurs
✅ Analytics et graphiques
✅ Sidebar navigation
✅ Dark/Light mode

### Microservice
✅ 16 endpoints REST
✅ CRUD abonnements
✅ Historique paiements
✅ Base MySQL auto-configurée
✅ Documentation complète (10 fichiers)
✅ Tests prêts (31 requêtes)

## 🛠️ Technologies

### Frontend & Back-Office
- Angular 21
- TypeScript
- Tailwind CSS v3
- RxJS
- Angular Router

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Spring Cloud Eureka
- Maven

## 📚 Documentation

### Frontend/Back-Office
- README dans chaque dossier
- Code commenté
- Structure claire

### Microservice
Documentation exhaustive dans `AbonnementService/`:
- **LISEZMOI.md** - Point d'entrée
- **INDEX.md** - Guide de navigation
- **QUICK_START.md** - Démarrage rapide
- **README.md** - Documentation API
- **GUIDE_INTELLIJ.md** - Configuration IDE
- **RESUME_COMPLET.md** - Architecture
- **ARBORESCENCE.txt** - Structure visuelle
- Et 3 autres fichiers...

## 🧪 Tests

### Frontend/Back-Office
```bash
ng test
```

### Microservice
- **api-tests.http** - 31 requêtes HTTP (IntelliJ)
- **Postman_Collection.json** - Collection Postman
- Tests manuels via navigateur

## 🔧 Configuration

### Frontend
```typescript
// frontend/angular-app/src/app/app.config.ts
// Configuration des routes et providers
```

### Back-Office
```typescript
// back-office/src/app/app.config.ts
// Configuration admin
```

### Microservice
```properties
# AbonnementService/src/main/resources/application.properties
server.port=8084
spring.datasource.url=jdbc:mysql://localhost:3306/abonnement_db
```

## 📦 Installation Complète

### Prérequis
- Node.js 18+ et npm
- Java JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
# 1. Cloner le repository
git clone https://github.com/brouri12/angular-app.git
cd angular-app

# 2. Installer Frontend
cd frontend/angular-app
npm install

# 3. Installer Back-Office
cd ../../back-office
npm install

# 4. Compiler Microservice
cd ../AbonnementService
mvn clean install
```

### Démarrage
```bash
# Terminal 1: Frontend
cd frontend/angular-app
ng serve

# Terminal 2: Back-Office
cd back-office
ng serve --port 4201

# Terminal 3: Microservice
cd AbonnementService
mvn spring-boot:run

# Terminal 4: MySQL (si pas déjà démarré)
# Démarrer MySQL sur le port 3306
```

## 🎯 Workflow de Développement

### 1. Développement Frontend
```bash
cd frontend/angular-app
ng serve
# Modifier les fichiers dans src/app/
# Hot reload automatique
```

### 2. Développement Back-Office
```bash
cd back-office
ng serve --port 4201
# Modifier les fichiers dans src/app/
```

### 3. Développement Microservice
```bash
cd AbonnementService
# Ouvrir dans IntelliJ IDEA
# Modifier le code Java
# Redémarrer l'application
```

## 🐛 Résolution des Problèmes

### Frontend/Back-Office

**Port déjà utilisé**
```bash
ng serve --port 4202
```

**Erreur de dépendances**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Microservice

**Voir la documentation complète**
```bash
cd AbonnementService
# Lire QUICK_START.md section "Problèmes Courants"
```

**Port 8084 occupé**
```properties
# Changer dans application.properties
server.port=8085
```

**Erreur MySQL**
```bash
# Vérifier que MySQL est démarré
# Vérifier les credentials dans application.properties
```

## 📈 Prochaines Étapes

### Frontend
- [ ] Ajouter authentification
- [ ] Intégrer avec l'API backend
- [ ] Ajouter plus de pages
- [ ] Améliorer les animations

### Back-Office
- [ ] Connecter aux vraies données
- [ ] Ajouter plus de graphiques
- [ ] Implémenter les actions CRUD
- [ ] Ajouter la gestion des permissions

### Microservice
- [ ] Ajouter Spring Security
- [ ] Créer des tests unitaires
- [ ] Documenter avec Swagger
- [ ] Ajouter un cache Redis
- [ ] Créer d'autres microservices

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- Développement initial - [brouri12](https://github.com/brouri12)

## 🙏 Remerciements

- Template UI/UX original
- Communauté Angular
- Communauté Spring Boot
- Tailwind CSS

## 📞 Support

Pour toute question:
- Consulter la documentation dans chaque dossier
- Ouvrir une issue sur GitHub
- Vérifier les logs d'erreur

---

**Projet créé avec ❤️ pour l'apprentissage du développement full-stack**

*Version: 1.0.0*
*Date: 2024*
