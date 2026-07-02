const BASE_URL = "http://localhost:8080/api/v1";

async function runTests() {
  console.log("=========================================");
  console.log("STARTING E2E CHATBOT TESTS (NODE.JS)");
  console.log("=========================================");

  try {
    // 1. Signup a user
    const email = `test_${Date.now()}@example.com`;
    const signupPayload = {
      fullName: "Abhinav Sarma",
      email: email,
      password: "password123",
      confirmPassword: "password123",
      phone: "+12345678901",
      role: "STUDENT",
      collegeName: "Government Engineering College",
      branch: "Computer Science",
      graduationYear: 2026
    };

    console.log(`Registering user: ${email}...`);
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupPayload)
    });

    if (!signupRes.ok) {
      console.error(`Signup failed: ${signupRes.status} - ${await signupRes.text()}`);
      return;
    }

    const tokenData = await signupRes.json();
    const token = tokenData.accessToken;
    console.log("Signup succeeded. Token acquired.");

    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // Test Case 1: Hello
    console.log("\n--- Test 1: Hello ---");
    let t0 = Date.now();
    const res1 = await fetch(`${BASE_URL}/chat/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ question: "Hello", history: [] })
    });
    console.log(`Latency: ${(Date.now() - t0)/1000}s`);
    if (!res1.ok) {
      console.error(`FAILED: ${res1.status} - ${await res1.text()}`);
      return;
    }
    const ans1 = (await res1.json()).answer;
    console.log(`Response:\n${ans1}`);

    // Test Case 2: Explain Spring Boot
    console.log("\n--- Test 2: Explain Spring Boot ---");
    t0 = Date.now();
    const res2 = await fetch(`${BASE_URL}/chat/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: "Explain Spring Boot",
        history: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: ans1 }
        ]
      })
    });
    console.log(`Latency: ${(Date.now() - t0)/1000}s`);
    if (!res2.ok) {
      console.error(`FAILED: ${res2.status} - ${await res2.text()}`);
      return;
    }
    const ans2 = (await res2.json()).answer;
    console.log(`Response:\n${ans2}`);

    // Test Case 3: Give ATS resume suggestions
    console.log("\n--- Test 3: Give ATS resume suggestions ---");
    t0 = Date.now();
    const res3 = await fetch(`${BASE_URL}/chat/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        question: "Give ATS resume suggestions",
        history: [
          { role: "user", content: "Explain Spring Boot" },
          { role: "assistant", content: ans2 }
        ]
      })
    });
    console.log(`Latency: ${(Date.now() - t0)/1000}s`);
    if (!res3.ok) {
      console.error(`FAILED: ${res3.status} - ${await res3.text()}`);
      return;
    }
    const ans3 = (await res3.json()).answer;
    console.log(`Response:\n${ans3}`);

    // Test Case 4: Memory test (My name is Abhinav -> What is my name)
    console.log("\n--- Test 4 Part A: My name is Abhinav ---");
    const historyMem = [];
    const res4a = await fetch(`${BASE_URL}/chat/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ question: "My name is Abhinav", history: historyMem })
    });
    const ans4a = (await res4a.json()).answer;
    console.log(`Response: ${ans4a}`);

    historyMem.push({ role: "user", content: "My name is Abhinav" });
    historyMem.push({ role: "assistant", content: ans4a });

    console.log("\n--- Test 4 Part B: What is my name? ---");
    t0 = Date.now();
    const res4b = await fetch(`${BASE_URL}/chat/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ question: "What is my name", history: historyMem })
    });
    console.log(`Latency: ${(Date.now() - t0)/1000}s`);
    const ans4b = (await res4b.json()).answer;
    console.log(`Response: ${ans4b}`);
    if (ans4b.toLowerCase().includes("abhinav")) {
      console.log("RESULT: MEMORY SUCCESS (Correctly recalled 'Abhinav')");
    } else {
      console.log("RESULT: MEMORY FAILED");
    }

    // Test Case 5: Streaming test
    console.log("\n--- Test 5: Streaming response (Explain java roadmaps) ---");
    t0 = Date.now();
    const resStream = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ question: "Explain java roadmaps", history: [] })
    });
    console.log(`Stream connect latency: ${(Date.now() - t0)/1000}s`);
    if (!resStream.ok) {
      console.error(`FAILED: ${resStream.status}`);
      return;
    }

    console.log("Chunks received:");
    const reader = resStream.body.getReader();
    const decoder = new TextDecoder();
    let streamText = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const val = line.slice(5).trim();
          streamText += val;
          process.stdout.write(val);
        }
      }
    }
    console.log("\n--- Stream finished ---");

    console.log("\n=========================================");
    console.log("E2E TESTS COMPLETED SUCCESSFULLY");
    console.log("=========================================");

  } catch (error) {
    console.error("Test execution failed with error:", error);
  }
}

runTests();
