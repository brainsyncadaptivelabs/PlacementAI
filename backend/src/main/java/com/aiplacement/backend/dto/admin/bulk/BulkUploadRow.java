package com.aiplacement.backend.dto.admin.bulk;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadRow {
    private int rowNumber;
    private String email;
    private String action; // GRANT_PREMIUM, GRANT_BASIC, BLOCK, UNBLOCK, SOFT_DELETE
}
