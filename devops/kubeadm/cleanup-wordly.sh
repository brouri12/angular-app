#!/bin/bash

# ============================================================
#  Cleanup Wordly Platform from Kubeadm Cluster
# ============================================================

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE="wordly"

echo -e "${RED}=========================================="
echo "  Wordly Platform Cleanup"
echo -e "==========================================${NC}"
echo ""
echo -e "${YELLOW}WARNING: This will delete all Wordly resources!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${BLUE}[INFO]${NC} Cleanup cancelled"
    exit 0
fi

echo ""
echo -e "${BLUE}[INFO]${NC} Starting cleanup..."

# Delete namespace (this will delete all resources in it)
echo -e "${BLUE}[INFO]${NC} Deleting namespace: $NAMESPACE"
kubectl delete namespace "$NAMESPACE" --timeout=120s

# Wait for namespace to be fully deleted
echo -e "${BLUE}[INFO]${NC} Waiting for namespace to be fully deleted..."
while kubectl get namespace "$NAMESPACE" &> /dev/null; do
    echo -n "."
    sleep 2
done
echo ""

# Delete persistent volumes (if any are left)
echo -e "${BLUE}[INFO]${NC} Checking for orphaned persistent volumes..."
PVS=$(kubectl get pv -o json | jq -r '.items[] | select(.spec.claimRef.namespace=="'$NAMESPACE'") | .metadata.name' 2>/dev/null || echo "")

if [ -n "$PVS" ]; then
    echo -e "${YELLOW}[WARNING]${NC} Found orphaned persistent volumes:"
    echo "$PVS"
    read -p "Delete these persistent volumes? (yes/no): " delete_pvs
    
    if [ "$delete_pvs" = "yes" ]; then
        echo "$PVS" | while read pv; do
            echo -e "${BLUE}[INFO]${NC} Deleting PV: $pv"
            kubectl delete pv "$pv" --timeout=30s || true
        done
    fi
else
    echo -e "${GREEN}[OK]${NC} No orphaned persistent volumes found"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  Cleanup Complete!"
echo -e "==========================================${NC}"
echo ""
echo "All Wordly resources have been removed from the cluster."
echo ""
echo "To redeploy, run:"
echo "  ${BLUE}./deploy-wordly.sh${NC}"
echo ""
