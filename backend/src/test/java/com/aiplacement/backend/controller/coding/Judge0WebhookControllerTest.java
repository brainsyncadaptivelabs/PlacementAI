package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.service.coding.AsyncJudge0ExecutionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class Judge0WebhookControllerTest {

    @Mock
    private AsyncJudge0ExecutionService asyncExecutionService;

    private Judge0Properties properties;
    private Judge0WebhookController controller;

    @BeforeEach
    void setUp() {
        properties = new Judge0Properties();
        controller = new Judge0WebhookController(asyncExecutionService, properties);
    }

    @Test
    void handleJudge0Callback_secretConfigured_missingOrInvalidSignature_returns401() {
        properties.setWebhookSecret("my-super-secret");

        Judge0WebhookPayload payload = Judge0WebhookPayload.builder().token("token-123").build();

        // Missing signature header
        ResponseEntity<?> response = controller.handleJudge0Callback(null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Invalid signature header
        ResponseEntity<?> responseInvalid = controller.handleJudge0Callback("wrong-secret", null, payload);
        assertThat(responseInvalid.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        verify(asyncExecutionService, never()).processWebhookResult(any(), any());
    }

    @Test
    void handleJudge0Callback_secretConfigured_validSignature_processesCallback() {
        properties.setWebhookSecret("my-super-secret");
        when(asyncExecutionService.processWebhookResult(eq("token-123"), any())).thenReturn(true);

        Judge0WebhookPayload payload = Judge0WebhookPayload.builder().token("token-123").build();

        ResponseEntity<?> response = controller.handleJudge0Callback("my-super-secret", null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(asyncExecutionService).processWebhookResult(eq("token-123"), any());
    }

    @Test
    void handleJudge0Callback_secretUnset_localDevMode_allowsCallback() {
        properties.setWebhookSecret(""); // secret unset
        when(asyncExecutionService.processWebhookResult(eq("token-123"), any())).thenReturn(true);

        Judge0WebhookPayload payload = Judge0WebhookPayload.builder().token("token-123").build();

        ResponseEntity<?> response = controller.handleJudge0Callback(null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        verify(asyncExecutionService).processWebhookResult(eq("token-123"), any());
    }

    @Test
    void handleJudge0Callback_duplicateOrTerminalExecution_returns409Conflict() {
        properties.setWebhookSecret("");
        when(asyncExecutionService.processWebhookResult(eq("token-duplicate"), any())).thenReturn(false);

        Judge0WebhookPayload payload = Judge0WebhookPayload.builder().token("token-duplicate").build();

        ResponseEntity<?> response = controller.handleJudge0Callback(null, null, payload);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }
}
