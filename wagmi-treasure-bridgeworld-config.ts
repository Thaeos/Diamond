/**
 * Wagmi Configuration for Treasure.lol and Bridgeworld.lol Integration
 * 
 * This configuration file shows how to set up MetaMask SDK with Wagmi
 * for integrations with treasure.lol and bridgeworld.lol
 * 
 * Based on: https://docs.metamask.io/sdk/connect/javascript-wagmi/
 */

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Integrated networks: peaq, Fuse, Katana, Moonriver (Diamond framework)
const peaq = defineChain({
  id: 3338,
  name: 'peaq',
  nativeCurrency: { name: 'peaq', symbol: 'PEAQ', decimals: 18 },
  rpcUrls: { default: { http: ['https://quicknode1.peaq.xyz'] } },
  blockExplorers: { default: { name: 'Subscan', url: 'https://peaq.subscan.io' } },
});
const fuse = defineChain({
  id: 122,
  name: 'Fuse Mainnet',
  nativeCurrency: { name: 'Fuse', symbol: 'FUSE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.fuse.io'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.fuse.io' } },
});
const katana = defineChain({
  id: 747474,
  name: 'Katana',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.katana.network'] } },
  blockExplorers: { default: { name: 'Katanascan', url: 'https://katanascan.com' } },
});
const moonriver = defineChain({
  id: 1285,
  name: 'Moonriver',
  nativeCurrency: { name: 'Moonriver', symbol: 'MOVR', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.api.moonriver.moonbeam.network'] } },
  blockExplorers: { default: { name: 'Moonscan', url: 'https://moonriver.moonscan.io' } },
});

const diamondChains = [mainnet, sepolia, arbitrum, peaq, fuse, katana, moonriver];

// Configuration for Treasure.lol
export const treasureConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: diamondChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Treasure',
        url: 'https://treasure.lol',
        iconUrl: 'https://treasure.lol/favicon.ico',
      },
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    }),
  ],
  transports: Object.fromEntries(diamondChains.map((c) => [c.id, http()])),
});

// Configuration for Bridgeworld.lol
export const bridgeworldConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: diamondChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Bridgeworld',
        url: 'https://bridgeworld.lol',
        iconUrl: 'https://bridgeworld.lol/favicon.ico',
      },
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    }),
  ],
  transports: Object.fromEntries(diamondChains.map((c) => [c.id, http()])),
});

// Combined configuration (if you want to support both)
export const combinedConfig = createConfig({
  multiInjectedProviderDiscovery: false,
  chains: diamondChains,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Treasure Ecosystem',
        url: typeof window !== 'undefined' 
          ? window.location.origin 
          : 'https://treasure.lol',
        iconUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/favicon.ico`
          : 'https://treasure.lol/favicon.ico',
      },
      infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY!,
    }),
  ],
  transports: Object.fromEntries(diamondChains.map((c) => [c.id, http()])),
});

declare module 'wagmi' {
  interface Register {
    config: typeof combinedConfig;
  }
}
