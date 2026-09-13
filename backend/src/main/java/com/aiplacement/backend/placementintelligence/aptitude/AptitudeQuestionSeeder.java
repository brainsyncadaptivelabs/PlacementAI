package com.aiplacement.backend.placementintelligence.aptitude;

import com.aiplacement.backend.entity.AptitudeQuestion;
import com.aiplacement.backend.repository.AptitudeQuestionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AptitudeQuestionSeeder {

    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    @PostConstruct
    public void seedDefaultQuestions() {
        try {
            if (aptitudeQuestionRepository.count() == 0) {
                log.info("[APTITUDE_SEEDER] Seeding initial aptitude question bank...");

                List<AptitudeQuestion> seedQuestions = List.of(
                        AptitudeQuestion.builder()
                                .category("Quantitative Aptitude")
                                .topic("Time and Work")
                                .text("A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will the work be completed?")
                                .options(Arrays.asList("7.2 days", "8 days", "6.5 days", "9 days"))
                                .answer("7.2 days")
                                .difficulty("Medium")
                                .timeLimit(60)
                                .explanation("A's 1 day work = 1/12. B's 1 day work = 1/18. Combined 1 day work = 1/12 + 1/18 = 5/36. Total days = 36/5 = 7.2 days.")
                                .formula("(A * B) / (A + B)")
                                .companyLevel("TCS, Infosys, Wipro")
                                .build(),

                        AptitudeQuestion.builder()
                                .category("Quantitative Aptitude")
                                .topic("Percentages")
                                .text("If the price of sugar rises by 25%, by how much percent should a household reduce its consumption so as not to increase expenditure?")
                                .options(Arrays.asList("20%", "25%", "15%", "18%"))
                                .answer("20%")
                                .difficulty("Easy")
                                .timeLimit(45)
                                .explanation("Reduction % = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.")
                                .formula("[R / (100 + R)] * 100")
                                .companyLevel("Accenture, Cognizant")
                                .build(),

                        AptitudeQuestion.builder()
                                .category("Quantitative Aptitude")
                                .topic("Speed, Time & Distance")
                                .text("A train running at 72 km/h crosses a 200m long platform in 22 seconds. What is the length of the train?")
                                .options(Arrays.asList("240m", "220m", "250m", "200m"))
                                .answer("240m")
                                .difficulty("Medium")
                                .timeLimit(60)
                                .explanation("Speed = 72 * 5/18 = 20 m/s. Total distance = speed * time = 20 * 22 = 440m. Train length = 440 - 200 = 240m.")
                                .formula("Distance = Speed * Time")
                                .companyLevel("Amazon, Cisco")
                                .build(),

                        AptitudeQuestion.builder()
                                .category("Logical Reasoning")
                                .topic("Blood Relations")
                                .text("Pointing to a photograph, a woman says, 'His mother is the only daughter of my mother.' How is the person in the photograph related to the woman?")
                                .options(Arrays.asList("Son", "Brother", "Nephew", "Father"))
                                .answer("Son")
                                .difficulty("Easy")
                                .timeLimit(45)
                                .explanation("Only daughter of woman's mother is the woman herself. So the person's mother is the woman. Thus, the person is her son.")
                                .formula("Family Tree Analysis")
                                .companyLevel("TCS, Cognizant")
                                .build(),

                        AptitudeQuestion.builder()
                                .category("Logical Reasoning")
                                .topic("Syllogisms")
                                .text("Statements: 1. All apples are fruits. 2. Some fruits are sweet.\nConclusions: I. Some apples are sweet. II. No apple is sweet.")
                                .options(Arrays.asList("Either I or II follows", "Only I follows", "Only II follows", "Neither follows"))
                                .answer("Either I or II follows")
                                .difficulty("Hard")
                                .timeLimit(60)
                                .explanation("Conclusions I and II form a complementary pair ('Some' and 'No' with identical subject and predicate). Therefore, either I or II must follow.")
                                .formula("Complementary Pair Rule")
                                .companyLevel("Deloitte, EY")
                                .build(),

                        AptitudeQuestion.builder()
                                .category("Verbal Ability")
                                .topic("Sentence Correction")
                                .text("Choose the grammatically correct sentence:")
                                .options(Arrays.asList(
                                        "Neither the teacher nor the students were present in the hall.",
                                        "Neither the teacher nor the students was present in the hall.",
                                        "Neither the teacher or the students were present in the hall.",
                                        "Neither the teacher nor the students is present in the hall."
                                ))
                                .answer("Neither the teacher nor the students were present in the hall.")
                                .difficulty("Medium")
                                .timeLimit(45)
                                .explanation("When subjects are joined by 'neither...nor', the verb agrees with the nearer subject ('students' is plural, so 'were').")
                                .formula("Proximity Rule")
                                .companyLevel("IBM, Oracle")
                                .build()
                );

                aptitudeQuestionRepository.saveAll(seedQuestions);
                log.info("[APTITUDE_SEEDER] Successfully seeded {} aptitude questions.", seedQuestions.size());
            } else {
                log.debug("[APTITUDE_SEEDER] Aptitude question bank already contains {} questions. Skipping seed.", aptitudeQuestionRepository.count());
            }
        } catch (Exception e) {
            log.warn("[APTITUDE_SEEDER] Skipping or encountered issue seeding aptitude questions: {}", e.getMessage());
        }
    }
}
