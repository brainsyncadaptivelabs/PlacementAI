package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

/**
 * One-time backfill runner that populates user_id on existing api_usage_logs rows
 * by joining user_email against the User entity.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiUsageLogBackfillRunner implements ApplicationRunner {

    private final ApiUsageLogRepository apiUsageLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        log.info("[API_USAGE_BACKFILL] Checking for api_usage_logs rows missing user_id...");
        List<ApiUsageLog> unlinkedLogs = apiUsageLogRepository.findAll().stream()
                .filter(l -> l.getUserId() == null && l.getUserEmail() != null)
                .toList();

        if (unlinkedLogs.isEmpty()) {
            log.info("[API_USAGE_BACKFILL] No api_usage_logs rows require backfilling.");
            return;
        }

        Map<String, User> userEmailMap = userRepository.findAll().stream()
                .collect(Collectors.toMap(
                        u -> u.getEmail().toLowerCase(),
                        u -> u,
                        (existing, replacement) -> existing
                ));

        int backfilledCount = 0;
        int unmatchedCount = 0;

        for (ApiUsageLog usageLog : unlinkedLogs) {
            String emailKey = usageLog.getUserEmail().toLowerCase();
            User user = userEmailMap.get(emailKey);
            if (user != null) {
                usageLog.setUserId(user.getId());
                backfilledCount++;
            } else {
                unmatchedCount++;
            }
        }

        apiUsageLogRepository.saveAll(unlinkedLogs);
        log.info("[API_USAGE_BACKFILL] Backfill completed: {} rows successfully updated with user_id, {} rows unmatched (orphaned/anonymous).",
                backfilledCount, unmatchedCount);
    }
}
