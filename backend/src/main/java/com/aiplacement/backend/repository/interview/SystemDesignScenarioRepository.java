package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.SystemDesignScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemDesignScenarioRepository extends JpaRepository<SystemDesignScenario, Long> {
    Optional<SystemDesignScenario> findByInterviewQuestion(InterviewQuestion question);
}
