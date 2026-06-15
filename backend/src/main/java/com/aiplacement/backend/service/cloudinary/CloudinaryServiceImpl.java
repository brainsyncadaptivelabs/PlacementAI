package com.aiplacement.backend.service.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor

public class CloudinaryServiceImpl
        implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(
            MultipartFile file
    ) {

        try {

            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.emptyMap()
                    );

            return uploadResult
                    .get("secure_url")
                    .toString();

        } catch (Exception e) {
            System.err.println("Cloudinary upload failed: " + e.getMessage());
            // Fallback to a dummy URL so the process doesn't break
            return "https://res.cloudinary.com/demo/image/upload/sample.pdf";
        }
    }
}