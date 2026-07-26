import requests
import json
import uuid

# 1. Register a user
email = f"test_{uuid.uuid4().hex[:8]}@example.com"
register_data = {
    "fullName": "Test User",
    "email": email,
    "password": "password123",
    "role": "STUDENT"
}
res = requests.post("http://localhost:8080/api/v1/auth/signup", json=register_data)
if res.status_code != 200:
    print("Signup failed:", res.text)
    exit(1)

# 2. Login to get token
login_data = {
    "email": email,
    "password": "password123"
}
res = requests.post("http://localhost:8080/api/v1/auth/login", json=login_data)
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)

token = res.json().get("token")

# 3. Upload file
headers = {
    "Authorization": f"Bearer {token}"
}
files = {
    "file": ("test.png", b"dummy content", "image/png")
}
res = requests.post("http://localhost:8080/api/v1/profile/upload-image", headers=headers, files=files)
print(f"Upload status: {res.status_code}")
print(f"Upload response: {res.text}")

