# ============================================================
#  Deploy Wordly Platform - Windows PowerShell Version
# ============================================================
# This script deploys Wordly to any Kubernetes cluster
# (Docker Desktop, Minikube, or remote kubeadm cluster)
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Wordly Platform Deployment (Windows)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$NAMESPACE = "wordly"
$K8S_DIR = "..\k8s"

# Function to check if kubectl is available
function Test-Kubectl {
    try {
        kubectl version --client | Out-Null
        Write-Host "[OK] kubectl is installed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] kubectl not found. Please install kubectl first." -ForegroundColor Red
        Write-Host "Download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/" -ForegroundColor Yellow
        return $false
    }
}

# Function to check cluster connectivity
function Test-Cluster {
    try {
        kubectl cluster-info | Out-Null
        Write-Host "[OK] Connected to Kubernetes cluster" -ForegroundColor Green
        Write-Host ""
        Write-Host "Cluster nodes:" -ForegroundColor Cyan
        kubectl get nodes
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "[ERROR] Cannot connect to Kubernetes cluster." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please ensure one of the following is running:" -ForegroundColor Yellow
        Write-Host "  - Docker Desktop with Kubernetes enabled" -ForegroundColor Yellow
        Write-Host "  - Minikube (minikube start)" -ForegroundColor Yellow
        Write-Host "  - kubectl configured for remote cluster" -ForegroundColor Yellow
        return $false
    }
}

# Function to wait for pods
function Wait-ForPods {
    param (
        [string]$Label,
        [int]$Timeout = 300
    )
    
    Write-Host "[INFO] Waiting for pods with label $Label to be ready..." -ForegroundColor Blue
    
    try {
        kubectl wait --for=condition=ready pod -l "$Label" -n "$NAMESPACE" --timeout="${Timeout}s" 2>$null | Out-Null
        Write-Host "[SUCCESS] Pods are ready" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[WARNING] Timeout waiting for pods. Continuing anyway..." -ForegroundColor Yellow
        return $false
    }
}

