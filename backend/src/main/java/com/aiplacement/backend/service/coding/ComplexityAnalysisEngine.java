package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingComplexity;
import com.aiplacement.backend.entity.coding.CodingSubmission;

public interface ComplexityAnalysisEngine {
    /**
     * Estimates Big O time and space complexity from code.
     * Detects brute-force patterns, potential infinite loops, recursion issues.
     * @return Persisted CodingComplexity entity
     */
    CodingComplexity analyze(CodingSubmission submission, String problemStatement,
                              String expectedTimeComplexity, String expectedSpaceComplexity);
}
