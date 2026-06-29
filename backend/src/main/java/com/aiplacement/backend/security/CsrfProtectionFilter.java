package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.AdminSession;
import com.aiplacement.backend.repository.AdminSessionRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class CsrfProtectionFilter extends OncePerRequestFilter {

    private final AdminSessionRepository adminSessionRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Enforce CSRF validation for modifying actions on admin APIs (POST, PUT, DELETE, PATCH)
        // Exempt the auth endpoints
        if (path.startsWith("/api/v1/admin/") && !path.startsWith("/api/v1/admin/auth/")
                && (method.equals("POST") || method.equals("PUT") || method.equals("DELETE") || method.equals("PATCH"))) {

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing authorization token");
                return;
            }

            String token = authHeader.substring(7);
            String csrfTokenHeader = request.getHeader("X-CSRF-Token");

            if (csrfTokenHeader == null || csrfTokenHeader.isBlank()) {
                log.warn("[CSRF_PROTECTION] Missing X-CSRF-Token header for request to: {}", path);
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Missing CSRF Token");
                return;
            }

            AdminSession session = adminSessionRepository.findByToken(token).orElse(null);
            if (session == null || session.getCsrfToken() == null || !session.getCsrfToken().equals(csrfTokenHeader)) {
                log.warn("[CSRF_PROTECTION] CSRF token mismatch/invalid session for request to: {}", path);
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Invalid CSRF Token");
                return;
            }
            log.debug("[CSRF_PROTECTION] CSRF check passed for path: {}", path);
        }

        filterChain.doFilter(request, response);
    }
}
