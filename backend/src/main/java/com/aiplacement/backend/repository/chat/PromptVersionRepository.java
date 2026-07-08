package com.aiplacement.backend.repository.chat;

import com.aiplacement.backend.entity.chat.PromptVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromptVersionRepository extends JpaRepository<PromptVersion, Long> {
    
    @Query("SELECT pv FROM PromptVersion pv JOIN pv.promptDefinition pd WHERE pd.promptKey = :promptKey AND pv.isActive = true")
    Optional<PromptVersion> findActiveByPromptKey(@Param("promptKey") String promptKey);
}
