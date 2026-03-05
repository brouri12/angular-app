Write-Host "========================================"
Write-Host "CHECKING ABONNEMENT SERVICE STATUS"
Write-Host "========================================"

# Check if service is running
Write-Host "`nChecking if AbonnementService is running on port 8084..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8084/actuator/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ AbonnementService is RUNNING" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)"
} catch {
    Write-Host "❌ AbonnementService is NOT RUNNING" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start it, run:" -ForegroundColor Yellow
    Write-Host "cd AbonnementService"
    Write-Host "mvn spring-boot:run"
    Write-Host ""
    exit
}

# Check test endpoint
Write-Host "`nChecking test email endpoint..."
try {
    $testUrl = "http://localhost:8084/api/test/send-email"
    Write-Host "Endpoint: $testUrl"
    
    $body = @{
        email = "marwenazouzi44@gmail.com"
        name = "Test User"
    } | ConvertTo-Json
    
    Write-Host "`nSending test email..."
    $response = Invoke-RestMethod -Method POST -Uri $testUrl -ContentType "application/json" -Body $body
    
    Write-Host "✅ EMAIL SENT SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "Response: $response"
    Write-Host ""
    Write-Host "📧 Check your email: marwenazouzi44@gmail.com" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ ERROR sending email" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nServer Response:"
        Write-Host $responseBody
    }
}

Write-Host "`n========================================"
