# Restart Applications and Test Notifications
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Notification System - Restart & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you restart the applications to load the new notification system." -ForegroundColor Yellow
Write-Host ""

# Check if servers are running
Write-Host "Step 1: Checking if applications are running..." -ForegroundColor Green
$frontendRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*frontend*" }
$backofficeRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*back-office*" }

if ($frontendRunning -or $backofficeRunning) {
    Write-Host "⚠ Applications are currently running." -ForegroundColor Yellow
    Write-Host "Please stop them manually (Ctrl+C in their terminals) before continuing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After stopping, run this script again or manually start:" -ForegroundColor Yellow
    Write-Host "  Frontend: cd frontend/angular-app && npm start" -ForegroundColor Cyan
    Write-Host "  Back-Office: cd back-office && npm start" -ForegroundColor Cyan
    exit
}

Write-Host "✓ No running applications detected." -ForegroundColor Green
Write-Host ""

# Verify notification files exist
Write-Host "Step 2: Verifying notification system files..." -ForegroundColor Green

$files = @(
    "frontend/angular-app/src/app/components/notification/notification.ts",
    "frontend/angular-app/src/app/components/notification/notification.html",
    "frontend/angular-app/src/app/components/notification/notification.css",
    "frontend/angular-app/src/app/services/notification.service.ts",
    "back-office/src/app/components/notification/notification.ts",
    "back-office/src/app/components/notification/notification.html",
    "back-office/src/app/components/notification/notification.css",
    "back-office/src/app/services/notification.service.ts"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING!" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "❌ Some notification files are missing!" -ForegroundColor Red
    Write-Host "Please ensure all files were created correctly." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "✓ All notification files exist!" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Start Frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend/angular-app" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "2. Start Back-Office (in another terminal):" -ForegroundColor Yellow
Write-Host "   cd back-office" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Test Notifications:" -ForegroundColor Yellow
Write-Host "   Frontend Test Page: http://localhost:4200/test-notifications" -ForegroundColor Cyan
Write-Host "   Back-Office Users:  http://localhost:4201/users" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Clear Browser Cache:" -ForegroundColor Yellow
Write-Host "   Press Ctrl+Shift+Delete" -ForegroundColor Cyan
Write-Host "   Select 'Cached images and files'" -ForegroundColor Cyan
Write-Host "   Click 'Clear data'" -ForegroundColor Cyan
Write-Host "   Refresh with Ctrl+F5" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WHAT TO EXPECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Styled modals instead of browser alerts" -ForegroundColor Green
Write-Host "✓ Colored icons (green checkmark, red X, etc.)" -ForegroundColor Green
Write-Host "✓ Smooth animations" -ForegroundColor Green
Write-Host "✓ Green gradient buttons for confirmations" -ForegroundColor Green
Write-Host "✓ Backdrop blur effect" -ForegroundColor Green
Write-Host ""

Write-Host "If you still see browser alerts after restarting:" -ForegroundColor Yellow
Write-Host "1. Check browser console (F12) for errors" -ForegroundColor Cyan
Write-Host "2. Clear browser cache completely" -ForegroundColor Cyan
Write-Host "3. Hard refresh with Ctrl+F5" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
