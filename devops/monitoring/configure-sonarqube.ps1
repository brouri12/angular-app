# ============================================================
#  Configure SonarQube - Create Projects and Quality Gates
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  SonarQube Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$SONAR_URL = "http://localhost:9000"
$SONAR_USER = "admin"
$SONAR_PASS = "adminadmin"

# Base64 encode credentials
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${SONAR_USER}:${SONAR_PASS}"))
$headers = @{
    Authorization = "Basic $base64AuthInfo"
}

# Function to create SonarQube project
function Create-SonarProject {
    param (
        [string]$ProjectKey,
        [string]$ProjectName
    )
    
    Write-Host "Creating project: $ProjectName..." -ForegroundColor Blue
    
    try {
        $body = @{
            project = $ProjectKey
            name = $ProjectName
        }
        
        $response = Invoke-RestMethod -Uri "$SONAR_URL/api/projects/create" `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "[OK] Project created: $ProjectName" -ForegroundColor Green
        
        # Generate token for the project
        $tokenBody = @{
            name = "${ProjectKey}-token"
        }
        
        $tokenResponse = Invoke-RestMethod -Uri "$SONAR_URL/api/user_tokens/generate" `
            -Method Post `
            -Headers $headers `
            -Body $tokenBody `
            -ContentType "application/x-www-form-urlencoded"
        
        Write-Host "   Token: $($tokenResponse.token)" -ForegroundColor Yellow
        
        return $tokenResponse.token
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "[INFO] Project already exists: $ProjectName" -ForegroundColor Yellow
        } else {
            Write-Host "[ERROR] Failed to create project: $ProjectName" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    }
}

# Wait for SonarQube to be ready
Write-Host "Checking SonarQube availability..." -ForegroundColor Blue
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "$SONAR_URL/api/system/status" -UseBasicParsing -TimeoutSec 5
        $status = ($response.Content | ConvertFrom-Json).status
        
        if ($status -eq "UP") {
            Write-Host "[OK] SonarQube is ready" -ForegroundColor Green
            break
        }
    }
    catch {
        $attempt++
        Write-Host "." -NoNewline -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host ""
    Write-Host "[ERROR] SonarQube is not responding" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating SonarQube projects..." -ForegroundColor Yellow
Write-Host "-------------------------------"
Write-Host ""

# Define all microservices
$projects = @(
    @{Key="wordly-user-service"; Name="Wordly User Service"},
    @{Key="wordly-abonnement-service"; Name="Wordly Abonnement Service"},
    @{Key="wordly-challenge-service"; Name="Wordly Challenge Service"},
    @{Key="wordly-planification-service"; Name="Wordly Planification Service"},
    @{Key="wordly-event-service"; Name="Wordly Event Service"},
    @{Key="wordly-reservation-service"; Name="Wordly Reservation Service"},
    @{Key="wordly-recrutement-service"; Name="Wordly Recrutement Service"},
    @{Key="wordly-club-service"; Name="Wordly Club Service"},
    @{Key="wordly-member-service"; Name="Wordly Member Service"},
    @{Key="wordly-forum-service"; Name="Wordly Forum Service"},
    @{Key="wordly-formation-service"; Name="Wordly Formation Service"},
    @{Key="wordly-quiz-badge-service"; Name="Wordly Quiz Badge Service"},
    @{Key="wordly-pronunciation-service"; Name="Wordly Pronunciation Service"},
    @{Key="wordly-feedback-service"; Name="Wordly Feedback Service"},
    @{Key="wordly-pronunciation-fastapi"; Name="Wordly Pronunciation FastAPI"},
    @{Key="wordly-api-gateway"; Name="Wordly API Gateway"},
    @{Key="wordly-eureka-server"; Name="Wordly Eureka Server"},
    @{Key="wordly-frontend"; Name="Wordly Frontend"},
    @{Key="wordly-backoffice"; Name="Wordly Back-office"}
)

$tokens = @{}

foreach ($project in $projects) {
    $token = Create-SonarProject -ProjectKey $project.Key -ProjectName $project.Name
    if ($token) {
        $tokens[$project.Key] = $token
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Configuration Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "SonarQube Projects Created:" -ForegroundColor Cyan
Write-Host "  • $($projects.Count) projects configured" -ForegroundColor White
Write-Host ""

Write-Host "Project Tokens (save these for Jenkins):" -ForegroundColor Yellow
foreach ($key in $tokens.Keys) {
    Write-Host "  $key : $($tokens[$key])" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Access SonarQube: http://localhost:9000" -ForegroundColor White
Write-Host "2. Login with admin/admin" -ForegroundColor White
Write-Host "3. Change default password" -ForegroundColor White
Write-Host "4. Configure quality gates and rules" -ForegroundColor White
Write-Host "5. Add tokens to Jenkins credentials" -ForegroundColor White
Write-Host ""

# Save tokens to file
$tokensJson = $tokens | ConvertTo-Json
$tokensJson | Out-File -FilePath "sonarqube-tokens.json" -Encoding UTF8
Write-Host "Tokens saved to: sonarqube-tokens.json" -ForegroundColor Green
Write-Host ""
