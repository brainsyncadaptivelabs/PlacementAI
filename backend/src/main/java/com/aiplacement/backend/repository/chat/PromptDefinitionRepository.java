package com.aiplacement.backend.repository.chat;

import com.aiplacement.backend.entity.chat.PromptDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromptDefinitionRepository extends JpaRepository<PromptDefinition, Long> {
    Optional<PromptDefinition> findByPromptKey(String promptKey);
}
