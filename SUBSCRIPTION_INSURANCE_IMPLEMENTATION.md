# 🛡️ Subscription Insurance - Implementation Guide

## 📋 Overview

**Feature**: Assurance Abonnement (Subscription Insurance)  
**Purpose**: Provide protection against unforeseen circumstances  
**Price**: +6 TND/month (converted from +2€)  
**Complexity**: ⭐⭐⭐⭐

---

## 🎯 Features

### 1. Insurance Types

#### 🏢 Unemployment Insurance (Assurance Chômage)
- **Benefit**: Free subscription pause if job loss
- **Required**: Proof of unemployment (attestation Pôle Emploi)
- **Duration**: Up to 3 months per year
- **Activation**: Within 30 days of job loss

#### 🏥 Medical Insurance (Assurance Maladie)
- **Benefit**: Subscription extension if hospitalized
- **Required**: Medical certificate from hospital
- **Duration**: Matches hospitalization period (max 3 months/year)
- **Activation**: Within 15 days of hospitalization

#### 📚 Student Insurance (Assurance Études)
- **Benefit**: Pause during exam periods
- **Required**: Student card + exam schedule
- **Duration**: Up to 2 months per year
- **Activation**: 7 days before exam period

### 2. General Rules
- **Premium**: 6 TND/month added to subscription
- **Annual Limit**: 3 months total across all insurance types
- **Partial Refund**: 50% of unused premium at year end
- **Proof Required**: All claims need documentation
- **Processing Time**: 2-5 business days

---

## 🗄️ Database Schema

### New Table: `subscription_insurance`

```sql
CREATE TABLE subscription_insurance (
    id_insurance BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_user BIGINT NOT NULL,
    id_abonnement BIGINT NOT NULL,
    insurance_active BOOLEAN DEFAULT TRUE,
    date_souscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP,
    prime_mensuelle DECIMAL(10,2) DEFAULT 6.00,
    mois_utilises INT DEFAULT 0,
    mois_disponibles INT DEFAULT 3,
    remboursement_eligible BOOLEAN DEFAULT FALSE,
    montant_remboursement DECIMAL(10,2) DEFAULT 0.00,
    statut ENUM('Active', 'Suspended', 'Expired') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    FOREIGN KEY (id_abonnement) REFERENCES abonnements(id_abonnement)
);
```

### New Table: `insurance_claims`

```sql
CREATE TABLE insurance_claims (
    id_claim BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_insurance BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    type_assurance ENUM('Chomage', 'Maladie', 'Etudes') NOT NULL,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_debut_pause DATE NOT NULL,
    date_fin_pause DATE NOT NULL,
    duree_jours INT NOT NULL,
    justificatif_url VARCHAR(500),
    justificatif_type VARCHAR(100),
    statut ENUM('Pending', 'Approved', 'Rejected', 'Expired') DEFAULT 'Pending',
    motif_rejet TEXT,
    date_traitement TIMESTAMP,
    traite_par BIGINT,
    notes_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_insurance) REFERENCES subscription_insurance(id_insurance),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

### New Table: `insurance_refunds`

```sql
CREATE TABLE insurance_refunds (
    id_refund BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_insurance BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    annee INT NOT NULL,
    mois_payes INT NOT NULL,
    mois_utilises INT NOT NULL,
    mois_non_utilises INT NOT NULL,
    montant_prime_totale DECIMAL(10,2) NOT NULL,
    montant_remboursement DECIMAL(10,2) NOT NULL,
    pourcentage_remboursement DECIMAL(5,2) DEFAULT 50.00,
    statut ENUM('Pending', 'Processed', 'Paid') DEFAULT 'Pending',
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_paiement TIMESTAMP,
    methode_paiement VARCHAR(50),
    reference_transaction VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_insurance) REFERENCES subscription_insurance(id_insurance),
    FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

---

## 🏗️ Backend Implementation

### 1. Entity Classes

#### SubscriptionInsurance.java
```java
package tn.esprit.abonnement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_insurance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionInsurance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idInsurance;
    
    @Column(nullable = false)
    private Long idUser;
    
    @Column(nullable = false)
    private Long idAbonnement;
    
    @Column(nullable = false)
    private Boolean insuranceActive = true;
    
    @Column(nullable = false)
    private LocalDateTime dateSouscription = LocalDateTime.now();
    
    private LocalDateTime dateExpiration;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal primeMensuelle = new BigDecimal("6.00");
    
    @Column(nullable = false)
    private Integer moisUtilises = 0;
    
    @Column(nullable = false)
    private Integer moisDisponibles = 3;
    
    @Column(nullable = false)
    private Boolean remboursementEligible = false;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal montantRemboursement = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InsuranceStatut statut = InsuranceStatut.Active;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum InsuranceStatut {
        Active, Suspended, Expired
    }
}
```

