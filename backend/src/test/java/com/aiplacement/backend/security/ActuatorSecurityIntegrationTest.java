package com.aiplacement.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ActuatorSecurityIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Test
    void whenUnauthenticated_thenActuatorHealthAndInfoArePublic() throws Exception {
        mockMvc.perform(get("/actuator/health").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
        mockMvc.perform(get("/actuator/info").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
    @Test
    void whenUnauthenticated_thenOtherActuatorEndpointsForbidden() throws Exception {
        mockMvc.perform(get("/actuator/env").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/actuator/beans").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
    @Test
    void whenUnauthenticated_thenVoiceEndpointsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/voice/webhook").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/voice/callback").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
