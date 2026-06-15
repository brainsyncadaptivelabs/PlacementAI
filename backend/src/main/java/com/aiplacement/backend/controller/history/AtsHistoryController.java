package com.aiplacement.backend.controller.history;

import com.aiplacement.backend.dto.history.AtsHistoryDto;
import com.aiplacement.backend.service.history.AtsHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/history")
@RequiredArgsConstructor

public class AtsHistoryController {

    private final AtsHistoryService atsHistoryService;

    @GetMapping("/ats")

    public List<AtsHistoryDto> getHistory() {

        return atsHistoryService.getHistory();
    }
}