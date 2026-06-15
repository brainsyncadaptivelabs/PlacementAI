package com.aiplacement.backend.exception;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ApiErrorResponse {

    private String message;

    private Integer status;

    private LocalDateTime timestamp;
}