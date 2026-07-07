package com.aiplacement.backend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class NvidiaVoiceConfig {

    @Value("${nvidia.api.key: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}")
    private String apiKey;

    @Value("${nvidia.stt.api.key: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}")
    private String sttApiKey;

    @Value("${nvidia.tts.api.key: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}")
    private String ttsApiKey;

    @Value("${nvidia.stt.model:nvidia/parakeet-tdt-0.6b-v2}")
    private String sttModel;

    @Value("${nvidia.tts.model:nvidia/magpie-tts-multilingual}")
    private String ttsModel;

    @Value("${nvidia.base.url:https://integrate.api.nvidia.com/v1}")
    private String baseUrl;
}
