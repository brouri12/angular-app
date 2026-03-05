# 🧪 EXAMPLES FOR TESTING - Weighted Sentiment Analysis

---

## 😊 POSITIVE Examples (with Note 5)

| Comment | Note | Expected |
|---------|------|----------|
| "This course was **amazing** and **great**!" | 5 | 😊 |
| "The instructor is **fantastic** and **professional**!" | 5 | 😊 |
| "**Excellent** content, **highly recommend**!" | 5 | 😊 |
| "**Wonderful** learning experience, **well done**!" | 5 | 😊 |
| "The lessons were **helpful** and **useful**!" | 4 | 😊 |
| "**Love** it! **Best** course I've taken!" | 5 | 😊 |
| "**Outstanding** instructor, very **knowledgeable**!" | 5 | 😊 |
| "**Brilliant** course, **thumbs up**!" | 5 | 😊 |
| "Very **useful** and **engaging** content!" | 4 | 😊 |
| "**Perfect** for beginners!" | 5 | 😊 |
| "**Exceptional** teaching, **highly recommend**!" | 5 | 😊 |
| "**Awesome** experience, **world class**!" | 5 | 😊 |

---

## 😊 POSITIVE Examples (with Note 4)

| Comment | Note | Expected |
|---------|------|----------|
| "The course was **good** and **helpful**" | 4 | 😊 |
| "**Nice** content, **clear** explanations" | 4 | 😊 |
| "Very **useful** material" | 4 | 😊 |
| "**Professional** instructor" | 4 | 😊 |
| "**Satisfied** with the course" | 4 | 😊 |

---

## 😞 NEGATIVE Examples (with Note 1-2)

| Comment | Note | Expected |
|---------|------|----------|
| "The content was **terrible** and **boring**" | 1 | 😞 |
| "**Worst** course ever, **waste of time**!" | 1 | 😞 |
| "**Disappointed**, the instructor is **unprofessional**" | 2 | 😞 |
| "**Horrible** experience, **avoid** this course!" | 1 | 😞 |
| "**Useless** content, **confusing** and **messy**" | 1 | 😞 |
| "**Bad** quality, **broken** links everywhere" | 1 | 😞 |
| "**Frustrating** and **annoying**, never again!" | 1 | 😞 |
| "**Poor** content, **slow** lessons" | 2 | 😞 |
| "**Awful** instructor, **incompetent**" | 1 | 😞 |
| "**Disaster**, **nightmare** course!" | 1 | 😞 |
| "**Very bad** experience" | 1 | 😞 |
| "**Worse** than expected" | 1 | 😞 |

---

## 😐 NEUTRAL Examples (with Note 3)

| Comment | Note | Expected |
|---------|------|----------|
| "The course was **okay**, nothing special" | 3 | 😐 |
| "Average content, could be better" | 3 | 😐 |
| "It's fine, not bad but not great either" | 3 | 😐 |
| "Standard course, does the job" | 3 | 😐 |
| "Decent lessons" | 3 | 😐 |
| "Fair enough for the price" | 3 | 😐 |
| "The course is **acceptable** but needs improvement" | 3 | 😐 |
| "Normal content, typical online course" | 3 | 😐 |

---

## 🇫🇷 EXEMPLES FRANÇAIS

### 😊 POSITIF (Note 4-5)

| Commentaire | Note | Emoji |
|------------|------|-------|
| "Ce cours était **excellent** et **super**!" | 5 | 😊 |
| "L'instructeur est **fantastique** et **professionnel**!" | 5 | 😊 |
| "Contenu **magnifique**, je **recommande**!" | 5 | 😊 |
| "Une expérience **merveilleuse**, **bravo**!" | 5 | 😊 |
| "Cours **super** et **bien organisé**" | 4 | 😊 |
| "**Parfait** pour les débutants!" | 5 | 😊 |
| "Contenu **utile** et **clair**" | 4 | 😊 |

### 😞 NÉGATIF (Note 1-2)

| Commentaire | Note | Emoji |
|------------|------|-------|
| "Le contenu était **terrible** et **ennuyeux**" | 1 | 😞 |
| "**Catastrophe**, **nul** ce cours!" | 1 | 😞 |
| "**Déçu**, instructeur **incompétent**" | 2 | 😞 |
| "Expérience **horrible**, **à éviter**!" | 1 | 😞 |
| "Contenu **inutile**, **problèmes** partout" | 1 | 😞 |
| "**Mauvaise** qualité, **bugs** fréquents" | 1 | 😞 |

### 😐 NEUTRE (Note 3)

| Commentaire | Note | Emoji |
|------------|------|-------|
| "Le cours était **correct**, rien de special" | 3 | 😐 |
| "Contenu moyen, pourrait être mieux" | 3 | 😐 |
| "C'est acceptable" | 3 | 😐 |
| "Cours standard" | 3 | 😐 |

---

## ⚠️ Important Notes

### Word Weight System:
- **Weight 3**: amazing, excellent, fantastic, terrible, horrible, worst, disaster, catastrophe, nul
- **Weight 2**: great, good, recommend, bad, disappointed, boring, frustrating, professionnel
- **Weight 1**: nice, poor, avoid, unclear, bon, bien

### Note Impact:
- Note 5 → +3 to positive
- Note 4 → +2 to positive
- Note 3 → 0 (neutral)
- Note 2 → +2 to negative
- Note 1 → +3 to negative

### Decision Logic:
- **Positive - Negative ≥ 2** → 😊
- **Negative - Positive ≥ 2** → 😞
- **Otherwise** → 😐
