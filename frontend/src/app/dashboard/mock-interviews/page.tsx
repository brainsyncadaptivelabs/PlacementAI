"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MockInterviewRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mock-interview");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium">Redirecting to Mock Interview Dashboard...</p>
    </div>
  );
}
