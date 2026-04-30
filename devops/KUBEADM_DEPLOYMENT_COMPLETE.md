# Kubeadm Deployment - Complete Setup

## ✅ What Has Been Created

### Directory Structure

```
devops/
├── kubeadm/                          # NEW: Kubeadm-specific files
│   ├── README.md                     # Complete deployment guide
│   ├── INSTALLATION.md               # Detailed installation steps
│   ├── KUBEADM_SUMMARY.md           # Quick reference guide
│   ├── setup-cluster.sh              # Automated cluster setup script
│   ├── deploy-wordly.sh              # Deploy Wordly platform
│   ├── cleanup-wordly.sh             # Cleanup script
│   ├── nodeport-services.yml         # NodePort service definitions
│   └── ingress.yml                   # Ingress configuration
│
├── k8s/                              # Kubernetes manifests
│   ├── services/                     # NEW: Individual service files
│   │   ├── user-service.yml
│   │   ├── abonnement-service.yml
│   │   ├── challenge-service.yml
│   │   ├── planification-service.yml
│   │   ├── event-service.yml
│   │   ├── reservation-service.yml
│   │   ├── recrutement-service.yml
│   │   ├── club-service.yml
│   │   ├── member-service.yml
│   │   ├── forum-service.yml
│   │   ├── formation-service.yml
│   │   ├── quiz-badge-service.yml
│   │   ├── pronunciation-fastapi.yml
│   │   ├── pronunciation-service.yml # NEW
│   │   └── feedback-service.yml      # NEW
│   │
│   ├── 00-namespace.yml
│   ├── 01-mysql.yml
│   ├── 02-eureka.yml
│   ├── 03-gateway.yml
│   ├── 04-microservices.yml          # Original (can be deprecated)
│   ├── 05-keycloak.yml
│   ├── 06-frontend.yml
│   ├── 07-backoffice.yml
│   ├── kustomization.yml             # NEW: Kustomize config
│   ├── deploy-all-services.sh        # NEW: Bash deployment script
│   └── deploy-all-services.ps1       # NEW: PowerShell deployment script
```

## 🚀 Quick Start

### Option 1: Complete Kubeadm Setup (From Scratch)

```bash
# 1. On Master Node - Setup Cluster
cd devops/kubeadm
chmod +x *.sh                    # Make scripts executable (Linux/Mac)
sudo ./setup-cluster.sh          # Setup kubeadm cluster

# 2. On Worker Nodes - Join Cluster (Optional)
sudo kubeadm join <master-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>

# 3. Verify Cluster
kubectl get nodes

# 4. Deploy Wordly Platform
./deploy-wordly.sh
```

### Option 2: Deploy to Existing Kubeadm Cluster

```bash
# If you already have a kubeadm cluster running
cd devops/kubeadm
./deploy-wordly.sh
```

### Option 3: Using Kustomize

```bash
# Deploy everything at once
kubectl apply -k devops/k8s/
```

### Option 4: Manual Deployment

```bash
# Deploy infrastructure
kubectl apply -f devops/k8s/00-namespace.yml
kubectl apply -f devops/k8s/01-mysql.yml
kubectl apply -f devops/k8s/02-eureka.yml
kubectl apply -f devops/k8s/03-gateway.yml
kubectl apply -f devops/k8s/05-keycloak.yml

# Deploy all microservices
kubectl apply -f devops/k8s/services/

# Deploy frontend
kubectl apply -f devops/k8s/06-frontend.yml
kubectl apply -f devops/k8s/07-backoffice.yml
```

## 📋 Deployment Scripts

### 1. setup-cluster.sh
**Purpose**: Automated kubeadm cluster initialization

**What it does**:
- Disables swap
- Loads kernel modules
- Installs containerd runtime
- Installs kubeadm, kubelet, kubectl
- Initializes Kubernetes cluster
- Installs Flannel CNI plugin
- Configures kubectl

**Usage**:
```bash
sudo ./setup-cluster.sh
```

