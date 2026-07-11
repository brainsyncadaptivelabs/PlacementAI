export type UserRole = "STUDENT" | "RECRUITER" | "PLACEMENT_OFFICER" | "ADMIN" | "SUPER_ADMIN";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (!role) return "STUDENT";
  const upper = role.toUpperCase().trim();
  if (upper === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (upper === "ADMIN") return "ADMIN";
  if (upper === "RECRUITER") return "RECRUITER";
  if (upper === "PLACEMENT_OFFICER") return "PLACEMENT_OFFICER";
  return "STUDENT";
}

export function getDashboardRouteForRole(role: string | null | undefined): string {
  const norm = normalizeRole(role);
  switch (norm) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "RECRUITER":
      return "/recruiter";
    case "PLACEMENT_OFFICER":
      return "/placement-officer";
    case "STUDENT":
    default:
      return "/dashboard";
  }
}

export function getProfileCompletionRouteForRole(role: string | null | undefined): string {
  const norm = normalizeRole(role);
  switch (norm) {
    case "RECRUITER":
      return "/complete-profile/recruiter";
    case "PLACEMENT_OFFICER":
      return "/complete-profile/placement-officer";
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "STUDENT":
    default:
      return "/complete-profile/student";
  }
}
