# Intégration des branches équipe — `angular-app` (brouri12)

Dépôt : [github.com/brouri12/angular-app](https://github.com/brouri12/angular-app)

## 1. Carte des branches (état constaté)

| Branche   | Lien avec `main` / `rahali` |
|-----------|-----------------------------|
| **rahma** | Même historique que `main` → fusion **possible** (conflits à résoudre à la main). |
| **jasser11** | Même historique → **déjà fusionnée localement** dans le clone `angular-app-integration` (commit `6456c02`). |
| **mahdi** | **Aucun ancêtre commun** avec `main` / `rahali` → dépôt ou fork parallèle (fonctionnalités type club/member). |
| **RamziiJ** | **Aucun ancêtre commun** avec `main` / `rahali` → même situation que `mahdi`. |

Les branches **sans ancêtre commun** ne peuvent pas être fusionnées proprement avec un simple `git merge` : Git affiche *unrelated histories*. Il faudrait soit:

- **`git merge <branche> --allow-unrelated-histories`** puis résoudre **beaucoup** de conflits, soit  
- **Copier manuellement** les dossiers / commits utiles (cherry-pick ciblé ou copie de fichiers) vers `rahali`.

## 2. Ordre recommandé (organisé)

1. **`rahali`** comme branche d’intégration (la vôtre, avec Keycloak + tests Karma + QuizBadge).
2. **`jasser11`** — apporte notamment *my-groups*, *PlanificationService*, back-office planif / salles / analytics. - Règle d’or : **garder l’auth Keycloak** de `rahali`, prendre les **nouvelles pages / services** de `jasser11`.
3. **`rahma`** — fusionner **après** `jasser11`, puis ouvrir les conflits dans l’IDE (Angular : `app.routes`, `header`, `home`, `angular.json`, etc.).
4. **`mahdi`** et **`RamziiJ`** — traiter **en dernier**, en équipe : décider quelles fonctionnalités importer et éviter d’écraser l’auth / la gateway déjà validées.

## 3. Clone local déjà préparé

Sur la machine de développement :

- Dossier : `C:\Users\Rahali\Desktop\pi06\angular-app-integration`
- Branche : `rahali`
- Dernier merge intégré : **`jasser11`** avec résolution manuelle :
  - `auth.service` (front + back-office) : flux **Keycloak** conservé (branche `rahali`).
  - `auth-modal` : redirection par **rôle** (ADMIN / TEACHER / STUDENT) + route **`/my-groups`** (apport `jasser11`).
  - `app.routes.ts` : `Register`, `Login`, `MyGroups` combinés.

Pour publier sur GitHub :

```powershell
cd C:\Users\Rahali\Desktop\pi06\angular-app-integration
git push origin rahali
```

(Connexion GitHub / token requis.)

## 4. Fusionner `rahma` (conflits attendus)

```powershell
git fetch origin
git checkout rahali
git merge origin/rahma -m "merge: rahma"
```

Ensuite : résoudre chaque fichier marqué *conflicted* dans Cursor / VS Code, puis :

```powershell
git add -A
git commit --no-edit
```

## 5. Branches `mahdi` / `RamziiJ` (historiques indépendants)

Exemple si vous acceptez une fusion « lourde » :

```powershell
git merge origin/mahdi --allow-unrelated-histories```

Puis résolution **fichier par fichier**. Alternative plus sûre : ouvrir `mahdi` dans un second clone, identifier les **commits ou dossiers** à réutiliser, et les **copier** ou **cherry-pick** un par un sur `rahali`.

## 6. Après chaque fusion

- Front : `npm ci` puis `npm run test:ci` dans `frontend/angular-app` et `back-office`.
- Vérifier login Keycloak, navigation ADMIN / TEACHER / étudiant (`/my-groups`).

---

*Document généré pour structurer l’intégration multi-branches ; adapter les chemins si le clone est ailleurs.*
