# Check what services are registered in Eureka
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CHECKING EUREKA SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Method GET -Headers @{"Accept"="application/json"}
    
    Write-Host "`nRegistered Services:" -ForegroundColor Green
    foreach ($app in $response.applications.application) {
        Write-Host "`n- Service Name: $($app.name)" -ForegroundColor Yellow
        foreach ($instance in $app.instance) {
            Write-Host "  Instance ID: $($instance.instanceId)" -ForegroundColor White
            Write-Host "  Status: $($instance.status)" -ForegroundColor White
            Write-Host "  Home Page: $($instance.homePageUrl)" -ForegroundColor White
            Write-Host "  Health Check: $($instance.healthCheckUrl)" -ForegroundColor White
        }
    }
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Testing Gateway Routes" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # Test with lowercase
    Write-Host "`nTest 1: /user-service/api/auth/info" -ForegroundColor Yellow
    try {
        $test1 = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/info" -Method GET
        Write-Host "✓ SUCCESS: $test1" -ForegroundColor Green
    } catch {
        Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test with uppercase
    Write-Host "`nTest 2: /USER-SERVICE/api/auth/info" -ForegroundColor Yellow
    try {
        $test2 = Invoke-RestMethod -Uri "http://localhost:8888/USER-SERVICE/api/auth/info" -Method GET
        Write-Host "✓ SUCCESS: $test2" -ForegroundColor Green
    } catch {
        Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "✗ Error connecting to Eureka: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "FIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
