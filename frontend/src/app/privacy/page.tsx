import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | PlacementAI",
  description: "Learn about how PlacementAI collects, uses, processes, and protects your resume, career details, and AI analysis data under applicable laws.",
};

const sections = [
  { id: "intro", title: "1. Introduction" },
  { id: "collect", title: "2. Information We Collect" },
  { id: "resume", title: "3. Resume and Career Data" },
  { id: "ai-processing", title: "4. AI-Powered Processing" },
  { id: "use-info", title: "5. How We Use Information" },
  { id: "auth-info", title: "6. Authentication Information" },
  { id: "recruiter-college", title: "7. Recruiter and College Interactions" },
  { id: "data-sharing", title: "8. Data Sharing" },
  { id: "third-party", title: "9. Third-Party Service Providers" },
  { id: "storage-security", title: "10. Data Storage and Security" },
  { id: "retention", title: "11. Data Retention" },
  { id: "rights-choices", title: "12. User Rights and Choices" },
  { id: "deletion", title: "13. Account and Data Deletion" },
  { id: "cookies", title: "14. Cookies and Similar Technologies" },
  { id: "children", title: "15. Children's Privacy" },
  { id: "international", title: "16. International Data Processing" },
  { id: "changes", title: "17. Changes to This Policy" },
  { id: "contact", title: "18. Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="July 14, 2026"
      introduction="At PlacementAI, we respect your privacy and are committed to protecting the personal data we process. This Privacy Policy describes how we collect, use, store, and share information when you use our platform."
      sections={sections}
    >
      <section id="intro" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">1. Introduction</h2>
        <p className="text-muted-foreground leading-relaxed">
          PlacementAI (hereinafter referred to as &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides an AI-powered campus placement preparation platform. This Privacy Policy governs the processing of personal data collected from students, recruiters, and placement officers utilizing our platform and services. By accessing or using PlacementAI, you agree to the practices outlined in this policy, subject to applicable law.
        </p>
      </section>

      <section id="collect" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">2. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          We collect various categories of information depending on your role and how you interact with the platform:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Account Information:</strong> Includes your full name, email address, profile photo, and security credentials or OAuth identifiers (such as Google or GitHub authentication identifiers).
          </li>
          <li>
            <strong>Career Profile Information:</strong> Details regarding your education, graduation year, academic department, CGPA, technical skills, professional certifications, projects, work experience, and career preferences.
          </li>
          <li>
            <strong>Placement Preparation Data:</strong> Performance logs from coding exercises, aptitude assessment results, practice records, and text or audio transcriptions from mock interview sessions.
          </li>
          <li>
            <strong>Recruiter/College Information:</strong> For enterprise users, we collect corporate/institutional details, placement drive configurations, department records, and officer credentials.
          </li>
        </ul>
      </section>

      <section id="resume" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">3. Resume and Career Data</h2>
        <p className="text-muted-foreground leading-relaxed">
          As a core feature, PlacementAI processes uploaded documents and resumes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>We extract text contents, document structure, and metadata from uploaded PDF or DOCX files.</li>
          <li>We store historical records of your ATS analysis, feedback sessions, and compatibility scores to help you track your progress over time.</li>
          <li>Your raw resume file is stored in secure, access-restricted cloud storage buckets and is retrieved only for your display or authorized recruiter matching purposes.</li>
        </ul>
      </section>

      <section id="ai-processing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">4. AI-Powered Processing</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your resume text, career profile, and mock interview answers are processed using advanced Artificial Intelligence models to generate resume improvements, ATS scoring estimates, skill gap analysis, job compatibility indicators, and interview feedback.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong>Important Notice:</strong> AI-generated suggestions, scoring, and analysis are provided for decision-support and educational guidance only. AI outputs are not guaranteed to be completely accurate, exhaustive, or free of bias, and should not be used as the sole basis for career planning or application modifications.
        </p>
      </section>

      <section id="use-info" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">5. How We Use Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use the collected information for the following purposes, subject to applicable law:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>To provide and maintain the core functions of the PlacementAI platform.</li>
          <li>To calculate skill gap metrics, ATS scores, and generate mock interview grading.</li>
          <li>To support recruiter sourcing pipeline matching and institutional placement drives.</li>
          <li>To monitor platform performance, fix software errors, and prevent malicious abuse.</li>
        </ul>
      </section>

      <section id="auth-info" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">6. Authentication Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          Our platform relies on Supabase Auth and secure JWT configurations to handle user sessions. Login credentials, authentication tokens, and access tokens are managed using standard cryptographic mechanisms and are stored on your local browser (using LocalStorage or secure cookies) to persist your active session. We do not store plain-text passwords on our servers.
        </p>
      </section>

      <section id="recruiter-college" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">7. Recruiter and College Interactions</h2>
        <p className="text-muted-foreground leading-relaxed">
          PlacementAI operates both student-facing and institution-facing services. Your career data, resume text, and scores are not automatically shared or visible to recruiters or academic institutions. Visibility and sharing depend entirely on your explicit actions (such as applying to a job posting or joining an institutional workspace) and your college&apos;s enterprise permission configurations.
        </p>
      </section>

      <section id="data-sharing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">8. Data Sharing</h2>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell your personal data or resume information to third parties. We share information only in limited circumstances, such as:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>When you explicitly request sharing (e.g., applying to recruiter roles).</li>
          <li>To comply with valid legal processes, government orders, or applicable regulations.</li>
          <li>To protect the rights, property, and safety of PlacementAI users and the public.</li>
        </ul>
      </section>

      <section id="third-party" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">9. Third-Party Service Providers</h2>
        <p className="text-muted-foreground leading-relaxed">
          We partner with secure third-party infrastructure and service vendors to operate our platform, including database hosting providers, cloud storage networks, AI API services (such as Google Gemini, NVIDIA), authentication providers (Supabase), and platform analytics. These processors are contractually bound to access data only for configured platform services and to safeguard your information.
        </p>
      </section>

      <section id="storage-security" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">10. Data Storage and Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We host your data on secure cloud infrastructure. We implement reasonable technical and organizational safeguards designed to protect personal data from accidental loss, unauthorized access, alteration, or disclosure. However, no database, network transmission, or internet storage system can be guaranteed to be completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section id="retention" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">11. Data Retention</h2>
        <p className="text-muted-foreground leading-relaxed">
          We retain your personal data for as long as your account remains active or as required to fulfill the business purposes described in this policy, unless a longer retention period is mandated by law. If you delete your account, we follow our deletion procedures.
        </p>
      </section>

      <section id="rights-choices" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">12. User Rights and Choices</h2>
        <p className="text-muted-foreground leading-relaxed">
          Subject to applicable local law, you have the right to access, inspect, correct, update, or request the erasure of your personal data stored on our platform. You may update your profile details and resume uploads at any time through the student settings dashboard.
        </p>
      </section>

      <section id="deletion" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">13. Account and Data Deletion</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you wish to terminate your relationship and permanently remove your data, you can trigger account deletion directly in the dashboard under settings. Deletion requests are processed immediately across our primary databases, which removes your profile, uploaded resumes, history, and interview records. Stored backups are overwritten within our standard retention cycle.
        </p>
      </section>

      <section id="cookies" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">14. Cookies and Similar Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We utilize essential, session, preference, and analytics cookies to optimize platform performance. You can manage your cookie preferences through your web browser configurations. For detailed information, please consult our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
        </p>
      </section>

      <section id="children" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">15. Children&apos;s Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          PlacementAI is designed for students seeking higher education placement and career guidance. It is not intended for use by children under the age of 16 (or the legal age under local regulations). We do not knowingly collect personal data from children.
        </p>
      </section>

      <section id="international" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">16. International Data Processing</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your personal data may be transferred to and processed in countries other than your country of residence, where data protection laws may differ. However, we ensure that transfers are conducted in compliance with applicable law and under appropriate security safeguards.
        </p>
        <p className="text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
          <strong>Digital Personal Data Protection (DPDP) Act, 2023 (India):</strong> Because we provide placement services primarily to students in India, we handle personal data in accordance with the applicable provisions of the DPDP Act, 2023. If you reside in India, you are entitled to the rights of a Data Principal under the Act, subject to applicable rules and timelines.
        </p>
      </section>

      <section id="changes" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">17. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to modify this Privacy Policy at any time. Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. We encourage you to review this policy periodically to stay informed about our data handling practices.
        </p>
      </section>

      <section id="contact" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">18. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions, concerns, or requests regarding this Privacy Policy or your personal data rights, please contact the PlacementAI support team or reach out to us at:
        </p>
        <p className="font-bold text-muted-foreground">
          Email: support@brainsyncadaptivelabs.com
        </p>
      </section>
    </LegalLayout>
  );
}
