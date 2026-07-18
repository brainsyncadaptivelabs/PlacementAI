package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

public class LogicalQuestionFamilies {

    private static final AptitudeDistractorEngine distractorEngine = new AptitudeDistractorEngine();

    @Component
    public static class BloodRelationBasic implements AptitudeQuestionFamily {
        public String familyId() { return "BLOOD_RELATION_BASIC"; }
        public String category() { return "Logical Reasoning"; }
        public String topic() { return "Blood Relations"; }
        public String conceptGroup() { return "DEDUCTIONS"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            String text = "Pointing to a photograph, Amit says, 'He is the only son of my father\\'s wife.' How is the man in the photo related to Amit?";
            
            List<String> options = distractorEngine.generateOptionsString("Brother", new String[]{"Uncle", "Father", "Cousin"}, random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer("Brother")
                .difficulty(difficulty)
                .timeLimit(60)
                .explanation("Father's wife is mother. Mother's only son is brother.")
                .companyLevel("General Pattern")
                .a(1.0)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class DirectionDistance implements AptitudeQuestionFamily {
        public String familyId() { return "DIRECTION_DISTANCE"; }
        public String category() { return "Logical Reasoning"; }
        public String topic() { return "Direction & Distance"; }
        public String conceptGroup() { return "SPATIAL"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int d1 = 3 * (random.nextInt(4) + 1);
            int d2 = 4 * (random.nextInt(4) + 1);
            double hypotenuse = Math.sqrt(d1 * d1 + d2 * d2);



            String text = "A person walks " + d1 + " km North, then turns East and walks " + d2 + " km. How far is the person from the starting point?";
            List<String> options = distractorEngine.generateOptions(hypotenuse, "additive", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(hypotenuse))
                .difficulty(difficulty)
                .timeLimit(60)
                .explanation("Shortest distance = sqrt(" + d1 + "^2 + " + d2 + "^2) = " + hypotenuse + " km.")
                .companyLevel("General Pattern")
                .a(1.1)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    private static String formatNumber(double num) {
        if (num == (long) num) {
            return String.format("%d", (long) num);
        } else {
            return String.format(Locale.US, "%.2f", num);
        }
    }
}
