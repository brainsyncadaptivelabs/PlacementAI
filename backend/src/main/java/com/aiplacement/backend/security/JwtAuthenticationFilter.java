package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.AdminUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor

public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    private final UserRepository userRepository;

    private final AdminUserRepository adminUserRepository;

    private final UserTokenRevocationService tokenRevocationService;

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,

            HttpServletResponse response,

            FilterChain filterChain

    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        if(authHeader == null
                || !authHeader.startsWith(
                "Bearer "
        )) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String token =
                authHeader.substring(7);

        try {

            String email =
                    jwtService.extractEmail(
                            token
                    );

            String role = jwtService.extractRole(token);
            User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
            
            if (user != null) {
                if (user.getAccountStatus() == com.aiplacement.backend.entity.AccountStatus.BLOCKED || 
                    user.getAccountStatus() == com.aiplacement.backend.entity.AccountStatus.DELETED ||
                    (tokenRevocationService != null && tokenRevocationService.isRevoked(user.getId(), email))) {
                    
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Your account has been suspended. Contact support for details.\"}");
                    return;
                }
            }

            if (role != null) {
                String authority = normalizeRoleAuthority(role);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority(authority))
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                if (user != null) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority(normalizeRoleAuthority(user.getRole().name())))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    com.aiplacement.backend.entity.AdminUser admin = adminUserRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
                    if (admin != null) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }

        } catch (Exception e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }

    public static String normalizeRoleAuthority(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return rawRole;
        }
        String cleanRole = rawRole.trim();
        while (cleanRole.startsWith("ROLE_")) {
            cleanRole = cleanRole.substring(5);
        }
        return "ROLE_" + cleanRole;
    }
}