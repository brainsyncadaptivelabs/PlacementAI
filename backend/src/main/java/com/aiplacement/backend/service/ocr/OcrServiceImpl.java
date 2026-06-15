package com.aiplacement.backend.service.ocr;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
@Slf4j
public class OcrServiceImpl implements OcrService {

    @Override
    public String extractTextFromImage(MultipartFile file) {
        File tempFile = null;
        try {
            tempFile = File.createTempFile("resume-image", ".png");
            file.transferTo(tempFile);

            Tesseract tesseract = new Tesseract();
            String datapath = resolveTessdataPath();
            tesseract.setDatapath(datapath);
            tesseract.setLanguage("eng");

            log.info("Running OCR extraction using datapath: {}", datapath);
            String extractedText = tesseract.doOCR(tempFile);

            log.info("OCR text extraction completed successfully");
            return extractedText;

        } catch (IOException | TesseractException e) {
            log.error("Failed to extract text from image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract text from image: " + e.getMessage());
        } finally {
            if (tempFile != null && tempFile.exists()) {
                boolean deleted = tempFile.delete();
                if (deleted) {
                    log.info("Temporary OCR image file cleaned up successfully");
                }
            }
        }
    }

    private String resolveTessdataPath() {
        // 1. Check environment variable
        String envPath = System.getenv("TESSDATA_PREFIX");
        if (envPath != null && new File(envPath).exists()) {
            log.info("Found TESSDATA_PREFIX environment variable: {}", envPath);
            return envPath;
        }

        // 2. Check system property
        String sysProp = System.getProperty("tessdata.path");
        if (sysProp != null && new File(sysProp).exists()) {
            log.info("Found tessdata.path system property: {}", sysProp);
            return sysProp;
        }

        // 3. Define common search paths for macOS, Linux, and Windows
        String[] commonPaths = {
                "/opt/homebrew/share/tessdata", // macOS Apple Silicon
                "/usr/local/share/tessdata",    // macOS Intel / Linux
                "/usr/share/tesseract-ocr/tessdata", // Ubuntu / Debian standard
                "/usr/share/tessdata",          // General Linux
                "C:/Program Files/Tesseract-OCR/tessdata", // Windows default
                "./tessdata" // Local project fallback
        };

        for (String path : commonPaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                log.info("Resolved Tesseract tessdata path dynamically: {}", path);
                return path;
            }
        }

        log.warn("Tesseract tessdata directory could not be resolved in standard locations. Falling back to default Windows path.");
        return "C:/Program Files/Tesseract-OCR/tessdata";
    }
}