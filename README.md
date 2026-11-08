# SENTINEL AI
### AI-Native Software Quality & Security Gate

**From code submission to evidence-based release decisions.**

SENTINEL AI is a software quality and security assessment platform designed to help development teams evaluate code, identify security risks, verify requirements, and make more reliable release decisions.

## Problem

Software quality checks are often fragmented across security scanners, specification reviews, dependency audits, and testing tools. Important findings can be overlooked when these checks are not connected to the final release decision.

## Solution

SENTINEL AI brings security analysis, specification checks, verification results, and release policies together in one platform.

It evaluates available evidence and produces release decisions such as:

- **BLOCK** — when critical security risks or failed checks prevent a safe release.
- **RETRY** — when verification is incomplete or recovery is appropriate.

The platform is designed to make release decisions more consistent, traceable, and evidence-based.

## Key Features

- Security and vulnerability analysis.
- Specification and requirement checks.
- Verification and release decision engine.
- Protected authentication and role-based access control.
- User and administrator dashboards.
- Analysis history and audit logs.
- Rate limiting and input validation.
- Recovery attempt limits.
- PDF report export.
- Platform maintenance and registration controls.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

## Project Structure

```text
SENTINEL-AI/
├── backend/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       ├── utils/
│       └── validators/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── utils/
├── intent.md
├── Final directive.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/nouhaila-bizane/SENTINEL-AI.git
cd SENTINEL-AI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a template and configure your environment variables.

### 3. Start the backend

```bash
npm run dev
```

### 4. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

## Security and Verification

The prototype has been tested for several security and reliability scenarios, including:

- Authentication and authorization.
- Role-based access control.
- Cross-user data isolation.
- Input validation and NoSQL injection attempts.
- Rate limiting.
- XSS handling.
- Audit logging.
- Release decision enforcement.

Backend and frontend production builds completed successfully, and dependency audits reported zero known vulnerabilities at the time of testing.

These results apply to the tested prototype and its dependencies; they do not constitute a guarantee that the entire application is vulnerability-free.

## Current Limitations

SENTINEL AI is a working prototype, not yet a fully autonomous software development system.

It does not currently guarantee automatic implementation of features, complete vulnerability remediation, or detection of every possible defect.

Its long-term direction is to evolve toward AI-assisted specification, implementation, testing, independent verification, and controlled release automation, while preserving human oversight for high-impact decisions.

## Project Documentation

- [`intent.md`](./intent.md) — Problem definition, engineering challenges, and proposed solution.
- [`Final directive.md`](./Final%20directive.md) — Engineering principles, release policies, verification evidence, and future direction.

---

**SENTINEL AI — Zero-Touch Release, Security First.**