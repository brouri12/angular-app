# Checklist coaching - Sprint 3 DevOps

## A. CI/CD backend et frontend

- [ ] Montrer `.github/workflows/_backend-service-ci.yml`
- [ ] Montrer un pipeline CI backend par microservice (`*-ci.yml`)
- [ ] Montrer `frontend-ci.yml`
- [ ] Montrer `backend-cd.yml` (CD global backend)

## B. Tests unitaires dans les pipelines

- [ ] Capture run CI backend avec etape tests reussie
- [ ] Capture run CI frontend avec etape tests reussie
- [ ] Capture artefacts de rapports (coverage / surefire)

## C. SonarQube (avant/apres)

- [ ] Démarrer SonarQube local: `docker compose -f docker-compose.sonar.yml up -d`
- [ ] Lancer baseline:
  - `.\scripts\devops\RUN_SONAR_BASELINE.ps1 -SonarToken <token>`
- [ ] Capture etat "avant correction"
- [ ] Appliquer refactoring ciblé
- [ ] Lancer after-refactor:
  - `.\scripts\devops\RUN_SONAR_AFTER_REFACTOR.ps1 -SonarToken <token>`
- [ ] Capture etat "apres correction"
- [ ] Montrer amelioration + coverage

## D. Monitoring

- [ ] Démarrer monitoring:
  - `docker compose -f docker-compose.monitoring.yml up -d`
- [ ] Capture Prometheus query `up`
- [ ] Capture Prometheus query `sum(up)`
- [ ] Capture dashboard Grafana `E-Learning Monitoring Overview`

## E. S12 (prochaine semaine)

- [ ] Préparer architecture kubeadm (schema nodes/control plane)
- [ ] Choisir meme virtualisation pour tout le groupe (WSL recommande)
- [ ] Definir sujet "excellence" (outil/feature non vue en cours)
