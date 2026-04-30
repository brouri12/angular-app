# DevOps Tools Setup Guide

Complete guide for setting up Jenkins, SonarQube, Prometheus, and Grafana for the Wordly platform.

## 🚀 Quick Start

```powershell
cd devops/monitoring

# 1. Start all DevOps tools
.\setup-devops-tools.ps1

# 2. Configure SonarQube
.\configure-sonarqube.ps1

# 3. Configure Jenkins (follow interactive guide)
.\configure-jenkins.ps1

# 4. Configure Grafana
.\configure-grafana.ps1
```

## 📋 What Gets Installed

### 1. Jenkins (Port 8080)
- **Purpose**: CI/CD automation
- **Features**:
  - Automated builds
  - Docker image creation
  - SonarQube integration
  - Pipeline as code

### 2. SonarQube (Port 9000)
- **Purpose**: Code quality and security analysis
- **Features**:
  - Code smell detection
  - Security vulnerability scanning
  - Code coverage reports
  - Quality gates

### 3. Prometheus (Port 9090)
- **Purpose**: Metrics collection
- **Features**:
  - Service metrics
  - JVM metrics
  - Custom application metrics
  - Alerting

### 4. Grafana (Port 3000)
- **Purpose**: Metrics visualization
- **Features**:
  - Pre-configured dashboards
  - Real-time monitoring
  - Alerting
  - Custom queries

### 5. Supporting Services
- **PostgreSQL**: Database for SonarQube
- **Node Exporter** (Port 9100): System metrics
- **cAdvisor** (Port 8081): Container metrics

## 📖 Detailed Setup Instructions

### Step 1: Start DevOps Tools

```powershell
cd devops/monitoring
.\setup-devops-tools.ps1
```

**What it does:**
- Starts all Docker containers
- Waits for services to be healthy
- Displays access URLs and credentials

**Expected output:**
```
✓ Jenkins is ready at http://localhost:8080
✓ SonarQube is ready at http://localhost:9000
✓ Prometheus is ready at http://localhost:9090
✓ Grafana is ready at http://localhost:3000
```

### Step 2: Configure SonarQube

```powershell
.\configure-sonarqube.ps1
```

**What it does:**
- Creates projects for all microservices
- Generates authentication tokens
- Saves tokens to `sonarqube-tokens.json`

**Projects created:**
- wordly-user-service
- wordly-abonnement-service
- wordly-challenge-service
- wordly-planification-service
- wordly-event-service
- wordly-reservation-service
- wordly-recrutement-service
- wordly-club-service
- wordly-member-service
- wordly-forum-service
- wordly-formation-service
- wordly-quiz-badge-service
- wordly-pronunciation-service
- wordly-feedback-service
- wordly-pronunciation-fastapi
- wordly-api-gateway
- wordly-eureka-server
- wordly-frontend
- wordly-backoffice

**Manual steps:**
1. Open http://localhost:9000
2. Login with `admin` / `admin`
3. Change password when prompted
4. Review created projects

### Step 3: Configure Jenkins

```powershell
.\configure-jenkins.ps1
```

**What it does:**
- Displays initial admin password
- Provides step-by-step configuration guide

**Manual steps:**

#### A. Initial Setup
1. Open http://localhost:8080
2. Enter initial admin password (shown in script output)
3. Install suggested plugins
4. Install additional plugins:
   - Docker Pipeline
   - SonarQube Scanner
   - Prometheus Metrics
   - Blue Ocean
   - Maven Integration
   - NodeJS Plugin

#### B. Add Credentials

**Docker Hub:**
1. Manage Jenkins → Credentials → System → Global credentials
2. Add → Username with password
3. ID: `dockerhub-credentials`
4. Username: Your Docker Hub username
5. Password: Your Docker Hub password

**SonarQube Token:**
1. Add → Secret text
2. ID: `sonarqube-token`
3. Secret: Token from `sonarqube-tokens.json`

**GitHub (if private repo):**
1. Add → Username with password or SSH key
2. ID: `github-credentials`

#### C. Configure SonarQube Integration

1. Manage Jenkins → Configure System
2. Find "SonarQube servers"
3. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://sonarqube:9000`
   - Token: Select `sonarqube-token`

#### D. Configure Build Tools

**Maven:**
1. Manage Jenkins → Global Tool Configuration
2. Maven → Add Maven
   - Name: `Maven 3.8`
   - Install automatically: ✓
   - Version: 3.8.6

**NodeJS:**
1. In Global Tool Configuration
2. NodeJS → Add NodeJS
   - Name: `NodeJS 18`
   - Install automatically: ✓
   - Version: 18.x

#### E. Create Pipeline Job

1. New Item → Pipeline
2. Name: `Wordly-Microservices-Pipeline`
3. Pipeline section:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your Git repository
   - Credentials: Select if private
   - Branch: `*/main` or `*/devops`
   - Script Path: `Jenkinsfile`
4. Save

### Step 4: Configure Grafana

```powershell
.\configure-grafana.ps1
```

**Manual steps:**

1. Open http://localhost:3000
2. Login with `admin` / `admin`
3. Change password when prompted
4. Verify Prometheus datasource:
   - Configuration → Data Sources
   - Should see "Prometheus" (already configured)
5. Import dashboards:
   - Dashboards → Browse
   - Should see "Wordly Platform Overview"

**Create additional dashboards:**
1. Click "+" → Import
2. Use dashboard IDs:
   - 4701: JVM (Micrometer)
   - 11074: Node Exporter Full
   - 193: Docker Monitoring

