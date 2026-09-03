import urllib.request
import json

url_base = "http://localhost:8080/api/v1/admin"
login_payload = json.dumps({"email": "founders.brainsynclabs@gmail.com", "password": "admin123"}).encode('utf-8')

req = urllib.request.Request(f"{url_base}/auth/login", data=login_payload, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

token = data["token"]

endpoints = [
    "/dashboard",
    "/credits",
    "/api-usage",
    "/resumes",
    "/interviews",
    "/system-health"
]

for ep in endpoints:
    req = urllib.request.Request(f"{url_base}{ep}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req) as res:
        res_body = res.read().decode('utf-8')
        print(f"=== {ep} ===")
        print(json.dumps(json.loads(res_body), indent=2))
