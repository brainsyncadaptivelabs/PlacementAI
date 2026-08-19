package com.aiplacement.backend.rag;

import lombok.Data;

@Data
public class CompanyQuestionIngestionRequest {
    private String companyName;
    private String role;
    private String question;
}