## 🔍 Verification

### Check All Services

```powershell
# View running containers
docker ps

# Check logs
docker-compose logs -f jenkins
docker-compose logs -f sonarqube
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

### Test Jenkins

1. Open http://localhost:8080
2. Go to your pipeline job
3. Click "Build Now"
4. Watch the build progress

### Test SonarQube

1. Open http://localhost:9000
2. Go to Projects
3. Should see all 19 projects listed
4. Run a build in Jenkins to see analysis results

### Test Prometheus

1. Open http://localhost:9090
2. Go to Status → Targets
3. Should see all microservices listed
4. Try query: `up{job=~".*-service"}`

### Test Grafana

1. Open http://localhost:3000
2. Go to Dashboards
3. Open "Wordly Platform Overview"
4. Should see metrics (once services are running)

## 📊 Using the Tools

### Jenkins - Running Builds

```groovy
// Jenkinsfile is already configured
// Just push code to trigger builds
```

**Manual build:**
1. Go to pipeline job
2. Click "Build Now"
3. View console output
4. Check SonarQube for analysis results

### SonarQube - Code Analysis

**View results:**
1. Open http://localhost:9000
2. Click on project
3. View:
   - Bugs
   - Vulnerabilities
   - Code Smells
   - Coverage
   - Duplications

**Quality Gates:**
1. Quality Gates → Create
2. Set conditions:
   - Coverage > 80%
   - Bugs = 0
   - Vulnerabilities = 0
3. Assign to projects

### Prometheus - Metrics

**Useful queries:**

```promql
# Request rate
rate(http_server_requests_seconds_count[5m])

# Error rate
rate(http_server_requests_seconds_count{status=~"5.."}[5m])

# Response time (p95)
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# JVM memory
jvm_memory_used_bytes

# CPU usage
process_cpu_seconds_total
```

### Grafana - Dashboards

**Pre-configured panels:**
- Total Requests
- Response Time (p95)
- Service Health
- Error Rate
- JVM Memory Usage
- CPU Usage
- Database Connections

**Create alerts:**
1. Edit panel
2. Alert tab
3. Create alert rule
4. Set conditions
5. Configure notifications

## 🛠️ Troubleshooting

### Jenkins Issues

**Can't access Jenkins:**
```powershell
# Check if running
docker ps | Select-String jenkins

# View logs
docker logs wordly-jenkins

# Restart
docker-compose restart jenkins
```

**Build fails:**
- Check console output
- Verify credentials
- Check Docker socket access
- Review Jenkinsfile syntax

### SonarQube Issues

**Can't login:**
- Default: admin/admin
- Reset: Delete volume and restart

**Projects not showing:**
```powershell
# Re-run configuration
.\configure-sonarqube.ps1
```

### Prometheus Issues

**No metrics:**
- Check if microservices are running
- Verify `/actuator/prometheus` endpoint
- Check prometheus.yml configuration

**Targets down:**
- Verify service names in docker-compose
- Check network connectivity
- Review service logs

### Grafana Issues

**No data in dashboards:**
- Verify Prometheus datasource
- Check if services are running
- Wait for metrics to accumulate

**Dashboard not loading:**
- Refresh browser
- Check Grafana logs
- Verify dashboard JSON

## 🧹 Maintenance

### Stop All Services

```powershell
cd devops/monitoring
docker-compose down
```

### Stop and Remove Data

```powershell
docker-compose down -v
```

### Update Services

```powershell
docker-compose pull
docker-compose up -d
```

### Backup Data

```powershell
# Backup Jenkins
docker run --rm -v wordly-jenkins_home:/data -v ${PWD}:/backup ubuntu tar czf /backup/jenkins-backup.tar.gz /data

# Backup SonarQube
docker run --rm -v wordly-sonarqube_data:/data -v ${PWD}:/backup ubuntu tar czf /backup/sonarqube-backup.tar.gz /data

# Backup Grafana
docker run --rm -v wordly-grafana_data:/data -v ${PWD}:/backup ubuntu tar czf /backup/grafana-backup.tar.gz /data
```

## 📚 Additional Resources

### Jenkins
- Documentation: https://www.jenkins.io/doc/
- Pipeline Syntax: https://www.jenkins.io/doc/book/pipeline/syntax/
- Plugins: https://plugins.jenkins.io/

### SonarQube
- Documentation: https://docs.sonarqube.org/
- Rules: https://rules.sonarsource.com/
- Quality Gates: https://docs.sonarqube.org/latest/user-guide/quality-gates/

### Prometheus
- Documentation: https://prometheus.io/docs/
- Query Language: https://prometheus.io/docs/prometheus/latest/querying/basics/
- Exporters: https://prometheus.io/docs/instrumenting/exporters/

### Grafana
- Documentation: https://grafana.com/docs/
- Dashboards: https://grafana.com/grafana/dashboards/
- Alerts: https://grafana.com/docs/grafana/latest/alerting/

## 🎯 Summary

**Setup Complete When:**
- ✅ All services are running
- ✅ Jenkins is configured with credentials
- ✅ SonarQube has all projects
- ✅ Prometheus is collecting metrics
- ✅ Grafana shows dashboards

**Access URLs:**
- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

**Next Steps:**
1. Run a Jenkins build
2. View SonarQube analysis
3. Monitor metrics in Grafana
4. Set up alerts
5. Customize dashboards

---

**Need Help?** Check the troubleshooting section or review service logs!
