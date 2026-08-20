import React from "react";
import ErrorState from "@/components/errors/ErrorState";

export const metadata = {
  title: "403 Access Restricted | PlacementAI",
  description: "You don't have permission to access this resource.",
};

export default function ForbiddenPage() {
  return (
    <ErrorState
      type="forbidden"
      code="403"
      title="Access Restricted"
      description="You don't have permission to access this resource."
      secondaryActionText="Go Back"
    />
  );
}
