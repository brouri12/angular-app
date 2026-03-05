# Simple test
Write-Host "Test 1: /api/auth/info" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/info"
    Write-Host "SUCCESS: $r" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
}

Write-Host "`nTest 2: /api/auth/me" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me"
    Write-Host "SUCCESS" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor White
}
