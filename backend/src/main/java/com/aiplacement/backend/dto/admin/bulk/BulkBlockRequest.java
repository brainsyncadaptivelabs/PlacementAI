package com.aiplacement.backend.dto.admin.bulk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkBlockRequest {
    private List<Long> userIds;
    private BulkUserFilterDto filter;
    private Boolean selectAllMatchingFilter;
    private String reason;
}
