# Script to install Chart.js and setup dashboard charts

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP DASHBOARD CHARTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if back-office directory exists
if (-not (Test-Path "back-office")) {
    Write-Host "X back-office directory not found" -ForegroundColor Red
    Write-Host "  Please run this script from the project root" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing Chart.js..." -ForegroundColor Yellow
Write-Host ""

# Navigate to back-office and install
Push-Location back-office

try {
    # Install Chart.js
    Write-Host "Running: npm install chart.js" -ForegroundColor Cyan
    npm install chart.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Chart.js installed successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Check if it's installed
        $chartjsVersion = npm list chart.js --depth=0 2>$null | Select-String "chart.js@"
        if ($chartjsVersion) {
            Write-Host "Installed version: $chartjsVersion" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Start the back-office: npm start" -ForegroundColor White
        Write-Host "  2. Open http://localhost:4201" -ForegroundColor White
        Write-Host "  3. Login and view the dashboard" -ForegroundColor White
        Write-Host ""
        Write-Host "You should see:" -ForegroundColor Cyan
        Write-Host "  - Doughnut chart (Access Level Distribution)" -ForegroundColor White
        Write-Host "  - Pie chart (Active vs Inactive)" -ForegroundColor White
        Write-Host "  - Bar chart (Subscription Popularity)" -ForegroundColor White
        Write-Host "  - Feature cards (Priority Support, Unlimited Access)" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "Failed to install Chart.js" -ForegroundColor Red
        Write-Host "  Please check your npm installation" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "Error during installation:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host "========================================" -ForegroundColor Cyan
