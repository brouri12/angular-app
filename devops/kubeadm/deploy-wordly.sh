#!/bin/bash

# ============================================================
#  Deploy Wordly Platform on Kubeadm Cluster
# ============================================================

set -e  # Exit on error

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="wordly"
K8S_DIR="../k8s"
TIMEOUT=300

echo -e "${BLUE}=========================================="
echo "  Wordly Platform Deployment"
echo "  Target: Kubeadm Cluster"
echo -e "==========================================${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}=========================================="
    echo "  $1"
    echo -e "==========================================${NC}"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} kubectl not found. Please install kubectl first."
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} kubectl is installed"
}

# Function to check cluster connectivity
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        echo -e "${RED}[ERROR]${NC} Cannot connect to Kubernetes cluster."
        echo "Please ensure your kubeadm cluster is running and kubectl is configured."
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Connected to Kubernetes cluster"
    
    # Display cluster info
    echo ""
    echo "Cluster nodes:"
    kubectl get nodes
    echo ""
}

# Function to wait for pods to be ready
wait_for_pods() {
    local label=$1
    local timeout=$2
    
    echo -e "${BLUE}[INFO]${NC} Waiting for pods with label $label to be ready..."
    
    if kubectl wait --for=condition=ready pod -l "$label" -n "$NAMESPACE" --timeout="${timeout}s" 2>/dev/null; then
        echo -e "${GREEN}[SUCCESS]${NC} Pods are ready"
        return 0
    else
        echo -e "${YELLOW}[WARNING]${NC} Timeout waiting for pods. Continuing anyway..."
        return 1
    fi
}

# Function to deploy a resource
deploy_resource() {
    local resource=$1
    local description=$2
    
    echo -e "${BLUE}[INFO]${NC} Deploying $description..."
    
    if kubectl apply -f "$resource"; then
        echo -e "${GREEN}[SUCCESS]${NC} $description deployed"
        return 0
    else
        echo -e "${RED}[ERROR]${NC} Failed to deploy $description"
        return 1
    fi
}

# Pre-flight checks
print_section "Pre-flight Checks"
check_kubectl
check_cluster

# Step 1: Create namespace
print_section "Step 1: Creating Namespace"
deploy_resource "$K8S_DIR/00-namespace.yml" "Namespace"

# Step 2: Deploy MySQL databases
print_section "Step 2: Deploying MySQL Databases"
deploy_resource "$K8S_DIR/01-mysql.yml" "MySQL Databases"

echo -e "${BLUE}[INFO]${NC} Waiting for MySQL pods to be ready (this may take a few minutes)..."
sleep 30
wait_for_pods "tier=database" 300

# Step 3: Deploy Eureka Server
print_section "Step 3: Deploying Eureka Server"
deploy_resource "$K8S_DIR/02-eureka.yml" "Eureka Server"

echo -e "${BLUE}[INFO]${NC} Waiting for Eureka Server to be ready..."
sleep 20
wait_for_pods "app=eureka-server" 180

# Step 4: Deploy API Gateway
print_section "Step 4: Deploying API Gateway"
deploy_resource "$K8S_DIR/03-gateway.yml" "API Gateway"

echo -e "${BLUE}[INFO]${NC} Waiting for API Gateway to be ready..."
sleep 15
wait_for_pods "app=api-gateway" 120

# Step 5: Deploy Keycloak
print_section "Step 5: Deploying Keycloak"
deploy_resource "$K8S_DIR/05-keycloak.yml" "Keycloak"

echo -e "${BLUE}[INFO]${NC} Waiting for Keycloak to be ready..."
sleep 20
wait_for_pods "app=keycloak" 180

# Step 6: Deploy all microservices
print_section "Step 6: Deploying Microservices"

services=(
    "user-service"
    "abonnement-service"
    "challenge-service"
    "planification-service"
    "event-service"
    "reservation-service"
    "recrutement-service"
    "club-service"
    "member-service"
    "forum-service"
    "formation-service"
    "quiz-badge-service"
    "pronunciation-fastapi"
    "pronunciation-service"
    "feedback-service"
)

for service in "${services[@]}"; do
    echo -e "${BLUE}[INFO]${NC} Deploying $service..."
    kubectl apply -f "$K8S_DIR/services/${service}.yml"
    sleep 2
done

echo -e "${GREEN}[SUCCESS]${NC} All microservices deployed"

# Step 7: Deploy frontend applications
print_section "Step 7: Deploying Frontend Applications"
deploy_resource "$K8S_DIR/06-frontend.yml" "Frontend Application"
deploy_resource "$K8S_DIR/07-backoffice.yml" "Back-office Application"

# Step 8: Wait for all services to be ready
print_section "Step 8: Waiting for Services to Initialize"
echo -e "${BLUE}[INFO]${NC} Waiting 60 seconds for all services to start..."
sleep 60

# Step 9: Display deployment status
print_section "Deployment Status"

echo ""
echo "Pods:"
kubectl get pods -n "$NAMESPACE"

echo ""
echo "Services:"
kubectl get services -n "$NAMESPACE"

echo ""
echo "Deployments:"
kubectl get deployments -n "$NAMESPACE"

# Step 10: Check for any issues
print_section "Health Check"

echo -e "${BLUE}[INFO]${NC} Checking for pods not in Running state..."
NOT_RUNNING=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers 2>/dev/null | wc -l)

if [ "$NOT_RUNNING" -gt 0 ]; then
    echo -e "${YELLOW}[WARNING]${NC} Found $NOT_RUNNING pod(s) not in Running state:"
    kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
    echo ""
    echo "To troubleshoot, run:"
    echo "  kubectl describe pod <pod-name> -n $NAMESPACE"
    echo "  kubectl logs <pod-name> -n $NAMESPACE"
else
    echo -e "${GREEN}[OK]${NC} All pods are running"
fi

# Final summary
print_section "Deployment Complete!"

echo ""
echo -e "${GREEN}✓${NC} Wordly platform has been deployed to your kubeadm cluster"
echo ""
echo "Access your applications:"
echo ""
echo "1. Using Port Forwarding (for testing):"
echo "   ${BLUE}kubectl port-forward -n $NAMESPACE svc/frontend 4200:4200${NC}"
echo "   ${BLUE}kubectl port-forward -n $NAMESPACE svc/backoffice 4201:4201${NC}"
echo "   ${BLUE}kubectl port-forward -n $NAMESPACE svc/api-gateway 8888:8888${NC}"
echo "   ${BLUE}kubectl port-forward -n $NAMESPACE svc/eureka-server 8761:8761${NC}"
echo ""
echo "2. Using NodePort (recommended):"
echo "   ${BLUE}kubectl apply -f nodeport-services.yml${NC}"
echo "   Then access via: http://<node-ip>:<nodeport>"
echo ""
echo "3. Using Ingress (production):"
echo "   ${BLUE}kubectl apply -f ingress.yml${NC}"
echo ""
echo "Useful commands:"
echo "  • View all resources:    ${BLUE}kubectl get all -n $NAMESPACE${NC}"
echo "  • View logs:             ${BLUE}kubectl logs -f deployment/<service-name> -n $NAMESPACE${NC}"
echo "  • View events:           ${BLUE}kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'${NC}"
echo "  • Scale service:         ${BLUE}kubectl scale deployment <service-name> --replicas=3 -n $NAMESPACE${NC}"
echo ""
echo "For detailed documentation, see: ${BLUE}devops/kubeadm/README.md${NC}"
echo ""
