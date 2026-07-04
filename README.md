# 🚀 PlacementAI

AI-Powered Placement Preparation & ATS Optimization Platform

---

# 🚀 Project Overview

PlacementAI is an AI-powered platform designed to help students improve placement preparation through ATS resume analysis, OCR-based resume scanning, AI career guidance, job description matching, and secure cloud-based infrastructure.

The project is structured as a Monorepo containing both the Backend and Frontend.

---

# 🚀 Tech Stack

## 🖥️ Backend Technologies (Spring Boot)
- Java 17, Spring Boot 3, Maven
- MySQL, Hibernate, Spring Data JPA
- Spring Security, JWT, Refresh Tokens
- Tesseract OCR, Ollama (AI/LLM)
- Cloudinary (Storage), Redis (Caching)

## 🎨 Frontend Technologies (Next.js)
- Next.js 15 (App Router), TypeScript
- Tailwind CSS, Shadcn UI
- Framer Motion, Lucide React
- Axios, Zustand (State Management)

---

# 🚀 Getting Started

## 🐳 Running with Docker Compose (Recommended)

To run the entire stack (Backend, Frontend, and MySQL) in one command:

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Database:** MySQL on port 3307

---

## 🛠️ Manual Setup

### Backend
1. Navigate to `backend/`
2. Configure `application.properties`
3. Run with Maven: `./mvnw spring-boot:run`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`

---

# 🚀 Features

## 🔐 Security Stack

- Spring Security
- JWT Authentication
- Refresh Tokens
- BCrypt Password Encryption
- Role-Based Access Control
- API Versioning

---

## 🗄️ Database Stack

- MySQL
- Hibernate
- Spring Data JPA

---

## 🤖 AI & NLP Stack

- ATS Resume Analysis
- OCR (Tesseract OCR)
- AI Chatbot
- NLP Processing
- Skill Gap Analysis
- Job Description Matching

---

## ☁️ Cloud & Storage

- Cloudinary
- Multipart File Upload

---

## ⚡ Performance & Scalability

- Redis Caching
- Rate Limiting
- Logging System
- Global Exception Handling

---

## 🐳 DevOps Stack

- Docker
- Docker Compose
- GitHub Actions
- Kubernetes YAML Configurations
- Git
- GitHub

---

## 📄 API Documentation

- Swagger/OpenAPI
- Postman

---

# 🚀 Features

---

## 👤 Authentication System

- User Signup
- User Login
- JWT Authentication
- Refresh Tokens
- Role-Based Authorization
- Secure Password Encryption

---

## 📄 Resume Features

- Resume Upload
- ATS Score Analysis
- OCR Resume Scanner
- Resume Suggestions
- Resume Text Extraction

---

## 🤖 AI Features

- AI Chatbot
- Career Guidance
- Skill Gap Analysis
- Job Description Matching
- AI Career Roadmap

---

## ☁️ Cloud Features

- Cloudinary File Upload
- Secure Resume Storage
- Profile Image Storage

---

## ⚡ Backend Infrastructure

- REST APIs
- API Versioning
- Logging Filters
- Exception Handling
- Validation
- Redis Caching
- Rate Limiting

---

## 🐳 DevOps Features

- Dockerized Backend
- CI/CD Pipeline
- Kubernetes Configurations
- GitHub Actions Automation

---

# 🚀 Project Architecture

```text
Frontend (Vercel)
        ↓
Spring Boot Backend APIs
        ↓
AI Processing Layer
        ↓
MySQL Database
        ↓
Redis Cache
        ↓
Cloudinary Storage
```

---

# 🚀 First Time Developer/Admin Setup Guide

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/brainsyncadpativelabs/PlacementAI.git
```

---

## 2️⃣ Open Project

Open the project in:

```text
IntelliJ IDEA
```

---

## 3️⃣ Install Required Software

| Software | Purpose |
|---|---|
| Java 17 | Run Spring Boot |
| Maven | Dependency Management |
| MySQL | Database |
| Docker Desktop | Containers |
| Redis | Caching |
| Git | Version Control |

---

## 4️⃣ Configure Database

Create MySQL database:

```sql
CREATE DATABASE placement_ai;
```

---

## 5️⃣ Configure Environment Variables

Create the necessary `.env` files using the provided templates:

### Backend
Copy `backend/.env.example` to `backend/.env` and add your configuration:

