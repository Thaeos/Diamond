/**
 * Treasure 65 repos — config check and optional GitHub sync
 *
 * Validates treasure_repos.json (foundation for https://github.com/treasureproject):
 * - Count filled vs empty slots (target 65)
 * - Optional: fetch org repos from GitHub API and suggest list
 *
 * Usage:
 *   npm run treasure-repos-check
 *   npm run treasure-repos-check -- --fetch-org treasureproject   # needs GITHUB_TOKEN
 */

import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "treasure_repos.json");
const ENV_PATH = path.join(process.cwd(), "env.txt");

function loadEnvFile(): void {
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

// Load env.txt on import
loadEnvFile();

interface RepoEntry {
  url: string;
  name: string;
  hasContracts?: boolean | null;
  hasHardhat?: boolean | null;
}

interface TreasureReposConfig {
  description?: string;
  foundationRepo?: string;
  orgUrl?: string;
  targetCount?: number;
  repos: RepoEntry[];
}

function loadConfig(): TreasureReposConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config not found: ${CONFIG_PATH}. Create treasure_repos.json (see TREASURE_FOUNDATION_65_REPOS.md).`);
  }
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as TreasureReposConfig;
}

function check(): void {
  const config = loadConfig();
  const target = config.targetCount ?? 65;
  const repos = config.repos ?? [];
  const filled = repos.filter((r) => r.url && r.url.trim().length > 0);
  const empty = repos.length - filled.length;

  console.log("\n📋 Treasure 65 repos — Foundation check\n");
  console.log("  Foundation repo:  ", config.foundationRepo ?? "—");
  console.log("  Org URL:          ", config.orgUrl ?? "—");
  console.log("  Target count:     ", target);
  console.log("  Slots in config:  ", repos.length);
  console.log("  Filled:           ", filled.length);
  console.log("  Empty:            ", empty);

  if (filled.length > 0) {
    console.log("\n  Filled repos (first 10):");
    filled.slice(0, 10).forEach((r, i) => {
      console.log(`    ${i + 1}. ${r.name}  ${r.url}`);
    });
  }

  if (empty > 0) {
    console.log("\n  💡 Fill treasure_repos.json with repo URLs from your org (e.g. https://github.com/treasureproject).");
  }
  if (filled.length >= target) {
    console.log("\n  ✅ Target", target, "repos reached.");
  }
  console.log("");
}

async function fetchOrg(org: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  let all: { html_url: string; name: string }[] = [];
  let page = 1;
  const perPage = 100;
  for (;;) {
    const url = `https://api.github.com/orgs/${org}/repos?per_page=${perPage}&page=${page}&sort=full_name`;
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (token && token !== "ghp_your_token_here") {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 401 && !token) {
        console.log("  GitHub API requires authentication. Set GITHUB_TOKEN in env.txt");
        console.log("  Get token from: https://github.com/settings/tokens");
      } else if (res.status === 403) {
        console.log("  GitHub API rate limit reached. Set GITHUB_TOKEN in env.txt to increase limit");
        console.log("  Get token from: https://github.com/settings/tokens");
      } else {
        console.log("  GitHub API error:", res.status, errorText);
      }
      process.exitCode = 1;
      return;
    }
    const data = (await res.json()) as { html_url: string; name: string }[];
    if (data.length === 0) break;
    all = all.concat(data);
    if (data.length < perPage) break;
    page++;
  }
  console.log("\n  Fetched", all.length, "repos from org:", org);
  if (all.length > 0) {
    // Auto-populate treasure_repos.json
    const config = loadConfig();
    const target = config.targetCount ?? 65;
    const reposToAdd = all.slice(0, target);
    
    // Update repos array
    for (let i = 0; i < reposToAdd.length && i < config.repos.length; i++) {
      config.repos[i].url = reposToAdd[i].html_url;
      config.repos[i].name = reposToAdd[i].name;
    }
    
    // Write back to file
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
    console.log(`  ✅ Auto-populated ${reposToAdd.length} repos into treasure_repos.json`);
    console.log("  Sample URLs:");
    reposToAdd.slice(0, 15).forEach((r, i) => console.log(`    ${i + 1}. ${r.name}  ${r.html_url}`));
    if (reposToAdd.length > 15) {
      console.log(`    ... and ${reposToAdd.length - 15} more`);
    }
  }
  console.log("");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args[0] === "--fetch-org" && args[1]) {
    await fetchOrg(args[1]);
    return;
  }
  check();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { loadConfig, check, fetchOrg };
