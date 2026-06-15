package com.aiplacement.backend.controller.roadmap;

import com.aiplacement.backend.dto.roadmap.RoadmapRequestDto;
import com.aiplacement.backend.dto.roadmap.RoadmapResponseDto;
import com.aiplacement.backend.service.roadmap.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/roadmap")
@RequiredArgsConstructor

public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping("/generate")

    public RoadmapResponseDto generateRoadmap(
            @RequestBody RoadmapRequestDto request
    ) {

        return roadmapService.generateRoadmap(
                request
        );
    }
}