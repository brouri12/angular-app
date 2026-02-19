# Tester l'API E-Learning avec Postman

## Import de la collection

1. Ouvre **Postman**
2. **Import** → **Upload Files** → choisis `E-Learning-API.postman_collection.json`
3. La collection **"E-Learning API - Toutes les tables"** apparaît dans la barre latérale

## Avant de tester

1. Démarre **MySQL** dans XAMPP
2. Lance le serveur : `node xampp-mysql-dashboard.js` (ou `npm start`) depuis la racine du projet
3. L’API est disponible sur **http://localhost:8081**

## Tables et requêtes incluses

| Table        | GET (liste) | POST (créer) |
|-------------|-------------|--------------|
| **Database Info** | ✅ Infos BDD | - |
| **Students**      | ✅ | ✅ |
| **Courses**       | ✅ | ✅ |
| **Enrollments**   | ✅ | ✅ |
| **Questions**     | ✅ | ✅ |
| **Badges**        | ✅ | ✅ |

Tu peux modifier les corps JSON des requêtes POST (ex. autres noms, villes, cours) puis envoyer pour insérer des données.

## Variable

- `baseUrl` = `http://localhost:8081` (modifiable dans la collection si ton port change)
