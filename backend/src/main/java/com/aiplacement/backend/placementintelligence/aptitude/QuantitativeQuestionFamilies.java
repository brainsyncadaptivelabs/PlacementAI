package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

public class QuantitativeQuestionFamilies {

    private static final AptitudeDistractorEngine distractorEngine = new AptitudeDistractorEngine();
    private static final AptitudeFingerprintService fingerprintService = new AptitudeFingerprintService();

    @Component
    public static class PercentageBasic implements AptitudeQuestionFamily {
        public String familyId() { return "PERCENTAGE_BASIC_FIND_PERCENT"; }
        public String category() { return "Quantitative Aptitude"; }
        public String topic() { return "Percentage"; }
        public String conceptGroup() { return "PERCENTAGES"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int total = "Easy".equals(difficulty) ? 100 * (random.nextInt(9) + 1) : 250 * (random.nextInt(15) + 1);
            int rate = "Easy".equals(difficulty) ? 10 * (random.nextInt(9) + 1) : 5 * (random.nextInt(19) + 1);
            double answer = (total * rate) / 100.0;

            Map<String, Object> params = Map.of("total", total, "rate", rate);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "PERCENT");

            String text = "Calculate " + rate + "% of " + total + ".";
            List<String> options = distractorEngine.generateOptions(answer, "additive", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(answer))
                .difficulty(difficulty)
                .timeLimit(30)
                .explanation(rate + "% of " + total + " is " + answer)
                .companyLevel("General Pattern")
                .a(1.0)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class ProfitLossBasic implements AptitudeQuestionFamily {
        public String familyId() { return "PROFIT_LOSS_FIND_PROFIT"; }
        public String category() { return "Quantitative Aptitude"; }
        public String topic() { return "Profit & Loss"; }
        public String conceptGroup() { return "COMMERCE_MATH"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int cp = "Easy".equals(difficulty) ? 100 * (random.nextInt(9) + 1) : 250 * (random.nextInt(15) + 1);
            int profitPct = "Easy".equals(difficulty) ? 10 : 15;
            double profit = (cp * profitPct) / 100.0;

            Map<String, Object> params = Map.of("cp", cp, "profitPct", profitPct);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "PROFIT");

            String text = "An article with cost price ₹" + cp + " is sold at a " + profitPct + "% profit. Find the profit amount.";
            List<String> options = distractorEngine.generateOptions(profit, "additive", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(profit))
                .difficulty(difficulty)
                .timeLimit(40)
                .explanation("Profit = " + cp + " * " + profitPct + "% = ₹" + profit)
                .companyLevel("General Pattern")
                .a(1.0)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class SimpleInterestBasic implements AptitudeQuestionFamily {
        public String familyId() { return "SIMPLE_INTEREST_FIND_INTEREST"; }
        public String category() { return "Quantitative Aptitude"; }
        public String topic() { return "Simple Interest"; }
        public String conceptGroup() { return "INTERESTS"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int p = 1000 * (random.nextInt(10) + 1);
            int r = 5 + random.nextInt(6);
            int t = 2 + random.nextInt(4);
            double si = (p * r * t) / 100.0;

            Map<String, Object> params = Map.of("p", p, "r", r, "t", t);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "INTEREST");

            String text = "Find the simple interest on ₹" + p + " at a rate of " + r + "% per annum for " + t + " years.";
            List<String> options = distractorEngine.generateOptions(si, "additive", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(si))
                .difficulty(difficulty)
                .timeLimit(50)
                .explanation("SI = P * R * T / 100 = " + p + " * " + r + " * " + t + " / 100 = ₹" + si)
                .companyLevel("General Pattern")
                .a(1.2)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class TimeWorkCombined implements AptitudeQuestionFamily {
        public String familyId() { return "TIME_WORK_COMBINED"; }
        public String category() { return "Quantitative Aptitude"; }
        public String topic() { return "Time & Work"; }
        public String conceptGroup() { return "TIME_WORK"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int a = 10 + random.nextInt(10);
            int b = 15 + random.nextInt(15);
            double combined = (double) (a * b) / (a + b);

            Map<String, Object> params = Map.of("a", a, "b", b);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "DAYS");

            String text = "If Person A takes " + a + " days and Person B takes " + b + " days to complete a task, how many days will they take working together?";
            List<String> options = distractorEngine.generateOptions(combined, "additive", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(combined))
                .difficulty(difficulty)
                .timeLimit(60)
                .explanation("Combined = (A * B)/(A + B) = " + combined)
                .companyLevel("General Pattern")
                .a(1.1)
                .b(0.0)
                .c(0.25)
                .build();
        }
    }

    @Component
    public static class SpeedDistanceBasic implements AptitudeQuestionFamily {
        public String familyId() { return "SPEED_DISTANCE_BASIC"; }
        public String category() { return "Quantitative Aptitude"; }
        public String topic() { return "Speed, Distance & Time"; }
        public String conceptGroup() { return "SPEED_MOTION"; }
        public Set<String> supportedDifficulties() { return Set.of("Easy", "Medium", "Hard"); }

        public Question generate(Random random, String difficulty) {
            int speed = "Easy".equals(difficulty) ? 10 * (random.nextInt(6) + 3) : 5 * (random.nextInt(15) + 5);
            int time = 2 + random.nextInt(7);
            double distance = speed * time;

            Map<String, Object> params = Map.of("speed", speed, "time", time);
            String fp = fingerprintService.generateFingerprint(familyId(), params, "DISTANCE");

            String text = "A car traveling at " + speed + " km/h travels for " + time + " hours. What distance does it cover?";
            List<String> options = distractorEngine.generateOptions(distance, "multiply", random);

            return Question.builder()
                .category(category())
                .topic(topic())
                .text(text)
                .options(options)
                .answer(formatNumber(distance))
                .difficulty(difficulty)
                .timeLimit(45)
                .explanation("Distance = Speed * Time = " + speed + " * " + time + " = " + distance + " km.")
                .companyLevel("General Pattern")
                .a(1.0)
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
