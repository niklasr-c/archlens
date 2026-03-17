import { NextResponse } from 'next/server';
import { fetchAndExtractRepo } from '@/lib/github';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    // 1. URL aus dem Frontend-Request lesen
    const body = await req.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return NextResponse.json({ success: false, error: "Bitte eine GitHub-URL angeben." }, { status: 400 });
    }

    // 2. URL parsen (Macht aus "https://github.com/niklas/bot" -> owner: "niklas", repo: "bot")
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    console.log(`Analysiere ${owner}/${repo}...`);
    
    // 3. Repo laden
    const files = await fetchAndExtractRepo(owner, repo);
    const codeContext = files.map((f) => `--- Datei: ${f.path} ---\n${f.content}\n`).join('\n');

    // 4. KI-Analyse (Llama 3.3 via Groq)
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

    return NextResponse.json({ success: true, analysis: text });

  } catch (error: any) {
    console.error("Fehler:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}