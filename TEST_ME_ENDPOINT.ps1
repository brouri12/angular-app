# Script pour tester l'endpoint /me

Write-Host "Test de l'endpoint /me" -ForegroundColor Cyan
Write-Host ""

# 1. Récupérer le token depuis localStorage
Write-Host "1. Ouvrez la console du navigateur (F12)" -ForegroundColor Yellow
Write-Host "2. Allez dans l'onglet Console" -ForegroundColor Yellow
Write-Host "3. Tapez: localStorage.getItem('access_token')" -ForegroundColor Yellow
Write-Host "4. Copiez le token" -ForegroundColor Yellow
Write-Host ""

# 2. Tester avec PowerShell
Write-Host "Ensuite, testez avec cette commande PowerShell:" -ForegroundColor Yellow
Write-Host ""
Write-Host '$token = "VOTRE_TOKEN_ICI"' -ForegroundColor White
Write-Host '$headers = @{ "Authorization" = "Bearer $token" }' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET -Headers $headers' -ForegroundColor White
Write-Host ""

# 3. Vérifier que UserService est démarré
Write-Host "Vérifiez aussi que UserService est démarré:" -ForegroundColor Yellow
Write-Host "http://localhost:8085/api/auth/info" -ForegroundColor White
Write-Host ""
