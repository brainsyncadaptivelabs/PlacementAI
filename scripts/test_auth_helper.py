import urllib.request
import json
import base64

header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').decode().rstrip('=')
payload = base64.urlsafe_b64encode(b'{"email":"student_loadtest@placementai.com","sub":"11111111-1111-1111-1111-111111111111","name":"Student Load Tester"}').decode().rstrip('=')
mock_jwt = f"{header}.{payload}.sig"

data = json.dumps({"idToken": mock_jwt, "role": "STUDENT", "provider": "google"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8080/api/v1/auth/google", data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as resp:
        print("Status:", resp.getcode())
        res = json.loads(resp.read().decode())
        print("Token keys:", list(res.keys()))
        token = res.get("accessToken", res.get("token", ""))
        print("Access Token:", token[:40])
        with open("scripts/test_token.txt", "w") as f:
            f.write(token)
except Exception as e:
    print("Error:", e)
