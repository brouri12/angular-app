# ============================================================
#  Setup GitHub Webhook for Jenkins - Helper Script
# ============================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  GitHub Webhook Setup for Jenkins" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up automatic builds when you push to GitHub." -ForegroundColor White
Write-Host ""

# Step 1: Check if Jenkins is running
Write-Host "Step 1: Checking Jenkins..." -ForegroundColor Yellow
Write-Host "----------------------------"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] Jenkins is running at http://localhost:8080" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Jenkins is not accessible at http://localhost:8080" -ForegroundColor Red
    Write-Host "Please start Jenkins first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Choose Exposure Method" -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host ""

Write-Host "To receive webhooks from GitHub, Jenkins must be accessible from the internet." -ForegroundColor White
Write-Host ""
Write-Host "Choose a method:" -ForegroundColor Cyan
Write-Host "1. ngrok (Easiest, temporary URL)" -ForegroundColor White
Write-Host "2. Cloudflare Tunnel (Free, more stable)" -ForegroundColor White
Write-Host "3. Manual setup (I'll do it myself)" -ForegroundColor White
Write-Host "4. Use polling instead (no webhook needed)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "ngrok Setup" -ForegroundColor Cyan
        Write-Host "-----------"
        Write-Host ""
        Write-Host "1. Download ngrok from: https://ngrok.com/download" -ForegroundColor White
        Write-Host "2. Extract the zip file" -ForegroundColor White
        Write-Host "3. Open a new PowerShell window" -ForegroundColor White
        Write-Host "4. Navigate to ngrok folder" -ForegroundColor White
        Write-Host "5. Run: .\ngrok http 8080" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ngrok will show you a public URL like:" -ForegroundColor White
        Write-Host "  https://abc123.ngrok.io -> http://localhost:8080" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Use this URL for your webhook:" -ForegroundColor Cyan
        Write-Host "  https://abc123.ngrok.io/github-webhook/" -ForegroundColor Yellow
        Write-Host ""
    }
    
    "2" {
        Write-Host ""
        Write-Host "Cloudflare Tunnel Setup" -ForegroundColor Cyan
        Write-Host "-----------------------"
        Write-Host ""
        Write-Host "1. Download cloudflared from:" -ForegroundColor White
        Write-Host "   https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Open a new PowerShell window" -ForegroundColor White
        Write-Host "3. Run: cloudflared tunnel --url http://localhost:8080" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Cloudflare will show you a public URL like:" -ForegroundColor White
        Write-Host "  https://xyz.trycloudflare.com" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Use this URL for your webhook:" -ForegroundColor Cyan
        Write-Host "  https://xyz.trycloudflare.com/github-webhook/" -ForegroundColor Yellow
        Write-Host ""
    }
    
    "3" {
        Write-Host ""
        Write-Host "Manual Setup" -ForegroundColor Cyan
        Write-Host "------------"
        Write-Host ""
        Write-Host "Your webhook URL will be:" -ForegroundColor White
        Write-Host "  http://your-public-ip-or-domain:8080/github-webhook/" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Make sure Jenkins is accessible from the internet." -ForegroundColor White
        Write-Host ""
    }
    
    "4" {
        Write-Host ""
        Write-Host "Polling Setup (No Webhook)" -ForegroundColor Cyan
        Write-Host "--------------------------"
        Write-Host ""
        Write-Host "Instead of webhooks, Jenkins will check GitHub every few minutes." -ForegroundColor White
        Write-Host ""
        Write-Host "To configure:" -ForegroundColor Cyan
        Write-Host "1. Go to your Jenkins job" -ForegroundColor White
        Write-Host "2. Click 'Configure'" -ForegroundColor White
        Write-Host "3. Scroll to 'Build Triggers'" -ForegroundColor White
        Write-Host "4. Check 'Poll SCM'" -ForegroundColor White
        Write-Host "5. Schedule: H/5 * * * * (every 5 minutes)" -ForegroundColor Yellow
        Write-Host "6. Save" -ForegroundColor White
        Write-Host ""
        Write-Host "Pros: Works on localhost, no exposure needed" -ForegroundColor Green
        Write-Host "Cons: 5 minute delay, more resource intensive" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 3: Configure Jenkins Job" -ForegroundColor Yellow
Write-Host "------------------------------"
Write-Host ""

Write-Host "In Jenkins:" -ForegroundColor Cyan
Write-Host "1. Go to your pipeline job" -ForegroundColor White
Write-Host "2. Click 'Configure'" -ForegroundColor White
Write-Host "3. Scroll to 'Build Triggers'" -ForegroundColor White
Write-Host "4. Check 'GitHub hook trigger for GITScm polling'" -ForegroundColor Yellow
Write-Host "5. Click 'Save'" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Add Webhook in GitHub" -ForegroundColor Yellow
Write-Host "------------------------------"
Write-Host ""

Write-Host "In GitHub:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/brouri12/angular-app" -ForegroundColor White
Write-Host "2. Click: Settings → Webhooks → Add webhook" -ForegroundColor White
Write-Host ""
Write-Host "3. Fill in:" -ForegroundColor White
Write-Host "   Payload URL: https://your-public-url/github-webhook/" -ForegroundColor Yellow
Write-Host "   Content type: application/json" -ForegroundColor Gray
Write-Host "   Events: Just the push event" -ForegroundColor Gray
Write-Host "   Active: ✓" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click 'Add webhook'" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Test the Webhook" -ForegroundColor Yellow
Write-Host "------------------------"
Write-Host ""

Write-Host "Push some code to test:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  git add ." -ForegroundColor Gray
Write-Host "  git commit -m 'Test webhook'" -ForegroundColor Gray
Write-Host "  git push origin feature/complete-devops-setup" -ForegroundColor Gray
Write-Host ""
Write-Host "Jenkins should automatically start a build!" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Setup Instructions Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "  devops/monitoring/GITHUB_WEBHOOK_SETUP.md" -ForegroundColor White
Write-Host ""

Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  • Jenkins: http://localhost:8080" -ForegroundColor White
Write-Host "  • ngrok download: https://ngrok.com/download" -ForegroundColor White
Write-Host "  • Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/" -ForegroundColor White
Write-Host ""
