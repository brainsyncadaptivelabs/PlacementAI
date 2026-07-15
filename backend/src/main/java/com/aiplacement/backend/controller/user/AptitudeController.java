package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.placementintelligence.aptitude.*;
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

@RestController
@RequestMapping("/api/v1/aptitude")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AptitudeController {

    private final UserRepository userRepository;
    private final AptitudeSessionService sessionService;
    private final AptitudeCatEngine catEngine;

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getAptitudeData() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String data = user.getAptitudeData() != null ? user.getAptitudeData() : "{}";
        return ResponseEntity.ok(Map.of("data", data));
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
            try {
                JSONObject clientJson = new JSONObject(clientData);
                JSONObject serverJson = new JSONObject(serverData);

                // Preserve server-computed metrics
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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int length = payload.get("length") != null ? (int) payload.get("length") : 15;
        String category = (String) payload.get("category");
        String topic = (String) payload.get("topic");
        String company = payload.get("company") != null ? (String) payload.get("company") : "General Pattern";
        String mode = payload.get("mode") != null ? (String) payload.get("mode") : "practice";
        List<String> excluded = payload.get("excluded") != null ? (List<String>) payload.get("excluded") : new ArrayList<>();

        List<Question> questions = new ArrayList<>();
        String assessmentId = UUID.randomUUID().toString();

        JSONObject userProfile = getUserAptitudeJson(user);

        // Load due questions for Spaced Repetition / Revision mode
        if ("revision".equals(mode)) {
            JSONArray repetition = userProfile.optJSONArray("repetition");
            if (repetition != null) {
                for (int i = 0; i < Math.min(length, repetition.length()); i++) {
                    JSONObject item = repetition.getJSONObject(i);
                    JSONObject qObj = item.getJSONObject("question");

                    questions.add(Question.builder()
                        .id(qObj.getString("id"))
                        .category(qObj.getString("category"))
                        .topic(qObj.getString("topic"))
                        .text(qObj.getString("text"))
                        .options(convertJsonArray(qObj.getJSONArray("options")))
                        .answer(qObj.getString("answer"))
                        .difficulty(qObj.getString("difficulty"))
                        .timeLimit(qObj.getInt("timeLimit"))
                        .explanation(qObj.optString("explanation"))
                        .formula(qObj.optString("formula"))
                        .companyLevel(qObj.optString("companyLevel"))
                        .build());
                }
            }
        } else if ("adaptive".equals(mode)) {
            // Adaptive Assessment: derive theta and pick initial question
            double theta = deriveUserTheta(userProfile);

            // Build pool of 35 candidates
            List<Question> pool = new ArrayList<>();
            for (int i = 0; i < 35; i++) {
                pool.add(AptitudeQuestionEngine.generateQuestion(category, topic, company, null));
            }

            Map<String, Integer> exposureRegistry = new HashMap<>();
            Question firstQ = catEngine.selectCATQuestion(pool, theta, exposureRegistry);
            if (firstQ != null) {
                questions.add(firstQ);
            }
        } else {
            // Practice / Timed / Weak Topic modes
            Set<String> localFps = new HashSet<>();
            int budget = 80;
            while (questions.size() < length && budget > 0) {
                budget--;
                String targetTopic = topic;
                if ("weak".equals(mode)) {
                    targetTopic = getWeakestTopic(userProfile);
                }
                Question q = AptitudeQuestionEngine.generateQuestion(category, targetTopic, company, null);
                String fp = generateFingerprint(q.toMap());
                if (!localFps.contains(fp) && !excluded.contains(fp)) {
                    questions.add(q);
                    localFps.add(fp);
                }
            }
        }

        // Cache session securely in Redis (or ConcurrentHashMap fallback)
        double initialTheta = deriveUserTheta(userProfile);
        sessionService.saveSession(assessmentId, email, questions, initialTheta, mode);

        // Map to sanitized output DTO for client
        List<Map<String, Object>> sanitized = new ArrayList<>();
        for (Question q : questions) {
            sanitized.add(q.toSanitizedMap());
        }

        return ResponseEntity.ok(Map.of(
            "assessmentId", assessmentId,
            "questions", sanitized
        ));
    }

    @PostMapping("/assessment/{id}/next")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> getNextAdaptiveQuestion(
            @PathVariable("id") String assessmentId,
            @RequestBody Map<String, Object> payload
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> session = sessionService.getSession(assessmentId, email);

        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment session not found or expired"));
        }

        String lastQuestionId = (String) payload.get("lastQuestionId");
        String selectedOption = (String) payload.get("selectedOption");

        List<Map<String, Object>> qMaps = (List<Map<String, Object>>) session.get("questions");
        double theta = ((Number) session.get("theta")).doubleValue();

        // Evaluate the last question
        Map<String, Object> lastQ = null;
        for (Map<String, Object> q : qMaps) {
            if (q.get("id").equals(lastQuestionId)) {
                lastQ = q;
                break;
            }
        }

        if (lastQ != null) {
            boolean isCorrect = lastQ.get("answer").equals(selectedOption);

            // Build Question model to update theta
            Question q = Question.builder()
                .a(((Number) lastQ.getOrDefault("a", 1.2)).doubleValue())
                .b(((Number) lastQ.getOrDefault("b", 0.0)).doubleValue())
                .c(((Number) lastQ.getOrDefault("c", 0.25)).doubleValue())
                .build();

            theta = catEngine.updateTheta(theta, q, isCorrect);
        }

        // Generate a new candidate pool
        List<Question> pool = new ArrayList<>();
        for (int i = 0; i < 35; i++) {
            pool.add(AptitudeQuestionEngine.generateQuestion("any", "any", "General Pattern", null));
        }

        Map<String, Integer> exposureRegistry = new HashMap<>();
        Question nextQ = catEngine.selectCATQuestion(pool, theta, exposureRegistry);

        if (nextQ != null) {
            qMaps.add(nextQ.toMap());
            session.put("questions", qMaps);
            session.put("theta", theta);

            // Save updated session state
            sessionService.saveSession(assessmentId, email, convertMapsToQuestions(qMaps), theta, (String) session.get("mode"));

            return ResponseEntity.ok(nextQ.toSanitizedMap());
        }

        return ResponseEntity.badRequest().body(Map.of("error", "No available questions in pool"));
    }

    private List<Question> convertMapsToQuestions(List<Map<String, Object>> maps) {
        List<Question> list = new ArrayList<>();
        for (Map<String, Object> map : maps) {
            list.add(Question.builder()
                .id((String) map.get("id"))
                .category((String) map.get("category"))
                .topic((String) map.get("topic"))
                .text((String) map.get("text"))
                .options((List<String>) map.get("options"))
                .answer((String) map.get("answer"))
                .difficulty((String) map.get("difficulty"))
                .timeLimit((Integer) map.get("timeLimit"))
                .explanation((String) map.get("explanation"))
                .formula((String) map.get("formula"))
                .companyLevel((String) map.get("companyLevel"))
                .a(((Number) map.getOrDefault("a", 1.2)).doubleValue())
                .b(((Number) map.getOrDefault("b", 0.0)).doubleValue())
                .c(((Number) map.getOrDefault("c", 0.25)).doubleValue())
                .build());
        }
        return list;
    }

    @PostMapping("/assessment/{id}/submit")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> submitAssessment(
            @PathVariable("id") String assessmentId,
            @RequestBody Map<String, Object> payload
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> session = sessionService.getSession(assessmentId, email);

        if (session == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment session not found or expired"));
        }

        // Enforce idempotency
        if (Boolean.TRUE.equals(session.get("submitted"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment has already been submitted"));
        }

        sessionService.markSubmitted(assessmentId, email);

        List<Map<String, Object>> qMaps = (List<Map<String, Object>>) session.get("questions");
        Map<String, String> userAnswers = (Map<String, String>) payload.get("answers");

        int correctCount = 0;
        List<Map<String, Object>> evaluatedQuestions = new ArrayList<>();

        for (Map<String, Object> q : qMaps) {
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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        updateAptitudeHistoryAndStats(user, evaluatedQuestions, correctCount, qMaps.size(), payload);

        return ResponseEntity.ok(Map.of(
            "assessmentId", assessmentId,
            "correctCount", correctCount,
            "totalCount", qMaps.size(),
            "questions", evaluatedQuestions,
            "aptitudeData", user.getAptitudeData() != null ? user.getAptitudeData() : "{}"
        ));
    }

    private JSONObject getUserAptitudeJson(User user) {
        String dataStr = user.getAptitudeData();
        return (dataStr != null && !dataStr.trim().isEmpty() && !"{}".equals(dataStr.trim()))
                ? new JSONObject(dataStr)
                : new JSONObject();
    }

    private List<String> convertJsonArray(JSONArray array) {
        List<String> list = new ArrayList<>();
        for (int i = 0; i < array.length(); i++) {
            list.add(array.getString(i));
        }
        return list;
    }

    private double deriveUserTheta(JSONObject profile) {
        JSONObject elo = profile.optJSONObject("elo");
        if (elo == null || elo.length() == 0) return 0.0;
        double sum = 0.0;
        int count = 0;
        Iterator<String> keys = elo.keys();
        while (keys.hasNext()) {
            String k = keys.next();
            sum += elo.getInt(k);
            count++;
        }
        return count > 0 ? (sum / count - 1200.0) / 200.0 : 0.0;
    }

    private String getWeakestTopic(JSONObject profile) {
        JSONObject elo = profile.optJSONObject("elo");
        if (elo == null || elo.length() == 0) return "Percentage";
        String weakest = "Percentage";
        int min = Integer.MAX_VALUE;
        Iterator<String> keys = elo.keys();
        while (keys.hasNext()) {
            String k = keys.next();
            int val = elo.getInt(k);
            if (val < min) {
                min = val;
                weakest = k;
            }
        }
        return weakest;
    }

    private void updateAptitudeHistoryAndStats(User user, List<Map<String, Object>> evaluatedQuestions, int correctCount, int totalCount, Map<String, Object> payload) {
        JSONObject data = getUserAptitudeJson(user);

        // 1. Initialize ELO
        if (!data.has("elo")) {
            data.put("elo", new JSONObject());
        }
        JSONObject elo = data.getJSONObject("elo");

        // 2. Initialize seen questions history
        if (!data.has("seenQuestions")) {
            data.put("seenQuestions", new JSONObject());
        }
        JSONObject seenQuestions = data.getJSONObject("seenQuestions");

        long now = System.currentTimeMillis();
        for (Map<String, Object> q : evaluatedQuestions) {
            String topic = (String) q.get("topic");
            String difficulty = (String) q.get("difficulty");
            boolean isCorrect = (boolean) q.get("isCorrect");
            String fp = generateFingerprint(q);

            int currentVal = elo.has(topic) ? elo.getInt(topic) : 1200;
            int K = 32;
            int targetRating = "Easy".equals(difficulty) ? 1000 : "Hard".equals(difficulty) ? 1500 : 1200;
            double expected = 1.0 / (1.0 + Math.pow(10, (targetRating - currentVal) / 400.0));
            double actual = isCorrect ? 1.0 : 0.0;
            int nextVal = (int) Math.round(currentVal + K * (actual - expected));
            elo.put(topic, nextVal);

            JSONObject seenDetail = seenQuestions.has(fp) ? seenQuestions.getJSONObject(fp) : new JSONObject();
            seenDetail.put("firstSeenTime", seenDetail.optLong("firstSeenTime", now));
            seenDetail.put("lastSeenTime", now);
            seenDetail.put("timesSeen", seenDetail.optInt("timesSeen", 0) + 1);
            seenDetail.put("timesAnswered", seenDetail.optInt("timesAnswered", 0) + 1);
            seenDetail.put("timesCorrect", seenDetail.optInt("timesCorrect", 0) + (isCorrect ? 1 : 0));
            seenDetail.put("timesIncorrect", seenDetail.optInt("timesIncorrect", 0) + (isCorrect ? 0 : 1));
            seenDetail.put("lastResult", isCorrect ? "correct" : "incorrect");
            seenDetail.put("category", q.get("category"));
            seenDetail.put("topic", topic);
            seenQuestions.put(fp, seenDetail);
        }

        // 3. Spaced Repetition / Spaced Review updates
        if (!data.has("repetition")) {
            data.put("repetition", new JSONArray());
        }
        JSONArray repetition = data.getJSONArray("repetition");
        for (Map<String, Object> q : evaluatedQuestions) {
            boolean isCorrect = (boolean) q.get("isCorrect");
            if (!isCorrect) {
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

        // 4. XP and Level
        if (!data.has("gamification")) {
            data.put("gamification", new JSONObject());
        }
        JSONObject gamification = data.getJSONObject("gamification");

        int earnedXp = correctCount * 15 + (totalCount - correctCount) * 5;
        double scorePct = ((double) correctCount / totalCount) * 100.0;
        if (scorePct >= 80.0) {
            earnedXp += 50;
        }

        int currentXp = gamification.optInt("xp", 0);
        int nextXp = currentXp + earnedXp;
        gamification.put("xp", nextXp);

        int nextLevel = (int) Math.floor(Math.sqrt(nextXp) / 10.0) + 1;
        gamification.put("level", nextLevel);

        // Daily Streaks (UTC offset)
        String todayStr = LocalDate.now(ZoneOffset.UTC).toString();
        String yesterdayStr = LocalDate.now(ZoneOffset.UTC).minusDays(1).toString();

        int currentStreak = gamification.optInt("streak", 0);
        String lastActiveDate = gamification.optString("lastActiveDate", "");

        if (lastActiveDate.equals(yesterdayStr)) {
            currentStreak += 1;
        } else if (!lastActiveDate.equals(todayStr)) {
            currentStreak = 1;
        }
        gamification.put("streak", currentStreak);
        gamification.put("lastActiveDate", todayStr);

        // Badges updates
        JSONArray badges = gamification.optJSONArray("badges");
        Set<String> badgesSet = new HashSet<>();
        if (badges != null) {
            for (int i = 0; i < badges.length(); i++) {
                badgesSet.add(badges.getString(i));
            }
        }
        if (scorePct >= 90.0) badgesSet.add("Accuracy Master");
        if (currentStreak >= 3) badgesSet.add("Daily Warrior");

        boolean highEloFound = false;
        Iterator<String> eloKeys = elo.keys();
        while (eloKeys.hasNext()) {
            String key = eloKeys.next();
            if (elo.getInt(key) > 1300) {
                highEloFound = true;
                break;
            }
        }
        if (highEloFound) badgesSet.add("Quantum Leap");
        gamification.put("badges", new JSONArray(badgesSet));

        // 5. Attempts list
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
        attempt.put("accuracy", Math.min(100, Math.round(((double) correctCount / (userAnswers() != null ? Math.max(1, userAnswers().size()) : 1)) * 100.0)));
        attempt.put("timeTaken", payload.get("timeTaken") != null ? payload.get("timeTaken") : 0);
        attempt.put("percentile", Math.min(99, Math.round(scorePct * 0.95 + 10)));
        attempt.put("totalQuestions", totalCount);
        attempt.put("correctAnswersCount", correctCount);

        JSONArray nextAttempts = new JSONArray();
        nextAttempts.put(attempt);
        for (int i = 0; i < Math.min(9, attempts.length()); i++) {
            nextAttempts.put(attempts.get(i));
        }
        data.put("attempts", nextAttempts);

        user.setAptitudeData(data.toString());
        userRepository.save(user);
    }

    private Map<String, String> userAnswers() {
        return Collections.emptyMap();
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
