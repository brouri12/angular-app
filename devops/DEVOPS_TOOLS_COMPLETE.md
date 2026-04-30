# DevOps Tools Setup - Complete ✅

## 🎉 What's Been Created

I've set up a complete DevOps toolchain for your Wordly platform with Jenkins, SonarQube, Prometheus, and Grafana.

## 📁 Files Created

### Setup Scripts
- **`monitoring/setup-all.ps1`** - Master setup script (run this!)
- **`monitoring/setup-devops-tools.ps1`** - Start all services
- **`monitoring/configure-sonarqube.ps1`** - Auto-configure SonarQube
- **`monitoring/configure-jenkins.ps1`** - Jenkins setup guide
- **`monitoring/configure-grafana.ps1`** - Grafana setup guide

### Configuration Files
- **`monitoring/docker-compose.yml`** - All services definition
- **`prometheus/prometheus.yml`** - Metrics collection config
- **`grafana/provisioning/datasources/prometheus.yml`** - Grafana datasource
- **`grafana/provisioning/dashboards/dashboard.yml`** - Dashboard provisioning
- **`grafana/dashboards/wordly-overview.json`** - Pre-built dashboard

### Documentation
- **`monitoring/QUICK_START.md`** - Quick reference ⭐ START HERE
- **`monitoring/SETUP_GUIDE.md`** - Complete detailed guide
- **`DEVOPS_TOOLS_COMPLETE.md`** - This file

## 🚀 Quick Start (3 Steps)

### Step 1: Start All Services

```powershell
cd "C:\Users\marwe\Desktop\Nouveau dossier\devops\monitoring"
.\setup-all.ps1
```

**What it does:**
- Starts Jenkins, SonarQube, Prometheus, Grafana
- Waits for services to be ready
- Configures SonarQube projects
- Shows access URLs and credentials

**Time:** ~5 minutes

### Step 2: Access the Tools

Open in your browser:

| Tool | URL | Credentials |
|------|-----|-------------|
| **Jenkins** | http://localhost:8080 | See script output |
| **SonarQube** | http://localhost:9000 | admin / admin |
| **Prometheus** | http://localhost:9090 | No login |
| **Grafana** | http://localhost:3000 | admin / admin |

### Step 3: Configure Jenkins

1. Open http://localhost:8080
2. Enter initial admin password (shown in script)
3. Install suggested plugins + these:
   - Docker Pipeline
   - SonarQube Scanner
   - Prometheus Metrics
   - Blue Ocean
4. Add credentials:
   - Docker Hub (dockerhub-credentials)
   - SonarQube token (from sonarqube-tokens.json)
5. Configure SonarQube server:
   - URL: http://sonarqube:9000
   - Token: Select sonarqube-token
6. Create pipeline job pointing to your Git repo

**Time:** ~10 minutes

## 📊 What Each Tool Does

### 1. Jenkins (CI/CD)
**Purpose:** Automate builds, tests, and deployments

**Features:**
- Builds Docker images
- Runs tests
- Performs SonarQube analysis
- Pushes to Docker Hub
- Deploys to Kubernetes

**Your Jenkinsfile:** Already configured in project root

### 2. SonarQube (Code Quality)
**Purpose:** Analyze code quality and security

**Features:**
- Detects bugs and code smells
- Finds security vulnerabilities
- Measures code coverage
- Enforces quality gates

**Projects Created:** 19 projects (all microservices)

### 3. Prometheus (Metrics)
**Purpose:** Collect and store metrics

**Features:**
- Scrapes metrics from all services
- Stores time-series data
- Provides query language (PromQL)
- Enables alerting

**Configured Targets:** All 15 microservices + infrastructure

### 4. Grafana (Visualization)
**Purpose:** Visualize metrics and create dashboards

**Features:**
- Real-time dashboards
- Custom queries
- Alerting
- Multiple data sources

**Pre-configured:** Prometheus datasource + Wordly dashboard

## 🔍 How to Use

### Run a Build

```powershell
# In Jenkins:
1. Go to your pipeline job
2. Click "Build Now"
3. Watch the pipeline execute
4. View results in SonarQube
```

### View Code Quality

```powershell
# In SonarQube:
1. Open http://localhost:9000
2. Go to Projects
3. Click on a project
4. View:
   - Bugs
   - Vulnerabilities
   - Code Smells
   - Coverage
   - Duplications
```

### Monitor Services

```powershell
# In Grafana:
1. Open http://localhost:3000
2. Go to Dashboards
3. Open "Wordly Platform Overview"
4. View:
   - Request rates
   - Response times
   - Error rates
   - Resource usage
```

### Query Metrics

```powershell
# In Prometheus:
1. Open http://localhost:9090
2. Enter query:
   rate(http_server_requests_seconds_count[5m])
3. View graph
```

## 📈 Pre-Configured Monitoring

