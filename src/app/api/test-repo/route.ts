import { NextResponse } from 'next/server';
import { fetchAndExtractRepo } from '@/lib/github';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function GET() {
  try {
    const owner = 'niklasr-c'; 
    const repo = 'dev-utility-bot';

    console.log(`Lade ${owner}/${repo} herunter...`);
    const files = await fetchAndExtractRepo(owner, repo);

    // 1. Den "Prompt-Kontext" bauen: Wir kleben alle Dateien aneinander
    // Das geht nur 2026, weil Gemini Flash ein gigantisches Kontextfenster hat!
    const codeContext = files
      .map((f) => `--- Datei: ${f.path} ---\n${f.content}\n`)
      .join('\n');

    console.log(`Starte KI-Analyse mit Gemini 1.5 Flash... (${files.length} Dateien)`);
    const startTime = Date.now();

    // 2. Der magische Aufruf via Vercel AI SDK
    // 2. Der magische Aufruf via Vercel AI SDK (Jetzt mit Llama 3.1 auf Groq)
    // 2. Der magische Aufruf via Vercel AI SDK (Llama 3.3 auf Groq)
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an elite Senior Software Architect and DevSecOps Expert. 
      Your job is to perform ruthless but constructive code reviews. 
      Be direct, professional, and concise. Avoid fluff. Answer in English. Use clean Markdown formatting.`,
      prompt: `Analyze the following repository source code and generate a "Vibe Check Report" covering these 3 aspects:
      
      1. Architecture Summary (max 3 sentences): What is the project, its core structure, and primary tech stack?
      2. Tech Debt & "Vibe Coding" Risks: Identify the 2 most critical architectural flaws, anti-patterns, or "quick & dirty" hacks.
      3. Security & Best Practices: Point out any glaring security vulnerabilities or major best-practice violations.
      
      Repository Code:
      ${codeContext}`
    });

    const duration = Date.now() - startTime;
    console.log(`Analyse fertig in ${duration}ms`);

    return NextResponse.json({
      success: true,
      repo: `${owner}/${repo}`,
      durationMs: duration,
      analysis: text, // Hier steckt die pure KI-Magie drin!
    });

  } catch (error: any) {
    console.error("Fehler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}