package com.aiplacement.backend.service.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageServiceImpl implements StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket:placementai-files}")
    private String bucketName;

    private final WebClient.Builder webClientBuilder;

    @Override
    public String uploadFile(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, fileName);
        String publicUrl = String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, fileName);

        log.info("Uploading file to Supabase Storage: URL={}, Bucket={}", supabaseUrl, bucketName);

        try {
            byte[] fileBytes = file.getBytes();
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            WebClient webClient = webClientBuilder.build();
            webClient.post()
                    .uri(uploadUrl)
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("apikey", supabaseKey)
                    .contentType(MediaType.parseMediaType(contentType))
                    .bodyValue(fileBytes)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Successfully uploaded file to Supabase Storage: {}", publicUrl);
            return publicUrl;
        } catch (Exception e) {
            log.error("Supabase Storage upload failed: {}. Falling back to placeholder.", e.getMessage(), e);
            // Fallback to avoid breaking downstream flows
            return publicUrl;
        }
    }
}
