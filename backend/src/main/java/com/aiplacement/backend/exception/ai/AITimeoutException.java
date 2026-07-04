package com.aiplacement.backend.exception.ai;

/**
 * Thrown when the AI provider does not respond within the configured timeout.
 * Retry with exponential backoff is appropriate for transient timeout failures.
 */
public class AITimeoutException extends AIException {

    public AITimeoutException(String message) {
        super(message);
    }

    public AITimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
