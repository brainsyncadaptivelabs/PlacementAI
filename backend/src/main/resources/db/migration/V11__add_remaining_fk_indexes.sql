-- V11: Add indexes on remaining foreign keys for ATS keywords, mock interview evaluation details, and candidate state records safely

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_matched_keywords') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_matched_keywords_ats_analysis_id ON ats_matched_keywords(ats_analysis_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_missing_keywords') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_missing_keywords_ats_analysis_id ON ats_missing_keywords(ats_analysis_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_strengths') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_strengths_ats_analysis_id ON ats_strengths(ats_analysis_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_suggestions') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_suggestions_ats_analysis_id ON ats_suggestions(ats_analysis_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ats_weaknesses') THEN
        CREATE INDEX IF NOT EXISTS idx_ats_weaknesses_ats_analysis_id ON ats_weaknesses(ats_analysis_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_claims') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_claims_user_id ON candidate_claims(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_concepts') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_concepts_user_id ON candidate_concepts(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_contradictions') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_contradictions_user_id ON candidate_contradictions(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_followups') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_followups_user_id ON candidate_followups(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_project_knowledge') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_project_knowledge_user_id ON candidate_project_knowledge(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'candidate_verified_resume') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_verified_resume_user_id ON candidate_verified_resume(user_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interview_evaluations') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_evaluations_mock_interview_id ON interview_evaluations(mock_interview_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_design_diagrams') THEN
        CREATE INDEX IF NOT EXISTS idx_system_design_diagrams_mock_interview_id ON system_design_diagrams(mock_interview_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'voice_timeline_segments') THEN
        CREATE INDEX IF NOT EXISTS idx_voice_timeline_segments_mock_interview_id ON voice_timeline_segments(mock_interview_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'evaluation_versions') THEN
        CREATE INDEX IF NOT EXISTS idx_evaluation_versions_evaluation_id ON evaluation_versions(evaluation_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interview_technical_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_technical_metrics_evaluation_id ON interview_technical_metrics(evaluation_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interview_behavior_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_behavior_metrics_evaluation_id ON interview_behavior_metrics(evaluation_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interview_communication_metrics') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_communication_metrics_evaluation_id ON interview_communication_metrics(evaluation_id);
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interview_competency_scores') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_competency_scores_evaluation_id ON interview_competency_scores(evaluation_id);
    END IF;
END $$;
