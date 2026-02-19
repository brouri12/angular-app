# Back Office (charte graphique)

Interface d’administration E-Learning avec la **charte graphique** de la plateforme (couleurs primaire/secondaire, Inter).

## Backend

Les appels API pointent vers l’**API Gateway Spring Boot** (port **8080**). Voir **front-office/README.md** pour l’ordre de démarrage (Node, Eureka, Gateway).

Accès : **http://localhost:8081/back-office/** (servi par le backend Node).

Si seul le backend Node tourne : dans `index.html`, mettre  
`const API_BASE = 'http://localhost:8081';`
