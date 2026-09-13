-- V19: Aptitude question bank table and default seed data
CREATE TABLE IF NOT EXISTS aptitude_questions (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    answer VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50),
    time_limit INTEGER,
    explanation TEXT,
    formula VARCHAR(255),
    company_level VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS aptitude_question_options (
    question_id BIGINT NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    CONSTRAINT fk_aptitude_question_options FOREIGN KEY (question_id) REFERENCES aptitude_questions (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_aptitude_category ON aptitude_questions(category);
CREATE INDEX IF NOT EXISTS idx_aptitude_topic ON aptitude_questions(topic);
CREATE INDEX IF NOT EXISTS idx_aptitude_difficulty ON aptitude_questions(difficulty);
