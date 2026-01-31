/**
 * Together — one run to bring everything together
 *
 * Orchestrates: env check → RPCs → test:systems → Tenderly status → treasure-repos → check-diamond-rpc → summary.
 * Use the tools, trial and error; if you don't have it, get it (GET_IT.md).
 *
 * Usage: npm run together
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const CWD = process.cwd();
const TIMEOUT_MS = 50_000;
const DIAMOND_RPC_TIMEOUT_MS = 90_000; // check-diamond-rpc can be slow (event scan)

function run(
  cmd: string,
  args: string[],
  timeoutMs = TIMEOUT_MS
): Promise<{ ok: boolean; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: CWD, shell: false, stdio: "pipe" });
    let out = "";
    let timedOut = false;
    const t = setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGTERM");
        setTimeout(() => {
          if (!child.killed) child.kill("SIGKILL");
        }, 2000);
      } catch (_) {}
    }, timeoutMs);
    child.stdout?.on("data", (d) => { out += d.toString(); });
    child.stderr?.on("data", (d) => { out += d.toString(); });
    child.on("close", (code) => {
      clearTimeout(t);
      resolve({ ok: !timedOut && code === 0, out });
    });
  });
}

function envPath(): string {
  return path.join(CWD, "env.txt");
}

function chainlistPath(): string {
  return path.join(CWD, "chainlist_rpcs.json");
}

function deploymentsPath(): string {
  return path.join(CWD, "diamond_deployments.json");
}

function getDefaultChainIds(): number[] {
  try {
    const data = JSON.parse(fs.readFileSync(deploymentsPath(), "utf-8"));
    const ids = (data.deployments || [])
      .map((d: { chainId?: number }) => d.chainId)
      .filter((id: unknown) => typeof id === "number") as number[];
    if (ids.length > 0) return [...new Set(ids)];
  } catch (_) {}
  return [137, 42161, 122, 1285, 3338, 747474]; // Polygon, Arbitrum, Fuse, Moonriver, peaq, Katana
}

async function main(): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("  TOGETHER — Everything comes together");
  console.log("=".repeat(60) + "\n");

  const results: { step: string; ok: boolean; optional?: boolean }[] = [];

  // 1) Env
  const hasEnv = fs.existsSync(envPath());
  if (!hasEnv) {
    console.log("  ⏳ env.txt not found — create from GET_IT.md (Tenderly, GitHub, etc.)\n");
    results.push({ step: "env.txt", ok: false, optional: true });
  } else {
    console.log("  ✅ env.txt present\n");
    results.push({ step: "env.txt", ok: true, optional: true });
  }

  // 2) RPCs
  if (!fs.existsSync(chainlistPath())) {
    const chainIds = getDefaultChainIds();
    console.log("  📡 chainlist_rpcs.json missing — fetching RPCs for:", chainIds.join(", "));
    const fetchOk = (await run("npm", ["run", "fetch-rpcs", "--", ...chainIds.map(String)], 60_000)).ok;
    results.push({ step: "fetch-rpcs", ok: fetchOk, optional: true });
    if (!fetchOk) console.log("  ⚠️ fetch-rpcs failed (network or chainlist); check-diamond-rpc may use fallback\n");
    else console.log("");
  } else {
    console.log("  ✅ chainlist_rpcs.json present\n");
    results.push({ step: "chainlist_rpcs", ok: true, optional: true });
  }

  // 3) test:systems
  console.log("  🧪 Running test:systems...");
  const systems = await run("npm", ["run", "test:systems"], 60_000);
  results.push({ step: "test:systems", ok: systems.ok });
  if (systems.ok) console.log("  ✅ test:systems — PASS\n");
  else console.log("  ❌ test:systems — FAIL (see above)\n");

  // 4) Tenderly status
  console.log("  🔧 Tenderly status...");
  const tenderly = await run("npm", ["run", "tenderly-treasure", "status"]);
  const tenderlyOk = !tenderly.out.includes("(not set)");
  results.push({ step: "Tenderly keys", ok: tenderlyOk, optional: true });
  if (tenderlyOk) console.log("  ✅ Tenderly — keys set\n");
  else console.log("  ⏳ Tenderly — keys not set (optional; see GET_IT.md)\n");

  // 5) treasure-repos-check
  console.log("  📦 treasure-repos-check...");
  const repos = await run("npm", ["run", "treasure-repos-check"]);
  const reposOk = repos.out.includes("Filled:") && !repos.out.includes("Filled:            0");
  results.push({ step: "treasure-repos", ok: reposOk, optional: true });
  if (reposOk) console.log("  ✅ treasure-repos — configured\n");
  else console.log("  ⏳ treasure-repos — 0 filled (optional; GITHUB_TOKEN + --fetch-org)\n");

  // 6) check-diamond-rpc (with timeout; event scan can be long)
  console.log("  🔷 check-diamond-rpc (may take up to 90s)...");
  const diamond = await run("npm", ["run", "check-diamond-rpc"], DIAMOND_RPC_TIMEOUT_MS);
  const diamondOk = diamond.out.includes("Contract has bytecode") && diamond.out.includes("diamondCut");
  results.push({ step: "check-diamond-rpc", ok: diamondOk, optional: true });
  if (diamondOk) console.log("  ✅ check-diamond-rpc — Diamond bytecode / diamondCut found\n");
  else console.log("  ⏳ check-diamond-rpc — incomplete or no Diamond at default address (optional)\n");

  // 7) Generate manifest (consumable artifact: chains + deployments)
  console.log("  📄 generate-manifest...");
  const manifestOk = (await run("npm", ["run", "generate-manifest"])).ok;
  results.push({ step: "generate-manifest", ok: manifestOk, optional: false });
  if (manifestOk) console.log("  ✅ manifest/framework-manifest.json written\n");
  else console.log("  ⚠️ generate-manifest failed\n");

  // Summary
  console.log("=".repeat(60));
  console.log("  SUMMARY");
  console.log("=".repeat(60));
  const required = results.filter((r) => !r.optional);
  const optional = results.filter((r) => r.optional);
  const requiredOk = required.every((r) => r.ok);
  const optionalOk = optional.filter((r) => r.ok).length;
  console.log("  Required: " + (requiredOk ? "✅" : "❌") + " " + required.map((r) => r.step).join(", "));
  console.log("  Optional: " + optionalOk + "/" + optional.length + " — " + optional.map((r) => r.step).join(", "));
  console.log("");
  console.log("  Manifest: manifest/framework-manifest.json (chains + deployments — use in bridgeworld, Godot, scripts)");
  console.log("  Live read: bridgeworld.lol/connect.html — connect wallet, see real balance on-chain");
  console.log("");
  console.log("  Next steps:");
  if (!requiredOk) console.log("    • Fix required steps above, then run: npm run together");
  console.log("    • Proceed: npm run proceed");
  console.log("    • Monitor: npm run setup && npm run monitor");
  console.log("    • Deploy: npm run deploy-diamond (after diamond_deployments.json)");
  console.log("    • Get keys / find it: GET_IT.md");
  console.log("    • Map: DIRECTORY_ATLAS.md");
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
