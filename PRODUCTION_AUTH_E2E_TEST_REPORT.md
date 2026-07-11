# PRODUCTION E2E AUTHENTICATION TEST REPORT

PRODUCTION URL:
https://www.placementai.in

LOCAL HEAD:
a379b7cf3eaebb36575d1933b3f75e6fb1c157bb

ORIGIN MAIN:
a379b7cf3eaebb36575d1933b3f75e6fb1c157bb

LATEST FIX PUSHED:
YES

PRODUCTION LATEST FIX VERIFIED:
NO (real test failed)

NON-WWW REDIRECT:
PASS

CANONICAL HOST:
www.placementai.in

AUTH PAGE:
PASS

OAUTH redirectTo:
https://www.placementai.in/auth/callback?role=STUDENT

GOOGLE OAUTH INITIATED:
PASS

MANUAL GOOGLE ACCOUNT ACTION:
COMPLETED

CALLBACK:
REACHED

CALLBACK HOST:
www.placementai.in

CALLBACK EXECUTION COUNT:
1

SUPABASE EXCHANGE:
FAIL

SUPABASE EXCHANGE ERROR CATEGORY:
unknown (logs unavailable; enriched URL parameters added to identify in next run)

BACKEND GOOGLE AUTH:
NOT REACHED / FAILED (to be confirmed via new diagnostics URL parameters)

PLACEMENTAI JWT:
NOT REACHED

DASHBOARD REDIRECT:
NOT REACHED

PAT RECEIVED:
NOT REACHED

PAT STORED:
NOT REACHED

CUSTOM AUTH EVENT:
NOT REACHED

PROFILE REQUEST URL:
not reached

PROFILE HTTP STATUS:
not reached

AUTHORIZATION HEADER:
NOT REACHED

PROFILE USER:
NOT REACHED

APPLAYOUT STATE:
not reached

FINAL PATH:
/auth?error=oauth_failed

REFRESH PERSISTENCE:
NOT EXECUTED

CONNECTION PROBLEM SCREEN:
NOT SHOWN

OAUTH_FAILED:
SHOWN

CALLBACK_ERROR:
NOT SHOWN

OVERALL RESULT:
FAIL

EXACT FAILED STAGE:
exchangeCodeForSession(code)

PROVEN ROOT CAUSE:
none (Active production callback logs are not accessible from this environment. Next.js server logs are managed inside Vercel Runtime Logs. The callback has been updated with enriched URL redirect diagnostics to immediately surface the exact code/error when retried after redeployment.)

FIX APPLIED DURING TEST:
1. Removed invalid Docker container hostname translation (`localhost:8080` -> `backend:8080`) from the Route Handler, as Vercel runs on serverless architecture separate from Railway's Docker network.
2. Standardized API URL resolution to use `process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL` without falling back to localhost or internal Docker hostnames.
3. Enriched `route.ts` redirect actions with safe detailed diagnostics (exposing no secrets or tokens) to bubble up exchange and backend failures to the URL query string.

FILES MODIFIED:
* [frontend/src/app/auth/callback/route.ts](file:///c:/BrainSync%20Company/Applications/PlacementAI/frontend/src/app/auth/callback/route.ts)

REDEPLOY REQUIRED:
YES

RETEST REQUIRED AFTER REDEPLOY:
YES

USER ACTION REQUIRED:
1. Deploy the updated frontend code containing the enriched callback diagnostics and corrected API URL routing to production.
2. Ensure the following environment variables are correctly configured in Vercel:
   - `NEXT_PUBLIC_API_URL=https://api.placementai.in/api/v1`
   - `API_URL=https://api.placementai.in/api/v1`
3. Inspect and correct the Railway backend service deployment, as both `https://api.placementai.in` and the direct domain `https://v7iacpes.up.railway.app` are currently returning a `404 Not Found` (`x-railway-fallback: true`).
4. Verify the Supabase Dashboard -> Authentication -> URL Configuration settings:
   - Site URL: `https://www.placementai.in`
   - Redirect URLs: `https://www.placementai.in/auth/callback`
