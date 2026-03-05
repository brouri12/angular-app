# Guide Rapide: Passer en Dinar Tunisien (TND)

## ⚡ En 5 Étapes

### 1️⃣ Base de Données (2 min)
```sql
-- Ouvrez phpMyAdmin et exécutez:
USE abonnement_db;

UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

SELECT * FROM abonnements;
```

### 2️⃣ Pricing Page HTML (1 min)
**Fichier**: `frontend/angular-app/src/app/pages/pricing/pricing.html`

Cherchez (Ctrl+F):
```html
${{ getPrice(abonnement) }}
```

Remplacez par:
```html
{{ getPrice(abonnement) }} TND
```

### 3️⃣ Dashboard HTML (1 min)
**Fichier**: `back-office/src/app/pages/dashboard/dashboard.html`

Cherchez tous les `$` et remplacez par `TND`

Exemple:
```html
<!-- AVANT -->
${{ payment.montant }}

<!-- APRÈS -->
{{ payment.montant }} TND
```

### 4️⃣ Dashboard TypeScript (1 min)
**Fichier**: `back-office/src/app/pages/dashboard/dashboard.ts`

Ligne ~140:
```typescript
// AVANT
value: `$${analytics.averagePrice.toFixed(2)}`,

// APRÈS
value: `${analytics.averagePrice.toFixed(2)} TND`,
```

Ligne ~155:
```typescript
// AVANT
value: `$${analytics.totalRevenuePotential.toFixed(2)}`,

// APRÈS
value: `${analytics.totalRevenuePotential.toFixed(2)} TND`,
```

### 5️⃣ Redémarrer (30 sec)
```bash
# Redémarrez le frontend
cd frontend/angular-app
npm start

# Redémarrez le back-office
cd back-office
npm start
```

## ✅ Vérification

Ouvrez:
- http://localhost:4200/pricing → Devrait afficher "30 TND", "90 TND", "300 TND"
- http://localhost:4201/dashboard → Devrait afficher les prix en TND

## 💡 Nouveaux Prix

| Plan | Mensuel | Annuel |
|------|---------|--------|
| Basic | 30 TND | 300 TND |
| Premium | 90 TND | 900 TND |
| Enterprise | 300 TND | 3000 TND |

## ⚠️ Important

**Stripe ne supporte pas TND directement!**

Options:
1. **Afficher en TND mais payer en USD** (solution temporaire)
2. **Utiliser un gateway tunisien**: Paymee, Flouci, Konnect

---

**C'est tout! Vos prix sont maintenant en TND! 🇹🇳**
