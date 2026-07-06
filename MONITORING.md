# Monitoring and Metrics Guide

PlacementAI uses Spring Boot Actuator and Micrometer to collect and expose JVM, server, and custom domain metrics.

## 1. Enabled Endpoints

The following Actuator endpoints are exposed under `/actuator/*`:

- **Health status**: `/actuator/health` (Returns `"status": "UP"` when database, mail, and other systems are healthy)
- **Application Info**: `/actuator/info`
- **Exposed Metrics**: `/actuator/metrics`
- **Prometheus Scrape Endpoint**: `/actuator/prometheus` (Exposed in Prometheus exposition format)

---

## 2. Custom Metrics

We collect the following domain-specific metrics under the `placementai.` namespace:

| Metric Name | Type | Description |
| --- | --- | --- |
| `placementai.chats.total` | Counter | Total number of chat messages sent. |
| `placementai.ats.scans.total` | Counter | Total number of ATS resume scans completed. |
| `placementai.resumes.uploaded.total` | Counter | Total number of resumes uploaded. |
| `placementai.interviews.mock.total` | Counter | Total number of mock interviews generated. |
| `placementai.widgets.generated.total` | Counter | Total number of interactive widgets rendered. |
| `placementai.users.active` | Gauge | The number of active unique authenticated users in the last 15 minutes. |
| `placementai.ai.latency` | Timer | Latency distribution of AI completions. |
| `placementai.ai.requests.total` | Counter | Total number of AI completions triggered. |
| `placementai.ai.reflection.total` | Counter | Total number of AI self-reflection runs. |

---

## 3. Configuring Prometheus

To scrape the metrics, configure your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'placementai-backend'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8080']
```
