package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.MemoryEvent;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoryEventRepository extends JpaRepository<MemoryEvent, Long> {
    List<MemoryEvent> findByUserOrderByTimestampDesc(User user);
    List<MemoryEvent> findByUserAndInterviewId(User user, Long interviewId);
}
