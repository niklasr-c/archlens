import { NextResponse } from 'next/server';
import { fetchAndExtractRepo } from '@/lib/github';

export async function GET() {
  try {
    // Hier testen wir mit deinem Discord-Bot von gestern!
    // Falls das Repo anders hieß, pass den Namen einfach an.
    const owner = 'niklasr-c'; 
    const repo = 'dev-utility-bot';

    console.log(`Lade ${owner}/${repo} herunter...`);
    const startTime = Date.now();

    // Ruft unsere Zip-Logik auf
    const files = await fetchAndExtractRepo(owner, repo);

    const duration = Date.now() - startTime;

    // Wir schneiden die Ausgabe auf die ersten 5 Dateien ab, 
    // damit der Browser beim Testen nicht explodiert.
    return NextResponse.json({
      success: true,
      message: `Erfolgreich geladen in ${duration}ms!`,
      totalFilesParsed: files.length,
      preview: files.slice(0, 5).map(f => ({
        path: f.path,
        contentPreview: f.content.substring(0, 100) + '...' // Nur die ersten 100 Zeichen
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}