package com.aiplacement.backend.dto.voice;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SttResult {
    private String transcript;
    private List<WordTimestamp> timestamps;
    private Double confidence;
    private Long processingTimeMs;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WordTimestamp {
        private String word;
        private Double start;
        private Double end;
    }
}
