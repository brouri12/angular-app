# Intégration avec le backend (projet pi)

Le **frontend** et le **back-office** sont dans `pi\e_learnig-platform` et appellent l’API Node sur **http://localhost:8081**.

## Démarrage (depuis la racine `pi`)

1. **Lancer le backend API** (obligatoire en premier) :
   ```bash
   cd C:\Users\Rahali\Desktop\pi
   node xampp-mysql-dashboard.js
   ```
   *(Ou `node server-api-8081.js` si MySQL n’est pas démarré.)*

2. **Lancer le frontend** :
   ```bash
   cd C:\Users\Rahali\Desktop\pi\e_learnig-platform\frontend\angular-app
   npm start
   ```
   Puis ouvrir l’URL indiquée (souvent http://localhost:4200).

3. **Lancer le back-office** :
   ```bash
   cd C:\Users\Rahali\Desktop\pi\e_learnig-platform\back-office
   npm start
   ```
   Puis ouvrir l’URL indiquée (souvent un autre port, ex. 4201).

## Fichiers ajoutés / modifiés

- **frontend/angular-app**
  - `src/app/core/api.config.ts` — URL de l’API
  - `src/app/services/api.service.ts` — appels HTTP (courses, students, enrollments, etc.)
  - `app.config.ts` — `provideHttpClient()`
  - **pages/courses** — chargement des cours depuis l’API

- **back-office**
  - `src/app/core/api.config.ts` — URL de l’API
  - `src/app/services/api.service.ts` — même service
  - `app.config.ts` — `provideHttpClient()`
  - **pages/courses** — chargement des cours depuis l’API

## Changer l’URL du backend

Modifier **API_BASE_URL** dans :
- `pi\e_learnig-platform\frontend\angular-app\src\app\core\api.config.ts`
- `pi\e_learnig-platform\back-office\src\app\core\api.config.ts`

Exemple pour la prod : `https://ton-api.com`

## CORS

Le backend (pi) a CORS activé. Si tu déploies le front sur un autre domaine, ajoute son origine dans le backend si besoin.
