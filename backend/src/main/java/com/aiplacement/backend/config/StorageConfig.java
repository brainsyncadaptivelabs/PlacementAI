package com.aiplacement.backend.config;

import com.aiplacement.backend.service.storage.LocalStorageServiceImpl;
import com.aiplacement.backend.service.storage.StorageService;
import com.aiplacement.backend.service.storage.SupabaseStorageServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class StorageConfig {

    @Value("${storage.provider:local}")
    private String storageProvider;

    @Bean
    @Primary
    public StorageService storageService(WebClient.Builder webClientBuilder) {
        if ("supabase".equalsIgnoreCase(storageProvider)) {
            return new SupabaseStorageServiceImpl(webClientBuilder);
        }
        return new LocalStorageServiceImpl();
    }
}
