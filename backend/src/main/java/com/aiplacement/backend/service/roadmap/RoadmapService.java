package com.aiplacement.backend.service.roadmap;

import com.aiplacement.backend.dto.roadmap.RoadmapRequestDto;
import com.aiplacement.backend.dto.roadmap.RoadmapResponseDto;

public interface RoadmapService {

    RoadmapResponseDto generateRoadmap(
            RoadmapRequestDto request
    );
}