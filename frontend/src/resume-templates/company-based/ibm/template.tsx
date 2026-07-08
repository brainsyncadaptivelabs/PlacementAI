import React from "react";
import { ResumeTemplateProps } from "@/resume-engine/types/TemplateTypes";
import { TemplateEngine } from "@/resume-engine/TemplateEngine";

export const Template: React.FC<ResumeTemplateProps> = (props) => {
  return <TemplateEngine {...props} />;
};

export default Template;
