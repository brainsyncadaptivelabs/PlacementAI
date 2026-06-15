package com.aiplacement.backend.controller.details;

import com.aiplacement.backend.dto.details.AtsDetailsDto;
import com.aiplacement.backend.service.details.AtsDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor

public class AtsDetailsController {

    private final AtsDetailsService atsDetailsService;

    @GetMapping("/{id}")

    public AtsDetailsDto getDetails(
            @PathVariable Long id
    ) {

        return atsDetailsService.getDetails(id);
    }
}