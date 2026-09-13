package com.aiplacement.backend.service.payment;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;

/**
 * Service responsible for resolving payment operation mode (live vs. mock sandbox)
 * using a fail-closed architecture.
 *
 * Requirements:
 * 1. Mock payment behavior must be disabled by default (payment.mock.enabled=false).
 * 2. Mock payment behavior can only be enabled explicitly in verified local/test development profiles.
 * 3. Production and cloud environments (aws, staging, k8s, india-prod, prod, etc.) must NEVER allow mock payments.
 * 4. Real Razorpay TEST credentials (rzp_test_...) still require legitimate payment verification.
 * 5. Mock mode is never inferred solely from API key prefixes.
 * 6. Unknown environments fail closed and reject mock payments.
 */
@Service
@Slf4j
public class PaymentModeService {

    private static final Set<String> SAFE_DEVELOPMENT_PROFILES = Set.of(
            "dev", "development", "local", "test"
    );

    private final Environment environment;

    @Value("${payment.mock.enabled:false}")
    private boolean mockEnabled;

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    @Autowired
    public PaymentModeService(Environment environment) {
        this.environment = environment;
    }

    public PaymentModeService() {
        this.environment = null;
    }

    public PaymentModeService(Environment environment, boolean mockEnabled, String keyId, String keySecret) {
        this.environment = environment;
        this.mockEnabled = mockEnabled;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @PostConstruct
    public void validateStartup() {
        String[] activeProfiles = getActiveProfiles();
        log.info("[PAYMENT_SECURITY] PaymentModeService initialized. mockEnabled={}, activeProfiles={}",
                mockEnabled, Arrays.toString(activeProfiles));

        if (mockEnabled) {
            if (activeProfiles.length == 0) {
                throw new IllegalStateException(
                        "CRITICAL SECURITY CONFIGURATION ERROR: 'payment.mock.enabled' is set to true, but no active Spring profile is set. " +
                        "Mock payments are strictly prohibited in unknown environments."
                );
            }

            for (String profile : activeProfiles) {
                if (isProductionLikeProfile(profile)) {
                    throw new IllegalStateException(
                            "CRITICAL SECURITY CONFIGURATION ERROR: 'payment.mock.enabled' is set to true while production-like profile '" +
                            profile + "' is active! Mock payments are strictly forbidden in production and cloud environments."
                    );
                }
            }

            boolean hasSafeProfile = Arrays.stream(activeProfiles).anyMatch(this::isSafeDevelopmentProfile);
            if (!hasSafeProfile) {
                throw new IllegalStateException(
                        "CRITICAL SECURITY CONFIGURATION ERROR: 'payment.mock.enabled' is set to true, but active profiles " +
                        Arrays.toString(activeProfiles) + " are not in the safe development allowlist [dev, development, local, test]."
                );
            }

            log.warn("[PAYMENT_SECURITY] *** WARNING: MOCK PAYMENTS ARE EXPLICITLY ENABLED FOR LOCAL DEVELOPMENT/TESTING ***");
        } else {
            log.info("[PAYMENT_SECURITY] Mock payments are disabled. Strict payment verification is enforced.");
        }
    }

    /**
     * Determines whether mock payments/orders are allowed in the current runtime context.
     * Uses a strict fail-closed evaluation.
     */
    public boolean isMockPaymentAllowed() {
        // 1. Fail closed: mock must be explicitly enabled via configuration
        if (!mockEnabled) {
            return false;
        }

        // 2. Fail closed: If environment is unknown (no active profiles), reject mock payments
        String[] activeProfiles = getActiveProfiles();
        if (activeProfiles.length == 0) {
            log.warn("[PAYMENT_SECURITY] Mock payment attempted but active profiles list is empty. Fail-closed: mock rejected.");
            return false;
        }

        // 3. Fail closed: Reject if ANY active profile is production-like or cloud-based
        for (String profile : activeProfiles) {
            if (isProductionLikeProfile(profile)) {
                log.error("[PAYMENT_SECURITY] Mock payment attempted while production-like profile '{}' is active! Fail-closed: mock rejected.", profile);
                return false;
            }
        }

        // 4. Fail closed: Must be present in the safe local development allowlist
        boolean hasSafeProfile = Arrays.stream(activeProfiles).anyMatch(this::isSafeDevelopmentProfile);
        if (!hasSafeProfile) {
            log.warn("[PAYMENT_SECURITY] Mock payment attempted but active profiles {} are not in safe allowlist. Fail-closed: mock rejected.", Arrays.toString(activeProfiles));
            return false;
        }

        return true;
    }

    /**
     * Checks whether valid Razorpay credentials are present and configured.
     * Does NOT treat key prefixes as a basis for enabling mock mode.
     */
    public boolean hasValidCredentials() {
        if (keyId == null || keySecret == null) {
            return false;
        }
        String trimmedId = keyId.trim();
        String trimmedSecret = keySecret.trim();
        return !trimmedId.isEmpty() && !trimmedSecret.isEmpty()
                && !"dummy_secret".equalsIgnoreCase(trimmedSecret);
    }

    /**
     * Check if a profile belongs to the strict safe development allowlist.
     */
    public boolean isSafeDevelopmentProfile(String profile) {
        if (profile == null) return false;
        return SAFE_DEVELOPMENT_PROFILES.contains(profile.trim().toLowerCase(Locale.ROOT));
    }

    /**
     * Check if a profile represents a production, staging, cloud, or container environment.
     */
    public boolean isProductionLikeProfile(String profile) {
        if (profile == null) return true;
        String p = profile.trim().toLowerCase(Locale.ROOT);
        return p.startsWith("prod")
                || p.contains("prod")
                || p.startsWith("stage")
                || p.startsWith("staging")
                || p.equals("aws")
                || p.equals("cloud")
                || p.startsWith("k8s")
                || p.startsWith("kubernetes")
                || p.equals("live")
                || p.equals("release");
    }

    public String[] getActiveProfiles() {
        if (environment == null) {
            return new String[0];
        }
        return environment.getActiveProfiles();
    }

    public boolean isMockEnabled() {
        return mockEnabled;
    }

    public void setMockEnabled(boolean mockEnabled) {
        this.mockEnabled = mockEnabled;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public void setKeySecret(String keySecret) {
        this.keySecret = keySecret;
    }
}
