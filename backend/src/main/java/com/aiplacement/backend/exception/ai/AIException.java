package com.aiplacement.backend.exception.ai;

/**
 * Base exception for all AI provider failures.
 *
 * <p>All provider-specific exceptions extend this class so callers can catch
 * a single type when they do not need to distinguish the failure mode.</p>
 */
public class AIException extends RuntimeException {

    public AIException(String message) {
        super(message);
    }

    public AIException(String message, Throwable cause) {
        super(message, cause);
    }
}
