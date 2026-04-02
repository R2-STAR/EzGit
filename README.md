# EzGit— AI-Powered Code Intelligence

Understand any GitHub or GitLab repository instantly. Explain PRs, search code in plain English, scan for vulnerabilities, and onboard to new codebases in minutes.

## Features

- **PR Explainer** — AI summary, risk score 0-100, risky file highlights for any pull request
- **Code Search** — Natural language search over indexed codebases using pgvector
- **Security Scanner** — Async Semgrep + Snyk scan with AI-written security report
- **Onboarding** — Architecture overview, important directories, one-command local setup

## Tech Stack

| Layer       | Technology                                  |
|-------------|---------------------------------------------|
| Frontend    | React 18, TypeScript, Tailwind CSS, Vite    |
| Backend     | Python 3.11, FastAPI, Celery                |
| Database    | PostgreSQL 16 + pgvector extension          |
| Cache/Queue | Redis 7                                     |
| AI          | Gemini 2.0 Flash Lite + Gemini Embeddings   |
| Security    | Semgrep (SAST) + Snyk (CVE scanning)        |
| Source      | GitHub API + GitLab API                     |
| Infra       | Docker + Docker Compose                     |

## Screenshots

![Dashboard](docs/screenshots/Dashboard.jpeg)
![PR Explainer](docs/screenshots/PR-Explainer.jpeg)
![Code Search](docs/screenshots/CodeSearch.jpeg)
![Security Scanner](docs/screenshots/SecurityScanner.png)

## Getting Started

### Prerequisites

- Docker Desktop
- WSL2 (Ubuntu) on Windows
- Git

### Setup

Clone the repo:

    git clone https://github.com/R2-STAR/EzGit.git
    cd EzGit

Create your environment file:

    cp backend/.env.example backend/.env

Fill in your API keys in backend/.env:

    GITHUB_TOKEN=ghp_...
    GEMINI_API_KEY=AIza...
    SNYK_TOKEN=...

Start everything:

    make setup

Open your browser:

    Frontend  →  http://localhost:5173
    Backend   →  http://localhost:8000
    API Docs  →  http://localhost:8000/docs

## Daily Commands

    # Start
    docker compose up -d

    # Stop
    docker compose down

    # View logs
    make logs

    # Full reset
    make clean && make setup

## API Keys Required

| Key             | Where to get                                          |
|-----------------|-------------------------------------------------------|
| GITHUB_TOKEN    | github.com → Settings → Developer settings → PAT     |
| GEMINI_API_KEY  | aistudio.google.com                                   |
| SNYK_TOKEN      | app.snyk.io → Account settings                        |

## Project Structure

    EzGit/
    backend/
        app/
            api/        HTTP route handlers
            services/   Gemini, GitHub, GitLab, Semgrep, Snyk
            workers/    Celery async tasks
            db/         Postgres, Redis, pgvector
            models/     Pydantic schemas
    frontend/
        src/
            api/        Axios API calls
            hooks/      React Query hooks
            pages/      5 pages
            components/ Reusable UI components
