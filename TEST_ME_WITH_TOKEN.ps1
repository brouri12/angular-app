# Test de l'endpoint /me avec le token

Write-Host "Test de l'endpoint /me avec authentification" -ForegroundColor Cyan
Write-Host ""

# Remplacez par votre token depuis localStorage.getItem('access_token')
$token = "COLLEZ_VOTRE_TOKEN_ICI"

if ($token -eq "COLLEZ_VOTRE_TOKEN_ICI") {
    Write-Host "ERREUR: Vous devez remplacer le token!" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Ouvrez la console du navigateur (F12)" -ForegroundColor Yellow
    Write-Host "2. Tapez: localStorage.getItem('access_token')" -ForegroundColor Yellow
    Write-Host "3. Copiez le token (sans les guillemets)" -ForegroundColor Yellow
    Write-Host "4. Remplacez 'COLLEZ_VOTRE_TOKEN_ICI' dans ce script" -ForegroundColor Yellow
    Write-Host "5. Relancez le script" -ForegroundColor Yellow
    exit
}

Write-Host "Test 1: UserService direct (port 8085)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET -Headers $headers
    Write-Host "OK - Reponse:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "Test 2: Via API Gateway (port 8888)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET -Headers $headers
    Write-Host "OK - Reponse:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
