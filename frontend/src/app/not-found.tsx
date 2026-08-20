import React from "react";
import ErrorState from "@/components/errors/ErrorState";

export const metadata = {
  title: "404 Page Not Found | PlacementAI",
  description: "The page you're looking for doesn't exist or may have been moved.",
};

export default function NotFoundPage() {
  return <ErrorState type="not-found" />;
}
