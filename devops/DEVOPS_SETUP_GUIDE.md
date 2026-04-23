# Wordly Platform – DevOps Setup Guide

## Architecture Overview

```
GitHub (webhook) → Jenkins → SonarQube → Docker Hub → Kubernetes
                                                    ↓
                                          Prometheus + Grafana
```

## What Was Created

```
devops/
├── k8s/
│   ├── 00-namespace.yml        # wordly namespace
│   ├── 01-mysql.yml            # MySQL + all DB init
│   ├── 02-eureka.yml           # Eureka Server
│   ├── 03-api-gateway.yml      # API Gateway (NodePort 30888)
│   ├── 04-microservices.yml    # All 10 microservices
│   ├── 05-frontends.yml        # Angular + Back-office (NodePort 30420/30421)
│   └── 06-monitoring.yml       # Prometheus (30910) + Grafana (30300)
├── mysql/
│   └── init.sql                # Creates all 11 databases
├── prometheus/
│   └── prometheus.yml          # Scrape config for all services
└── grafana/
    └── provisioning/
        ├── datasources/        # Auto-connects to Prometheus
        └── dashboards/         # Dashboard provider config

Dockerfiles (one per service)
docker-compose.yml              # Full local stack
Jenkinsfile                     # CI/CD pipeline
```

---

## Step 1 – Add Actuator to Spring Boot Services (for Prometheus)

Each service needs `spring-boot-starter-actuator` and `micrometer-registry-prometheus`
in its `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

And in each `application.properties`:

```properties
management.endpoints.web.exposure.include=health,info,prometheus,metrics
management.endpoint.prometheus.enabled=true
management.metrics.export.prometheus.enabled=true
```

---

## Step 2 – Run the Full Stack Locally (Docker Desktop)

```bash
# Start everything (first time takes ~10 min to build all images)
docker-compose up -d

# Watch logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Access Points

| Service       | URL                          |
|---------------|------------------------------|
| Frontend      | http://localhost:4200         |
| Back-office   | http://localhost:4201         |
| API Gateway   | http://localhost:8888         |
| Eureka        | http://localhost:8761         |
| Keycloak      | http://localhost:9090         |
| Jenkins       | http://localhost:8080         |
| SonarQube     | http://localhost:9000         |
| Prometheus    | http://localhost:9091         |
| Grafana       | http://localhost:3000         |

---

## Step 3 – Configure Jenkins

1. Open http://localhost:8080
2. Get the initial admin password:
   ```bash
   docker exec wordly-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Install suggested plugins + add:
   - **SonarQube Scanner**
   - **Docker Pipeline**
   - **Kubernetes CLI**
   - **Git**

4. Configure credentials (Manage Jenkins → Credentials):
   - `dockerhub-credentials` – Docker Hub username/password
   - `sonar-token` – SonarQube token (generate at http://localhost:9000)
   - `kubeconfig` – your kubectl config file (for K8s deploy)

5. Configure SonarQube server (Manage Jenkins → Configure System):
   - Name: `SonarQube`
   - URL: `http://sonarqube:9000`
   - Token: use the `sonar-token` credential

6. Configure tools (Manage Jenkins → Global Tool Configuration):
   - JDK: `JDK-17` → install automatically (OpenJDK 17)
   - Maven: `Maven-3.9` → install automatically
   - NodeJS: `Node-20` → install automatically

---

## Step 4 – Configure Git Webhook

### GitHub
1. Go to your repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://<your-jenkins-ip>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event** (or "Send me everything")
5. Click **Add webhook**

### Jenkins Job
1. Create a new Pipeline job
2. Source: Git → your repo URL
3. Credentials: add your GitHub token
4. Branch: `*/main`
5. Build Triggers: ✅ **GitHub hook trigger for GITScm polling**
6. Pipeline: **Pipeline script from SCM** → points to `Jenkinsfile`

---

## Step 5 – SonarQube First-Time Setup

1. Open http://localhost:9000 (admin/admin)
2. Change the default password when prompted
3. Generate a token: My Account → Security → Generate Token
4. Add the token as `sonar-token` credential in Jenkins
5. The Jenkinsfile will automatically create projects on first analysis

---

## Step 6 – Grafana Dashboards

1. Open http://localhost:3000 (admin/admin)
2. Prometheus datasource is auto-provisioned
3. Import dashboards from Grafana.com:
   - **JVM Micrometer**: ID `4701` – Spring Boot metrics
   - **Spring Boot Statistics**: ID `6756`
   - **Node Exporter**: ID `1860` – system metrics

---

## Step 7 – Kubernetes (Docker Desktop)

Enable Kubernetes in Docker Desktop → Settings → Kubernetes → Enable Kubernetes.

```bash
# Deploy everything
kubectl apply -f devops/k8s/

# Check status
kubectl get all -n wordly

# Access services (NodePort)
# Frontend:   http://localhost:30420
# Gateway:    http://localhost:30888
# Grafana:    http://localhost:30300
# Prometheus: http://localhost:30910
```

---

## Step 8 – Replace Placeholder Values

Search for `your-dockerhub-username` in all files and replace with your actual Docker Hub username:

```bash
# Windows PowerShell
Get-ChildItem -Recurse -Include "*.yml","Jenkinsfile" | 
  ForEach-Object { 
    (Get-Content $_) -replace 'your-dockerhub-username', 'YOUR_ACTUAL_USERNAME' | 
    Set-Content $_ 
  }
```

---

## Pipeline Flow

```
Push to GitHub
      ↓
Jenkins webhook triggered
      ↓
Checkout code
      ↓
Build & Test (parallel – all 12 services)
      ↓
SonarQube analysis (UserService, ChallengeService, AbonnementService)
      ↓
Quality Gate check (fails pipeline if code quality too low)
      ↓
Build Angular frontends (parallel)
      ↓
Docker build & push to Docker Hub (parallel)
      ↓
Deploy to Kubernetes (only on main branch)
      ↓
kubectl rollout status (verify deployment)
```
