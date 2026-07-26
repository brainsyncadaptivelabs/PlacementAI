package com.aiplacement.backend.exception;

public class CompilationFailedException extends CodeExecutionException {
    public CompilationFailedException(String message) {
        super(message);
    }
    public CompilationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
