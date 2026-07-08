package com.aiplacement.backend.placementintelligence.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PlacementEventBus {

    private final ApplicationEventPublisher publisher;

    public void publishEvent(String eventName, String userEmail) {
        log.info("[PlacementAI Engine] Event published: {} for user: {}", eventName, userEmail);
        publisher.publishEvent(new PlacementEngineEvent(this, eventName, userEmail));
    }

    @EventListener
    public void handleEngineEvent(PlacementEngineEvent event) {
        log.info("[PlacementAI Engine] Event received: {} for user: {}. Triggering partial recalculation.",
                event.getEventName(), event.getUserEmail());
        // Additive action logic here...
    }

    @Getter
    public static class PlacementEngineEvent extends ApplicationEvent {
        private final String eventName;
        private final String userEmail;

        public PlacementEngineEvent(Object source, String eventName, String userEmail) {
            super(source);
            this.eventName = eventName;
            this.userEmail = userEmail;
        }
    }
}
