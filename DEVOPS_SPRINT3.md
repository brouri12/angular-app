# DevOps Sprint 3 - Guide de livraison

## 1) Pipelines CI/CD

### Backend (microservices)
- Un pipeline CI par microservice (GitHub Actions):
  - `api-gateway-ci.yml`
  - `eureka-server-ci.yml`
  - `formation-service-ci.yml`
  - `quiz-badge-service-ci.yml`
  - `review-todo-service-ci.yml`
  - `simple-formation-service-ci.yml`
  - `test-service-ci.yml`
- Tous utilisent le workflow réutilisable `_backend-service-ci.yml`.
- Chaque CI exécute: tests unitaires + rapport JaCoCo + scan SonarQube (si secrets présents).

### Frontend
- Pipeline dédié: `frontend-ci.yml`
- Apps couvertes:
  - `front-office`
  - `e_learnig-platform/frontend/angular-app`
  - `e_learnig-platform/back-office-verifier`
- Le pipeline exécute: installation, tests unitaires, build, artefacts coverage/dist, scan SonarQube.

### CD backend global
- Pipeline: `backend-cd.yml`
- Objectif:
  - build des images backend principales,
  - validation `docker compose`,
  - génération d'un bundle de déploiement,
  - déploiement SSH optionnel (si secrets CD configurés).

## 2) Secrets GitHub requis

### SonarQube
- `SONAR_HOST_URL`
- `SONAR_TOKEN`

### Déploiement CD (optionnel)
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`

## 3) Monitoring

Fichiers fournis:
- `docker-compose.monitoring.yml`
- `monitoring/prometheus/prometheus.yml`
- `monitoring/grafana/provisioning/datasources/datasource.yml`

### Démarrage
1. Démarrer le stack applicatif principal (`docker-compose.yml`).
2. Démarrer monitoring:
   - `docker compose -f docker-compose.monitoring.yml up -d`
3. Accès:
   - Prometheus: `http://localhost:9091`
   - Grafana: `http://localhost:3000` (admin/admin)

## 4) Preuves à présenter au coaching

1. Exécution CI backend et frontend (captures).
2. SonarQube avant correction (capture).
3. SonarQube après refactoring (capture).
4. Dashboard monitoring (capture Prometheus/Grafana).
5. Exécution CD backend global (run + artefact bundle).

## 5) Dashboard Grafana auto-charge

- Fichier dashboard:
  - `monitoring/grafana/provisioning/dashboards/json/elearning-overview.json`
- Provisioning dashboards:
  - `monitoring/grafana/provisioning/dashboards/dashboard.yml`

Apres redemarrage Grafana, ouvrir:
- `Dashboards` -> dossier `E-Learning` -> `E-Learning Monitoring Overview`

## 6) Requetes Prometheus prêtes

- Voir:
  - `monitoring/PROMETHEUS_QUERIES.md`

## 7) SonarQube local (avant/apres)

- Stack Sonar:
  - `docker-compose.sonar.yml`
- Scripts:
  - `scripts/devops/RUN_SONAR_BASELINE.ps1`
  - `scripts/devops/RUN_SONAR_AFTER_REFACTOR.ps1`

Exemple:
- `docker compose -f docker-compose.sonar.yml up -d`
- `.\scripts\devops\RUN_SONAR_BASELINE.ps1 -SonarToken <token>`
- (refactoring)
- `.\scripts\devops\RUN_SONAR_AFTER_REFACTOR.ps1 -SonarToken <token>`

## 8) Checklist coaching

- Voir:
  - `COACHING_CHECKLIST_SPRINT3.md`
