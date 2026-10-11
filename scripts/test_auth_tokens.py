import urllib.request
import json
import base64

def get_google_user(email, sub, name, role):
    header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').decode().rstrip('=')
    payload_dict = {"email": email, "sub": sub, "name": name}
    payload = base64.urlsafe_b64encode(json.dumps(payload_dict).encode()).decode().rstrip('=')
    mock_jwt = f"{header}.{payload}.sig"
    data = json.dumps({"idToken": mock_jwt, "role": role, "provider": "google"}).encode("utf-8")
    req = urllib.request.Request("http://localhost:8080/api/v1/auth/google", data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        return res.get("accessToken", res.get("token", ""))

def get_admin_token():
    req = urllib.request.Request(
        "http://localhost:8080/api/v1/admin/auth/login",
        data=json.dumps({"email": "admin@placementai.com", "password": "admin123"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())["token"]

tokens = {
    "student": get_google_user("student_loadtest@placementai.com", "11111111-1111-1111-1111-111111111111", "Student Load Tester", "STUDENT"),
    "recruiter": get_google_user("recruiter_loadtest@placementai.com", "22222222-2222-2222-2222-222222222222", "Recruiter Load Tester", "RECRUITER"),
    "admin": get_admin_token()
}

with open("scripts/tokens.json", "w") as f:
    json.dump(tokens, f, indent=2)

print("Generated tokens successfully:")
for k in tokens:
    print(f"  {k}: {tokens[k][:25]}...")
