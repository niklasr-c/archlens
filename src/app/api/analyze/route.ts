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
    
    // ---------------------------------------------------------
    // 🧠 INTELLIGENT CONTEXT MANAGEMENT ("SKELETON PATH")
    // ---------------------------------------------------------
    
    // A. Das Skelett: Eine Liste ALLER Dateipfade (zeigt der KI die Architektur)
    const fileTree = files.map(f => f.path).join('\n');
    
    // B. High-Signal Files (Configs, Docs, Entry Points)
    const priorityFiles = files.filter(f => 
      f.path.toLowerCase().includes('package.json') ||
      f.path.toLowerCase().includes('readme.md') ||
      f.path.toLowerCase().includes('tsconfig.json') ||
      f.path.toLowerCase().endsWith('main.ts') ||
      f.path.toLowerCase().endsWith('app.tsx') ||
      f.path.toLowerCase().endsWith('main.py')
    );

    // C. Alle restlichen Dateien
    const otherFiles = files.filter(f => !priorityFiles.includes(f));

    // Kontext strategisch aufbauen
    let codeContext = `PROJECT STRUCTURE:\n${fileTree}\n\n`;
    codeContext += `CORE FILES:\n` + priorityFiles.map(f => `--- ${f.path} ---\n${f.content}\n`).join('\n');

    const MAX_CHARS = 35000;
    
    // Falls Priority-Files allein schon zu groß sind, hart kappen
    if (codeContext.length > MAX_CHARS) {
      codeContext = codeContext.substring(0, MAX_CHARS) + "\n\n... [ACHTUNG: KERN-DATEIEN WEGEN LIMIT ABGESCHNITTEN] ...";
    } else {
      // Wenn noch Platz ist, füllen wir mit restlichem Code auf
      for (const file of otherFiles) {
        const fileString = `--- ${file.path} ---\n${file.content}\n`;
        // Passen wir noch rein?
        if (codeContext.length + fileString.length < MAX_CHARS) {
          codeContext += fileString;
        } else {
          codeContext += `\n... [WEITERE DATEIEN WEGEN LÄNGENLIMIT ABGESCHNITTEN] ...`;
          break; // Stop, wir sind voll!
        }
      }
    }

    console.log(`📊 Context built: ${codeContext.length} chars (Skeleton + High-Signal Files included)`);
    // ---------------------------------------------------------

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