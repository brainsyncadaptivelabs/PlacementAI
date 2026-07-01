package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.InterviewScheduleDto;
import com.aiplacement.backend.entity.InterviewSchedule;
import com.aiplacement.backend.entity.JobApplication;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.InterviewScheduleRepository;
import com.aiplacement.backend.repository.JobApplicationRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewSchedulerService {

    private final InterviewScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;

    @Transactional
    public InterviewScheduleDto schedule(InterviewScheduleDto dto, User recruiter) {
        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + dto.getStudentId()));

        JobApplication application = null;
        if (dto.getApplicationId() != null) {
            application = applicationRepository.findById(dto.getApplicationId()).orElse(null);
        }

        InterviewSchedule schedule = InterviewSchedule.builder()
                .recruiter(recruiter)
                .student(student)
                .application(application)
                .scheduledDate(dto.getScheduledDate())
                .mode(dto.getMode())
                .meetingLink(dto.getMeetingLink())
                .round(dto.getRound())
                .duration(dto.getDuration() != null ? dto.getDuration() : 60)
                .interviewerName(dto.getInterviewerName())
                .interviewerEmail(dto.getInterviewerEmail())
                .status("SCHEDULED")
                .build();

        return toDto(scheduleRepository.save(schedule));
    }

    public List<InterviewScheduleDto> getSchedulesForRecruiter(Long recruiterId) {
        return scheduleRepository.findByRecruiterIdOrderByScheduledDateDesc(recruiterId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<InterviewScheduleDto> getUpcomingForRecruiter(Long recruiterId) {
        return scheduleRepository.findByRecruiterIdAndStatusOrderByScheduledDateAsc(recruiterId, "SCHEDULED")
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void cancelSchedule(Long id, User recruiter) {
        InterviewSchedule s = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        if (!s.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        s.setStatus("CANCELLED");
        scheduleRepository.save(s);
    }

    @Transactional
    public InterviewScheduleDto markCompleted(Long id, User recruiter) {
        InterviewSchedule s = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found: " + id));
        if (!s.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        s.setStatus("COMPLETED");
        s.setCompleted(true);
        return toDto(scheduleRepository.save(s));
    }

    private InterviewScheduleDto toDto(InterviewSchedule s) {
        return InterviewScheduleDto.builder()
                .id(s.getId())
                .applicationId(s.getApplication() != null ? s.getApplication().getId() : null)
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getFullName())
                .studentEmail(s.getStudent().getEmail())
                .jobId(s.getApplication() != null ? s.getApplication().getJob().getId() : null)
                .jobTitle(s.getApplication() != null ? s.getApplication().getJob().getTitle() : null)
                .scheduledDate(s.getScheduledDate())
                .mode(s.getMode())
                .meetingLink(s.getMeetingLink())
                .round(s.getRound())
                .duration(s.getDuration())
                .interviewerName(s.getInterviewerName())
                .interviewerEmail(s.getInterviewerEmail())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
