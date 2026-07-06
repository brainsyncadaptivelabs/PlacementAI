# Production Deployment Guide

This guide details the setup and requirements to deploy PlacementAI in a production environment.

## 1. Profiles configuration

The backend supports multiple runtime profiles:
- `dev` (development settings, verbose logging, lenient rate limits)
- `test` (testing configurations, H2 in-memory database)
- `prod` (production-grade security, strict rate limits, and fail-fast startup checks)

To activate the production profile, run the application with the `-Dspring.profiles.active=prod` flag or set the environment variable:
```bash
export SPRING_PROFILES_ACTIVE=prod
```

## 2. Mandatory Production Environment Variables

During production startup, the system will fail-fast and abort boot if any of the following environment variables are missing or set to local development placeholders:

| Variable | Description |
| --- | --- |
| `DB_URL` | The JDBC MySQL database url. |
| `DB_USERNAME` | Production database user username. |
| `DB_PASSWORD` | Production database password. |
| `JWT_SECRET` | 256-bit secret key for signing JWT tokens. |
| `NVIDIA_API_KEY` | NVIDIA Build API Key. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage cloud identifier. |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret. |

---

## 3. Logs

Log files are placed under the `logs/` directory and roll daily with compression:
- `logs/application.log`: Core application flows and standard operations.
- `logs/ai.log`: Specialized AI requests details (model, prompt size, response size, latency, widgets).
- `logs/security.log`: Spring security auditing, logins, and authentication events.
- `logs/error.log`: Warn and Error level exceptions.

---

## 4. Rate Limiting

The application applies strict rate limiting using Redis / Bucket4j:
- **Login**: 5 requests/min per IP
- **Signup**: 3 requests/hour per IP
- **Chat**: 60 requests/min per User
- **Resume Upload / File Upload**: 10 requests/hour per User
- **ATS scans**: 20 requests/hour per User
- **Mock Interviews**: 15 requests/hour per User

Custom limits can be tuned using the corresponding environment variables defined in the `.env.example` file.
