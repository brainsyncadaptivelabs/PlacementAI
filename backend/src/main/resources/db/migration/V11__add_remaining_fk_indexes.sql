-- V11: Add indexes on remaining foreign keys for ATS keywords, mock interview evaluation details, and candidate state records

CREATE INDEX IF NOT EXISTS idx_ats_matched_keywords_ats_analysis_id ON ats_matched_keywords(ats_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ats_missing_keywords_ats_analysis_id ON ats_missing_keywords(ats_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ats_strengths_ats_analysis_id ON ats_strengths(ats_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ats_suggestions_ats_analysis_id ON ats_suggestions(ats_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ats_weaknesses_ats_analysis_id ON ats_weaknesses(ats_analysis_id);

CREATE INDEX IF NOT EXISTS idx_candidate_claims_user_id ON candidate_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_concepts_user_id ON candidate_concepts(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_contradictions_user_id ON candidate_contradictions(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_followups_user_id ON candidate_followups(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_project_knowledge_user_id ON candidate_project_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_verified_resume_user_id ON candidate_verified_resume(user_id);

CREATE INDEX IF NOT EXISTS idx_interview_evaluations_mock_interview_id ON interview_evaluations(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_system_design_diagrams_mock_interview_id ON system_design_diagrams(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_voice_timeline_segments_mock_interview_id ON voice_timeline_segments(mock_interview_id);

CREATE INDEX IF NOT EXISTS idx_evaluation_versions_evaluation_id ON evaluation_versions(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_interview_technical_metrics_evaluation_id ON interview_technical_metrics(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_interview_behavior_metrics_evaluation_id ON interview_behavior_metrics(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_interview_communication_metrics_evaluation_id ON interview_communication_metrics(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_interview_competency_scores_evaluation_id ON interview_competency_scores(evaluation_id);
