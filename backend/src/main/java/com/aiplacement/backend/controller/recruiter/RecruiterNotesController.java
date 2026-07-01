package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.RecruiterNoteDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.RecruiterNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruiter/notes")
@RequiredArgsConstructor
public class RecruiterNotesController {

    private final RecruiterNoteService noteService;
    private final UserRepository userRepository;

    @PostMapping("/students/{studentId}")
    public ResponseEntity<RecruiterNoteDto> addNote(
            @PathVariable Long studentId,
            @RequestBody RecruiterNoteDto dto) {
        dto.setStudentId(studentId);
        return ResponseEntity.ok(noteService.addNote(dto, currentUser()));
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<List<RecruiterNoteDto>> getNotes(@PathVariable Long studentId) {
        return ResponseEntity.ok(noteService.getNotesForStudent(currentUser().getId(), studentId));
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(noteId, currentUser().getId());
        return ResponseEntity.noContent().build();
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
