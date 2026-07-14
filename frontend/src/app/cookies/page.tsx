import React from "react";
import { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | PlacementAI",
  description: "Learn about how PlacementAI uses cookies, local storage, and similar session tracking technologies to optimize and secure your experience.",
};

const sections = [
  { id: "what-cookies", title: "1. What Are Cookies" },
  { id: "how-use", title: "2. How PlacementAI Uses Cookies" },
  { id: "essential", title: "3. Essential Technologies" },
  { id: "auth-session", title: "4. Authentication and Session Technologies" },
  { id: "preference", title: "5. Preference Technologies" },
  { id: "analytics", title: "6. Analytics Technologies" },
  { id: "third-party", title: "7. Third-Party Technologies" },
  { id: "managing", title: "8. Managing Cookies" },
  { id: "changes", title: "9. Changes to This Policy" },
  { id: "contact", title: "10. Contact" },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="July 14, 2026"
      introduction="This Cookie Policy explains how PlacementAI uses cookies and similar client-side storage technologies to recognize you, improve your experience, and secure our services."
      sections={sections}
    >
      <section id="what-cookies" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">1. What Are Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used by website owners to make websites work, or to work more efficiently, as well as to provide reporting information.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          In addition to traditional cookies, we utilize modern browser storage mechanisms, including <strong>LocalStorage</strong> and <strong>SessionStorage</strong>, which allow us to cache authentication states and user interface preferences directly within your browser.
        </p>
      </section>

      <section id="how-use" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">2. How PlacementAI Uses Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use cookies and browser storage technologies for several reasons:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>To securely verify your identity and keep you logged in to your dashboard.</li>
          <li>To remember your interface selections, such as theme choice (dark/light mode) and sidebar state.</li>
          <li>To collect web analytics data so we can measure traffic, find software bugs, and improve page load times.</li>
        </ul>
      </section>

      <section id="essential" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">3. Essential Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          These technologies are strictly necessary for the platform to function. Without them, core features like dashboard authentication, secure navigation, and session persistency cannot operate.
        </p>
        <table className="min-w-full divide-y divide-border border border-border rounded-xl overflow-hidden text-sm text-left my-4">
          <thead className="bg-muted text-muted-foreground font-bold">
            <tr>
              <th className="p-3">Technology Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-muted-foreground">
            <tr>
              <td className="p-3 font-semibold">sidebar:state</td>
              <td className="p-3">Cookie</td>
              <td className="p-3">Stores the expanded/collapsed state of the navigation sidebar.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold">token</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Securely caches the PlacementAI JWT auth token to authorize API requests.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold">admin_token / admin_csrf</td>
              <td className="p-3">LocalStorage</td>
              <td className="p-3">Ches access tokens and CSRF verification keys for admin tasks.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="auth-session" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">4. Authentication and Session Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We utilize secure tokens to identify users. When you authenticate using email or social login (Google/GitHub), Supabase Auth and our Spring Security backend issue temporary tokens. These tokens are saved in browser storage to allow secure stateless requests. They are cleared immediately upon logging out.
        </p>
      </section>

      <section id="preference" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">5. Preference Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          These storage keys are used to customize and save your workspace configurations:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>theme:</strong> Remembers your light mode, dark mode, or system theme preference.</li>
          <li><strong>Widget preferences:</strong> Caches details such as Monaco editor autosaves, expandable roadmap nodes, and checklist state to avoid loss of context when clicking through dashboard tabs.</li>
        </ul>
      </section>

      <section id="analytics" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">6. Analytics Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use performance analytics tools to understand how users interact with the platform. This helps us optimize rendering performance and fix errors.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Vercel Analytics &amp; Speed Insights:</strong> Captures anonymous metrics regarding page load speeds, resource sizes, and common user navigation patterns. No personally identifiable details are exposed.</li>
        </ul>
      </section>

      <section id="third-party" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">7. Third-Party Technologies</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you use third-party OAuth features (such as logging in with a Google account), the external provider may set their own tracking cookies or local data keys to manage the redirect handshake. We do not control these third-party trackers. We recommend reviewing the privacy policies of the respective providers.
        </p>
      </section>

      <section id="managing" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">8. Managing Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          You can choose to block or delete cookies through your web browser&apos;s privacy settings. However, because essential cookies are required to authenticate your profile, disabling cookies or clearing browser storage will sign you out and prevent access to the dashboard.
        </p>
      </section>

      <section id="changes" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">9. Changes to This Policy</h2>
        <p className="text-muted-foreground leading-relaxed">
          We may update this Cookie Policy periodically to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this policy regularly to stay informed.
        </p>
      </section>

      <section id="contact" className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground border-b border-border/40 pb-2">10. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          If you have questions about our use of cookies or other technologies, please contact:
        </p>
        <p className="font-bold text-muted-foreground">
          Email: support@brainsyncadaptivelabs.com
        </p>
      </section>
    </LegalLayout>
  );
}
