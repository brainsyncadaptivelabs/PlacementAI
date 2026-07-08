package com.aiplacement.backend.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AICapability {
    private String name;
    private String version;
    private String description;
    private List<String> requiredPermissions;
    private boolean isActive;
}
