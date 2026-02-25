# Script Simple - Créer Compte ADMIN (Sans vérifications)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CREATION COMPTE ADMIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Assurez-vous que ces services sont demarres:" -ForegroundColor Yellow
Write-Host "  - UserService (port 8085)" -ForegroundColor Gray
Write-Host "  - API Gateway (port 8888)" -ForegroundColor Gray
Write-Host "  - Keycloak (port 9090)" -ForegroundColor Gray
Write-Host ""

$continue = Read-Host "Les services sont-ils demarres? (O/N)"
if ($continue -ne "O" -and $continue -ne "o") {
    Write-Host "Operation annulee" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
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
            Write-Host "N'oubliez pas d'assigner le role ADMIN dans Keycloak!" -ForegroundColor Yellow
            Write-Host ""
        } elseif ($statusCode -eq 404) {
            Write-Host "CAUSE:" -ForegroundColor Yellow
            Write-Host "L'API n'est pas accessible" -ForegroundColor Gray
            Write-Host ""
            Write-Host "VERIFICATIONS:" -ForegroundColor Yellow
            Write-Host "1. UserService est-il demarre? (port 8085)" -ForegroundColor Gray
            Write-Host "2. API Gateway est-il demarre? (port 8888)" -ForegroundColor Gray
            Write-Host "3. Eureka est-il demarre? (port 8761)" -ForegroundColor Gray
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
