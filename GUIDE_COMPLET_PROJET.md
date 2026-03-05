# 🎓 GUIDE COMPLET - E-LEARNING PLATFORM

## 📚 VUE D'ENSEMBLE

Ce projet contient une plateforme d'apprentissage complète avec:
- **Frontend Angular** (port 4200)
- **Back-Office Angular** (port 4201)  
- **Microservice Spring Boot** (port 8084)

## 🚀 DÉMARRAGE RAPIDE

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

#### Option A: Avec IntelliJ IDEA (RECOMMANDÉ)
1. Télécharger IntelliJ IDEA Community (gratuit)
2. Ouvrir le projet `AbonnementService`
3. Démarrer MySQL
4. Run 'AbonnementApplication'
5. Tester: http://localhost:8084/api/abonnements/hello

#### Option B: Avec Maven
```bash
cd AbonnementService
mvn spring-boot:run
```

## 📖 DOCUMENTATION PAR COMPOSANT

### Frontend Angular
- **Localisation**: `frontend/angular-app/`
- **Documentation**: README dans le dossier
- **Pages**: Home, Courses, About, Pricing
- **Features**: Dark mode, animations, responsive

### Back-Office Angular
- **Localisation**: `back-office/`
- **Documentation**: README dans le dossier
- **Pages**: Dashboard, Courses, Users, Analytics
- **Features**: Admin panel, statistiques, gestion

### Microservice Spring Boot
- **Localisation**: `AbonnementService/`
- **Documentation**: 13 fichiers de documentation!

#### 📚 Documentation Microservice (par ordre de lecture)

1. **TEST_SIMPLE.txt** ⭐ - Guide visuel ultra simple
2. **COMMENT_TESTER.md** ⭐ - Comment tester en 3 étapes
3. **LISEZMOI.md** - Point d'entrée principal
4. **INDEX.md** - Guide de navigation
5. **QUICK_START.md** - Démarrage en 5 minutes
6. **GUIDE_TEST_COMPLET.md** - Tests exhaustifs
7. **README.md** - Documentation API complète
8. **GUIDE_INTELLIJ.md** - Configuration IntelliJ
9. **RESUME_COMPLET.md** - Architecture
10. **ARBORESCENCE.txt** - Structure visuelle
11. **api-tests.http** - 31 requêtes de test
12. **Postman_Collection.json** - Collection Postman
13. **test-api.ps1** - Script PowerShell de test

## 🧪 COMMENT TESTER LE MICROSERVICE

### Méthode 1: Navigateur (Le Plus Simple!)
```
http://localhost:8084/api/abonnements/hello
http://localhost:8084/api/abonnements
http://localhost:8084/api/abonnements/1
http://localhost:8084/api/abonnements/paiements
```

### Méthode 2: IntelliJ HTTP Client (Recommandé)
1. Ouvrir `AbonnementService/api-tests.http`
2. Cliquer sur ▶️ à côté de chaque requête

### Méthode 3: PowerShell
```powershell
cd AbonnementService
.\test-api.ps1
```

### Méthode 4: Postman
1. Importer `Postman_Collection.json`
2. Exécuter les requêtes

## 🌐 URLs des Applications

| Application | URL | Port |
|------------|-----|------|
| Frontend | http://localhost:4200 | 4200 |
| Back-Office | http://localhost:4201 | 4201 |
| API Abonnements | http://localhost:8084/api/abonnements | 8084 |
| MySQL | localhost | 3306 |

## 🛠️ Technologies

### Frontend & Back-Office
- Angular 21
- TypeScript
- Tailwind CSS v3
- RxJS

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Maven

## 📦 Installation Complète

### Prérequis
- Node.js 18+ et npm
- Java JDK 17+
- MySQL 8.0+
- IntelliJ IDEA (recommandé) ou Maven
- Angular CLI: `npm install -g @angular/cli`

