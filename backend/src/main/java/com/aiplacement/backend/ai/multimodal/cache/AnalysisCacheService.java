package com.aiplacement.backend.ai.multimodal.cache;

import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AnalysisCacheService {
    private final Map<String, CachedAnalysis> cache = new ConcurrentHashMap<>();

    public AnalysisResult get(String checksum, String analyzerName) {
        String cacheKey = buildKey(checksum, analyzerName);
        CachedAnalysis cached = cache.get(cacheKey);
        if (cached != null) {
            return cached.getResult();
        }
        return null;
    }

    public void put(String checksum, String analyzerName, AnalysisResult result) {
        String cacheKey = buildKey(checksum, analyzerName);
        CachedAnalysis cached = new CachedAnalysis(
            cacheKey,
            checksum,
            analyzerName,
            System.currentTimeMillis(),
            result
        );
        cache.put(cacheKey, cached);
    }

    public void clear() {
        cache.clear();
    }

    private String buildKey(String checksum, String analyzerName) {
        return checksum + ":" + analyzerName;
    }
}
