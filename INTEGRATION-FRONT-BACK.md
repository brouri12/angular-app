# Intégration Front Office & Back Office avec le Backend

## 1. URL du backend

- **Base URL API :** `http://localhost:8081`
- Le backend (Node/Express) doit être lancé en premier :
  ```bash
  cd c:\Users\Rahali\Desktop\pi
  node xampp-mysql-dashboard.js
  ```
  Ou pour tester sans MySQL : `node server-api-8081.js`

---

## 2. CORS

Le backend a déjà **CORS activé** (`app.use(cors())`), donc un front sur un autre port (ex. 4200, 3000, 5173) peut appeler l’API sans erreur CORS.

Si ton front est sur un autre domaine ou port et que tu as encore des erreurs CORS, on peut restreindre dans le backend :
```js
const cors = require('cors');
app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:5173'] }));
```

---

## 3. Où mettre ton Front Office et Back Office

Deux options :

### Option A : Dans le même projet (recommandé pour tout garder ensemble)

```
pi/
├── api-config.js
├── xampp-mysql-dashboard.js
├── front-office/     ← ton app (Angular, React, Vue, etc.)
└── back-office/      ← ton app admin
```

### Option B : Projets séparés ailleurs sur le disque

Peu importe l’emplacement, il suffit que le front appelle `http://localhost:8081` (ou une variable d’environnement).

---

## 4. Configurer l’URL de l’API dans le front

### Variable d’environnement (recommandé)

- **Angular** : dans `environment.ts` / `environment.prod.ts` :
  ```ts
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8081'
  };
  ```
- **React / Vite** : dans `.env` :
  ```
  VITE_API_URL=http://localhost:8081
  ```
  Puis dans le code : `import.meta.env.VITE_API_URL`
- **Vue** : idem, `.env` avec `VUE_APP_API_URL=http://localhost:8081` ou `VITE_API_URL` selon le build.

### Fichier de config partagé

Si ton front est en JavaScript/TypeScript, tu peux avoir un fichier `api.js` ou `config.js` :

```js
export const API_BASE_URL = 'http://localhost:8081';
```

---

## 5. Appeler l’API depuis le front

### Exemple avec `fetch` (JavaScript / TypeScript)

```javascript
const API_BASE = 'http://localhost:8081';

// GET liste des inscriptions
async function getEnrollments() {
  const res = await fetch(`${API_BASE}/api/enrollments`);
  const data = await res.json();
  return data;
}

// POST créer une inscription
async function createEnrollment(body) {
  const res = await fetch(`${API_BASE}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Exemple d’utilisation
getEnrollments().then(console.log);
createEnrollment({ studentId: 1, courseId: 2, status: 'ACTIVE', completionPercentage: 0 }).then(console.log);
```

### Exemple avec Angular `HttpClient`

```ts
// service, ex. api.service.ts
export class ApiService {
  private baseUrl = 'http://localhost:8081';
  constructor(private http: HttpClient) {}
  getEnrollments() {
    return this.http.get<any[]>(`${this.baseUrl}/api/enrollments`);
  }
  postEnrollment(data: any) {
    return this.http.post(`${this.baseUrl}/api/enrollments`, data);
  }
}
```

### Exemple avec Axios (React / Vue)

```js
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:8081' });
api.get('/api/enrollments').then(r => console.log(r.data));
api.post('/api/enrollments', { studentId: 1, courseId: 2, status: 'ACTIVE', completionPercentage: 0 });
```

---

## 6. Endpoints disponibles

| Méthode | URL | Description |
|--------|-----|-------------|
| GET | /api/students | Liste des étudiants |
| POST | /api/students | Créer un étudiant |
| GET | /api/courses | Liste des cours |
| POST | /api/courses | Créer un cours |
| GET | /api/enrollments | Liste des inscriptions |
| POST | /api/enrollments | Créer une inscription |
| GET | /api/questions | Liste des questions |
| POST | /api/questions | Créer une question |
| GET | /api/badges | Liste des badges |
| POST | /api/badges | Créer un badge |
| GET | /api/database/info | Infos BDD (comptages) |

---

## 7. Ordre de démarrage

1. Démarrer le **backend** (port 8081).
2. Démarrer le **front-office** (ex. `ng serve` ou `npm run dev`).
3. Démarrer le **back-office** si besoin (autre port).

Les deux fronts pointent vers la même API : `http://localhost:8081`.

---

## 8. Front / Back Office fournis dans ce projet

Le dossier `pi` contient maintenant :

- **front-office/** : page exemple (cours, inscriptions)  
- **back-office/** : page admin exemple (infos BDD, étudiants, inscriptions)

Une fois le backend démarré (`node xampp-mysql-dashboard.js`) :

- Front : **http://localhost:8081/front-office/**
- Back  : **http://localhost:8081/back-office/**

Tu peux remplacer le contenu de `front-office` et `back-office` par tes vrais projets (Angular, React, Vue) en gardant la même base URL d’API : `http://localhost:8081`.

---

## 9. Si ton front est dans un autre dossier

Indique le **chemin exact** de ton dossier (front-office et back-office), par exemple :
- `c:\Users\Rahali\Desktop\mon-projet\front-office`
- `c:\Users\Rahali\Desktop\mon-projet\back-office`

On pourra alors ajouter la config d’API (fichier ou variables d’env) directement dans ces dossiers.
