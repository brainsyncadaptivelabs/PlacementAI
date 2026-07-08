package com.aiplacement.backend.placementintelligence.company.profiles;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CompanyProfileRegistry {

    private final Map<String, CompanyProfile> profiles = new HashMap<>();

    public CompanyProfileRegistry() {
        // FAANG
        profiles.put("FAANG", CompanyProfile.builder()
                .companyName("FAANG")
                .requiredSkills(List.of("Algorithms", "Data Structures", "System Design", "Concurrency", "OOP"))
                .preferredProjects(List.of("Distributed Systems", "Compiler Design", "Scalable REST APIs"))
                .resumePriority(80)
                .atsPriority(85)
                .interviewPriority(95)
                .codingPriority(95)
                .communicationWeight(0.20)
                .aptitudeWeight(0.10)
                .softSkills(List.of("Leadership", "Ownership", "Problem Solving"))
                .leadershipImportance(90)
                .build());

        // Accenture
        profiles.put("Accenture", CompanyProfile.builder()
                .companyName("Accenture")
                .requiredSkills(List.of("Java", "Spring Boot", "SQL", "Cloud Computing", "Git"))
                .preferredProjects(List.of("Web Application", "E-commerce Website", "Database Management System"))
                .resumePriority(70)
                .atsPriority(75)
                .interviewPriority(75)
                .codingPriority(70)
                .communicationWeight(0.30)
                .aptitudeWeight(0.25)
                .softSkills(List.of("Collaboration", "Adaptability", "Client Interfacing"))
                .leadershipImportance(60)
                .build());

        // TCS
        profiles.put("TCS", CompanyProfile.builder()
                .companyName("TCS")
                .requiredSkills(List.of("Java", "Python", "SQL", "HTML", "CSS", "C++"))
                .preferredProjects(List.of("Information System", "Mobile App", "Portfolio Website"))
                .resumePriority(65)
                .atsPriority(70)
                .interviewPriority(70)
                .codingPriority(65)
                .communicationWeight(0.30)
                .aptitudeWeight(0.30)
                .softSkills(List.of("Teamwork", "Punctuality", "Basic English Literacy"))
                .leadershipImportance(50)
                .build());

        // Oracle
        profiles.put("Oracle", CompanyProfile.builder()
                .companyName("Oracle")
                .requiredSkills(List.of("Java", "SQL", "Database Internals", "C", "Operating Systems"))
                .preferredProjects(List.of("Custom DB Engine", "Query Optimizer", "Data Pipeline"))
                .resumePriority(75)
                .atsPriority(80)
                .interviewPriority(85)
                .codingPriority(85)
                .communicationWeight(0.25)
                .aptitudeWeight(0.20)
                .softSkills(List.of("Reasoning", "Critical Thinking", "Self-reliance"))
                .leadershipImportance(70)
                .build());

        // IBM
        profiles.put("IBM", CompanyProfile.builder()
                .companyName("IBM")
                .requiredSkills(List.of("Cloud", "Docker", "Kubernetes", "Node.js", "Python"))
                .preferredProjects(fileListHelper())
                .resumePriority(70)
                .atsPriority(75)
                .interviewPriority(80)
                .codingPriority(75)
                .communicationWeight(0.25)
                .aptitudeWeight(0.20)
                .softSkills(List.of("Coaching", "Agile Mindset", "Innovation"))
                .leadershipImportance(70)
                .build());

        // Cognizant
        profiles.put("Cognizant", CompanyProfile.builder()
                .companyName("Cognizant")
                .requiredSkills(List.of("Java", "C#", "Javascript", "SQL", "Tester Core"))
                .preferredProjects(List.of("Customer Portal", "Inventory System", "Bug Tracker"))
                .resumePriority(65)
                .atsPriority(70)
                .interviewPriority(70)
                .codingPriority(65)
                .communicationWeight(0.35)
                .aptitudeWeight(0.25)
                .softSkills(List.of("Active Listening", "Problem Analysis"))
                .leadershipImportance(55)
                .build());

        // Deloitte
        profiles.put("Deloitte", CompanyProfile.builder()
                .companyName("Deloitte")
                .requiredSkills(List.of("Consulting Foundations", "SQL", "Excel", "Data Analytics", "PPT"))
                .preferredProjects(List.of("Business Intelligence Dashboard", "Financial Projection Tool"))
                .resumePriority(75)
                .atsPriority(75)
                .interviewPriority(85)
                .codingPriority(60)
                .communicationWeight(0.40)
                .aptitudeWeight(0.30)
                .softSkills(List.of("Client Relations", "Presentation", "Strategic Thinking"))
                .leadershipImportance(80)
                .build());

        // EY
        profiles.put("EY", CompanyProfile.builder()
                .companyName("EY")
                .requiredSkills(List.of("Audit Support", "Cybersecurity", "Risk Assessment", "Python", "SQL"))
                .preferredProjects(List.of("Audit Automation Script", "Risk Score Dashboard"))
                .resumePriority(75)
                .atsPriority(75)
                .interviewPriority(80)
                .codingPriority(60)
                .communicationWeight(0.40)
                .aptitudeWeight(0.30)
                .softSkills(List.of("Objectivity", "Attention to Detail", "Ethics"))
                .leadershipImportance(75)
                .build());

        // Wipro
        profiles.put("Wipro", CompanyProfile.builder()
                .companyName("Wipro")
                .requiredSkills(List.of("Java", "Python", ".NET", "Web Services", "SQL"))
                .preferredProjects(List.of("Web Portal", "Utility Tools", "Simple Management App"))
                .resumePriority(65)
                .atsPriority(70)
                .interviewPriority(70)
                .codingPriority(65)
                .communicationWeight(0.30)
                .aptitudeWeight(0.30)
                .softSkills(List.of("Cooperation", "Flexibility", "Inquisitiveness"))
                .leadershipImportance(50)
                .build());

        // HCL
        profiles.put("HCL", CompanyProfile.builder()
                .companyName("HCL")
                .requiredSkills(List.of("Infrastructure Management", "Linux", "Python", "Networking"))
                .preferredProjects(List.of("System Monitor", "Log Parser", "Network Automator"))
                .resumePriority(65)
                .atsPriority(70)
                .interviewPriority(70)
                .codingPriority(65)
                .communicationWeight(0.30)
                .aptitudeWeight(0.25)
                .softSkills(List.of("Diligence", "Dependability"))
                .leadershipImportance(55)
                .build());

        // DeltaX
        profiles.put("DeltaX", CompanyProfile.builder()
                .companyName("DeltaX")
                .requiredSkills(List.of("React", "Node.js", "Javascript", "AdTech Basics", "SQL"))
                .preferredProjects(List.of("Marketing Dashboard", "Ad Click Optimizer", "Fullstack App"))
                .resumePriority(70)
                .atsPriority(75)
                .interviewPriority(80)
                .codingPriority(80)
                .communicationWeight(0.25)
                .aptitudeWeight(0.20)
                .softSkills(List.of("Speed", "Proactiveness", "Product Sense"))
                .leadershipImportance(65)
                .build());

        // Zensar
        profiles.put("Zensar", CompanyProfile.builder()
                .companyName("Zensar")
                .requiredSkills(List.of("Java", "Oracle SQL", "Angular", "Web Services"))
                .preferredProjects(List.of("ERP Extension", "Customer Feedback App"))
                .resumePriority(65)
                .atsPriority(70)
                .interviewPriority(70)
                .codingPriority(65)
                .communicationWeight(0.30)
                .aptitudeWeight(0.25)
                .softSkills(List.of("Politeness", "Team Spirit"))
                .leadershipImportance(50)
                .build());
    }

    private List<String> fileListHelper() {
        return List.of("Cloud Infrastructure Setup", "Microservices Pipeline");
    }

    public CompanyProfile getProfile(String companyName) {
        return profiles.getOrDefault(companyName, profiles.get("Accenture"));
    }

    public Map<String, CompanyProfile> getAllProfiles() {
        return profiles;
    }
}
