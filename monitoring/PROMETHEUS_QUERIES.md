# Prometheus - Requetes utiles pour la demo

## Disponibilite

- Tous les targets:
  - `up`
- Nombre de cibles actives:
  - `sum(up)`
- Cibles indisponibles:
  - `up == 0`

## CPU / Memoire (host)

- CPU usage global (%):
  - `100 * (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])))`
- Memoire utilisee (%):
  - `100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))`

## Optionnel microservices Spring (si actuator prometheus actif)

- Requetes HTTP totales:
  - `sum(rate(http_server_requests_seconds_count[5m])) by (application, status)`
- Erreurs 5xx:
  - `sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (application)`
- Latence p95:
  - `histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, application))`

## Checklist rapide demo

1. Ouvrir `http://localhost:9091`.
2. Tester `up` puis `sum(up)`.
3. Montrer CPU et memoire.
4. Capturer un ecran "avant" puis un ecran "apres" (si correction/refactoring).
