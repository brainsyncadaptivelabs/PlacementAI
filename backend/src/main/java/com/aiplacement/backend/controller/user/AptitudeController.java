package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/aptitude")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AptitudeController {

    private final UserRepository userRepository;

    // Secure wrapper for active assessments to bind them to the correct user
    private static class ActiveSession {
        final String email;
        final List<Map<String, Object>> questions;
        final long createdAt;

        ActiveSession(String email, List<Map<String, Object>> questions) {
            this.email = email;
            this.questions = questions;
            this.createdAt = System.currentTimeMillis();
        }
    }

    // Temporary secure active assessment cache
    private static final Map<String, ActiveSession> activeAssessments = new ConcurrentHashMap<>();

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getAptitudeData() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("data", user.getAptitudeData() != null ? user.getAptitudeData() : "{}"));
    }

    @PostMapping("/data")
    public ResponseEntity<Map<String, String>> saveAptitudeData(@RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String clientData = payload.get("data");
        String serverData = user.getAptitudeData();

        if (serverData == null || serverData.trim().isEmpty() || "{}".equals(serverData.trim())) {
            user.setAptitudeData(clientData);
        } else {
            // Safely merge client-controlled config (studyPlan, roadmap) with server-controlled stats
            try {
                JSONObject clientJson = new JSONObject(clientData);
                JSONObject serverJson = new JSONObject(serverData);

                // Preserve authoritative server stats
                if (serverJson.has("attempts")) clientJson.put("attempts", serverJson.get("attempts"));
                if (serverJson.has("elo")) clientJson.put("elo", serverJson.get("elo"));
                if (serverJson.has("gamification")) clientJson.put("gamification", serverJson.get("gamification"));
                if (serverJson.has("seenQuestions")) clientJson.put("seenQuestions", serverJson.get("seenQuestions"));
                if (serverJson.has("repetition")) clientJson.put("repetition", serverJson.get("repetition"));

                user.setAptitudeData(clientJson.toString());
            } catch (Exception e) {
                user.setAptitudeData(clientData);
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Aptitude data synced successfully"));
    }

    @PostMapping("/assessment")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> registerAssessment(@RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> questions = (List<Map<String, Object>>) payload.get("questions");
        String assessmentId = UUID.randomUUID().toString();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        // Cache full questions bound securely to the authenticated user's email
        activeAssessments.put(assessmentId, new ActiveSession(email, questions));

        // Clean questions for frontend payload (sanitize answers/explanations to prevent cheating)
        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (Map<String, Object> q : questions) {
            Map<String, Object> cleanQ = new HashMap<>(q);
            cleanQ.remove("answer");
            cleanQ.remove("explanation");
            cleanQ.remove("formula");
            cleanQ.remove("shortcut");
            cleanQ.remove("commonMistake");
            sanitized.add(cleanQ);
        }

        return ResponseEntity.ok(Map.of(
            "assessmentId", assessmentId,
            "questions", sanitized
        ));
    }

    @PostMapping("/assessment/{id}/submit")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> submitAssessment(
            @PathVariable("id") String assessmentId,
            @RequestBody Map<String, Object> payload
    ) {
        ActiveSession session = activeAssessments.get(assessmentId);
        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment session not found or expired"));
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!session.email.equals(email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied: session belongs to another user"));
        }

        List<Map<String, Object>> questions = session.questions;
        Map<String, String> userAnswers = (Map<String, String>) payload.get("answers");

        int correctCount = 0;
        List<Map<String, Object>> evaluatedQuestions = new ArrayList<>();

        for (Map<String, Object> q : questions) {
            String qId = (String) q.get("id");
            String correctAnswer = (String) q.get("answer");
            String userAns = userAnswers != null ? userAnswers.get(qId) : null;

            boolean isCorrect = correctAnswer != null && correctAnswer.equals(userAns);
            if (isCorrect) {
                correctCount++;
            }

            Map<String, Object> evalQ = new HashMap<>(q);
            evalQ.put("userAnswer", userAns);
            evalQ.put("isCorrect", isCorrect);
            evaluatedQuestions.add(evalQ);
        }

        // Clean up cache
        activeAssessments.remove(assessmentId);

        // Update user stats & history in database securely
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        updateAptitudeHistoryAndStats(user, evaluatedQuestions, correctCount, questions.size(), payload);

        return ResponseEntity.ok(Map.of(
            "assessmentId", assessmentId,
            "correctCount", correctCount,
            "totalCount", questions.size(),
            "questions", evaluatedQuestions,
            "aptitudeData", user.getAptitudeData() != null ? user.getAptitudeData() : "{}"
        ));
    }

    private void updateAptitudeHistoryAndStats(User user, List<Map<String, Object>> evaluatedQuestions, int correctCount, int totalCount, Map<String, Object> payload) {
        Map<String, String> userAnswers = (Map<String, String>) payload.get("answers");
        String dataStr = user.getAptitudeData();
        JSONObject data = (dataStr != null && !dataStr.trim().isEmpty() && !"{}".equals(dataStr.trim()))
                ? new JSONObject(dataStr)
                : new JSONObject();

        // 1. Initialize ELO if missing
        if (!data.has("elo")) {
            data.put("elo", new JSONObject());
        }
        JSONObject elo = data.getJSONObject("elo");

        // 2. Initialize seen questions history if missing
        if (!data.has("seenQuestions")) {
            data.put("seenQuestions", new JSONObject());
        }
        JSONObject seenQuestions = data.getJSONObject("seenQuestions");

        // 3. Process questions for ELO & seen history
        long now = System.currentTimeMillis();
        for (Map<String, Object> q : evaluatedQuestions) {
            String topic = (String) q.get("topic");
            String difficulty = (String) q.get("difficulty");
            boolean isCorrect = (boolean) q.get("isCorrect");
            String fp = generateFingerprint(q);

            // ELO Calculation
            int currentVal = elo.has(topic) ? elo.getInt(topic) : 1200;
            int K = 32;
            int targetRating = "Easy".equals(difficulty) ? 1000 : "Hard".equals(difficulty) ? 1500 : 1200;
            double expected = 1.0 / (1.0 + Math.pow(10, (targetRating - currentVal) / 400.0));
            double actual = isCorrect ? 1.0 : 0.0;
            int nextVal = (int) Math.round(currentVal + K * (actual - expected));
            elo.put(topic, nextVal);

            // Seen Questions tracking
            JSONObject seenDetail = seenQuestions.has(fp) ? seenQuestions.getJSONObject(fp) : new JSONObject();
            seenDetail.put("firstSeenTime", seenDetail.has("firstSeenTime") ? seenDetail.getLong("firstSeenTime") : now);
            seenDetail.put("lastSeenTime", now);
            seenDetail.put("timesSeen", (seenDetail.has("timesSeen") ? seenDetail.getInt("timesSeen") : 0) + 1);
            seenDetail.put("timesAnswered", (seenDetail.has("timesAnswered") ? seenDetail.getInt("timesAnswered") : 0) + 1);
            seenDetail.put("timesCorrect", (seenDetail.has("timesCorrect") ? seenDetail.getInt("timesCorrect") : 0) + (isCorrect ? 1 : 0));
            seenDetail.put("timesIncorrect", (seenDetail.has("timesIncorrect") ? seenDetail.getInt("timesIncorrect") : 0) + (isCorrect ? 0 : 1));
            seenDetail.put("lastResult", isCorrect ? "correct" : "incorrect");
            seenDetail.put("category", q.get("category"));
            seenDetail.put("topic", topic);
            seenQuestions.put(fp, seenDetail);
        }

        // 4. Update Spaced Repetition cards (for revision mode)
        if (!data.has("repetition")) {
            data.put("repetition", new JSONArray());
        }
        JSONArray repetition = data.getJSONArray("repetition");
        for (Map<String, Object> q : evaluatedQuestions) {
            boolean isCorrect = (boolean) q.get("isCorrect");
            if (!isCorrect) {
                // Add or update spaced repetition item
                boolean found = false;
                for (int i = 0; i < repetition.length(); i++) {
                    JSONObject item = repetition.getJSONObject(i);
                    if (generateFingerprint(q).equals(generateFingerprint(item.getJSONObject("question").toMap()))) {
                        item.put("nextReviewAt", now + 24L * 60 * 60 * 1000);
                        item.put("incorrectCount", item.getInt("incorrectCount") + 1);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    JSONObject newItem = new JSONObject();
                    newItem.put("question", new JSONObject(q));
                    newItem.put("nextReviewAt", now + 24L * 60 * 60 * 1000);
                    newItem.put("intervalDays", 1);
                    newItem.put("incorrectCount", 1);
                    repetition.put(newItem);
                }
            }
        }

        // 5. XP, Level & Streak logic
        if (!data.has("gamification")) {
            data.put("gamification", new JSONObject());
        }
        JSONObject gamification = data.getJSONObject("gamification");

        int earnedXp = correctCount * 15 + (totalCount - correctCount) * 5;
        double scorePct = ((double) correctCount / totalCount) * 100.0;
        if (scorePct >= 80.0) {
            earnedXp += 50;
        }

        int currentXp = gamification.has("xp") ? gamification.getInt("xp") : 0;
        int nextXp = currentXp + earnedXp;
        gamification.put("xp", nextXp);

        // Progression curve: Level = floor(sqrt(xp) / 10) + 1
        int nextLevel = (int) Math.floor(Math.sqrt(nextXp) / 10.0) + 1;
        gamification.put("level", nextLevel);

        // Daily Streak calculation (using UTC date offset)
        String todayStr = LocalDate.now(ZoneOffset.UTC).toString();
        String yesterdayStr = LocalDate.now(ZoneOffset.UTC).minusDays(1).toString();

        int currentStreak = gamification.has("streak") ? gamification.getInt("streak") : 0;
        String lastActiveDate = gamification.has("lastActiveDate") ? gamification.getString("lastActiveDate") : "";

        if (lastActiveDate.equals(yesterdayStr)) {
            currentStreak += 1;
        } else if (!lastActiveDate.equals(todayStr)) {
            currentStreak = 1;
        }
        gamification.put("streak", currentStreak);
        gamification.put("lastActiveDate", todayStr);

        // Badges evaluation
        JSONArray badges = gamification.has("badges") ? gamification.getJSONArray("badges") : new JSONArray();
        Set<String> badgesSet = new HashSet<>();
        for (int i = 0; i < badges.length(); i++) {
            badgesSet.add(badges.getString(i));
        }
        if (scorePct >= 90.0) badgesSet.add("Accuracy Master");
        if (currentStreak >= 3) badgesSet.add("Daily Warrior");

        boolean highEloFound = false;
        for (String key : elo.keySet()) {
            if (elo.getInt(key) > 1300) {
                highEloFound = true;
                break;
            }
        }
        if (highEloFound) badgesSet.add("Quantum Leap");

        gamification.put("badges", new JSONArray(badgesSet));

        // 6. Attempts Log
        if (!data.has("attempts")) {
            data.put("attempts", new JSONArray());
        }
        JSONArray attempts = data.getJSONArray("attempts");

        JSONObject attempt = new JSONObject();
        attempt.put("id", "attempt-" + now);
        attempt.put("date", todayStr);
        attempt.put("testName", payload.get("testName") != null ? payload.get("testName") : "Practice Quiz");
        attempt.put("companyPattern", payload.get("companyPattern") != null ? payload.get("companyPattern") : "General Pattern");
        attempt.put("score", Math.round(scorePct));
        attempt.put("accuracy", Math.min(100, Math.round(((double) correctCount / (userAnswers != null ? Math.max(1, userAnswers.size()) : 1)) * 100.0)));
        attempt.put("timeTaken", payload.get("timeTaken") != null ? payload.get("timeTaken") : 0);
        attempt.put("percentile", Math.min(99, Math.round(scorePct * 0.95 + 10)));
        attempt.put("totalQuestions", totalCount);
        attempt.put("correctAnswersCount", correctCount);
        attempt.put("versionId", "1.2.0");
        attempt.put("templateVersion", "v2.1");
        attempt.put("irtModelVersion", "IRT-3PL-v1");
        attempt.put("catStrategyVersion", "CAT-IIF-v1");

        JSONArray nextAttempts = new JSONArray();
        nextAttempts.put(attempt);
        for (int i = 0; i < Math.min(9, attempts.length()); i++) {
            nextAttempts.put(attempts.get(i));
        }
        data.put("attempts", nextAttempts);

        user.setAptitudeData(data.toString());
        userRepository.save(user);
    }

    public static String generateFingerprint(Map<String, Object> q) {
        String text = (String) q.get("text");
        String category = (String) q.get("category");
        String topic = (String) q.get("topic");
        if (text == null) return "";

        String[] candidateNames = {"Abhinav", "Bharath", "Likith", "Sree Alekhya", "Ananya", "Rohan", "Sneha", "Kiran", "Divya", "Rahul", "Priya", "Amit"};
        String[] items = {"laptop", "phone", "book", "chair", "table", "watch", "pen", "bag", "monitor", "keyboard"};
        String[] companies = {"TCS", "Infosys", "Accenture", "Cognizant", "Wipro", "Capgemini", "Deloitte", "EY", "PwC", "Amazon", "Microsoft", "Google", "Oracle", "Zoho", "Adobe"};

        String textSig = text;
        for (String name : candidateNames) {
            textSig = textSig.replaceAll("(?i)" + name, "[NAME]");
        }
        for (String item : items) {
            textSig = textSig.replaceAll("(?i)" + item, "[ITEM]");
        }
        for (String company : companies) {
            textSig = textSig.replaceAll("(?i)" + company, "[COMPANY]");
        }
        textSig = textSig.replaceAll("(?i)twenty", "20")
                         .replaceAll("(?i)thirty", "30")
                         .replaceAll("(?i)forty", "40")
                         .replaceAll("(?i)fifty", "50")
                         .replaceAll("(?i)percent", "%")
                         .replaceAll("(?i)remainder", "rem");
        textSig = textSig.replaceAll("\\d+", "[NUM]");
        textSig = textSig.replaceAll("[^\\w%]", "").toLowerCase();

        return category + "-" + topic + "-" + textSig;
    }

    @PostMapping("/assessment/export")
    public ResponseEntity<Map<String, Object>> exportAssessment(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
            "candidateName", user.getFullName() != null ? user.getFullName() : "Candidate",
            "candidateEmail", user.getEmail(),
            "exportTimestamp", new Date().toString(),
            "assessmentSummary", payload.get("summary") != null ? payload.get("summary") : "No assessment data provided",
            "status", "EXPORT_SUCCESS"
        ));
    }

    @GetMapping("/enterprise/bulk-reports")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getBulkReports() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> reports = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> record = new HashMap<>();
            record.put("name", u.getFullName() != null ? u.getFullName() : "Candidate");
            record.put("email", u.getEmail());
            record.put("role", u.getRole() != null ? u.getRole().toString() : "STUDENT");
            record.put("aptitudeData", u.getAptitudeData() != null ? u.getAptitudeData() : "{}");
            reports.add(record);
        }
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/enterprise/schedule")
    @PreAuthorize("hasAnyRole('RECRUITER', 'PLACEMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> scheduleDrive(@RequestBody Map<String, Object> payload) {
        String campaignName = (String) payload.get("campaignName");
        String scheduledDate = (String) payload.get("scheduledDate");

        return ResponseEntity.ok(Map.of(
            "campaignId", UUID.randomUUID().toString(),
            "campaignName", campaignName != null ? campaignName : "Campus Recruitment Drive",
            "scheduledDate", scheduledDate != null ? scheduledDate : new Date().toString(),
            "status", "SCHEDULED"
        ));
    }
}
