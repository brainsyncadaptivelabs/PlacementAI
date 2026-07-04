package com.aiplacement.backend.exception.ai;

/**
 * Thrown when the AI provider returns an unexpected error that does not map
 * to a more specific subtype (e.g. 5xx server error, malformed provider response).
 * Retry may be appropriate depending on the status code.
 */
public class AIProviderException extends AIException {

    private final int statusCode;

    public AIProviderException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public AIProviderException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
