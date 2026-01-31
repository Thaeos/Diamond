/**
 * Inquery: peaq, Fuse Mainnet, Katana, Moonriver
 * Fetches chain metadata and RPC endpoints from Chainlist for these networks.
 */

const CHAINLIST_RPCS_URL = 'https://chainlist.org/rpcs.json';

interface ChainlistRPC {
  url: string;
  tracking?: string;
}

interface ChainlistChainData {
  name: string;
  chain: string;
  chainId: number;
  rpc: Array<string | ChainlistRPC>;
  nativeCurrency?: { name: string; symbol: string; decimals: number };
  explorers?: Array<{ name: string; url: string; standard: string }>;
  infoURL?: string;
  shortName?: string;
}

// Target chains: peaq, Fuse mainnet, Katana, Moonriver
const TARGET_CHAIN_IDS = [
  3338,    // peaq
  122,     // Fuse Mainnet
  747474,  // Katana
  1285,    // Moonriver
];

function extractHttpRpcs(chainData: ChainlistChainData): string[] {
  if (!chainData.rpc || !Array.isArray(chainData.rpc)) return [];
  const out: string[] = [];
  for (const rpc of chainData.rpc) {
    const url = typeof rpc === 'string' ? rpc : (rpc?.url ?? '');
    if (url && (url.startsWith('http://') || url.startsWith('https://')))
      out.push(url);
  }
  return out;
}

async function main() {
  console.log('Fetching chain data from Chainlist...\n');
  const res = await fetch(CHAINLIST_RPCS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const allChains: ChainlistChainData[] = await res.json();

  const results: Array<{
    chainId: number;
    name: string;
    chain: string;
    shortName?: string;
    nativeCurrency?: { name: string; symbol: string; decimals: number };
    infoURL?: string;
    explorers?: Array<{ name: string; url: string }>;
    rpc: string[];
  }> = [];

  for (const chainId of TARGET_CHAIN_IDS) {
    const chain = allChains.find((c) => c.chainId === chainId);
    if (!chain) {
      console.log(`⚠️  Chain ${chainId} not found in Chainlist`);
      continue;
    }
    const httpRpcs = extractHttpRpcs(chain);
    results.push({
      chainId: chain.chainId,
      name: chain.name,
      chain: chain.chain,
      shortName: chain.shortName,
      nativeCurrency: chain.nativeCurrency,
      infoURL: chain.infoURL,
      explorers: chain.explorers?.map((e) => ({ name: e.name, url: e.url })),
      rpc: httpRpcs,
    });
    console.log(`✅ ${chain.name} (chainId ${chainId}): ${httpRpcs.length} HTTP RPC(s)`);
  }

  console.log('\n--- Summary ---\n');
  for (const r of results) {
    console.log(`${r.name} (${r.chain})`);
    console.log(`  chainId: ${r.chainId}`);
    console.log(`  shortName: ${r.shortName ?? '-'}`);
    console.log(`  native: ${r.nativeCurrency?.symbol ?? '-'} (${r.nativeCurrency?.name ?? '-'})`);
    console.log(`  info: ${r.infoURL ?? '-'}`);
    if (r.explorers?.length) {
      console.log(`  explorers: ${r.explorers.map((e) => e.url).join(', ')}`);
    }
    console.log(`  RPC (HTTP): ${r.rpc.length}`);
    r.rpc.slice(0, 5).forEach((u, i) => console.log(`    ${i + 1}. ${u}`));
    if (r.rpc.length > 5) console.log(`    ... and ${r.rpc.length - 5} more`);
    console.log('');
  }

  // Optional: save for use with fetch_chainlist_rpcs / check_diamondcut_rpc
  const fs = await import('fs');
  const outputPath = '/home/theos/inquery_chains_result.json';
  fs.writeFileSync(outputPath, JSON.stringify(Object.fromEntries(results.map((r) => [r.chainId.toString(), r])), null, 2));
  console.log(`Saved full result to ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
