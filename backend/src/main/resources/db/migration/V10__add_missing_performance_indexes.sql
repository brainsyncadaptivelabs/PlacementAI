-- V10: Add missing indexes on foreign keys and frequently queried fields for performance optimization

CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_candidate_skill_confidence_user_id ON candidate_skill_confidence(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_learning_progress_user_id ON candidate_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_id ON mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_interview_question_id ON coding_submissions(interview_question_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_coding_problem_id ON coding_submissions(coding_problem_id);
CREATE INDEX IF NOT EXISTS idx_coding_problems_mock_interview_id ON coding_problems(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_mock_interview_id ON interview_questions(mock_interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_mock_interview_id ON interview_feedback(mock_interview_id);
