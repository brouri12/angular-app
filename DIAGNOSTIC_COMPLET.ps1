# Diagnostic complet du problème

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC COMPLET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: UserService direct sans auth
Write-Host "Test 1: UserService direct (sans auth)" -ForegroundColor Yellow
Write-Host "URL: http://localhost:8085/api/auth/info" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/info" -Method GET
    Write-Host "OK - UserService repond:" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Test 2: Via Gateway sans auth
Write-Host "Test 2: Via Gateway (sans auth)" -ForegroundColor Yellow
Write-Host "URL: http://localhost:8888/user-service/api/auth/info" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/info" -Method GET
    Write-Host "OK - Gateway route correctement:" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
} catch {
    Write-Host "ERREUR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
Write-Host ""

# Test 3: Endpoint /me direct (devrait retourner 401)
Write-Host "Test 3: Endpoint /me direct (devrait retourner 401 Unauthorized)" -ForegroundColor Yellow
Write-Host "URL: http://localhost:8085/api/auth/me" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET
    Write-Host "INATTENDU - Reponse recue sans auth:" -ForegroundColor Yellow
    Write-Host $response -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "OK - 401 Unauthorized (normal sans token)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "PROBLEME - 404 Not Found (endpoint n'existe pas!)" -ForegroundColor Red
    } else {
        Write-Host "ERREUR - Status: $statusCode" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: Endpoint /me via Gateway (devrait retourner 401)
Write-Host "Test 4: Endpoint /me via Gateway (devrait retourner 401 Unauthorized)" -ForegroundColor Yellow
Write-Host "URL: http://localhost:8888/user-service/api/auth/me" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET
    Write-Host "INATTENDU - Reponse recue sans auth:" -ForegroundColor Yellow
    Write-Host $response -ForegroundColor White
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "OK - 401 Unauthorized (normal sans token)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "PROBLEME - 404 Not Found (Gateway ne route pas correctement!)" -ForegroundColor Red
    } else {
        Write-Host "ERREUR - Status: $statusCode" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIN DU DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
