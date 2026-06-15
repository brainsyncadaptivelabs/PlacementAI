package com.aiplacement.backend.service.history;

import com.aiplacement.backend.dto.history.AtsHistoryDto;

import java.util.List;

public interface AtsHistoryService {

    List<AtsHistoryDto> getHistory();
}