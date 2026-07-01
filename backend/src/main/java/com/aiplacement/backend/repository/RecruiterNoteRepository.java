package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.RecruiterNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruiterNoteRepository extends JpaRepository<RecruiterNote, Long> {

    List<RecruiterNote> findByRecruiterIdAndStudentIdOrderByCreatedAtDesc(Long recruiterId, Long studentId);

    List<RecruiterNote> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    void deleteByIdAndRecruiterId(Long id, Long recruiterId);
}
