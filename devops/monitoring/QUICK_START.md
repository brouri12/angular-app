# DevOps Tools - Quick Start

## 🚀 One-Command Setup

```powershell
cd devops/monitoring
.\setup-all.ps1
```

This will set up everything: Jenkins, SonarQube, Prometheus, and Grafana.

## 📋 Individual Setup

### Option 1: Step by Step

```powershell
# 1. Start all services
.\setup-devops-tools.ps1

# 2. Configure SonarQube
.\configure-sonarqube.ps1

# 3. Configure Jenkins (follow guide)
.\configure-jenkins.ps1

# 4. Configure Grafana (follow guide)
.\configure-grafana.ps1
```

### Option 2: Manual Docker Compose

```powershell
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 🌐 Access URLs

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Jenkins | http://localhost:8080 | See initial password* |
| SonarQube | http://localhost:9000 | admin / admin |
| Prometheus | http://localhost:9090 | No auth |
| Grafana | http://localhost:3000 | admin / admin |
| Node Exporter | http://localhost:9100 | No auth |
| cAdvisor | http://localhost:8081 | No auth |

*Get Jenkins password:
```powershell
docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## ⚡ Quick Commands

```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f jenkins
docker-compose logs -f sonarqube
docker-compose logs -f prometheus
docker-compose logs -f grafana

# Restart a service
docker-compose restart jenkins

# Check status
docker-compose ps

# Remove everything (including data)
docker-compose down -v
```

## 📊 What Gets Configured

### SonarQube
- ✅ 19 projects created automatically
- ✅ Authentication tokens generated
- ✅ Ready for code analysis

### Jenkins
- ⚠️ Manual setup required:
  1. Install plugins
  2. Add credentials
  3. Configure SonarQube integration
  4. Create pipeline jobs

### Prometheus
- ✅ Configured to scrape all microservices
- ✅ Collecting metrics automatically
- ✅ Ready for queries

### Grafana
- ✅ Prometheus datasource configured
- ✅ Dashboards provisioned
- ⚠️ Import additional dashboards manually

## 🔧 Common Tasks

### Run a Jenkins Build

1. Open http://localhost:8080
2. Create pipeline job
3. Point to your Git repository
4. Use `Jenkinsfile` from project root
5. Click "Build Now"

### View SonarQube Analysis

1. Run Jenkins build (includes SonarQube scan)
2. Open http://localhost:9000
3. Go to Projects
4. Click on your project
5. View bugs, vulnerabilities, code smells

### Monitor in Grafana

1. Open http://localhost:3000
2. Go to Dashboards
3. Open "Wordly Platform Overview"
4. View real-time metrics

### Query Prometheus

1. Open http://localhost:9090
2. Go to Graph
3. Enter query:
   ```promql
   rate(http_server_requests_seconds_count[5m])
   ```
4. Execute

## 🐛 Troubleshooting

### Service won't start

```powershell
# Check logs
docker-compose logs <service-name>

# Restart service
docker-compose restart <service-name>

# Recreate service
docker-compose up -d --force-recreate <service-name>
```

### Can't access service

```powershell
# Check if running
docker ps | Select-String <service-name>

# Check port binding
docker port wordly-<service-name>

# Test connection
curl http://localhost:<port>
```

### Out of memory

```powershell
# Increase Docker Desktop memory
# Settings → Resources → Memory → 8GB+

# Restart Docker Desktop
```

### Reset everything

```powershell
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## 📚 Documentation

- **Complete Guide**: `SETUP_GUIDE.md`
- **Docker Compose**: `docker-compose.yml`
- **Prometheus Config**: `../prometheus/prometheus.yml`
- **Grafana Dashboards**: `../grafana/dashboards/`

## ✅ Verification Checklist

- [ ] All containers running: `docker-compose ps`
- [ ] Jenkins accessible: http://localhost:8080
- [ ] SonarQube accessible: http://localhost:9000
- [ ] Prometheus accessible: http://localhost:9090
- [ ] Grafana accessible: http://localhost:3000
- [ ] SonarQube projects created
- [ ] Jenkins configured with credentials
- [ ] Grafana dashboards imported
- [ ] First build successful

## 🎯 Next Steps

1. **Jenkins**: Complete setup wizard and create pipeline
2. **SonarQube**: Review projects and configure quality gates
3. **Grafana**: Import additional dashboards
4. **Prometheus**: Set up alerting rules
5. **Run**: Execute your first CI/CD pipeline!

---

**Need help?** Check `SETUP_GUIDE.md` for detailed instructions!
