package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByInterviewQuestionOrderBySubmittedAtAsc(InterviewQuestion question);
    Optional<CodingSubmission> findTopByInterviewQuestionOrderBySubmittedAtDesc(InterviewQuestion question);

    @Query("SELECT cs FROM CodingSubmission cs WHERE cs.interviewQuestion.mockInterview = :interview ORDER BY cs.submittedAt DESC")
    List<CodingSubmission> findByMockInterview(@Param("interview") MockInterview interview);

    @Query("SELECT AVG(cs.passRate) FROM CodingSubmission cs WHERE cs.interviewQuestion.mockInterview.user.id = :userId")
    Double findAvgPassRateByUserId(@Param("userId") Long userId);

    @Query("SELECT cs.language, COUNT(cs), AVG(cs.passRate) FROM CodingSubmission cs WHERE cs.interviewQuestion.mockInterview.user.id = :userId GROUP BY cs.language")
    List<Object[]> findLanguageStatsForUser(@Param("userId") Long userId);
}
