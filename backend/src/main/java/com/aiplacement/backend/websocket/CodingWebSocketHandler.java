package com.aiplacement.backend.websocket;

import com.aiplacement.backend.security.JwtService;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class CodingWebSocketHandler extends TextWebSocketHandler {

    private final JwtService jwtService;
    private final MockInterviewRepository mockInterviewRepository;
    private final WebSocketClient pistonWsClient = new StandardWebSocketClient();

    @Value("${piston.api.ws-url:ws://localhost:2000/api/v2/connect}")
    private String pistonWsUrl;

    // Map frontend session ID -> Piston WebSocket session
    private final Map<String, WebSocketSession> pistonSessions = new ConcurrentHashMap<>();

    public CodingWebSocketHandler(JwtService jwtService, MockInterviewRepository mockInterviewRepository) {
        this.jwtService = jwtService;
        this.mockInterviewRepository = mockInterviewRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        MultiValueMap<String, String> queryParams = UriComponentsBuilder.fromUri(uri).build().getQueryParams();
        String token = queryParams.getFirst("token");
        String interviewIdStr = queryParams.getFirst("interviewId");

        // 1. JWT Authentication
        if (token == null || token.isBlank()) {
            log.warn("[WebSocket] Connection rejected: Token missing.");
            session.close(new CloseStatus(4001, "Unauthorized: Token missing"));
            return;
        }

        String email;
        try {
            email = jwtService.extractEmail(token);
        } catch (Exception e) {
            log.warn("[WebSocket] Connection rejected: Invalid token. Error: {}", e.getMessage());
            session.close(new CloseStatus(4002, "Unauthorized: Invalid token"));
            return;
        }

        // 2. Interview & Session validation (if interviewId is provided)
        if (interviewIdStr != null && !interviewIdStr.isBlank()) {
            try {
                Long interviewId = Long.parseLong(interviewIdStr);
                MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
                if (interview == null) {
                    log.warn("[WebSocket] Connection rejected: Interview not found. ID: {}", interviewId);
                    session.close(new CloseStatus(4003, "Forbidden: Interview not found"));
                    return;
                }
                if (interview.getUser() == null || !email.equalsIgnoreCase(interview.getUser().getEmail())) {
                    log.warn("[WebSocket] Connection rejected: Candidate mismatch for interview ID: {}", interviewId);
                    session.close(new CloseStatus(4004, "Forbidden: User mismatch"));
                    return;
                }
            } catch (NumberFormatException e) {
                session.close(CloseStatus.BAD_DATA);
                return;
            }
        }

        log.info("[WebSocket] Handshake successful for user: {}", email);

        // Connect to Piston WebSocket endpoint
        try {
            WebSocketSession pistonSession = pistonWsClient.execute(new TextWebSocketHandler() {
                @Override
                protected void handleTextMessage(WebSocketSession wsSession, TextMessage message) throws Exception {
                    // Relay Piston message -> Frontend
                    if (session.isOpen()) {
                        session.sendMessage(message);
                    }
                }

                @Override
                public void afterConnectionClosed(WebSocketSession wsSession, CloseStatus status) throws Exception {
                    // Close Frontend session if Piston session closed
                    if (session.isOpen()) {
                        session.close(status);
                    }
                }
            }, pistonWsUrl).get(); // blocking wait for connection

            pistonSessions.put(session.getId(), pistonSession);
            log.info("[WebSocket] Connected to Piston runtime for session: {}", session.getId());
        } catch (Exception e) {
            log.error("[WebSocket] Failed to connect to Piston runtime: {}", e.getMessage());
            session.close(new CloseStatus(1011, "Failed to connect to Piston execution runtime"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        WebSocketSession pistonSession = pistonSessions.get(session.getId());
        if (pistonSession != null && pistonSession.isOpen()) {
            // Relay Frontend message -> Piston
            pistonSession.sendMessage(message);
        } else {
            log.warn("[WebSocket] Piston session not active for frontend session: {}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        WebSocketSession pistonSession = pistonSessions.remove(session.getId());
        if (pistonSession != null && pistonSession.isOpen()) {
            pistonSession.close(status);
        }
        log.info("[WebSocket] Session closed: {}", session.getId());
    }
}
