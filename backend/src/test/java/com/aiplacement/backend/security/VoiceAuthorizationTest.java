package com.aiplacement.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class VoiceAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    @Test
    void testAnonymousAccessToActuatorHealth() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void testAnonymousAccessToActuatorPrometheusIsBlocked() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testAnonymousAccessToVoiceTimelineIsBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/voice/timeline/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testAnonymousAccessToVoiceProfileIsBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/voice/profile/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testAnonymousAccessToVoiceAudioIsBlocked() throws Exception {
        mockMvc.perform(get("/api/v1/voice/audio/1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testAnonymousAccessToVoiceTtsIsBlocked() throws Exception {
        mockMvc.perform(post("/api/v1/voice/tts")
                        .contentType("application/json")
                        .content("{\"text\":\"hello\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testAnonymousAccessToVoiceSttIsBlocked() throws Exception {
        mockMvc.perform(post("/api/v1/voice/stt"))
                .andExpect(status().is4xxClientError());
    }
}
