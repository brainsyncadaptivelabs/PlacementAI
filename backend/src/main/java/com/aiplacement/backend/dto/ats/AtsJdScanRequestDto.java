package com.aiplacement.backend.dto.ats;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request payload for JD-based ATS resume scans.
 * <p>
 * Exactly one of {@code jdText} or {@code jdFileUrl} must be provided (mutually exclusive, at least 1 required).
 * If {@code jdFileUrl} is provided, the backend text extraction service (e.g. {@code PdfServiceImpl} or {@code OcrServiceImpl})
 * will automatically parse and extract raw text from the specified document before constructing the prompt.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsJdScanRequestDto {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    private String jdText;
    private String jdFileUrl;
    private String targetRole;

    /**
     * Validates that exactly one of jdText or jdFileUrl is supplied.
     */
    @AssertTrue(message = "Exactly one of 'jdText' or 'jdFileUrl' must be provided (not both, not neither)")
    @JsonIgnore
    public boolean isJdInputValid() {
        boolean hasText = jdText != null && !jdText.trim().isEmpty();
        boolean hasFile = jdFileUrl != null && !jdFileUrl.trim().isEmpty();
        return (hasText || hasFile) && !(hasText && hasFile);
    }
}
