# Kubeadm Deployment on Windows

## Important Note

**Kubeadm is designed for Linux systems.** The shell scripts (`.sh` files) in this directory are meant to be run on Linux machines where you'll set up your Kubernetes cluster.

## Your Options on Windows

### Option 1: Use WSL2 (Windows Subsystem for Linux) - RECOMMENDED

WSL2 allows you to run a full Linux environment on Windows.

#### Setup WSL2:

```powershell
# 1. Enable WSL2 (run PowerShell as Administrator)
wsl --install

# 2. Restart your computer

# 3. Install Ubuntu from Microsoft Store
# Or use command:
wsl --install -d Ubuntu-22.04

# 4. Set up your Linux user when prompted
```

#### Use the Scripts in WSL2:

```bash
# Open WSL2 terminal (Ubuntu)
cd /mnt/c/Users/marwe/Desktop/"Nouveau dossier"/devops/kubeadm

# Make scripts executable
chmod +x *.sh

# Run the setup script
sudo ./setup-cluster.sh
```

### Option 2: Use Git Bash

Git Bash provides a bash-like environment on Windows.

#### Install Git Bash:
1. Download from: https://git-scm.com/download/win
2. Install with default options

#### Use the Scripts:

```bash
# Open Git Bash
cd /c/Users/marwe/Desktop/"Nouveau dossier"/devops/kubeadm

# Run the setup script
bash setup-cluster.sh
```

**Note**: Some commands may not work perfectly in Git Bash as it's not a full Linux environment.

### Option 3: Deploy to Remote Linux Server

The most common approach is to:
1. Set up Linux VMs (Ubuntu/CentOS) on cloud or local servers
2. Copy the scripts to those servers
3. Run the scripts there

#### Using SCP to Copy Files:

```powershell
# From Windows PowerShell
scp -r devops/kubeadm user@your-linux-server:/home/user/
```

#### Then SSH and Run:

```bash
ssh user@your-linux-server
cd /home/user/kubeadm
chmod +x *.sh
sudo ./setup-cluster.sh
```

### Option 4: Use Docker Desktop with Kubernetes

Docker Desktop for Windows includes Kubernetes support.

#### Enable Kubernetes in Docker Desktop:
1. Open Docker Desktop
2. Go to Settings → Kubernetes
3. Check "Enable Kubernetes"
4. Click "Apply & Restart"

#### Deploy Wordly Using kubectl:

```powershell
# Navigate to k8s directory
cd C:\Users\marwe\Desktop\"Nouveau dossier"\devops\k8s

# Deploy using kubectl (no bash scripts needed)
kubectl apply -f 00-namespace.yml
kubectl apply -f 01-mysql.yml
kubectl apply -f 02-eureka.yml
kubectl apply -f 03-gateway.yml
kubectl apply -f 05-keycloak.yml
kubectl apply -f services/
kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml

# Check status
kubectl get pods -n wordly
```

### Option 5: Use Minikube on Windows

Minikube is a lightweight Kubernetes for local development.

#### Install Minikube:

```powershell
# Using Chocolatey
choco install minikube

# Or download from: https://minikube.sigs.k8s.io/docs/start/
```

#### Start Minikube:

```powershell
# Start minikube
minikube start --driver=hyperv
# Or
minikube start --driver=docker

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server
```

#### Deploy Wordly:

```powershell
cd C:\Users\marwe\Desktop\"Nouveau dossier"\devops\k8s

kubectl apply -f 00-namespace.yml
kubectl apply -f 01-mysql.yml
kubectl apply -f 02-eureka.yml
kubectl apply -f 03-gateway.yml
kubectl apply -f 05-keycloak.yml
kubectl apply -f services/
kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml
```

## Recommended Approach for Production

For a real kubeadm cluster (production or learning):

### 1. Set Up Linux VMs

**Option A: Cloud Providers**
- AWS EC2 (Ubuntu 22.04)
- Google Cloud Compute Engine
- Azure Virtual Machines
- DigitalOcean Droplets

**Option B: Local VMs**
- VirtualBox + Ubuntu
- VMware + Ubuntu
- Hyper-V + Ubuntu

### 2. VM Requirements

**Master Node:**
- 2 CPU cores (4 recommended)
- 4GB RAM (8GB recommended)
- 20GB disk
- Ubuntu 22.04 LTS

**Worker Nodes (each):**
- 2 CPU cores
- 4GB RAM
- 20GB disk
- Ubuntu 22.04 LTS

### 3. Deploy Using Scripts

```bash
# On Master Node
git clone <your-repo>
cd devops/kubeadm
chmod +x *.sh
sudo ./setup-cluster.sh

# Save the join command!

# On Worker Nodes
sudo kubeadm join <master-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>

# Back on Master
./deploy-wordly.sh
```

## Quick Windows Deployment (Docker Desktop)

If you just want to test locally on Windows:

### 1. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop/

### 2. Enable Kubernetes
Settings → Kubernetes → Enable Kubernetes

### 3. Deploy Wordly

```powershell
# PowerShell script for Windows
cd C:\Users\marwe\Desktop\"Nouveau dossier"\devops\k8s

# Create namespace
kubectl apply -f 00-namespace.yml

# Deploy infrastructure
kubectl apply -f 01-mysql.yml
Start-Sleep -Seconds 30

kubectl apply -f 02-eureka.yml
Start-Sleep -Seconds 20

kubectl apply -f 03-gateway.yml
kubectl apply -f 05-keycloak.yml

# Deploy all microservices
kubectl apply -f services/

# Deploy frontend
kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml

# Check status
kubectl get pods -n wordly -w
```

### 4. Access Services

```powershell
# Port forward to access services
kubectl port-forward -n wordly svc/frontend 4200:4200
kubectl port-forward -n wordly svc/backoffice 4201:4201
kubectl port-forward -n wordly svc/api-gateway 8888:8888
```

Then access:
- Frontend: http://localhost:4200
- Back-office: http://localhost:4201
- API Gateway: http://localhost:8888

## PowerShell Deployment Script

I've created a PowerShell version for you:

```powershell
# Use the existing PowerShell script
cd C:\Users\marwe\Desktop\"Nouveau dossier"\devops\k8s
.\deploy-all-services.ps1
```

## Summary

**For Learning/Testing on Windows:**
- Use Docker Desktop with Kubernetes (easiest)
- Or use Minikube

**For Production/Real Kubeadm:**
- Use WSL2 for running scripts locally
- Or deploy to Linux VMs (cloud or local)

**The bash scripts are meant for Linux**, but you can deploy manually using kubectl commands on Windows.

## Need Help?

Choose your scenario:
1. **Just want to test locally** → Use Docker Desktop + kubectl commands
2. **Want to learn kubeadm** → Set up Linux VMs or use WSL2
3. **Production deployment** → Use cloud Linux VMs + bash scripts

Let me know which path you want to take, and I can provide more specific guidance!
