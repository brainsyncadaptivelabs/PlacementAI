package com.aiplacement.backend.intelligence;

import java.util.List;

/**
 * Unified placement context aggregating all user‑specific data needed for planning and
 * expert coordination. In a real implementation this would be populated from the
 * {@link com.aiplacement.backend.intelligence.UserIntelligenceProfile} JPA entity.
 */
public class PlacementContext {
    private String userId;
    private String atsScore;
    private String readinessLevel;
    private List<String> uploadedFiles;
    private List<String> conversationHistory;
    private List<String> targetCompanies;
    private String preferredRole;
    private String learningProgress;
    private List<String> skillGaps;

    public PlacementContext() {}

    // Getters and setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getAtsScore() { return atsScore; }
    public void setAtsScore(String atsScore) { this.atsScore = atsScore; }
    public String getReadinessLevel() { return readinessLevel; }
    public void setReadinessLevel(String readinessLevel) { this.readinessLevel = readinessLevel; }
    public List<String> getUploadedFiles() { return uploadedFiles; }
    public void setUploadedFiles(List<String> uploadedFiles) { this.uploadedFiles = uploadedFiles; }
    public List<String> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<String> conversationHistory) { this.conversationHistory = conversationHistory; }
    public List<String> getTargetCompanies() { return targetCompanies; }
    public void setTargetCompanies(List<String> targetCompanies) { this.targetCompanies = targetCompanies; }
    public String getPreferredRole() { return preferredRole; }
    public void setPreferredRole(String preferredRole) { this.preferredRole = preferredRole; }
    public String getLearningProgress() { return learningProgress; }
    public void setLearningProgress(String learningProgress) { this.learningProgress = learningProgress; }
    public List<String> getSkillGaps() { return skillGaps; }
    public void setSkillGaps(List<String> skillGaps) { this.skillGaps = skillGaps; }
}
