package com.aiplacement.backend.dto.jd;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class JdMatchRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String resumeText;

    private String jobDescription;
}