package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AptitudeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AptitudeQuestionRepository extends JpaRepository<AptitudeQuestion, Long> {
    List<AptitudeQuestion> findByCategoryIgnoreCase(String category);
    List<AptitudeQuestion> findByTopicIgnoreCase(String topic);
    List<AptitudeQuestion> findByDifficultyIgnoreCase(String difficulty);
}
