package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class AptitudeFingerprintService {

    public String generateFingerprint(String familyId, Map<String, Object> parameters, String target) {
        StringBuilder sb = new StringBuilder();
        sb.append(familyId).append("|");

        // Sort keys deterministically
        List<String> keys = new ArrayList<>(parameters.keySet());
        Collections.sort(keys);

        for (String key : keys) {
            Object val = parameters.get(key);
            sb.append(key).append("=").append(val != null ? val.toString().trim() : "null").append("|");
        }
        sb.append("target=").append(target != null ? target.trim() : "null");

        return hashString(sb.toString());
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 hashing failed", e);
        }
    }
}
