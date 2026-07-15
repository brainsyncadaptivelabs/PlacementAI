package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class AptitudeCatEngine {

    public double calculateIIF(double theta, double a, double b, double c) {
        double expTerm = Math.exp(-a * (theta - b));
        double p = c + (1.0 - c) / (1.0 + expTerm);
        double q = 1.0 - p;
        double num = a * a * q * (p - c) * (p - c);
        double den = p * p * (1.0 - c) * (1.0 - c);
        return den > 0 ? num / den : 0;
    }

    public Question selectCATQuestion(List<Question> pool, double theta, Map<String, Integer> exposureRegistry) {
        if (pool == null || pool.isEmpty()) return null;
        Question bestQ = pool.get(0);
        double maxInfo = -1.0;

        for (Question q : pool) {
            double a = q.getA() != 0 ? q.getA() : 1.2;
            double b = q.getB();
            double c = q.getC() != 0 ? q.getC() : 0.25;

            double info = calculateIIF(theta, a, b, c);

            // Apply exposure penalty
            int exposureCount = exposureRegistry.getOrDefault(q.getTopic(), 0);
            info = info / (1.0 + exposureCount * 0.5);

            if (info > maxInfo) {
                maxInfo = info;
                bestQ = q;
            }
        }
        return bestQ;
    }

    public double updateTheta(double theta, Question q, boolean isCorrect) {
        double a = q.getA() != 0 ? q.getA() : 1.2;
        double b = q.getB();
        double c = q.getC() != 0 ? q.getC() : 0.25;

        double expTerm = Math.exp(-a * (theta - b));
        double p = c + (1.0 - c) / (1.0 + expTerm);

        double nextTheta = theta;
        if (isCorrect) {
            nextTheta += 0.4 * (1.0 - p);
        } else {
            nextTheta -= 0.4 * p;
        }
        return Math.max(-3.0, Math.min(3.0, nextTheta));
    }
}
