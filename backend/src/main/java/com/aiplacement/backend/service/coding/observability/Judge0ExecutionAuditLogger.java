package com.aiplacement.backend.service.coding.observability;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@Slf4j
public class Judge0ExecutionAuditLogger {

    @Value("${coding.execution.slow-threshold-ms:3000}")
    private long slowExecutionThresholdMs;

    public void logExecutionAudit(Long submissionId, String language, String verdict, long runtimeMs, long memoryMb, String status) {
        String correlationId = MDC.get(CorrelationIdFilter.CORRELATION_ID_MDC_KEY);
        
        Map<String, Object> auditMap = new LinkedHashMap<>();
        auditMap.put("event", "JUDGE0_EXECUTION_AUDIT");
        auditMap.put("correlationId", correlationId != null ? correlationId : "N/A");
        auditMap.put("submissionId", submissionId);
        auditMap.put("language", language);
        auditMap.put("verdict", verdict);
        auditMap.put("runtimeMs", runtimeMs);
        auditMap.put("memoryMb", memoryMb);
        auditMap.put("status", status);
        auditMap.put("timestamp", System.currentTimeMillis());

        log.info("[AUDIT] [JUDGE0] {}", auditMap);

        if (runtimeMs > slowExecutionThresholdMs) {
            log.warn("[SLOW_QUERY] [JUDGE0] Execution time {}ms exceeded threshold {}ms for submission ID {}",
                    runtimeMs, slowExecutionThresholdMs, submissionId);
        }
    }
}