# Function to deploy a resource
function Deploy-Resource {
    param (
        [string]$Resource,
        [string]$Description
    )
    
    Write-Host "[INFO] Deploying $Description..." -ForegroundColor Blue
    
    try {
        kubectl apply -f "$Resource" | Out-Null
        Write-Host "[SUCCESS] $Description deployed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] Failed to deploy $Description" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Pre-flight checks
Write-Host ""
Write-Host "=========================================="  -ForegroundColor Yellow
Write-Host "  Pre-flight Checks" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

if (-not (Test-Kubectl)) {
    exit 1
}

if (-not (Test-Cluster)) {
    exit 1
}

# Step 1: Create namespace
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 1: Creating Namespace" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\00-namespace.yml" "Namespace"

# Step 2: Deploy MySQL databases
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 2: Deploying MySQL Databases" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\01-mysql.yml" "MySQL Databases"

Write-Host "[INFO] Waiting for MySQL pods to be ready (this may take a few minutes)..." -ForegroundColor Blue
Start-Sleep -Seconds 30
Wait-ForPods "tier=database" 300

# Step 3: Deploy Eureka Server
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 3: Deploying Eureka Server" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\02-eureka.yml" "Eureka Server"

Write-Host "[INFO] Waiting for Eureka Server to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 20
Wait-ForPods "app=eureka-server" 180

# Step 4: Deploy API Gateway
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 4: Deploying API Gateway" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\03-gateway.yml" "API Gateway"

Write-Host "[INFO] Waiting for API Gateway to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 15
Wait-ForPods "app=api-gateway" 120

# Step 5: Deploy Keycloak
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 5: Deploying Keycloak" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\05-keycloak.yml" "Keycloak"

Write-Host "[INFO] Waiting for Keycloak to be ready..." -ForegroundColor Blue
Start-Sleep -Seconds 20
Wait-ForPods "app=keycloak" 180

# Step 6: Deploy all microservices
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 6: Deploying Microservices" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

$services = @(
    "user-service",
    "abonnement-service",
    "challenge-service",
    "planification-service",
    "event-service",
    "reservation-service",
    "recrutement-service",
    "club-service",
    "member-service",
    "forum-service",
    "formation-service",
    "quiz-badge-service",
    "pronunciation-fastapi",
    "pronunciation-service",
    "feedback-service"
)

foreach ($service in $services) {
    Write-Host "[INFO] Deploying $service..." -ForegroundColor Blue
    kubectl apply -f "$K8S_DIR\services\${service}.yml" | Out-Null
    Start-Sleep -Seconds 2
}

Write-Host "[SUCCESS] All microservices deployed" -ForegroundColor Green

# Step 7: Deploy frontend applications
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 7: Deploying Frontend Applications" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Deploy-Resource "$K8S_DIR\06-frontend.yml" "Frontend Application"
Deploy-Resource "$K8S_DIR\07-backoffice.yml" "Back-office Application"

# Step 8: Wait for all services to initialize
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Step 8: Waiting for Services to Initialize" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "[INFO] Waiting 60 seconds for all services to start..." -ForegroundColor Blue
Start-Sleep -Seconds 60

# Step 9: Display deployment status
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deployment Status" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Pods:" -ForegroundColor Cyan
kubectl get pods -n "$NAMESPACE"

Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
kubectl get services -n "$NAMESPACE"

Write-Host ""
Write-Host "Deployments:" -ForegroundColor Cyan
kubectl get deployments -n "$NAMESPACE"

# Step 10: Check for any issues
Write-Host ""
Write-Host "==========================================" -ForegroundColor Yellow
Write-Host "  Health Check" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

$notRunning = kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers 2>$null

if ($notRunning) {
    Write-Host "[WARNING] Found pod(s) not in Running state:" -ForegroundColor Yellow
    kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
    Write-Host ""
    Write-Host "To troubleshoot, run:" -ForegroundColor Yellow
    Write-Host "  kubectl describe pod <pod-name> -n $NAMESPACE" -ForegroundColor Yellow
    Write-Host "  kubectl logs <pod-name> -n $NAMESPACE" -ForegroundColor Yellow
}
else {
    Write-Host "[OK] All pods are running" -ForegroundColor Green
}

# Final summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Wordly platform has been deployed to your Kubernetes cluster" -ForegroundColor Green
Write-Host ""
Write-Host "Access your applications:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Using Port Forwarding:" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $NAMESPACE svc/frontend 4200:4200" -ForegroundColor White
Write-Host "   kubectl port-forward -n $NAMESPACE svc/backoffice 4201:4201" -ForegroundColor White
Write-Host "   kubectl port-forward -n $NAMESPACE svc/api-gateway 8888:8888" -ForegroundColor White
Write-Host "   kubectl port-forward -n $NAMESPACE svc/eureka-server 8761:8761" -ForegroundColor White
Write-Host ""
Write-Host "   Then access:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "   - Back-office: http://localhost:4201" -ForegroundColor White
Write-Host "   - API Gateway: http://localhost:8888" -ForegroundColor White
Write-Host "   - Eureka: http://localhost:8761" -ForegroundColor White
Write-Host ""
Write-Host "2. Using NodePort (if on kubeadm cluster):" -ForegroundColor Yellow
Write-Host "   kubectl apply -f ..\kubeadm\nodeport-services.yml" -ForegroundColor White
Write-Host "   Then access via: http://<node-ip>:<nodeport>" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  • View all resources:    kubectl get all -n $NAMESPACE" -ForegroundColor White
Write-Host "  • View logs:             kubectl logs -f deployment/<service-name> -n $NAMESPACE" -ForegroundColor White
Write-Host "  • View events:           kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'" -ForegroundColor White
Write-Host ""
