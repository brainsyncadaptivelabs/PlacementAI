# RAILWAY BACKEND DIAGNOSIS REPORT

EXPECTED SERVICE:
Spring Boot PlacementAI backend

EXPECTED DOMAIN:
api.placementai.in

EXPECTED API PREFIX:
/api/v1

GOOGLE AUTH:
POST /api/v1/auth/google

PROFILE:
GET /api/v1/user/profile

RAILWAY ROOT DIRECTORY:
`/backend` (This setting must be explicitly configured in the Railway service settings so the build context matches the paths defined in `backend/Dockerfile`)

RAILWAY DOCKERFILE:
`Dockerfile` (relative to the `/backend` root directory)

START COMMAND:
`ENTRYPOINT ["java", "-jar", "app.jar"]` (runs the repackaged backend jar copied into `/app/app.jar`)

SERVER PORT:
Dynamically bound to the `PORT` environment variable provided by Railway (falls back to `8080` if absent, configured via `application.yml` as `${PORT:8080}`)

PRODUCTION PROFILE:
`prod` (activated via the `SPRING_PROFILES_ACTIVE=prod` environment variable)

HEALTH ENDPOINT:
`/actuator/health` (publicly accessible and permitted by SecurityConfig)

STARTUP BLOCKERS:
1. Missing or dev-default database url, username, or password (`spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`).
2. Missing or dev-default `jwt.secret` (`YOUR_JWT_SECRET_PLACEHOLDER`).
3. Missing or dev-default `nvidia.ai.api-key` (`YOUR_NVIDIA_API_KEY_PLACEHOLDER`).
4. Resolved Supabase URL or Anon Key matching default placeholders (Fixed in repository by updating checked placeholder strings in `ProductionStartupValidator.java` to avoid false positives when using production credentials).

REQUIRED RAILWAY VARIABLES:
* `SPRING_PROFILES_ACTIVE` (must be set to `prod`)
* `DB_URL`
* `DB_USERNAME`
* `DB_PASSWORD`
* `JWT_SECRET`
* `NVIDIA_API_KEY`
* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`

REPOSITORY FIX REQUIRED:
YES (Fixed `ProductionStartupValidator.java` to prevent fatal startup failure when using production Supabase credentials).

RAILWAY DASHBOARD ACTION REQUIRED:
YES (Ensure custom domain verification for `api.placementai.in` is active and fully verified with TXT ownership records, set the Service Root Directory to `/backend`, and supply all mandatory environment variables).