#### InsuranceClaim.java
```java
package tn.esprit.abonnement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idClaim;
    
    @Column(nullable = false)
    private Long idInsurance;
    
    @Column(nullable = false)
    private Long idUser;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TypeAssurance typeAssurance;
    
    @Column(nullable = false)
    private LocalDateTime dateDemande = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDate dateDebutPause;
    
    @Column(nullable = false)
    private LocalDate dateFinPause;
    
    @Column(nullable = false)
    private Integer dureeJours;
    
    @Column(length = 500)
    private String justificatifUrl;
    
    @Column(length = 100)
    private String justificatifType;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ClaimStatut statut = ClaimStatut.Pending;
    
    @Column(columnDefinition = "TEXT")
    private String motifRejet;
    
    private LocalDateTime dateTraitement;
    
    private Long traiteParAdmin;
    
    @Column(columnDefinition = "TEXT")
    private String notesAdmin;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum TypeAssurance {
        Chomage, Maladie, Etudes
    }
    
    public enum ClaimStatut {
        Pending, Approved, Rejected, Expired
    }
}
```

---

## 🎨 Frontend Implementation

### 1. Insurance Toggle on Pricing Page

Add checkbox to enable insurance on each plan:

```html
<!-- In pricing.html, inside each plan card -->
<div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
  <label class="flex items-center cursor-pointer">
    <input 
      type="checkbox" 
      [(ngModel)]="insuranceEnabled[abonnement.id_abonnement]"
      class="w-4 h-4 text-[rgb(0,200,151)] rounded focus:ring-2 focus:ring-[rgb(0,200,151)]">
    <div class="ml-3 flex-1">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
        <span class="font-semibold text-sm">Subscription Insurance</span>
      </div>
      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
        Protection against job loss, illness, or exams
      </p>
      <p class="text-sm font-semibold text-[rgb(0,200,151)] mt-1">
        +6 TND/month
      </p>
    </div>
  </label>
</div>
```

### 2. Insurance Management Page

Create new page: `frontend/angular-app/src/app/pages/insurance/insurance.ts`

```typescript
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../../services/insurance.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-insurance',
  imports: [CommonModule, FormsModule],
  templateUrl: './insurance.html',
  styleUrl: './insurance.css'
})
export class Insurance implements OnInit {
  private insuranceService = inject(InsuranceService);
  private authService = inject(AuthService);
  
  myInsurance = signal<any>(null);
  claims = signal<any[]>([]);
  loading = signal(true);
  showClaimModal = signal(false);
  
  claimForm = {
    typeAssurance: 'Chomage',
    dateDebutPause: '',
    dateFinPause: '',
    justificatif: null as File | null
  };
  
  ngOnInit() {
    this.loadInsurance();
    this.loadClaims();
  }
  
  loadInsurance() {
    // Load user's insurance details
  }
  
  loadClaims() {
    // Load user's claims history
  }
  
  submitClaim() {
    // Submit new insurance claim
  }
}
```

---

## 📊 Admin Dashboard Features

### 1. Insurance Claims Management

Add new page in back-office: `/insurance-claims`

Features:
- View all pending claims
- Approve/reject claims
- View uploaded documents
- Add admin notes
- Track claim statistics

### 2. Insurance Analytics

Add to dashboard:
- Total active insurances
- Claims this month
- Approval rate
- Refunds pending
- Revenue from insurance premiums

---

## 💰 Pricing Calculation

### With Insurance:
- Basic: 30 TND + 6 TND = **36 TND/month**
- Premium: 90 TND + 6 TND = **96 TND/month**
- Enterprise: 300 TND + 6 TND = **306 TND/month**

### Refund Calculation:
```
Months Paid: 12
Months Used: 2
Months Unused: 10
Premium per Month: 6 TND
Total Paid: 72 TND
Refund (50%): 10 × 6 × 0.5 = 30 TND
```

---

## 🔄 Implementation Steps

### Phase 1: Database (Day 1)
1. Create 3 new tables
2. Add foreign keys
3. Create indexes
4. Test with sample data

### Phase 2: Backend (Days 2-3)
1. Create entity classes
2. Create repositories
3. Create services
4. Create REST controllers
5. Add file upload for documents

### Phase 3: Frontend (Days 4-5)
1. Add insurance toggle to pricing
2. Create insurance management page
3. Create claim submission form
4. Add document upload

### Phase 4: Admin (Days 6-7)
1. Create claims management page
2. Add approval/rejection workflow
3. Add analytics dashboard
4. Create refund processing

### Phase 5: Testing (Day 8)
1. Unit tests
2. Integration tests
3. E2E tests
4. User acceptance testing

---

## 🎯 Success Metrics

- **Adoption Rate**: % of users who add insurance
- **Claim Rate**: % of insured users who file claims
- **Approval Rate**: % of claims approved
- **Refund Rate**: % of users who get refunds
- **Revenue Impact**: Additional revenue from premiums

---

## ⚠️ Important Notes

1. **Legal Compliance**: Ensure compliance with insurance regulations
2. **Document Security**: Encrypt uploaded documents
3. **Privacy**: GDPR compliance for medical documents
4. **Fraud Prevention**: Verify documents authenticity
5. **Customer Support**: Dedicated support for claims

---

**Estimated Development Time**: 8-10 days  
**Complexity**: ⭐⭐⭐⭐  
**Business Impact**: High (new revenue stream + user retention)
