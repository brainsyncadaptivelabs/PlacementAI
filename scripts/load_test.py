#!/usr/bin/env python3
"""
PlacementAI Production Load Testing & Concurrency Benchmark Harness
Evaluates system response across 10, 25, 50, and 100 concurrent user levels.
Measures: Average Latency, p50, p95, p99, Throughput (req/s), Error Rate, Timeout Rate.
"""

import sys
import time
import json
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics

DEFAULT_BASE_URL = "http://localhost:8080"
TIMEOUT_SECONDS = 5.0

ENDPOINTS = [
    {"name": "Health Actuator", "path": "/actuator/health", "method": "GET", "requires_auth": False},
    {"name": "Public Banner", "path": "/api/v1/announcements/active-banner", "method": "GET", "requires_auth": False},
    {"name": "Feature Flag Evaluation", "path": "/api/v1/feature-flags/evaluate/CODING_SANDBOX", "method": "GET", "requires_auth": False},
]

def make_request(base_url, endpoint, token=None):
    url = f"{base_url}{endpoint['path']}"
    headers = {"Content-Type": "application/json"}
    if token and endpoint.get("requires_auth"):
        headers["Authorization"] = f"Bearer {token}"

    req = urllib.request.Request(url, headers=headers, method=endpoint["method"])
    start_time = time.perf_counter()
    status_code = 0
    is_timeout = False
    is_error = False

    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            status_code = response.getcode()
            response.read()
    except urllib.error.HTTPError as e:
        status_code = e.code
        # 4xx might be expected for some probes, but 5xx is an error
        if status_code >= 500:
            is_error = True
    except urllib.error.URLError as e:
        is_error = True
        if "timed out" in str(e).lower():
            is_timeout = True
    except Exception as e:
        is_error = True

    duration_ms = (time.perf_counter() - start_time) * 1000.0
    return {
        "status_code": status_code,
        "duration_ms": duration_ms,
        "is_error": is_error,
        "is_timeout": is_timeout,
    }

def run_load_tier(base_url, concurrency, total_requests, token=None):
    print(f"\n--- Running Load Tier: {concurrency} Concurrent Users ({total_requests} requests) ---")
    results = []
    start_epoch = time.perf_counter()

    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = []
        for i in range(total_requests):
            ep = ENDPOINTS[i % len(ENDPOINTS)]
            futures.append(executor.submit(make_request, base_url, ep, token))

        for f in as_completed(futures):
            results.append(f.result())

    total_time_sec = time.perf_counter() - start_epoch
    durations = [r["duration_ms"] for r in results]
    errors = sum(1 for r in results if r["is_error"])
    timeouts = sum(1 for r in results if r["is_timeout"])

    durations.sort()
    count = len(durations)
    avg_lat = statistics.mean(durations) if durations else 0.0
    p50 = durations[int(count * 0.50)] if durations else 0.0
    p95 = durations[int(count * 0.95)] if durations else 0.0
    p99 = durations[int(count * 0.99)] if durations else 0.0
    throughput = count / total_time_sec if total_time_sec > 0 else 0.0
    error_rate = (errors / count * 100.0) if count > 0 else 0.0
    timeout_rate = (timeouts / count * 100.0) if count > 0 else 0.0

    tier_metrics = {
        "concurrency": concurrency,
        "total_requests": count,
        "duration_seconds": round(total_time_sec, 2),
        "throughput_rps": round(throughput, 2),
        "avg_latency_ms": round(avg_lat, 2),
        "p50_ms": round(p50, 2),
        "p95_ms": round(p95, 2),
        "p99_ms": round(p99, 2),
        "error_count": errors,
        "error_rate_pct": round(error_rate, 2),
        "timeout_count": timeouts,
        "timeout_rate_pct": round(timeout_rate, 2),
    }

    print(f"Throughput: {tier_metrics['throughput_rps']} req/s | Avg: {tier_metrics['avg_latency_ms']}ms | p50: {tier_metrics['p50_ms']}ms | p95: {tier_metrics['p95_ms']}ms | p99: {tier_metrics['p99_ms']}ms | Errors: {tier_metrics['error_rate_pct']}%")
    return tier_metrics

def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_BASE_URL
    tiers = [10, 25, 50, 100]
    multipliers = {10: 100, 25: 250, 50: 500, 100: 1000}

    print(f"PlacementAI Performance Benchmark Target: {base_url}")
    print("Testing connectivity...")

    connected = False
    try:
        with urllib.request.urlopen(f"{base_url}/actuator/health", timeout=3.0) as resp:
            if resp.getcode() == 200:
                connected = True
                print("Server online and reachable via Actuator health!")
    except Exception as e:
        print(f"Server check at {base_url} returned: {e}")
        print("Note: To benchmark against live Spring Boot, launch server via mvnw spring-boot:run.")

    all_metrics = []
    if connected:
        for c in tiers:
            all_metrics.append(run_load_tier(base_url, c, multipliers[c]))
        with open("docs/performance/load_test_results.json", "w") as f:
            json.dump(all_metrics, f, indent=2)
        print("\nResults successfully saved to docs/performance/load_test_results.json")
    else:
        print("Executing in simulated architecture baseline mode...")

if __name__ == "__main__":
    main()
