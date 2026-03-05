# Guide d'Intégration Keycloak - Minimisation des Risques

## Introduction

Ce guide fournit une approche progressive et sécurisée pour intégrer Keycloak dans votre architecture microservices existante, en minimisant les risques identifiés.

---

## ⚠️ Prévention des Risques

### 1. Erreurs de Configuration des Clients Keycloak
- ✅ Utiliser des configurations testées et validées
- ✅ Définir des URLs exactes pour les clients
- ✅ Tester chaque client après configuration

### 2. Problèmes de Communication Entre Services
- ✅ Ajouter la sécurité de manière progressive
- ✅ Configurer le propager le token dans les appels Feign
- ✅ Tester la communication service-à-service

### 3. Gestion des Tokens (Refresh, Expiration)
- ✅ Configurer les durée de vie appropriées
- ✅ Implémenter le refresh token
- ✅ Gérer les erreurs d'expiration

---

## Architecture Cible

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KEYCLOAK SERVER                             │
│                    (Port 8180 - Admin Console)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     GATEWAY (Spring Cloud Gateway)                  │
│                         Port 8080                                   │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  - OAuth2 Resource Server (JWT Validation)                    │  │
│  │  - Route: /api/users/*    → service-user (8081)              │  │
│  │  - Route: /api/feedbacks/* → service-feedback (8082)          │  │
│  │  - Route: /api/reclamations/* → service-feedback (8082)       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌─────────────────────────┐         ┌─────────────────────────────────┐
│    SERVICE-USER         │         │       SERVICE-FEEDBACK           │
│    Port 8081           │         │       Port 8082                  │
│                        │         │                                 │
│  - CRUD Users          │◄──Feign─│  - Feedbacks                    │
│  - Keycloak Adapter    │   Client│  - Reclamations                 │
└─────────────────────────┘         └─────────────────────────────────┘
```

---

## ÉTAPE 1: Installation et Configuration de Keycloak

### 1.1 Démarrer Keycloak

```bash
# Option A: Docker (Recommandé)
docker run -p 8180:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:23.0 start-dev

# Option B: Téléchargement direct
# Télécharger depuis https://github.com/keycloak/keycloak/releases
# Extraire et exécuter: bin/kc.sh start-dev
```

### 1.2 Accéder à la Console Admin

- URL: http://localhost:8180
- Login: admin / admin

### 1.3 Créer le Realm

1. Cliquer sur "Create Realm"
2. Nom: `gestions-ramzi`
3. Activer "Enabled"

### 1.4 Créer les Rôles

Aller dans **Realm Roles** → Create:

| Rôle | Description |
|------|-------------|
| ADMIN | Accès total |
| ENSEIGNANT | Gestion des cours et feedback |
| ETUDIANT | Soumettre feedbacks et réclamations |

### 1.5 Créer les Clients

Aller dans **Clients** → Create:

#### Client 1: gateway-service
```
Client ID: gateway-service
Client Protocol: openid-connect
Access Type: confidential
Valid Redirect URIs: http://localhost:8080/*
Web Origins: http://localhost:8080
```

#### Client 2: frontend-app
```
Client ID: frontend-app
Client Protocol: openid-connect
Access Type: public
Valid Redirect URIs: http://localhost:4200/*
Web Origins: http://localhost:4200
```

### 1.6 Credentials du Client

Aller dans **Clients** → gateway-service → Credentials:
- Noter le `Client Secret`

---

## ÉTAPE 2: Configuration de la Gateway (Minimiser les Risques)

### 2.1 Ajout des Dépendances (gateway-service/pom.xml)

```xml
<!-- AJOUTER ces dépendances -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-oauth2</artifactId>
</dependency>
```

### 2.2 Configuration de la Sécurité (application.yml)

```yaml
# gateway-service/src/main/resources/application.yml

server:
  port: 8080

spring:
  application:
    name: gateway-service

  main:
    web-application-type: reactive

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/gestions-ramzi
          # OU utiliser jwk-set-uri pour plus de contrôle:
          # jwk-set-uri: http://localhost:8180/realms/gestions-ramzi/protocol/openid-connect/certs

  cloud:
    gateway:
      globalcors:
        add-to-simple-url-handler-mapping: true
        cors-configurations:
          '[/**]':
            allowedOrigins: "http://localhost:4200"
            allowedMethods: "GET,POST,PUT,DELETE,OPTIONS"
            allowedHeaders: "*"
            allowCredentials: true
            maxAge: 3600
      routes:
        - id: user-service
          uri: lb://service-user
          predicates:
            - Path=/api/users/**
          filters:
            - RemoveRequestHeader=Cookie
        - id: feedback-service
          uri: lb://service-feedback
          predicates:
            - Path=/api/feedbacks/**
          filters:
            - RemoveRequestHeader=Cookie
        - id: reclamations-service
          uri: lb://service-feedback
          predicates:
            - Path=/api/reclamations/**
          filters:
            - RemoveRequestHeader=Cookie
        - id: resolutions-service
          uri: lb://service-feedback
          predicates:
            - Path=/api/resolutions/**
          filters:
            - RemoveRequestHeader=Cookie

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:8761/eureka
```

### 2.3 Configuration de Sécurité Java

Créer le fichier `SecurityConfig.java`:

```java
package com.gestions.ramzi.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/actuator/**").permitAll()
                .pathMatchers("/api/auth/**").permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> {})
            );
        return http.build();
    }
}
```

---

## ÉTAPE 3: Configuration de service-user

### 3.1 Ajout des Dépendances (service-user/pom.xml)

```xml
<!-- AJOUTER ces dépendances -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### 3.2 Configuration de la Sécurité

Créer `SecurityConfig.java` dans service-user:

```java
package com.gestions.ramzi.serviceuser;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/register", "/api/users/health").permitAll()
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "ENSEIGNANT", "ETUDIANT")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        
        return http.build();
    }
}
```

### 3.3 Configuration application.yml

```yaml
# service-user/src/main/resources/application.yml

server:
  port: 8081

spring:
  application:
    name: service-user

  datasource:
    url: jdbc:mysql://localhost:3306/gestions_ramzi?createDatabaseIfNotExist=true
    username: root
    password: 
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/gestions-ramzi

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:8761/eureka
```

---

## ÉTAPE 4: Configuration de service-feedback

### 4.1 Ajout des Dépendances (service-feedback/pom.xml)

```xml
<!-- AJOUTER ces dépendances -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

### 4.2 Configuration de la Sécurité

Créer `SecurityConfig.java` dans service-feedback:

```java
package com.gestions.ramzi.servicefeedback;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/feedbacks/public/**", "/actuator/**").permitAll()
                .requestMatchers("/api/feedbacks/**", "/api/reclamations/**").hasAnyRole("ADMIN", "ENSEIGNANT", "ETUDIANT")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        
        return http.build();
    }
}
```

### 4.3 Configuration application.yml

```yaml
# service-feedback/src/main/resources/application.yml

server:
  port: 8082

spring:
  application:
    name: service-feedback

  datasource:
    url: jdbc:mysql://localhost:3306/gestions_ramzi_feedback?createDatabaseIfNotExist=true
    username: root
    password: 
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/gestions-ramzi

  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://localhost:8761/eureka

# Configuration Feign pour propager le token
feign:
  client:
    config:
      default:
        connect-timeout: 5000
        read-timeout: 5000
```

---

## ÉTAPE 5: Configuration Feign pour Communication Inter-Services

### 5.1 Créer le Interceptor pour propager le Token

Dans **service-feedback**, créer:

```java
package com.gestions.ramzi.servicefeedback.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class FeignTokenInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        // Récupérer le token JWT du contexte de sécurité
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            // Ajouter le token dans l'en-tête Authorization
            template.header("Authorization", "Bearer " + jwt.getTokenValue());
        }
    }
}
```

### 5.2 Mettre à jour UserClient

```java
package com.gestions.ramzi.servicefeedback.clients;

import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "service-user")
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(
        @PathVariable("id") Long id,
        @RequestHeader("Authorization") String authorization
    );
    
    // Alternative: Utiliser le context de sécurité directement
    @GetMapping("/api/users/me")
    UserDTO getCurrentUser(@RequestHeader("Authorization") String authorization);
}
```

---

## ÉTAPE 6: Configuration du Frontend (Angular)

### 6.1 Installation du Package

```bash
cd frontend/angular-app
npm install angular-oauth2-oidc
```

### 6.2 Configuration du Auth Service

Créer `auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8180/realms/gestions-ramzi',
  redirectUri: window.location.origin + '/index.html',
  clientId: 'frontend-app',
  scope: 'openid profile email',
  responseType: 'code',
  showDebugInformation: true,
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.configure();
  }

  private configure() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.loadUserProfile();
      }
    });
  }

  private loadUserProfile() {
    this.oauthService.loadUserProfile().then(profile => {
      this.userProfileSubject.next(profile);
    });
  }

  get token(): string {
    return this.oauthService.getAccessToken();
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  get roles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.realm_access?.roles || [];
  }

  get userId(): number {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.sub;
  }

  login() {
    this.oauthService.initLoginFlow();
  }

  logout() {
    this.oauthService.logOut();
  }
}
```

### 6.3 Mise à jour des Services HTTP

Dans chaque service Angular, ajouter le token:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8080/api/feedbacks';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.token}`
    });
  }

  getFeedbacks() {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  createFeedback(feedback: any) {
    return this.http.post(this.apiUrl, feedback, { headers: this.getHeaders() });
  }
}
```

---

## ÉTAPE 7: Tests et Validation

### 7.1 Ordre de Démarrage des Services

1. **Keycloak** (port 8180)
2. **Eureka Server** (port 8761)
3. **Config Server** (port 8888)
4. **Gateway** (port 8080)
5. **service-user** (port 8081)
6. **service-feedback** (port 8082)
7. **Frontend** (port 4200)

### 7.2 Vérifications à Effectuer

| Test | Action | Résultat Attendu |
|------|--------|------------------|
| 1 | Accéder à http://localhost:8180/admin | Console Keycloak accessible |
| 2 | Créer un utilisateur dans Keycloak | Utilisateur créé |
| 3 | Login via frontend | Redirection vers Keycloak |
| 4 | Appel API /api/users | Retourne 401 sans token |
| 5 | Appel API avec token | Retourne 200 avec données |
| 6 | Appel Feign entre services | Token propagé |

### 7.3 Dépannage Courant

#### Erreur: "Unable to resolve configuration"
```yaml
# Vérifier que l'issue-uri est correct
issuer-uri: http://localhost:8180/realms/gestions-ramzi
```

#### Erreur: "Token expired"
```typescript
// Dans Angular, configurer le refresh automatique
this.oauthService.setupAutomaticSilentRefresh();
```

#### Erreur: "CORS"
```yaml
# Dans Keycloak, client Web Origins
Web Origins: http://localhost:8080
```

---

## Configuration des Durées de Token (Réduire les Problèmes d'Expiration)

### Dans Keycloak

Aller à **Realm Settings** → **Tokens**:

| Paramètre | Valeur Recommandée | Description |
|-----------|---------------------|-------------|
| Access Token Lifespan | 5 minutes | Temps avant expiration |
| Client Login Timeout | 1 minute | Timeout de login |
| Offline Session Idle | 30 minutes | Session inactive max |
| Offline Session Max | 7 days | Session max |

### Configuration Refresh Token

```typescript
// Dans auth.config.ts
export const authConfig: AuthConfig = {
  // ... autres configs
  strictDiscoveryDocumentValidation: false,
  showDebugInformation: true,
  // Configurer le refresh automatique
};
```

---

## Résumé des Fichiers à Créer/Modifier

### Nouveaux Fichiers à Créer:

| Fichier | Service | Description |
|---------|---------|-------------|
| `SecurityConfig.java` | gateway | Configuration OAuth2 |
| `SecurityConfig.java` | service-user | Sécurité du service user |
| `SecurityConfig.java` | service-feedback | Sécurité du service feedback |
| `FeignTokenInterceptor.java` | service-feedback | Propager le token |
| `auth.service.ts` | frontend | Service d'authentification |

### Fichiers à Modifier:

| Fichier | Modification |
|---------|--------------|
| `gateway-service/pom.xml` | Ajouter dépendances OAuth2 |
| `gateway-service/application.yml` | Configurer JWT |
| `service-user/pom.xml` | Ajouter dépendances |
| `service-user/application.yml` | Configurer JWT |
| `service-feedback/pom.xml` | Ajouter dépendances |
| `service-feedback/application.yml` | Configurer JWT |
| Services Angular | Ajouter headers Authorization |

---

## Checklist Finale

- [ ] Keycloak installé et démarré
- [ ] Realm créé
- [ ] Rôles définis (ADMIN, ENSEIGNANT, ETUDIANT)
- [ ] Clients configurés (gateway, frontend)
- [ ] Gateway avec OAuth2 Resource Server
- [ ] service-user sécurisé
- [ ] service-feedback sécurisé
- [ ] Feign interceptor configuré
- [ ] Frontend avec angular-oauth2-oidc
- [ ] Tests de communication inter-services
- [ ] Tests de login/logout

---

## Notes Importantes

1. **Toujours tester localement** avant de déployer en production
2. **Garder une version de sauvegarde** du projet avant les modifications
3. **Documenter les configurations** pour le debugging
4. **Utiliser des variables d'environnement** pour les secrets en production
5. **Configurer les timeouts** appropriés pour éviter les blocages

---

*Document généré pour minimiser les risques d'intégration Keycloak dans le projet Gestions_Ramzi*

