# Guide de Dépannage CORS

## 🎯 Configuration Actuelle

### API Gateway - CORS Centralisé
```java
// Autorise TOUS les ports localhost (développement)
corsConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
```

### Services Backend
- ✅ AbonnementService: **PAS de @CrossOrigin** (géré par Gateway)
- ✅ UserService: CORS géré par Spring Security

## 🔍 Diagnostic des Erreurs CORS

### Erreur Type 1: "No 'Access-Control-Allow-Origin' header"
```
Access to fetch at 'http://localhost:8888/...' from origin 'http://localhost:XXXX' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Causes possibles**:
1. API Gateway pas démarré
2. API Gateway pas redémarré après modification CORS
3. Requête ne passe pas par l'API Gateway

**Solutions**:
```powershell
# 1. Vérifier que API Gateway tourne
netstat -ano | findstr :8888

# 2. Redémarrer API Gateway dans IntelliJ
# Arrêter puis relancer ApiGatewayApplication.java

# 3. Vérifier l'URL dans le code Angular
# Doit être: http://localhost:8888/abonnement-service/api/...
# PAS: http://localhost:8084/api/...
```

### Erreur Type 2: "Multiple values in 'Access-Control-Allow-Origin'"
```
The 'Access-Control-Allow-Origin' header contains multiple values 
'http://localhost:4200, *', but only one is allowed
```

**Cause**: 
- CORS configuré à la fois dans API Gateway ET dans le service backend

**Solution**:
```java
// Supprimer @CrossOrigin des controllers backend
// AVANT:
@RestController
@CrossOrigin(origins = "*")  // ❌ À SUPPRIMER
public class AbonnementRestAPI {

// APRÈS:
@RestController  // ✅ Pas de @CrossOrigin
public class AbonnementRestAPI {
```

### Erreur Type 3: Port non autorisé
```
Access to fetch at '...' from origin 'http://localhost:44510' has been blocked
```

**Cause**: 
- Frontend tourne sur un port non autorisé (ex: 44510 au lieu de 4200)

**Solution**:
- ✅ **DÉJÀ CORRIGÉ** avec `http://localhost:*` dans CorsConfig.java
- Redémarrer API Gateway pour appliquer

## 🔧 Checklist de Résolution

### Étape 1: Vérifier la Configuration
```bash
# Fichier: ApiGateway/src/main/java/tn/esprit/gateway/CorsConfig.java
# Doit contenir:
corsConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
```

### Étape 2: Vérifier les Controllers Backend
```bash
# Fichier: AbonnementService/.../AbonnementRestAPI.java
# NE DOIT PAS contenir:
@CrossOrigin(origins = "*")  # ❌ À supprimer si présent
```

### Étape 3: Redémarrer les Services
```
1. Arrêter API Gateway
2. Arrêter AbonnementService (si modifié)
3. Relancer API Gateway
4. Relancer AbonnementService
5. Attendre que les services s'enregistrent sur Eureka
```

### Étape 4: Vérifier Eureka
```
Ouvrir: http://localhost:8761
Vérifier que les services sont enregistrés:
- API-GATEWAY
- ABONNEMENT-SERVICE
```

### Étape 5: Tester
```
1. Ouvrir le frontend (n'importe quel port localhost)
2. Ouvrir la console (F12)
3. Onglet Network
4. Rafraîchir la page
5. Vérifier les requêtes vers l'API Gateway
```

## 🎯 URLs Correctes

### ✅ CORRECT - Via API Gateway
```typescript
// Dans les services Angular
private apiUrl = 'http://localhost:8888/abonnement-service/api/abonnements';
```

### ❌ INCORRECT - Direct au service
```typescript
// NE PAS FAIRE ÇA
private apiUrl = 'http://localhost:8084/api/abonnements';
```

## 🔍 Vérification dans le Navigateur

### Console Network (F12)
```
1. Ouvrir F12 → Network
2. Rafraîchir la page
3. Chercher la requête vers /api/abonnements
4. Vérifier:
   - Request URL: http://localhost:8888/...
   - Status: 200 OK
   - Response Headers: Access-Control-Allow-Origin: http://localhost:XXXX
```

### Console (Erreurs)
```
Si erreur CORS:
- Vérifier que API Gateway est démarré
- Vérifier que l'URL utilise le port 8888
- Redémarrer API Gateway
```

## 📊 Architecture CORS

```
Frontend (localhost:*)
    │
    │ Requête HTTP
    ▼
API Gateway (8888)
    │ ← CORS géré ici!
    │ Ajoute les headers CORS
    │
    │ Requête sans CORS
    ▼
AbonnementService (8084)
    │ ← PAS de @CrossOrigin
    │
    ▼
Réponse avec données
    │
    │ Headers CORS ajoutés par Gateway
    ▼
Frontend reçoit la réponse ✅
```

## 🚨 Erreurs Courantes

### 1. Oublier de redémarrer API Gateway
```
Symptôme: Erreur CORS persiste après modification
Solution: Redémarrer API Gateway dans IntelliJ
```

### 2. Requête directe au service (bypass Gateway)
```
Symptôme: Erreur CORS même avec Gateway configuré
Solution: Vérifier l'URL dans le code Angular (doit utiliser :8888)
```

### 3. @CrossOrigin encore présent dans le controller
```
Symptôme: "Multiple values in Access-Control-Allow-Origin"
Solution: Supprimer @CrossOrigin du controller backend
```

### 4. Service pas enregistré sur Eureka
```
Symptôme: 404 Not Found ou erreur de routage
Solution: Vérifier http://localhost:8761 que le service est UP
```

## ✅ Configuration Finale

### API Gateway - CorsConfig.java
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Arrays.asList("http://localhost:*"));
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
```

### AbonnementService - AbonnementRestAPI.java
```java
@RestController
@RequestMapping("/api/abonnements")
// PAS de @CrossOrigin ici!
public class AbonnementRestAPI {
    // ...
}
```

### Angular Service
```typescript
export class AbonnementService {
  private apiUrl = 'http://localhost:8888/abonnement-service/api/abonnements';
  // Utilise le port 8888 (API Gateway)
}
```

## 🎉 Test Final

### Commande cURL
```powershell
# Tester avec un header Origin
curl -H "Origin: http://localhost:44510" `
     -H "Access-Control-Request-Method: GET" `
     -H "Access-Control-Request-Headers: Content-Type" `
     -X OPTIONS `
     http://localhost:8888/abonnement-service/api/abonnements

# Devrait retourner les headers CORS
```

### Dans le Navigateur
```
1. Ouvrir http://localhost:44510 (ou votre port)
2. Ouvrir F12 → Console
3. Pas d'erreur CORS
4. Les données s'affichent correctement
```

## 📞 Si Ça Ne Marche Toujours Pas

1. **Vérifier les logs de l'API Gateway**
   - Chercher des erreurs au démarrage
   - Vérifier que CorsConfig est chargé

2. **Vérifier les logs d'AbonnementService**
   - Vérifier qu'il reçoit les requêtes
   - Pas d'erreur de traitement

3. **Redémarrer TOUS les services**
   ```
   1. Eureka Server
   2. API Gateway
   3. Abonnement Service
   4. Frontend Angular
   ```

4. **Vérifier les ports**
   ```powershell
   netstat -ano | findstr :8761  # Eureka
   netstat -ano | findstr :8888  # Gateway
   netstat -ano | findstr :8084  # Abonnement
   ```

## 🔮 Pour Production

Remplacer le wildcard par des domaines spécifiques:
```java
corsConfig.setAllowedOrigins(Arrays.asList(
    "https://www.votre-domaine.com",
    "https://admin.votre-domaine.com"
));
```

**Important**: Ne JAMAIS utiliser `http://localhost:*` en production!
