package com.aiplacement.backend.dto.admin.bulk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkRowResult {
    private int rowNumber;
    private String email;
    private Long userId;
    private boolean success;
    private String error;
}
