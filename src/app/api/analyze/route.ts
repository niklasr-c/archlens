import { NextResponse, NextRequest } from 'next/server';
import { fetchAndExtractRepo } from '@/lib/github';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    // 1. URL aus dem Frontend-Request lesen
    const body = await req.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return NextResponse.json({ success: false, error: "Bitte eine GitHub-URL angeben." }, { status: 400 });
    }

    // Den GitHub Token des eingeloggten Users auslesen
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const accessToken = token?.accessToken as string | undefined;

    // 2. URL parsen
    const urlParts = repoUrl.replace('https://github.com/', '').replace(/\/$/, '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    console.log(`Analysiere ${owner}/${repo}... (Eingeloggt: ${!!accessToken})`);
    
    // 3. Repo laden 
    const files = await fetchAndExtractRepo(owner, repo, accessToken);
    
    // Hier bauen wir den Kontext zusammen
    let codeContext = files.map((f) => `--- Datei: ${f.path} ---\n${f.content}\n`).join('\n');

    // 🛡️ DER GROQ-SCHUTZSCHILD
    // Groq Free Tier Limit liegt oft bei ca. 12.000 Tokens. 
    // Ein Token sind ca. 4 Zeichen. Wir kappen bei 35.000 Zeichen,
    // damit noch Platz für den System-Prompt und die Antwort ist.
    const MAX_CHARS = 35000; 
    if (codeContext.length > MAX_CHARS) {
      console.log(`⚠️ Repo ist zu groß (${codeContext.length} Zeichen). Kürze auf ${MAX_CHARS} für Groq...`);
      codeContext = codeContext.substring(0, MAX_CHARS) + "\n\n... [ACHTUNG: WEITERE DATEIEN WEGEN LÄNGENLIMIT ABGESCHNITTEN] ...";
    }

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
    // Wir geben den Fehlertext an das Frontend weiter, damit du siehst was los ist
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}