package com.aiplacement.backend.service.details;

import com.aiplacement.backend.dto.details.AtsDetailsDto;

public interface AtsDetailsService {

    AtsDetailsDto getDetails(
            Long id
    );

    void deleteAnalysis(
            Long id
    );
}