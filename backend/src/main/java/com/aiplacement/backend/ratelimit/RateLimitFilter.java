package com.aiplacement.backend.ratelimit;

import com.aiplacement.backend.logging.LoggingConstants;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(RateLimitService rateLimitService, RateLimitProperties properties) {
        this.rateLimitService = rateLimitService;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 1. Determine rate limit configuration for the endpoint
        RateLimitProperties.LimitConfig limitConfig = null;
        String limitType = null;
        boolean isIpBased = false;

        if (uri.matches("/api/(v1/)?auth/login")) {
            limitConfig = properties.getLogin();
            limitType = "login";
            isIpBased = true;
        } else if (uri.matches("/api/(v1/)?auth/signup")) {
            limitConfig = properties.getSignup();
            limitType = "signup";
            isIpBased = true;
        } else if (uri.startsWith("/api/v1/chat/") || uri.startsWith("/api/chat/")) {
            limitConfig = properties.getChat();
            limitType = "chat";
        } else if (uri.startsWith("/api/v1/resume/") || uri.startsWith("/api/resume/")) {
            limitConfig = properties.getResumeUpload();
            limitType = "resume";
        } else if (uri.startsWith("/api/v1/upload/") || uri.startsWith("/api/upload/")) {
            limitConfig = properties.getResumeUpload();
            limitType = "upload";
        } else if (uri.startsWith("/api/v1/ats/") || uri.startsWith("/api/ats/")) {
            limitConfig = properties.getAts();
            limitType = "ats";
        } else if (uri.startsWith("/api/v1/mock-interview/") || uri.startsWith("/api/mock-interview/")) {
            limitConfig = properties.getMockInterview();
            limitType = "mock-interview";
        }

        // 2. Perform check if endpoint matches rate limit rules
        if (limitConfig != null) {
            String key;
            if (isIpBased) {
                key = getClientIp(request);
            } else {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                    key = auth.getName();
                } else {
                    key = getClientIp(request); // fallback to IP for unauthenticated users
                }
            }

            boolean allowed = rateLimitService.isAllowed(key, limitType, limitConfig);
            if (!allowed) {
                sendRateLimitError(response, "Rate limit exceeded. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private void sendRateLimitError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String requestId = MDC.get(LoggingConstants.REQUEST_ID);
        if (requestId == null) {
            requestId = response.getHeader(LoggingConstants.CORRELATION_HEADER);
        }
        if (requestId == null) {
            requestId = "";
        }

        Map<String, Object> errorDetails = new LinkedHashMap<>();
        errorDetails.put("timestamp", Instant.now().toString());
        errorDetails.put("status", 429);
        errorDetails.put("error", "Too Many Requests");
        errorDetails.put("message", message);
        errorDetails.put("requestId", requestId);

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}
