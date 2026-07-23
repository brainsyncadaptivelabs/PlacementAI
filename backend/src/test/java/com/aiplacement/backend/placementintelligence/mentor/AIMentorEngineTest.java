package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.mentor.AIMentorEngine.MentorStatus;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class AIMentorEngineTest {

    private final AIMentorEngine mentorEngine = new AIMentorEngine();
    private final DailyPlannerEngine dailyPlannerEngine = new DailyPlannerEngine();

    @Test
    void testGetStatusForDifferentScores() {
        PlacementContext context = PlacementContext.builder().build();

        // Under 60 -> Needs practice guidance
        MentorStatus weak = mentorEngine.getStatus(context, 45);
        assertFalse(weak.isReadyForPlacements());
        assertTrue(weak.getMentorGuidance().contains("coding mission"));

        // Ready boundary 75
        MentorStatus boundary = mentorEngine.getStatus(context, 75);
        assertTrue(boundary.isReadyForPlacements());

        // High score >= 85
        MentorStatus elite = mentorEngine.getStatus(context, 90);
        assertTrue(elite.isReadyForPlacements());
        assertTrue(elite.getMentorGuidance().contains("FAANG"));
    }

    @Test
    void testDailyMissionDifferentScores() {
        PlacementContext context = PlacementContext.builder().build();

        // Low Score Daily Mission
        Map<String, Object> lowMission = dailyPlannerEngine.generateDailyMission(context, 50);
        assertEquals("Strengthen Backend Programming Foundations", lowMission.get("missionTitle"));
        assertNotNull(lowMission.get("estimatedTime"));

        // High Score Daily Mission
        Map<String, Object> highMission = dailyPlannerEngine.generateDailyMission(context, 85);
        assertEquals("Refine Advanced System Design & Scale", highMission.get("missionTitle"));
        assertNotNull(highMission.get("estimatedTime"));
    }
}
