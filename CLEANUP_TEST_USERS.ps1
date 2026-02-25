# Script pour nettoyer les utilisateurs de test dans Keycloak
# Exécuter ce script si vous avez des conflits avec des utilisateurs existants

$KEYCLOAK_URL = "http://localhost:9090"
$REALM = "wordly-realm"
$ADMIN_USER = "admin"
$ADMIN_PASSWORD = "admin"

Write-Host "=== Nettoyage des utilisateurs de test dans Keycloak ===" -ForegroundColor Cyan

# 1. Obtenir le token d'accès admin
Write-Host "`n1. Connexion à Keycloak..." -ForegroundColor Yellow
$tokenResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
        username = $ADMIN_USER
        password = $ADMIN_PASSWORD
        grant_type = "password"
        client_id = "admin-cli"
    }

$ACCESS_TOKEN = $tokenResponse.access_token
Write-Host "✓ Token obtenu" -ForegroundColor Green

# 2. Lister tous les utilisateurs du realm
Write-Host "`n2. Récupération des utilisateurs..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

$users = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users" `
    -Method Get `
    -Headers $headers

Write-Host "✓ Trouvé $($users.Count) utilisateur(s)" -ForegroundColor Green

# 3. Supprimer les utilisateurs de test (username = "string" ou email contenant "test")
$testUsernames = @("string", "test", "testuser", "admin123", "user123")
$deletedCount = 0

foreach ($user in $users) {
    $shouldDelete = $false
    
    # Vérifier si c'est un utilisateur de test
    if ($testUsernames -contains $user.username) {
        $shouldDelete = $true
    }
    elseif ($user.email -match "test|example|temp") {
        $shouldDelete = $true
    }
    
    if ($shouldDelete) {
        Write-Host "`n  Suppression de l'utilisateur: $($user.username) ($($user.email))" -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users/$($user.id)" `
                -Method Delete `
                -Headers $headers
            Write-Host "  ✓ Supprimé" -ForegroundColor Green
            $deletedCount++
        }
        catch {
            Write-Host "  ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Nettoyage terminé ===" -ForegroundColor Cyan
Write-Host "$deletedCount utilisateur(s) supprimé(s)" -ForegroundColor Green
Write-Host "`nVous pouvez maintenant créer de nouveaux utilisateurs sans conflit." -ForegroundColor White
