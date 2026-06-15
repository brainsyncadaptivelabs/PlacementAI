import time
import requests
import json
import subprocess
import os
import psutil
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8080"
FRONTEND_URL = "http://localhost:3000"
CHAT_ENDPOINT = f"{BACKEND_URL}/api/v1/chat/ask"
HEALTH_ENDPOINT = f"{BACKEND_URL}/actuator/health"
API_TEST_ENDPOINT = f"{BACKEND_URL}/api/v1/chat/ask" # Using chat as a proxy for API for now

def get_docker_stats():
    try:
        result = subprocess.run(['docker', 'stats', '--no-stream', '--format', 'json'], capture_output=True, text=True)
        stats = []
        for line in result.stdout.splitlines():
            stats.append(json.loads(line))
        return stats
    except Exception as e:
        print(f"Error getting docker stats: {e}")
        return []

def measure_startup():
    print("Measuring Backend Startup...")
    start_time = time.time()
    timeout = 120
    elapsed = 0
    while elapsed < timeout:
        try:
            response = requests.get(HEALTH_ENDPOINT, timeout=1)
            if response.status_code == 200 and response.json().get('status') == 'UP':
                return time.time() - start_time
        except:
            pass
        time.sleep(1)
        elapsed = time.time() - start_time
    return -1

def measure_frontend_load():
    print("Measuring Frontend Load...")
    try:
        start_time = time.time()
        response = requests.get(FRONTEND_URL, timeout=10)
        return time.time() - start_time
    except Exception as e:
        print(f"Frontend load error: {e}")
        return -1

def measure_api_latency(iterations=10):
    print(f"Measuring API Latency ({iterations} iterations)...")
    latencies = []
    for _ in range(iterations):
        try:
            start_time = time.time()
            # Note: This might require auth depending on the endpoint. 
            # For baseline, we'll try a simple hit if possible or use a known public one.
            # Using a dummy payload for chat ask (might return 401/403 but still measures latency)
            requests.post(CHAT_ENDPOINT, json={"question": "hi"}, timeout=10)
            latencies.append((time.time() - start_time) * 1000)
        except:
            pass
    if not latencies: return -1, -1
    avg = sum(latencies) / len(latencies)
    latencies.sort()
    p95 = latencies[int(len(latencies) * 0.95)]
    return avg, p95

def measure_chat_performance():
    print("Measuring Chat Performance...")
    # This requires a real request. We'll attempt a stream if possible or measure total time.
    # Current implementation is non-streaming, so TTFT == Total Time roughly.
    try:
        start_time = time.time()
        response = requests.post(CHAT_ENDPOINT, json={"question": "Tell me a short career tip."}, timeout=60)
        total_time = time.time() - start_time
        # In non-streaming, TTFT is basically when the response arrives.
        return total_time, total_time 
    except Exception as e:
        print(f"Chat performance error: {e}")
        return -1, -1

def get_system_metrics():
    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_gb": psutil.virtual_memory().used / (1024**3),
        "memory_total_gb": psutil.virtual_memory().total / (1024**3)
    }

def run_benchmark():
    metrics = {}
    
    # System before
    metrics["system_before"] = get_system_metrics()
    
    # Startup (assumes app is being started or already started)
    # If app is already up, we can't measure startup easily without restart.
    # We will assume this is run after a fresh 'docker compose up'
    metrics["backend_startup_sec"] = measure_startup()
    
    metrics["frontend_load_sec"] = measure_frontend_load()
    
    avg_lat, p95_lat = measure_api_latency()
    metrics["api_avg_latency_ms"] = avg_lat
    metrics["api_p95_latency_ms"] = p95_lat
    
    ttft, completion = measure_chat_performance()
    metrics["chat_ttft_sec"] = ttft
    metrics["chat_completion_sec"] = completion
    
    metrics["docker_stats"] = get_docker_stats()
    metrics["system_after"] = get_system_metrics()
    
    return metrics

if __name__ == "__main__":
    print("Starting Benchmark Phase 1...")
    results = run_benchmark()
    with open("before.json", "w") as f:
        json.dump(results, f, indent=4)
    print("Benchmark complete. Results saved to before.json")
    print(json.dumps(results, indent=4))
