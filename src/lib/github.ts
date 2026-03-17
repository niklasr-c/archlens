import JSZip from 'jszip';
import { ANALYSIS_CONFIG, GITHUB_CONFIG } from "./constants";

export interface RepoFile {
  path: string;
  content: string;
}

export async function fetchAndExtractRepo(owner: string, repo: string): Promise<RepoFile[]> {
  // 1. Lade das gesamte Repo als Zipball herunter (1 einziger API Call!)
  const url = `https://api.github.com/repos/${owner}/${repo}/zipball`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ArchLens-Portfolio-Project',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status} - Konnte das Repo nicht laden.`);
  }

  // 2. Lade den Zip-Inhalt in den Arbeitsspeicher
  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const files: RepoFile[] = [];

  // 3. Iteriere durch die entpackten Dateien
  for (const relativePath of Object.keys(zip.files)) {
    const file = zip.files[relativePath];

    // Ordner ignorieren wir, wir wollen nur die reinen Text-Dateien
    // ... in der for-Schleife:
    if (file.dir) continue;

    const fileName = relativePath.split('/').pop() || '';

    const isIgnored = 
      ANALYSIS_CONFIG.IGNORE_EXTENSIONS.some(ext => fileName.endsWith(ext)) ||
      ANALYSIS_CONFIG.IGNORE_PATHS.some(dir => fileName.includes(dir)) ||
      ANALYSIS_CONFIG.IGNORE_FILES.some(file => fileName.endsWith(file)); // oder includes(file) je nachdem wie du es hattest

    if (isIgnored) continue;

    // Lese den Datei-Inhalt als String
    const content = await file.async('string');
    
    // GitHub packt das Repo in einen Hauptordner (z.B. owner-repo-hash/). 
    // Den schneiden wir für eine saubere Pfad-Struktur ab.
    const cleanPath = relativePath.split('/').slice(1).join('/');

    files.push({
      path: cleanPath,
      content: content,
    });
  }

  return files;
}