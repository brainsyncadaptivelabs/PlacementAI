package com.aiplacement.backend.service.ocr;

import org.springframework.web.multipart.MultipartFile;

public interface OcrService {

    String extractTextFromImage(
            MultipartFile file
    );
}