### Prometheus Targets
All these services are being monitored:
- ✅ Eureka Server
- ✅ API Gateway
- ✅ User Service
- ✅ Abonnement Service
- ✅ Challenge Service
- ✅ Planification Service
- ✅ Event Service
- ✅ Reservation Service
- ✅ Recrutement Service
- ✅ Club Service
- ✅ Member Service
- ✅ Forum Service
- ✅ Formation Service
- ✅ Quiz Badge Service
- ✅ Pronunciation Service (Java)
- ✅ Pronunciation FastAPI (Python)
- ✅ Feedback Service

### Grafana Dashboard Panels
Pre-configured visualizations:
- Total Requests
- Response Time (p95)
- Service Health Status
- Error Rate
- JVM Memory Usage
- CPU Usage
- Database Connections

### SonarQube Projects
All 19 projects ready for analysis:
- 15 Microservices
- 2 Frontend apps
- API Gateway
- Eureka Server

## 🛠️ Common Commands

```powershell
# Start all services
cd devops/monitoring
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f jenkins
docker-compose logs -f sonarqube

# Restart a service
docker-compose restart jenkins

# Check status
docker-compose ps

# Get Jenkins password
docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 📋 Configuration Checklist

### Jenkins
- [ ] Initial setup wizard completed
- [ ] Plugins installed
- [ ] Docker Hub credentials added
- [ ] SonarQube token added
- [ ] SonarQube server configured
- [ ] Maven configured
- [ ] NodeJS configured
- [ ] Pipeline job created
- [ ] First build successful

### SonarQube
- [ ] Logged in (admin/admin)
- [ ] Password changed
- [ ] Projects visible (19 total)
- [ ] Quality gates configured
- [ ] Tokens saved

### Grafana
- [ ] Logged in (admin/admin)
- [ ] Password changed
- [ ] Prometheus datasource verified
- [ ] Wordly dashboard visible
- [ ] Additional dashboards imported
- [ ] Alerts configured (optional)

### Prometheus
- [ ] Accessible at :9090
- [ ] Targets showing as UP
- [ ] Metrics being collected
- [ ] Queries working

## 🎯 Integration Flow

```
Code Push → GitHub
    ↓
Jenkins (Triggered)
    ↓
Build & Test
    ↓
SonarQube Analysis
    ↓
Docker Build & Push
    ↓
Deploy to Kubernetes
    ↓
Prometheus (Collect Metrics)
    ↓
Grafana (Visualize)
```

## 📊 Metrics Available

### Application Metrics
- HTTP request count
- HTTP request duration
- HTTP status codes
- Active requests

### JVM Metrics
- Memory usage (heap/non-heap)
- Garbage collection
- Thread count
- Class loading

### Database Metrics
- Connection pool size
- Active connections
- Idle connections
- Connection wait time

### System Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

## 🔐 Security Notes

### Default Passwords
**Change these immediately:**
- SonarQube: admin / admin
- Grafana: admin / admin
- Jenkins: Use initial password, then create strong password

### Credentials to Add
1. **Docker Hub** - For pushing images
2. **SonarQube Token** - For code analysis
3. **GitHub** - For private repositories (if needed)

### Tokens Generated
- SonarQube project tokens saved in `sonarqube-tokens.json`
- Keep this file secure
- Add tokens to Jenkins credentials

## 🐛 Troubleshooting

### Services won't start
```powershell
docker-compose logs <service-name>
docker-compose restart <service-name>
```

### Can't access service
```powershell
docker ps | Select-String <service-name>
curl http://localhost:<port>
```

### Jenkins build fails
- Check console output
- Verify credentials
- Check Docker socket access
- Review Jenkinsfile

### SonarQube analysis fails
- Verify token in Jenkins
- Check SonarQube server URL
- Review project configuration

### No metrics in Grafana
- Check if services are running
- Verify Prometheus targets
- Wait for metrics to accumulate

## 📚 Documentation

- **Quick Start**: `monitoring/QUICK_START.md`
- **Complete Guide**: `monitoring/SETUP_GUIDE.md`
- **Docker Compose**: `monitoring/docker-compose.yml`
- **Prometheus Config**: `prometheus/prometheus.yml`

## ✅ Success Criteria

You're all set when:
- ✅ All 8 containers running
- ✅ Jenkins accessible and configured
- ✅ SonarQube showing 19 projects
- ✅ Prometheus collecting metrics
- ✅ Grafana showing dashboards
- ✅ First pipeline build successful
- ✅ Code analysis visible in SonarQube
- ✅ Metrics visible in Grafana

## 🎓 Next Steps

1. **Run your first build** in Jenkins
2. **Review code quality** in SonarQube
3. **Monitor metrics** in Grafana
4. **Set up alerts** for critical metrics
5. **Customize dashboards** for your needs
6. **Configure quality gates** in SonarQube
7. **Automate deployments** via Jenkins

## 🆘 Need Help?

1. Check `monitoring/QUICK_START.md` for quick reference
2. Read `monitoring/SETUP_GUIDE.md` for detailed instructions
3. View logs: `docker-compose logs -f <service>`
4. Check service status: `docker-compose ps`

---

## 🚀 Ready to Go!

Everything is configured and ready. Just run:

```powershell
cd devops/monitoring
.\setup-all.ps1
```

Then follow the on-screen instructions!

**Happy DevOps! 🎉**
