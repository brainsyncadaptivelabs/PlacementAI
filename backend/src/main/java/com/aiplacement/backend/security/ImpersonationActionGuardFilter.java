package com.aiplacement.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ImpersonationActionGuardFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    private static final List<String> BLOCKED_PATHS = List.of(
            "/api/v1/auth/reset-password",
            "/api/v1/user/change-password",
            "/api/v1/auth/forgot-password",
            "/api/v1/user/email",
            "/api/v1/auth/verify-email",
            "/api/v1/user/2fa",
            "/api/v1/user/account",
            "/api/v1/billing/subscribe",
            "/api/v1/billing/cancel",
            "/api/v1/auth/refresh-token"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isImpersonatedToken(token)) {
                String path = request.getRequestURI();
                boolean isBlocked = BLOCKED_PATHS.stream().anyMatch(path::startsWith) || 
                                    path.startsWith("/api/v1/admin/users");

                if (isBlocked) {
                    log.warn("[IMPERSONATION_GUARD] Blocked sensitive request path {} during impersonation session", path);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Action forbidden during admin impersonation session\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
