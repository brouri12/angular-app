# Kubeadm Deployment Summary

## Overview

Complete kubeadm setup for deploying the Wordly microservices platform on a self-managed Kubernetes cluster.

## Files Created

### 📋 Documentation
- **`README.md`** - Complete deployment guide with troubleshooting
- **`INSTALLATION.md`** - Detailed installation steps for kubeadm cluster
- **`KUBEADM_SUMMARY.md`** - This file (quick reference)

### 🚀 Deployment Scripts
- **`setup-cluster.sh`** - Automated kubeadm cluster setup (master node)
- **`deploy-wordly.sh`** - Deploy Wordly platform to cluster
- **`cleanup-wordly.sh`** - Remove Wordly platform from cluster

### ⚙️ Configuration Files
- **`nodeport-services.yml`** - NodePort services for external access
- **`ingress.yml`** - Ingress configuration for domain-based routing
- **`kustomization.yml`** - Kustomize configuration (in parent k8s directory)

## Quick Start Guide

### 1. Setup Kubernetes Cluster

```bash
# On Master Node
cd devops/kubeadm
sudo ./setup-cluster.sh
```

**What it does:**
- Disables swap
- Installs containerd runtime
- Installs kubeadm, kubelet, kubectl
- Initializes Kubernetes cluster
- Installs Flannel CNI plugin
- Configures kubectl

**Save the join command** for worker nodes!

### 2. Join Worker Nodes (Optional)

```bash
# On each worker node
sudo kubeadm join <master-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

### 3. Verify Cluster

```bash
# On master node
kubectl get nodes
kubectl get pods -A
```

All nodes should show `Ready` status.

### 4. Deploy Wordly Platform

```bash
# On master node
cd devops/kubeadm
./deploy-wordly.sh
```

**Deployment order:**
1. Namespace creation
2. MySQL databases (5 instances)
3. Eureka Server (service discovery)
4. API Gateway
5. Keycloak (authentication)
6. 15 Microservices
7. Frontend applications

### 5. Access Applications

#### Option A: NodePort (Easiest)

```bash
kubectl apply -f nodeport-services.yml

# Access at:
# Frontend: http://<node-ip>:30200
# Back-office: http://<node-ip>:30201
# API Gateway: http://<node-ip>:30888
# Eureka: http://<node-ip>:30761
# Keycloak: http://<node-ip>:30090
```

#### Option B: Ingress (Production)

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# Deploy Wordly Ingress
kubectl apply -f ingress.yml

# Add to /etc/hosts:
<node-ip> wordly.local api.wordly.local admin.wordly.local eureka.wordly.local keycloak.wordly.local

# Access at:
# Frontend: http://wordly.local
# Back-office: http://admin.wordly.local
# API Gateway: http://api.wordly.local
```

#### Option C: Port Forwarding (Development)

```bash
kubectl port-forward -n wordly svc/frontend 4200:4200
kubectl port-forward -n wordly svc/api-gateway 8888:8888
```

## Architecture

### Cluster Components

```
┌─────────────────────────────────────────────────────────┐
│                    Master Node                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ API Server   │  │   Scheduler  │  │  Controller  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │    etcd      │  │   kubelet    │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│ Worker Node 1│  │ Worker Node 2│  │ Worker Node 3│
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │kubelet │  │  │  │kubelet │  │  │  │kubelet │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
│  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │
│  │ Pods   │  │  │  │ Pods   │  │  │  │ Pods   │  │
│  └────────┘  │  │  └────────┘  │  │  └────────┘  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Wordly Services Deployed

**Infrastructure (5 services):**
- MySQL (main) - Port 3306
- MySQL Formation - Port 3306
- MySQL Quiz - Port 3306
- MySQL Pronunciation - Port 3306
- MySQL Feedback - Port 3306
- Eureka Server - Port 8761
- API Gateway - Port 8888
- Keycloak - Port 9090

**Microservices (15 services):**
1. User Service - Port 8085
2. Abonnement Service - Port 8084
3. Challenge Service - Port 8086
4. Planification Service - Port 8087
5. Event Service - Port 8082
6. Reservation Service - Port 8083
7. Recrutement Service - Port 8093
8. Club Service - Port 8089
9. Member Service - Port 8091
10. Forum Service - Port 8094
11. Formation Service - Port 8081
12. Quiz Badge Service - Port 8092
13. Pronunciation FastAPI - Port 8000
14. Pronunciation Service - Port 8095
15. Feedback Service - Port 8096

**Frontend (2 applications):**
- Frontend - Port 4200
- Back-office - Port 4201

## Common Commands

### Cluster Management

```bash
# View cluster info
kubectl cluster-info

