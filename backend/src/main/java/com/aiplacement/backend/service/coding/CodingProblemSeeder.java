package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingTestCase;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class CodingProblemSeeder implements CommandLineRunner {

    private final CodingProblemRepository problemRepository;
    private final CodingTestCaseRepository testCaseRepository;

    @Override
    public void run(String... args) {
        log.info("[CODING_SEEDER] Verifying core coding problems in database...");
        if (problemRepository.count() == 0) {
            log.info("[CODING_SEEDER] No coding problems found. Seeding core problem set...");
            seedDefaultProblems();
        } else {
            log.info("[CODING_SEEDER] Found {} existing coding problems.", problemRepository.count());
        }
    }

    public synchronized void seedDefaultProblems() {
        if (problemRepository.count() > 0) return;

        // Problem 1: Two Sum
        CodingProblem twoSum = CodingProblem.builder()
                .title("Two Sum")
                .difficulty("Easy")
                .tags("Arrays, Hash Tables")
                .targetLanguages("python, javascript, java, cpp, c")
                .timeComplexityTarget("O(N)")
                .spaceComplexityTarget("O(N)")
                .problemStatement("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.")
                .examples("Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].")
                .constraints("2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.")
                .hints("A brute force way would be O(N^2). Can you use a Hash Map to reduce lookup to O(1)?")
                .build();
        twoSum = problemRepository.save(twoSum);

        testCaseRepository.saveAll(List.of(
                CodingTestCase.builder().codingProblem(twoSum).input("[2,7,11,15]\n9").expectedOutput("[0,1]").hidden(false).ordinal(1).timeoutMs(5000).memoryLimitMb(256).description("Example 1").build(),
                CodingTestCase.builder().codingProblem(twoSum).input("[3,2,4]\n6").expectedOutput("[1,2]").hidden(false).ordinal(2).timeoutMs(5000).memoryLimitMb(256).description("Example 2").build(),
                CodingTestCase.builder().codingProblem(twoSum).input("[3,3]\n6").expectedOutput("[0,1]").hidden(true).ordinal(3).timeoutMs(5000).memoryLimitMb(256).description("Hidden 1").build(),
                CodingTestCase.builder().codingProblem(twoSum).input("[-1,-2,-3,-4,-5]\n-8").expectedOutput("[2,4]").hidden(true).ordinal(4).timeoutMs(5000).memoryLimitMb(256).description("Hidden 2").build()
        ));

        // Problem 2: Longest Substring Without Repeating Characters
        CodingProblem longestSubstr = CodingProblem.builder()
                .title("Longest Substring Without Repeating Characters")
                .difficulty("Medium")
                .tags("Strings, Sliding Window, Hash Tables")
                .targetLanguages("python, javascript, java, cpp, c")
                .timeComplexityTarget("O(N)")
                .spaceComplexityTarget("O(Min(N, K))")
                .problemStatement("Given a string s, find the length of the longest substring without repeating characters.")
                .examples("Input: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3.")
                .constraints("0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.")
                .hints("Use a sliding window approach with two pointers and a hash set.")
                .build();
        longestSubstr = problemRepository.save(longestSubstr);

        testCaseRepository.saveAll(List.of(
                CodingTestCase.builder().codingProblem(longestSubstr).input("\"abcabcbb\"").expectedOutput("3").hidden(false).ordinal(1).timeoutMs(5000).memoryLimitMb(256).description("Example 1").build(),
                CodingTestCase.builder().codingProblem(longestSubstr).input("\"bbbbb\"").expectedOutput("1").hidden(false).ordinal(2).timeoutMs(5000).memoryLimitMb(256).description("Example 2").build(),
                CodingTestCase.builder().codingProblem(longestSubstr).input("\"pwwkew\"").expectedOutput("3").hidden(true).ordinal(3).timeoutMs(5000).memoryLimitMb(256).description("Hidden 1").build()
        ));

        // Problem 3: Trapping Rain Water
        CodingProblem trappingRain = CodingProblem.builder()
                .title("Trapping Rain Water")
                .difficulty("Hard")
                .tags("Arrays, Two Pointers, Dynamic Programming")
                .targetLanguages("python, javascript, java, cpp, c")
                .timeComplexityTarget("O(N)")
                .spaceComplexityTarget("O(1)")
                .problemStatement("Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.")
                .examples("Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6")
                .constraints("n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5")
                .build();
        trappingRain = problemRepository.save(trappingRain);

        testCaseRepository.saveAll(List.of(
                CodingTestCase.builder().codingProblem(trappingRain).input("[0,1,0,2,1,0,1,3,2,1,2,1]").expectedOutput("6").hidden(false).ordinal(1).timeoutMs(5000).memoryLimitMb(256).description("Example 1").build(),
                CodingTestCase.builder().codingProblem(trappingRain).input("[4,2,0,3,2,5]").expectedOutput("9").hidden(true).ordinal(2).timeoutMs(5000).memoryLimitMb(256).description("Hidden 1").build()
        ));

        log.info("[CODING_SEEDER] Core coding problems seeded successfully.");
    }
}

