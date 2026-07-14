package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.CuratedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CuratedResourceRepository extends JpaRepository<CuratedResource, Long> {
    List<CuratedResource> findBySkillKeywordInIgnoreCase(List<String> keywords);
    List<CuratedResource> findByCategoryIgnoreCase(String category);
}
