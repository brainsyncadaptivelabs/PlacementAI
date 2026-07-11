# Production OAuth Exchange Fix Report

REAL PRODUCTION TEST:
FAILED

FINAL URL:
https://www.placementai.in/auth?error=oauth_failed

ACTUAL EXCHANGE ERROR NAME:
UNKNOWN (Logs are not directly accessible from this environment)

ACTUAL EXCHANGE ERROR MESSAGE:
UNKNOWN (Logs are not directly accessible from this environment)

ACTUAL EXCHANGE ERROR STATUS:
UNKNOWN

CLASSIFIED CATEGORY:
UNKNOWN

CALLBACK COOKIE NAMES:
UNKNOWN

PKCE STATE PRESENT:
UNKNOWN

OAUTH CLIENT FACTORY:
createBrowserClient from @supabase/ssr

CALLBACK CLIENT FACTORY:
createServerClient from @supabase/ssr

OAUTH STORAGE MODEL:
cookie-based (document.cookie managed by @supabase/ssr)

CALLBACK STORAGE MODEL:
cookie-based (cookieStore managed by @supabase/ssr)

PROVEN ROOT CAUSE:
ACTIVE PRODUCTION CALLBACK LOGS ARE NOT ACCESSIBLE FROM THIS ENVIRONMENT. Next.js server logs are hosted on Vercel and must be accessed via Vercel Runtime Logs. The canonical domain redirect is correctly aligned, but oauth_failed still occurs. 
In addition, we identified that the server callback was previously translating `localhost:8080` to `backend:8080` under the assumption that they shared a Docker network, which is invalid since the frontend runs on Vercel. 

Furthermore, testing the Railway backend `https://api.placementai.in` and `https://v7iacpes.up.railway.app` directly returns a `404 Not Found` from Railway (`x-railway-fallback: true`), indicating the backend service is either down, suspended, or its custom domain mappings are broken.

PREVIOUS CANONICAL HOST ASSUMPTION:
CONFIRMED (The canonical non-www -> www redirect is fully active, but oauth_failed still occurs).

FIX APPLIED:
1. Removed invalid Docker container hostname translation (`localhost:8080` -> `backend:8080`) from the Route Handler, as Vercel runs on serverless architecture separate from Railway's Docker network.
2. Standardized API URL resolution to use `process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL` without falling back to localhost or internal Docker hostnames.
3. Enriched `route.ts` redirect actions with safe detailed diagnostics (exposing no secrets or tokens) to bubble up exchange and backend failures to the URL query string.

FILES MODIFIED:
* [frontend/src/app/auth/callback/route.ts](file:///c:/BrainSync%20Company/Applications/PlacementAI/frontend/src/app/auth/callback/route.ts)

TYPECHECK:
PASS

FRONTEND BUILD:
PASS

REDEPLOY REQUIRED:
YES

---

### DNS & DEPLOYMENT ARCHITECTURE REPORT

FRONTEND:
Vercel

FRONTEND DOMAIN:
https://www.placementai.in

BACKEND:
Railway

BACKEND DOMAIN:
https://api.placementai.in

FRONTEND/BACKEND SAME CONTAINER NETWORK:
NO

VERCEL CAN RESOLVE backend:8080:
NO

PRODUCTION BROWSER API:
https://api.placementai.in/api/v1

PRODUCTION SERVER API:
https://api.placementai.in/api/v1

APEX DNS CONFLICT OBSERVED:
YES

Observed apex records:
* A @ -> 216.198.79.1
* CNAME @ -> 519dd5zf.up.railway.app.

Note: Apex DNS should be reviewed. Standard DNS rules do not allow a CNAME and A record to coexist at the zone apex (`@`), and a CNAME at the apex is generally invalid.
