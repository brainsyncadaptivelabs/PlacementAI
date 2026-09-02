import urllib.request
import json

url_base = "http://localhost:8080/api/v1/admin"

# Test standard login
login_payload = json.dumps({"email": "founders.brainsynclabs@gmail.com", "password": "admin123"}).encode('utf-8')
req = urllib.request.Request(f"{url_base}/auth/login", data=login_payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

token = data["token"]
print("LOGIN OK. Response role:", data.get("role"))

endpoints = [
    "/dashboard",
    "/credits",
    "/api-usage",
    "/resumes",
    "/interviews",
    "/system-health"
]

print("\n--- Testing API endpoints with authenticated token ---")
all_ok = True
for ep in endpoints:
    req = urllib.request.Request(f"{url_base}{ep}", headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req) as res:
            print(f"GET {ep:16} => Status {res.status}")
    except urllib.error.HTTPError as e:
        print(f"GET {ep:16} => Status {e.code}")
        all_ok = False

if all_ok:
    print("\nALL 6 ENDPOINTS RETURNED HTTP 200 OK SUCCESS!")
else:
    print("\nSOME ENDPOINTS FAILED!")
