package com.aiplacement.backend.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics;

    public RequestLoggingFilter(com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics) {
        this.placementMetrics = placementMetrics;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        // Resolve or generate Request Correlation ID
        String requestId = request.getHeader(LoggingConstants.CORRELATION_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }
        
        // Populate MDC context
        LogContext.setRequestId(requestId);
        LogContext.setMethod(request.getMethod());
        LogContext.setEndpoint(request.getRequestURI());
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        LogContext.setClientIp(ip);
        
        String userAgent = request.getHeader("User-Agent");
        LogContext.setBrowser(userAgent != null ? userAgent : "Unknown");
        
        // Pass request ID down in response headers
        response.setHeader(LoggingConstants.CORRELATION_HEADER, requestId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            // Retrieve User ID after security filters have executed
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = "anonymous";
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                userId = auth.getName();
                placementMetrics.recordUserActivity(userId);
            }
            LogContext.setUserId(userId);
            
            long duration = System.currentTimeMillis() - startTime;
            
            // Format log: method, endpoint, status, duration, IP, browser
            log.info("Request Completed - Method: {}, URI: {}, Status: {}, Duration: {}ms, IP: {}, User: {}, Agent: {}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), duration, ip, userId, userAgent);
            
            LogContext.clear();
        }
    }
}
