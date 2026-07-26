import urllib.request
import urllib.parse
import json
import uuid
import sys

email = f"test_{uuid.uuid4().hex[:8]}@example.com"
register_data = json.dumps({
    "fullName": "Test User",
    "email": email,
    "password": "password123",
    "confirmPassword": "password123",
    "role": "STUDENT",
    "phone": "1234567890",
    "collegeName": "Test College",
    "branch": "CS",
    "graduationYear": 2024
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8080/api/v1/auth/signup", data=register_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        print("Signup:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Signup failed:", e.read().decode())
    sys.exit(1)

login_data = json.dumps({
    "email": email,
    "password": "password123"
}).encode('utf-8')

req = urllib.request.Request("http://localhost:8080/api/v1/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as res:
        login_res = json.loads(res.read().decode())
        token = login_res.get('token')
except urllib.error.HTTPError as e:
    print("Login failed:", e.read().decode())
    sys.exit(1)

# Upload using curl since multipart/form-data is hard in urllib
import subprocess
print(f"Token: {token}")
with open("dummy.png", "wb") as f:
    f.write(b"dummy")

result = subprocess.run([
    "curl", "-s", "-X", "POST", "http://localhost:8080/api/v1/profile/upload-image",
    "-H", f"Authorization: Bearer {token}",
    "-F", "file=@dummy.png",
    "-w", "\n%{http_code}\n"
], capture_output=True, text=True)

print("Upload result:")
print(result.stdout)
