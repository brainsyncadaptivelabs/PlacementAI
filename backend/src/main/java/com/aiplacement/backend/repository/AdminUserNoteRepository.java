package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AdminUserNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminUserNoteRepository extends JpaRepository<AdminUserNote, Long> {
    List<AdminUserNote> findByUserIdOrderByCreatedAtDesc(Long userId);
}
