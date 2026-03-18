# 🏗️ ArchLens

> **AI-Powered Codebase Architecture & Tech Debt Analyzer**
> 
> Instantly understand any GitHub repository. ArchLens fetches a project's source code, analyzes its architecture, and provides a ruthless but constructive "Vibe Check" highlighting tech debt and security flaws.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Llama 3.3](https://img.shields.io/badge/Llama_3.3_70B-0452BA?style=for-the-badge&logo=meta&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LPUs-F55036?style=for-the-badge)

## ✨ Core Features & Technical Highlights

ArchLens isn't just a simple API wrapper; it's built for speed and efficiency using a modern 2026 tech stack:

- **Zero-Disk I/O Ingestion:** To bypass GitHub's strict API rate limits for individual file requests, the backend fetches the *entire* repository as a compressed `.zip` buffer, extracts it entirely in memory, and filters out noise (images, lockfiles, node_modules) before analysis. Cost per repo analysis: Exactly 1 API Call.
- **Blazing Fast AI (Groq):** Powered by the Vercel AI SDK and Groq's LPUs running Meta's open-source `llama-3.3-70b-versatile` model. Analyzes dozens of files and streams a comprehensive architectural report in under 3 seconds.
- **Beautiful Markdown UI:** Custom dark-mode UI built with Tailwind CSS v4 and `@tailwindcss/typography` for perfectly formatted, highly readable security and architecture reports.

---
...
- **Beautiful Markdown UI:** Custom dark-mode UI built with Tailwind CSS v4 and `@tailwindcss/typography` for perfectly formatted, highly readable security and architecture reports.

---

### 🤖 Built for the Agentic Coding Era

ArchLens doesn't just point out your tech debt—it helps you fix it without breaking your workflow. 

Instead of generating code that competes with your IDE, ArchLens acts as an independent auditor. Once the audit is complete, simply click **"Fix with AI Agent"**. ArchLens will instantly generate a structured master-prompt containing your full DevSecOps report. 

Just paste it into **Cursor, GitHub Copilot Workspace, or Claude**, and watch your agent systematically clean up the architectural flaws.

---

## 🛠️ How It Works (The Pipeline)

1. **Input:** User provides a public GitHub URL (e.g., `niklasr-c/dev-utility-bot`).
2. **Ingest & Sanitize:** The Next.js API route downloads the repo's zipball, extracts it using `jszip`, and runs a strict sanitization pass to drop binaries and heavy lockfiles to save AI context window tokens.
3. **Analyze:** The concatenated source code is sent to Llama 3.3 with a strict "Senior Architect" system prompt.
4. **Report:** The AI returns a Markdown response covering Architecture Summary, Tech Debt, and Security Risks, rendered directly in the React frontend.

---

## 🚀 Getting Started (Local Development)

Want to run ArchLens locally? 

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_GITHUB_NAME/archlens.git](https://github.com/YOUR_GITHUB_NAME/archlens.git)
   cd archlens
2. **Install dependencies:**
   ```bash
   npm install
3. **Set up Enviroment Variables:**
    Create a .env.local file in the root directory and add your free Groq API key:
    GROQ_API_KEY=gsk_your_groq_api_key_here
4. **Run the development server:**
    npm run dev
    Open http://localhost:3000 in your browser to see the result.  

---

## ⚖️ License

All rights reserved. This project is currently provided for educational and review purposes only. No part of this repository may be redistributed or used for commercial purposes without explicit permission.