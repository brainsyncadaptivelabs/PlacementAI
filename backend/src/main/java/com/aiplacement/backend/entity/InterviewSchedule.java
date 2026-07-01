package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "interview_schedules")
public class InterviewSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private JobApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private LocalDateTime scheduledDate;

    private String mode; // "Online" or "Offline"

    private String meetingLink;

    // Round name: "Technical Round 1", "HR Round", etc.
    private String round;

    // Duration in minutes
    @Builder.Default
    private Integer duration = 60;

    // Interviewer info
    private String interviewerName;
    private String interviewerEmail;

    // Legacy field kept for backward compat
    private String interviewerDetails;

    @Builder.Default
    private Boolean reminderSent = false;

    @Builder.Default
    private boolean isCompleted = false;

    // Status: SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    @Builder.Default
    private String status = "SCHEDULED";

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
