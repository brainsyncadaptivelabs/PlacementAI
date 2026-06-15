package com.aiplacement.backend.service.jd;

import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;

public interface JdMatchService {

    JdMatchResponseDto matchJobDescription(
            JdMatchRequestDto request
    );
}