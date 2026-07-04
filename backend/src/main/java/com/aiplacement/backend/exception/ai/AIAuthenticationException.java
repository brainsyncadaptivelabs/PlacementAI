package com.aiplacement.backend.exception.ai;

/**
 * Thrown when the AI provider rejects the request due to invalid or missing credentials.
 * This exception should NOT be retried — it requires operator intervention.
 */
public class AIAuthenticationException extends AIException {

    public AIAuthenticationException(String message) {
        super(message);
    }

    public AIAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
