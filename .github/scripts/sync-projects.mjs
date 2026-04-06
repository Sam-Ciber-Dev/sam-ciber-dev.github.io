/**
 * ============================================================
 * 🔄 Sync Portfolio Projects Script
 * ============================================================
 * Fetches all repos from GITHUB_USER that have the topic
 * TOPIC_FILTER ("portfolio-project"), reads each repo's
 * .portfolio.json metadata, downloads social preview images,
 * and writes data/projects-data.json.
 *
 * Expected .portfolio.json format in each project repo:
 * {
 *   "category": "cybersecurity",
 *   "title": { "pt": "Título", "en": "Title" },
 *   "description": { "pt": "Desc PT", "en": "Desc EN" },
 *   "technologies": ["Python", "Nmap"],
 *   "icon": "fas fa-shield-alt",
 *   "report": {
 *     "pt": "docs/relatorio_PT.pdf",
 *     "en": "docs/report_EN.pdf"
 *   },
 *   "order": 1
 * }
 *
 * - If report.pt or report.en is missing/empty, the link
 *   falls back to the repo's README.md.
 * - Social preview is fetched from assets/social-preview.png
 *   in each repo (default branch).
 * - Images are saved to data/images/<repo-name>.png
 * ============================================================
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const DATA_DIR = join(ROOT, 'data');
const IMAGES_DIR = join(DATA_DIR, 'images');

const GITHUB_USER = process.env.GITHUB_USER || 'Sam-Ciber-Dev';
const TOPIC_FILTER = process.env.TOPIC_FILTER || 'portfolio-project';
const TOKEN = process.env.GITHUB_TOKEN || '';

const VALID_CATEGORIES = ['offensive', 'defensive', 'reports', 'ai', 'networking', 'software', 'web', 'hardware'];

// Timestamp used to bust CDN / browser caches during this sync run
const BUILD_TS = Date.now();

const HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-sync',
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

// ======================== GitHub API Helpers ========================

async function fetchJSON(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Fetch all repos for the user that have the portfolio topic.
 * Uses the search API which filters by topic.
 */
async function fetchPortfolioRepos() {
  const query = encodeURIComponent(`user:${GITHUB_USER} topic:${TOPIC_FILTER}`);
  const url = `https://api.github.com/search/repositories?q=${query}&per_page=100&sort=updated&order=desc`;
  const data = await fetchJSON(url);
  return data.items || [];
}

/**
 * Fetch the .portfolio.json file from a repo's default branch.
 * Returns null if not found.
 */
async function fetchPortfolioMeta(repo) {
  // Use ref param + cache-buster to ensure fresh content from the API
  const url = `https://api.github.com/repos/${repo.full_name}/contents/.portfolio.json?ref=${repo.default_branch}&_=${BUILD_TS}`;
  try {
    const data = await fetchJSON(url);
    // Content is base64-encoded
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch {
    console.warn(`  ⚠ No .portfolio.json found in ${repo.full_name}`);
    return null;
  }
}

/**
 * Download the social preview image from assets/social-preview.png.
 * Tries common extensions: .png, .jpg, .webp
 * Saves to data/images/<repo-name>.<ext>
 * Returns the relative path from site root, or null if not found.
 */
async function downloadSocialPreview(repo) {
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];

  for (const ext of extensions) {
    const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/assets/social-preview.${ext}?cb=${BUILD_TS}`;
    try {
      const res = await fetch(rawUrl, { headers: { 'User-Agent': 'portfolio-sync', 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' } });
      if (!res.ok) continue;

      const buffer = Buffer.from(await res.arrayBuffer());
      if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

      const filename = `${repo.name}.${ext}`;
      const filepath = join(IMAGES_DIR, filename);
      writeFileSync(filepath, buffer);

      console.log(`  ✅ Downloaded preview: ${filename}`);
      return `data/images/${filename}`;
    } catch {
      continue;
    }
  }

  console.warn(`  ⚠ No social preview found in ${repo.full_name}/assets/`);
  return null;
}

// ======================== Build Project Entry ========================

function buildProjectEntry(repo, meta, imagePath) {
  const repoUrl = repo.html_url;
  const defaultBranch = repo.default_branch || 'main';

  // Build report links — fall back to README if no PDF specified
  const reportPt = meta.report?.pt
    ? `${repoUrl}/blob/${defaultBranch}/${meta.report.pt}`
    : `${repoUrl}#readme`;
  const reportEn = meta.report?.en
    ? `${repoUrl}/blob/${defaultBranch}/${meta.report.en}`
    : `${repoUrl}#readme`;

  return {
    // Title: use i18n object or repo name as fallback
    title: meta.title && typeof meta.title === 'object'
      ? meta.title
      : { pt: meta.title || repo.name, en: meta.title || repo.name },

    // Description: i18n object or repo description
    description: meta.description && typeof meta.description === 'object'
      ? meta.description
      : { pt: meta.description || repo.description || '', en: meta.description || repo.description || '' },

    // Technologies
    technologies: Array.isArray(meta.technologies) ? meta.technologies : [],

    // Icon (Font Awesome class)
    icon: meta.icon || 'fas fa-folder-open',

    // Social preview image path (relative to site root)
    // Append repo update timestamp as cache-buster so browsers fetch the latest version
    image: imagePath ? `${imagePath}?v=${new Date(repo.updated_at).getTime()}` : null,

    // Links
    links: {
      github: repoUrl,
      report: { pt: reportPt, en: reportEn },
    },

    // Ordering (lower = first)
    order: typeof meta.order === 'number' ? meta.order : 999,

    // Repo metadata
    repo: repo.name,
    updatedAt: repo.updated_at,
  };
}

// ======================== Main ========================

async function main() {
  console.log(`🔍 Fetching repos for ${GITHUB_USER} with topic "${TOPIC_FILTER}"...`);

  const repos = await fetchPortfolioRepos();
  console.log(`📦 Found ${repos.length} repo(s) with topic "${TOPIC_FILTER}"`);

  const output = {
    lastUpdated: new Date().toISOString(),
    projects: {
      offensive: [],
      defensive: [],
      reports: [],
      ai: [],
      networking: [],
      software: [],
      web: [],
      hardware: [],
    },
  };

  for (const repo of repos) {
    console.log(`\n📂 Processing: ${repo.full_name}`);

    const meta = await fetchPortfolioMeta(repo);
    if (!meta) {
      console.log('  ⏩ Skipping (no .portfolio.json)');
      continue;
    }

    const category = meta.category?.toLowerCase();
    if (!VALID_CATEGORIES.includes(category)) {
      console.warn(`  ⚠ Invalid category "${category}" — skipping`);
      continue;
    }

    const imagePath = await downloadSocialPreview(repo);
    const entry = buildProjectEntry(repo, meta, imagePath);

    output.projects[category].push(entry);
    console.log(`  ✅ Added to "${category}": ${entry.title.pt || entry.title.en}`);
  }

  // Sort each category by order, then by updatedAt (newest first)
  for (const cat of VALID_CATEGORIES) {
    output.projects[cat].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  // Write output
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const outPath = join(DATA_DIR, 'projects-data.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ Written: ${outPath}`);

  // Summary
  const total = VALID_CATEGORIES.reduce((s, c) => s + output.projects[c].length, 0);
  console.log(`📊 Total projects synced: ${total}`);
  for (const c of VALID_CATEGORIES) {
    console.log(`   ${c}: ${output.projects[c].length}`);
  }
}

main().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
