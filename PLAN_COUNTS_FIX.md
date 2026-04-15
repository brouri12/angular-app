# PLAN COUNTS GLOBAUX ✅

## **PROBLÈME** 
`updateCollectionCounts()` compte **page courante** (10 max) → **faux counts**

**Données utilisateur** (10 recs visibles) :
| Score | Nombre | Collection |
|-------|--------|------------|
| 99%   | 1      | Perfect    |
| 90%   | 1      | Perfect    |
| 89%   | 1      | Excellent  |
| 79%   | 1      | Good       |
| 76%   | 1      | Good       |
| <70%  | 5      | Practice   |
**Total attendu** : Perfect=2, Excellent=1, Good=2, Practice=5

## **SOLUTION** Backend Counts API

### **1. Backend** (RecordingController)
```java
@GetMapping("/user/{userId}/counts")
public Map<String, Long> getCollectionCounts(@PathVariable Long userId) {
  return recordingService.getCollectionCounts(userId);
}
```

### **2. Backend** (RecordingService)
```java
public Map<String, Long> getCollectionCounts(Long userId) {
  return Map.of(
    "PERFECT", recordingRepository.countByUserIdAndScoreRange(userId, 90, 100),
    "EXCELLENT", recordingRepository.countByUserIdAndScoreRange(userId, 80, 90),
    "GOOD", recordingRepository.countByUserIdAndScoreRange(userId, 70, 80),
    "PRACTICE", recordingRepository.countByUserIdAndScoreRange(userId, 0, 70),
    "STREAK", recordingRepository.countByUserIdAndScoreRange(userId, 99, 100)
  );
}
```

### **3. Frontend** (myRecordings)
```typescript
ngOnInit() {
  this.svc.getCollectionCounts(this.userId).subscribe(counts => {
    this.collectionCounts = counts;  
  });
  this.loadRecordings(0);
}
```

**loadRecordings()** → **ignore `updateCollectionCounts()`** (garde backend)

## **Étapes** 
1. Backend Repository : `countByUserIdAndScoreRange`
2. Service : `getCollectionCounts()`
3. Controller : `/counts` endpoint
4. Frontend : Fetch counts au start

**Résultat** : All 10, Perfect 2, Excellent 1, Good 2, Practice 5, Streak 1 ✅

