package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class AptitudeDistractorEngine {

    public List<String> generateOptions(double correctAnswer, String strategy, Random random) {
        Set<String> optionsSet = new LinkedHashSet<>();
        String correctStr = formatNumber(correctAnswer);
        optionsSet.add(correctStr);

        int maxAttempts = 100;
        while (optionsSet.size() < 4 && maxAttempts > 0) {
            maxAttempts--;
            double distractor = 0.0;
            if ("multiply".equals(strategy)) {
                distractor = correctAnswer * (0.5 + random.nextDouble() * 1.5);
            } else if ("additive".equals(strategy)) {
                distractor = correctAnswer + (-30 + random.nextInt(60));
            } else {
                distractor = correctAnswer + (-10 + random.nextInt(20));
            }

            if (distractor <= 0) {
                distractor = correctAnswer + random.nextInt(10) + 1;
            }

            String formatted = formatNumber(distractor);
            if (!formatted.equals(correctStr)) {
                optionsSet.add(formatted);
            }
        }

        // Fill up to 4 if failed
        int filler = 1;
        while (optionsSet.size() < 4) {
            optionsSet.add(formatNumber(correctAnswer + (filler * 10)));
            filler++;
        }

        List<String> list = new ArrayList<>(optionsSet);
        Collections.shuffle(list, random);
        return list;
    }

    public List<String> generateOptionsString(String correctVal, String[] distractors, Random random) {
        Set<String> optionsSet = new LinkedHashSet<>();
        optionsSet.add(correctVal);
        if (distractors != null) {
            for (String d : distractors) {
                if (d != null && !d.trim().isEmpty()) {
                    optionsSet.add(d.trim());
                }
            }
        }

        String[] fallbacks = {"None of these", "Cannot be determined", "Both A and B", "Information insufficient"};
        int idx = 0;
        while (optionsSet.size() < 4) {
            optionsSet.add(fallbacks[idx % fallbacks.length]);
            idx++;
        }

        List<String> list = new ArrayList<>(optionsSet);
        Collections.shuffle(list, random);
        return list;
    }

    private String formatNumber(double num) {
        if (num == (long) num) {
            return String.format("%d", (long) num);
        } else {
            return String.format(Locale.US, "%.2f", num);
        }
    }
}
