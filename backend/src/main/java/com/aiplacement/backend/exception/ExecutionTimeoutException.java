package com.aiplacement.backend.exception;

public class ExecutionTimeoutException extends CodeExecutionException {
    public ExecutionTimeoutException(String message) {
        super(message);
    }
    public ExecutionTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
