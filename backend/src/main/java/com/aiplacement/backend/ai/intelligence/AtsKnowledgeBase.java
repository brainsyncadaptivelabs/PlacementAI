package com.aiplacement.backend.ai.intelligence;

import java.util.*;

public class AtsKnowledgeBase {

    public static class DomainProfile {
        private final String domainName;
        private final List<String> requiredSkills;
        private final List<String> optionalSkills;
        private final List<String> recommendedCertifications;
        private final List<String> recommendedProjects;
        private final List<String> keywords;

        public DomainProfile(String domainName, List<String> requiredSkills, List<String> optionalSkills,
                             List<String> recommendedCertifications, List<String> recommendedProjects, List<String> keywords) {
            this.domainName = domainName;
            this.requiredSkills = requiredSkills;
            this.optionalSkills = optionalSkills;
            this.recommendedCertifications = recommendedCertifications;
            this.recommendedProjects = recommendedProjects;
            this.keywords = keywords;
        }

        public String getDomainName() { return domainName; }
        public List<String> getRequiredSkills() { return requiredSkills; }
        public List<String> getOptionalSkills() { return optionalSkills; }
        public List<String> getRecommendedCertifications() { return recommendedCertifications; }
        public List<String> getRecommendedProjects() { return recommendedProjects; }
        public List<String> getKeywords() { return keywords; }
    }

    private static final Map<String, DomainProfile> profiles = new HashMap<>();

    static {
        // 1. Software Engineering: Backend Developer
        profiles.put("backend", new DomainProfile(
            "Backend Developer",
            Arrays.asList("Java", "Spring Boot", "REST API", "SQL", "Relational Databases"),
            Arrays.asList("Docker", "Kubernetes", "Redis", "Kafka", "AWS", "Microservices", "System Design"),
            Arrays.asList("AWS Certified Developer", "Oracle Certified Professional Java SE", "Spring Certified Professional"),
            Arrays.asList("E-commerce REST Backend API", "Distributed Chat System with Kafka", "Microservices Event-Driven Platform"),
            Arrays.asList("concurrency", "scalability", "caching", "database indexing", "orm", "hibernate", "jpa", "unit testing")
        ));

        // 2. Software Engineering: Frontend Developer
        profiles.put("frontend", new DomainProfile(
            "Frontend Developer",
            Arrays.asList("JavaScript", "TypeScript", "React", "HTML", "CSS", "Responsive Design"),
            Arrays.asList("Next.js", "Vue.js", "Angular", "Tailwind CSS", "Redux", "Webpack", "Performance Optimization"),
            Arrays.asList("Meta Front-End Developer Certificate", "AWS Certified Developer", "Google UX Design Certificate"),
            Arrays.asList("SaaS Analytics Dashboard UI", "Collaborative Kanban Board", "Component UI Library"),
            Arrays.asList("accessibility", "seo", "state management", "bundling", "lighthouse score", "dom optimization", "virtual dom")
        ));

        // 3. Software Engineering: Full Stack Developer
        profiles.put("fullstack", new DomainProfile(
            "Full Stack Developer",
            Arrays.asList("React", "Node.js", "JavaScript", "TypeScript", "SQL", "REST API"),
            Arrays.asList("Next.js", "Express", "Spring Boot", "Docker", "AWS", "GraphQL", "NoSQL", "PostgreSQL"),
            Arrays.asList("AWS Certified Developer Associate", "Full Stack Developer Certification"),
            Arrays.asList("B2B SaaS CRM Platform", "Real-Time Collaborative Doc Editor", "Full Stack Marketplace App"),
            Arrays.asList("ci/cd", "deployment", "authentication", "authorization", "web security", "jwt", "integration testing")
        ));

        // 4. DevOps & Cloud Engineer
        profiles.put("devops", new DomainProfile(
            "DevOps Engineer",
            Arrays.asList("Linux", "Bash", "Docker", "Kubernetes", "CI/CD", "AWS"),
            Arrays.asList("Terraform", "Ansible", "Jenkins", "GitHub Actions", "Prometheus", "Grafana", "ELK Stack", "Python"),
            Arrays.asList("AWS Certified DevOps Engineer", "Certified Kubernetes Administrator (CKA)", "HashiCorp Certified Terraform Associate"),
            Arrays.asList("Multi-Region Cloud Infrastructure via Terraform", "Automated GitOps CI/CD Deployment Pipeline", "Centralized Kubernetes Monitoring Stack"),
            Arrays.asList("infrastructure as code", "gitops", "automation", "logging", "containerization", "orchestration", "site reliability")
        ));

        // 5. Data Science & Machine Learning
        profiles.put("datascience", new DomainProfile(
            "Data Scientist / ML Engineer",
            Arrays.asList("Python", "SQL", "Pandas", "NumPy", "Statistics", "Machine Learning"),
            Arrays.asList("TensorFlow", "PyTorch", "Scikit-Learn", "Matplotlib", "Jupyter", "Spark", "Data Pipelines"),
            Arrays.asList("Google Cloud Professional Data Engineer", "TensorFlow Developer Certificate", "DeepLearning.AI Certification"),
            Arrays.asList("Customer Churn Prediction Model", "Real-Time Image Classification Pipeline", "Natural Language Processing Document Classifier"),
            Arrays.asList("feature engineering", "regression", "deep learning", "neural networks", "hyperparameter tuning", "data cleaning")
        ));

        // 6. UI/UX Design
        profiles.put("uiux", new DomainProfile(
            "UI/UX Designer",
            Arrays.asList("Figma", "User Research", "Wireframing", "Prototyping", "Information Architecture"),
            Arrays.asList("Adobe XD", "Sketch", "Design Systems", "Usability Testing", "UI Design Patterns", "Interaction Design"),
            Arrays.asList("Google UX Design Certificate", "Interaction Design Foundation Certificate"),
            Arrays.asList("Mobile FinTech App UX Redesign", "Responsive E-commerce Web App Design", "Comprehensive Product Design System"),
            Arrays.asList("wireframes", "user personas", "heuristics", "accessibility", "visual hierarchy", "user flows", "mockups")
        ));

        // 7. Digital Marketing & SEO
        profiles.put("marketing", new DomainProfile(
            "Digital Marketer",
            Arrays.asList("SEO", "Google Analytics", "Content Strategy", "Social Media Marketing"),
            Arrays.asList("Google Ads", "Meta Ads Manager", "Ahrefs", "SEMrush", "Email Marketing", "Copywriting", "HubSpot"),
            Arrays.asList("Google Analytics Individual Qualification (GAIQ)", "Google Ads Search Certification", "HubSpot Inbound Marketing"),
            Arrays.asList("Organic Traffic Growth SEO Campaign", "High-ROAS Pay-Per-Click Marketing Strategy", "Automated Lead Nurturing Email Sequence"),
            Arrays.asList("search engine optimization", "conversion rate optimization", "cro", "ppc", "sem", "link building", "audience segmentation")
        ));

        // 8. Finance & Accounting
        profiles.put("finance", new DomainProfile(
            "Financial Analyst",
            Arrays.asList("Financial Analysis", "Microsoft Excel", "Accounting Principles", "Financial Modeling"),
            Arrays.asList("SQL", "Power BI", "Tableau", "Corporate Finance", "Risk Management", "Bloomberg Terminal", "Python"),
            Arrays.asList("Chartered Financial Analyst (CFA)", "Financial Risk Manager (FRM)", "Certified Public Accountant (CPA)"),
            Arrays.asList("Annual Corporate Budget Valuation Model", "Market Risk Analysis Simulation", "Quarterly Financial Reporting Dashboard"),
            Arrays.asList("valuation", "forecast", "cash flow", "balance sheet", "income statement", "ratio analysis", "dcf")
        ));

        // 9. Human Resources (HR)
        profiles.put("hr", new DomainProfile(
            "HR Professional",
            Arrays.asList("Talent Acquisition", "Employee Relations", "HR Policies", "Recruitment"),
            Arrays.asList("HRIS Tools", "Workday", "Onboarding", "Performance Management", "Compensation & Benefits", "ATS Systems"),
            Arrays.asList("SHRM Certified Professional (SHRM-CP)", "PHR Certification (Professional in Human Resources)"),
            Arrays.asList("Company-Wide Onboarding Framework", "Employee Engagement Strategy Redesign", "Recruitment Pipeline Optimization Plan"),
            Arrays.asList("human capital", "compliance", "retention", "talent management", "sourcing", "employer branding")
        ));
    }

