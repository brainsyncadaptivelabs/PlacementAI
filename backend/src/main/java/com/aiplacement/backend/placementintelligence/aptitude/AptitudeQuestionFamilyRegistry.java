package com.aiplacement.backend.placementintelligence.aptitude;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class AptitudeQuestionFamilyRegistry {

    private final List<AptitudeQuestionFamily> families;
    private final Map<String, AptitudeQuestionFamily> familyMap = new HashMap<>();

    public AptitudeQuestionFamilyRegistry(List<AptitudeQuestionFamily> families) {
        this.families = new ArrayList<>(families);
        this.families.addAll(AptitudeDynamicFamilyProvider.buildAllDynamicFamilies());
        validateAndRegister();
    }

    private void validateAndRegister() {
        for (AptitudeQuestionFamily family : families) {
            String id = family.familyId();
            if (id == null || id.trim().isEmpty()) {
                throw new IllegalStateException("Startup Validation Failed: Family ID cannot be blank.");
            }
            if (family.category() == null || family.topic() == null || family.conceptGroup() == null) {
                throw new IllegalStateException("Startup Validation Failed: Category, Topic, and ConceptGroup must not be null for family: " + id);
            }
            if (family.supportedDifficulties() == null || family.supportedDifficulties().isEmpty()) {
                throw new IllegalStateException("Startup Validation Failed: Supported difficulties must not be empty for family: " + id);
            }
            if (familyMap.containsKey(id)) {
                throw new IllegalStateException("Startup Validation Failed: Duplicate Family ID detected: " + id);
            }
            familyMap.put(id, family);
        }
    }

    public List<AptitudeQuestionFamily> getAllFamilies() {
        return new ArrayList<>(families);
    }

    public List<AptitudeQuestionFamily> getFamiliesByCategory(String category) {
        List<AptitudeQuestionFamily> list = new ArrayList<>();
        for (AptitudeQuestionFamily f : families) {
            if (f.category().equalsIgnoreCase(category)) {
                list.add(f);
            }
        }
        return list;
    }

    public List<AptitudeQuestionFamily> getFamiliesByTopic(String topic) {
        List<AptitudeQuestionFamily> list = new ArrayList<>();
        for (AptitudeQuestionFamily f : families) {
            if (f.topic().equalsIgnoreCase(topic)) {
                list.add(f);
            }
        }
        return list;
    }

    public List<AptitudeQuestionFamily> getFamiliesByConceptGroup(String conceptGroup) {
        List<AptitudeQuestionFamily> list = new ArrayList<>();
        for (AptitudeQuestionFamily f : families) {
            if (f.conceptGroup().equalsIgnoreCase(conceptGroup)) {
                list.add(f);
            }
        }
        return list;
    }

    public AptitudeQuestionFamily findFamilyById(String familyId) {
        return familyMap.get(familyId);
    }
}
