# 🚀 PlacementAI — Local Development Guide

Welcome to the **PlacementAI Local Development Setup**. This document provides step-by-step instructions to run the entire PlacementAI stack locally on your computer with **zero external production dependencies**.

---

## 🏗️ Target Local Architecture

```text
                    YOUR PC
                       │
             ┌─────────┴─────────┐
             │                   │
       Next.js Frontend     Spring Boot Backend
       localhost:3000       localhost:8080
             │                   │
             └─────────┬─────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
       PostgreSQL     Redis       Judge0
     localhost:5432 localhost:6379 localhost:2358
          │
          └──────────────┐
                         │
                    Local Storage
                 ./storage/uploads
```

### Local URLs Summary

| Service | Local URL / Port |
| :--- | :--- |
| **PlacementAI Frontend** | `http://localhost:3000` |
| **Spring Boot Backend** | `http://localhost:8080` |
| **Backend API Base** | `http://localhost:8080/api/v1` |
| **PostgreSQL** | `localhost:5432` |
| **Redis** | `localhost:6379` |
| **Judge0 Code Execution** | `http://localhost:2358` |
| **Ollama (Local AI, optional)** | `http://localhost:11434` |
| **Local File Storage** | `./storage/uploads` (`http://localhost:8080/storage/files/*`) |

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js**: `v18.x` or higher (`node -v`)
- **npm**: `v9.x` or higher (`npm -v`)
- **Java JDK**: `17` or higher (`java -version`)
- **Docker & Docker Desktop**: Installed and running (`docker --version`)

---

## 🛠️ Step 1 — Start Infrastructure Services (Docker)

Launch PostgreSQL, Redis, and Judge0 in the background using Docker Compose from the project root:

```bash
docker compose up -d postgres redis judge0-server judge0-worker
```

### Verify Container Status

```bash
docker compose ps
```

You should see:
- `placement-postgres` running on port `5432`
- `placement-redis` running on port `6379`
- `placement-judge0-server` running on port `2358`
- `placement-judge0-worker` running

---

## 🟢 Step 2 — Start Spring Boot Backend

Open a terminal in the root or `backend` folder:

### Windows (PowerShell / CMD)
```cmd
cd backend
mvnw.cmd spring-boot:run
```

### Linux / macOS
```bash
cd backend
./mvnw spring-boot:run
```

The backend will start at:
```text
http://localhost:8080
```

### Health Check
Verify the backend is healthy by opening:
[http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 🟢 Step 3 — Start Next.js Frontend

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be available at:
[http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables Reference

### Root `.env`
```env
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080

DB_URL=jdbc:postgresql://localhost:5432/placementai
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=placementai

REDIS_HOST=localhost
REDIS_PORT=6379

JUDGE0_API_URL=http://localhost:2358
STORAGE_PROVIDER=local
LOCAL_STORAGE_DIR=./storage/uploads

RAZORPAY_KEY_ID=rzp_test_dummy_id
RAZORPAY_KEY_SECRET=dummy_secret
```

### Frontend `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/placementai
```

---

## 🤖 Optional Local AI Setup (Ollama)

If you want to use Ollama for local LLM inferences:

1. Install and start Ollama:
   ```bash
   ollama serve
   ```
2. Pull your preferred model:
   ```bash
   ollama run mistral
   ```
3. Set environment variable in `.env`:
   ```env
   NVIDIA_API_URL=http://localhost:11434/v1/chat/completions
   NVIDIA_MODEL=mistral
   ```

---

## 🔍 Troubleshooting

### 1. Database Connection Refused
- Ensure Docker container `placement-postgres` is running (`docker compose ps`).
- Check if port 5432 is occupied by another local PostgreSQL instance.

### 2. CORS Error in Browser
- The backend configuration in `SecurityConfig.java` allows `http://localhost:3000` by default.
- Verify `FRONTEND_URL=http://localhost:3000` in `.env`.

### 3. Resume Uploads Failing
- Files are saved locally to `./storage/uploads/`.
- Ensure directory permissions permit creating `./storage/uploads`.
