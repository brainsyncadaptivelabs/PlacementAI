import React from "react";
import ErrorState from "@/components/errors/ErrorState";

export const metadata = {
  title: "Authentication Required | PlacementAI",
  description: "You need to sign in to access this page.",
};

export default function UnauthorizedPage() {
  return (
    <ErrorState
      type="unauthorized"
      code="401"
      title="Authentication Required"
      description="You need to sign in to access this page."
      primaryActionText="Sign In"
      primaryActionHref="/auth"
    />
  );
}
