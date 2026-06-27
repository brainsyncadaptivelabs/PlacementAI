package com.aiplacement.backend.exception;

public class DatabaseConflictException extends RuntimeException {
    public DatabaseConflictException(String message) {
        super(message);
    }
}
