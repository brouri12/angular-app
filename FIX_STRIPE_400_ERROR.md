# 🔧 Fix Stripe 400 Bad Request Error

## Le Problème

Vous voyez cette erreur dans la console:
```
POST http://localhost:8888/user-service/api/payments/create-payment-intent 400 (Bad Request)
```

## 🎯 La Cause

Le **UserService n'a pas été redémarré** après la mise à jour des clés Stripe!

Les nouvelles clés Stripe sont dans `application.properties`, mais le service utilise encore les anciennes clés en mémoire.

---

## ✅ Solution (3 étapes simples)

### Étape 1: Arrêter UserService

Dans IntelliJ:
1. Trouvez l'onglet "Run" en bas
2. Cliquez sur le bouton rouge carré (Stop)
3. Attendez que le service s'arrête complètement

### Étape 2: Redémarrer UserService

Dans IntelliJ:
1. Ouvrez: `UserService/src/main/java/tn/esprit/user/UserApplication.java`
2. Clic droit sur le fichier
3. Sélectionnez "Run 'UserApplication'"
4. Attendez le message: **"Started UserApplication"**

### Étape 3: Tester à nouveau

1. Retournez sur: http://localhost:4200/pricing
2. Sélectionnez un plan
3. Cliquez "Credit Card"
4. Entrez:
   - Carte: `4242 4242 4242 4242`
   - Expiration: `12/28`
   - CVC: `123`
5. Cliquez "Pay Now"
6. ✅ Ça devrait marcher maintenant!

---

## 🔍 Vérification

Pour vérifier que tout est OK, exécutez:

```powershell
.\TEST_STRIPE_ENDPOINT.ps1
```

Ce script va:
- Vérifier que UserService est en cours d'exécution
- Tester l'endpoint de payment intent
- Vérifier la configuration Stripe

---

## 📋 Checklist de Dépannage

- [ ] UserService est arrêté
- [ ] UserService est redémarré
- [ ] Message "Started UserApplication" visible dans la console
- [ ] Aucune erreur dans les logs UserService
- [ ] Test de paiement fonctionne

---

## 🐛 Si ça ne marche toujours pas

### Vérifiez les logs UserService

Dans IntelliJ, regardez la console UserService pour:

**Bon signe:**
```
Stripe initialized with API key
```

**Mauvais signe:**
```
Error initializing Stripe
Invalid API key
```

### Vérifiez la configuration

Exécutez:
```powershell
.\VERIFY_CONFIGURATION.ps1
```

Tous les checks doivent être verts (OK).

### Vérifiez que vous êtes connecté

L'endpoint nécessite une authentification:
1. Allez sur http://localhost:4200
2. Connectez-vous avec votre compte
3. Essayez le paiement à nouveau

---

## 💡 Pourquoi ce problème?

Quand vous modifiez `application.properties`:
- ❌ Les changements ne sont PAS appliqués automatiquement
- ✅ Vous DEVEZ redémarrer le service

C'est comme ça que Spring Boot fonctionne!

---

## 🎯 Résumé Rapide

**Problème:** 400 Bad Request sur payment intent
**Cause:** UserService pas redémarré
**Solution:** Redémarrer UserService dans IntelliJ

C'est tout! 🚀
