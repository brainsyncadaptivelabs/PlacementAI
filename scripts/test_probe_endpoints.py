import urllib.request
import json

with open("scripts/test_token.txt") as f:
    token = f.read().strip()

endpoints = [
    ("Public Banner", "/api/v1/announcements/active-banner", False),
    ("Feature Flag", "/api/v1/feature-flags/evaluate/CODING_SANDBOX", False),
    ("Profile Me", "/api/v1/profile/me", True),
    ("Payment Subscription Status", "/api/v1/payment/subscription-status", True),
    ("Coding POTD", "/api/v1/coding/program-of-day", True),
    ("Coding Streak", "/api/v1/coding/streak", True),
    ("Aptitude Data", "/api/v1/aptitude/data", True),
    ("Job Listings", "/api/v1/recruiters/jobs", True),
]

base_url = "http://localhost:8080"
for name, path, auth in endpoints:
    url = f"{base_url}{path}"
    headers = {"Content-Type": "application/json"}
    if auth:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[{resp.getcode()}] {name}: OK ({len(resp.read())} bytes)")
    except urllib.error.HTTPError as e:
        print(f"[{e.code}] {name}: Error - {e.read().decode()[:100]}")
    except Exception as e:
        print(f"[ERR] {name}: {e}")
