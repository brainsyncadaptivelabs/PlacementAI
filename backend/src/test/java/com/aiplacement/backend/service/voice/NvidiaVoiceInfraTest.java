package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.config.NvidiaVoiceConfig;
import com.aiplacement.backend.dto.voice.SttResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "student@example.com", roles = "ADMIN")
class NvidiaVoiceInfraTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NvidiaVoiceConfig config;

    @Autowired
    private VoiceSessionService voiceSessionService;

    // ─── Configuration Tests ─────────────────────────────────────────────────

    @Test
    void config_shouldLoadDefaultValues() {
        assertThat(config.getBaseUrl()).contains("integrate.api.nvidia.com");
        assertThat(config.getSttModel()).isEqualTo("nvidia/parakeet-tdt-0.6b-v2");
        assertThat(config.getTtsModel()).isEqualTo("nvidia/magpie-tts-multilingual");
        assertThat(config.getSttApiKey()).isNotEmpty();
    }

    // ─── Voice Session Service Tests ─────────────────────────────────────────

    @Test
    void voiceSession_shouldProcessAudioToTranscript() {
        byte[] mockAudio = new byte[]{0, 1, 2, 3};
        SttResult result = voiceSessionService.processAudioInput(mockAudio, "test.wav", "audio/wav");
        
        assertThat(result).isNotNull();
        assertThat(result.getTranscript()).contains("distributed rate limiter");
        assertThat(result.getConfidence()).isGreaterThan(0.0);
    }

    @Test
    void voiceSession_shouldSynthesizeTextToAudio() {
        byte[] audio = voiceSessionService.processTextOutput("Hello world", "English-US-Male-1", 1.0);
        
        assertThat(audio).isNotEmpty();
        assertThat((char)audio[0]).isEqualTo('R'); // WAV header check
    }

    // ─── REST Endpoint Integration Tests ─────────────────────────────────────

    @Test
    void endpoint_stt_transcribesAudio() throws Exception {
        MockMultipartFile audioFile = new MockMultipartFile(
                "audio", "recording.wav", "audio/wav", new byte[]{0, 1, 2, 3});

        mockMvc.perform(multipart("/api/v1/voice/stt")
                        .file(audioFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transcript").value(org.hamcrest.Matchers.containsString("rate limiter")));
    }

    @Test
    void endpoint_tts_synthesizesText() throws Exception {
        String payload = "{\"text\": \"Welcome to PlacementAI\"}";

        mockMvc.perform(post("/api/v1/voice/tts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().contentType("audio/wav"))
                .andExpect(content().bytes(new byte[]{0, 1, 2, 3} != null ? getMockPrefix() : null));
    }

    @Test
    void endpoint_health_returnsNvidiaStatus() throws Exception {
        mockMvc.perform(get("/api/v1/voice/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.sttModel").value("nvidia/parakeet-tdt-0.6b-v2"))
                .andExpect(jsonPath("$.ttsModel").value("nvidia/magpie-tts-multilingual"));
    }

    private byte[] getMockPrefix() {
        byte[] mockWav = new byte[128];
        mockWav[0] = 'R'; mockWav[1] = 'I'; mockWav[2] = 'F'; mockWav[3] = 'F';
        return mockWav;
    }
}
