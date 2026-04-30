# Kubeadm Installation and Setup Guide

Complete guide for setting up a Kubernetes cluster using kubeadm and deploying the Wordly platform.

## Quick Start

```bash
# On Master Node
cd devops/kubeadm
sudo ./setup-cluster.sh

# Deploy Wordly
./deploy-wordly.sh
```

## Detailed Installation Steps

### 1. System Requirements

#### Minimum Requirements per Node:
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: 20GB
- **OS**: Ubuntu 20.04/22.04 or CentOS 7/8

#### Recommended for Production:
- **Master Node**: 4 CPU, 8GB RAM, 50GB disk
- **Worker Nodes**: 4 CPU, 8GB RAM, 50GB disk (per node)
- **3+ nodes** for high availability

### 2. Pre-Installation Checklist

On **ALL nodes** (master and workers):

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y  # Ubuntu
# OR
sudo yum update -y  # CentOS

# Set hostname (unique for each node)
sudo hostnamectl set-hostname master-node  # On master
sudo hostnamectl set-hostname worker-node-1  # On worker 1
sudo hostnamectl set-hostname worker-node-2  # On worker 2

# Update /etc/hosts on all nodes
sudo nano /etc/hosts
# Add:
# 192.168.1.10 master-node
# 192.168.1.11 worker-node-1
# 192.168.1.12 worker-node-2

# Disable firewall (or configure ports)
sudo systemctl stop firewalld  # CentOS
sudo systemctl disable firewalld
# OR
sudo ufw disable  # Ubuntu

# Verify network connectivity
ping master-node
ping worker-node-1
```

### 3. Automated Cluster Setup (Recommended)

#### On Master Node:

```bash
# Clone your repository
git clone <your-repo-url>
cd devops/kubeadm

# Make scripts executable
chmod +x *.sh

# Run setup script (as root)
sudo ./setup-cluster.sh
```

The script will:
- ✓ Disable swap
- ✓ Load kernel modules
- ✓ Install containerd
- ✓ Install kubeadm, kubelet, kubectl
- ✓ Initialize Kubernetes cluster
- ✓ Configure kubectl
- ✓ Install Flannel CNI

**Save the join command** shown at the end! It looks like:
```bash
kubeadm join 192.168.1.10:6443 --token abc123... \
    --discovery-token-ca-cert-hash sha256:def456...
```

#### On Worker Nodes:

```bash
# Run the same setup script (without initialization)
# Or manually install prerequisites:

# 1. Disable swap
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# 2. Install container runtime and k8s components
# (Follow steps from setup-cluster.sh or run it)

# 3. Join the cluster using the command from master
sudo kubeadm join 192.168.1.10:6443 --token abc123... \
    --discovery-token-ca-cert-hash sha256:def456...
```

### 4. Manual Cluster Setup (Alternative)

If you prefer manual setup, follow these steps:

#### Step 1: Disable Swap (All Nodes)

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

#### Step 2: Load Kernel Modules (All Nodes)

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

#### Step 3: Install Containerd (All Nodes)

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install -y containerd

sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl restart containerd
sudo systemctl enable containerd
```

**CentOS:**
```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y containerd.io

sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

sudo systemctl restart containerd
sudo systemctl enable containerd
```

#### Step 4: Install Kubernetes Components (All Nodes)

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | \
    sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | \
    sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

**CentOS:**
```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/repodata/repomd.xml.key
EOF

sudo yum install -y kubelet kubeadm kubectl
sudo systemctl enable kubelet
```

#### Step 5: Initialize Master Node (Master Only)

```bash
# Get your primary IP
PRIMARY_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
echo "Using IP: $PRIMARY_IP"

# Initialize cluster
sudo kubeadm init \
    --pod-network-cidr=10.244.0.0/16 \
    --apiserver-advertise-address=$PRIMARY_IP \
    --control-plane-endpoint=$PRIMARY_IP

# Configure kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

#### Step 6: Install CNI Plugin (Master Only)

```bash
# Install Flannel
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# Wait for all pods to be ready
kubectl get pods -A
```

#### Step 7: Join Worker Nodes (Workers Only)

```bash
# Use the join command from kubeadm init output
sudo kubeadm join <master-ip>:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

### 5. Verify Cluster

```bash
# Check nodes (run on master)
kubectl get nodes

# Expected output:
# NAME            STATUS   ROLES           AGE   VERSION
# master-node     Ready    control-plane   5m    v1.28.x
# worker-node-1   Ready    <none>          2m    v1.28.x
# worker-node-2   Ready    <none>          2m    v1.28.x

# Check system pods
kubectl get pods -A

# All pods should be Running
```

