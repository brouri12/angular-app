#!/bin/bash

# ============================================================
#  Kubeadm Cluster Setup Script
# ============================================================
# This script helps set up a basic kubeadm cluster
# Run this on the MASTER node
# ============================================================

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "  Kubeadm Cluster Setup"
echo -e "==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR]${NC} Please run as root (use sudo)"
    exit 1
fi

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}=========================================="
    echo "  $1"
    echo -e "==========================================${NC}"
}

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo -e "${RED}[ERROR]${NC} Cannot detect OS"
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Detected OS: $OS $VERSION"

# Step 1: Disable swap
print_section "Step 1: Disabling Swap"
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab
echo -e "${GREEN}[OK]${NC} Swap disabled"

# Step 2: Load kernel modules
print_section "Step 2: Loading Kernel Modules"
cat <<EOF | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

# Configure sysctl
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system
echo -e "${GREEN}[OK]${NC} Kernel modules configured"

# Step 3: Install container runtime (containerd)
print_section "Step 3: Installing Containerd"

if [ "$OS" = "ubuntu" ]; then
    apt-get update
    apt-get install -y containerd
    
    # Configure containerd
    mkdir -p /etc/containerd
    containerd config default | tee /etc/containerd/config.toml
    sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
    
    systemctl restart containerd
    systemctl enable containerd
    
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum install -y yum-utils
    yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    yum install -y containerd.io
    
    mkdir -p /etc/containerd
    containerd config default | tee /etc/containerd/config.toml
    sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
    
    systemctl restart containerd
    systemctl enable containerd
fi

echo -e "${GREEN}[OK]${NC} Containerd installed and configured"

# Step 4: Install kubeadm, kubelet, kubectl
print_section "Step 4: Installing Kubernetes Components"

if [ "$OS" = "ubuntu" ]; then
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl gpg
    
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
    
    apt-get update
    apt-get install -y kubelet kubeadm kubectl
    apt-mark hold kubelet kubeadm kubectl
    
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.28/rpm/repodata/repomd.xml.key
EOF
    
    yum install -y kubelet kubeadm kubectl
    systemctl enable kubelet
fi

echo -e "${GREEN}[OK]${NC} Kubernetes components installed"

# Step 5: Initialize cluster
print_section "Step 5: Initializing Kubernetes Cluster"

echo -e "${YELLOW}[INFO]${NC} This may take a few minutes..."
echo ""

# Get the primary IP address
PRIMARY_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
echo -e "${BLUE}[INFO]${NC} Using IP address: $PRIMARY_IP"

# Initialize cluster
kubeadm init \
    --pod-network-cidr=10.244.0.0/16 \
    --apiserver-advertise-address=$PRIMARY_IP \
    --control-plane-endpoint=$PRIMARY_IP

echo -e "${GREEN}[OK]${NC} Cluster initialized"

# Step 6: Configure kubectl for current user
print_section "Step 6: Configuring kubectl"

# Get the actual user who ran sudo
ACTUAL_USER=${SUDO_USER:-$USER}
ACTUAL_HOME=$(eval echo ~$ACTUAL_USER)

mkdir -p $ACTUAL_HOME/.kube
cp -i /etc/kubernetes/admin.conf $ACTUAL_HOME/.kube/config
chown -R $ACTUAL_USER:$ACTUAL_USER $ACTUAL_HOME/.kube

echo -e "${GREEN}[OK]${NC} kubectl configured for user: $ACTUAL_USER"

# Step 7: Install CNI plugin (Flannel)
print_section "Step 7: Installing CNI Plugin (Flannel)"

sudo -u $ACTUAL_USER kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

echo -e "${GREEN}[OK]${NC} Flannel CNI installed"

# Step 8: Allow scheduling on master (optional for single-node clusters)
print_section "Step 8: Cluster Configuration"

read -p "Is this a single-node cluster? (yes/no): " single_node

if [ "$single_node" = "yes" ]; then
    echo -e "${BLUE}[INFO]${NC} Removing master node taint to allow pod scheduling..."
    sudo -u $ACTUAL_USER kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true
    echo -e "${GREEN}[OK]${NC} Master node can now schedule pods"
fi

# Final summary
print_section "Setup Complete!"

echo ""
echo -e "${GREEN}✓${NC} Kubeadm cluster is ready!"
echo ""
echo "Cluster Information:"
echo "  • Master IP: $PRIMARY_IP"
echo "  • Pod Network: 10.244.0.0/16"
echo "  • CNI Plugin: Flannel"
echo ""
echo "Next steps:"
echo ""
echo "1. Verify cluster status:"
echo "   ${BLUE}kubectl get nodes${NC}"
echo "   ${BLUE}kubectl get pods -A${NC}"
echo ""

if [ "$single_node" != "yes" ]; then
    echo "2. Join worker nodes using the command shown above"
    echo "   (Look for 'kubeadm join' command in the output)"
    echo ""
    echo "3. Deploy Wordly platform:"
else
    echo "2. Deploy Wordly platform:"
fi

echo "   ${BLUE}cd devops/kubeadm${NC}"
echo "   ${BLUE}./deploy-wordly.sh${NC}"
echo ""
echo "For detailed documentation, see: ${BLUE}devops/kubeadm/README.md${NC}"
echo ""
