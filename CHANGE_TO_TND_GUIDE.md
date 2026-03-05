# Guide: Changer les Prix en Dinar Tunisien (TND)

## 📋 Taux de Conversion

**1 USD ≈ 3.15 TND** (Taux approximatif)
**1 EUR ≈ 3.35 TND** (Taux approximatif)

## 🎯 Nouveaux Prix Suggérés

| Plan | Prix USD | Prix TND | Prix Arrondi TND |
|------|----------|----------|------------------|
| Basic | $9.99 | 31.47 TND | **30 TND** |
| Premium | $29.99 | 94.47 TND | **90 TND** |
| Enterprise | $99.99 | 314.97 TND | **300 TND** |

## 📝 Fichiers à Modifier

### 1. Base de Données MySQL

```sql
-- Mettre à jour les prix dans la table abonnements
UPDATE abonnement_db.abonnements 
SET prix = 30.00 
WHERE id_abonnement = 1; -- Basic

UPDATE abonnement_db.abonnements 
SET prix = 90.00 
WHERE id_abonnement = 2; -- Premium

UPDATE abonnement_db.abonnements 
SET prix = 300.00 
WHERE id_abonnement = 3; -- Enterprise
```

### 2. Frontend - Pricing Page

**Fichier**: `frontend/angular-app/src/app/pages/pricing/pricing.html`

Cherchez et remplacez:
- `$` par `TND` ou `DT`
- Mettez à jour les prix affichés

### 3. Frontend - Pricing Component

**Fichier**: `frontend/angular-app/src/app/pages/pricing/pricing.ts`

Dans la méthode `getPrice()`, ajoutez le symbole TND:

```typescript
getPrice(abonnement: Abonnement): string {
  const prix = this.billingCycle() === 'monthly' 
    ? abonnement.prix 
    : abonnement.prix * 10;
  return `${prix} TND`; // ou DT
}
```

### 4. Backend - Stripe Configuration

**Fichier**: `UserService/src/main/resources/application.properties`

Changez la devise Stripe:

```properties
# Avant
stripe.currency=usd

# Après
stripe.currency=tnd
```

**Note**: Vérifiez que Stripe supporte TND dans votre région!

### 5. Backend - Payment Service

**Fichier**: `UserService/src/main/java/tn/esprit/user/service/PaymentService.java`

Si vous utilisez Stripe, mettez à jour la devise dans les appels API.

### 6. Dashboard Analytics

**Fichier**: `back-office/src/app/pages/dashboard/dashboard.ts`

Mettez à jour l'affichage des prix:

```typescript
{
  label: 'Average Price',
  value: `${analytics.averagePrice.toFixed(2)} TND`, // Changez $ en TND
  // ...
}
```

**Fichier**: `back-office/src/app/pages/dashboard/dashboard.html`

Cherchez tous les `$` et remplacez par `TND` ou `DT`.

## 🔧 Script SQL Complet

```sql
-- Script pour changer tous les prix en TND
-- Exécutez ce script dans phpMyAdmin

USE abonnement_db;

-- Mettre à jour les prix des abonnements
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

-- Vérifier les changements
SELECT id_abonnement, nom, prix, duree_jours FROM abonnements;
```

## 📱 Modifications Frontend Détaillées

### Pricing Page (pricing.html)

Cherchez et remplacez:

```html
<!-- AVANT -->
<span class="text-5xl font-bold">
  ${{ getPrice(abonnement) }}
</span>

<!-- APRÈS -->
<span class="text-5xl font-bold">
  {{ getPrice(abonnement) }} TND
</span>
```

### Pricing Component (pricing.ts)

```typescript
// AVANT
getPrice(abonnement: Abonnement): string {
  const prix = this.billingCycle() === 'monthly' 
    ? abonnement.prix 
    : abonnement.prix * 10;
  return `${prix}`;
}

// APRÈS
getPrice(abonnement: Abonnement): string {
  const prix = this.billingCycle() === 'monthly' 
    ? abonnement.prix 
    : abonnement.prix * 10;
  return `${prix.toFixed(2)}`;
}

// Et dans le template, ajoutez TND
```

### Dashboard (dashboard.html)

