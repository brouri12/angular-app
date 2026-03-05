# 🚀 Référence Rapide: Migration TND

## ⚡ En 3 Commandes

### 1️⃣ Exécuter le SQL
```sql
USE abonnement_db;
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';
```

### 2️⃣ Redémarrer Frontend
```bash
cd frontend/angular-app && npm start
```

### 3️⃣ Redémarrer Back-Office
```bash
cd back-office && npm start
```

---

## 💰 Nouveaux Prix

| Plan | Prix |
|------|------|
| Basic | 30 TND |
| Premium | 90 TND |
| Enterprise | 300 TND |

---

## 🔍 Vérification Rapide

### URLs à Tester
- http://localhost:4200/pricing
- http://localhost:4201/dashboard

### Ce que vous devez voir
✅ "30 TND", "90 TND", "300 TND" sur la page pricing  
✅ "TND" dans les stats du dashboard  
✅ "Pay X TND" dans les modals de paiement

---

## 📁 Fichiers Modifiés

```
✅ frontend/angular-app/src/app/pages/pricing/pricing.html
✅ frontend/angular-app/src/app/pages/pricing/pricing.ts
✅ back-office/src/app/pages/dashboard/dashboard.html
✅ back-office/src/app/pages/dashboard/dashboard.ts
```

---

## 🆘 Problèmes Courants

### Problème: Prix ne changent pas
**Solution**: Exécutez le SQL dans phpMyAdmin

### Problème: Toujours "$" affiché
**Solution**: Videz le cache (Ctrl+Shift+R)

### Problème: Stripe erreur
**Solution**: Stripe traite en USD, conversion nécessaire

---

## 📚 Documentation Complète

- `ACTION_PLAN_TND.md` - Plan d'action détaillé
- `CURRENCY_MIGRATION_COMPLETE.md` - Guide complet
- `BEFORE_AFTER_TND.md` - Comparaison visuelle
- `TND_QUICK_GUIDE.md` - Guide en 5 étapes
- `MIGRATE_TO_TND.sql` - Script SQL complet

---

## ⏱️ Temps Estimé

- Migration SQL: 2 min
- Redémarrage: 2 min
- Tests: 3 min
- **TOTAL: 7 minutes**

---

**Status**: ✅ Code prêt | ⏳ SQL à exécuter
