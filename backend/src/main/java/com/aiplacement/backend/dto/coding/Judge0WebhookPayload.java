package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Judge0WebhookPayload {

    private String token;
    private String stdout;
    private String stderr;
    private String compile_output;
    private String message;
    private Integer exit_code;
    private String exit_signal;
    private String time;
    private Integer memory;
    private Status status;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Status {
        private int id;
        private String description;
    }
}
