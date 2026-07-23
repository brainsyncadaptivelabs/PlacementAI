package com.aiplacement.backend.placementintelligence.aptitude;

import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Random;
import static org.junit.jupiter.api.Assertions.*;

public class AptitudeQuestionEngineTest {

    @Test
    void testQuestionGenerationIntegrity() {
        List<AptitudeQuestionFamily> families = AptitudeDynamicFamilyProvider.buildAllDynamicFamilies();
        assertFalse(families.isEmpty());

        Random random = new Random(100);
        String[] difficulties = {"Easy", "Medium", "Hard"};

        // Generate and verify a sample of questions
        for (int i = 0; i < families.size(); i++) {
            AptitudeQuestionFamily family = families.get(i);
            String difficulty = difficulties[i % difficulties.length];
            Question question = family.generate(random, difficulty);

            assertNotNull(question);
            assertNotNull(question.getText());
            assertNotNull(question.getAnswer());
            assertEquals(4, question.getOptions().size());

            // Ensure correct answer exists exactly once in options list
            long count = question.getOptions().stream().filter(opt -> opt.equals(question.getAnswer())).count();
            assertEquals(1, count, "Option list must contain exactly one correct answer matching: " + question.getAnswer());

            // Ensure no empty options/distractors
            for (String opt : question.getOptions()) {
                assertNotNull(opt);
                assertFalse(opt.trim().isEmpty());
            }
        }
    }
}
