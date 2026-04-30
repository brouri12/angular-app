# Pre-Deployment Checklist

Before deploying Wordly to Kubernetes, complete these steps:

## ✅ Step 1: Docker Hub Username

**REQUIRED**: Replace `your-dockerhub-username` with your actual Docker Hub username.

### Option A: Use PowerShell Script (Easiest)

```powershell
cd devops
.\update-docker-username.ps1 -DockerUsername "YOUR_ACTUAL_USERNAME"
```

### Option B: Manual Find & Replace

1. Open VS Code
2. Press `Ctrl + Shift + H` (Find and Replace in Files)
3. Find: `your-dockerhub-username`
4. Replace: `your-actual-username`
5. Files to include: `devops/k8s/**/*.yml`
6. Click "Replace All"

### Option C: Use PowerShell Command

```powershell
cd devops\k8s

# Replace with your username
$username = "YOUR_ACTUAL_USERNAME"

Get-ChildItem -Recurse -Filter "*.yml" | ForEach-Object {
    (Get-Content $_.FullName) -replace 'your-dockerhub-username', $username | 
    Set-Content $_.FullName
}
```

## ✅ Step 2: Build Docker Images

You have two options:

### Option A: Use Existing Images (If Available)

If your images are already on Docker Hub:
```powershell
# No action needed, just ensure they exist:
docker pull your-username/user-service:latest
docker pull your-username/abonnement-service:latest
# etc...
```

### Option B: Build Images Locally

```powershell
# Build each service
cd UserService
docker build -t your-username/user-service:latest .

cd ../AbonnementService
docker build -t your-username/abonnement-service:latest .

# Repeat for all services...
```

### Option C: Use Local Images (Testing Only)

If you want to use local images without pushing to Docker Hub:

1. Build images locally (without username prefix):
```powershell
docker build -t user-service:latest ./UserService
docker build -t abonnement-service:latest ./AbonnementService
```

2. Update YAML files to use local images:
   - Change `image: your-username/user-service:latest`
   - To: `image: user-service:latest`
   - Add: `imagePullPolicy: Never`

## ✅ Step 3: Verify Docker Desktop Kubernetes

```powershell
# Check Kubernetes is running
kubectl cluster-info

# Check nodes
kubectl get nodes

# Should show:
# NAME             STATUS   ROLES           AGE   VERSION
# docker-desktop   Ready    control-plane   ...   ...
```

If not working:
- Open Docker Desktop
- Settings → Kubernetes
- Enable Kubernetes
- Apply & Restart

## ✅ Step 4: Check System Resources

Docker Desktop needs sufficient resources:

**Minimum Requirements:**
- CPU: 4 cores
- Memory: 8GB
- Disk: 20GB free

**Check in Docker Desktop:**
- Settings → Resources
- Adjust if needed
- Apply & Restart

## ✅ Step 5: Verify Required Files

Ensure these files exist:

```
devops/k8s/
├── 00-namespace.yml          ✓
├── 01-mysql.yml              ✓
├── 02-eureka.yml             ✓
├── 03-gateway.yml            ✓
├── 05-keycloak.yml           ✓
├── 06-frontend.yml           ✓
├── 07-backoffice.yml         ✓
├── services/
│   ├── user-service.yml      ✓
│   ├── abonnement-service.yml ✓
│   ├── challenge-service.yml  ✓
│   ├── planification-service.yml ✓
│   ├── event-service.yml      ✓
│   ├── reservation-service.yml ✓
│   ├── recrutement-service.yml ✓
│   ├── club-service.yml       ✓
│   ├── member-service.yml     ✓
│   ├── forum-service.yml      ✓
│   ├── formation-service.yml  ✓
│   ├── quiz-badge-service.yml ✓
│   ├── pronunciation-fastapi.yml ✓
│   ├── pronunciation-service.yml ✓
│   └── feedback-service.yml   ✓
└── deploy-all-services.ps1    ✓
```

## ✅ Step 6: Review Configuration (Optional)

### Database Ports
Check `01-mysql.yml` - MySQL instances on ports:
- Main: 3306
- Formation: 3306 (mysql-formation)
- Quiz: 3306 (mysql-quiz)
- Pronunciation: 3306 (mysql-pronunciation)
- Feedback: 3306 (mysql-feedback)

### Service Ports
Check service YAML files for correct ports:
- User Service: 8085
- Abonnement: 8084
- Challenge: 8086
- Planification: 8087
- Event: 8082
- Reservation: 8083
- Recrutement: 8093
- Club: 8089
- Member: 8091
- Forum: 8094
- Formation: 8081
- Quiz Badge: 8092
- Pronunciation FastAPI: 8000
- Pronunciation: 8095
- Feedback: 8096
- API Gateway: 8888
- Eureka: 8761

## ✅ Step 7: Ready to Deploy!

Once all above steps are complete:

```powershell
cd devops\k8s
.\deploy-all-services.ps1
```

Or manually:

```powershell
kubectl apply -f 00-namespace.yml
kubectl apply -f 01-mysql.yml
Start-Sleep -Seconds 30
kubectl apply -f 02-eureka.yml
Start-Sleep -Seconds 20
kubectl apply -f 03-gateway.yml
kubectl apply -f 05-keycloak.yml
kubectl apply -f services\
kubectl apply -f 06-frontend.yml
kubectl apply -f 07-backoffice.yml
```

## 🔍 Post-Deployment Verification

```powershell
# Check all pods are running
kubectl get pods -n wordly

# Check services
kubectl get services -n wordly

# View logs if issues
kubectl logs -f deployment/user-service -n wordly

# Check events
kubectl get events -n wordly --sort-by='.lastTimestamp'
```

## 🌐 Access Applications

```powershell
# Port forward to access
kubectl port-forward -n wordly svc/frontend 4200:4200
kubectl port-forward -n wordly svc/backoffice 4201:4201
kubectl port-forward -n wordly svc/api-gateway 8888:8888
kubectl port-forward -n wordly svc/eureka-server 8761:8761
```

Then open in browser:
- Frontend: http://localhost:4200
- Back-office: http://localhost:4201
- API Gateway: http://localhost:8888
- Eureka Dashboard: http://localhost:8761

## ⚠️ Common Issues

### Issue: ImagePullBackOff
**Cause**: Docker image not found on Docker Hub
**Solution**: 
- Build and push images to Docker Hub
- Or use local images with `imagePullPolicy: Never`

### Issue: Pods stuck in Pending
**Cause**: Insufficient resources
**Solution**: 
- Increase Docker Desktop resources
- Settings → Resources → Increase CPU/Memory

### Issue: CrashLoopBackOff
**Cause**: Application error or missing dependencies
**Solution**: 
- Check logs: `kubectl logs <pod-name> -n wordly`
- Check if databases are ready
- Verify environment variables

### Issue: Services not accessible
**Cause**: Port forwarding not running
**Solution**: 
- Ensure port-forward command is running
- Check if pods are in Running state

## 📝 Summary

**Must Do:**
1. ✅ Replace Docker Hub username
2. ✅ Verify Kubernetes is running
3. ✅ Ensure sufficient resources

**Optional:**
- Build and push Docker images (if not using existing ones)
- Review configuration files
- Adjust resource limits

**Then:**
- Run deployment script
- Verify pods are running
- Access applications via port-forward

---

**Ready?** Start with Step 1: Update Docker Hub username! 🚀
