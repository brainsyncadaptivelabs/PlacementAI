package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

public class VerbalQuestionFamilies {

    private static final AptitudeDistractorEngine distractorEngine = new AptitudeDistractorEngine();
    private static final AptitudeFingerprintService fingerprintService = new AptitudeFingerprintService();

    @Component
    public static class SynonymContext implements AptitudeQuestionFamily {
        public String familyId() { return "SYNONYM_CONTEXT"; }
        public String category() { return "Verbal Ability"; }
        public String topic() { return "Synonyms"; }
        public String conceptGroup() { return "VOCABULARY"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            String[][] wordPairs = {
                {"ABANDON", "Forsake", "Keep", "Cherish", "Adopt"},
                {"ACQUIRE", "Gain", "Lose", "Surrender", "Forfeit"},
                {"BENEFICIAL", "Advantageous", "Harmful", "Useless", "Adverse"},
                {"CANDID", "Frank", "Deceptive", "Secretive", "Guarded"}
            };
            int idx = random.nextInt(wordPairs.length);
            String[] row = wordPairs[idx];

            Map<String, Object> params = Map.of("word", row[0]);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "SYNONYM");

            String text = "Identify the synonym of the word '" + row[0] + "'.";
            List<String> options = distractorEngine.generateOptionsString(row[1], new String[]{row[2], row[3], row[4]}, random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(row[1])
                .difficulty(difficulty)
                .timeLimit(30)
                .explanation("Synonym of " + row[0] + " is " + row[1])
                .companyLevel("General Pattern")
                .a(1.0)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class ErrorDetection implements AptitudeQuestionFamily {
        public String familyId() { return "ERROR_DETECTION"; }
        public String category() { return "English"; }
        public String topic() { return "Grammar"; }
        public String conceptGroup() { return "GRAMMAR_CHECK"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            String correct = "Each of the students has completed the assignment.";
            String[] distractors = {
                "Each of the students have completed the assignment.",
                "Each of the student has completed the assignment.",
                "Each of the students are completed the assignment."
            };

            Map<String, Object> params = Map.of("concept", "subject-verb-agreement");
            String fp = fingerprintService.generateFingerprint(familyId(), params, "CORRECT_SENTENCE");

            String text = "Identify the grammatically correct sentence from the options below.";
            List<String> options = distractorEngine.generateOptionsString(correct, distractors, random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(correct)
                .difficulty(difficulty)
                .timeLimit(45)
                .explanation("'Each' is a singular pronoun and takes the singular verb 'has'.")
                .companyLevel("General Pattern")
                .a(1.0)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }
}
