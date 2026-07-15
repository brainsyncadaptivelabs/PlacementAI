package com.aiplacement.backend.placementintelligence.aptitude;

import java.util.Set;

public interface AptitudeQuestionFamily {
    String familyId();
    String category();
    String topic();
    String conceptGroup();
    Set<String> supportedDifficulties();
    Question generate(java.util.Random random, String difficulty);
}
