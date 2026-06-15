import requests
import json
import time

BASE_URL = "http://localhost:8080/api/v1"

def test_chatbot():
    print("=========================================")
    print("STARTING E2E CHATBOT TESTS")
    print("=========================================")

    # 1. Signup / Login
    email = f"test_{int(time.time())}@example.com"
    signup_payload = {
        "fullName": "Abhinav Sarma",
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

    # Test Case 1: Hello
    print("\n--- Test 1: Hello ---")
    payload = {"question": "Hello", "history": []}
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/chat/ask", json=payload, headers=headers)
    t_lat = time.time() - t0
    print(f"Latency: {t_lat:.2f}s")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    ans1 = r.json().get("answer", "")
    print(f"Response:\n{ans1}")

    # Test Case 2: Explain Spring Boot
    print("\n--- Test 2: Explain Spring Boot ---")
    payload = {"question": "Explain Spring Boot", "history": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": ans1}
    ]}
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/chat/ask", json=payload, headers=headers)
    t_lat = time.time() - t0
    print(f"Latency: {t_lat:.2f}s")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    ans2 = r.json().get("answer", "")
    print(f"Response:\n{ans2}")

    # Test Case 3: Give ATS resume suggestions
    print("\n--- Test 3: Give ATS resume suggestions ---")
    payload = {"question": "Give ATS resume suggestions", "history": [
        {"role": "user", "content": "Explain Spring Boot"},
        {"role": "assistant", "content": ans2}
    ]}
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/chat/ask", json=payload, headers=headers)
    t_lat = time.time() - t0
    print(f"Latency: {t_lat:.2f}s")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code} - {r.text}")
        return False
    ans3 = r.json().get("answer", "")
    print(f"Response:\n{ans3}")

    # Test Case 4: Memory test (My name is Abhinav -> What is my name)
    print("\n--- Test 4 Part A: My name is Abhinav ---")
    history_mem = []
    payload = {"question": "My name is Abhinav", "history": history_mem}
    r = requests.post(f"{BASE_URL}/chat/ask", json=payload, headers=headers)
    ans4_a = r.json().get("answer", "")
    print(f"Response: {ans4_a}")

    history_mem.append({"role": "user", "content": "My name is Abhinav"})
    history_mem.append({"role": "assistant", "content": ans4_a})

    print("\n--- Test 4 Part B: What is my name? ---")
    payload = {"question": "What is my name", "history": history_mem}
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/chat/ask", json=payload, headers=headers)
    t_lat = time.time() - t0
    print(f"Latency: {t_lat:.2f}s")
    ans4_b = r.json().get("answer", "")
    print(f"Response: {ans4_b}")
    if "abhinav" in ans4_b.lower():
        print("RESULT: MEMORY SUCCESS (Correctly recalled 'Abhinav')")
    else:
        print("RESULT: MEMORY FAILED")

    # Test Case 5: Streaming test
    print("\n--- Test 5: Streaming response (Explain java roadmaps) ---")
    payload = {"question": "Explain java roadmaps", "history": []}
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/chat/stream", json=payload, headers=headers, stream=True)
    t_lat = time.time() - t0
    print(f"Stream connect latency: {t_lat:.2f}s")
    if r.status_code != 200:
        print(f"FAILED: {r.status_code}")
        return False
    
    print("Chunks received:")
    full_stream_response = ""
    for line in r.iter_lines():
        if line:
            decoded_line = line.decode('utf-8')
            if decoded_line.startswith("data:"):
                chunk = decoded_line[5:]
                full_stream_response += chunk
                print(chunk, end="", flush=True)
    print()
    print("--- Stream finished ---")

    print("\n=========================================")
    print("E2E TESTS COMPLETED SUCCESSFULLY")
    print("=========================================")
    return True

if __name__ == "__main__":
    test_chatbot()
