import React from "react";
import { ResumeTemplateProps } from "./types/TemplateTypes";
import { ResumeRenderer } from "./ResumeRenderer";

export const PreviewRenderer: React.FC<ResumeTemplateProps> = (props) => {
  return <ResumeRenderer {...props} previewMode={true} />;
};
