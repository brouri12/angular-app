# Test script to verify receipt endpoint is working

Write-Host "Testing Receipt Endpoint" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Get the first receipt file
$receiptFile = Get-ChildItem -Path "UserService\uploads\receipts" -File | Select-Object -First 1

if ($null -eq $receiptFile) {
    Write-Host "ERROR: No receipt files found in UserService\uploads\receipts" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please upload a receipt first by:" -ForegroundColor Yellow
    Write-Host "1. Go to http://localhost:4200/pricing" -ForegroundColor White
    Write-Host "2. Select Bank Transfer" -ForegroundColor White
    Write-Host "3. Upload a test image" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
}

Write-Host "Found receipt file: $($receiptFile.Name)" -ForegroundColor Green
Write-Host ""

# Test the endpoint
$url = "http://localhost:8888/user-service/api/payments/receipt/$($receiptFile.Name)"
Write-Host "Testing URL: $url" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method GET -ErrorAction Stop
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    Write-Host "Content Length: $($response.RawContentLength) bytes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Receipt endpoint is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can view the receipt at:" -ForegroundColor Cyan
    Write-Host $url -ForegroundColor White
    Write-Host ""
    
    # Try to open in browser
    Write-Host "Opening in browser..." -ForegroundColor Yellow
    Start-Process $url
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "Authentication required!" -ForegroundColor Yellow
        Write-Host "The endpoint requires authentication." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Fix:" -ForegroundColor Cyan
        Write-Host "1. Make sure SecurityConfig allows public access to /api/payments/receipt/**" -ForegroundColor White
        Write-Host "2. Restart UserService" -ForegroundColor White
        Write-Host ""
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "File not found!" -ForegroundColor Yellow
        Write-Host "The receipt file exists but the endpoint can't find it." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Check:" -ForegroundColor Cyan
        Write-Host "1. FileStorageService upload directory configuration" -ForegroundColor White
        Write-Host "2. File path in database matches actual file" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "Unexpected error!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Check:" -ForegroundColor Cyan
        Write-Host "1. UserService is running on port 8085" -ForegroundColor White
        Write-Host "2. API Gateway is running on port 8888" -ForegroundColor White
        Write-Host "3. Gateway routes are configured correctly" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""
Read-Host "Press Enter to exit"
