package com.aiplacement.backend.entity.coding;

public enum ExecutionStatus {
    QUEUED,
    COMPILING,
    RUNNING,
    FINISHED,
    FAILED,
    TIMEOUT,
    CANCELLED;

    public boolean isTerminal() {
        return this == FINISHED || this == FAILED || this == TIMEOUT || this == CANCELLED;
    }
}
