# 🔄 Comment Redémarrer UserService

## Le Problème

Erreur 400 lors du paiement Stripe? Vous devez redémarrer UserService!

---

## 📍 Étape 1: Ouvrir IntelliJ

Ouvrez IntelliJ IDEA avec votre projet.

---

## 🛑 Étape 2: Arrêter UserService

### Option A: Via l'onglet Run
1. En bas de IntelliJ, cliquez sur l'onglet **"Run"**
2. Vous verrez "UserApplication" en cours d'exécution
3. Cliquez sur le **bouton rouge carré** (Stop) à gauche
4. Attendez que le service s'arrête

### Option B: Via le menu
1. Menu: **Run** → **Stop 'UserApplication'**
2. Ou utilisez le raccourci: **Ctrl+F2**

---

## ▶️ Étape 3: Démarrer UserService

### Méthode 1: Via le fichier
1. Dans l'explorateur de projet (à gauche), naviguez vers:
   ```
   UserService
   └── src
       └── main
           └── java
               └── tn
                   └── esprit
                       └── user
                           └── UserApplication.java
   ```

2. **Clic droit** sur `UserApplication.java`

3. Sélectionnez: **"Run 'UserApplication'"**

### Méthode 2: Via le bouton Play
1. En haut à droite de IntelliJ
2. Sélectionnez "UserApplication" dans le menu déroulant
3. Cliquez sur le **bouton vert Play** (▶️)

---

## ✅ Étape 4: Vérifier que ça marche

### Dans la console IntelliJ

Attendez de voir ces messages:

```
✓ Started UserApplication in X.XXX seconds
✓ Stripe initialized with API key
✓ Tomcat started on port(s): 8085
```

### Tester l'endpoint

Ouvrez PowerShell et exécutez:
```powershell
.\TEST_STRIPE_ENDPOINT.ps1
```

Ou testez manuellement:
```powershell
curl http://localhost:8085/api/users/hello
```

Si vous voyez une réponse, c'est bon! ✅

---

## 🎯 Maintenant Testez le Paiement

1. Allez sur: http://localhost:4200/pricing
2. Sélectionnez un plan
3. Cliquez "Credit Card"
4. Entrez la carte de test: `4242 4242 4242 4242`
5. Expiration: `12/28`, CVC: `123`
6. Cliquez "Pay Now"
7. ✅ Le paiement devrait fonctionner!

---

## 🐛 Si ça ne marche toujours pas

### Vérifiez les erreurs dans la console

Si vous voyez des erreurs rouges dans la console IntelliJ:

**Erreur de port déjà utilisé:**
```
Port 8085 is already in use
```
→ Solution: Tuez le processus Java qui utilise le port 8085

**Erreur de connexion MySQL:**
```
Unable to connect to database
```
→ Solution: Démarrez MySQL (port 3307)

**Erreur Stripe:**
```
Invalid API key
```
→ Solution: Vérifiez que les clés Stripe sont correctes dans `application.properties`

### Vérifiez la configuration complète

```powershell
.\VERIFY_CONFIGURATION.ps1
```

Tous les checks doivent être verts!

---

## 📝 Notes Importantes

1. **Toujours redémarrer après modification de `application.properties`**
2. **Attendez le message "Started UserApplication"** avant de tester
3. **Vérifiez qu'il n'y a pas d'erreurs** dans la console
4. **MySQL doit être démarré** (port 3307)
5. **Eureka doit être démarré** (port 8761)

---

## 🚀 Raccourcis Clavier IntelliJ

- **Ctrl+F2**: Arrêter l'application
- **Shift+F10**: Exécuter l'application
- **Alt+5**: Ouvrir l'onglet Debug/Run

---

## ✅ Checklist Rapide

Avant de tester le paiement:

- [ ] UserService arrêté
- [ ] UserService redémarré
- [ ] Message "Started UserApplication" visible
- [ ] Aucune erreur rouge dans la console
- [ ] Test endpoint réussit: `curl http://localhost:8085/api/users/hello`
- [ ] Prêt à tester le paiement!

---

## 🎉 C'est Tout!

Après le redémarrage, votre système de paiement Stripe devrait fonctionner parfaitement!
