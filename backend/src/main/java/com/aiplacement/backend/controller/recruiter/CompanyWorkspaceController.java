package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.recruiter.CompanyWorkspaceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.recruiter.CompanyWorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiters/company")
@RequiredArgsConstructor
public class CompanyWorkspaceController {

    private final CompanyWorkspaceService workspaceService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<CompanyWorkspaceDto> getWorkspace() {
        CompanyWorkspaceDto workspace = workspaceService.getWorkspace(currentUser().getId());
        if (workspace == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(workspace);
    }

    @PutMapping
    public ResponseEntity<CompanyWorkspaceDto> upsertWorkspace(@RequestBody CompanyWorkspaceDto dto) {
        return ResponseEntity.ok(workspaceService.upsertWorkspace(dto, currentUser()));
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
    }
}
