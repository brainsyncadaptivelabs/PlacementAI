package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAudit(String adminEmail, String clientIp, String action, String target, String status) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                    .adminEmail(adminEmail != null ? adminEmail : "SUPER_ADMIN")
                    .action(action)
                    .target(target)
                    .status(status != null ? status : "SUCCESS")
                    .browser("Admin Console")
                    .os("Server")
                    .build());
        } catch (Exception e) {
            log.warn("[AUDIT_LOG_SERVICE] Failed to save audit log entry with REQUIRES_NEW propagation", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAudit(String adminEmail, String clientIp, String action, String target) {
        logAudit(adminEmail, clientIp, action, target, "SUCCESS");
    }
}
