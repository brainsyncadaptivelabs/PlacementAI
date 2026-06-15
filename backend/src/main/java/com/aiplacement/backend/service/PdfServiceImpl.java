package com.aiplacement.backend.service;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor

public class PdfServiceImpl
        implements PdfService {

    @Override
    public String extractTextFromPdf(
            File file
    ) {

        try {

            PDDocument document =
                    PDDocument.load(file);

            PDFTextStripper stripper =
                    new PDFTextStripper();

            String text =
                    stripper.getText(document);

            document.close();

            return text;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to extract PDF text"
            );
        }
    }
}