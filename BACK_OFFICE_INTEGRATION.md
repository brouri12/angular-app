# Back-Office Integration Guide

## Vue d'ensemble

Le back-office est maintenant complètement intégré avec le backend Spring Boot pour la gestion des abonnements.

## Fonctionnalités Implémentées

### 1. Dashboard
- ✅ Statistiques en temps réel depuis l'API
  - Total des abonnements
  - Plans actifs
  - Revenu total
  - Paiements validés
- ✅ Liste des paiements récents
- ✅ Chargement dynamique des données

### 2. Page Subscriptions (Nouvelle)
- ✅ Liste complète des abonnements
- ✅ Recherche par nom/description
- ✅ Filtrage par statut (Actif/Inactif)
- ✅ Création d'abonnements
- ✅ Modification d'abonnements
- ✅ Suppression d'abonnements
- ✅ Toggle statut (Actif ↔ Inactif)
- ✅ Modal d'édition complet

## Fichiers Créés

```
back-office/src/app/
├── models/
│   └── abonnement.model.ts          # Interfaces TypeScript
├── services/
│   └── abonnement.service.ts        # Service HTTP
├── pages/
│   ├── dashboard/
│   │   └── dashboard.ts             # Mis à jour avec données réelles
│   └── subscriptions/               # Nouvelle page
│       ├── subscriptions.ts
│       ├── subscriptions.html
│       └── subscriptions.css
├── app.config.ts                    # Ajout HttpClient
└── app.routes.ts                    # Ajout route subscriptions
```

## Configuration

### API URL
Le service utilise l'API Gateway par défaut:
```typescript
private apiUrl = 'http://localhost:8888/abonnement-service/api/abonnements';
```

### CORS
Le backend est configuré pour accepter les requêtes depuis le back-office.

## Démarrage

### 1. Backend (dans l'ordre)
```bash
# 1. MySQL (port 3307)
# 2. Eureka Server (port 8761)
# 3. Abonnement Service (port 8084)
# 4. API Gateway (port 8888)
```

### 2. Back-Office
```bash
cd back-office
npm install
npm start
# Ouvre: http://localhost:4201
```

## Utilisation

### Dashboard
1. Ouvrir http://localhost:4201
2. Les statistiques se chargent automatiquement
3. Voir les 4 paiements les plus récents

### Gestion des Abonnements
1. Cliquer sur "Subscriptions" dans le menu
2. **Créer un abonnement**:
   - Cliquer sur "Add Subscription"
   - Remplir le formulaire
   - Cliquer sur "Create"
3. **Modifier un abonnement**:
   - Cliquer sur l'icône crayon
   - Modifier les champs
   - Cliquer sur "Update"
4. **Changer le statut**:
   - Cliquer sur le badge de statut
   - Toggle entre Actif/Inactif
5. **Supprimer**:
   - Cliquer sur l'icône poubelle
   - Confirmer la suppression
6. **Rechercher**:
   - Utiliser la barre de recherche
   - Filtrer par statut

## Endpoints Utilisés

### Abonnements
- `GET /api/abonnements` - Liste tous
- `GET /api/abonnements/{id}` - Détails
- `POST /api/abonnements` - Créer
- `PUT /api/abonnements/{id}` - Modifier
- `PATCH /api/abonnements/{id}/statut` - Changer statut
- `DELETE /api/abonnements/{id}` - Supprimer
- `GET /api/abonnements/search/byStatut` - Filtrer

### Paiements
- `GET /api/abonnements/paiements` - Liste tous
- `GET /api/abonnements/paiements/{id}` - Détails
- `POST /api/abonnements/paiements` - Créer
- `GET /api/abonnements/paiements/client/{email}` - Par client
- `PATCH /api/abonnements/paiements/{id}/statut` - Changer statut

## Captures d'écran des Fonctionnalités

### Dashboard
- Cartes de statistiques avec données réelles
- Tableau des paiements récents
- Loading states

### Subscriptions
- Tableau avec toutes les colonnes
- Boutons d'action (Edit, Delete)
- Modal de création/édition
- Recherche et filtres

## Tests

### Test Complet
1. **Créer un abonnement**:
   ```
   Nom: Test Plan
   Prix: 19.99
   Durée: 30 jours
   Niveau: Premium
   ```

2. **Vérifier dans le frontend**:
   - Aller sur http://localhost:4200/pricing
   - Le nouvel abonnement doit apparaître

3. **Modifier le statut**:
   - Mettre en "Inactif"
   - Vérifier qu'il disparaît du frontend

4. **Supprimer**:
   - Supprimer l'abonnement
   - Vérifier qu'il n'apparaît plus

## Troubleshooting

### Erreur CORS
- Vérifier que le backend a `@CrossOrigin(origins = "*")`
- Redémarrer le backend

### Données ne se chargent pas
- Vérifier que tous les services backend sont démarrés
- Vérifier l'URL dans `abonnement.service.ts`
- Ouvrir la console du navigateur pour voir les erreurs

### Modal ne s'affiche pas
- Vérifier que FormsModule est importé
- Vérifier la console pour les erreurs

## Prochaines Étapes

1. ✅ Dashboard avec statistiques réelles
2. ✅ Page de gestion des abonnements complète
3. 🔄 Page de gestion des paiements
4. 🔄 Graphiques et analytics avancés
5. 🔄 Export de données (CSV, PDF)
6. 🔄 Notifications en temps réel
7. 🔄 Authentification admin

## Comparaison Frontend vs Back-Office

| Fonctionnalité | Frontend | Back-Office |
|----------------|----------|-------------|
| Voir abonnements | ✅ (Actifs seulement) | ✅ (Tous) |
| Acheter abonnement | ✅ | ❌ |
| Créer abonnement | ❌ | ✅ |
| Modifier abonnement | ❌ | ✅ |
| Supprimer abonnement | ❌ | ✅ |
| Voir paiements | ❌ | ✅ |
| Statistiques | ❌ | ✅ |
