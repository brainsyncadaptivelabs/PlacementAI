package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
}
