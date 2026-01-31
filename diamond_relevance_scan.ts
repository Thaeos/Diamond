/**
 * 80% Relevance Scan: Crypto ecosystem vs Diamond framework
 * Scores chains from Chainlist by relevance to EIP-2535 Diamond / Treasure-style stack.
 * Output: purpose summary only — no integration of query results.
 */

const CHAINLIST_RPCS_URL = 'https://chainlist.org/rpcs.json';

interface ChainlistChain {
  name: string;
  chain: string;
  chainId: number;
  shortName?: string;
  rpc?: Array<{ url: string } | string>;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  explorers?: Array<{ name: string; url: string }>;
  infoURL?: string;
  parent?: { type?: string; chain?: string };
  tvl?: number;
  isTestnet?: boolean;
  features?: Array<{ name: string }>;
  status?: string;
}

function extractHttpRpcCount(chain: ChainlistChain): number {
  if (!chain.rpc?.length) return 0;
  return chain.rpc.filter((r) => {
    const u = typeof r === 'string' ? r : (r as { url?: string }).url;
    return u && (u.startsWith('http://') || u.startsWith('https://'));
  }).length;
}

function scoreRelevance(chain: ChainlistChain): number {
  let score = 0;
  const max = 10;

  // EVM + has HTTP RPC (required for Diamond deployment)
  const httpRpcs = extractHttpRpcCount(chain);
  if (httpRpcs > 0) score += 2.5;
  else return 0;

  // Mainnet (not testnet) — production deployments
  if (!chain.isTestnet) score += 1.5;
  else score += 0.5;

  // Multiple RPCs = reliability for checks/deploys
  if (httpRpcs >= 3) score += 1;
  else if (httpRpcs >= 1) score += 0.5;

  // L2 or parachain (scaling / Diamond-friendly ecosystems)
  if (chain.parent?.type === 'L2' || chain.parent?.chain?.startsWith('eip155')) score += 1.5;
  else if (chain.parent) score += 0.75;

  // Explorer (verification, UX)
  if (chain.explorers?.length) score += 1;

  // TVL or ecosystem size (liquidity / adoption)
  if (chain.tvl != null && chain.tvl > 1_000_000) score += 1;
  else if (chain.tvl != null && chain.tvl > 0) score += 0.5;

  // EIP-1559 or modern features (gas UX)
  const hasEIP1559 = chain.features?.some((f) => f.name === 'EIP1559');
  if (hasEIP1559) score += 0.5;

  // Status active
  if (chain.status === 'active') score += 0.5;

  return Math.min(1, score / max);
}

async function main() {
  console.log('Fetching Chainlist...');
  const res = await fetch(CHAINLIST_RPCS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const chains: ChainlistChain[] = await res.json();

  const RELEVANCE_THRESHOLD = 0.8;
  const scored = chains
    .map((c) => ({ chain: c, score: scoreRelevance(c) }))
    .filter((x) => x.score >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  const outputPath = '/home/theos/diamond_relevance_findings.json';
  const fs = await import('fs');
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      scored.map(({ chain, score }) => ({
        chainId: chain.chainId,
        name: chain.name,
        chain: chain.chain,
        shortName: chain.shortName,
        score: Math.round(score * 100) / 100,
        tvl: chain.tvl,
        isTestnet: chain.isTestnet,
        parent: chain.parent,
        rpcCount: extractHttpRpcCount(chain),
      })),
      null,
      2
    )
  );

  console.log(`\n80%+ relevance: ${scored.length} chains (threshold ${RELEVANCE_THRESHOLD})`);
  console.log(`Saved to ${outputPath}\n`);
  scored.slice(0, 30).forEach(({ chain, score }) => {
    console.log(`  ${(score * 100).toFixed(0)}%  ${chain.name} (${chain.chainId})`);
  });
  if (scored.length > 30) console.log(`  ... and ${scored.length - 30} more`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
