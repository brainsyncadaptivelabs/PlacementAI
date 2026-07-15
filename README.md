# 🚀 PlacementAI

AI-Powered Placement Preparation & ATS Optimization Platform.

---

## 🖥️ Architecture & Tech Stack

PlacementAI is built as a monorepo consisting of a high-performance Spring Boot API backend and a responsive Next.js frontend.

### Backend (Spring Boot)
* **Runtime**: Java 21, Spring Boot 3.3.5, Maven
* **Database**: PostgreSQL 15 (primary database + sandbox environment for secure code execution)
* **Security**: Spring Security, JWT (AccessToken / RefreshToken rotation)
* **Storage**: Supabase Storage (handles file uploads, resumes, and profile assets)
* **AI & NLP**: NVIDIA Build API / Gemini (LLM integrations), ElevenLabs (Text-to-Speech)
* **Caching**: Redis (caching dashboards, JD analysis, and stats)
* **Performance**: Java 21 Virtual Threads (`spring.threads.virtual.enabled: true`), G1 Garbage Collector

### Frontend (Next.js)
* **Framework**: Next.js 16.2.6 (App Router), React 19, TypeScript
* **Styling**: Tailwind CSS, Shadcn UI
* **Animations**: Framer Motion
* **State Management**: Zustand
* **API Client**: Axios with client-side token interceptors

---

## 🛠️ Getting Started

### 🐳 Running with Docker Compose (Recommended)
Spins up the database (PostgreSQL), cache (Redis), code runner (Judge0 CE), Java backend, and Node frontend using one command:

```bash
docker compose up --build
```

* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:8080`
* **PostgreSQL (Primary)**: Port `5432`
* **PostgreSQL (Sandbox)**: Port `5433`
* **Redis**: Port `6379`

### ⚙️ Environment Configuration
Configure credentials in your root `.env` file (copied from `.env.example`).
Key variables:
* `NVIDIA_API_KEY`: API credential for Nvidia Build LLM engine.
* `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Credentials for Supabase Object Storage.
* `JWT_SECRET`: 256-bit encryption key for signing tokens.
* `MAIL_USERNAME` & `MAIL_PASSWORD`: SMTP server configurations.

---

## 🌟 Features

* **AI Resume Copilot & Wizard**: Upload a job description (automatically parsed from PDF, DOCX, or TXT) to generate a tailored blueprint and build matching resumes.
* **ATS Resume Analysis**: Parses uploaded resumes, analyzes missing keywords, assigns scoring metrics, and provides concrete improvement action items.
* **Side-by-Side Resume Comparison**: Load two different resumes from your library to compare their relative ATS scores, strengths, and weaknesses side-by-side.
* **Interactive AI Chatbot**: Chat with an AI mentor for placement guidance, roadmaps, and career advice.
* **Adaptive Mock Interviews**: Runs mock voice and technical sessions powered by Gemini and ElevenLabs speech generation.
* **Recruiter & Placement Officer Portals**: Provides dashboards for company creation, candidate shortlist evaluations, and branch-wise stats.

---

## ⚡ Recent Improvements
* **Dynamic Parsers & Comparers**: Replaced all frontend/backend simulated data and timeout mocks with fully functional database lookups and text parsing APIs.
* **Clean Code & Cleanup**: Deleted legacy unused handbooks, static reports, and mock data seeder sql queries to optimize database startup.
* **Virtual Threads enabled**: Enhanced backend request throughput with Java 21 virtual threads support.
