import urllib.request
import urllib.error
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

with open("scripts/tokens.json") as f:
    token = json.load(f)["student"]

url = "http://localhost:8080/api/v1/custom-plans/reserve/ATS_ANALYSIS"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
data = json.dumps({"amount": 1.0, "ttlSeconds": 120}).encode("utf-8")

def attempt_reserve(i):
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5.0) as resp:
            body = json.loads(resp.read().decode())
            return {"index": i, "status": resp.getcode(), "body": body}
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode())
        return {"index": i, "status": e.code, "body": body}
    except Exception as e:
        return {"index": i, "status": 500, "error": str(e)}

print("Launching 50 concurrent HTTP entitlement reservation requests...")
results = []
with ThreadPoolExecutor(max_workers=50) as executor:
    futures = [executor.submit(attempt_reserve, i) for i in range(50)]
    for f in as_completed(futures):
        results.append(f.result())

successes = [r for r in results if r.get("status") == 200]
failures = [r for r in results if r.get("status") == 400]
server_errors = [r for r in results if r.get("status") >= 500]

print(f"Total Requests: {len(results)}")
print(f"Successful Reservations (200 OK): {len(successes)}")
print(f"Expected Failures (400 Limit Exceeded): {len(failures)}")
print(f"Server Errors (5xx): {len(server_errors)}")

if successes:
    res_ids = [s["body"]["reservationId"] for s in successes]
    print(f"Unique Reservation IDs: {len(set(res_ids))} / {len(res_ids)}")
    print("Reservation IDs:", res_ids)

# Check wallet to verify consistent state
wallet_req = urllib.request.Request("http://localhost:8080/api/v1/custom-plans/wallet", headers={"Authorization": f"Bearer {token}"})
with urllib.request.urlopen(wallet_req) as resp:
    wallet = json.loads(resp.read().decode())
    print("Wallet state after concurrent reservations:", json.dumps(wallet, indent=2))
