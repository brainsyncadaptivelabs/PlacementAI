"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ResumeEditorClient = dynamic(
  () => import("./editor-client"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    ),
  }
);

export default function ResumeEditorPage() {
  return <ResumeEditorClient />;
}
