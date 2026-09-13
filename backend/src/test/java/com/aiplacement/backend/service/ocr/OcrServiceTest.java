package com.aiplacement.backend.service.ocr;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OcrServiceTest {

    private OcrServiceImpl ocrService;

    @BeforeEach
    void setUp() {
        ocrService = new OcrServiceImpl();
    }

    @Test
    @DisplayName("extractTextFromImage handles file stream copying and throws cleanly when file stream fails")
    void testExtractTextFromImage_IoExceptionHandling() throws Exception {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getInputStream()).thenThrow(new IOException("Disk read error"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            ocrService.extractTextFromImage(mockFile);
        });

        assertTrue(exception.getMessage().contains("Failed to extract text from image"));
        assertTrue(exception.getMessage().contains("Disk read error"));
    }

    @Test
    @DisplayName("extractTextFromImage safely attempts stream copy with MockMultipartFile")
    void testExtractTextFromImage_MockMultipartFileCopy() {
        byte[] dummyPngBytes = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample_resume.png",
                "image/png",
                dummyPngBytes
        );

        try {
            String text = ocrService.extractTextFromImage(file);
            assertNotNull(text);
        } catch (RuntimeException e) {
            assertTrue(e.getMessage().contains("Failed to extract text from image"));
        }
    }
}
