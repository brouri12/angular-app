# Kubeadm Deployment Guide for Wordly Platform

This guide provides step-by-step instructions for deploying the Wordly microservices platform on a Kubernetes cluster managed by kubeadm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cluster Setup](#cluster-setup)
3. [Deploy Wordly Platform](#deploy-wordly-platform)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Hardware Requirements

**Master Node:**
- 2 CPU cores minimum (4 recommended)
- 4GB RAM minimum (8GB recommended)
- 20GB disk space

**Worker Nodes (per node):**
- 2 CPU cores minimum
- 4GB RAM minimum (8GB recommended for running microservices)
- 20GB disk space

### Software Requirements

- Ubuntu 20.04/22.04 or CentOS 7/8
- Docker or containerd runtime
- kubeadm, kubelet, kubectl (v1.28+)
- Network connectivity between all nodes

## Cluster Setup

### Step 1: Initialize Kubeadm Cluster

If you haven't set up your cluster yet, follow these steps:

#### On Master Node:

```bash
# Initialize the cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Set up kubectl for your user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Install a CNI plugin (Flannel example)
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

#### On Worker Nodes:

```bash
# Join the cluster (use the command from kubeadm init output)
sudo kubeadm join <master-ip>:6443 --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### Step 2: Verify Cluster

```bash
# Check nodes
kubectl get nodes

# All nodes should be in Ready state
```

## Deploy Wordly Platform

### Option 1: Automated Deployment (Recommended)

```bash
# Navigate to kubeadm directory
cd devops/kubeadm

# Make scripts executable
chmod +x *.sh

# Deploy everything
./deploy-wordly.sh
```

### Option 2: Manual Step-by-Step Deployment

```bash
# 1. Create namespace
kubectl apply -f ../k8s/00-namespace.yml

# 2. Deploy databases
kubectl apply -f ../k8s/01-mysql.yml

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n wordly --timeout=300s

# 3. Deploy Eureka Server
kubectl apply -f ../k8s/02-eureka.yml

# Wait for Eureka to be ready
kubectl wait --for=condition=ready pod -l app=eureka-server -n wordly --timeout=300s

# 4. Deploy API Gateway
kubectl apply -f ../k8s/03-gateway.yml

# 5. Deploy Keycloak
kubectl apply -f ../k8s/05-keycloak.yml

# 6. Deploy all microservices
kubectl apply -f ../k8s/services/

# 7. Deploy frontend applications
kubectl apply -f ../k8s/06-frontend.yml
kubectl apply -f ../k8s/07-backoffice.yml
```

### Option 3: Using Kustomize

```bash
# Deploy all resources at once
kubectl apply -k ../k8s/
```

## Accessing Services

### Using NodePort

By default, services are configured as ClusterIP. To expose them via NodePort:

```bash
# Apply NodePort configurations
kubectl apply -f nodeport-services.yml
```

Access services at: `http://<any-node-ip>:<nodeport>`

### Using Ingress (Recommended for Production)

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# Deploy Wordly Ingress
kubectl apply -f ingress.yml
```

Access services at: `http://wordly.local` (add to /etc/hosts)

### Using Port Forwarding (Development)

```bash
# Frontend
kubectl port-forward -n wordly svc/frontend 4200:4200

# Back-office
kubectl port-forward -n wordly svc/backoffice 4201:4201

# API Gateway
kubectl port-forward -n wordly svc/api-gateway 8888:8888

# Eureka Dashboard
kubectl port-forward -n wordly svc/eureka-server 8761:8761
```

## Verification

### Check Deployment Status

```bash
# Check all pods
kubectl get pods -n wordly

# Check all services
kubectl get services -n wordly

# Check deployments
kubectl get deployments -n wordly

# Check persistent volumes
kubectl get pv,pvc -n wordly
```

### View Logs

```bash
# View logs for a specific service
kubectl logs -f deployment/<service-name> -n wordly

# Example: View API Gateway logs
kubectl logs -f deployment/api-gateway -n wordly

# View logs for all pods with a label
kubectl logs -l app=user-service -n wordly --tail=100
```

### Test Service Connectivity

```bash
# Test from within the cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n wordly -- sh

# Inside the pod, test services:
curl http://eureka-server:8761
curl http://api-gateway:8888/actuator/health
```

## Monitoring

### Check Resource Usage

```bash
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n wordly

# Describe a pod for detailed info
kubectl describe pod <pod-name> -n wordly
```

## Scaling Services

```bash
# Scale a deployment
kubectl scale deployment user-service --replicas=3 -n wordly

# Auto-scale based on CPU
kubectl autoscale deployment user-service --cpu-percent=70 --min=2 --max=5 -n wordly
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n wordly

# Describe pod for events
kubectl describe pod <pod-name> -n wordly

# Check logs
kubectl logs <pod-name> -n wordly

# Check previous logs if pod restarted
kubectl logs <pod-name> -n wordly --previous
```

### Database Connection Issues

```bash
# Check MySQL pods
kubectl get pods -l app=mysql -n wordly

# Test MySQL connectivity
kubectl exec -it <mysql-pod-name> -n wordly -- mysql -uroot -proot -e "SHOW DATABASES;"

# Check service endpoints
kubectl get endpoints -n wordly
```

### Service Discovery Issues

```bash
# Check Eureka dashboard
kubectl port-forward -n wordly svc/eureka-server 8761:8761

# Visit http://localhost:8761 in browser

# Check if services are registered
kubectl logs deployment/eureka-server -n wordly
```

### Network Issues

```bash
# Check CNI plugin
kubectl get pods -n kube-system | grep -E 'flannel|calico|weave'

# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n wordly -- nslookup eureka-server

# Check network policies
kubectl get networkpolicies -n wordly
```

### Persistent Volume Issues

```bash
# Check PV and PVC status
kubectl get pv,pvc -n wordly

# Describe PVC for events
kubectl describe pvc <pvc-name> -n wordly

# Check storage class
kubectl get storageclass
```

## Cleanup

### Remove Wordly Platform

```bash
# Delete all resources
kubectl delete namespace wordly

# Or use the cleanup script
./cleanup-wordly.sh
```

### Reset Kubeadm Cluster (Complete Reset)

```bash
# On all nodes
sudo kubeadm reset -f
sudo rm -rf /etc/cni/net.d
sudo rm -rf $HOME/.kube/config
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubeadm Documentation](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/)
- [Troubleshooting kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/)

## Support

For issues specific to the Wordly platform deployment, check:
- Application logs: `kubectl logs -n wordly <pod-name>`
- Events: `kubectl get events -n wordly --sort-by='.lastTimestamp'`
- Resource status: `kubectl get all -n wordly`
