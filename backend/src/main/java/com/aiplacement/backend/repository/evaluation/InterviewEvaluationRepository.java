package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewEvaluation;
import com.aiplacement.backend.entity.interview.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    Optional<InterviewEvaluation> findByMockInterview(MockInterview mockInterview);
    Optional<InterviewEvaluation> findByMockInterviewId(Long mockInterviewId);

    @Query("SELECT ie FROM InterviewEvaluation ie WHERE ie.mockInterview.user = :user ORDER BY ie.id DESC")
    java.util.List<InterviewEvaluation> findByUserOrderByIdDesc(@Param("user") com.aiplacement.backend.entity.User user, org.springframework.data.domain.Pageable pageable);

    default Optional<InterviewEvaluation> findFirstByMockInterviewUserOrderByIdDesc(com.aiplacement.backend.entity.User user) {
        java.util.List<InterviewEvaluation> list = findByUserOrderByIdDesc(user, org.springframework.data.domain.PageRequest.of(0, 1));
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
