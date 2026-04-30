#!/bin/bash

# ============================================================
#  Deploy All Wordly Microservices to Kubernetes
# ============================================================

set -e  # Exit on error

echo "=========================================="
echo "  Deploying Wordly Microservices"
echo "=========================================="

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to deploy a service
deploy_service() {
    local service_file=$1
    local service_name=$(basename "$service_file" .yml)
    
    echo -e "${BLUE}[INFO]${NC} Deploying ${service_name}..."
    
    if kubectl apply -f "$service_file"; then
        echo -e "${GREEN}[SUCCESS]${NC} ${service_name} deployed successfully"
    else
        echo -e "${RED}[ERROR]${NC} Failed to deploy ${service_name}"
        return 1
    fi
}

# Step 1: Deploy infrastructure (MySQL, Eureka, Gateway, Keycloak)
echo ""
echo "Step 1: Deploying Infrastructure..."
echo "------------------------------------"

kubectl apply -f 00-namespace.yml
kubectl apply -f 01-mysql.yml
kubectl apply -f 02-eureka.yml
kubectl apply -f 03-gateway.yml
kubectl apply -f 05-keycloak.yml

echo -e "${GREEN}[SUCCESS]${NC} Infrastructure deployed"

# Step 2: Wait for infrastructure to be ready
echo ""
echo "Step 2: Waiting for infrastructure to be ready..."
echo "--------------------------------------------------"
echo "Waiting 60 seconds for MySQL and Eureka to initialize..."
sleep 60

# Step 3: Deploy all microservices
echo ""
echo "Step 3: Deploying Microservices..."
echo "-----------------------------------"

# Array of service files in deployment order
services=(
    "services/user-service.yml"
    "services/abonnement-service.yml"
    "services/challenge-service.yml"
    "services/planification-service.yml"
    "services/event-service.yml"
    "services/reservation-service.yml"
    "services/recrutement-service.yml"
    "services/club-service.yml"
    "services/member-service.yml"
    "services/forum-service.yml"
    "services/formation-service.yml"
    "services/quiz-badge-service.yml"
    "services/pronunciation-fastapi.yml"
    "services/pronunciation-service.yml"
    "services/feedback-service.yml"
)

# Deploy each service
for service in "${services[@]}"; do
    deploy_service "$service"
    sleep 2  # Small delay between deployments
done

# Step 4: Deploy frontend applications
echo ""
echo "Step 4: Deploying Frontend Applications..."
echo "-------------------------------------------"

kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml

echo -e "${GREEN}[SUCCESS]${NC} Frontend applications deployed"

# Step 5: Display deployment status
echo ""
echo "=========================================="
echo "  Deployment Summary"
echo "=========================================="
echo ""
echo "Checking pod status..."
kubectl get pods -n wordly

echo ""
echo "Checking service status..."
kubectl get services -n wordly

echo ""
echo -e "${GREEN}[COMPLETE]${NC} All services have been deployed!"
echo ""
echo "To check the status of your deployments, run:"
echo "  kubectl get pods -n wordly"
echo "  kubectl get services -n wordly"
echo ""
echo "To view logs for a specific service, run:"
echo "  kubectl logs -f deployment/<service-name> -n wordly"
echo ""
echo "To access the applications:"
echo "  - Frontend: http://localhost:4200"
echo "  - Back-office: http://localhost:4201"
echo "  - API Gateway: http://localhost:8888"
echo "  - Eureka Dashboard: http://localhost:8761"
echo ""
