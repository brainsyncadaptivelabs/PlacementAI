package com.aiplacement.backend.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration

public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:default}")
    private String cloudName;

    @Value("${cloudinary.api-key:default}")
    private String apiKey;

    @Value("${cloudinary.api-secret:default}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        System.out.println("Initializing Cloudinary with cloud-name: " + cloudName);
        return new Cloudinary(
                ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret,
                        "secure", true
                )
        );
    }
}