    public static DomainProfile getProfile(String domain) {
        if (domain == null) {
            return getFallbackProfile();
        }
        String key = domain.toLowerCase().replaceAll("[^a-z]", "");
        if (key.contains("backend")) return profiles.get("backend");
        if (key.contains("frontend")) return profiles.get("frontend");
        if (key.contains("fullstack") || key.contains("softwareeng")) return profiles.get("fullstack");
        if (key.contains("devops") || key.contains("cloud") || key.contains("sysadmin")) return profiles.get("devops");
        if (key.contains("data") || key.contains("ml") || key.contains("machine")) return profiles.get("datascience");
        if (key.contains("ui") || key.contains("ux") || key.contains("design")) return profiles.get("uiux");
        if (key.contains("market") || key.contains("seo") || key.contains("ads")) return profiles.get("marketing");
        if (key.contains("finance") || key.contains("account") || key.contains("audit")) return profiles.get("finance");
        if (key.contains("hr") || key.contains("recruit") || key.contains("human")) return profiles.get("hr");

        // General default profile
        return getFallbackProfile();
    }

    private static DomainProfile getFallbackProfile() {
        return new DomainProfile(
            "General Professional",
            Arrays.asList("Communication", "Problem Solving", "Team Collaboration", "Time Management", "Microsoft Office"),
            Arrays.asList("Project Management", "Data Literacy", "Agile Methodologies", "Critical Thinking", "Presentations"),
            Arrays.asList("Project Management Professional (PMP)", "Google Project Management Certificate"),
            Arrays.asList("Operational Process Automation Plan", "Cross-Functional Project Initiative"),
            Arrays.asList("leadership", "organization", "adaptability", "client relations", "strategic planning", "deliverables")
        );
    }
}
