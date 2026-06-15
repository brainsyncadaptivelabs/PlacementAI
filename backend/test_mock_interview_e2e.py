import requests
import json
import time
import subprocess

BASE_URL = "http://localhost:8080/api/v1"
MYSQL_PATH = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

def run_sql(query):
    try:
        res = subprocess.run([MYSQL_PATH, "-u", "root", "-proot", "-D", "placementai", "-e", query], capture_output=True, text=True, check=True)
        return res.stdout
    except Exception as e:
        print(f"SQL error: {e}")
        return None

def test_mock_interview():
    print("=========================================")
    print("STARTING E2E MOCK INTERVIEW VALIDATION")
    print("=========================================")

    # 1. Signup / Login
    email = f"test_interview_{int(time.time())}@example.com"
    signup_payload = {
        "fullName": "Test User",
        "email": email,
        "password": "password123",
        "role": "STUDENT"
    }

    print(f"Registering user: {email}...")
    r = requests.post(f"{BASE_URL}/auth/signup", json=signup_payload)
    if r.status_code != 200:
        print(f"Signup failed: {r.status_code} - {r.text}")
        return False
    
    token_data = r.json()
    token = token_data.get("accessToken")
    print("Signup succeeded. Token acquired.")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # 2. Generate Interview Questions
    print("\n--- Test 2: Generate Interview ---")
    payload = {
        "role": "Backend Engineer",
        "experienceLevel": "Entry Level"
    }
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/interview/generate", json=payload, headers=headers)
    t_lat_gen = time.time() - t0
    print(f"Latency: {t_lat_gen:.2f}s")
    if t_lat_gen > 3.0:
        print("WARNING: Generate Interview latency is >3 seconds!")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    
    gen_data = r.json()
    print("Response Questions:", gen_data.get("questions"))
    print("Response Tips:", gen_data.get("tips"))
    if not gen_data.get("questions") or not gen_data.get("tips"):
        print("FAILED: Questions or Tips are empty")
        return False

    # 3. Save Interview Results
    print("\n--- Test 3: Save Interview Results (AI / Database check) ---")
    save_payload = {
        "role": "Backend Engineer",
        "experienceLevel": "Entry Level",
        "company": "Google",
        "topic": "Spring Boot",
        "transcript": "assistant: Explain Dependency Injection.\nuser: It is passing dependency object to helper class.\nassistant: What is MVC?\nuser: Model View Controller pattern.",
        "questions": [
            {
                "questionText": "Explain Dependency Injection.",
                "answerText": "It is passing dependency object to helper class.",
                "score": 85
            },
            {
                "questionText": "What is MVC?",
                "answerText": "Model View Controller pattern.",
                "score": 90
            }
        ]
    }
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/interview/save", json=save_payload, headers=headers)
    t_lat_save = time.time() - t0
    print(f"Latency: {t_lat_save:.2f}s")
    if t_lat_save > 3.0:
        print("WARNING: Save/Feedback generation latency is >3 seconds!")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    
    save_data = r.json()
    interview_id = save_data.get("id")
    print(f"Saved interview ID: {interview_id}")
    if not interview_id:
        print("FAILED: No interview ID returned")
        return False

    # 4. Fetch History
    print("\n--- Test 4: Fetch Interview History ---")
    t0 = time.time()
    r = requests.get(f"{BASE_URL}/interview/history", headers=headers)
    t_lat_hist = time.time() - t0
    print(f"Latency: {t_lat_hist:.2f}s")
    if t_lat_hist > 3.0:
        print("WARNING: History Load latency is >3 seconds!")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    history = r.json()
    print(f"History contains {len(history)} entries.")
    if len(history) == 0:
        print("FAILED: History is empty")
        return False

    # 5. Fetch by ID
    print("\n--- Test 5: Fetch Interview by ID ---")
    t0 = time.time()
    r = requests.get(f"{BASE_URL}/interview/{interview_id}", headers=headers)
    t_lat_id = time.time() - t0
    print(f"Latency: {t_lat_id:.2f}s")
    if t_lat_id > 3.0:
        print("WARNING: Fetch by ID latency is >3 seconds!")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    fetched = r.json()
    print(f"Fetched Role: {fetched.get('role')}")
    print(f"Fetched Feedback Assessment: {fetched.get('feedback', {}).get('finalAssessment')}")
    print(f"Fetched Feedback Total Score: {fetched.get('feedback', {}).get('totalScore')}")

    # 6. Database Verification (Phase 6)
    print("\n--- Test 6: Database Direct SQL Checks ---")
    
    print("Checking mock_interviews table...")
    res = run_sql(f"SELECT id, role, user_id FROM mock_interviews WHERE id = {interview_id}")
    print(res)
    if not res or str(interview_id) not in res:
        print("FAILED: Database row not found in mock_interviews")
        return False
        
    print("Checking interview_questions table...")
    res_q = run_sql(f"SELECT id, question_text, answer_text FROM interview_questions WHERE mock_interview_id = {interview_id}")
    print(res_q)
    if not res_q or "Explain Dependency Injection" not in res_q:
        print("FAILED: Database row not found in interview_questions")
        return False

    # Insert sample row directly via SQL, read it, then delete it
    print("\nInserting sample test row directly via SQL...")
    # Find user_id first
    user_res = run_sql(f"SELECT id FROM users WHERE email = '{email}'")
    user_lines = user_res.strip().split("\n")
    if len(user_lines) > 1:
        user_id = user_lines[1].strip()
    else:
        user_id = "1"
    
    insert_res = run_sql(f"INSERT INTO mock_interviews (role, experience_level, company, topic, user_id, created_at) VALUES ('Direct SQL Test', 'Senior', 'Direct Corp', 'SQL', {user_id}, NOW())")
    
    last_id_res = run_sql("SELECT LAST_INSERT_ID()")
    direct_id = last_id_res.strip().split("\n")[1].strip()
    print(f"Direct SQL Inserted ID: {direct_id}")
    
    # Read the direct SQL row
    read_res = run_sql(f"SELECT id, role FROM mock_interviews WHERE id = {direct_id}")
    print(f"Read row results:\n{read_res}")
    if "Direct SQL Test" not in read_res:
        print("FAILED: Read directly inserted row failed")
        return False

    # Delete directly inserted row
    delete_res = run_sql(f"DELETE FROM mock_interviews WHERE id = {direct_id}")
    print("Deleted directly inserted row.")
    
    # Read again to ensure deleted
    read_deleted = run_sql(f"SELECT id, role FROM mock_interviews WHERE id = {direct_id}")
    if "Direct SQL Test" in read_deleted:
        print("FAILED: Row was not deleted successfully")
        return False
        
    print("Direct SQL check passed!")

    print("\n=========================================")
    print("E2E MOCK INTERVIEW TESTS COMPLETED SUCCESSFULLY")
    print("=========================================")
    return True

if __name__ == "__main__":
    test_mock_interview()
