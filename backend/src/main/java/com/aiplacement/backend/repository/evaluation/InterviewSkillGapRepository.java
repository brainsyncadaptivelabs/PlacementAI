package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewSkillGap;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSkillGapRepository extends JpaRepository<InterviewSkillGap, Long> {
    List<InterviewSkillGap> findByEvaluation(InterviewEvaluation evaluation);
}
