package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.config.NvidiaVoiceConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NvidiaTextToSpeechProvider implements TextToSpeechProvider {

    private final NvidiaVoiceConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public byte[] synthesize(String text, String voice, double speed) {
        log.info("[TRACE] [NVIDIA_TTS] Sending synthesis request for text length: {}. Voice: {}, Speed: {}", 
                text != null ? text.length() : 0, voice, speed);
        log.info("[TRACE] [NVIDIA_TTS] Input text details: '{}'", text);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + config.getTtsApiKey());

            Map<String, Object> body = new HashMap<>();
            body.put("input", text);
            body.put("model", config.getTtsModel());
            body.put("voice", voice != null && !voice.isBlank() ? voice : "English-US-Male-1");
            body.put("response_format", "wav");
            body.put("speed", speed);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = config.getBaseUrl() + "/audio/speech";
            log.info("[TRACE] [NVIDIA_TTS] Calling NVIDIA endpoint: {}, Model: {}", url, config.getTtsModel());

            ResponseEntity<byte[]> response = restTemplate.postForEntity(url, requestEntity, byte[].class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("[TRACE] [NVIDIA_TTS] Synthesized successfully, output size: {} bytes", response.getBody().length);
                return response.getBody();
            } else {
                throw new RuntimeException("NVIDIA TTS returned status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("[TRACE] [NVIDIA_TTS] Synthesis request failed with error: {}. Stack trace follows:", e.getMessage(), e);
            log.warn("[TRACE] [NVIDIA_TTS] Falling back to mock audio stream (128 bytes dummy WAV header)");
            // Safe mock audio WAV file header fallback
            byte[] mockWav = new byte[128];
            mockWav[0] = 'R'; mockWav[1] = 'I'; mockWav[2] = 'F'; mockWav[3] = 'F';
            return mockWav;
        }
    }
}
class MapWithAdd extends HashMap<String, Object> {
    public void add(String key, Object val) {
        this.put(key, val);
    }
}
