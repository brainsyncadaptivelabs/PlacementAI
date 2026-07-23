package com.aiplacement.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Adds HTTP deprecation and sunset headers for legacy endpoints.
 * The map contains the base path of the legacy endpoint and the corresponding sunset date.
 */
@Component
public class DeprecationHeaderFilter extends OncePerRequestFilter {
    private static final Map<String, String> DEPRECATED_ENDPOINTS = Map.of(
            "/api/v1/recruiter", "Fri, 31 Dec 2024 23:59:59 GMT",
            "/api/v1/ppo", "Fri, 31 Dec 2024 23:59:59 GMT"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        DEPRECATED_ENDPOINTS.keySet().stream()
                .filter(path::startsWith)
                .findFirst()
                .ifPresent(p -> {
                    response.addHeader("Deprecation", "true");
                    response.addHeader("Sunset", DEPRECATED_ENDPOINTS.get(p));
                });
        filterChain.doFilter(request, response);
    }
}
