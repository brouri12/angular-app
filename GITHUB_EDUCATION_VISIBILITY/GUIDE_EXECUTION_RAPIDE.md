# Guide execution rapide

## 1) Pre-requis
- GitHub CLI installe (`gh`)
- Auth active (`gh auth status`)
- Permission de lecture sur l'organisation cible

## 2) Lancer l'audit
Depuis la racine du repo :

```powershell
powershell -ExecutionPolicy Bypass -File ".\GITHUB_EDUCATION_VISIBILITY\AUDIT_GITHUB_ESPRIT.ps1" `
  -Org "NomOrganisation" `
  -PI "PIDEV" `
  -AcademicYear "2026-2027"
```

## 3) Resultats
Le script genere :
- Un fichier CSV detaille
- Un resume Markdown

Dossier de sortie par defaut :

`.\GITHUB_EDUCATION_VISIBILITY\reports`

## 4) Colonnes principales du CSV
- `naming_ok`
- `description_ok`
- `topics_ok`
- `readme_structured_ok`
- `readme_brand_ok`
- `missing_topics`
- `commits_count`
- `stars`
- `forks`
- `score_on_2`

## 5) Action pedagogique suggeree
- Corriger d'abord naming + topics + README
- Relancer l'audit
- Publier un suivi mensuel par PI
