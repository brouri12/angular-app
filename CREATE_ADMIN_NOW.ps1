# Script Simple - Créer Compte ADMIN
# Exécutez ce script après avoir démarré UserService

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CREATION COMPTE ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Vérifier UserService
Write-Host "Verification UserService..." -ForegroundColor Yellow
try {
    # Try to connect to UserService (401 is OK, it means service is running)
    $response = Invoke-WebRequest -Uri "http://localhost:8085/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ UserService OK" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        # 401 means service is running but requires auth - that's OK
        Write-Host "✅ UserService OK (running on port 8085)" -ForegroundColor Green
    } else {
        Write-Host "❌ UserService n'est pas accessible" -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUTION:" -ForegroundColor Yellow
        Write-Host "1. Ouvrir IntelliJ IDEA" -ForegroundColor Gray
        Write-Host "2. Ouvrir: UserService/src/main/java/tn/esprit/user/UserApplication.java" -ForegroundColor Gray
        Write-Host "3. Clic droit -> Run 'UserApplication'" -ForegroundColor Gray
        Write-Host "4. Attendre 'Started UserApplication' dans les logs" -ForegroundColor Gray
        Write-Host "5. Relancer ce script" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
}

# Étape 2: Vérifier API Gateway
Write-Host "Verification API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ API Gateway OK" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "✅ API Gateway OK (running on port 8888)" -ForegroundColor Green
    } else {
        Write-Host "❌ API Gateway n'est pas accessible" -ForegroundColor Red
        Write-Host "Demarrez API Gateway dans IntelliJ" -ForegroundColor Yellow
        exit 1
    }
}

# Étape 3: Vérifier Keycloak
Write-Host "Verification Keycloak..." -ForegroundColor Yellow
try {
    $realm = Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Keycloak OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Keycloak n'est pas accessible" -ForegroundColor Red
    Write-Host "Demarrez Keycloak: bin\kc.bat start-dev --http-port=9090" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TOUS LES SERVICES SONT PRETS!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 4: Créer l'utilisateur ADMIN
Write-Host "Creation de l'utilisateur ADMIN..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    username = "admin"
    email = "admin@wordly.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Administrator"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

Write-Host "Donnees de l'utilisateur:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor Gray
Write-Host "  Email: admin@wordly.com" -ForegroundColor Gray
Write-Host "  Password: Admin123!" -ForegroundColor Gray
Write-Host "  Role: ADMIN" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ COMPTE ADMIN CREE AVEC SUCCES!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Identifiants de connexion:" -ForegroundColor Cyan
    Write-Host "  Email: admin@wordly.com" -ForegroundColor White
    Write-Host "  Password: Admin123!" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "ETAPE IMPORTANTE - ASSIGNER LE ROLE" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ouvrir Keycloak: http://localhost:9090" -ForegroundColor Gray
    Write-Host "2. Login: admin / admin" -ForegroundColor Gray
    Write-Host "3. Selectionner realm: wordly-realm" -ForegroundColor Gray
    Write-Host "4. Menu: Users -> Chercher 'admin'" -ForegroundColor Gray
    Write-Host "5. Cliquer sur l'utilisateur" -ForegroundColor Gray
    Write-Host "6. Onglet: Role mapping" -ForegroundColor Gray
    Write-Host "7. Bouton: Assign role" -ForegroundColor Gray
    Write-Host "8. Cocher: ADMIN" -ForegroundColor Gray
    Write-Host "9. Bouton: Assign" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "TESTER LA CONNEXION" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Ouvrir: http://localhost:4200" -ForegroundColor Gray
    Write-Host "2. Cliquer: Sign In" -ForegroundColor Gray
    Write-Host "3. Email: admin@wordly.com" -ForegroundColor Gray
    Write-Host "4. Password: Admin123!" -ForegroundColor Gray
    Write-Host "5. Vous serez redirige vers: http://localhost:4201/dashboard" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ ERREUR LORS DE LA CREATION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Code d'erreur: $statusCode" -ForegroundColor Red
        Write-Host ""
        
        if ($statusCode -eq 500) {
            Write-Host "CAUSE PROBABLE:" -ForegroundColor Yellow
            Write-Host "Le role ADMIN n'existe pas dans Keycloak" -ForegroundColor Gray
            Write-Host ""
            Write-Host "SOLUTION:" -ForegroundColor Yellow
            Write-Host "1. Ouvrir Keycloak: http://localhost:9090" -ForegroundColor Gray
            Write-Host "2. Login: admin / admin" -ForegroundColor Gray
            Write-Host "3. Selectionner realm: wordly-realm" -ForegroundColor Gray
            Write-Host "4. Menu: Realm roles" -ForegroundColor Gray
            Write-Host "5. Bouton: Create role" -ForegroundColor Gray
            Write-Host "6. Role name: ADMIN" -ForegroundColor Gray
            Write-Host "7. Bouton: Save" -ForegroundColor Gray
            Write-Host "8. Relancer ce script" -ForegroundColor Gray
            Write-Host ""
            
        } elseif ($statusCode -eq 409) {
            Write-Host "CAUSE:" -ForegroundColor Yellow
            Write-Host "L'utilisateur existe deja" -ForegroundColor Gray
            Write-Host ""
            Write-Host "SOLUTION:" -ForegroundColor Yellow
            Write-Host "Vous pouvez vous connecter avec:" -ForegroundColor Gray
            Write-Host "  Email: admin@wordly.com" -ForegroundColor White
            Write-Host "  Password: Admin123!" -ForegroundColor White
            Write-Host ""
            Write-Host "Ou supprimer l'utilisateur dans Keycloak et relancer" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
    Write-Host "Message d'erreur:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
