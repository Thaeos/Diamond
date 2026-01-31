/**
 * Proceed preflight — run all checks and report ready/next steps
 *
 * Usage: npm run proceed
 */

import { spawn } from "child_process";

const ROOT = process.cwd();
// Reduced timeout for mobile devices (Fold7) - prevent signal 9 crashes
const TIMEOUT_MS = 45_000;

function run(cmd: string, args: string[], timeoutMs = TIMEOUT_MS): Promise<{ ok: boolean; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, shell: false, stdio: "pipe" });
    let out = "";
    let timedOut = false;
    const t = setTimeout(() => {
      timedOut = true;
      // Use SIGTERM first, but handle mobile resource constraints
      try {
        child.kill("SIGTERM");
        // If SIGTERM doesn't work quickly, force kill to prevent signal 9
        setTimeout(() => {
          if (!child.killed) {
            child.kill("SIGKILL");
          }
        }, 2000);
      } catch (e) {
        // Ignore kill errors on mobile
      }
    }, timeoutMs);
    child.stdout?.on("data", (d) => { out += d.toString(); });
    child.stderr?.on("data", (d) => { out += d.toString(); });
    child.on("close", (code) => {
      clearTimeout(t);
      resolve({ ok: !timedOut && code === 0, out });
    });
  });
}

async function main(): Promise<void> {
  console.log("\n🚀 Proceed — Preflight\n");
  console.log("  Running: test:systems, treasure-repos-check, tenderly-treasure status\n");

  // Run sequentially on mobile to reduce memory pressure (prevent signal 9)
  const systems = await run("npm", ["run", "test:systems"], 50_000);
  const repos = await run("npm", ["run", "treasure-repos-check"]);
  const tenderly = await run("npm", ["run", "tenderly-treasure", "status"]);

  const systemsOk = systems.ok;
  const reposOk = repos.out.includes("Filled:") && !repos.out.includes("Filled:            0") ? true : false;
  const tenderlyOk = tenderly.out.includes("(not set)") ? false : true;

  if (systemsOk) console.log("  ✅ test:systems — PASS");
  else console.log("  ❌ test:systems — FAIL");
  if (reposOk) console.log("  ✅ treasure-repos — at least one repo configured");
  else console.log("  ⏳ treasure-repos — 0/65 filled (optional: fill treasure_repos.json or run --fetch-org)");
  if (tenderlyOk) console.log("  ✅ Tenderly — keys set");
  else console.log("  ⏳ Tenderly — keys not set (optional for verify/simulate)");

  const ready = systemsOk;
  console.log("\n  " + (ready ? "✅ Proceed: systems ready." : "❌ Proceed: fix test:systems first."));
  console.log("\n  Next steps:");
  if (!reposOk) console.log("    • Fill treasure_repos.json or: GITHUB_TOKEN=ghp_... npm run treasure-repos-check -- --fetch-org treasureproject");
  if (!tenderlyOk) console.log("    • Set TENDERLY_ACCESS_KEY (and PROJECT/USERNAME) for verify/simulate");
  console.log("    • Run deploy/scripts when ready (e.g. npm run check-diamond-rpc, deploy-diamond)\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
