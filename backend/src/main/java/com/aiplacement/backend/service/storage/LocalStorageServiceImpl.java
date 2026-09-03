package com.aiplacement.backend.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
public class LocalStorageServiceImpl implements StorageService {

    @Value("${storage.local.dir:./storage/uploads}")
    private String uploadDir;

    @Value("${backend.url:http://localhost:8080}")
    private String backendUrl;

    @Override
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null.");
        }

        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        try {
            Path destinationDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(destinationDir)) {
                Files.createDirectories(destinationDir);
                log.info("Created local storage directory: {}", destinationDir);
            }

            Path targetPath = destinationDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = String.format("%s/storage/files/%s", backendUrl, fileName);
            log.info("File saved locally at: {}, public URL: {}", targetPath, fileUrl);
            return fileUrl;
        } catch (IOException e) {
            log.error("Failed to store file locally", e);
            throw new RuntimeException("Could not store file locally", e);
        }
    }
}
