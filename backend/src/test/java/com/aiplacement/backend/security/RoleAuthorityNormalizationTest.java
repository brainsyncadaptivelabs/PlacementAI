package com.aiplacement.backend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RoleAuthorityNormalizationTest {

    @Test
    @DisplayName("Given input SUPER_ADMIN and ROLE_SUPER_ADMIN, both normalize to ROLE_SUPER_ADMIN without double prefix")
    void testRoleAuthorityNormalization() {
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("SUPER_ADMIN"));
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("ROLE_SUPER_ADMIN"));
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("ROLE_ROLE_SUPER_ADMIN"));
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("ROLE_ROLE_ROLE_SUPER_ADMIN"));
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("  SUPER_ADMIN  "));
        assertEquals("ROLE_SUPER_ADMIN", JwtAuthenticationFilter.normalizeRoleAuthority("  ROLE_SUPER_ADMIN  "));

        assertEquals("ROLE_STUDENT", JwtAuthenticationFilter.normalizeRoleAuthority("STUDENT"));
        assertEquals("ROLE_STUDENT", JwtAuthenticationFilter.normalizeRoleAuthority("ROLE_STUDENT"));
        assertEquals("ROLE_RECRUITER", JwtAuthenticationFilter.normalizeRoleAuthority("RECRUITER"));
        assertEquals("ROLE_PLACEMENT_OFFICER", JwtAuthenticationFilter.normalizeRoleAuthority("PLACEMENT_OFFICER"));

        assertNull(JwtAuthenticationFilter.normalizeRoleAuthority(null));
        assertEquals("", JwtAuthenticationFilter.normalizeRoleAuthority(""));
        assertEquals("   ", JwtAuthenticationFilter.normalizeRoleAuthority("   "));
    }
}
