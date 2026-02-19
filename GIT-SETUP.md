# Configuration Git et GitHub

## 1. Créer le dépôt Git (si pas déjà fait)

À la racine du projet (dossier `pi` ou `pi06`) :

```bash
git init
```

## 2. Fichier .gitignore

Un fichier `.gitignore` est déjà présent à la racine de `pi`. Il exclut notamment :

- `node_modules/`
- `uploads/`
- `.env`
- `target/` (Maven)
- Fichiers IDE (`.idea/`, `.vscode/`)

## 3. Branches par personne

Chaque membre du groupe travaille sur **sa propre branche** :

```bash
# Créer et passer sur sa branche (remplacer NOM par son prénom ou identifiant)
git checkout -b branche-NOM

# Travailler, puis committer
git add .
git commit -m "Description des changements"

# Pousser sa branche sur GitHub
git push -u origin branche-NOM
```

## 4. Lier le projet à GitHub

1. Créer un nouveau dépôt sur GitHub (sans initialiser avec un README si le projet existe déjà).
2. Ajouter le remote :

```bash
git remote add origin https://github.com/VOTRE_ORGA_OU_USER/NOM_DU_REPO.git
```

3. Premier push (après au moins un commit) :

```bash
git push -u origin main
# ou, si vous travaillez sur une branche :
git push -u origin branche-NOM
```

## 5. Pusher régulièrement

- Faire des commits courts et fréquents.
- Pusher au moins en fin de séance : `git push`.
- Éviter de tout faire sur `main` : utiliser des branches (feature/correction) puis fusionner après revue si besoin.

## 6. Récapitulatif des commandes utiles

| Action | Commande |
|--------|----------|
| Voir les branches | `git branch -a` |
| Changer de branche | `git checkout nom-branche` |
| Statut | `git status` |
| Ajouter tous les fichiers modifiés | `git add .` |
| Committer | `git commit -m "Message"` |
| Pousser | `git push` |
| Récupérer les dernières modifs du remote | `git pull` |
