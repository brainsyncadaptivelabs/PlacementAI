package com.aiplacement.backend.dto.voice;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BargeInResult {
    private boolean interrupted;
    private String transcription;
    private String classification;
    private String responseText;
    private String action; // REMAIN, ADVANCE, IGNORE
    private byte[] audioBytes;
}
