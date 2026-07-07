package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemDesignDiagramRepository extends JpaRepository<SystemDesignDiagram, Long> {
    Optional<SystemDesignDiagram> findByInterviewQuestion(InterviewQuestion question);
    List<SystemDesignDiagram> findByMockInterview(MockInterview interview);
    Optional<SystemDesignDiagram> findFirstByMockInterviewOrderByLastSavedAtDesc(MockInterview interview);
}