```html
<!-- AVANT -->
<td class="px-6 py-4 font-medium">
  ${{ payment.montant }}
</td>

<!-- APRÈS -->
<td class="px-6 py-4 font-medium">
  {{ payment.montant }} TND
</td>
```

## 🎨 Symbole à Utiliser

Vous avez 3 options:

1. **TND** (Recommandé pour clarté internationale)
   ```
   90 TND
   ```

2. **DT** (Dinar Tunisien - usage local)
   ```
   90 DT
   ```

3. **د.ت** (Symbole arabe)
   ```
   90 د.ت
   ```

## ⚠️ Points Importants

### 1. Stripe et TND

Stripe ne supporte pas directement TND. Options:

**Option A**: Continuer avec USD mais afficher en TND
```typescript
// Affichage en TND pour l'utilisateur
displayPrice = priceUSD * 3.15;

// Mais paiement Stripe en USD
stripeAmount = priceUSD;
```

**Option B**: Utiliser un gateway de paiement local tunisien
- **Paymee** (Tunisie)
- **Flouci** (Tunisie)
- **Konnect** (Tunisie)

### 2. Conversion Dynamique

Si vous voulez garder USD en backend mais afficher TND:

```typescript
// Service de conversion
export class CurrencyService {
  private readonly USD_TO_TND = 3.15;
  
  convertToTND(usdAmount: number): number {
    return usdAmount * this.USD_TO_TND;
  }
  
  formatTND(amount: number): string {
    return `${amount.toFixed(2)} TND`;
  }
}
```

### 3. Base de Données

Décidez si vous voulez:
- **Stocker en TND**: Changez tous les prix dans la DB
- **Stocker en USD, afficher en TND**: Gardez USD en DB, convertissez à l'affichage

## 📋 Checklist de Migration

- [ ] Mettre à jour les prix dans la base de données
- [ ] Modifier pricing.html (symbole $)
- [ ] Modifier pricing.ts (getPrice method)
- [ ] Modifier dashboard.html (tous les $)
- [ ] Modifier dashboard.ts (analytics display)
- [ ] Modifier payment modals
- [ ] Modifier subscription reminders
- [ ] Tester tous les affichages de prix
- [ ] Vérifier les calculs (prorata, réductions)
- [ ] Mettre à jour la documentation
- [ ] Informer les utilisateurs du changement

## 🚀 Script de Migration Automatique

Créez ce fichier: `MIGRATE_TO_TND.sql`

```sql
-- Migration vers TND
-- Date: 2026-03-05
-- Taux: 1 USD = 3.15 TND

USE abonnement_db;

-- Backup des anciennes valeurs
CREATE TABLE IF NOT EXISTS abonnements_backup AS SELECT * FROM abonnements;

-- Mise à jour des prix
UPDATE abonnements SET prix = ROUND(prix * 3.15, 2);

-- Ou utiliser les prix arrondis
UPDATE abonnements SET prix = 30.00 WHERE nom = 'Basic';
UPDATE abonnements SET prix = 90.00 WHERE nom = 'Premium';
UPDATE abonnements SET prix = 300.00 WHERE nom = 'Enterprise';

-- Vérification
SELECT 
    nom,
    prix as 'Prix TND',
    duree_jours as 'Durée (jours)',
    ROUND(prix / duree_jours, 2) as 'Prix/jour'
FROM abonnements;
```

## 🎯 Recommandation Finale

**Prix Suggérés pour la Tunisie**:

| Plan | Prix Mensuel | Prix Annuel | Économie |
|------|--------------|-------------|----------|
| Basic | **30 TND** | **300 TND** | 60 TND (17%) |
| Premium | **90 TND** | **900 TND** | 180 TND (17%) |
| Enterprise | **300 TND** | **3000 TND** | 600 TND (17%) |

Ces prix sont:
- ✅ Arrondis et faciles à retenir
- ✅ Compétitifs pour le marché tunisien
- ✅ Alignés avec le pouvoir d'achat local

## 📞 Support

Si vous avez besoin d'aide pour:
- Intégrer un gateway de paiement tunisien
- Configurer la conversion automatique
- Tester les changements

N'hésitez pas à demander!
