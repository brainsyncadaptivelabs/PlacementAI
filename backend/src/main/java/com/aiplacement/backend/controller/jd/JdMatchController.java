package com.aiplacement.backend.controller.jd;

import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;
import com.aiplacement.backend.service.jd.JdMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jd")
@RequiredArgsConstructor

public class JdMatchController {

    private final JdMatchService jdMatchService;

    @PostMapping("/match")

    public JdMatchResponseDto matchJobDescription(
            @RequestBody JdMatchRequestDto request
    ) {

        return jdMatchService.matchJobDescription(
                request
        );
    }
}