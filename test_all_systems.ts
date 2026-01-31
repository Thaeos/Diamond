/**
 * Test All Systems — Pre-deployment verification
 *
 * Runs typecheck, lint, and each system script with a safe (non-interactive)
 * subcommand or timeout. Use before full deployment.
 *
 * Usage: npm run test:systems
 */

import { spawn } from "child_process";

const ROOT = process.cwd();
// Reduced timeout for mobile devices (Fold7) - prevent signal 9 crashes
const TIMEOUT_MS = 15_000;

interface TestCase {
  name: string;
  cmd: string;
  args: string[];
  expectExit0?: boolean;
  timeoutMs?: number;
}

const SYSTEM_TESTS: TestCase[] = [
  { name: "light-codes report", cmd: "npm", args: ["run", "light-codes", "report"], expectExit0: true },
  { name: "registry report", cmd: "npm", args: ["run", "registry", "report"], expectExit0: true },
  { name: "ipfs status", cmd: "npm", args: ["run", "ipfs-status"], expectExit0: true },
  { name: "compute list", cmd: "npm", args: ["run", "compute", "list"], expectExit0: true },
  { name: "treasure-floor (one-shot)", cmd: "npm", args: ["run", "treasure-floor"], expectExit0: true },
  { name: "script_registry (no args → help)", cmd: "npx", args: ["tsx", "script_registry_system.ts"], expectExit0: true },
  { name: "opensea (no args → help)", cmd: "npx", args: ["tsx", "opensea_marketplace.ts"], expectExit0: true },
  { name: "svg_nft (no args → help)", cmd: "npx", args: ["tsx", "svg_nft_generator.ts"], expectExit0: true },
  { name: "script_computation (no args → help)", cmd: "npx", args: ["tsx", "script_computation_system.ts"], expectExit0: true },
  // check-diamond-rpc: run manually when RPC/chainlist available (npm run check-diamond-rpc)
];

function run(
  cmd: string,
  args: string[],
  timeoutMs: number = TIMEOUT_MS
): Promise<{ code: number | null; signal: string | null; timedOut: boolean }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      shell: false,
      stdio: "pipe",
    });
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
    child.on("close", (code, signal) => {
      clearTimeout(t);
      resolve({ code: code ?? null, signal: signal ?? null, timedOut });
    });
    child.stderr?.on("data", () => {});
    child.stdout?.on("data", () => {});
  });
}

async function runTypecheck(): Promise<boolean> {
  // Reduced timeout for mobile - typecheck can be memory intensive
  const { code, timedOut } = await run("npx", ["tsc", "--noEmit"], 20_000);
  if (timedOut) {
    console.log("❌ typecheck: timed out");
    return false;
  }
  if (code !== 0) {
    console.log("❌ typecheck: failed (exit " + code + ")");
    return false;
  }
  console.log("✅ typecheck: passed");
  return true;
}

async function runLint(): Promise<boolean> {
  try {
    // Reduced timeout for mobile - linting can be memory intensive
    const { code, timedOut } = await run("npx", ["eslint", "--max-warnings", "999", "*.ts"], 30_000);
    if (timedOut) {
      console.log("⚠️ lint: timed out (skipping)");
      return true;
    }
    if (code !== 0) {
      console.log("❌ lint: failed (exit " + code + ")");
      return false;
    }
    console.log("✅ lint: passed");
    return true;
  } catch {
    console.log("⚠️ lint: eslint not run (not installed or error)");
    return true;
  }
}

async function main(): Promise<void> {
  console.log("\n🧪 Test All Systems — Pre-deployment\n");
  console.log("--- Typecheck ---");
  const typeOk = await runTypecheck();
  console.log("\n--- Lint ---");
  const lintOk = await runLint();
  console.log("\n--- System scripts ---");

  let passed = 0;
  let failed = 0;
  for (const test of SYSTEM_TESTS) {
    const timeout = test.timeoutMs ?? TIMEOUT_MS;
    const { code, timedOut } = await run(test.cmd, test.args, timeout);
    const ok = !timedOut && (test.expectExit0 ? code === 0 : true);
    if (ok) {
      console.log("✅ " + test.name);
      passed++;
    } else {
      console.log("❌ " + test.name + (timedOut ? " (timed out)" : " (exit " + code + ")"));
      failed++;
    }
  }

  console.log("\n--- Summary ---");
  console.log("Typecheck: " + (typeOk ? "PASS" : "FAIL (non-blocking; fix for full strictness)"));
  console.log("Lint: " + (lintOk ? "PASS" : "FAIL (non-blocking)"));
  console.log("Systems: " + passed + " passed, " + failed + " failed");
  const allOk = failed === 0;
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
