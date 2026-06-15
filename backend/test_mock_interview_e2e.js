const { execSync } = require('child_process');

const BASE_URL = "http://localhost:8080/api/v1";
const MYSQL_PATH = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe"`;

function runSql(query) {
  try {
    const cmd = `${MYSQL_PATH} -u root -proot -D placementai -e "${query}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output;
  } catch (e) {
    console.error(`SQL error: ${e.message}`);
    return null;
  }
}

async function testMockInterview() {
  console.log("=========================================");
  console.log("STARTING E2E MOCK INTERVIEW VALIDATION (NODE)");
  console.log("=========================================");

  // 1. Signup / Login
  const email = `test_interview_${Date.now()}@example.com`;
  const signupPayload = {
    fullName: "Test User",
    email: email,
    password: "password123",
    role: "STUDENT",
    collegeName: "Government Engineering College",
    branch: "Computer Science"
  };

  console.log(`Registering user: ${email}...`);
  let response = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signupPayload)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Signup failed: ${response.status} - ${text}`);
    return false;
  }

  const tokenData = await response.json();
  const token = tokenData.accessToken;
  console.log("Signup succeeded. Token acquired.");

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // 2. Generate Interview Questions
  console.log("\n--- Test 2: Generate Interview ---");
  const payload = {
    role: "Backend Engineer",
    experienceLevel: "Entry Level"
  };
  let t0 = Date.now();
  response = await fetch(`${BASE_URL}/interview/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  let tLatGen = (Date.now() - t0) / 1000;
  console.log(`Latency: ${tLatGen.toFixed(2)}s`);
  if (tLatGen > 3.0) {
    console.warn("WARNING: Generate Interview latency is >3 seconds!");
  }
  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED: ${response.status} - ${text}`);
    return false;
  }

  const genData = await response.json();
  console.log("Response Questions:", genData.questions);
  console.log("Response Tips:", genData.tips);
  if (!genData.questions || !genData.tips) {
    console.error("FAILED: Questions or Tips are empty");
    return false;
  }

  // 3. Save Interview Results
  console.log("\n--- Test 3: Save Interview Results (AI / Database check) ---");
  const savePayload = {
    role: "Backend Engineer",
    experienceLevel: "Entry Level",
    company: "Google",
    topic: "Spring Boot",
    transcript: "assistant: Explain Dependency Injection.\nuser: It is passing dependency object to helper class.\nassistant: What is MVC?\nuser: Model View Controller pattern.",
    questions: [
      {
        questionText: "Explain Dependency Injection.",
        answerText: "It is passing dependency object to helper class.",
        score: 85
      },
      {
        questionText: "What is MVC?",
        answerText: "Model View Controller pattern.",
        score: 90
      }
    ]
  };
  t0 = Date.now();
  response = await fetch(`${BASE_URL}/interview/save`, {
    method: 'POST',
    headers,
    body: JSON.stringify(savePayload)
  });
  let tLatSave = (Date.now() - t0) / 1000;
  console.log(`Latency: ${tLatSave.toFixed(2)}s`);
  if (tLatSave > 3.0) {
    console.warn("WARNING: Save/Feedback generation latency is >3 seconds!");
  }
  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED: ${response.status} - ${text}`);
    return false;
  }

  const saveData = await response.json();
  const interviewId = saveData.id;
  console.log(`Saved interview ID: ${interviewId}`);
  if (!interviewId) {
    console.error("FAILED: No interview ID returned");
    return false;
  }

  // 4. Fetch History
  console.log("\n--- Test 4: Fetch Interview History ---");
  t0 = Date.now();
  response = await fetch(`${BASE_URL}/interview/history`, {
    method: 'GET',
    headers
  });
  let tLatHist = (Date.now() - t0) / 1000;
  console.log(`Latency: ${tLatHist.toFixed(2)}s`);
  if (tLatHist > 3.0) {
    console.warn("WARNING: History Load latency is >3 seconds!");
  }
  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED: ${response.status} - ${text}`);
    return false;
  }
  const history = await response.json();
  console.log(`History contains ${history.length} entries.`);
  if (history.length === 0) {
    console.error("FAILED: History is empty");
    return false;
  }

  // 5. Fetch by ID
  console.log("\n--- Test 5: Fetch Interview by ID ---");
  t0 = Date.now();
  response = await fetch(`${BASE_URL}/interview/${interviewId}`, {
    method: 'GET',
    headers
  });
  let tLatId = (Date.now() - t0) / 1000;
  console.log(`Latency: ${tLatId.toFixed(2)}s`);
  if (tLatId > 3.0) {
    console.warn("WARNING: Fetch by ID latency is >3 seconds!");
  }
  if (!response.ok) {
    const text = await response.text();
    console.error(`FAILED: ${response.status} - ${text}`);
    return false;
  }
  const fetched = await response.json();
  console.log(`Fetched Role: ${fetched.role}`);
  console.log(`Fetched Feedback Assessment: ${fetched.feedback?.finalAssessment}`);
  console.log(`Fetched Feedback Total Score: ${fetched.feedback?.totalScore}`);

  // 6. Database Verification
  console.log("\n--- Test 6: Database Direct SQL Checks ---");
  
  console.log("Checking mock_interviews table...");
  let res = runSql(`SELECT id, role, user_id FROM mock_interviews WHERE id = ${interviewId}`);
  console.log(res);
  if (!res || !res.includes(String(interviewId))) {
    console.error("FAILED: Database row not found in mock_interviews");
    return false;
  }
      
  console.log("Checking interview_questions table...");
  let resQ = runSql(`SELECT id, question_text, answer_text FROM interview_questions WHERE mock_interview_id = ${interviewId}`);
  console.log(resQ);
  if (!resQ || !resQ.includes("Explain Dependency Injection")) {
    console.error("FAILED: Database row not found in interview_questions");
    return false;
  }

  // Insert sample row directly via SQL, read it, then delete it
  console.log("\nInserting sample test row directly via SQL...");
  const userRes = runSql(`SELECT id FROM users WHERE email = '${email}'`);
  const userLines = userRes.trim().split("\n");
  let userId = "1";
  if (userLines.length > 1) {
    userId = userLines[1].trim();
  }
  
  const sqlOutput = runSql(`INSERT INTO mock_interviews (role, experience_level, company, topic, user_id, created_at) VALUES ('Direct SQL Test', 'Senior', 'Direct Corp', 'SQL', ${userId}, NOW()); SELECT LAST_INSERT_ID();`);
  const sqlLines = sqlOutput.trim().split("\n");
  const directId = sqlLines[sqlLines.length - 1].trim();
  console.log(`Direct SQL Inserted ID: ${directId}`);
  
  // Read the direct SQL row
  const readRes = runSql(`SELECT id, role FROM mock_interviews WHERE id = ${directId}`);
  console.log(`Read row results:\n${readRes}`);
  if (!readRes || !readRes.includes("Direct SQL Test")) {
    console.error("FAILED: Read directly inserted row failed");
    return false;
  }

  // Delete directly inserted row
  runSql(`DELETE FROM mock_interviews WHERE id = ${directId}`);
  console.log("Deleted directly inserted row.");
  
  // Read again to ensure deleted
  const readDeleted = runSql(`SELECT id, role FROM mock_interviews WHERE id = ${directId}`);
  if (readDeleted && readDeleted.includes("Direct SQL Test")) {
    console.error("FAILED: Row was not deleted successfully");
    return false;
  }
      
  console.log("Direct SQL check passed!");

  console.log("\n=========================================");
  console.log("E2E MOCK INTERVIEW TESTS COMPLETED SUCCESSFULLY");
  console.log("=========================================");
  
  return {
    tLatGen,
    tLatSave,
    tLatHist,
    tLatId
  };
}

testMockInterview().then(res => {
  if (res) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch(err => {
  console.error("Unhandled execution error:", err);
  process.exit(1);
});
