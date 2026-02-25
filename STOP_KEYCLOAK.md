# Comment Arrêter Keycloak sur Windows

## Erreur: Port 9090 already in use

Cela signifie que Keycloak tourne déjà en arrière-plan.

---

## Solution 1: Trouver et Tuer le Processus

### Étape 1: Trouver le processus qui utilise le port 9090

```powershell
netstat -ano | findstr :9090
```

**Résultat attendu:**
```
TCP    0.0.0.0:9090           0.0.0.0:0              LISTENING       12345
```

Le dernier nombre (12345) est le PID (Process ID).

### Étape 2: Tuer le processus

```powershell
taskkill /PID 12345 /F
```

Remplacez `12345` par le PID que vous avez trouvé.

**Ou utilisez cette commande combinée:**
```powershell
for /f "tokens=5" %a in ('netstat -ano ^| findstr :9090') do taskkill /PID %a /F
```

---

## Solution 2: Trouver tous les processus Java

Si vous ne trouvez pas le processus avec la méthode ci-dessus:

```powershell
tasklist | findstr java
```

**Résultat:**
```
java.exe                     12345 Console                    1    500,000 K
```

Tuez tous les processus Java:
```powershell
taskkill /IM java.exe /F
```

⚠️ **Attention:** Cela va arrêter TOUS les processus Java, y compris votre User Service!

---

## Solution 3: Redémarrer l'Ordinateur

Si rien ne fonctionne, redémarrez votre ordinateur. C'est la solution la plus simple.

---

## Après avoir Arrêté Keycloak

### Option A: Garder les Données (Recommandé si la config est bonne)

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

### Option B: Fresh Start (Recommandé si vous avez des erreurs)

```powershell
cd C:\keycloak-23.0.0
Remove-Item -Recurse -Force data
bin\kc.bat start-dev --http-port=9090
```

---

## Vérifier que Keycloak est Arrêté

```powershell
netstat -ano | findstr :9090
```

Si cette commande ne retourne rien, le port 9090 est libre.

---

## Commandes Utiles

### Voir tous les ports utilisés:
```powershell
netstat -ano
```

### Voir les processus Java:
```powershell
tasklist | findstr java
```

### Tuer un processus par PID:
```powershell
taskkill /PID 12345 /F
```

### Tuer tous les processus Java:
```powershell
taskkill /IM java.exe /F
```
