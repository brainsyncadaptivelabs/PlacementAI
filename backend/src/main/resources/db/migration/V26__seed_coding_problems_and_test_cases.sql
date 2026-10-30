-- V26: Seed core coding problems and test cases for Coding Workspace & Program of the Day

INSERT INTO coding_problems (id, title, problem_statement, constraints, examples, hints, difficulty, tags, target_languages, time_complexity_target, space_complexity_target, created_at)
VALUES 
(
    1,
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
    'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Can you use a Hash Map to reduce lookup to O(1)?',
    'Easy',
    'Arrays, Hash Tables',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(N)',
    NOW()
),
(
    2,
    'Longest Substring Without Repeating Characters',
    'Given a string s, find the length of the longest substring without repeating characters.',
    '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
    'Use a sliding window approach with two pointers and a set/map to keep track of characters in the current window.',
    'Medium',
    'Strings, Sliding Window, Hash Tables',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(Min(N, K))',
    NOW()
),
(
    3,
    'Trapping Rain Water',
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
    'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\nExplanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.',
    'For each element, the water trapped depends on the minimum of the maximum height to its left and right minus its own height.',
    'Hard',
    'Arrays, Two Pointers, Dynamic Programming',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(1)',
    NOW()
),
(
    4,
    'Valid Parentheses',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    '1 <= s.length <= 10^4\ns consists of parentheses only ''()[]{}''.',
    'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    'Use a Stack. Push opening brackets and pop matching closing brackets. If empty at the end, it is valid.',
    'Easy',
    'Strings, Stack',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(N)',
    NOW()
),
(
    5,
    'Best Time to Buy and Sell Stock',
    'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    '1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4',
    'Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
    'Keep track of the minimum price seen so far as you iterate through the list.',
    'Easy',
    'Arrays, Dynamic Programming',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(1)',
    NOW()
),
(
    6,
    'Maximum Subarray',
    'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
    'Use Kadane''s Algorithm: keep track of max_current and max_global as you iterate.',
    'Medium',
    'Arrays, Dynamic Programming',
    'python, javascript, java, cpp, c',
    'O(N)',
    'O(1)',
    NOW()
),
(
    7,
    'Binary Search',
    'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.',
    'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4',
    'Divide the search interval in half by comparing the target to the middle element.',
    'Easy',
    'Arrays, Binary Search',
    'python, javascript, java, cpp, c',
    'O(log N)',
    'O(1)',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to ensure future inserts don't collide
SELECT setval('coding_problems_id_seq', (SELECT COALESCE(MAX(id), 1) FROM coding_problems));

-- Seed Test Cases for Two Sum (Problem 1)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(1, E'[2,7,11,15]\n9', '[0,1]', false, false, false, false, 1, 5000, 256, 'Example 1: Standard two-sum pair'),
(1, E'[3,2,4]\n6', '[1,2]', false, false, false, false, 2, 5000, 256, 'Example 2: Non-zero starting index'),
(1, E'[3,3]\n6', '[0,1]', true, true, false, false, 3, 5000, 256, 'Hidden 1: Duplicate elements target pair'),
(1, E'[-1,-2,-3,-4,-5]\n-8', '[2,4]', true, false, false, false, 4, 5000, 256, 'Hidden 2: Negative integers')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Longest Substring (Problem 2)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(2, '"abcabcbb"', '3', false, false, false, false, 1, 5000, 256, 'Example 1: Standard repeating pattern'),
(2, '"bbbbb"', '1', false, false, false, false, 2, 5000, 256, 'Example 2: All identical characters'),
(2, '"pwwkew"', '3', true, false, false, false, 3, 5000, 256, 'Hidden 1: Substring vs subsequence check'),
(2, '""', '0', true, true, false, false, 4, 5000, 256, 'Hidden 2: Empty string')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Trapping Rain Water (Problem 3)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(3, '[0,1,0,2,1,0,1,3,2,1,2,1]', '6', false, false, false, false, 1, 5000, 256, 'Example 1: Irregular elevation map'),
(3, '[4,2,0,3,2,5]', '9', true, false, false, false, 2, 5000, 256, 'Hidden 1: Steeper boundaries')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Valid Parentheses (Problem 4)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(4, '"()[]{}"', 'true', false, false, false, false, 1, 5000, 256, 'Example 1: Multiple matching brackets'),
(4, '"(]"', 'false', false, false, false, false, 2, 5000, 256, 'Example 2: Mismatched bracket types'),
(4, '"([)]"', 'false', true, false, false, false, 3, 5000, 256, 'Hidden 1: Interleaved invalid order'),
(4, '"{[]}"', 'true', true, false, false, false, 4, 5000, 256, 'Hidden 2: Nested valid brackets')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Best Time to Buy and Sell Stock (Problem 5)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(5, '[7,1,5,3,6,4]', '5', false, false, false, false, 1, 5000, 256, 'Example 1: Standard profit scenario'),
(5, '[7,6,4,3,1]', '0', false, true, false, false, 2, 5000, 256, 'Example 2: Constantly decreasing prices (no profit)')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Maximum Subarray (Problem 6)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(6, '[-2,1,-3,4,-1,2,1,-5,4]', '6', false, false, false, false, 1, 5000, 256, 'Example 1: Mixed positive and negative integers'),
(6, '[1]', '1', false, true, false, false, 2, 5000, 256, 'Example 2: Single element array'),
(6, '[5,4,-1,7,8]', '23', true, false, false, false, 3, 5000, 256, 'Hidden 1: Mostly positive integers')
ON CONFLICT DO NOTHING;

-- Seed Test Cases for Binary Search (Problem 7)
INSERT INTO coding_test_cases (coding_problem_id, input, expected_output, hidden, boundary, performance, randomized, ordinal, timeout_ms, memory_limit_mb, description)
VALUES
(7, E'[-1,0,3,5,9,12]\n9', '4', false, false, false, false, 1, 5000, 256, 'Example 1: Element present in array'),
(7, E'[-1,0,3,5,9,12]\n2', '-1', false, true, false, false, 2, 5000, 256, 'Example 2: Element not present')
ON CONFLICT DO NOTHING;

-- Reset test cases sequence
SELECT setval('coding_test_cases_id_seq', (SELECT COALESCE(MAX(id), 1) FROM coding_test_cases));
