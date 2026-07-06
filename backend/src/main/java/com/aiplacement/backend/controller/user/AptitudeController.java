package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/aptitude")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AptitudeController {

    private final UserRepository userRepository;

    // Temporary secure active assessment cache
    private static final Map<String, List<Map<String, Object>>> activeAssessments = new ConcurrentHashMap<>();

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
        String data = payload.get("data");
        user.setAptitudeData(data);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Aptitude data synced successfully"));
    }

    @PostMapping("/assessment")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> registerAssessment(@RequestBody Map<String, Object> payload) {
        List<Map<String, Object>> questions = (List<Map<String, Object>>) payload.get("questions");
        String assessmentId = UUID.randomUUID().toString();
        
        // Cache full questions (with answers) on the backend
        activeAssessments.put(assessmentId, questions);
        
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
        List<Map<String, Object>> questions = activeAssessments.get(assessmentId);
        if (questions == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Assessment session not found or expired"));
        }
        
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
        
        // Cleanup cache
        activeAssessments.remove(assessmentId);
        
        return ResponseEntity.ok(Map.of(
            "assessmentId", assessmentId,
            "correctCount", correctCount,
            "totalCount", questions.size(),
            "questions", evaluatedQuestions
        ));
    }

    @PostMapping("/assessment/export")
    public ResponseEntity<Map<String, Object>> exportAssessment(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Mock export structure containing complete candidate psychometrics details
        return ResponseEntity.ok(Map.of(
            "candidateName", user.getFullName() != null ? user.getFullName() : "Candidate",
            "candidateEmail", user.getEmail(),
            "exportTimestamp", new Date().toString(),
            "assessmentSummary", payload.get("summary") != null ? payload.get("summary") : "No assessment data provided",
            "status", "EXPORT_SUCCESS"
        ));
    }

    @GetMapping("/enterprise/bulk-reports")
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
