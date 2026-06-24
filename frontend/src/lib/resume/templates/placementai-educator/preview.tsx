import React from "react";
import EducatorRenderer from "./renderer";
import { initialEducatorState } from "./schema";

export default function EducatorPreview() {
  return (
    <div className="w-full h-full scale-[0.35] origin-top center overflow-hidden pointer-events-none flex justify-center bg-card">
      <EducatorRenderer data={initialEducatorState} previewMode={true} />
    </div>
  );
}
