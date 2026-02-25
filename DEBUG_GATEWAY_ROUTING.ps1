# Script pour déboguer le routage Gateway
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEBUG GATEWAY ROUTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Récupérer le token depuis le localStorage du navigateur
Write-Host "`nPour obtenir votre token:" -ForegroundColor Yellow
Write-Host "1. Ouvrez la console du navigateur (F12)" -ForegroundColor Yellow
Write-Host "2. Tapez: localStorage.getItem('access_token')" -ForegroundColor Yellow
Write-Host "3. Copiez le token et collez-le ci-dessous" -ForegroundColor Yellow
Write-Host "`nEntrez votre token (ou appuyez sur Entrée pour tester sans token):" -ForegroundColor Yellow
$token = Read-Host

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 1: UserService direct - /api/auth/info (sans auth)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/auth/info" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test 2: Gateway - /user-service/api/auth/info (sans auth)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/info" -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

if ($token -and $token.Trim() -ne "") {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Test 3: UserService direct - /api/auth/me (avec token)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-WebRequest -Uri "http://localhost:8085/api/auth/me" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "✗ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Test 4: Gateway - /user-service/api/auth/me (avec token)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "✗ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n⚠ Aucun token fourni - Tests avec authentification ignorés" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIN DU DEBUG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
