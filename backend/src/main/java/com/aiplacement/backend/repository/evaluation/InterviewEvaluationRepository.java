package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewEvaluation;
import com.aiplacement.backend.entity.interview.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    Optional<InterviewEvaluation> findByMockInterview(MockInterview mockInterview);
    Optional<InterviewEvaluation> findByMockInterviewId(Long mockInterviewId);
}
