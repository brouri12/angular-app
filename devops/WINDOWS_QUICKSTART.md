# Windows Quick Start Guide

## You're on Windows - Here's What to Do

Since you're running Windows, the bash scripts (`.sh` files) won't work directly in PowerShell. Here are your options:

## ✅ EASIEST: Use Docker Desktop (Local Testing)

### Step 1: Install Docker Desktop
1. Download: https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Open Docker Desktop

### Step 2: Enable Kubernetes
1. Open Docker Desktop
2. Click Settings (gear icon)
3. Go to "Kubernetes" tab
4. Check "Enable Kubernetes"
5. Click "Apply & Restart"
6. Wait for Kubernetes to start (green indicator)

### Step 3: Deploy Wordly

Open PowerShell and run:

```powershell
# Navigate to your project
cd "C:\Users\marwe\Desktop\Nouveau dossier"

# Use the PowerShell deployment script
cd devops\k8s
.\deploy-all-services.ps1
```

### Step 4: Access Your Applications

```powershell
# Port forward to access services
kubectl port-forward -n wordly svc/frontend 4200:4200
# Open browser: http://localhost:4200

# In another PowerShell window:
kubectl port-forward -n wordly svc/backoffice 4201:4201
# Open browser: http://localhost:4201

# In another PowerShell window:
kubectl port-forward -n wordly svc/api-gateway 8888:8888
# Open browser: http://localhost:8888
```

## 🔧 ALTERNATIVE: Manual Deployment

If the PowerShell script doesn't work, deploy manually:

```powershell
cd "C:\Users\marwe\Desktop\Nouveau dossier\devops\k8s"

# 1. Create namespace
kubectl apply -f 00-namespace.yml

# 2. Deploy databases
kubectl apply -f 01-mysql.yml
Start-Sleep -Seconds 30

# 3. Deploy Eureka
kubectl apply -f 02-eureka.yml
Start-Sleep -Seconds 20

# 4. Deploy Gateway
kubectl apply -f 03-gateway.yml

# 5. Deploy Keycloak
kubectl apply -f 05-keycloak.yml

# 6. Deploy all microservices
kubectl apply -f services\

# 7. Deploy frontend
kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml

# 8. Check status
kubectl get pods -n wordly
```

## 🐧 FOR REAL KUBEADM: Use WSL2 or Linux VMs

The kubeadm scripts are designed for Linux. To use them:

### Option A: WSL2 (Windows Subsystem for Linux)

```powershell
# Install WSL2 (PowerShell as Administrator)
wsl --install

# Restart computer, then:
wsl --install -d Ubuntu-22.04

# Open Ubuntu terminal and navigate to your project
cd /mnt/c/Users/marwe/Desktop/"Nouveau dossier"/devops/kubeadm

# Make scripts executable
chmod +x *.sh

# Run setup
sudo ./setup-cluster.sh
```

### Option B: Linux VMs

1. Create Ubuntu 22.04 VMs (cloud or local)
2. Copy scripts to VMs
3. Run `setup-cluster.sh` on master node
4. Run `deploy-wordly.sh` to deploy

## 📊 Check Your Deployment

```powershell
# View all pods
kubectl get pods -n wordly

# View all services
kubectl get services -n wordly

# View logs for a service
kubectl logs -f deployment/user-service -n wordly

# View events
kubectl get events -n wordly --sort-by='.lastTimestamp'
```

## 🧹 Cleanup

```powershell
# Remove everything
kubectl delete namespace wordly
```

## ❓ Which Option Should You Choose?

**Just want to test the application?**
→ Use Docker Desktop (easiest)

**Want to learn Kubernetes/kubeadm?**
→ Use WSL2 or create Linux VMs

**Production deployment?**
→ Use cloud Linux VMs with kubeadm scripts

## 🆘 Troubleshooting

### Docker Desktop Kubernetes not starting
- Restart Docker Desktop
- Check you have enough resources (Settings → Resources)
- Try: `wsl --shutdown` then restart Docker Desktop

### kubectl not found
```powershell
# Install kubectl
choco install kubernetes-cli
# Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

### Pods stuck in Pending
```powershell
# Check pod details
kubectl describe pod <pod-name> -n wordly

# Check if it's a resource issue
kubectl top nodes
```

### Can't access services
```powershell
# Make sure port-forward is running
kubectl port-forward -n wordly svc/frontend 4200:4200

# Check if pods are running
kubectl get pods -n wordly
```

## 📚 More Information

- **Windows Guide**: `devops/kubeadm/WINDOWS_GUIDE.md`
- **Full Documentation**: `devops/kubeadm/README.md`
- **Kubeadm Installation**: `devops/kubeadm/INSTALLATION.md`

---

**Ready to start?** Use Docker Desktop + PowerShell script for the easiest experience! 🚀
