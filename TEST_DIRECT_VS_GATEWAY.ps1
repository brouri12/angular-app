# Test to compare direct UserService vs Gateway routing
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST DIRECT VS GATEWAY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nTest 1: Direct to UserService - /api/auth/info" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/info" -Method GET
    Write-Host "✓ SUCCESS: $response1" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest 2: Via Gateway - /user-service/api/auth/info" -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/info" -Method GET
    Write-Host "✓ SUCCESS: $response2" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest 3: Direct to UserService - /api/auth/me (should return 401)" -ForegroundColor Yellow
try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET
    Write-Host "✓ Unexpected success: $response3" -ForegroundColor Yellow
} catch {
    $statusCode3 = $_.Exception.Response.StatusCode.value__
    if ($statusCode3 -eq 401) {
        Write-Host "✓ Correct: 401 Unauthorized (expected)" -ForegroundColor Green
    } else {
        Write-Host "✗ Wrong error: $statusCode3" -ForegroundColor Red
    }
}

Write-Host "`nTest 4: Via Gateway - /user-service/api/auth/me (should return 401)" -ForegroundColor Yellow
try {
    $response4 = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/me" -Method GET
    Write-Host "✓ Unexpected success: $response4" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor White
    if ($statusCode -eq 401) {
        Write-Host "✓ Correct: 401 Unauthorized (expected)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "✗ PROBLEM: 404 Not Found (route not working!)" -ForegroundColor Red
    } else {
        Write-Host "✗ Wrong error: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
