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

DOCKERFILE ENTRYPOINT/CMD:
`ENTRYPOINT ["java", "-jar", "app.jar"]`

APPLICATION START COMMAND:
`java -jar app.jar`

DOCKERFILE BUILDS JAR:
YES

JAR SOURCE:
Maven build stage inside the Dockerfile (`/app/target/*.jar`)

RAILWAY CUSTOM BUILD COMMAND REDUNDANT:
YES

EFFECTIVE SERVER PORT:
`${PORT:8080}`

RAILWAY PORT SUPPORTED:
YES

TARGET PORT 8080 CORRECT:
YES

APPLICATION LOOPBACK BOUND:
NO (binds to all interfaces)

HEALTH ENDPOINT:
`/actuator/health`

HEALTH ENDPOINT PUBLIC:
YES

HEALTHCHECK PATH SAFE:
YES

ROOT DIRECTORY /backend CORRECT:
YES

DOCKERFILE PATH CORRECT:
YES

EMPTY CUSTOM START COMMAND CORRECT:
YES

PRODUCTION STARTUP VALIDATOR SAFE:
YES (Fixed. Superseded Supabase URL/Key placeholder check to prevent false positive startup crashes when using production credentials).

PRIVATE SECRETS HARDCODED:
NO

REPOSITORY DEPLOYMENT DEFECT FOUND:
YES (ProductionStartupValidator false positive startup crash when using production credentials, fixed).

FILES CHANGED:
* [backend/src/main/java/com/aiplacement/backend/config/ProductionStartupValidator.java](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/src/main/java/com/aiplacement/backend/config/ProductionStartupValidator.java)
* [frontend/src/app/auth/callback/route.ts](file:///c:/BrainSync%20Company/Applications/PlacementAI/frontend/src/app/auth/callback/route.ts)

BACKEND BUILD:
PASS

GIT COMMIT:
`e677b45a420dd588d8c0056bebc133a688265451`

GIT PUSH:
PASS

LOCAL HEAD:
`e677b45a420dd588d8c0056bebc133a688265451`

ORIGIN MAIN HEAD:
`e677b45a420dd588d8c0056bebc133a688265451`

REDEPLOY EXPECTED:
YES

RAILWAY DASHBOARD USER ACTION REQUIRED:
1. **Set Root Directory**: Ensure the service's **Root Directory** in the Railway Dashboard settings is configured to `/backend`.
2. **Configure Custom Builder**: Verify that the builder type is set to **Dockerfile**, and the Dockerfile path is **Dockerfile**.
3. **Remove Redundant Build Command**: Clear the Custom Build Command setting (set to empty) since the Dockerfile performs its own build.
4. **Environment Variables**: Configure the required environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `NVIDIA_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Verify Custom Domain**: Ensure that custom domain verification for `api.placementai.in` is active in the Railway Settings dashboard and matches DNS records.

PRODUCTION HEALTH VERIFIED:
NO (redeploy required on Railway to execute the fixed repository code)
