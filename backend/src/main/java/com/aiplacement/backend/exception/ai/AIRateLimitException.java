package com.aiplacement.backend.exception.ai;

/**
 * Thrown when the AI provider rate-limits the request (HTTP 429).
 * Retry with exponential backoff is appropriate for this failure.
 */
public class AIRateLimitException extends AIException {

    public AIRateLimitException(String message) {
        super(message);
    }

    public AIRateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
}
