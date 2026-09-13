package com.aiplacement.backend.service.payment;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.*;

class PaymentModeServiceTest {

    @Test
    @DisplayName("Mock payment is disabled by default (payment.mock.enabled=false)")
    void testDefaultDisabled() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        PaymentModeService service = new PaymentModeService(env, false, "rzp_test_key", "secret123");

        assertFalse(service.isMockPaymentAllowed(), "Mock payment must be false when payment.mock.enabled is false");
    }

    @Test
    @DisplayName("Development environment allows mock payments ONLY when explicitly enabled")
    void testDevProfileWithMockExplicitlyEnabled() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        PaymentModeService service = new PaymentModeService(env, true, "rzp_test_dummy_id", "dummy_secret");

        assertTrue(service.isMockPaymentAllowed(), "Mock payment must be allowed when explicitly enabled in 'dev' profile");
    }

    @Test
    @DisplayName("Development environment rejects mock payments when mock.enabled is false")
    void testDevProfileWithMockDisabled() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        PaymentModeService service = new PaymentModeService(env, false, "rzp_test_dummy_id", "dummy_secret");

        assertFalse(service.isMockPaymentAllowed(), "Mock payment must be rejected in 'dev' when mock.enabled=false");
    }

    @Test
    @DisplayName("Production environment ('prod', 'production') ALWAYS rejects mock orders even if mock.enabled=true")
    void testProductionAlwaysRejected() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        PaymentModeService service = new PaymentModeService(env, true, "rzp_live_abc123", "live_secret_456");

        assertFalse(service.isMockPaymentAllowed(), "Mock payment must NEVER be allowed in production");

        MockEnvironment env2 = new MockEnvironment();
        env2.setActiveProfiles("production");
        PaymentModeService service2 = new PaymentModeService(env2, true, "rzp_live_abc123", "live_secret_456");

        assertFalse(service2.isMockPaymentAllowed(), "Mock payment must NEVER be allowed in 'production' profile");
    }

    @ParameterizedTest
    @ValueSource(strings = {"aws", "staging", "stage", "cloud", "india-prod", "us-prod", "k8s", "kubernetes", "live", "release"})
    @DisplayName("Production-like and cloud environments always reject mock payments even if mock.enabled=true")
    void testProductionLikeProfilesAlwaysRejected(String profile) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(profile);
        PaymentModeService service = new PaymentModeService(env, true, "rzp_live_key", "live_secret");

        assertFalse(service.isMockPaymentAllowed(),
                "Profile '" + profile + "' must strictly reject mock payments regardless of mock.enabled setting");
    }

    @Test
    @DisplayName("Unknown environment (no active profiles) fails closed and rejects mock payments")
    void testUnknownEnvironmentRejected() {
        MockEnvironment env = new MockEnvironment(); // No profiles set
        PaymentModeService service = new PaymentModeService(env, true, "rzp_test_key", "secret123");

        assertFalse(service.isMockPaymentAllowed(), "Unknown environment must fail closed and reject mock payments");
    }

    @Test
    @DisplayName("Startup validation throws IllegalStateException if mock.enabled=true in production")
    void testStartupValidationThrowsInProduction() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        PaymentModeService service = new PaymentModeService(env, true, "rzp_live_key", "secret123");

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateStartup);
        assertTrue(ex.getMessage().contains("strictly forbidden in production"),
                "Exception message must identify production violation");
    }

    @ParameterizedTest
    @ValueSource(strings = {"aws", "staging", "cloud", "india-prod", "kubernetes"})
    @DisplayName("Startup validation throws IllegalStateException if mock.enabled=true in cloud/staging profiles")
    void testStartupValidationThrowsInCloudProfiles(String profile) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(profile);
        PaymentModeService service = new PaymentModeService(env, true, "rzp_test_key", "secret123");

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateStartup);
        assertTrue(ex.getMessage().contains("strictly forbidden in production and cloud environments"),
                "Exception message must identify cloud/staging profile violation");
    }

    @Test
    @DisplayName("Startup validation throws IllegalStateException if mock.enabled=true with no active profiles")
    void testStartupValidationThrowsInUnknownEnvironment() {
        MockEnvironment env = new MockEnvironment(); // empty
        PaymentModeService service = new PaymentModeService(env, true, "rzp_test_key", "secret123");

        IllegalStateException ex = assertThrows(IllegalStateException.class, service::validateStartup);
        assertTrue(ex.getMessage().contains("no active Spring profile is set"),
                "Exception message must identify empty profile violation");
    }

    @Test
    @DisplayName("Startup validation succeeds when mock.enabled=true in valid dev profile")
    void testStartupValidationSucceedsInDevWithMockEnabled() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        PaymentModeService service = new PaymentModeService(env, true, "rzp_test_key", "secret123");

        assertDoesNotThrow(service::validateStartup);
    }

    @Test
    @DisplayName("Startup validation succeeds when mock.enabled=false in production")
    void testStartupValidationSucceedsInProdWithMockDisabled() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        PaymentModeService service = new PaymentModeService(env, false, "rzp_live_key", "real_secret");

        assertDoesNotThrow(service::validateStartup);
    }

    @Test
    @DisplayName("Valid credentials detection does not rely solely on key prefixes")
    void testHasValidCredentials() {
        PaymentModeService service = new PaymentModeService();

        // Dummy secret is not considered valid credentials
        service.setKeyId("rzp_test_dummy_id");
        service.setKeySecret("dummy_secret");
        assertFalse(service.hasValidCredentials());

        // Real test credentials are valid
        service.setKeyId("rzp_test_1234567890abcdef");
        service.setKeySecret("my_real_test_secret_999");
        assertTrue(service.hasValidCredentials());

        // Live credentials are valid
        service.setKeyId("rzp_live_1234567890abcdef");
        service.setKeySecret("my_live_secret_999");
        assertTrue(service.hasValidCredentials());

        // Missing/blank keys are invalid
        service.setKeyId("");
        service.setKeySecret("");
        assertFalse(service.hasValidCredentials());
    }
}
