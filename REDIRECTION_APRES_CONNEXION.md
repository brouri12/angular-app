# Redirection après connexion (port 8083)

Après connexion sur http://localhost:4201, l’application redirige selon le rôle :

- **ADMIN** → http://localhost:8083/back-office/
- **TEACHER** → http://localhost:8083/front-office/teacher.html
- **STUDENT** → http://localhost:8083/front-office/student.html

Si vous voyez **« localhost a refusé de se connecter »** ou **ERR_CONNECTION_REFUSED**, le serveur sur le **port 8083** n’est pas démarré.

## À faire

1. **Démarrer le tableau de bord** (une seule fois, avant de se connecter) :
   - À la racine du projet : double-clic sur **DEMARRER_DASHBOARD_8083.cmd**
   - Ou dans un terminal : `cd pi` puis `node xampp-mysql-dashboard.js`
2. Laisser cette fenêtre ouverte.
3. Se connecter sur http://localhost:4201 : la redirection vers la page étudiant / professeur / admin fonctionnera.

Prérequis : Node.js installé, et si besoin une base MySQL (XAMPP) pour certaines fonctionnalités du dashboard.
