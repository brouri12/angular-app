# Test Stripe Payment Intent Endpoint

Write-Host "Testing Stripe Payment Intent Creation" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if UserService is running
Write-Host "1. Checking if UserService is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/users/hello" -Method GET -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   OK UserService is running" -ForegroundColor Green
} catch {
    Write-Host "   ERROR UserService is NOT running!" -ForegroundColor Red
    Write-Host "   Please start UserService in IntelliJ first" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "2. Testing Payment Intent Creation..." -ForegroundColor Yellow

# Prepare test data
$testData = @{
    amount = 29.99
    currency = "usd"
} | ConvertTo-Json

Write-Host "   Request Data: $testData" -ForegroundColor White

# Get a test token (you'll need to login first)
Write-Host ""
Write-Host "   NOTE: This endpoint requires authentication" -ForegroundColor Yellow
Write-Host "   Please login first at http://localhost:4200" -ForegroundColor Yellow
Write-Host ""

# Test without auth first to see the error
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8888/user-service/api/payments/create-payment-intent" `
        -Method POST `
        -Headers $headers `
        -Body $testData `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "   SUCCESS!" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ERROR: Status Code $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 400) {
        Write-Host ""
        Write-Host "   400 Bad Request - Possible causes:" -ForegroundColor Yellow
        Write-Host "   1. Stripe API key not configured correctly" -ForegroundColor White
        Write-Host "   2. UserService not restarted after config change" -ForegroundColor White
        Write-Host "   3. Invalid request data format" -ForegroundColor White
        Write-Host ""
        Write-Host "   SOLUTION:" -ForegroundColor Cyan
        Write-Host "   1. Stop UserService in IntelliJ (red square button)" -ForegroundColor White
        Write-Host "   2. Right-click UserApplication.java -> Run" -ForegroundColor White
        Write-Host "   3. Wait for 'Started UserApplication' message" -ForegroundColor White
        Write-Host "   4. Run this test again" -ForegroundColor White
        Write-Host ""
        Write-Host "   Check UserService console for detailed error message" -ForegroundColor Yellow
        
    } elseif ($statusCode -eq 401) {
        Write-Host ""
        Write-Host "   401 Unauthorized - Authentication required" -ForegroundColor Yellow
        Write-Host "   This is expected - the endpoint requires login" -ForegroundColor White
        Write-Host ""
        Write-Host "   To test with authentication:" -ForegroundColor Cyan
        Write-Host "   1. Login at http://localhost:4200" -ForegroundColor White
        Write-Host "   2. Try payment from the pricing page" -ForegroundColor White
        
    } else {
        Write-Host ""
        Write-Host "   Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check Stripe configuration
Write-Host "3. Checking Stripe Configuration..." -ForegroundColor Yellow
$appProps = Get-Content "UserService\src\main\resources\application.properties" -Raw

if ($appProps -match "stripe.secret.key=sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx") {
    Write-Host "   OK Stripe Secret Key is configured" -ForegroundColor Green
} else {
    Write-Host "   ERROR Stripe Secret Key is NOT configured correctly" -ForegroundColor Red
}

Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Cyan
Write-Host "If you see 400 Bad Request, you MUST restart UserService!" -ForegroundColor Yellow
Write-Host "The Stripe keys were updated but UserService needs restart to load them." -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
