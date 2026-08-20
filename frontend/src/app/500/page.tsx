import React from "react";
import ErrorState from "@/components/errors/ErrorState";

export const metadata = {
  title: "500 Server Error | PlacementAI",
  description: "Something went wrong on our side. Please try again in a moment.",
};

export default function ServerErrorPage() {
  return (
    <ErrorState
      type="server"
      code="500"
      title="Server Error"
      description="Something went wrong on our side. Please try again in a moment."
    />
  );
}
