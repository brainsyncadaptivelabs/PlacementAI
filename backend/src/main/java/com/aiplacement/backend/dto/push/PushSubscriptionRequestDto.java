package com.aiplacement.backend.dto.push;

import lombok.Data;

@Data
public class PushSubscriptionRequestDto {
    private String endpoint;
    private Keys keys;

    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}
