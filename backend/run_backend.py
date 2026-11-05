import os
import socket
import subprocess
import sys
from urllib.parse import urlparse

# Determine workspace paths
script_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(script_dir, ".."))

env = os.environ.copy()

# Set JAVA_HOME correctly on Windows
if os.name == "nt":
    candidates = [
        r"C:\PROGRA~1\Java\jdk-17.0.19",
        r"C:\Program Files\Java\jdk-17.0.19",
    ]
    for cand in candidates:
        if os.path.exists(cand):
            env["JAVA_HOME"] = cand
            break
    if "JAVA_HOME" in env and env["JAVA_HOME"].endswith(r"\bin"):
        env["JAVA_HOME"] = env["JAVA_HOME"][:-4]

# Read .env files
for env_file in [os.path.join(root_dir, ".env"), os.path.join(script_dir, ".env")]:
    if os.path.exists(env_file):
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("\"'")
                env[k] = v

# Ensure datasource and dev defaults are configured
ds_url = env.get("SPRING_DATASOURCE_URL") or env.get("DB_URL", "jdbc:postgresql://localhost:5432/postgres")

# If pointing to a remote host (e.g. Supabase), verify DNS resolution; fallback to local if unreachable
if "supabase.co" in ds_url or "://" in ds_url:
    try:
        # Extract host from jdbc:postgresql://<host>:<port>/<db>
        host_part = ds_url.split("://")[-1].split("/")[0].split(":")[0]
        if host_part and host_part not in ("localhost", "127.0.0.1"):
            socket.gethostbyname(host_part)
    except Exception:
        print(f"[run_backend] Remote database host '{host_part}' could not be resolved. Falling back to local PostgreSQL (localhost:5432)...")
        ds_url = "jdbc:postgresql://localhost:5432/placementai"

env["SPRING_DATASOURCE_URL"] = ds_url

if not env.get("SPRING_DATASOURCE_USERNAME"):
    env["SPRING_DATASOURCE_USERNAME"] = env.get("DB_USERNAME", "postgres")
if not env.get("SPRING_DATASOURCE_PASSWORD"):
    env["SPRING_DATASOURCE_PASSWORD"] = env.get("DB_PASSWORD", "BrainSyncAdaptiveLabs")

if not env.get("SPRING_DATA_REDIS_HOST"):
    env["SPRING_DATA_REDIS_HOST"] = env.get("REDIS_HOST", "localhost")
if not env.get("SPRING_DATA_REDIS_PORT"):
    env["SPRING_DATA_REDIS_PORT"] = env.get("REDIS_PORT", "6379")

if not env.get("JUDGE0_API_URL"):
    env["JUDGE0_API_URL"] = "http://localhost:2358"
if not env.get("STORAGE_PROVIDER"):
    env["STORAGE_PROVIDER"] = "local"
if not env.get("LOCAL_STORAGE_DIR"):
    env["LOCAL_STORAGE_DIR"] = os.path.join(root_dir, "storage", "uploads")

# Launch Spring Boot with Maven Wrapper
if os.name == "nt":
    mvnw = os.path.join(script_dir, "mvnw.cmd")
    cmd = [mvnw, "spring-boot:run"]
else:
    mvnw = os.path.join(script_dir, "mvnw")
    cmd = [mvnw, "spring-boot:run"]

print(f"[run_backend] Starting Spring Boot Backend...")
print(f"[run_backend] Datasource: {env.get('SPRING_DATASOURCE_URL')}")
print(f"[run_backend] Redis: {env.get('SPRING_DATA_REDIS_HOST')}:{env.get('SPRING_DATA_REDIS_PORT')}")
print(f"[run_backend] Judge0: {env.get('JUDGE0_API_URL')}")

sys.exit(subprocess.run(cmd, cwd=script_dir, env=env).returncode)
