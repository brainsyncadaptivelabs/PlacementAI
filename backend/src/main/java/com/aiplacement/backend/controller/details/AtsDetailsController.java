package com.aiplacement.backend.controller.details;

import com.aiplacement.backend.dto.details.AtsDetailsDto;
import com.aiplacement.backend.service.details.AtsDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ats")
@RequiredArgsConstructor

public class AtsDetailsController {

    private final AtsDetailsService atsDetailsService;

    @GetMapping("/{id}")

    public AtsDetailsDto getDetails(
            @PathVariable Long id
    ) {

        return atsDetailsService.getDetails(id);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> deleteAnalysis(
            @PathVariable Long id
    ) {
        atsDetailsService.deleteAnalysis(id);
        return org.springframework.http.ResponseEntity.ok().body(java.util.Map.of("message", "Analysis deleted successfully"));
    }
}