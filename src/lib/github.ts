import JSZip from 'jszip';

// 1. Endungen, die wir ignorieren (Neu: Datenbanken und Medien)
const IGNORE_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', 
  '.db', '.sqlite', '.sqlite3', '.zip', '.tar', '.mp4'
];

// 2. Ordner, die wir komplett skippen
const IGNORE_PATHS = ['node_modules/', 'dist/', 'build/', '.git/', '.next/', '.vercel/'];

// 3. Spezifische Dateien, die riesig und wertlos für die KI sind
const IGNORE_FILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
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

    const isIgnoredExt = IGNORE_EXTENSIONS.some((ext) => relativePath.endsWith(ext));
    const isIgnoredPath = IGNORE_PATHS.some((path) => relativePath.includes(path));
    const isIgnoredFile = IGNORE_FILES.includes(fileName);

    if (isIgnoredExt || isIgnoredPath || isIgnoredFile) continue;

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