# ============================================================
#  Configure Jenkins - Install Plugins and Create Jobs
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Jenkins Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$JENKINS_URL = "http://localhost:8080"

Write-Host "Step 1: Getting Jenkins Initial Password..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"
Write-Host ""

try {
    $initialPassword = docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
    
    if ($initialPassword) {
        Write-Host "[OK] Initial Admin Password:" -ForegroundColor Green
        Write-Host "     $initialPassword" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "[INFO] Jenkins may already be configured" -ForegroundColor Yellow
        Write-Host ""
    }
}
catch {
    Write-Host "[ERROR] Could not retrieve Jenkins password" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Jenkins Setup Instructions" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host ""

Write-Host "1. Open Jenkins: $JENKINS_URL" -ForegroundColor White
Write-Host ""
Write-Host "2. Use the password above to unlock Jenkins" -ForegroundColor White
Write-Host ""
Write-Host "3. Install suggested plugins, plus these additional plugins:" -ForegroundColor White
Write-Host "   • Docker Pipeline" -ForegroundColor Gray
Write-Host "   • SonarQube Scanner" -ForegroundColor Gray
Write-Host "   • Prometheus Metrics" -ForegroundColor Gray
Write-Host "   • Blue Ocean" -ForegroundColor Gray
Write-Host "   • Pipeline: Stage View" -ForegroundColor Gray
Write-Host "   • Git" -ForegroundColor Gray
Write-Host "   • GitHub" -ForegroundColor Gray
Write-Host "   • Maven Integration" -ForegroundColor Gray
Write-Host "   • NodeJS" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Create admin user" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Configure Jenkins Credentials" -ForegroundColor Yellow
Write-Host "--------------------------------------"
Write-Host ""

Write-Host "Add these credentials in Jenkins:" -ForegroundColor White
Write-Host ""
Write-Host "A. Docker Hub Credentials" -ForegroundColor Cyan
Write-Host "   • Go to: Manage Jenkins → Credentials → System → Global credentials" -ForegroundColor Gray
Write-Host "   • Add: Username with password" -ForegroundColor Gray
Write-Host "   • ID: dockerhub-credentials" -ForegroundColor Gray
Write-Host "   • Username: <your-dockerhub-username>" -ForegroundColor Gray
Write-Host "   • Password: <your-dockerhub-password>" -ForegroundColor Gray
Write-Host ""

Write-Host "B. SonarQube Token" -ForegroundColor Cyan
Write-Host "   • Add: Secret text" -ForegroundColor Gray
Write-Host "   • ID: sonarqube-token" -ForegroundColor Gray
Write-Host "   • Secret: <token from SonarQube configuration>" -ForegroundColor Gray
Write-Host ""

Write-Host "C. GitHub Credentials (if using private repo)" -ForegroundColor Cyan
Write-Host "   • Add: Username with password or SSH key" -ForegroundColor Gray
Write-Host "   • ID: github-credentials" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Configure SonarQube Server" -ForegroundColor Yellow
Write-Host "-----------------------------------"
Write-Host ""

Write-Host "1. Go to: Manage Jenkins → Configure System" -ForegroundColor White
Write-Host "2. Find 'SonarQube servers' section" -ForegroundColor White
Write-Host "3. Add SonarQube:" -ForegroundColor White
Write-Host "   • Name: SonarQube" -ForegroundColor Gray
Write-Host "   • Server URL: http://sonarqube:9000" -ForegroundColor Gray
Write-Host "   • Server authentication token: Select 'sonarqube-token'" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 5: Configure Maven" -ForegroundColor Yellow
Write-Host "-----------------------"
Write-Host ""

Write-Host "1. Go to: Manage Jenkins → Global Tool Configuration" -ForegroundColor White
Write-Host "2. Add Maven:" -ForegroundColor White
Write-Host "   • Name: Maven 3.8" -ForegroundColor Gray
Write-Host "   • Install automatically: Yes" -ForegroundColor Gray
Write-Host "   • Version: 3.8.6" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 6: Configure NodeJS" -ForegroundColor Yellow
Write-Host "------------------------"
Write-Host ""

Write-Host "1. In Global Tool Configuration" -ForegroundColor White
Write-Host "2. Add NodeJS:" -ForegroundColor White
Write-Host "   • Name: NodeJS 18" -ForegroundColor Gray
Write-Host "   • Install automatically: Yes" -ForegroundColor Gray
Write-Host "   • Version: 18.x" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 7: Create Pipeline Jobs" -ForegroundColor Yellow
Write-Host "-----------------------------"
Write-Host ""

Write-Host "Create a new Pipeline job:" -ForegroundColor White
Write-Host "1. Click 'New Item'" -ForegroundColor Gray
Write-Host "2. Enter name: 'Wordly-Microservices-Pipeline'" -ForegroundColor Gray
Write-Host "3. Select 'Pipeline'" -ForegroundColor Gray
Write-Host "4. In Pipeline section:" -ForegroundColor Gray
Write-Host "   • Definition: Pipeline script from SCM" -ForegroundColor Gray
Write-Host "   • SCM: Git" -ForegroundColor Gray
Write-Host "   • Repository URL: <your-git-repo-url>" -ForegroundColor Gray
Write-Host "   • Script Path: Jenkinsfile" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Configuration Guide Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "  • Jenkins: $JENKINS_URL" -ForegroundColor White
Write-Host "  • SonarQube: http://localhost:9000" -ForegroundColor White
Write-Host "  • Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  • Grafana: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Complete Jenkins setup wizard" -ForegroundColor White
Write-Host "2. Add credentials" -ForegroundColor White
Write-Host "3. Configure SonarQube integration" -ForegroundColor White
Write-Host "4. Create pipeline jobs" -ForegroundColor White
Write-Host "5. Run your first build!" -ForegroundColor White
Write-Host ""
