# Production Profile Auth Fix Report

### ACTUAL BACKEND GOOGLE AUTH RESPONSE KEYS:
`accessToken`, `refreshToken`, `role`, `profileCompleted`, `planSelected`, `paymentCompleted`, `plan`, `paymentStatus`

### ACTUAL PLACEMENTAI JWT FIELD:
`accessToken`

### CALLBACK TOKEN VALIDATION:
YES (Redirects to `/auth?error=placement_token_missing` or `backend_unreachable` if token exchange fails, preventing invalid redirects to `/dashboard`)

### SUCCESS REDIRECT HAS _pat BEFORE CLIENT CLEANUP:
YES

### AUTHPROVIDER READS _pat:
YES

### TOKEN STORAGE KEY:
`token`

### PROFILE CONSUMER TOKEN STORAGE KEY:
`token`

### API CLIENT TOKEN STORAGE KEY:
`token`

### PROFILE REQUEST PATH:
`/user/profile`

### RESOLVED PROFILE REQUEST URL:
`<NEXT_PUBLIC_API_URL>/user/profile` (resolves to `/api/v1/user/profile` absolute endpoint)

### AUTHORIZATION HEADER ATTACHED:
YES

### TOKEN TYPE USED:
PLACEMENTAI JWT (stored under the key `token` in `localStorage`)

### PROFILE RESPONSE STATUS:
200 OK (When backend is reachable and token is valid)

### ROOT CAUSE:
1. **Unchecked Callback Failures**: The server-side OAuth callback routed to `/dashboard?_role=STUDENT` even if the backend token exchange failed (leaving `placementToken` as `null`). This resulted in the client opening the dashboard without a valid PlacementAI JWT.
2. **Docker Container Loopback Issue**: During server-side fetches within the docker environment, `localhost:8080` resolved to the frontend container itself rather than the backend container, resulting in a connection failure during code-to-session exchange.

### FIX APPLIED:
1. **Enforced Strict Token Validation**: Modified `route.ts` to abort the oauth callback and redirect to `/auth?error=placement_token_missing` (or `backend_unreachable`) if no valid PlacementAI JWT is returned.
2. **Docker Network Resolution**: Added path translation in `route.ts` to automatically map `localhost:8080` to the Docker service host `backend:8080` during server-side fetches.
3. **Enhanced Diagnostics**: Implemented precise HTTP error status handling (401, 403, 404, 500, CORS, Network) in `AppLayout.tsx` to provide clear error descriptions instead of generic connection errors.

### FILES MODIFIED:
* [route.ts](file:///c:/BrainSync%20Company/Applications/PlacementAI/frontend/src/app/auth/callback/route.ts)
* [AppLayout.tsx](file:///c:/BrainSync%20Company/Applications/PlacementAI/frontend/src/components/layout/AppLayout.tsx)