```properties
GOOGLE_CLIENT_ID=your_google_client_id
ADMIN_REGISTRATION_CODE=ADMIN123
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend
Copy `frontend/.env.example` to `frontend/.env.local` and add your configuration:

```properties
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## 6️⃣ Start Redis

```bash
docker run -d -p 6379:6379 redis
```

---

## 7️⃣ Run Spring Boot Application

```bash
mvn spring-boot:run
```

OR run:

```text
BackendApplication.java
```

---

## 8️⃣ Verify Backend

Open Swagger UI:

```text
http://localhost:8080/swagger-ui/index.html
```

If Swagger opens successfully, backend setup is complete.

---

# 🚀 User Flow

```text
Signup
↓
Login
↓
Upload Resume
↓
OCR/Text Extraction
↓
ATS Analysis
↓
AI Suggestions
↓
Career Guidance
↓
Job Description Matching
```

---

# 🚀 JWT Authentication Flow

```text
User Login
↓
JWT Token Generated
↓
Authorization Header Used
↓
Protected APIs Accessed
```

Example:

```http
Authorization: Bearer eyJhbGciOi...
```

---

# 🚀 OCR Resume Scanner Flow

```text
Image Upload
↓
Tesseract OCR
↓
Extracted Resume Text
↓
ATS Analysis
```

---

# 🚀 Redis Usage

Redis is used for:

- Faster API responses
- Frequently accessed data caching
- Reduced database load
- Better scalability

---

# 🚀 Docker Usage

Docker is used for:

- Backend containerization
- Consistent environments
- Easy deployment
- Dependency isolation

---

# 🚀 GitHub Actions CI/CD

Whenever code is pushed:

```text
GitHub Push
↓
Automatic Build
↓
Dependency Installation
↓
Project Validation
↓
CI/CD Success
```

---

# 🚀 Cloudinary Usage

Cloudinary stores:

- Resume files
- Profile images
- Uploaded documents

Benefits:

- Cloud storage
- Fast media access
- Scalable file management

---

# 🚀 Rate Limiting

Rate limiting prevents:

- API abuse
- Excessive AI requests
- Spam traffic

Example:

```text
5 chatbot requests per minute
```

---

# 🚀 Future Deployment Architecture

```text
Frontend → Vercel
Backend → Render / Railway
Database → Railway MySQL / Neon
Cache → Redis
Media Storage → Cloudinary
```

---

# 🚀 Why PlacementAI Is Unique

Unlike normal CRUD-based student projects, PlacementAI includes:

- AI Integration
- OCR Resume Processing
- JWT Security
- Redis Caching
- Docker
- Kubernetes Configurations
- CI/CD Pipelines
- Cloud Integrations
- AI Chatbot
- ATS Resume Analysis
- Job Description Matching
- Career Guidance System

This makes the project similar to a startup-grade SaaS backend architecture.

---

# 🚀 Current Project Status

| Phase | Status |
|---|---|
| Phase 1 — Backend Infrastructure | ✅ Completed |
| Phase 2 — Frontend Development & AI Widgets | ✅ Completed / Stabilized |
| Phase 3 — Advanced AI Features & Optimizations | 🚀 Highly Optimized & Production Ready |

---

# 🚀 Recent Stability & Performance Improvements

- **⚡ Docker BuildKit Dependency Caching:** Integrated BuildKit cache mounts (`--mount=type=cache,target=/root/.m2`) in the `backend/Dockerfile`. Subsequent Maven builds run near-instantly since dependencies are cached on the host.
- **🛡️ Null-Safety Compliance:** Fixed Eclipse JDT null-safety compiler warnings in the Java backend (`NvidiaBuildClient`) by migrating `HttpStatusCode` method references to type-inferred lambdas.
- **🔌 Robust API Parsers:** Enhanced the frontend `api.ts` module with safe JSON parsing capabilities. Plain-text API responses (e.g., extracted raw resume text) no longer throw JSON parsing exceptions.
- **💬 Chatbot Hydration Fixes:** Resolved a missing import for `ConversationSidebar` and casing resolution conflicts under the Next.js Turbopack resolver on macOS.

---

# 🚀 Future Enhancements

- AI Resume Builder
- AI Resume Rewrite
- AI Cover Letter Generator
- AI Mock Interviews
- Voice Interview Assistant
- AI Coding Evaluator
- Recruiter Dashboard
- Subscription System
- Mobile App APIs
- Microservices Architecture

---

# 🚀 Developed By

Brainsync Adaptive Labs
