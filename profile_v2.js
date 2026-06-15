const fs = require('fs');
const os = require('os');
const { performance } = require('perf_hooks');

const BACKEND_URL = "http://localhost:8080";
const FRONTEND_URL = "http://localhost:3000";
const LOGIN_ENDPOINT = `${BACKEND_URL}/api/v1/auth/login`;

const endpoints = [
    { method: "GET", url: "/api/v1/dashboard/stats" },
    { method: "GET", url: "/api/v1/user/profile" },
    { method: "POST", url: "/api/v1/chat/ask", data: { question: "Tell me a long career tip." } },
    { method: "POST", url: "/api/v1/roadmap/generate", data: { careerGoal: "Java Developer" } },
    { method: "POST", url: "/api/v1/jd/match", data: { jobDescription: "Looking for a Senior Java Developer with Spring Boot and React experience." } }
];

let authToken = "";

async function getAuthToken() {
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
            return true;
        }
    } catch (e) {}
    return false;
}

async function profile() {
    if (!await getAuthToken()) {
        console.error("Auth failed, cannot profile.");
        return;
    }

    const results = [];
    for (const ep of endpoints) {
        console.log(`Profiling ${ep.method} ${ep.url}...`);
        const latencies = [];
        for (let i = 0; i < 3; i++) {
            const start = performance.now();
            try {
                const res = await fetch(`${BACKEND_URL}${ep.url}`, {
                    method: ep.method,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: ep.method === "POST" ? JSON.stringify(ep.data) : undefined,
                    signal: AbortSignal.timeout(60000)
                });
                await res.text();
                latencies.push(performance.now() - start);
            } catch (e) {
                console.error(`Error on ${ep.url}: ${e.message}`);
            }
        }
        if (latencies.length > 0) {
            results.push({
                url: ep.url,
                method: ep.method,
                avg_ms: latencies.reduce((a, b) => a + b, 0) / latencies.length,
                max_ms: Math.max(...latencies)
            });
        }
    }
    fs.writeFileSync('slow-endpoints.json', JSON.stringify(results, null, 4));
    console.log("Saved slow-endpoints.json");
}

profile();
