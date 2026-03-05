Write-Host "========================================"
Write-Host "ABONNEMENT SERVICE - START & TEST EMAIL"
Write-Host "========================================"

# Step 1: Check if service is already running
Write-Host "`n[1/4] Checking if AbonnementService is already running..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8084/actuator/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Service is already running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Service is not running. You need to start it first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open a NEW terminal and run:" -ForegroundColor Cyan
    Write-Host "cd AbonnementService"
    Write-Host "mvn clean install -DskipTests"
    Write-Host "mvn spring-boot:run"
    Write-Host ""
    Write-Host "Wait for this message:"
    Write-Host "✅ Microservice Abonnement démarré avec succès!"
    Write-Host ""
    Write-Host "Then run this script again."
    exit
}

# Step 2: Wait a moment for service to be fully ready
Write-Host "`n[2/4] Waiting for service to be fully ready..."
Start-Sleep -Seconds 2

# Step 3: Check email health endpoint
Write-Host "`n[3/4] Checking email service health..."
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8084/api/test/email-health" -Method GET
    Write-Host "✅ Email service is healthy!" -ForegroundColor Green
    Write-Host "Status: $($health.status)"
} catch {
    Write-Host "⚠️ Email health check failed, but continuing..." -ForegroundColor Yellow
}

# Step 4: Send test email
Write-Host "`n[4/4] Sending test email to marwenazouzi44@gmail.com..."
Write-Host "========================================"

try {
    $body = @{
        email = "marwenazouzi44@gmail.com"
        name = "Marwen Azouzi"
        subscription = "Premium"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:8084/api/test/send-email" `
        -ContentType "application/json" -Body $body -TimeoutSec 30

    Write-Host ""
    Write-Host "✅ EMAIL SENT SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host "📧 Email Details:"
    Write-Host "   To: $($response.email)"
    Write-Host "   Name: $($response.name)"
    Write-Host "   Subscription: $($response.subscription)"
    Write-Host "   Promo Code: $($response.promoCode)" -ForegroundColor Cyan
    Write-Host "   Discount: $($response.discount)" -ForegroundColor Yellow
    Write-Host "   Expires: $($response.expirationDate)"
    Write-Host ""
    Write-Host "📬 CHECK YOUR INBOX: marwenazouzi44@gmail.com" -ForegroundColor Magenta
    Write-Host "   Subject: ⏰ Your Premium Subscription Expires Soon"
    Write-Host "   (Check spam folder if not in inbox)"
    Write-Host "========================================"

} catch {
    Write-Host ""
    Write-Host "❌ ERROR SENDING EMAIL" -ForegroundColor Red
    Write-Host "========================================"
    Write-Host "Error: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nServer Response:"
            Write-Host $responseBody
        } catch {
            Write-Host "Could not read error details"
        }
    }
    
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check AbonnementService console for errors"
    Write-Host "2. Verify email credentials in application.properties"
    Write-Host "3. Make sure Gmail app password is correct: joqcqyezefbxhbzd"
    Write-Host "4. Check if port 587 is not blocked by firewall"
    Write-Host ""
}

Write-Host ""
