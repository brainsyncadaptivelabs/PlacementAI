package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.RecruiterNoteDto;
import com.aiplacement.backend.entity.RecruiterNote;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.RecruiterNoteRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterNoteService {

    private final RecruiterNoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional
    public RecruiterNoteDto addNote(RecruiterNoteDto dto, User recruiter) {
        User student = userRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + dto.getStudentId()));

        String tagsStr = (dto.getTags() != null && !dto.getTags().isEmpty())
                ? String.join(",", dto.getTags()) : null;

        RecruiterNote note = RecruiterNote.builder()
                .student(student)
                .recruiter(recruiter)
                .content(dto.getContent())
                .rating(dto.getRating())
                .tags(tagsStr)
                .isPrivate(dto.getIsPrivate() != null ? dto.getIsPrivate() : true)
                .build();

        return toDto(noteRepository.save(note));
    }

    public List<RecruiterNoteDto> getNotesForStudent(Long recruiterId, Long studentId) {
        return noteRepository.findByRecruiterIdAndStudentIdOrderByCreatedAtDesc(recruiterId, studentId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteNote(Long noteId, Long recruiterId) {
        noteRepository.deleteByIdAndRecruiterId(noteId, recruiterId);
    }

    private RecruiterNoteDto toDto(RecruiterNote n) {
        List<String> tags = (n.getTags() != null && !n.getTags().isBlank())
                ? Arrays.asList(n.getTags().split(","))
                : List.of();

        return RecruiterNoteDto.builder()
                .id(n.getId())
                .studentId(n.getStudent().getId())
                .studentName(n.getStudent().getFullName())
                .applicationId(n.getApplication() != null ? n.getApplication().getId() : null)
                .content(n.getContent())
                .rating(n.getRating())
                .tags(tags)
                .isPrivate(n.getIsPrivate())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
