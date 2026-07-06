import React from "react";
import { ResumeTemplateProps, TemplateMode } from "./types/TemplateTypes";
import { ResumeRenderer } from "./ResumeRenderer";

export const ExportRenderer: React.FC<ResumeTemplateProps> = (props) => {
  return <ResumeRenderer {...props} previewMode={false} mode={TemplateMode.EXPORT} />;
};
