package com.aiplacement.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfServiceImpl implements PdfService {

    @Override
    public String extractTextFromPdf(File file) {
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            log.error("Failed to parse PDF document", e);
            throw new RuntimeException("Failed to parse PDF document: " + e.getMessage(), e);
        }
    }

    @Override
    public String extractText(File file, String originalFilename) {
        if (file == null || !file.exists() || file.length() == 0) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }

        if (originalFilename == null) {
            throw new IllegalArgumentException("Unable to determine file type.");
        }

        String lowerName = originalFilename.toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            log.info("Parsing PDF file: {}", originalFilename);
            return extractTextFromPdf(file);
        } else if (lowerName.endsWith(".docx")) {
            log.info("Parsing DOCX file: {}", originalFilename);
            try (FileInputStream fis = new FileInputStream(file);
                 XWPFDocument document = new XWPFDocument(fis);
                 XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                return extractor.getText();
            } catch (Exception e) {
                log.error("Failed to parse DOCX document", e);
                throw new RuntimeException("Failed to parse DOCX document: " + e.getMessage(), e);
            }
        } else {
            throw new IllegalArgumentException("Unsupported file type (" + originalFilename + "). Please upload a PDF or DOCX file.");
        }
    }
}