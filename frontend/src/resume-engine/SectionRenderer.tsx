import React from "react";
import { ResumeTemplateProps } from "./types/TemplateTypes";
import { TemplateEngine } from "./TemplateEngine";

export const SectionRenderer: React.FC<ResumeTemplateProps> = (props) => {
  return <TemplateEngine {...props} />;
};
