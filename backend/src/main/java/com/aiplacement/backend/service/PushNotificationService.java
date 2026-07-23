package com.aiplacement.backend.service;

import com.aiplacement.backend.entity.PushSubscription;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.util.List;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class PushNotificationService {

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    private PushService pushService;
    private final PushSubscriptionRepository repository;

    @PostConstruct
    private void init() throws GeneralSecurityException {
        if (java.security.Security.getProvider("BC") == null) {
            java.security.Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
        }
        pushService = new PushService(publicKey, privateKey, subject);
    }

    public void sendNotification(User user, String title, String body) {
        List<PushSubscription> subscriptions = repository.findByUser(user);
        for (PushSubscription sub : subscriptions) {
            sendNotificationToSubscription(sub, title, body);
        }
    }

    private void sendNotificationToSubscription(PushSubscription sub, String title, String body) {
        try {
            Subscription.Keys keys = new Subscription.Keys(sub.getP256dh(), sub.getAuth());
            Subscription subscription = new Subscription(sub.getEndpoint(), keys);
            
            String payload = String.format("{\"title\":\"%s\",\"body\":\"%s\"}", title, body);
            Notification notification = new Notification(subscription, payload);
            pushService.send(notification);
        } catch (Exception e) {
            log.error("Failed to send push notification to endpoint: {}", sub.getEndpoint(), e);
        }
    }
}
