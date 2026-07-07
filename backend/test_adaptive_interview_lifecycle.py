import requests
import json
import time

BASE_URL = "http://localhost:8080/api/v1"

def test_adaptive_interview_lifecycle():
    print("====================================================")
    print("STARTING E2E ADAPTIVE MOCK INTERVIEW LIFECYCLE TEST")
    print("====================================================")

    # 1. Signup a new test candidate user
    email = f"adaptive_candidate_{int(time.time())}@example.com"
    signup_payload = {
        "fullName": "Adaptive Candidate Student",
        "email": email,
        "password": "candidatepassword123",
        "confirmPassword": "candidatepassword123",
        "phone": "1234567890",
        "collegeName": "Test University",
        "branch": "Computer Science",
        "role": "STUDENT"
    }

    print(f"[TEST] Registering candidate user: {email}...")
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    if r.status_code != 200:
        print(f"[TEST] Signup failed: {r.status_code} - {r.text}")
        return False
    
    token_data = r.json()
    token = token_data.get("accessToken")
    print("[TEST] Signup succeeded. Auth Token acquired.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Start adaptive mock interview
    print("\n[TEST] Starting adaptive mock interview...")
    start_payload = {
        "role": "Senior Software Architect",
        "experienceLevel": "Senior",
        "company": "NVIDIA",
        "difficulty": "Medium",
        "interviewType": "Technical",
        "conversationalStyle": "Strict",
        "topic": "System Design, Microservices, Redis Caching",
        "jobDescription": "Build highly scalable, low-latency APIs and real-time distributed platforms using Spring Boot and Redis.",
        "resumeText": "Experienced Lead Engineer with 6 years experience in Java, Microservices, and Redis. Built high-throughput transaction backend."
    }

    t0 = time.time()
    r = requests.post(f"{BASE_URL}/interview/adaptive/start", json=start_payload, headers=headers)
    latency = time.time() - t0
    print(f"[TEST] /start Latency: {latency:.2f}s")
    if r.status_code != 200:
        print(f"[TEST] FAILED: {r.status_code} - {r.text}")
        return False

    start_data = r.json()
    interview_id = start_data.get("interviewId")
    first_question = start_data.get("firstQuestion")
    print(f"[TEST] Created Interview ID: {interview_id}")
    print(f"[TEST] First Question: {first_question}")

    if not interview_id or not first_question:
        print("[TEST] FAILED: No interview ID or first question returned")
        return False

    # 3. Perform a multi-turn conversation and submit answers
    turns = [
        "I have built a distributed caching layer using Redis Cluster to handle 50,000 requests per second. We used write-through caching strategy to maintain consistency with PostgreSQL.",
        "To handle split-brain in a cluster, we configured sentinel nodes and quorum values. We also tuned active active replication and garbage collection algorithms."
    ]

    for index, candidate_answer in enumerate(turns):
        print(f"\n[TEST] Turn {index + 1}: Submitting candidate answer...")
        answer_payload = {
            "interviewId": interview_id,
            "answer": candidate_answer,
            "thinkingTimeSeconds": 8.5 + (index * 2),
            "timeTakenSeconds": 45.0 + (index * 5)
        }

        t0 = time.time()
        r = requests.post(f"{BASE_URL}/interview/adaptive/answer", json=answer_payload, headers=headers)
        latency = time.time() - t0
        print(f"[TEST] /answer Latency: {latency:.2f}s")
        if r.status_code != 200:
            print(f"[TEST] FAILED: {r.status_code} - {r.text}")
            return False

        answer_data = r.json()
        is_finished = answer_data.get("isFinished")
        next_question = answer_data.get("nextQuestion")
        print(f"[TEST] isFinished: {is_finished}")
        print(f"[TEST] Next Question: {next_question}")

        if is_finished:
            print("[TEST] Interview finished early. Exiting loop.")
            break

        if not next_question:
            print("[TEST] FAILED: Expected next question")
            return False

        # Verify that the next question adopts a persona name prefix e.g. [System Design Expert]
        if not next_question.startswith("["):
            print("WARNING: nextQuestion does not start with an agent persona name prefix!")
        else:
            print(f"[TEST] Persona Routing Verified: {next_question.split(']')[0] + ']'}")

    # 4. Fetch the completed/in-progress interview details to verify database persistence
    print("\n[TEST] Fetching interview details by ID...")
    r = requests.get(f"{BASE_URL}/interview/{interview_id}", headers=headers)
    if r.status_code != 200:
        print(f"[TEST] FAILED to fetch interview: {r.status_code} - {r.text}")
        return False

    fetched = r.json()
    print(f"[TEST] Fetched Role: {fetched.get('role')}")
    print(f"[TEST] Fetched Company: {fetched.get('company')}")
    
    questions_list = fetched.get("questions", [])
    print(f"[TEST] Saved Questions Count: {len(questions_list)}")
    if len(questions_list) < 2:
        print("[TEST] FAILED: Expected questions list to contain at least 2 questions")
        return False

    # Check that latency metrics are successfully persisted in the database
    first_q_answered = questions_list[0]
    print(f"[TEST] First Question Text: {first_q_answered.get('questionText')}")
    print(f"[TEST] Candidate Answer Saved: {first_q_answered.get('answerText')}")
    print(f"[TEST] Thinking Time Saved: {first_q_answered.get('thinkingTimeSeconds')}")
    print(f"[TEST] Time Taken Saved: {first_q_answered.get('timeTakenSeconds')}")
    print(f"[TEST] Score Saved: {first_q_answered.get('score')}")
    print(f"[TEST] Emotional Analysis Saved: {first_q_answered.get('emotionAnalysisJson')}")

    if first_q_answered.get('thinkingTimeSeconds') is None or first_q_answered.get('timeTakenSeconds') is None:
        print("[TEST] FAILED: Latency metrics were not persisted in the database!")
        return False

    print("\n====================================================")
    print("E2E ADAPTIVE MOCK INTERVIEW LIFECYCLE TESTS PASSED!")
    print("====================================================")
    return True

if __name__ == "__main__":
    test_adaptive_interview_lifecycle()
