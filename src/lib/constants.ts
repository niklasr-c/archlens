// src/lib/constants.ts

export const GITHUB_CONFIG = {
  API_BASE_URL: "https://api.github.com",
  RAW_CONTENT_URL: "https://raw.githubusercontent.com",
};

export const ANALYSIS_CONFIG = {
  // 1. Endungen, die wir ignorieren (Datenbanken und Medien)
  IGNORE_EXTENSIONS: [
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf',
    '.db', '.sqlite', '.sqlite3', '.zip', '.tar', '.mp4'
  ],
  // 2. Ordner, die wir komplett skippen
  IGNORE_PATHS: [
    'node_modules/', 'dist/', 'build/', '.git/', '.next/', '.vercel/'
  ],
  // 3. Spezifische Dateien, die riesig und wertlos für die KI sind
  IGNORE_FILES: [
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'
  ],
  // Maximale Anzahl an Dateien (Schutz vor zu großen Repos)
  MAX_FILES: 50,
};

export const SYSTEM_PROMPT = `
You are an expert Staff Software Engineer and DevSecOps Architect.
Your task is to review the provided codebase, specifically looking for common pitfalls introduced by AI-assisted coding (e.g., "Vibe Coding", hallucinated APIs, inconsistent architecture) and general tech debt.

Focus your analysis on:
1. Architectural Integrity: Identify tight coupling, missing design patterns, and scalability issues.
2. AI-Generated Code Risks: Look for inconsistent logic, repetitive code blocks, and lack of modularity often caused by blind copy-pasting from AI tools.
3. Security & Best Practices: Flag hardcoded secrets, missing input validation, and insecure dependencies.

Tone: Professional, highly constructive, and educational. 
Format: Use clear Markdown. For every critical issue found, briefly explain *why* it is a problem and provide a short, actionable solution or code snippet on how to fix it.
`;