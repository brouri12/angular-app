# Front Office (charte graphique)

Interface publique E-Learning avec la **charte graphique** de la plateforme :
- **Couleur primaire :** rgb(0, 200, 151) – vert/teal
- **Couleur secondaire :** rgb(255, 127, 80) – orange/coral
- **Police :** Inter

## Backend

Les appels API pointent vers l’**API Gateway Spring Boot** (port **8080**), qui route vers le backend Node (8081) pour les données (cours, inscriptions, badges).

**Démarrage conseillé :**
1. Backend Node : `node xampp-mysql-dashboard.js` (port 8081)
2. Eureka : `mvnw spring-boot:run` dans `eureka-server` (port 8761)
3. API Gateway : `mvnw spring-boot:run` dans `api-gateway` (port 8080)

Puis ouvrir : **http://localhost:8081/front-office/** (servi par le backend Node) ou l’URL indiquée par ton serveur.

Si seul le backend Node tourne (sans Gateway), modifier dans `index.html` :  
`const API_BASE = 'http://localhost:8081';`