# View nodes
kubectl get nodes -o wide

# View all resources
kubectl get all -n wordly

# View events
kubectl get events -n wordly --sort-by='.lastTimestamp'
```

### Service Management

```bash
# View pods
kubectl get pods -n wordly

# View services
kubectl get services -n wordly

# View logs
kubectl logs -f deployment/<service-name> -n wordly

# Describe pod
kubectl describe pod <pod-name> -n wordly

# Execute command in pod
kubectl exec -it <pod-name> -n wordly -- bash
```

### Scaling

```bash
# Scale deployment
kubectl scale deployment user-service --replicas=3 -n wordly

# Auto-scale
kubectl autoscale deployment user-service \
    --cpu-percent=70 --min=2 --max=5 -n wordly

# View HPA
kubectl get hpa -n wordly
```

### Updates

```bash
# Update image
kubectl set image deployment/user-service \
    user-service=your-dockerhub-username/user-service:v2 -n wordly

# Restart deployment
kubectl rollout restart deployment/user-service -n wordly

# Check rollout status
kubectl rollout status deployment/user-service -n wordly

# Rollback
kubectl rollout undo deployment/user-service -n wordly
```

### Troubleshooting

```bash
# Check pod status
kubectl get pods -n wordly

# View pod logs
kubectl logs <pod-name> -n wordly

# View previous logs (if crashed)
kubectl logs <pod-name> -n wordly --previous

# Describe pod (see events)
kubectl describe pod <pod-name> -n wordly

# Check resource usage
kubectl top nodes
kubectl top pods -n wordly

# Test connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n wordly -- sh
```

## System Requirements

### Minimum (Development/Testing)
- **Single Node**: 4 CPU, 8GB RAM, 50GB disk
- **Multi-Node**: Master (2 CPU, 4GB RAM) + 2 Workers (2 CPU, 4GB RAM each)

### Recommended (Production)
- **Master Nodes**: 3 nodes (4 CPU, 8GB RAM, 100GB disk each)
- **Worker Nodes**: 3+ nodes (4 CPU, 8GB RAM, 100GB disk each)
- **Load Balancer**: For API server and ingress

## Network Ports

### Kubernetes Control Plane
- 6443: Kubernetes API server
- 2379-2380: etcd server client API
- 10250: Kubelet API
- 10259: kube-scheduler
- 10257: kube-controller-manager

### Kubernetes Worker Nodes
- 10250: Kubelet API
- 30000-32767: NodePort Services

### Wordly Application Ports
- See "Wordly Services Deployed" section above

## Cleanup

```bash
# Remove Wordly platform
./cleanup-wordly.sh

# Or manually
kubectl delete namespace wordly

# Reset entire cluster (WARNING: Destructive!)
sudo kubeadm reset -f
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube/config
```

## Next Steps

1. **Configure Persistent Storage**
   - Set up NFS or Ceph for production
   - Update PV/PVC configurations

2. **Enable Monitoring**
   - Deploy Prometheus and Grafana
   - Configure alerts

3. **Implement Backup Strategy**
   - Backup etcd regularly
   - Backup application data

4. **Security Hardening**
   - Enable RBAC
   - Use network policies
   - Implement pod security policies
   - Use secrets for sensitive data

5. **High Availability**
   - Add more master nodes
   - Use external load balancer
   - Configure pod disruption budgets

## Support

For detailed documentation:
- **Installation**: See `INSTALLATION.md`
- **Deployment**: See `README.md`
- **Kubernetes Docs**: https://kubernetes.io/docs/

For troubleshooting:
- Check pod logs: `kubectl logs <pod-name> -n wordly`
- Check events: `kubectl get events -n wordly`
- Describe resources: `kubectl describe <resource> <name> -n wordly`
