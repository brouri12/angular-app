# 🚀 Plan d'Action: Finaliser la Migration TND

## ✅ DÉJÀ FAIT (Code Modifié)

### Frontend
- ✅ `pricing.html` - 4 emplacements mis à jour avec "TND"
- ✅ `pricing.ts` - Méthode getPrice() correcte (sans $)

### Back-Office
- ✅ `dashboard.html` - Prix moyen en TND
- ✅ `dashboard.ts` - Stats Average Price et Revenue Potential en TND

### Scripts
- ✅ `UPDATE_CURRENCY_TO_TND.ps1` - Corrigé
- ✅ `EXECUTE_TND_MIGRATION.ps1` - Créé
- ✅ `MIGRATE_TO_TND.sql` - Prêt

---

## 📋 À FAIRE MAINTENANT

### Étape 1: Migrer la Base de Données (5 min)

#### Option A: Script PowerShell (Recommandé)
```powershell
.\EXECUTE_TND_MIGRATION.ps1
```
Le script va:
1. Afficher les nouveaux prix
2. Vous guider vers phpMyAdmin
3. Vous donner le SQL à exécuter

#### Option B: Manuellement
1. Ouvrez http://localhost/phpmyadmin
2. Sélectionnez `abonnement_db`
3. Onglet "SQL"
4. Exécutez:
```sql
USE abonnement_db;
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';
SELECT id_abonnement, nom, prix, duree_jours, statut FROM abonnements;
```

### Étape 2: Redémarrer les Services (2 min)

```bash
# Terminal 1 - Frontend
cd frontend/angular-app
npm start

# Terminal 2 - Back-Office  
cd back-office
npm start
```

### Étape 3: Tester (3 min)

#### Test 1: Page Pricing
- URL: http://localhost:4200/pricing
- ✅ Vérifier: "30 TND", "90 TND", "300 TND"
- ✅ Vérifier: Modal d'achat affiche "TND"
- ✅ Vérifier: Bouton Stripe affiche "Pay X TND"

#### Test 2: Dashboard
- URL: http://localhost:4201/dashboard
- ✅ Vérifier: Stats "Average Price" en TND
- ✅ Vérifier: Stats "Revenue Potential" en TND
- ✅ Vérifier: Carte "Average Price" en TND

#### Test 3: Paiement (Optionnel)
- Créer un compte test
- Essayer d'acheter un abonnement
- Vérifier que le montant est correct

---

## 🎯 Résultat Attendu

### Avant (USD)
```
Basic: $9.99/month
Premium: $29.99/month
Enterprise: $99.99/month
```

### Après (TND)
```
Basic: 30 TND/month
Premium: 90 TND/month
Enterprise: 300 TND/month
```

---

## ⚠️ Points Importants

### 1. Stripe et TND
Stripe ne supporte pas TND directement. Deux options:

**Option 1: Court terme (Actuel)**
- Afficher en TND sur le site
- Stripe traite en USD en arrière-plan
- Conversion: 30 TND ≈ $9.52 USD

**Option 2: Long terme (Recommandé)**
Intégrer un gateway tunisien:
- **Paymee**: https://paymee.tn
- **Flouci**: https://www.flouci.com  
- **Konnect**: https://konnect.network

### 2. Conversion des Montants
Si vous gardez Stripe, vous devrez convertir TND → USD:
```typescript
// Dans pricing.ts, avant d'appeler Stripe
const amountInTND = this.billingCycle() === 'monthly' 
  ? abonnement.prix 
  : abonnement.prix * 10;

const amountInUSD = amountInTND / 3.15; // Conversion TND → USD
```

### 3. Paiements Existants
Les paiements déjà effectués en USD restent en USD dans la base de données. Seuls les nouveaux abonnements seront en TND.

---

## 📊 Checklist Complète

### Code
- [x] Modifier pricing.html
- [x] Vérifier pricing.ts
- [x] Modifier dashboard.html
- [x] Modifier dashboard.ts
- [x] Corriger scripts PowerShell

### Base de Données
- [ ] Exécuter MIGRATE_TO_TND.sql
- [ ] Vérifier les nouveaux prix
- [ ] Backup des anciennes valeurs (automatique dans le script)

### Tests
- [ ] Redémarrer frontend
- [ ] Redémarrer back-office
- [ ] Tester page pricing
- [ ] Tester dashboard
- [ ] Tester modal d'achat
- [ ] (Optionnel) Tester paiement complet

### Documentation
- [x] CURRENCY_MIGRATION_COMPLETE.md
- [x] TND_MIGRATION_SUMMARY.md
- [x] ACTION_PLAN_TND.md (ce fichier)
- [x] EXECUTE_TND_MIGRATION.ps1

---

## 🆘 En Cas de Problème

### Problème 1: Les prix ne changent pas
**Solution**: Vérifiez que vous avez bien exécuté le SQL dans la bonne base de données (`abonnement_db`)

### Problème 2: Erreur "$ is not defined"
**Solution**: Vérifiez qu'il n'y a plus de `$` dans les templates HTML (déjà corrigé)

### Problème 3: Stripe refuse le paiement
**Solution**: Stripe traite en USD. Vous devez convertir TND → USD avant d'appeler Stripe

### Problème 4: Dashboard affiche toujours $
**Solution**: Videz le cache du navigateur (Ctrl+Shift+R) et redémarrez le back-office

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Consultez `CURRENCY_MIGRATION_COMPLETE.md`
2. Consultez `TND_QUICK_GUIDE.md`
3. Vérifiez les logs de la console (F12)
4. Vérifiez les logs Spring Boot

---

## 🎉 Prochaines Étapes (Après Migration)

1. **Tester en production** avec de vrais utilisateurs
2. **Monitorer les paiements** pour détecter les problèmes
3. **Considérer un gateway tunisien** pour support TND natif
4. **Mettre à jour la documentation** utilisateur
5. **Former l'équipe** sur les nouveaux prix

---

**Date**: 2026-03-05  
**Status**: Prêt à exécuter ✅  
**Temps estimé**: 10 minutes  
**Difficulté**: Facile 🟢