### 6. Deploy Wordly Platform

```bash
# Navigate to kubeadm directory
cd devops/kubeadm

# Deploy Wordly
./deploy-wordly.sh
```

### 7. Access Applications

#### Option 1: NodePort (Easiest)

```bash
# Apply NodePort services
kubectl apply -f nodeport-services.yml

# Get node IP
kubectl get nodes -o wide

# Access applications:
# Frontend: http://<node-ip>:30200
# Back-office: http://<node-ip>:30201
# API Gateway: http://<node-ip>:30888
# Eureka: http://<node-ip>:30761
```

#### Option 2: Ingress (Recommended)

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/baremetal/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Apply Wordly ingress
kubectl apply -f ingress.yml

# Add to /etc/hosts (on your local machine)
<node-ip> wordly.local api.wordly.local eureka.wordly.local keycloak.wordly.local admin.wordly.local

# Access applications:
# Frontend: http://wordly.local
# Back-office: http://admin.wordly.local
# API Gateway: http://api.wordly.local
# Eureka: http://eureka.wordly.local
```

#### Option 3: Port Forwarding (Development)

```bash
# Frontend
kubectl port-forward -n wordly svc/frontend 4200:4200

# Back-office
kubectl port-forward -n wordly svc/backoffice 4201:4201

# API Gateway
kubectl port-forward -n wordly svc/api-gateway 8888:8888
```

## Troubleshooting

### Cluster Setup Issues

#### Pods stuck in Pending state
```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod <pod-name> -n wordly
```

#### CNI plugin not working
```bash
# Check Flannel pods
kubectl get pods -n kube-flannel

# Restart Flannel
kubectl delete pods -n kube-flannel --all
```

#### Worker node not joining
```bash
# On worker node, check logs
sudo journalctl -u kubelet -f

# Reset and try again
sudo kubeadm reset
# Then run join command again
```

### Application Issues

#### Services not accessible
```bash
# Check service endpoints
kubectl get endpoints -n wordly

# Check if pods are running
kubectl get pods -n wordly

# Check service logs
kubectl logs -f deployment/<service-name> -n wordly
```

#### Database connection errors
```bash
# Check MySQL pods
kubectl get pods -l app=mysql -n wordly

# Test MySQL connection
kubectl exec -it <mysql-pod> -n wordly -- mysql -uroot -proot -e "SHOW DATABASES;"
```

## Maintenance

### Update Wordly Services

```bash
# Update a specific service
kubectl set image deployment/<service-name> \
    <container-name>=<new-image>:<tag> -n wordly

# Restart a deployment
kubectl rollout restart deployment/<service-name> -n wordly

# Check rollout status
kubectl rollout status deployment/<service-name> -n wordly
```

### Scale Services

```bash
# Scale manually
kubectl scale deployment user-service --replicas=3 -n wordly

# Auto-scale
kubectl autoscale deployment user-service \
    --cpu-percent=70 --min=2 --max=5 -n wordly
```

### Backup and Restore

```bash
# Backup all resources
kubectl get all -n wordly -o yaml > wordly-backup.yaml

# Backup persistent data
kubectl exec <mysql-pod> -n wordly -- \
    mysqldump -uroot -proot --all-databases > backup.sql

# Restore
kubectl apply -f wordly-backup.yaml
```

### Cleanup

```bash
# Remove Wordly platform
./cleanup-wordly.sh

# Or manually
kubectl delete namespace wordly
```

## Production Considerations

### High Availability

- Use 3+ master nodes
- Use external etcd cluster
- Use load balancer for API server
- Use persistent storage (NFS, Ceph, etc.)

### Security

```bash
# Enable RBAC
kubectl create serviceaccount wordly-sa -n wordly
kubectl create rolebinding wordly-rb \
    --clusterrole=edit \
    --serviceaccount=wordly:wordly-sa \
    -n wordly

# Use secrets for sensitive data
kubectl create secret generic mysql-secret \
    --from-literal=password=<strong-password> \
    -n wordly

# Enable network policies
kubectl apply -f network-policies.yml
```

### Monitoring

```bash
# Install Prometheus and Grafana
kubectl apply -f ../prometheus/

# Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubeadm Setup Guide](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)
- [Troubleshooting kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/troubleshooting-kubeadm/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
