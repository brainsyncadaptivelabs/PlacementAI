#!/usr/bin/env bash
python3 -c "
import os, subprocess, sys
env = os.environ.copy()
for env_file in ['../.env', '.env']:
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('\"\'')
                env[k] = v

cmd = ['./mvnw', 'spring-boot:run']
sys.exit(subprocess.run(cmd, env=env).returncode)
"
