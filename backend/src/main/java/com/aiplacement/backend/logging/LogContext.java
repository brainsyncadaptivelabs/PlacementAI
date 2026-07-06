package com.aiplacement.backend.logging;

import org.slf4j.MDC;

public final class LogContext {

    public static void setRequestId(String requestId) {
        MDC.put(LoggingConstants.REQUEST_ID, requestId);
    }

    public static void setUserId(String userId) {
        MDC.put(LoggingConstants.USER_ID, userId);
    }

    public static void setClientIp(String clientIp) {
        MDC.put(LoggingConstants.CLIENT_IP, clientIp);
    }

    public static void setBrowser(String browser) {
        MDC.put(LoggingConstants.BROWSER, browser);
    }

    public static void setEndpoint(String endpoint) {
        MDC.put(LoggingConstants.ENDPOINT, endpoint);
    }

    public static void setMethod(String method) {
        MDC.put(LoggingConstants.METHOD, method);
    }

    public static void clear() {
        MDC.clear();
    }
    
    private LogContext() {}
}
