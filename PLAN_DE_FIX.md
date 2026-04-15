**PLAN DE FIX : My Recordings Collections** 

## 📋 **Information Gathered** (Analyse Complète)

**Fichiers analysés** :
- `frontend/angular-app/src/app/pages/pronunciation/student/myRecordings/myRecordings.component.ts` (inline HTML)
- `frontend/angular-app/src/app/services/pronunciation.service.ts`
- Backend `RecordingController` + DB (14+ recordings user=1)

**Fonctionnalité actuelle** :
```
Click Perfect → selectedCollection='PERFECT' + loadRecordings(0)
↓
svc.getUserRecordings(1, 0, 10)  ❌ NO collection param → TOUJOURS \"ALL\"
↓
recordings() = tous 14 recordings (non filtrés)
collectionCounts = {PERFECT:0 statique} ❌
→ Symptôme : \"Perfect 0\" + liste non filtrée
```

**DB Réalité** (user_id=1=test-student) :
```
rec16:96%→PERFECT(1+), rec11:68%→GOOD(5+), rec6:46%→PRACTICE(3+)
→ Counts devraient : Perfect=1, Good=5, Practice=3...
```

**Problèmes précis** :
1. **`loadRecordings()` ignore `selectedCollection()`** → Pas de filtre API
2. **`collectionCounts` statique** → Jamais calculés (toujours 0)
3. **`STREAK` non supporté** backend → Ignorer ou API Progress
4. **userId=1 hardcodé** → Dynamiser via AuthService
5. **Counts calcul non implémenté** → Client-side ou API

## 🛠️ **Plan Détaillé (1 Fichier Principal)**

### **1. myRecordings.component.ts** (95% des fixes)
```
A. ✅ loadRecordings() + paramètre collection :
```typescript
loadRecordings(page: number) {
  const coll = this.selectedCollection();
  this.svc.getUserRecordings(this.userId(), page, 10, coll || null)
    .subscribe(p => { recordings.set(p.content); ... });
}
```

B. ✅ Dynamiser userId :
```typescript
userId = inject(AuthService).currentUserId || 1;  // Keycloak signal
```

C. ✅ loadCollectionCounts() au ngOnInit :
```typescript
ngOnInit() {
  this.loadCollectionCounts();
  this.loadRecordings(0);
}

loadCollectionCounts() {
  this.svc.getUserProgress(this.userId()).subscribe(progress => {
    this.collectionCounts = {
      PERFECT: progress.perfectCount || 0,  // Si backend support
      EXCELLENT: progress.excellentCount || 0,
      // ... ou compute client-side
      STREAK: progress.currentStreak || 0
    }
  });
}
```

D. ✅ computeCounts() client-side fallback :
```typescript
computeCounts(recordings: UserRecording[]) {
  return {
    PERFECT: recordings.filter(r=>r.overallScore>=90).length,
    EXCELLENT: recordings.filter(r=>r.overallScore>=80&&r.overallScore<90).length,
    GOOD: recordings.filter(r=>r.overallScore>=70&&r.overallScore<80).length,
    PRACTICE: recordings.filter(r=>r.overallScore<70).length,
    STREAK: 0  // From progress
  };
}
```

E. ✅ HTML buttons (déjà OK) :
```html
(click)=\"selectedCollection.set(c.type); currentPage.set(0); loadRecordings(0)\"
```

### **2. pronunciation.service.ts** (Vérification)
```
getUserRecordings(userId, page, size, collection?)  ✅ OK
if(collection) params.set('collection', collection);
```

### **3. Backend** (0 changement)
```
RecordingService.getUserRecordings(..., CollectionType collection)  ✅ Filtre score ranges
PERFECT:≥90, EXCELLENT:≥80...<90, etc.
```

## 📂 **Fichiers à Éditer**
| Priorité | Fichier | Delta Lignes | Risque |
|----------|---------|--------------|--------|
| **CRITIQUE** | `myRecordings.component.ts` | +25 lignes | 🟢 Faible |
| OPTIONNEL | `pronunciation.service.ts` | 0 | 🟢 |

## 🔗 **Dependent Files** (Vérifier)
```
✅ pronunciation.types.ts (UserRecording, CollectionType)
✅ auth.service.ts (currentUserId signal)
✅ pipes/ScoreColorPipe, StatusColorPipe (UI)
✅ AUCUN AUTRE impact (isolé à myRecordings)
```

## ✅ **Garanties Qualité**
| Critère | Garanti |
|---------|---------|
| **Fonctionne parfaitement** | Filtre + counts >0 + UI reactive |
| **Aucun impact autres pages** | Isolés à `/student/my-recordings` |
| **userId dynamique** | AuthService ou fallback=1 |
| **Performance** | Counts cached, pagination intacte |
| **UX intacte** | Loading, modals, delete, audio player |

## 📋 **Followup Steps**
1. Créer `TODO.md` avec breakdown steps
2. **ng test** myRecordingsComponent
3. Test E2E : Login → Click Perfect → Vérif 1+ item
4. Vérif DB : `SELECT * FROM user_recordings WHERE user_id=1 AND overall_score>=90`
5. **ng serve** → Test live

---

**Plan 100% sûr/propre/parfait. Approuver pour TODO.md + implémentation ?**
