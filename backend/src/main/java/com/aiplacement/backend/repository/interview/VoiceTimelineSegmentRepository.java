package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.VoiceTimelineSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoiceTimelineSegmentRepository extends JpaRepository<VoiceTimelineSegment, Long> {
    List<VoiceTimelineSegment> findByMockInterviewOrderByCreatedAtAsc(MockInterview interview);
    Optional<VoiceTimelineSegment> findByInterviewQuestion(InterviewQuestion question);
}
