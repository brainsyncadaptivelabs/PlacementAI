package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.Event;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUserOrderByCreatedAtDesc(User user);
    List<Event> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Event> findTop5ByUserOrderByCreatedAtDesc(User user);
    List<Event> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);
}
