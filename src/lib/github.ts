import JSZip from 'jszip';
import { ANALYSIS_CONFIG, GITHUB_CONFIG } from "./constants";

export interface RepoFile {
  path: string;
  content: string;
}

// 1. NEU: token als optionaler 3. Parameter hinzugefügt!
export async function fetchAndExtractRepo(owner: string, repo: string, token?: string): Promise<RepoFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/zipball`;
  
  // 2. Headers vorbereiten
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ArchLens-Portfolio-Project',
  };

  // 3. Token-Check mit Log für unser Terminal
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log("🔑 Token aktiv! Startet mit:", token.substring(0, 4)); 
  } else {
    console.log("⚠️ ACHTUNG: Kein Token in der github.ts angekommen!");
  }

  // 4. Der Fetch MIT deaktiviertem Next.js Cache
  const response = await fetch(url, {
    headers: headers,
    cache: 'no-store', // <-- Tötet den Next.js Cache
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status} - Konnte das Repo nicht laden.`);
  }

  // Lade den Zip-Inhalt in den Arbeitsspeicher
  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const files: RepoFile[] = [];

  // Iteriere durch die entpackten Dateien
  for (const relativePath of Object.keys(zip.files)) {
    const file = zip.files[relativePath];

    if (file.dir) continue;

    const fileName = relativePath.split('/').pop() || '';

    const isIgnored = 
      ANALYSIS_CONFIG.IGNORE_EXTENSIONS.some(ext => fileName.endsWith(ext)) ||
      ANALYSIS_CONFIG.IGNORE_PATHS.some(dir => fileName.includes(dir)) ||
      ANALYSIS_CONFIG.IGNORE_FILES.some(file => fileName.endsWith(file));

    if (isIgnored) continue;

    const content = await file.async('string');
    const cleanPath = relativePath.split('/').slice(1).join('/');

    files.push({
      path: cleanPath,
      content: content,
    });
  }

  return files;
}