### 2. deploy-wordly.sh
**Purpose**: Deploy Wordly platform to kubeadm cluster

**What it does**:
- Pre-flight checks (kubectl, cluster connectivity)
- Creates namespace
- Deploys MySQL databases
- Deploys Eureka Server
- Deploys API Gateway
- Deploys Keycloak
- Deploys all 15 microservices
- Deploys frontend applications
- Shows deployment status

**Usage**:
```bash
./deploy-wordly.sh
```

### 3. cleanup-wordly.sh
**Purpose**: Remove Wordly platform from cluster

**What it does**:
- Deletes wordly namespace
- Removes all resources
- Cleans up orphaned persistent volumes

**Usage**:
```bash
./cleanup-wordly.sh
```

## 🌐 Accessing Services

### Method 1: NodePort (Recommended for Kubeadm)

```bash
# Apply NodePort services
kubectl apply -f devops/kubeadm/nodeport-services.yml

# Get node IP
kubectl get nodes -o wide

# Access services:
# Frontend:     http://<node-ip>:30200
# Back-office:  http://<node-ip>:30201
# API Gateway:  http://<node-ip>:30888
# Eureka:       http://<node-ip>:30761
# Keycloak:     http://<node-ip>:30090
```

### Method 2: Ingress (Production)

```bash
# 1. Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# 2. Wait for ingress controller
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 3. Apply Wordly ingress
kubectl apply -f devops/kubeadm/ingress.yml

# 4. Add to /etc/hosts (on your local machine)
<node-ip> wordly.local api.wordly.local admin.wordly.local eureka.wordly.local keycloak.wordly.local

# 5. Access services:
# Frontend:     http://wordly.local
# Back-office:  http://admin.wordly.local
# API Gateway:  http://api.wordly.local
# Eureka:       http://eureka.wordly.local
# Keycloak:     http://keycloak.wordly.local
```

### Method 3: Port Forwarding (Development)

```bash
# Frontend
kubectl port-forward -n wordly svc/frontend 4200:4200

# Back-office
kubectl port-forward -n wordly svc/backoffice 4201:4201

# API Gateway
kubectl port-forward -n wordly svc/api-gateway 8888:8888

# Eureka
kubectl port-forward -n wordly svc/eureka-server 8761:8761
```

## 📊 Verification

### Check Deployment Status

```bash
# View all pods
kubectl get pods -n wordly

# View all services
kubectl get services -n wordly

# View all deployments
kubectl get deployments -n wordly

# View events
kubectl get events -n wordly --sort-by='.lastTimestamp'
```

### Check Individual Services

```bash
# View logs
kubectl logs -f deployment/user-service -n wordly

# Describe pod
kubectl describe pod <pod-name> -n wordly

# Check resource usage
kubectl top pods -n wordly
```

## 🔧 Common Operations

### Scale Services

```bash
# Scale manually
kubectl scale deployment user-service --replicas=3 -n wordly

# Auto-scale
kubectl autoscale deployment user-service \
    --cpu-percent=70 --min=2 --max=5 -n wordly
```

### Update Services

```bash
# Update image
kubectl set image deployment/user-service \
    user-service=your-dockerhub-username/user-service:v2 -n wordly

# Restart deployment
kubectl rollout restart deployment/user-service -n wordly

# Check rollout status
kubectl rollout status deployment/user-service -n wordly
```

### View Logs

```bash
# Tail logs
kubectl logs -f deployment/user-service -n wordly

# View last 100 lines
kubectl logs --tail=100 deployment/user-service -n wordly

# View previous logs (if crashed)
kubectl logs deployment/user-service -n wordly --previous
```

## 🏗️ Architecture

### Services Deployed

**Infrastructure (8 components)**:
- MySQL (main database)
- MySQL Formation
- MySQL Quiz
- MySQL Pronunciation
- MySQL Feedback
- Eureka Server (service discovery)
- API Gateway (routing)
- Keycloak (authentication)

