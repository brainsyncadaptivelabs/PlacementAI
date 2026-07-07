package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.VoiceAudioRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoiceAudioRecordRepository extends JpaRepository<VoiceAudioRecord, Long> {
    Optional<VoiceAudioRecord> findByInterviewQuestion(InterviewQuestion question);
}
