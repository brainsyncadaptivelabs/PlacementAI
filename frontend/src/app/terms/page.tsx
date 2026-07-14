import React from "react";
import { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service | PlacementAI",
  description: "Read the PlacementAI Terms of Service, user responsibilities, and critical disclaimers regarding ATS scoring, mock interviews, and AI analysis.",
};

const sections = [
  { id: "accept", title: "1. Acceptance of Terms" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "services", title: "3. PlacementAI Services" },
  { id: "accounts", title: "4. User Accounts" },
  { id: "responsibilities", title: "5. User Responsibilities" },
  { id: "resume-info", title: "6. Resume and Career Information" },
  { id: "ai-generated", title: "7. AI-Generated Content and Analysis" },
  { id: "ats-scores", title: "8. ATS Scores and Placement Readiness" },
  { id: "compatibility", title: "9. Job and Company Compatibility" },
  { id: "mock-interviews", title: "10. Mock Interviews and Career Guidance" },
  { id: "recruiter-features", title: "11. Recruiter and Institution Features" },
  { id: "billing", title: "12. Subscriptions, Credits, and Payments" },
  { id: "acceptable-use", title: "13. Acceptable Use" },
  { id: "ip", title: "14. Intellectual Property" },
  { id: "user-content", title: "15. User Content" },
  { id: "third-party", title: "16. Third-Party Services" },
  { id: "availability", title: "17. Service Availability" },
  { id: "disclaimer", title: "18. Disclaimer of Warranties" },
  { id: "limitation", title: "19. Limitation of Liability" },
  { id: "termination", title: "20. Account Suspension and Termination" },
  { id: "changes-services", title: "21. Changes to the Services" },
  { id: "changes-terms", title: "22. Changes to These Terms" },
  { id: "governing-law", title: "23. Governing Law" },
  { id: "contact", title: "24. Contact" },
];

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="July 14, 2026"
      introduction="Please read these Terms of Service carefully before accessing or using the PlacementAI platform. By accessing the platform, you agree to be bound by these terms."
      sections={sections}
    >
      <section id="accept" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and PlacementAI (by BrainSync Adaptive Labs) regarding your access to and use of the website, platform, web applications, and services (collectively, the &ldquo;Services&rdquo;). By creating an account or using the Services, you accept these Terms in full.
        </p>
      </section>

      <section id="eligibility" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">2. Eligibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          You must be at least 16 years of age (or the minimum legal age required in your jurisdiction) to create an account and use the Services. If you are under the legal age, you may use the Services only under the supervision of a parent or legal guardian who agrees to be bound by these Terms.
        </p>
      </section>

      <section id="services" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">3. PlacementAI Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          PlacementAI provides artificial intelligence-powered career preparation, ATS resume feedback, job description compatibility matching, skill gap analytics, interactive mock interviews, and recruiter/campus matching workspaces.
        </p>
      </section>

      <section id="accounts" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">4. User Accounts</h2>
        <p className="text-muted-foreground leading-relaxed">
          To access the student or enterprise dashboards, you must create a user account. You agree to provide accurate, current, and complete information during registration and to maintain the security of your authentication tokens and session credentials. You are responsible for all activities that occur under your account.
        </p>
      </section>

      <section id="responsibilities" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">5. User Responsibilities</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree to use the platform in compliance with all applicable laws and regulations. You are solely responsible for obtaining and preparing the files, resumes, and interview responses you upload to the Services.
        </p>
      </section>

      <section id="resume-info" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">6. Resume and Career Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          By uploading resumes or entering career profile data, you represent and warrant that you own or have the necessary permissions to share that information. PlacementAI does not claim ownership of your uploaded files, but retains the right to process them to provide the Services.
        </p>
      </section>

      <section id="ai-generated" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">7. AI-Generated Content and Analysis</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Services use AI models to analyze resumes, score placement readiness, and evaluate mock interview transcripts.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong>AI Accuracy Disclaimer:</strong> Recommendations, insights, and mock grading are generated by machine learning systems and may contain omissions, hallucinations, or errors. You should independently review all AI advice and verify critical details before making career or employment decisions.
        </p>
      </section>

      <section id="ats-scores" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">8. ATS Scores and Placement Readiness</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong>Critical ATS Disclaimer:</strong> ATS scores and metrics generated by the platform are proprietary analytical estimates based on PlacementAI&apos;s evaluation methodology. They are not official scores issued by named employers, corporate hiring divisions, or external Applicant Tracking System software vendors. A high score on PlacementAI does not guarantee that your resume will successfully pass a specific employer&apos;s screening filter or result in an interview invitation.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong>Critical Placement Disclaimer:</strong> PlacementAI is an educational and preparation tool. We do not guarantee job placements, interview selections, salary ranges, recruiter outreach, admission, or employment offers of any kind.Sourcing decisions remain solely with the hiring employers.
        </p>
      </section>

      <section id="compatibility" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">9. Job and Company Compatibility</h2>
        <p className="text-muted-foreground leading-relaxed">
          Job description compatibility matches and percentages represent analytical comparisons of uploaded texts. They do not constitute official assessments or endorsements by the named corporate brands or employers, and do not imply partnerships or affiliations between PlacementAI and those organizations unless explicitly stated.
        </p>
      </section>

      <section id="mock-interviews" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">10. Mock Interviews and Career Guidance</h2>
        <p className="text-muted-foreground leading-relaxed">
          AI mock interviews, grading feedback, and audio transcripts are intended for practice and self-evaluation. Actual corporate interview procedures, questions, and scoring frameworks differ by organization and role, and our simulations are not official replicas.
        </p>
      </section>

      <section id="recruiter-features" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">11. Recruiter and Institution Features</h2>
        <p className="text-muted-foreground leading-relaxed">
          Enterprise accounts for recruiter entities and college placement offices are subject to supplemental agreements regarding bulk candidate sourcing, analytics, drive scheduling, and student information visibility. Enterprise users are responsible for securing appropriate student consent before accessing personal profiles.
        </p>
      </section>

      <section id="billing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">12. Subscriptions, Credits, and Payments</h2>
        {/* LEGAL REVIEW REQUIRED: Payment credit terms are subject to final platform commerce integrations */}
        <p className="text-muted-foreground leading-relaxed">
          PlacementAI operates credit-based and subscription-based tiers. The fees, renewal cycles, and credit allocations are described at the point of subscription. All purchases are final and non-refundable, except as explicitly required by applicable law or as outlined in a specific payment agreement. Unused credits expire as described in your billing plan.
        </p>
      </section>

      <section id="acceptable-use" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">13. Acceptable Use</h2>
        <p className="text-muted-foreground leading-relaxed">
          You agree not to exploit the platform for unauthorized scraping, reverse-engineer proprietary algorithms, inject malicious payloads, bypass authentication mechanisms, exceed rate limits, or disrupt services.
        </p>
      </section>

      <section id="ip" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">14. Intellectual Property</h2>
        <p className="text-muted-foreground leading-relaxed">
          All materials, software, designs, logos, text, data representations, and algorithms on the PlacementAI platform are the property of PlacementAI and its licensors, protected by international copyright, trademark, and intellectual property regulations.
        </p>
      </section>

      <section id="user-content" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">15. User Content</h2>
        <p className="text-muted-foreground leading-relaxed">
          You retain all rights to the resumes, profile data, and interview answers you submit. You grant us a worldwide, non-exclusive, royalty-free license to store, parse, format, and generate analysis from your content solely to provide the Services to you, subject to our Privacy Policy.
        </p>
      </section>

      <section id="third-party" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">16. Third-Party Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          The Services may contain links to third-party tools, resource libraries, or external services. We are not responsible for the availability, content, or terms of third-party websites or services.
        </p>
      </section>

      <section id="availability" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">17. Service Availability</h2>
        <p className="text-muted-foreground leading-relaxed">
          We strive to keep the platform accessible but do not guarantee uninterrupted availability. We reserve the right to perform scheduled maintenance, apply updates, suspend features, or modify the Services at any time without notice.
        </p>
      </section>

      <section id="disclaimer" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">18. Disclaimer of Warranties</h2>
        <p className="text-muted-foreground leading-relaxed font-semibold">
          THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
      </section>

      <section id="limitation" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">19. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PLACEMENTAI OR BRAINSYNC ADAPTIVE LABS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES ARISING OUT OF YOUR USE OF THE SERVICES.
        </p>
      </section>

      <section id="termination" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">20. Account Suspension and Termination</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to suspend or terminate your account and restrict access to the Services, at our sole discretion, for violation of these Terms, non-payment, or suspicious platform abuse.
        </p>
      </section>

      <section id="changes-services" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">21. Changes to the Services</h2>
        <p className="text-muted-foreground leading-relaxed">
          We reserve the right to modify or discontinue any part of the Services with or without notice. We will not be liable to you or any third party for any modification or suspension of the Services.
        </p>
      </section>

      <section id="changes-terms" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">22. Changes to These Terms</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update these Terms from time to time. The updated Terms will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of the Services after terms updates constitutes acceptance of the new Terms.
        </p>
      </section>

      <section id="governing-law" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">23. Governing Law</h2>
        <p className="text-muted-foreground leading-relaxed">
          These Terms and any dispute arising from your use of the Services shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any legal actions or proceedings shall be brought in the competent courts having jurisdiction.
        </p>
      </section>

      <section id="contact" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">24. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For any questions or legal inquiries regarding these Terms, please contact support at:
        </p>
        <p className="font-bold text-muted-foreground">
          Email: support@brainsyncadaptivelabs.com
        </p>
      </section>
    </LegalLayout>
  );
}
