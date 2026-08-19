package com.aiplacement.backend.rag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, String>> ingestQuestion(@RequestBody CompanyQuestionIngestionRequest request) {
        ragService.ingestQuestion(request);
        return ResponseEntity.ok(Map.of("message", "Question ingested successfully"));
    }

    @GetMapping("/retrieve")
    public ResponseEntity<List<String>> retrieveHints(@RequestParam(required = false) String companyName,
                                                      @RequestParam String query) {
        List<String> hints = ragService.retrieveHints(companyName, query);
        return ResponseEntity.ok(hints);
    }
}
