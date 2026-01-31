/**
 * Study all TreasureProject repos in treasure_repos.json.
 * Produces:
 *  - /home/theos/treasure_repos_study.json
 *  - /home/theos/TREASURE_65_REPOS_STUDY.md
 */

import * as fs from 'fs';
import * as path from 'path';

type RepoEntry = {
  url: string;
  name: string;
  hasContracts: boolean | null;
  hasHardhat: boolean | null;
};

type TreasureReposFile = {
  orgUrl: string;
  targetCount: number;
  repos: RepoEntry[];
};

type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  default_branch: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
};

const TREASURE_REPOS_PATH = '/home/theos/treasure_repos.json';
const OUTPUT_JSON = '/home/theos/treasure_repos_study.json';
const OUTPUT_MD = '/home/theos/TREASURE_65_REPOS_STUDY.md';

function readTokenFromEnv(): string | null {
  const envToken = process.env.GITHUB_TOKEN?.trim();
  if (envToken && envToken !== 'ghp_your_token_here') return envToken;
  if (!fs.existsSync('/home/theos/env.txt')) return null;
  const envText = fs.readFileSync('/home/theos/env.txt', 'utf-8');
  const match = envText.match(/^GITHUB_TOKEN=(.+)$/m);
  if (!match) return null;
  const token = match[1].trim();
  if (!token || token === 'ghp_your_token_here') return null;
  return token;
}

async function fetchJson<T>(url: string, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.text();
}

function summarizeReadme(text: string | null): string | null {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim());
  let candidate = lines.find(l => l.length > 0 && !l.startsWith('#'));
  if (!candidate) candidate = lines.find(l => l.length > 0) || null;
  if (!candidate) return null;
  // Strip markdown links/images if present
  candidate = candidate.replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  return candidate.slice(0, 240);
}

async function getOrgRepos(org: string, token?: string | null): Promise<GitHubRepo[]> {
  const all: GitHubRepo[] = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/orgs/${org}/repos?per_page=100&type=public&page=${page}`;
    const data = await fetchJson<GitHubRepo[]>(url, token);
    if (!data.length) break;
    all.push(...data);
    if (data.length < 100) break;
    page += 1;
    if (page > 5) break; // safety
  }
  return all;
}

async function main() {
  const file = JSON.parse(fs.readFileSync(TREASURE_REPOS_PATH, 'utf-8')) as TreasureReposFile;
  const token = readTokenFromEnv();
  const org = 'TreasureProject';

  console.log(`Fetching ${org} repos list...`);
  const orgRepos = await getOrgRepos(org, token);
  const byName = new Map(orgRepos.map(r => [r.name.toLowerCase(), r]));

  const results: Array<{
    name: string;
    url: string;
    description: string | null;
    homepage: string | null;
    language: string | null;
    defaultBranch: string | null;
    updatedAt: string | null;
    archived: boolean | null;
    fork: boolean | null;
    readmeSummary: string | null;
  }> = [];

  for (const repo of file.repos) {
    const nameKey = repo.name.toLowerCase();
    let meta = byName.get(nameKey);
    if (!meta) {
      // Fallback direct lookup
      try {
        meta = await fetchJson<GitHubRepo>(`https://api.github.com/repos/${org}/${repo.name}`, token);
      } catch {
        meta = null;
      }
    }

    const defaultBranch = meta?.default_branch || 'master';
    const readmeUrl = `https://raw.githubusercontent.com/${org}/${repo.name}/${defaultBranch}/README.md`;
    const readmeText = await fetchText(readmeUrl);
    const summary = summarizeReadme(readmeText);

    results.push({
      name: repo.name,
      url: repo.url,
      description: meta?.description || null,
      homepage: meta?.homepage || null,
      language: meta?.language || null,
      defaultBranch: meta?.default_branch || null,
      updatedAt: meta?.updated_at || null,
      archived: meta?.archived ?? null,
      fork: meta?.fork ?? null,
      readmeSummary: summary || null,
    });
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));

  const lines: string[] = [];
  lines.push('# TreasureProject — 65 Repo Study');
  lines.push('');
  lines.push(`Studied repos: ${results.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const r of results) {
    lines.push(`## ${r.name}`);
    lines.push(`- URL: ${r.url}`);
    if (r.description) lines.push(`- Description: ${r.description}`);
    if (r.homepage) lines.push(`- Homepage: ${r.homepage}`);
    if (r.language) lines.push(`- Primary language: ${r.language}`);
    if (r.defaultBranch) lines.push(`- Default branch: ${r.defaultBranch}`);
    if (r.updatedAt) lines.push(`- Updated: ${r.updatedAt}`);
    if (r.archived !== null) lines.push(`- Archived: ${r.archived ? 'yes' : 'no'}`);
    if (r.fork !== null) lines.push(`- Fork: ${r.fork ? 'yes' : 'no'}`);
    if (r.readmeSummary) lines.push(`- README summary: ${r.readmeSummary}`);
    else lines.push('- README summary: (not found)');
    lines.push('');
  }

  fs.writeFileSync(OUTPUT_MD, lines.join('\n'));

  console.log(`Saved ${OUTPUT_JSON} and ${OUTPUT_MD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
