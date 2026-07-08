package com.aiplacement.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadFile(MultipartFile file);
}
