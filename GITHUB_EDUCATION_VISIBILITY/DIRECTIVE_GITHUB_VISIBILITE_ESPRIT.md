# Directive institutionnelle GitHub

## Amelioration de la visibilite d'Esprit via GitHub et GitHub Education

## 1. Contexte et objectifs
Dans le cadre de la strategie de visibilite academique et digitale, cette directive vise a :

- Structurer la publication des projets etudiants sur GitHub
- Renforcer le referencement institutionnel d'Esprit School of Engineering
- Standardiser les pratiques de publication
- Mettre en place un pilotage base sur des indicateurs mesurables

GitHub est un levier pedagogique, d'employabilite et de rayonnement institutionnel.

## 2. Standardisation obligatoire

### 2.1 Convention de nommage des depots
Format obligatoire :

`Esprit-[PI]-[Classe]-[AU]-[NomDuProjet]`

Exemple :

`Esprit-PIDEV-4sae6-2026-learning`

### 2.2 Description du depot public
Chaque depot public doit inclure :

- `Developed at Esprit School of Engineering - Tunisia`
- Annee universitaire
- Technologies principales

Exemple :

`This project was developed as part of the PIDEV - 4th Year Engineering Program at Esprit School of Engineering (Academic Year 2026-2027).`

### 2.3 Topics GitHub obligatoires
Minimum requis :

- `esprit-school-of-engineering`
- `academic-project`
- `esprit-[pi]` (minuscule)
- `[annee-universitaire]` (ex: `2026-2027`)
- `[technologie-principale]` (ex: `spring-boot`, `angular`, `react`)

## 3. Structure minimale du README
Structure obligatoire :

```md
# Project Title
## Overview
## Features
## Tech Stack
### Frontend
### Backend
## Architecture
## Contributors
## Academic Context
## Getting Started
## Acknowledgments
```

Exigence branding :

- Le README doit contenir explicitement la chaine `Esprit School of Engineering`

## 4. Hebergement et deploiement (recommande)
Options recommandees :

- GitHub Pages
- Vercel
- Render
- Railway
- DigitalOcean (via GitHub Education)

## 5. Pilotage et indicateurs (Analytics)

### 5.1 Indicateurs de production
- Nombre total de depots publics
- Nombre moyen de commits par projet

### 5.2 Indicateurs de qualite
- Pourcentage de depots avec README conforme
- Pourcentage de depots avec topics conformes
- Pourcentage de depots avec naming conforme

### 5.3 Indicateurs d'impact
- Nombre total de stars
- Nombre total de forks
- Nombre total de clones (si droits API disponibles)

## 6. Suivi operationnel
Chaque responsable PI et tuteur doit verifier :

- Conformite du naming
- Presence et conformite des topics
- Structure README
- Visibilite publique du depot

## 7. Evaluation academique (bareme)
| Critere | Points |
|---|---:|
| Convention de nommage | 0.5 |
| Description du projet | 0.5 |
| Topics conformes | 0.5 |
| Mots-cles README | 0.25 (ou 0.5 si pas hebergement) |
| Hebergement (facultatif) | 0.25 |

## 8. Reporting annuel
Un rapport annuel doit inclure :

- Volume de production academique GitHub
- Croissance annuelle
- Technologies dominantes
- Projets a fort impact
