package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import com.aiplacement.backend.entity.interview.SystemDesignEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemDesignEvaluationRepository extends JpaRepository<SystemDesignEvaluation, Long> {
    Optional<SystemDesignEvaluation> findBySystemDesignDiagram(SystemDesignDiagram diagram);
}
