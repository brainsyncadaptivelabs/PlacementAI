package com.aiplacement.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service

public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    private static final long ACCESS_TOKEN_EXPIRATION =
            1000 * 60 * 30; // 30 minutes

    private static final long REFRESH_TOKEN_EXPIRATION =
            1000L * 60 * 60 * 24 * 7;

    private Key getSigningKey() {

        return Keys.hmacShaKeyFor(
                secretKey.getBytes()
        );
    }

    public String generateAccessToken(
            String email
    ) {
        return generateAccessToken(email, null);
    }

    public String generateAccessToken(
            String email,
            String role
    ) {
        var builder = io.jsonwebtoken.Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION));

        if (role != null) {
            builder.claim("role", role);
        }

        return builder.signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateImpersonationToken(
            String targetEmail,
            Long targetUserId,
            String targetRole,
            Long adminId,
            String adminEmail,
            String adminRole,
            String reason
    ) {
        java.util.Map<String, Object> actingAs = java.util.Map.of(
                "adminId", adminId != null ? adminId : 0L,
                "adminEmail", adminEmail != null ? adminEmail : "SUPER_ADMIN",
                "adminRole", adminRole != null ? adminRole : "SUPER_ADMIN"
        );

        return Jwts.builder()
                .setSubject(targetEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION)) // 30 minutes hard limit
                .claim("userId", targetUserId)
                .claim("role", targetRole)
                .claim("impersonated", true)
                .claim("actingAs", actingAs)
                .claim("reason", reason != null ? reason : "Admin Impersonation Session")
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isImpersonatedToken(String token) {
        try {
            Boolean imp = extractClaims(token).get("impersonated", Boolean.class);
            return Boolean.TRUE.equals(imp);
        } catch (Exception e) {
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public java.util.Map<String, Object> extractActingAs(String token) {
        try {
            return extractClaims(token).get("actingAs", java.util.Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String extractRole(String token) {
        try {
            return extractClaims(token).get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String generateRefreshToken(
            String email
    ) {

        return Jwts.builder()

                .setSubject(email)

                .setIssuedAt(
                        new Date()
                )

                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + REFRESH_TOKEN_EXPIRATION
                        )
                )

                .signWith(
                        getSigningKey(),
                        SignatureAlgorithm.HS256
                )

                .compact();
    }

    public String extractEmail(
            String token
    ) {

        return extractClaims(token)
                .getSubject();
    }

    public boolean isTokenValid(
            String token
    ) {

        try {

            extractClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    private Claims extractClaims(
            String token
    ) {

        return Jwts.parserBuilder()

                .setSigningKey(
                        getSigningKey()
                )

                .build()

                .parseClaimsJws(token)

                .getBody();
    }
}