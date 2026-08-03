package com.aiplacement.backend.exception;

import lombok.Getter;

@Getter
public class AtsInferenceParseException extends RuntimeException {

    private final String rawResponseBody;

    public AtsInferenceParseException(String message, String rawResponseBody) {
        super(message);
        this.rawResponseBody = rawResponseBody;
    }

    public AtsInferenceParseException(String message, String rawResponseBody, Throwable cause) {
        super(message, cause);
        this.rawResponseBody = rawResponseBody;
    }
}
