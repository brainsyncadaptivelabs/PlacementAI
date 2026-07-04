# PlacementAI – AI Provider Architecture

> **Current Provider**: NVIDIA Build API (OpenAI-compatible)  
> **Interface**: `AIClient` (provider-agnostic abstraction)  
> **Migration from**: Ollama (`localhost:11434`)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Provider Abstraction](#provider-abstraction)
3. [NVIDIA Build API Configuration](#nvidia-build-api-configuration)
4. [Environment Variables](#environment-variables)
5. [Startup Guide](#startup-guide)
6. [Deployment Guide](#deployment-guide)
7. [Health Endpoint](#health-endpoint)
8. [Troubleshooting](#troubleshooting)
9. [Provider Switching Guide](#provider-switching-guide)
10. [Future Extension Guide](#future-extension-guide)

---

## Architecture Overview

```
HTTP Request
     │
     ▼
┌─────────────────┐    ┌────────────────────────┐    ┌────────────────────────┐
│   Controller    │───▶│    Service Layer        │───▶│   AIClient Interface   │
│  (REST API)     │    │  (Business Logic)       │    │   (Abstraction)        │
└─────────────────┘    └────────────────────────┘    └───────────┬────────────┘
                                                                  │
                                                                  ▼
                                                     ┌────────────────────────┐
                                                     │  NvidiaBuildClient     │
                                                     │  (Active Provider)     │
                                                     └───────────┬────────────┘
                                                                  │  HTTPS + Bearer Auth
                                                                  ▼
                                                     ┌────────────────────────┐
                                                     │  NVIDIA Build API       │
                                                     │  /v1/chat/completions  │
                                                     │  model: llama-3.1-70b  │
                                                     └────────────────────────┘
```

### Key Design Principles

- **Single abstraction point**: All 7 AI-consuming services depend only on `AIClient`
- **Zero provider coupling**: No service imports `NvidiaBuildClient` or any NVIDIA-specific class
- **Fail-fast configuration**: `NvidiaAIProperties.validate()` prevents startup without valid config
- **Secure by default**: API keys never logged, prompt content never exposed in exceptions
- **Retry-aware**: 5xx and rate-limit errors are retried with exponential backoff; 401/403 are not

---

## Provider Abstraction

### `AIClient` Interface

```java
// Location: com.aiplacement.backend.ai.client.AIClient

String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens);

JsonNode generateJson(String systemPrompt, String userPrompt, double temperature,
                      int maxTokens, Function<Throwable, String> fallbackJsonProvider);

Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens);

boolean isHealthy();
```

### Exception Hierarchy

```
AIException (base)
├── AIAuthenticationException  — 401/403 — DO NOT retry
├── AIRateLimitException       — 429     — retry with backoff
├── AITimeoutException         — timeout — retry with backoff
└── AIProviderException        — 5xx     — retry with backoff
```

### AI-Consuming Services

| Service | Feature | Method Used |
|---|---|---|
| `GeminiServiceImpl` | ATS Resume Analysis | `generateJson` |
| `ChatbotServiceImpl` | Chatbot Q&A | `generate` |
| `ChatbotServiceImpl` | Chatbot Streaming | `stream` |
| `MockInterviewServiceImpl` | Interview Questions | `generateJson` (×4) |
| `JdMatchServiceImpl` | JD Match Analysis | `generateJson` |
| `ResumeCompareServiceImpl` | Resume Comparison | `generateJson` |
| `RoadmapServiceImpl` | Career Roadmap | `generateJson` |
| `SkillGapServiceImpl` | Skill Gap Analysis | `generateJson` |

---

## NVIDIA Build API Configuration

All configuration is in `application.yml` under the `nvidia.ai` namespace.

| Property | Default | Description |
|---|---|---|
| `nvidia.ai.api-key` | **Required** | NVIDIA Build API key (env: `NVIDIA_API_KEY`) |
| `nvidia.ai.base-url` | `https://integrate.api.nvidia.com/v1/chat/completions` | API endpoint |
| `nvidia.ai.model` | `meta/llama-3.1-70b-instruct` | Model identifier |
| `nvidia.ai.temperature` | `0.7` | Default sampling temperature |
| `nvidia.ai.max-tokens` | `4096` | Default max output tokens |
| `nvidia.ai.timeout-seconds` | `120` | Per-request timeout |
| `nvidia.ai.retry-attempts` | `3` | Max retry attempts for transient errors |
| `nvidia.ai.retry-delay-ms` | `1000` | Initial retry delay (doubles each attempt) |

### Available Models (NVIDIA Build)

| Model | Best For |
|---|---|
| `meta/llama-3.1-70b-instruct` | **Recommended** — best quality/speed balance |
| `meta/llama-3.1-8b-instruct` | Faster, lower cost, lighter use cases |
| `mistralai/mistral-7b-instruct-v0.3` | Code-focused tasks |
| `microsoft/phi-3-mini-4k-instruct` | Very fast, lightweight responses |

See https://build.nvidia.com/explore/discover for the full model catalog.

---

## Environment Variables

### Required

| Variable | Description |
|---|---|
| `NVIDIA_API_KEY` | **REQUIRED** — Your NVIDIA Build API key |

Get your key at: https://build.nvidia.com → Sign In → API Key

### Optional Overrides

| Variable | Default | Description |
|---|---|---|
| `NVIDIA_API_URL` | See above | Override API endpoint |
| `NVIDIA_MODEL` | `meta/llama-3.1-70b-instruct` | Override model |
| `NVIDIA_TEMPERATURE` | `0.7` | Override default temperature |
| `NVIDIA_MAX_TOKENS` | `4096` | Override max tokens |
| `NVIDIA_TIMEOUT_SECONDS` | `120` | Override request timeout |
| `NVIDIA_RETRY_ATTEMPTS` | `3` | Override retry count |
| `NVIDIA_RETRY_DELAY_MS` | `1000` | Override initial retry delay |

---

## Startup Guide

### Local Development

```bash
# 1. Set your NVIDIA API key
export NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxx

# 2. Start the backend
./mvnw spring-boot:run

# 3. Verify AI health
curl http://localhost:8080/api/health/ai
```

Expected response:
```json
{
  "provider": "NVIDIA Build API",
  "model": "meta/llama-3.1-70b-instruct",
  "status": "UP",
  "latencyMs": 842,
  "timestamp": "2025-07-05T00:00:00Z"
}
```

### Using `.env` File

Create a `.env` file in the project root:
```env
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxx
DB_URL=jdbc:mysql://localhost:3306/placementai
DB_USERNAME=root
DB_PASSWORD=root
```

Then source it before starting:
```bash
source .env && ./mvnw spring-boot:run
```

---

## Deployment Guide

### Docker Compose

Add `NVIDIA_API_KEY` to your environment before running:

```bash
export NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxx
docker-compose up -d
```

The `docker-compose.yml` already passes `NVIDIA_API_KEY` and `NVIDIA_MODEL` to the backend container.

### Kubernetes / Cloud

Set the API key as a Kubernetes secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nvidia-ai-secret
type: Opaque
stringData:
  NVIDIA_API_KEY: nvapi-xxxxxxxxxxxxxxxxxxxxxx
```

Reference in your deployment:
```yaml
env:
  - name: NVIDIA_API_KEY
    valueFrom:
      secretKeyRef:
        name: nvidia-ai-secret
        key: NVIDIA_API_KEY
```

---

## Health Endpoint

```
GET /api/health/ai
```

**Response (200 OK):**
```json
{
  "provider": "NVIDIA Build API",
  "model": "meta/llama-3.1-70b-instruct",
  "status": "UP",
  "latencyMs": 523,
  "timestamp": "2025-07-05T12:34:56.789Z"
}
```

| Field | Values | Description |
|---|---|---|
| `provider` | `NVIDIA Build API` | Active AI provider name |
| `model` | String | Configured model identifier |
| `status` | `UP` / `DOWN` | Provider reachability |
| `latencyMs` | Integer | Round-trip time for health probe (ms) |
| `timestamp` | ISO-8601 | UTC timestamp of the check |

> **Note**: HTTP status is always `200`. Inspect the `status` field to determine provider health.

---

## Troubleshooting

### Application fails to start

**Symptom**: `IllegalStateException: NVIDIA_API_KEY is not set`  
**Fix**: Set the `NVIDIA_API_KEY` environment variable before starting.

---

### Health check returns `DOWN`

**Causes and fixes:**

| Cause | Fix |
|---|---|
| Invalid API key | Verify key at https://build.nvidia.com and update `NVIDIA_API_KEY` |
| Network firewall blocking `integrate.api.nvidia.com` | Open egress to NVIDIA API hosts on port 443 |
| Model not available | Change `NVIDIA_MODEL` to a supported model |
| Rate limit exceeded | Wait and retry, or upgrade your NVIDIA plan |

---

### AI features return fallback/default responses

All AI features have fallback logic. If you see empty/default responses:

1. Check the health endpoint: `GET /api/health/ai`
2. Check backend logs for `[AI]` prefix entries
3. Verify `NVIDIA_API_KEY` is correct and not expired

---

### Slow responses

- Default timeout is 120s. Larger prompts (resumes, transcripts) can take 30–60s.
- Consider switching to a faster model: `NVIDIA_MODEL=meta/llama-3.1-8b-instruct`
- Adjust `NVIDIA_TIMEOUT_SECONDS` if needed.

---

## Provider Switching Guide

To switch to a different AI provider (e.g., OpenAI, Gemini, Anthropic):

### Step 1: Create a new implementation

```java
@Component
public class OpenAIClient implements AIClient {
    @Override
    public String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens) {
        // ... OpenAI API call
    }
    // ... other methods
}
```

### Step 2: Register it as primary

In `AIClientConfig.java`, change the `@Primary` bean:
```java
@Bean
@Primary
public AIClient aiClient() {
    return new OpenAIClient(...);
}
```

### Step 3: Add configuration

Add provider-specific properties to `application.yml` and bind them with a `@ConfigurationProperties` class.

**That's it.** All 7 AI services automatically use the new provider. No business logic changes.

---

## Future Extension Guide

### Adding a new provider

1. Implement `AIClient` interface in `ai/client/impl/`
2. Create a `@ConfigurationProperties` class in `config/ai/`
3. Register as `@Bean @Primary` in `AIClientConfig`
4. Add environment variable documentation

### Supported providers (ready to implement)

| Provider | API Style | SDK Available |
|---|---|---|
| OpenAI | OpenAI Chat Completions | `openai-java` |
| Google Gemini | Gemini API / OpenAI-compat | `google-ai-java` |
| Anthropic Claude | Messages API | `anthropic-sdk-java` |
| Groq | OpenAI-compatible | Standard WebClient |
| Together AI | OpenAI-compatible | Standard WebClient |
| Fireworks AI | OpenAI-compatible | Standard WebClient |
| Azure OpenAI | OpenAI-compatible | `azure-ai-openai` |
| AWS Bedrock | Bedrock Runtime | `aws-sdk-java-v2` |

### Adding provider-specific features

Use Spring profiles to activate different providers per environment:

```yaml
# application-prod.yml
nvidia:
  ai:
    model: meta/llama-3.1-70b-instruct

# application-dev.yml  
nvidia:
  ai:
    model: meta/llama-3.1-8b-instruct  # faster for dev
```

Activate with: `SPRING_PROFILES_ACTIVE=prod`
