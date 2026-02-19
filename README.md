# E-Learning Platform – Frontend & Back-office

Ce dossier est dans **`pi\e_learnig-platform`** et contient :

- **frontend/angular-app** – site public (cours, etc.)
- **back-office** – interface d’administration

Les deux applications Angular appellent l’API backend Node sur **http://localhost:8081** (voir `api.config.ts` dans chaque projet).

## Démarrage

1. Lancer le backend depuis la racine **pi** :
   ```bash
   cd C:\Users\Rahali\Desktop\pi
   node xampp-mysql-dashboard.js
   ```

2. Frontend :
   ```bash
   cd frontend\angular-app
   npm install
   npm start
   ```

3. Back-office (dans un autre terminal) :
   ```bash
   cd back-office
   npm install
   npm start
   ```

Détails : **INTEGRATION-BACKEND.md**
