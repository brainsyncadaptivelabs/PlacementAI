# Production Route Map

Below is the complete route inventory of the PlacementAI application, detailing the authentication requirements, roles, redirects, and current status.

| Route | Route Type | Auth Required | Allowed Role | Expected Redirect | Current Redirect Logic | Status |
|---|---|---|---|---|---|---|
| `/` | PUBLIC | NONE | All | None | None | Active |
| `/auth` | PUBLIC | NONE | All | Redirects to `/dashboard` if student token exists. | Client auth state listener checks for tokens on mount. | Active |
| `/auth/recruiter` | PUBLIC | NONE | All | Redirects to `/recruiter` if recruiter token exists. | Client auth state listener checks for tokens on mount. | Active |
| `/auth/placement-officer` | PUBLIC | NONE | All | Redirects to `/placement-officer` if officer token exists. | Client auth state listener checks for tokens on mount. | Active |
| `/auth/callback` | CALLBACK | NONE | All | Dynamic redirect to role dashboard based on JWT. | Exchanges OAuth code for session, calls `/auth/google` backend api, redirects to dashboard with tokens. | Active |
| `/auth/forgot-password` | PUBLIC | NONE | All | None | None | Active |
| `/auth/reset-password` | PUBLIC | NONE | All | None | None | Active |
| `/auth/verify-email` | PUBLIC | NONE | All | None | None | Active |
| `/dashboard` | PROTECTED | YES | STUDENT | `/complete-profile/student` if profile is incomplete. | `AppLayout` checks `profileCompleted` and redirects. | Active |
| `/dashboard/ats` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/ats/analysis` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/ats/analysis/[id]` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/coach` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/history` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/mock-interviews` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/profile` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/roadmap` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/dashboard/settings` | PROTECTED | YES | STUDENT | None | Standard Student Route | Active |
| `/complete-profile` | PROTECTED | YES | ALL | `/complete-profile/[role]` | Redirects to the specific completion page depending on user role. | Active |
| `/complete-profile/student` | PROTECTED | YES | STUDENT | `/success/student` on completion | Standard Profile Form | Active |
| `/complete-profile/recruiter` | PROTECTED | YES | RECRUITER | `/success/recruiter` on completion | Standard Profile Form | Active |
| `/complete-profile/placement-officer` | PROTECTED | YES | PLACEMENT_OFFICER | `/placement-officer` on completion | Standard Profile Form | Active |
| `/recruiter` | PROTECTED | YES | RECRUITER | `/complete-profile/recruiter` if profile is incomplete. | `AppLayout` checks `profileCompleted` and redirects. | Active |
| `/recruiter/settings` | PROTECTED | YES | RECRUITER | None | Standard Recruiter Route | Active |
| `/recruiter/candidates` | PROTECTED | YES | RECRUITER | None | Standard Recruiter Route | Active |
| `/recruiter/candidates/[id]` | PROTECTED | YES | RECRUITER | None | Standard Recruiter Route | Active |
| `/placement-officer` | PROTECTED | YES | PLACEMENT_OFFICER | `/complete-profile/placement-officer` if profile is incomplete. | `AppLayout` checks `profileCompleted` and redirects. | Active |
| `/placement-officer/settings` | PROTECTED | YES | PLACEMENT_OFFICER | None | Standard Officer Route | Active |
| `/admin` | PROTECTED | YES | ADMIN / SUPER_ADMIN | Renders login page locally if not authenticated. | Verification is managed via `/admin/auth/session` calls. | Active |
| `/success/student` | PUBLIC | NONE | All | None | Landing screen after completion | Active |
| `/success/recruiter` | PUBLIC | NONE | All | None | Landing screen after completion | Active |
