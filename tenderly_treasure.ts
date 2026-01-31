/**
 * Tenderly integration for Treasure foundation and 65 repos
 *
 * - status: check Tenderly config (TENDERLY_ACCESS_KEY, project, username)
 * - simulate: simulate a transaction via Tenderly (API or Node RPC)
 * - verify: trigger contract verification via Tenderly API (requires source + compiler config)
 *
 * Env: TENDERLY_ACCESS_KEY, TENDERLY_USERNAME, TENDERLY_PROJECT, TENDERLY_NODE_ACCESS_KEY
 *
 * Usage:
 *   npm run tenderly-treasure status
 *   npm run tenderly-treasure simulate -- <from> <to> <data_hex> [chain_id]
 *   npm run tenderly-treasure verify -- <address> <network_id>
 */

const TENDERLY_API_BASE = "https://api.tenderly.co/api/v1";
const DEFAULT_CHAIN_ID = 42161; // Arbitrum

interface SimulateResult {
  success: boolean;
  gasUsed?: string;
  error?: string;
  output?: string;
}

async function status(): Promise<void> {
  const key = process.env.TENDERLY_ACCESS_KEY;
  const username = process.env.TENDERLY_USERNAME;
  const project = process.env.TENDERLY_PROJECT;
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;

  console.log("\n🔧 Tenderly Treasure — Status\n");
  console.log("  TENDERLY_ACCESS_KEY:    ", key ? `${key.slice(0, 8)}...` : "(not set)");
  console.log("  TENDERLY_USERNAME:     ", username ?? "(not set)");
  console.log("  TENDERLY_PROJECT:      ", project ?? "(not set)");
  console.log("  TENDERLY_NODE_ACCESS_KEY:", nodeKey ? `${nodeKey.slice(0, 8)}...` : "(not set)");

  if (!key) {
    console.log("\n  💡 Set TENDERLY_ACCESS_KEY for API verify/simulate. Get it from: https://dashboard.tenderly.co/account/projects");
    return;
  }

  try {
    const res = await fetch(`${TENDERLY_API_BASE}/account`, {
      headers: { "X-Access-Key": key },
    });
    if (res.ok) {
      const data = (await res.json()) as { user?: { username?: string } };
      console.log("\n  ✅ API reachable. User:", data.user?.username ?? "—");
    } else {
      console.log("\n  ⚠️ API returned", res.status);
    }
  } catch (e) {
    console.log("\n  ⚠️ API check failed:", (e as Error).message);
  }
}

async function simulate(
  from: string,
  to: string,
  dataHex: string,
  chainId: number = DEFAULT_CHAIN_ID
): Promise<SimulateResult> {
  const nodeKey = process.env.TENDERLY_NODE_ACCESS_KEY;
  const apiKey = process.env.TENDERLY_ACCESS_KEY;

  const payload = {
    from,
    to,
    data: dataHex.startsWith("0x") ? dataHex : `0x${dataHex}`,
    value: "0x0",
    gas: "0x0",
    gas_price: "0x0",
  };

  if (nodeKey) {
    const networkSlug = chainId === 42161 ? "arbitrum" : chainId === 137 ? "polygon" : "mainnet";
    const url = `https://${networkSlug}.gateway.tenderly.co/${nodeKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tenderly_simulateTransaction",
          params: [payload, "latest"],
        }),
      });
      const out = (await res.json()) as { result?: { transaction?: { status?: boolean }; gas_used?: string }; error?: { message?: string } };
      if (out.error) {
        return { success: false, error: out.error.message ?? "RPC error" };
      }
      const tx = out.result?.transaction;
      const gasUsed = out.result?.gas_used;
      return { success: tx?.status ?? false, gasUsed, output: gasUsed ? `Gas: ${gasUsed}` : undefined };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  if (apiKey && process.env.TENDERLY_PROJECT && process.env.TENDERLY_USERNAME) {
    const project = process.env.TENDERLY_PROJECT;
    const username = process.env.TENDERLY_USERNAME;
    const url = `${TENDERLY_API_BASE}/account/${username}/project/${project}/simulate`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": apiKey,
        },
        body: JSON.stringify({
          network_id: chainId.toString(),
          from,
          to,
          input: payload.data,
          value: "0",
          gas: 0,
          gas_price: "0",
          save: false,
          sim_type: "full",
        }),
      });
      const data = (await res.json()) as {
        transaction?: { status?: boolean };
        gas_used?: number;
      };
      const tx = data.transaction;
      const gasUsed = data.gas_used?.toString();
      return { success: tx?.status ?? false, gasUsed, output: gasUsed ? `Gas: ${gasUsed}` : undefined };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  return { success: false, error: "Set TENDERLY_NODE_ACCESS_KEY or TENDERLY_ACCESS_KEY + PROJECT + USERNAME" };
}

async function verifyCli(address: string, networkId: string): Promise<void> {
  console.log("\n📄 Tenderly verify (API) — address:", address, "network:", networkId);
  console.log("   For full verification from this repo, use Hardhat in a child repo with @tenderly/hardhat-tenderly.");
  console.log("   Or run: tenderly verify <contract> --network <network> (after tenderly login)");
  const key = process.env.TENDERLY_ACCESS_KEY;
  if (!key) {
    console.log("   Set TENDERLY_ACCESS_KEY to call verification API.");
    return;
  }
  const username = process.env.TENDERLY_USERNAME;
  const project = process.env.TENDERLY_PROJECT;
  if (!username || !project) {
    console.log("   Set TENDERLY_USERNAME and TENDERLY_PROJECT for API verify.");
    return;
  }
  console.log("   API base:", TENDERLY_API_BASE);
  console.log("   To verify via API you must POST contract source + compiler config. Use Hardhat plugin for automation.");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd === "status") {
    await status();
    return;
  }

  if (cmd === "simulate") {
    const from = args[1];
    const to = args[2];
    const dataHex = args[3] ?? "0x";
    const chainId = args[4] ? parseInt(args[4], 10) : DEFAULT_CHAIN_ID;
    if (!from || !to) {
      console.log("Usage: npm run tenderly-treasure simulate -- <from> <to> <data_hex> [chain_id]");
      process.exitCode = 1;
      return;
    }
    const result = await simulate(from, to, dataHex, chainId);
    console.log("\n📡 Simulate result:", result.success ? "success" : "failed");
    if (result.error) console.log("   Error:", result.error);
    if (result.output) console.log("   ", result.output);
    process.exitCode = result.success ? 0 : 1;
    return;
  }

  if (cmd === "verify") {
    const address = args[1];
    const networkId = args[2] ?? "42161";
    if (!address) {
      console.log("Usage: npm run tenderly-treasure verify -- <address> [network_id]");
      process.exitCode = 1;
      return;
    }
    await verifyCli(address, networkId);
    return;
  }

  console.log(`
Tenderly Treasure — contract verification, simulation, function use

Usage:
  npm run tenderly-treasure status
  npm run tenderly-treasure simulate -- <from> <to> <data_hex> [chain_id]
  npm run tenderly-treasure verify -- <address> [network_id]

Env: TENDERLY_ACCESS_KEY, TENDERLY_USERNAME, TENDERLY_PROJECT, TENDERLY_NODE_ACCESS_KEY
See TENDERLY_TREASURE.md for Hardhat verification and popular function use.
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { status, simulate, verifyCli };
