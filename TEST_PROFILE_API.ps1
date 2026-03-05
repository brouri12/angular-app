# Test Profile API with real token
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST PROFILE API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nPour obtenir votre token:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous sur http://localhost:4200" -ForegroundColor Yellow
Write-Host "2. Ouvrez la console (F12)" -ForegroundColor Yellow
Write-Host "3. Tapez: localStorage.getItem('access_token')" -ForegroundColor Yellow
Write-Host "4. Copiez le token" -ForegroundColor Yellow

Write-Host "`nEntrez votre token:" -ForegroundColor Yellow
$token = Read-Host

if (!$token -or $token.Trim() -eq "") {
    Write-Host "`n✗ Aucun token fourni" -ForegroundColor Red
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: Direct UserService - /api/auth/me" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET -Headers $headers
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "`nUser Data:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "✗ ERREUR:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: Via Gateway - /user-service/api/auth/me" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET -Headers $headers
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "`nUser Data:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Field Analysis:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "username: $($response.username)" -ForegroundColor White
    Write-Host "email: $($response.email)" -ForegroundColor White
    Write-Host "role: $($response.role)" -ForegroundColor White
    Write-Host "nom: $($response.nom)" -ForegroundColor White
    Write-Host "prenom: $($response.prenom)" -ForegroundColor White
    Write-Host "telephone: $($response.telephone)" -ForegroundColor White
    Write-Host "date_naissance: $($response.date_naissance)" -ForegroundColor White
    Write-Host "niveau_actuel: $($response.niveau_actuel)" -ForegroundColor White
    Write-Host "statut_etudiant: $($response.statut_etudiant)" -ForegroundColor White
    
} catch {
    Write-Host "✗ ERREUR:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIN DU TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
