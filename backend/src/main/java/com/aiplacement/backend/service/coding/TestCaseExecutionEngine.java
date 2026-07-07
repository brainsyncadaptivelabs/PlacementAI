package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingSubmission;

/**
 * Runs candidate code against all test cases (public + hidden) and
 * persists CodingExecution records per test case.
 */
public interface TestCaseExecutionEngine {
    /**
     * Execute candidate code against all test cases for the problem.
     * @return Updated CodingSubmission with pass/fail counts and per-test results
     */
    CodingSubmission runTestCases(CodingSubmission submission, CodingProblem problem);
}
