package com.aiplacement.backend.service.cloudinary;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    String uploadFile(
            MultipartFile file
    );
}