# TODO.md - Fix My Recordings Collections ✅ APPROUVÉ

**Statut** : 0/7 ⏳ | **Objectif** : Collections filtrantes + counts >0

## 📋 **Checklist Étapes (Breakdown PLAN_DE_FIX)**

### **PHASE 1 : Préparation (1/1)**
- [x] PLAN_DE_FIX.md créé ✅

### **PHASE 2 : Compréhension Code (2/2)**\n- [x] ✅ Lire `myRecordings.component.ts` complet\n- [x] ✅ Vérifier `auth.service.ts` : **PAS de userId signal** (seulement username/roles)\n\n**Décision** : userId reste **hardcodé=1** pour test-student (safe pour démo)

- [x] **2. Fix loadRecordings()** : ✅ `collection param` passé API (?collection=PERFECT)\n  - `null` si 'ALL', cast `CollectionType` TS

### **PHASE 3 : Implémentation (3/4)**\n- [x] **1. userId** : Hardcodé=1 safe ✅\n- [x] **2. Fix loadRecordings()** : API ?collection=PERFECT ✅\n- [x] **3+4. computeCollectionCounts()** : Client-side + updateCollectionCounts() ✅\n\n### **PHASE 4 : Tests (0/2)**\n- [ ] **Tests unitaires** : `ng test MyRecordingsComponent`\n- [ ] **Tests manuels** : Login → Perfect filtré + \"Perfect 1\" counts

### **PHASE 5 : Validation (0/1)**
- [ ] **ng serve** → http://localhost:4200/student/my-recordings → PERFECT filtré + counts>0

**✅ Backend fixé** : EXCELLENT=80-89.99, GOOD=70-79.99, STREAK_MASTER ajouté\n\n**PHASE 4 Tests** : `ng serve` → Vérif Excellent=0 (correct), Good=79% seulement
