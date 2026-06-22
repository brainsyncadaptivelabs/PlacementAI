import React from 'react';
import { TemplateProps } from '../../types';
import './template.css';

const DeedyTemplate: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, education, experience, projects, skills, sectionOrder } = data;

  // We respect section order for the right column
  const renderRightSection = (sectionId: string) => {
    switch(sectionId) {
      case 'experience':
        return (
          <div key="exp" className="mb-6">
            <div className="deedy-section-title">Experience</div>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div className="deedy-item-title">{exp.role}</div>
                  <div className="deedy-date">{exp.startDate} - {exp.endDate}</div>
                </div>
                <div className="deedy-item-subtitle">{exp.company} | {exp.location}</div>
                <ul className="deedy-list">
                  {exp.description.map((desc, i) => <li key={i}>{desc}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'projects':
        return (
          <div key="proj" className="mb-6">
            <div className="deedy-section-title">Projects</div>
            {projects.map(proj => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <div className="deedy-item-title">{proj.name}</div>
                  <div className="deedy-date">{proj.startDate} - {proj.endDate}</div>
                </div>
                <div className="deedy-item-subtitle">{proj.technologies.join(', ')}</div>
                <ul className="deedy-list">
                  {proj.description.map((desc, i) => <li key={i}>{desc}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="deedy-container">
      {/* Left Column */}
      <div className="deedy-left">
        <div className="deedy-header">
          <h1>{personalInfo.name.split(' ')[0]} <br/> <strong>{personalInfo.name.split(' ').slice(1).join(' ')}</strong></h1>
          <h2>{personalInfo.title}</h2>
        </div>

        <div className="mb-6">
          <div className="deedy-contact-item">{personalInfo.email}</div>
          <div className="deedy-contact-item">{personalInfo.phone}</div>
          <div className="deedy-contact-item">{personalInfo.location}</div>
          <div className="deedy-contact-item">{personalInfo.linkedin}</div>
          <div className="deedy-contact-item">{personalInfo.github}</div>
        </div>

        <div className="mb-6">
          <div className="deedy-section-title">Education</div>
          {education.map(edu => (
            <div key={edu.id} className="mb-4">
              <div className="deedy-item-title">{edu.degree} in {edu.field}</div>
              <div className="deedy-item-subtitle">{edu.institution}</div>
              <div className="deedy-date text-left">{edu.startDate} - {edu.endDate}</div>
              <div className="text-[9pt] mt-1">GPA: {edu.gpa}</div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="deedy-section-title">Skills</div>
          {skills.map(skill => (
            <div key={skill.category} className="mb-2">
              <strong className="text-[10pt]">{skill.category}:</strong><br/>
              <span className="text-[9pt] leading-tight text-slate-600">{skill.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="deedy-right">
        {sectionOrder.map(section => renderRightSection(section))}
      </div>
    </div>
  );
};

export default DeedyTemplate;