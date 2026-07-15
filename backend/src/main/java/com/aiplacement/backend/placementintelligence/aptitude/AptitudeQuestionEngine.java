package com.aiplacement.backend.placementintelligence.aptitude;

import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class AptitudeQuestionEngine {

    private static final String[] CANDIDATE_NAMES = {"Abhinav", "Bharath", "Likith", "Sree Alekhya", "Ananya", "Rohan", "Sneha", "Kiran", "Divya", "Rahul", "Priya", "Amit"};
    private static final String[] ITEMS = {"laptop", "phone", "book", "chair", "table", "watch", "pen", "bag", "monitor", "keyboard"};
    private static final String[] COMPANIES = {"TCS", "Infosys", "Accenture", "Cognizant", "Wipro", "Capgemini", "Deloitte", "EY", "PwC", "Amazon", "Microsoft", "Google", "Oracle", "Zoho", "Adobe"};
    private static final Random random = new Random();

    private static String getRandomElement(String[] arr) {
        return arr[random.nextInt(arr.length)];
    }

    private static int getRandomRange(int min, int max) {
        return random.nextInt(max - min + 1) + min;
    }

    private static List<String> generateOptions(int correctVal) {
        Set<String> optionsSet = new HashSet<>();
        optionsSet.add(String.valueOf(correctVal));
        while (optionsSet.size() < 4) {
            int variation = correctVal + getRandomRange(-15, 15);
            if (variation != correctVal && variation >= 0) {
                optionsSet.add(String.valueOf(variation));
            }
        }
        List<String> list = new ArrayList<>(optionsSet);
        Collections.shuffle(list);
        return list;
    }

    private static List<String> generateOptionsString(String correctVal, String... fallbacks) {
        Set<String> optionsSet = new HashSet<>();
        optionsSet.add(correctVal);
        for (String f : fallbacks) {
            optionsSet.add(f);
        }
        while (optionsSet.size() < 4) {
            optionsSet.add("None of these");
            optionsSet.add("Cannot be determined");
            optionsSet.add("Both A and B");
            optionsSet.add("Information insufficient");
        }
        List<String> list = new ArrayList<>(optionsSet);
        Collections.shuffle(list);
        return list;
    }

    public static Question generateQuestion(String category, String topic, String company, String difficulty) {
        String finalCategory = "any".equals(category) ? getRandomElement(new String[]{"Quantitative Aptitude", "Logical Reasoning", "Verbal Ability", "English"}) : category;
        String finalTopic = topic;
        String finalDifficulty = difficulty == null ? getRandomElement(new String[]{"Easy", "Medium", "Hard"}) : difficulty;

        Question.QuestionBuilder builder = Question.builder()
                .category(finalCategory)
                .topic(finalTopic)
                .difficulty(finalDifficulty)
                .companyLevel(company);

        // Populate details based on Category & Topic
        if ("Quantitative Aptitude".equals(finalCategory)) {
            buildQuantQuestion(finalTopic, builder);
        } else if ("Logical Reasoning".equals(finalCategory)) {
            buildLogicalQuestion(finalTopic, builder);
        } else if ("Verbal Ability".equals(finalCategory)) {
            buildVerbalQuestion(finalTopic, builder);
        } else {
            buildEnglishQuestion(finalTopic, builder);
        }

        Question q = builder.build();
        q.setId("q-" + q.getTopic().toLowerCase().replace(" ", "-") + "-" + System.nanoTime() + "-" + random.nextInt(1000));

        // IRT Difficulty & parameters mapping
        if ("Hard".equals(finalDifficulty)) {
            q.setTimeLimit((int) Math.round(q.getTimeLimit() * 1.3));
            q.setB(0.5 + random.nextDouble() * 1.5);
        } else if ("Easy".equals(finalDifficulty)) {
            q.setTimeLimit(Math.max(30, (int) Math.round(q.getTimeLimit() * 0.8)));
            q.setB(-2.0 + random.nextDouble() * 1.5);
        } else {
            q.setB(-0.5 + random.nextDouble() * 1.0);
        }
        q.setA(0.8 + random.nextDouble() * 1.2);
        q.setC(0.25);

        return q;
    }

    private static void buildQuantQuestion(String topic, Question.QuestionBuilder builder) {
        int num1 = getRandomRange(10, 100);
        int num2 = getRandomRange(5, 20);

        switch (topic) {
            case "Number System":
                int rem = num1 % num2;
                builder.text("Find the remainder when the number " + num1 + " is divided by " + num2 + ".")
                       .options(generateOptions(rem))
                       .answer(String.valueOf(rem))
                       .timeLimit(45)
                       .explanation("Remainder of " + num1 + " / " + num2 + " is " + rem + ".")
                       .formula("Remainder = Dividend - (Divisor * Quotient)");
                break;
            case "Percentage":
                int price = getRandomRange(100, 1000) * 10;
                int disc = getRandomRange(10, 30);
                int finalPrice = (int) Math.round(price * (1 - disc / 100.0));
                builder.text("A course marked at ₹" + price + " is offered at a flat " + disc + "% discount. How much does the student pay?")
                       .options(generateOptions(finalPrice))
                       .answer(String.valueOf(finalPrice))
                       .timeLimit(45)
                       .explanation("Discounted price = " + price + " * (1 - " + disc + "/100) = ₹" + finalPrice + ".")
                       .formula("SP = MP * (100 - Discount)% / 100");
                break;
            case "Time & Work":
                int daysA = getRandomRange(10, 20);
                int daysB = getRandomRange(12, 30);
                int combined = (int) Math.round((double)(daysA * daysB) / (daysA + daysB));
                builder.text("Amit can complete a software design module in " + daysA + " days, while Priya takes " + daysB + " days. Working together, in how many days will they finish?")
                       .options(generateOptions(combined))
                       .answer(String.valueOf(combined))
                       .timeLimit(90)
                       .explanation("Combined work days = (A * B) / (A + B) = " + combined + " days.")
                       .formula("Combined Days = (A * B) / (A + B)");
                break;
            default:
                // Default fallback for remaining 20 quantitative topics
                int simpleAns = num1 + num2;
                builder.text("Solve: What is " + num1 + " plus " + num2 + "?")
                       .options(generateOptions(simpleAns))
                       .answer(String.valueOf(simpleAns))
                       .timeLimit(60)
                       .explanation("Simple addition result: " + simpleAns + ".")
                       .formula("Sum = A + B");
                break;
        }
    }

    private static void buildLogicalQuestion(String topic, Question.QuestionBuilder builder) {
        String name1 = getRandomElement(CANDIDATE_NAMES);
        String name2 = getRandomElement(CANDIDATE_NAMES);

        switch (topic) {
            case "Blood Relations":
                builder.text("Pointing to a photograph, " + name1 + " says, 'He is the only son of my father's wife.' How is the man in the photo related to " + name1 + "?")
                       .options(generateOptionsString("Brother", "Uncle", "Father", "Cousin"))
                       .answer("Brother")
                       .timeLimit(60)
                       .explanation("Father's wife is mother. Mother's only son is brother.")
                       .formula("Direct kinship relations");
                break;
            default:
                builder.text("In a row of 40 students, " + name1 + " is 14th from the left. What is their position from the right end?")
                       .options(generateOptions(27))
                       .answer("27")
                       .timeLimit(60)
                       .explanation("Right position = Total - Left + 1 = 40 - 14 + 1 = 27.")
                       .formula("Position = Total - GivenPosition + 1");
                break;
        }
    }

    private static void buildVerbalQuestion(String topic, Question.QuestionBuilder builder) {
        switch (topic) {
            case "Synonyms":
                builder.text("Find the synonym of the word 'ABANDON'.")
                       .options(generateOptionsString("Forsake", "Keep", "Cherish", "Adopt"))
                       .answer("Forsake")
                       .timeLimit(30)
                       .explanation("Abandon means to leave completely, Forsake is the closest synonym.")
                       .formula("Vocabulary builder definitions");
                break;
            default:
                builder.text("Choose the word that best fits the sentence: 'The team was ______ after their victory.'")
                       .options(generateOptionsString("Elated", "Gloomy", "Dejected", "Indifferent"))
                       .answer("Elated")
                       .timeLimit(30)
                       .explanation("Elated means ecstatically happy, matching the victory context.")
                       .formula("Contextual sentence completions");
                break;
        }
    }

    private static void buildEnglishQuestion(String topic, Question.QuestionBuilder builder) {
        switch (topic) {
            case "Grammar":
                builder.text("Identify the grammatically correct sentence.")
                       .options(generateOptionsString(
                           "Each of the students has completed the assignment.",
                           "Each of the students have completed the assignment.",
                           "Each of the student has completed the assignment.",
                           "Each of the students are completed the assignment."
                       ))
                       .answer("Each of the students has completed the assignment.")
                       .timeLimit(45)
                       .explanation("'Each' is a singular pronoun and takes the singular verb 'has'.")
                       .formula("Subject-verb agreement rules");
                break;
            default:
                builder.text("Identify the part of speech of the underlined word in: 'She ran *quickly* to catch the train.'")
                       .options(generateOptionsString("Adverb", "Noun", "Verb", "Adjective"))
                       .answer("Adverb")
                       .timeLimit(30)
                       .explanation("'Quickly' describes the verb 'ran', making it an adverb.")
                       .formula("Parts of speech identification");
                break;
        }
    }
}
