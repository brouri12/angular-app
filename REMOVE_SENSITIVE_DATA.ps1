# Script to remove sensitive data from documentation files

Write-Host "Removing sensitive data from documentation files..." -ForegroundColor Yellow
Write-Host ""

$stripeSecretKey = "sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx"
$stripePublishableKey = "pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ"

# Files to clean
$files = @(
    "PAYMENT_SYSTEM_COMPLETE.md",
    "QUICK_START_PAYMENT_SYSTEM.md",
    "RESTART_SERVICES_NOW.md",
    "TEST_STRIPE_ENDPOINT.ps1",
    "VERIFY_CONFIGURATION.ps1",
    "NEXT_STEPS.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Cleaning $file..." -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        
        # Replace Stripe keys
        $content = $content -replace [regex]::Escape($stripeSecretKey), "sk_test_YOUR_SECRET_KEY"
        $content = $content -replace [regex]::Escape($stripePublishableKey), "pk_test_YOUR_PUBLISHABLE_KEY"
        
        # Save
        Set-Content -Path $file -Value $content -NoNewline
        
        Write-Host "  OK Cleaned" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done! Sensitive data removed." -ForegroundColor Green
Write-Host ""
