# Guide - Authentification en Modal (Popup)

## ✅ Modification Appliquée

Les pages Login et Register ont été transformées en **modals (popups)** qui s'ouvrent depuis le header.

## 📝 Fichiers Créés

### 1. Service Modal
- `frontend/angular-app/src/app/services/modal.service.ts`
  - Gestion de l'état du modal (ouvert/fermé)
  - Méthodes: `openLogin()`, `openRegister()`, `close()`

### 2. Composant Auth Modal
- `frontend/angular-app/src/app/components/auth-modal/auth-modal.ts`
- `frontend/angular-app/src/app/components/auth-modal/auth-modal.html`
- `frontend/angular-app/src/app/components/auth-modal/auth-modal.css`
  - Modal unique contenant Login ET Register
  - Basculement entre les deux formulaires
  - Logique d'authentification intégrée

### 3. Fichiers Modifiés
- `frontend/angular-app/src/app/components/header/header.ts` - Utilise ModalService
- `frontend/angular-app/src/app/components/header/header.html` - Boutons ouvrent modal
- `frontend/angular-app/src/app/app.ts` - Import AuthModal
- `frontend/angular-app/src/app/app.html` - Ajout <app-auth-modal>
- `frontend/angular-app/src/app/app.routes.ts` - Routes /login et /register supprimées

## 🎯 Fonctionnement

### Ouverture du Modal

**Depuis le Header**:
- Cliquer sur "Sign In" → Ouvre modal Login
- Cliquer sur "Get Started" → Ouvre modal Register

**Depuis le Modal**:
- "Don't have an account? Sign up" → Bascule vers Register
- "Already have an account? Sign in" → Bascule vers Login

### Fermeture du Modal

- Cliquer sur le bouton X (en haut à droite)
- Cliquer en dehors du modal (sur le backdrop)
- Après connexion réussie
- Après inscription réussie (bascule vers Login)

## 🎨 Design

### Modal
- Centré sur l'écran
- Fond semi-transparent (backdrop)
- Largeur maximale: 28rem (448px)
- Hauteur maximale: 90vh (scrollable)
- Responsive (adapté mobile)

### Formulaires
- Login: Compact (username, password)
- Register: Complet avec rôles (Student/Teacher)
- Validation en temps réel
- Messages d'erreur/succès

### Animations
- Backdrop fade-in
- Modal slide-in (via Tailwind transitions)

## 📊 Flux Utilisateur

### Inscription
```
1. Cliquer "Get Started" dans header
2. Modal Register s'ouvre
3. Choisir rôle (Student/Teacher)
4. Remplir formulaire
5. Cliquer "Create Account"
6. Message de succès
7. Bascule automatique vers Login après 1.5s
```

### Connexion
```
1. Cliquer "Sign In" dans header
2. Modal Login s'ouvre
3. Entrer username et password
4. Cliquer "Sign in"
5. Modal se ferme
6. Header affiche utilisateur connecté
```

## 🔧 Architecture

### ModalService
```typescript
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalType>(null);
  public modal$ = this.modalSubject.asObservable();

  openLogin() { ... }
  openRegister() { ... }
  close() { ... }
}
```

### AuthModal Component
```typescript
export class AuthModal {
  currentModal: 'login' | 'register' | null = null;
  
  // Subscribe to modal state
  ngOnInit() {
    this.modalService.modal$.subscribe(modal => {
      this.currentModal = modal;
    });
  }
}
```

### Header Component
```typescript
export class Header {
  openLogin() {
    this.modalService.openLogin();
  }

  openRegister() {
    this.modalService.openRegister();
  }
}
```

## 🎯 Avantages

### UX Améliorée
- ✅ Pas de changement de page
- ✅ Contexte préservé
- ✅ Plus rapide et fluide
- ✅ Moderne et professionnel

### Technique
- ✅ Un seul composant pour Login et Register
- ✅ Gestion d'état centralisée (ModalService)
- ✅ Moins de routes à gérer
- ✅ Code plus maintenable

### Mobile
- ✅ Adapté aux petits écrans
- ✅ Scrollable si contenu trop grand
- ✅ Fermeture intuitive

## 🚀 Pour Tester

### Desktop
1. Ouvrir http://localhost:44510
2. Cliquer "Get Started" dans header
3. Modal Register s'ouvre
4. Tester le formulaire
5. Cliquer "Already have an account? Sign in"
6. Modal bascule vers Login
7. Tester la connexion

### Mobile
1. Ouvrir sur mobile ou réduire la fenêtre
2. Ouvrir menu hamburger
3. Cliquer "Get Started"
4. Modal s'ouvre en plein écran
5. Formulaire adapté à la taille

## 📝 Comparaison

### AVANT (Pages)
```
Header → Click "Sign In" → Navigate to /login → New page
Header → Click "Get Started" → Navigate to /register → New page
```

### APRÈS (Modals)
```
Header → Click "Sign In" → Modal opens → Stay on same page
Header → Click "Get Started" → Modal opens → Stay on same page
```

## 🎨 Personnalisation

### Changer la taille du modal
```html
<!-- Dans auth-modal.html -->
<div class="max-w-md w-full"> <!-- Changer max-w-md -->
```

### Changer les couleurs
```html
<!-- Backdrop -->
<div class="bg-black bg-opacity-50"> <!-- Changer opacity -->

<!-- Boutons -->
<button class="bg-gradient-to-r from-[rgb(0,200,151)] to-[rgb(255,127,80)]">
```

### Désactiver la fermeture par backdrop
```html
<!-- Supprimer (click)="closeModal()" du backdrop -->
<div class="fixed inset-0 bg-black bg-opacity-50"></div>
```

## 🐛 Dépannage

### Modal ne s'ouvre pas
**Vérifier**:
1. AuthModal est importé dans app.ts
2. <app-auth-modal> est dans app.html
3. ModalService est injecté dans header.ts

### Modal ne se ferme pas
**Vérifier**:
1. closeModal() est appelé correctement
2. Pas d'erreur dans la console
3. modalService.close() fonctionne

### Formulaire ne soumet pas
**Vérifier**:
1. Keycloak est démarré (pour Login)
2. User Service est démarré (pour Register)
3. Pas d'erreur CORS

## ✅ Résultat Final

Système d'authentification moderne avec modals:
- ✅ Login en popup
- ✅ Register en popup
- ✅ Basculement fluide entre les deux
- ✅ UX améliorée
- ✅ Design moderne

## 📚 Documentation

- `MODAL_AUTH_GUIDE.md` - Ce fichier
- `FRONTEND_AUTH_GUIDE.md` - Guide général authentification
- `TEST_AUTH_FRONTEND.md` - Tests
