/**
 * Chainlink-style TreasureDAO Floor Price Monitor
 *
 * Feeds your "Hot or Not" pipeline with on-chain truth. Use as:
 * - Live data feed: run in loop or cron; alerts when floor crosses thresholds.
 * - Input to Chainlink Automation: script exits with code / writes state for Upkeep.
 *
 * Data sources (configurable):
 * - Reservoir API (NFT floor) — set RESERVOIR_API_KEY for higher rate limits.
 * - Blockscout (Arbitrum) — transactions, balances, contract state.
 *
 * Usage:
 *   npm run treasure-floor              # one-shot, print floor
 *   npm run treasure-floor -- --watch   # poll every N seconds, alert on threshold
 *   npm run treasure-floor -- --alert-below 0.5 --alert-above 2.0
 */

const ARBITRUM_CHAIN_ID = 42161;
const DEFAULT_POLL_SECONDS = 60;

// TreasureDAO / Bridgeworld–related collection on Arbitrum (example; replace with your target)
const DEFAULT_COLLECTION =
  process.env.TREASURE_COLLECTION ?? "0xfe8c1ac365ba6780aec5a985d989b327c27670a1"; // Bridgeworld Legions example

interface FloorResult {
  collection: string;
  chainId: number;
  floorPriceWei: string;
  floorPriceEth: number;
  currency: string;
  source: string;
  timestamp: string;
  error?: string;
}

/**
 * Fetch NFT floor price from Reservoir API (supports Arbitrum).
 * Requires collection contract address. Optional: RESERVOIR_API_KEY for rate limits.
 */
async function fetchFloorReservoir(
  collection: string,
  chainId: number = ARBITRUM_CHAIN_ID
): Promise<FloorResult> {
  const base = "https://api.reservoir.tools";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.RESERVOIR_API_KEY) {
    headers["x-api-key"] = process.env.RESERVOIR_API_KEY;
  }

  const url = `${base}/collections/v7?id=${collection}&chainId=${chainId}`;
  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (e) {
    const err =
      (e as { cause?: Error })?.cause?.message ??
      (e instanceof Error ? e.message : String(e));
    return {
      collection,
      chainId,
      floorPriceWei: "0",
      floorPriceEth: 0,
      currency: "ETH",
      source: "reservoir",
      timestamp: new Date().toISOString(),
      error: `fetch failed: ${err}`,
    };
  }
  if (!res.ok) {
    const text = await res.text();
    return {
      collection,
      chainId,
      floorPriceWei: "0",
      floorPriceEth: 0,
      currency: "ETH",
      source: "reservoir",
      timestamp: new Date().toISOString(),
      error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
    };
  }

  let data: {
    collections?: Array<{
      id?: string;
      floorAsk?: { price?: { amount?: { raw?: string }; currency?: { symbol?: string } } };
      floorSale?: { amount?: string };
    }>;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    return {
      collection,
      chainId,
      floorPriceWei: "0",
      floorPriceEth: 0,
      currency: "ETH",
      source: "reservoir",
      timestamp: new Date().toISOString(),
      error: "Invalid JSON response",
    };
  }
  const col = data.collections?.[0];
  const floorAsk = col?.floorAsk;
  const raw =
    floorAsk?.price?.amount?.raw ??
    (col as { floorSale?: { amount?: string } })?.floorSale?.amount ??
    "0";
  const symbol = floorAsk?.price?.currency?.symbol ?? "ETH";
  const floorEth = Number(raw) / 1e18;

  return {
    collection,
    chainId,
    floorPriceWei: raw,
    floorPriceEth: floorEth,
    currency: symbol,
    source: "reservoir",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch floor using Blockscout-style API (if you have a custom indexer that exposes floor).
 * Blockscout itself doesn’t expose NFT floor; this is a stub for a custom endpoint.
 */
async function fetchFloorBlockscout(
  collection: string,
  _chainId: number
): Promise<FloorResult | null> {
  const blockscoutApi =
    process.env.BLOCKSCOUT_API ?? "https://arbitrum.blockscout.com/api";
  // Example: your own backend that aggregates floor from events
  const url = `${blockscoutApi}/v2/nft/collections/${collection}/floor`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { floorPriceWei?: string; currency?: string };
    const wei = data.floorPriceWei ?? "0";
    return {
      collection,
      chainId: _chainId,
      floorPriceWei: wei,
      floorPriceEth: Number(wei) / 1e18,
      currency: data.currency ?? "ETH",
      source: "blockscout",
      timestamp: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function getFloor(
  collection: string = DEFAULT_COLLECTION,
  chainId: number = ARBITRUM_CHAIN_ID
): Promise<FloorResult> {
  try {
    const blockscout = await fetchFloorBlockscout(collection, chainId);
    if (blockscout?.floorPriceEth != null && blockscout.floorPriceEth > 0) {
      return blockscout;
    }
  } catch {
    // ignore; fall back to Reservoir
  }
  return fetchFloorReservoir(collection, chainId);
}

function printFloor(r: FloorResult): void {
  if (r.error) {
    console.error(`[treasure-floor] ${r.source} error: ${r.error}`);
    return;
  }
  console.log(
    `[treasure-floor] ${r.collection} | ${r.floorPriceEth.toFixed(6)} ${r.currency} | ${r.source} | ${r.timestamp}`
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const alertBelowIdx = args.indexOf("--alert-below");
  const alertAboveIdx = args.indexOf("--alert-above");
  const alertBelow =
    alertBelowIdx >= 0 && args[alertBelowIdx + 1]
      ? parseFloat(args[alertBelowIdx + 1])
      : null;
  const alertAbove =
    alertAboveIdx >= 0 && args[alertAboveIdx + 1]
      ? parseFloat(args[alertAboveIdx + 1])
      : null;
  const pollIdx = args.indexOf("--poll");
  const pollSec =
    pollIdx >= 0 && args[pollIdx + 1]
      ? parseInt(args[pollIdx + 1], 10) || DEFAULT_POLL_SECONDS
      : DEFAULT_POLL_SECONDS;
  const collection =
    args.find((a) => a.startsWith("0x") && a.length === 42) ?? DEFAULT_COLLECTION;

  const run = async (): Promise<boolean> => {
    const result = await getFloor(collection, ARBITRUM_CHAIN_ID);
    printFloor(result);
    if (result.error) return false;
    const floor = result.floorPriceEth;
    if (alertBelow != null && floor < alertBelow) {
      console.error(
        `\n[treasure-floor] ALERT: floor ${floor.toFixed(6)} ETH below ${alertBelow} ETH\n`
      );
      process.exitCode = 1;
      return true;
    }
    if (alertAbove != null && floor > alertAbove) {
      console.error(
        `\n[treasure-floor] ALERT: floor ${floor.toFixed(6)} ETH above ${alertAbove} ETH\n`
      );
      process.exitCode = 1;
      return true;
    }
    return false;
  };

  if (watch) {
    console.log(
      `[treasure-floor] watch mode, collection=${collection}, poll=${pollSec}s, alert-below=${alertBelow ?? "-"}, alert-above=${alertAbove ?? "-"}\n`
    );
    for (;;) {
      const alerted = await run();
      if (alerted) break;
      await new Promise((r) => setTimeout(r, pollSec * 1000));
    }
  } else {
    await run();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { getFloor, fetchFloorReservoir, type FloorResult };
