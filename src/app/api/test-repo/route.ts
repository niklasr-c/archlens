import { NextResponse } from 'next/server';
import { fetchAndExtractRepo } from '@/lib/github';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

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
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      system: `Du bist ein erfahrener Senior Software Architect und DevSecOps Experte. 
      Deine Aufgabe ist es, Codebasen messerscharf zu analysieren. Sei direkt, professionell und präzise. 
      Vermeide Floskeln. Antworte auf Deutsch. Formatier deine Antwort sauber mit Markdown.`,
      prompt: `Hier ist der gesamte Quellcode eines Repositories.
      
      Bitte erstelle mir einen "Vibe Check Report" mit folgenden 3 Punkten:
      1. Architektur-Zusammenfassung (max. 3 Sätze): Was ist das für ein Projekt, wie ist es strukturiert und welcher Tech-Stack wird primär genutzt?
      2. Tech-Debt & "Vibe Coding" Risiken: Nenne mir die 2 größten architektonischen Schwächen oder "Quick & Dirty"-Lösungen, die du siehst.
      3. Security: Gibt es offensichtliche Sicherheitsrisiken oder Best-Practice-Verstöße?
      
      Hier ist der Code:
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