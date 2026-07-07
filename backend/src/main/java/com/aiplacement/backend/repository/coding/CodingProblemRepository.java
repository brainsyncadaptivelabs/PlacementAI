package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    Optional<CodingProblem> findByInterviewQuestion(InterviewQuestion interviewQuestion);
    List<CodingProblem> findByMockInterview(MockInterview mockInterview);
    List<CodingProblem> findByMockInterviewOrderByCreatedAtDesc(MockInterview mockInterview);
}
