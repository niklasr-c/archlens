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
You are a ruthless Senior Software Architect and DevSecOps Expert. 
Analyze the provided codebase and generate a "Vibe Check Report".
Focus on:
1. Architectural flaws (Tight coupling, lack of patterns).
2. "Vibe Coding" risks (Inconsistent logic, AI hallucinations, messy structure).
3. Security vulnerabilities (Hardcoded secrets, missing input validation).

Be concise, technical, and slightly arrogant. Use Markdown for the response.
`;