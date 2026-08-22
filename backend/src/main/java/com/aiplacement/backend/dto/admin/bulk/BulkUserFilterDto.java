package com.aiplacement.backend.dto.admin.bulk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUserFilterDto {
    private String search;
    private String college;
    private String branch;
    private String plan;
    private String status;
}
