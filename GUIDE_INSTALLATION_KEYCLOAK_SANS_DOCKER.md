# Guide d'installation de Keycloak sans Docker

## Problème
Docker n'est pas disponible sur votre machine Windows. Voici les alternatives :

---

## OPTION 1 : Télécharger Keycloak directement (RECOMMANDÉE)

### Étape 1 : Télécharger Keycloak
1. Allez sur : https://github.com/keycloak/keycloak/releases/tag/23.0.7
2. Téléchargez `keycloak-23.0.7.zip`

### Étape 2 : Extraire le fichier
```
- Faire un clic droit sur keycloak-23.0.7.zip
- "Extraire tout..."
- Choisir un dossier (ex: C:\keycloak)
```

### Étape 3 : Démarrer Keycloak
1. Ouvrir un terminal (cmd)
2. Aller dans le dossier keycloak :
```cmd
cd C:\keycloak\keycloak-23.0.7
```

3. Démarrer en mode développement :
```cmd
bin\kc.bat start-dev --http-port=8180
```

### Étape 4 : Configurer l'admin
- Attendre que Keycloak démarre
- Ouvrir : http://localhost:8180
- Cliquer sur "Administration Console"
- Créer un admin : **admin** / **admin123**

---

## OPTION 2 : Via winget (si disponible)

```cmd
winget install Keycloak.Keycloak
```

---

## CONFIGURATION DE KEYCLOAK (après démarrage)

### 1. Créer le Realm
1. Dans le menu déroulant en haut à gauche (Master)
2. Cliquer sur "Create realm"
3. Nom : `gestions-ramzi`
4. Cliquer "Create"

### 2. Créer les Rôles
1. Dans le menu de gauche : **Realm roles**
2. Cliquer "Create"
3. Créer ces rôles un par un :
   - `ADMIN`
   - `ENSEIGNANT`
   - `ETUDIANT`

### 3. Créer le Client
1. Dans le menu de gauche : **Clients**
2. Cliquer "Create"
3. Remplir :
   - **Client ID** : `frontend-app`
   - **Client Protocol** : `openid-connect`
4. Cliquer "Next"
5. Configurer :
   - **Access Type** : `public`
   - **Valid Redirect URIs** : `http://localhost:4200/*`
   - **Web Origins** : `http://localhost:4200`
6. Cliquer "Save"

### 4. Configurer les rôles du client
1. Dans le client `frontend-app`, aller dans l'onglet **Role notes**
2. Cliquer "Add role"
3. Ajouter : `ADMIN`, `ENSEIGNANT`, `ETUDIANT`

### 5. Créer un Utilisateur
1. Dans le menu de gauche : **Users**
2. Cliquer "Add user"
3. Remplir :
   - **Username** : `admin`
   - **Email** : `admin@test.com`
   - **First Name** : `Admin`
   - **Last Name** : `User`
   - **Email verified** : ON
4. Cliquer "Create"

### 6. Définir le mot de passe
1. Dans l'onglet **Credentials** du nouvel utilisateur
2. Mot de passe : `admin123`
3. **Temporary** : OFF (désactiver)
4. Cliquer "Set Password"

### 7. Assigner les rôles
1. Dans l'onglet **Role mapping** de l'utilisateur
2. Cliquer "Assign role"
3. Sélectionner `ADMIN` et cliquer "Assign"

---

## VÉRIFICATION

Après configuration, vous devriez avoir :
- Keycloak sur : http://localhost:8180
- Realm : `gestions-ramzi`
- Client : `frontend-app`
- Utilisateur : `admin` / `admin123`

Le issuer pour votre application sera :
```
http://localhost:8180/realms/gestions-ramzi
```

---

## COMMANDES UTILES

### Démarrer Keycloak
```cmd
cd C:\keycloak\keycloak-23.0.7
bin\kc.bat start-dev --http-port=8180
```

### Arrêter Keycloak
```
Ctrl+C dans le terminal
```

---

## SI VOUS AVEZ DES PROBLÈMES

### Port déjà utilisé
Si le port 8180 est utilisé, utilisez un autre :
```cmd
bin\kc.bat start-dev --http-port=8181
```
Et mettez à jour vos fichiers de config.

### Java non trouvé
Assurez-vous que Java JDK 17+ est installé :
```cmd
java -version
```

