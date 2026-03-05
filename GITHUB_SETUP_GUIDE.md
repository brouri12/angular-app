# Guide de Configuration GitHub - Esprit

Ce guide vous aide à configurer votre dépôt GitHub selon les directives d'Esprit School of Engineering.

## 📋 Checklist Complète

- [ ] Renommer le dépôt
- [ ] Ajouter la description
- [ ] Ajouter les topics
- [ ] Mettre à jour le README.md
- [ ] Vérifier la mention "Esprit School of Engineering"
- [ ] (Optionnel) Ajouter le lien d'hébergement

## 1️⃣ Renommer le Dépôt

### Format Requis
```
Esprit-[PI]-[Classe]-[AU]-[NomDuProjet]
```

### Exemple pour ce projet
```
Esprit-PIDEV-3A-2026-Wordly-ELearning
```

### Comment Renommer

1. Allez sur votre dépôt GitHub
2. Cliquez sur **Settings** (en haut à droite)
3. Dans la section **Repository name**, changez le nom
4. Cliquez sur **Rename**

⚠️ **Important**: Après le renommage, mettez à jour votre remote local:

```bash
git remote set-url origin https://github.com/your-username/Esprit-PIDEV-3A-2026-Wordly-ELearning.git
```

## 2️⃣ Ajouter la Description

### Texte à Ajouter

```
Developed at Esprit School of Engineering – Tunisia | Academic Year: 2025–2026 | Technologies: Angular, Spring Boot, MySQL, Keycloak, Stripe
```

### Comment Ajouter

1. Sur la page principale du dépôt
2. Cliquez sur l'icône ⚙️ (Settings) à côté de "About"
3. Dans le champ **Description**, collez le texte ci-dessus
4. Cliquez sur **Save changes**

## 3️⃣ Ajouter les Topics

### Topics Requis

```
esprit-school-of-engineering
academic-project
esprit-pidev
2025-2026
angular
spring-boot
microservices
e-learning
mysql
keycloak
stripe
```

### Comment Ajouter

1. Sur la page principale du dépôt
2. Cliquez sur l'icône ⚙️ (Settings) à côté de "About"
3. Dans la section **Topics**, ajoutez chaque topic un par un
4. Appuyez sur **Enter** après chaque topic
5. Cliquez sur **Save changes**

## 4️⃣ README.md

✅ **Déjà fait!** Le fichier `README.md` a été créé avec:

- ✅ Nom du projet
- ✅ Badges Esprit
- ✅ Description complète
- ✅ Liste des fonctionnalités
- ✅ Tech Stack détaillé
- ✅ Architecture avec diagramme
- ✅ Instructions d'installation
- ✅ Section "Academic Context" avec mention **Esprit School of Engineering** en gras
- ✅ Contributors
- ✅ Acknowledgments

### Vérification

Ouvrez `README.md` et vérifiez que:
- [x] "Esprit School of Engineering" apparaît en gras
- [x] L'année académique 2025-2026 est mentionnée
- [x] Le type de projet (PIDEV) est indiqué
- [x] La classe (3A) est mentionnée

## 5️⃣ Hébergement (Optionnel)

### Options d'Hébergement

#### Frontend (Angular)
- **Vercel** (Recommandé)
  ```bash
  npm install -g vercel
  cd frontend/angular-app
  vercel
  ```

- **Netlify**
  ```bash
  npm install -g netlify-cli
  cd frontend/angular-app
  npm run build
  netlify deploy --prod --dir=dist
  ```

- **GitHub Pages**
  ```bash
  cd frontend/angular-app
  npm run build -- --base-href=/repository-name/
  npx angular-cli-ghpages --dir=dist/angular-app
  ```

#### Backend (Spring Boot)
- **Heroku**
- **Railway**
- **Render**
- **AWS EC2**

### Ajouter le Lien d'Hébergement

Une fois déployé, ajoutez le lien:

1. **Dans la description GitHub**:
   ```
   🌐 Live Demo: https://your-app.vercel.app
   ```

2. **Dans le README.md**:
   Ajoutez une section après "Overview":
   ```markdown
   ## 🌐 Live Demo
   
   - **User Frontend**: https://wordly-frontend.vercel.app
   - **Admin Panel**: https://wordly-admin.vercel.app
   ```

## 6️⃣ Pousser les Changements

```bash
# Ajouter le README.md
git add README.md

# Commit
git commit -m "docs: Add Esprit-compliant README with project documentation"

# Push
git push origin main
```

## 7️⃣ Vérification Finale

### Checklist de Vérification

Visitez votre dépôt GitHub et vérifiez:

- [ ] **Nom du dépôt**: Format `Esprit-PIDEV-3A-2026-NomDuProjet`
- [ ] **Description**: Contient "Esprit School of Engineering" et l'année
- [ ] **Topics**: Au moins 5 topics incluant `esprit-school-of-engineering`
- [ ] **README.md**: 
  - [ ] Badges Esprit visibles
  - [ ] Section "Academic Context" présente
  - [ ] "Esprit School of Engineering" en gras
  - [ ] Architecture claire
  - [ ] Instructions d'installation complètes
- [ ] **About section**: Description et topics visibles
- [ ] **(Optionnel) Live Demo**: Lien fonctionnel

## 📸 Captures d'Écran Attendues

### Page Principale du Dépôt

```
┌─────────────────────────────────────────────────────────┐
│ Esprit-PIDEV-3A-2026-Wordly-ELearning                  │
│ Public                                                   │
│                                                         │
│ Developed at Esprit School of Engineering – Tunisia    │
│ Academic Year: 2025–2026                               │
│                                                         │
│ Topics: esprit-school-of-engineering academic-project  │
│         esprit-pidev 2025-2026 angular spring-boot     │
└─────────────────────────────────────────────────────────┘
```

### README.md

```markdown
# Wordly - E-Learning Platform

[![Esprit](https://img.shields.io/badge/Esprit-School%20of%20Engineering-red)]
[![Academic Year](https://img.shields.io/badge/Academic%20Year-2025--2026-blue)]

## Overview
...

## Academic Context

**Developed at Esprit School of Engineering - Tunisia**

- **Project Type**: PIDEV
- **Class**: 3A
- **Academic Year**: 2025–2026
...
```

## 🆘 Aide et Support

### Problèmes Courants

**Q: Le renommage du dépôt casse mes liens locaux**
```bash
# Solution: Mettre à jour le remote
git remote set-url origin https://github.com/username/new-repo-name.git
git remote -v  # Vérifier
```

**Q: Les topics ne s'affichent pas**
- Vérifiez que vous avez cliqué sur "Save changes"
- Rafraîchissez la page
- Les topics peuvent prendre quelques secondes à apparaître

**Q: Le README ne s'affiche pas correctement**
- Vérifiez la syntaxe Markdown
- Assurez-vous que le fichier s'appelle exactement `README.md`
- Vérifiez qu'il est à la racine du projet

## 📚 Ressources

- [GitHub Docs - Renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [GitHub Docs - About topics](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [Markdown Guide](https://www.markdownguide.org/)

## ✅ Validation Finale

Une fois tout configuré, votre dépôt devrait:

1. ✅ Avoir un nom conforme aux directives Esprit
2. ✅ Afficher clairement l'affiliation à Esprit
3. ✅ Être facilement identifiable comme projet académique
4. ✅ Contenir une documentation complète et professionnelle
5. ✅ Être prêt pour l'évaluation

---

**Bon courage pour votre projet PIDEV! 🎓**

*Esprit School of Engineering - Tunisia*
