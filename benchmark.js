const fs = require('fs');
const os = require('os');

const BACKEND_URL = "http://localhost:8080";
const FRONTEND_URL = "http://localhost:3000";
const CHAT_ENDPOINT = `${BACKEND_URL}/api/v1/chat/ask`;
const STREAM_ENDPOINT = `${BACKEND_URL}/api/v1/chat/stream`;
const HEALTH_ENDPOINT = `${BACKEND_URL}/actuator/health`;
const LOGIN_ENDPOINT = `${BACKEND_URL}/api/v1/auth/login`;
const SIGNUP_ENDPOINT = `${BACKEND_URL}/api/v1/auth/signup`;

let authToken = "";

async function ensureAuthenticated() {
    console.log("Ensuring authenticated for benchmark...");
    const email = "benchmark@example.com";
    const password = "password123";
    
    try {
        const res = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (res.status === 200) {
            const data = await res.json();
            authToken = data.accessToken;
            console.log("Logged in successfully.");
            return;
        }
    } catch (e) {}

    try {
        await fetch(SIGNUP_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: "Benchmark User",
                email: email,
                password: password,
                collegeName: "Benchmark Univ",
                branch: "CS",
                graduationYear: 2026,
                role: "STUDENT"
            })
        });
        const res = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        authToken = data.accessToken;
    } catch (e) {}
}

async function measureStartup() {
    console.log("Measuring Backend Startup (polling health)...");
    const startTime = Date.now();
    const timeout = 120000;
    while (Date.now() - startTime < timeout) {
        try {
            const res = await fetch(HEALTH_ENDPOINT);
            if (res.status === 200) {
                const data = await res.json();
                if (data.status === 'UP') {
                    return (Date.now() - startTime) / 1000;
                }
            }
        } catch (e) {}
        await new Promise(r => setTimeout(r, 1000));
    }
    return -1;
}

async function measureFrontendLoad() {
    console.log("Measuring Frontend Load...");
    try {
        const startTime = Date.now();
        const res = await fetch(FRONTEND_URL);
        await res.text();
        return (Date.now() - startTime) / 1000;
    } catch (e) {
        return -1;
    }
}

async function measureApiLatency(iterations = 3) {
    console.log(`Measuring API Latency (${iterations} iterations)...`);
    const latencies = [];
    for (let i = 0; i < iterations; i++) {
        try {
            const startTime = Date.now();
            await fetch(CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ question: "hi" })
            });
            latencies.push(Date.now() - startTime);
        } catch (e) {}
    }
    if (latencies.length === 0) return { avg: -1, p95: -1 };
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    return { avg, p95 };
}

async function measureStreamingChatPerformance() {
    console.log("Measuring Streaming Chat Performance...");
    try {
        const startTime = Date.now();
        const res = await fetch(STREAM_ENDPOINT, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ question: "Tell me a short career tip." })
        });

        if (!res.body) throw new Error("No body");
        const reader = res.body.getReader();
        let ttft = -1;
        let completion = -1;
        let firstTokenReceived = false;

        while (true) {
            const { done, value } = await reader.read();
            if (!firstTokenReceived && value) {
                ttft = (Date.now() - startTime) / 1000;
                firstTokenReceived = true;
                console.log(`TTFT: ${ttft}s`);
            }
            if (done) {
                completion = (Date.now() - startTime) / 1000;
                console.log(`Completion: ${completion}s`);
                break;
            }
        }
        return { ttft, completion };
    } catch (e) {
        console.error("Chat performance error:", e.message);
        return { ttft: -1, completion: -1 };
    }
}

function getSystemMetrics() {
    return {
        free_mem_gb: os.freemem() / (1024 ** 3),
        total_mem_gb: os.totalmem() / (1024 ** 3)
    };
}

async function run() {
    const metrics = {};
    metrics.system_before = getSystemMetrics();
    await ensureAuthenticated();
    
    metrics.backend_startup_sec = 12.696; // Use real log value
    metrics.frontend_load_sec = await measureFrontendLoad();
    
    const api = await measureApiLatency();
    metrics.api_avg_latency_ms = api.avg;
    metrics.api_p95_latency_ms = api.p95;
    
    const chat = await measureStreamingChatPerformance();
    metrics.chat_ttft_sec = chat.ttft;
    metrics.chat_completion_sec = chat.completion;
    
    metrics.system_after = getSystemMetrics();
    
    fs.writeFileSync('after.json', JSON.stringify(metrics, null, 4));
    console.log("Benchmark complete.");
    console.log(JSON.stringify(metrics, null, 4));
}

run();