**Microservices (15 services)**:
1. User Service (8085)
2. Abonnement Service (8084)
3. Challenge Service (8086)
4. Planification Service (8087)
5. Event Service (8082)
6. Reservation Service (8083)
7. Recrutement Service (8093)
8. Club Service (8089)
9. Member Service (8091)
10. Forum Service (8094)
11. Formation Service (8081)
12. Quiz Badge Service (8092)
13. Pronunciation FastAPI (8000)
14. Pronunciation Service (8095)
15. Feedback Service (8096)

**Frontend (2 applications)**:
- Frontend (4200)
- Back-office (4201)

**Total: 25 deployments + 25 services**

## 📚 Documentation

### Main Guides
- **`devops/kubeadm/README.md`** - Complete deployment guide with troubleshooting
- **`devops/kubeadm/INSTALLATION.md`** - Detailed kubeadm installation steps
- **`devops/kubeadm/KUBEADM_SUMMARY.md`** - Quick reference guide

### Configuration Files
- **`nodeport-services.yml`** - NodePort service definitions
- **`ingress.yml`** - Ingress rules for domain-based routing
- **`kustomization.yml`** - Kustomize configuration

## 🐛 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n wordly

# Describe pod
kubectl describe pod <pod-name> -n wordly

# View logs
kubectl logs <pod-name> -n wordly
```

### Database Connection Issues

```bash
# Check MySQL pods
kubectl get pods -l tier=database -n wordly

# Test MySQL connection
kubectl exec -it <mysql-pod> -n wordly -- mysql -uroot -proot -e "SHOW DATABASES;"
```

### Service Discovery Issues

```bash
# Check Eureka
kubectl port-forward -n wordly svc/eureka-server 8761:8761
# Visit http://localhost:8761

# Check if services are registered
kubectl logs deployment/eureka-server -n wordly
```

## 🧹 Cleanup

```bash
# Remove Wordly platform
cd devops/kubeadm
./cleanup-wordly.sh

# Or manually
kubectl delete namespace wordly
```

## 📝 Notes

### Windows Users
- The shell scripts (.sh) are for Linux/Mac
- Use Git Bash or WSL to run the scripts on Windows
- Or manually execute the kubectl commands from the scripts

### Script Permissions
On Linux/Mac, make scripts executable:
```bash
chmod +x devops/kubeadm/*.sh
```

### Docker Hub Images
Replace `your-dockerhub-username` in YAML files with your actual Docker Hub username:
```bash
# Find and replace
find devops/k8s -name "*.yml" -exec sed -i 's/your-dockerhub-username/actual-username/g' {} +
```

## ✨ What's New

### Individual Service Files
Each microservice now has its own YAML file in `devops/k8s/services/`:
- Easier to manage and update individual services
- Better organization
- Supports independent deployment
- Enhanced with resource limits and health checks

### Kubeadm Support
Complete kubeadm deployment support:
- Automated cluster setup script
- Deployment automation
- NodePort and Ingress configurations
- Comprehensive documentation

### Deployment Options
Multiple ways to deploy:
1. Automated script (`deploy-wordly.sh`)
2. Kustomize (`kubectl apply -k`)
3. Individual files
4. PowerShell script (Windows)

## 🎯 Next Steps

1. **Deploy the cluster**:
   ```bash
   cd devops/kubeadm
   sudo ./setup-cluster.sh
   ```

2. **Deploy Wordly**:
   ```bash
   ./deploy-wordly.sh
   ```

3. **Access services**:
   ```bash
   kubectl apply -f nodeport-services.yml
   ```

4. **Monitor**:
   ```bash
   kubectl get pods -n wordly -w
   ```

## 📞 Support

For issues:
1. Check pod logs: `kubectl logs <pod-name> -n wordly`
2. Check events: `kubectl get events -n wordly`
3. Describe resources: `kubectl describe <resource> <name> -n wordly`
4. Review documentation in `devops/kubeadm/`

---

**Ready to deploy!** 🚀
