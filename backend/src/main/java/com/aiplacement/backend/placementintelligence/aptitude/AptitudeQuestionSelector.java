package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import com.aiplacement.backend.controller.user.AptitudeController;
import java.util.*;

@Component
public class AptitudeQuestionSelector {

    private final AptitudeQuestionFamilyRegistry registry;
    private final AptitudeFingerprintService fingerprintService;
    private final AptitudeCatEngine catEngine;
    private final Random random = new Random();

    public AptitudeQuestionSelector(AptitudeQuestionFamilyRegistry registry,
                                    AptitudeFingerprintService fingerprintService,
                                    AptitudeCatEngine catEngine) {
        this.registry = registry;
        this.fingerprintService = fingerprintService;
        this.catEngine = catEngine;
    }

    public List<Question> selectQuestions(
            String category,
            String topic,
            String mode,
            int length,
            List<String> excludedFingerprints,
            Map<String, Integer> historicalSeenFamilies,
            List<String> weakTopics
    ) {
        List<Question> selected = new ArrayList<>();
        Set<String> sessionFingerprints = new HashSet<>(excludedFingerprints);
        Set<String> sessionFamilyIds = new HashSet<>();
        Deque<String> recentConcepts = new ArrayDeque<>();

        List<AptitudeQuestionFamily> pool = getEligibleFamilies(category, topic);
        if (pool.isEmpty()) {
            // Fallback to all families if specific pool is empty
            pool = registry.getAllFamilies();
        }

        for (int step = 0; step < length; step++) {
            List<Candidate> candidates = new ArrayList<>();
            // Generate 30 candidate variants for selection position
            for (int i = 0; i < 30; i++) {
                AptitudeQuestionFamily fam = pool.get(random.nextInt(pool.size()));
                String difficulty = "Medium";
                if (weakTopics != null && weakTopics.contains(fam.topic())) {
                    difficulty = "Easy"; // ease difficulty for weak topics
                }

                Question q = fam.generate(random, difficulty);
                Map<String, Object> qMap = q.toMap();
                String fp = AptitudeController.generateFingerprint(qMap);

                if (sessionFingerprints.contains(fp)) {
                    continue; // Strict level-1 duplicate prevention
                }

                double score = scoreCandidate(fam, fp, mode, sessionFamilyIds, recentConcepts, historicalSeenFamilies, weakTopics);
                candidates.add(new Candidate(q, fam, fp, score));
            }

            if (candidates.isEmpty()) {
                // Fallback: relax spacing and allow previously used families
                for (AptitudeQuestionFamily fam : pool) {
                    Question q = fam.generate(random, "Medium");
                    Map<String, Object> qMap = q.toMap();
                    String fp = AptitudeController.generateFingerprint(qMap);
                    if (!sessionFingerprints.contains(fp)) {
                        candidates.add(new Candidate(q, fam, fp, 1.0));
                    }
                }
            }

            if (candidates.isEmpty()) {
                break; // Pool fully exhausted
            }

            // Top-K selection (K = 3)
            candidates.sort((c1, c2) -> Double.compare(c2.score, c1.score));
            int k = Math.min(3, candidates.size());
            Candidate chosen = candidates.get(random.nextInt(k));

            selected.add(chosen.question);
            sessionFingerprints.add(chosen.fingerprint);
            sessionFamilyIds.add(chosen.family.familyId());

            recentConcepts.addLast(chosen.family.conceptGroup());
            if (recentConcepts.size() > 2) {
                recentConcepts.removeFirst();
            }
        }

        return selected;
    }

    private double scoreCandidate(
            AptitudeQuestionFamily family,
            String fingerprint,
            String mode,
            Set<String> sessionFamilyIds,
            Deque<String> recentConcepts,
            Map<String, Integer> historicalSeen,
            List<String> weakTopics
    ) {
        double score = 100.0;

        // Level-2 uniqueness: Unseen family bonus
        if (!sessionFamilyIds.contains(family.familyId())) {
            score += 150.0;
        } else {
            score -= 200.0; // severe penalty inside session
        }

        // Level-3 concept diversity spacing
        if (recentConcepts.contains(family.conceptGroup())) {
            score -= 100.0;
        }

        // Weak topic relevance
        if ("weak".equals(mode) && weakTopics != null && weakTopics.contains(family.topic())) {
            score += 200.0;
        }

        // Historical exposure soft penalty
        if (historicalSeen != null && historicalSeen.containsKey(family.familyId())) {
            score -= Math.min(50.0, historicalSeen.get(family.familyId()) * 10.0);
        }

        return score;
    }

    private List<AptitudeQuestionFamily> getEligibleFamilies(String category, String topic) {
        if (topic != null && !"any".equalsIgnoreCase(topic)) {
            return registry.getFamiliesByTopic(topic);
        }
        if (category != null && !"any".equalsIgnoreCase(category)) {
            return registry.getFamiliesByCategory(category);
        }
        return registry.getAllFamilies();
    }

    private static class Candidate {
        final Question question;
        final AptitudeQuestionFamily family;
        final String fingerprint;
        final double score;

        Candidate(Question question, AptitudeQuestionFamily family, String fingerprint, double score) {
            this.question = question;
            this.family = family;
            this.fingerprint = fingerprint;
            this.score = score;
        }
    }
}
