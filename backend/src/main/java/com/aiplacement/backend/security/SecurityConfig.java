package com.aiplacement.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity

public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,https://placementai.in,https://www.placementai.in}")
    private List<String> allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CsrfProtectionFilter csrfProtectionFilter;
    private final com.aiplacement.backend.logging.RequestLoggingFilter requestLoggingFilter;
    private final com.aiplacement.backend.ratelimit.RateLimitFilter rateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .csrf(csrf -> csrf.disable())

                .headers(headers -> {
                    headers.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none';"));
                    headers.referrerPolicy(referrer -> referrer.policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER));
                    headers.permissionsPolicy(permissions -> permissions.policy("camera=(), microphone=(), geolocation=()"));
                    headers.httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000).preload(true));
                })

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers(

                                "/api/v1/auth/**",

                                "/swagger-ui/**",

                                "/swagger-ui.html",

                                "/v3/api-docs/**",

                                "/actuator/health",

                                "/api/v1/profile/public/**",

                                "/error"

                        ).permitAll()

                        .requestMatchers(
                                "/actuator/**"
                        ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(
                                "/api/v1/admin/auth/**"
                        ).permitAll()

                        .requestMatchers(
                                "/api/v1/admin/**"
                        ).hasRole("SUPER_ADMIN")

                        // Standardized enterprise URL hierarchy (Phase 1)
                        .requestMatchers(
                                "/api/v1/recruiters/**"
                        ).hasAnyRole(
                                "RECRUITER",
                                "ADMIN"
                        )

                        // Deprecated: kept for backward compatibility — use /api/v1/recruiters/** instead
                        .requestMatchers(
                                "/api/v1/recruiter/**"
                        ).hasAnyRole(
                                "RECRUITER",
                                "ADMIN"
                        )

                        // Standardized enterprise URL hierarchy (Phase 1)
                        .requestMatchers(
                                "/api/v1/placement-officers/**"
                        ).hasAnyRole(
                                "PLACEMENT_OFFICER",
                                "ADMIN"
                        )

                        // Deprecated: kept for backward compatibility — use /api/v1/placement-officers/** instead
                        .requestMatchers(
                                "/api/v1/ppo/**"
                        ).hasAnyRole(
                                "PLACEMENT_OFFICER",
                                "ADMIN"
                        )

                        .requestMatchers(
                                "/api/v1/placement-officer/**"
                        ).hasAnyRole(
                                "PLACEMENT_OFFICER",
                                "ADMIN"
                        )

                        .requestMatchers(
                                "/api/v1/voice/webhook",
                                "/api/v1/voice/callback"
                        ).permitAll()

                        .requestMatchers(
                                "/api/v1/voice/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/v1/student/**"
                        ).hasRole("STUDENT")

                        .requestMatchers(
                                "/api/v1/chat/**"
                        ).authenticated()

                        .anyRequest()
                        .authenticated()
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Full authentication is required to access this resource.");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendError(jakarta.servlet.http.HttpServletResponse.SC_FORBIDDEN, "Access denied. You do not have permission to access this resource.");
                        })
                )
                .addFilterBefore(
                        requestLoggingFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterBefore(

                        jwtAuthenticationFilter,

                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterAfter(
                        rateLimitFilter,
                        JwtAuthenticationFilter.class
                )
                .addFilterAfter(
                        csrfProtectionFilter,
                        JwtAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }

    @Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(allowedOrigins);

    configuration.setAllowedMethods(List.of(
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
    ));

    configuration.setAllowedHeaders(List.of("*"));

    configuration.setExposedHeaders(List.of(
            "Authorization",
            "Content-Type"
    ));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
}
}