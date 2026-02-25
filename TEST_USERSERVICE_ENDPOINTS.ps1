# Test UserService endpoints
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST USERSERVICE ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nTest 1: /api/auth/info (should work)" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/info" -Method GET
    Write-Host "✓ SUCCESS: $response1" -ForegroundColor Green
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Is UserService running on port 8085?" -ForegroundColor Yellow
}

Write-Host "`nTest 2: /api/auth/me without token (should return 401)" -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" -Method GET
    Write-Host "✗ Unexpected success (should require auth)" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status Code: $statusCode" -ForegroundColor White
    if ($statusCode -eq 401) {
        Write-Host "✓ Correct: 401 Unauthorized" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "✗ PROBLEM: 404 Not Found - Endpoint not mapped!" -ForegroundColor Red
    } else {
        Write-Host "✗ Unexpected status: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
