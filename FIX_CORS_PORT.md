# Fix CORS - Port 44510

## Problème Identifié

Le frontend Angular tourne sur le port **44510** (au lieu de 4200), mais l'API Gateway n'autorisait que les ports 4200 et 4201.

## Erreur
```
Access to fetch at 'http://localhost:8888/abonnement-service/api/abonnements' 
from origin 'http://localhost:44510' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution Appliquée

### Modification dans `ApiGateway/src/main/java/tn/esprit/gateway/CorsConfig.java`

**AVANT**:
```java
corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:4201"));
```

**APRÈS**:
```java
// Autoriser tous les ports localhost pour le développement
corsConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
```

### Avantages
- ✅ Fonctionne avec n'importe quel port localhost
- ✅ Plus besoin de modifier la config pour chaque nouveau port
- ✅ Idéal pour le développement

## 🚀 Action Requise

### Redémarrer l'API Gateway

**Dans IntelliJ**:
1. Arrêter ApiGateway
2. Relancer `ApiGatewayApplication.java`
3. Attendre le message "Started ApiGatewayApplication"

### Tester

1. **Rafraîchir le frontend**: http://localhost:44510
2. **Aller sur la page Pricing**
3. **Vérifier**: Les abonnements se chargent sans erreur CORS

## ✅ Résultat Attendu

```
✅ Pas d'erreur CORS
✅ Les abonnements s'affichent
✅ Le formulaire d'achat fonctionne
```

## 📝 Note pour Production

En production, remplacer par les domaines spécifiques:
```java
corsConfig.setAllowedOrigins(Arrays.asList(
    "https://votre-domaine.com",
    "https://admin.votre-domaine.com"
));
```

Le wildcard `http://localhost:*` est uniquement pour le développement!

## 🔍 Vérification

### Vérifier que l'API Gateway a redémarré
```powershell
# Vérifier que le port 8888 est utilisé
netstat -ano | findstr :8888
```

### Tester directement l'API
```powershell
# Devrait retourner les abonnements
curl http://localhost:8888/abonnement-service/api/abonnements
```

### Vérifier dans le navigateur
1. Ouvrir la console (F12)
2. Onglet Network
3. Rafraîchir la page
4. Vérifier que la requête vers `/api/abonnements` réussit (status 200)

## 🎉 C'est Corrigé!

Après avoir redémarré l'API Gateway, le frontend sur le port 44510 devrait fonctionner sans erreur CORS.
