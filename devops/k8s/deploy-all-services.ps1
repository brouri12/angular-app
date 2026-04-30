# ============================================================
#  Deploy All Wordly Microservices to Kubernetes (PowerShell)
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deploying Wordly Microservices" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Function to deploy a service
function Deploy-Service {
    param (
        [string]$ServiceFile
    )
    
    $serviceName = [System.IO.Path]::GetFileNameWithoutExtension($ServiceFile)
    
    Write-Host "[INFO] Deploying $serviceName..." -ForegroundColor Blue
    
    try {
        kubectl apply -f $ServiceFile | Out-Null
        Write-Host "[SUCCESS] $serviceName deployed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] Failed to deploy $serviceName" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Step 1: Deploy infrastructure
Write-Host ""
Write-Host "Step 1: Deploying Infrastructure..." -ForegroundColor Yellow
Write-Host "------------------------------------"

kubectl apply -f 00-namespace.yml
kubectl apply -f 01-mysql.yml
kubectl apply -f 02-eureka.yml
kubectl apply -f 03-api-gateway.yml
# Note: Keycloak deployment is optional, skipping for now

Write-Host "[SUCCESS] Infrastructure deployed" -ForegroundColor Green

# Step 2: Wait for infrastructure
Write-Host ""
Write-Host "Step 2: Waiting for infrastructure to be ready..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------"
Write-Host "Waiting 60 seconds for MySQL and Eureka to initialize..."
Start-Sleep -Seconds 60

# Step 3: Deploy all microservices
Write-Host ""
Write-Host "Step 3: Deploying Microservices..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$services = @(
    "services/user-service.yml",
    "services/abonnement-service.yml",
    "services/challenge-service.yml",
    "services/planification-service.yml",
    "services/event-service.yml",
    "services/reservation-service.yml",
    "services/recrutement-service.yml",
    "services/club-service.yml",
    "services/member-service.yml",
    "services/forum-service.yml",
    "services/formation-service.yml",
    "services/quiz-badge-service.yml",
    "services/pronunciation-fastapi.yml",
    "services/pronunciation-service.yml",
    "services/feedback-service.yml"
)

foreach ($service in $services) {
    Deploy-Service -ServiceFile $service
    Start-Sleep -Seconds 2
}

# Step 4: Deploy frontend applications
Write-Host ""
Write-Host "Step 4: Deploying Frontend Applications..." -ForegroundColor Yellow
Write-Host "-------------------------------------------"

kubectl apply -f 05-frontends.yml

Write-Host "[SUCCESS] Frontend applications deployed" -ForegroundColor Green

# Step 5: Display deployment status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking pod status..."
kubectl get pods -n wordly

Write-Host ""
Write-Host "Checking service status..."
kubectl get services -n wordly

Write-Host ""
Write-Host "[COMPLETE] All services have been deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "To check the status of your deployments, run:"
Write-Host "  kubectl get pods -n wordly"
Write-Host "  kubectl get services -n wordly"
Write-Host ""
Write-Host "To view logs for a specific service, run:"
Write-Host "  kubectl logs -f deployment/<service-name> -n wordly"
Write-Host ""
Write-Host "To access the applications:"
Write-Host "  - Frontend: http://localhost:4200"
Write-Host "  - Back-office: http://localhost:4201"
Write-Host "  - API Gateway: http://localhost:8888"
Write-Host "  - Eureka Dashboard: http://localhost:8761"
Write-Host ""