### Installation
```bash
# 1. Frontend
cd frontend/angular-app
npm install

# 2. Back-Office
cd ../../back-office
npm install

# 3. Microservice (avec IntelliJ)
# Ouvrir AbonnementService dans IntelliJ
# Maven téléchargera automatiquement les dépendances
```

## 🎯 Workflow de Développement

### Terminal 1: Frontend
```bash
cd frontend/angular-app
ng serve
```

### Terminal 2: Back-Office
```bash
cd back-office
ng serve --port 4201
```

### Terminal 3: Microservice
```bash
# Avec IntelliJ: Run 'AbonnementApplication'
# Ou avec Maven:
cd AbonnementService
mvn spring-boot:run
```

### Terminal 4: MySQL
```bash
# Démarrer MySQL (XAMPP ou service)
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
# Lire: COMMENT_TESTER.md ou GUIDE_TEST_COMPLET.md
```

**Maven n'est pas installé**
→ Utilisez IntelliJ IDEA qui inclut Maven!

**Port 8084 occupé**
```powershell
netstat -ano | findstr :8084
taskkill /PID <PID> /F
```

## 📊 Fonctionnalités

### Frontend ✅
- Page d'accueil avec hero
- Catalogue de cours
- Page À propos
- Page Pricing
- Dark/Light mode
- Responsive design

### Back-Office ✅
- Dashboard avec stats
- Gestion des cours
- Gestion des utilisateurs
- Analytics
- Dark/Light mode

### Microservice ✅
- 16 endpoints REST
- CRUD abonnements
- Historique paiements
- Base MySQL auto-configurée
- Documentation exhaustive
- Tests prêts

## 🎨 Design System

### Couleurs
- **Primary**: `rgb(0,200,151)` - Vert
- **Accent**: `rgb(255,127,80)` - Orange

### Logo
Logo "Wordly" avec gradient coloré dans le frontend et back-office

## 📈 Prochaines Étapes

### Frontend
- [ ] Ajouter authentification
- [ ] Intégrer avec l'API
- [ ] Ajouter plus de pages

### Back-Office
- [ ] Connecter aux vraies données
- [ ] Implémenter les actions CRUD
- [ ] Ajouter permissions

### Microservice
- [ ] Ajouter Spring Security
- [ ] Créer tests unitaires
- [ ] Documenter avec Swagger
- [ ] Créer d'autres microservices

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

### Frontend/Back-Office
- Consulter le README dans chaque dossier
- Vérifier les logs de la console

### Microservice
- **TEST_SIMPLE.txt** - Guide visuel
- **COMMENT_TESTER.md** - Guide simple
- **GUIDE_TEST_COMPLET.md** - Guide exhaustif
- **INDEX.md** - Navigation dans la doc

## 🎓 Ressources d'Apprentissage

### Angular
- [Documentation officielle](https://angular.io/docs)
- [Angular CLI](https://angular.io/cli)

### Spring Boot
- [Documentation officielle](https://spring.io/projects/spring-boot)
- [Spring Guides](https://spring.io/guides)

### Tailwind CSS
- [Documentation](https://tailwindcss.com/docs)

## ✨ Crédits

- Template UI/UX original
- Communauté Angular
- Communauté Spring Boot
- Tailwind CSS

---

**Projet créé avec ❤️ pour l'apprentissage du développement full-stack**

*Version: 1.0.0*
*Date: 2024*

## 🎯 POUR COMMENCER MAINTENANT

### Vous voulez tester le microservice?
👉 Lisez: `AbonnementService/TEST_SIMPLE.txt` ou `AbonnementService/COMMENT_TESTER.md`

### Vous voulez comprendre l'architecture?
👉 Lisez: `AbonnementService/RESUME_COMPLET.md`

### Vous voulez tout savoir?
👉 Lisez: `AbonnementService/INDEX.md` pour naviguer dans la documentation

**Bonne chance! 🚀**
