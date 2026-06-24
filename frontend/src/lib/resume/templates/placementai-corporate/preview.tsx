import React from "react";
import CorporateRenderer from "./renderer";
import { initialCorporateState } from "./schema";

export default function CorporatePreview() {
  return (
    <div className="w-full h-full scale-[0.35] origin-top center overflow-hidden pointer-events-none flex justify-center bg-card">
      <CorporateRenderer data={initialCorporateState} previewMode={true} />
    </div>
  );
}
