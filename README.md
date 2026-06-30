# AI-Driven Analytics Dashboard 🧠📊

A high-performance, responsive full-stack analytics platform that empowers users to query large-scale business datasets using natural language. Built with an **AI-Native BFF (Backend-for-Frontend)** architecture, this project seamlessly bridges cutting-edge data intelligence with cloud-native infrastructure.

---

## 🚀 Key Features

- **Generative AI Data Query (Text-to-SQL/JSON):** Leverages LLMs via LangChain to interpret natural language, dynamically query databases, and return structured telemetry.
- **Enterprise Cloud-Native Architecture:** Engineered for modern high-availability, featuring seamless multi-region scalability.
- **Robust Full-Stack TypeScript:** 100% end-to-end type safety, from database schemas via Prisma ORM to server actions and reactive frontend components.
- **Interactive UI/UX & Dynamic Viz:** A sleek dashboard interface incorporating fluid UI elements and real-time responsive charts.
- **Production-Grade Security & Guardrails:** Bulletproof security implemented via unified authentication middleware and OWASP-compliant API rate limiting.

---

## 🏗️ System Architecture

The application implements a decoupled, event-driven pattern designed for extreme scaling, security, and low latency:
```mermaid
graph TD
    Client[Client: React / Next.js 15] -->|Streaming / Server Actions| BFF[Next.js BFF Gateway]
    Auth[Auth.js: OAuth2 / JWT] -.->|Secure| BFF
    
    BFF -->|Prisma ORM| DB[(AWS RDS: PostgreSQL)]
    BFF -->|REST API| AICore[AI Core: FastAPI Python]
    
    AICore -->|LangChain| Bedrock[AWS Bedrock: Claude 3.5]

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style BFF fill:#bbf,stroke:#333,stroke-width:2px
    style DB fill:#f96,stroke:#333,stroke-width:2px
    style AICore fill:#bfb,stroke:#333,stroke-width:2px
    style Bedrock fill:#ffb,stroke:#333,stroke-width:2px
```


### Infrastructure Highlights (AWS SAP Compliant)
- **Containerization & Orchestration:** Packaged cleanly via multi-stage Docker builds, optimized for deployment on **AWS ECS (Fargate)** or Kubernetes.
- **Data Lifecycle:** Scaled to ingest batch telemetry hosted on **AWS S3**, parsed efficiently via robust data pipelines before structured sync.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| **BFF / API Gateway** | Next.js Server Components, Server Actions, Node.js, Auth.js (NextAuth) |
| **AI / Microservices** | Python 3.11, FastAPI, LangChain, OpenAI / AWS Bedrock (Claude 3.5 Sonnet) |
| **Data Layer** | PostgreSQL, Prisma ORM, AWS S3 |
| **DevOps / Cloud** | Docker, AWS ECS/Fargate, GitHub Actions (CI/CD) |

---

## ⏱️ Quick Start

### Prerequisites
- Node.js (v18.x or later)
- Python (v3.11 or later)
- Docker (Optional, for containerized running)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/ai-analytics-dashboard.git](https://github.com/yourusername/ai-analytics-dashboard.git)
cd ai-analytics-dashboard
```

### 2. Configure Environment Variables
Create a .env.local file in the root directory:
```
# Next.js BFF Env Variables
DATABASE_URL="postgresql://user:password@localhost:5432/analytics_db"
NEXTAUTH_SECRET="your_nextauth_jwt_secret"

# AI Core Env Variables
OPENAI_API_KEY="your_openai_api_key"
# Or AWS Credentials if using Bedrock
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
```

### 3. Spin up the Stack via Docker (Recommended)
```bash
docker-compose up --build 
```

Once initialized, open http://localhost:3000 to access the application.

## 📈 Engineering Best Practices Applied
**Clean Architecture:** Strict separation of concerns (Presentation Layer, Business Logic, and Data Ingestion Pipeline).

**Git Flow & Commits:** Adherence to the Conventional Commits specification (feat:, fix:, docs:, refactor:).

**Type Safety Over any:** Zero explicit any typings used; fully leveraged TypeScript generic constraints <T> for robust data hydration.

**Observability:** Prepared endpoints for structured logging and monitoring hookups.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📸 Screenshots & Demo

### 1. Main Interactive Analytics Dashboard
<img src="./docs/images/dashboard-main.png" width="800" alt="Main Dashboard Interface">

### 2. AI Intelligent Copilot (Natural Language to SQL/Chart)
<img src="./docs/images/ai-copilot-demo.gif" width="800" alt="AI Copilot Streaming Demo">

---