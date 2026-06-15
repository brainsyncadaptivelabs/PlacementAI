package com.aiplacement.backend.service;

import java.io.File;

public interface PdfService {

    String extractTextFromPdf(File file);
}