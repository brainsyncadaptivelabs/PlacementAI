package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduleDto {

    private Long id;

    // References
    private Long applicationId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long jobId;
    private String jobTitle;

    // Schedule details
    private LocalDateTime scheduledDate;
    private String mode; // Online, Offline
    private String meetingLink;
    private String round; // "Technical Round 1", "HR Round", etc.
    private Integer duration; // in minutes

    // Interviewer
    private String interviewerName;
    private String interviewerEmail;

    // Status: SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED
    private String status;

    private Boolean sendEmailReminder;

    private LocalDateTime createdAt;
}
