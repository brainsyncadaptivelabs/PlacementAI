package com.aiplacement.backend.intelligence;

import org.springframework.stereotype.Service;

/**
 * Builds a {@link PlacementContext} by aggregating data from the user's intelligence profile.
 * In this MVP the data is mocked / left empty – the contract is ready for real repository integration.
 */
@Service
public class ContextBuilder {

    /**
     * Assemble a {@link PlacementContext} for the given user.
     * @param userId identifier of the user (could be email, UUID, etc.)
     * @return populated PlacementContext (currently with minimal fields set)
     */
    public PlacementContext build(String userId) {
        PlacementContext context = new PlacementContext();
        context.setUserId(userId);
        // Future: populate fields from UserIntelligenceProfile repository
        // e.g., context.setAtsScore(profile.getAtsScore());
        return context;
    }
}
