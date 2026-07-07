package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingSubmission;

/**
 * Detects plagiarism, known solution templates, suspicious patterns,
 * and AI-generated code indicators in coding submissions.
 */
public interface PlagiarismDetectionEngine {
    /**
     * Analyze submission for plagiarism and flag if suspicious.
     * @return Updated CodingSubmission with plagiarismFlagged and plagiarismScore set
     */
    CodingSubmission analyze(CodingSubmission submission, String problemStatement);
}
