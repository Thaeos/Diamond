// Unified Wallet Configuration
// Diamond Contract + Safe{Wallet} + MetaMask SDK + WalletConnect

export const walletConfig = {
  ens: "theosmagic.uni.eth",
  email: "theosmagic.uni.eth@ethermail.io",
  diamond: {
    address: "",
    description: "Evolving Diamond Contract"
  },
  safe: {
    address: "",
    description: "Safe{Wallet} smart contract wallet"
  },
  networks: {
  "ethereum": {
    "chain_id": 1,
    "name": "Ethereum Mainnet"
  },
  "arbitrum": {
    "chain_id": 42161,
    "name": "Arbitrum One",
    "primary": true
  },
  "polygon": {
    "chain_id": 137,
    "name": "Polygon"
  },
  "base": {
    "chain_id": 8453,
    "name": "Base"
  }
}
};

// MetaMask SDK Config
export const metamaskConfig = {
  "dapp_metadata": {
    "name": "Diamond Contract",
    "url": "https://theosmagic.uni.eth"
  },
  "infura_api_key": "",
  "modals": {
    "install": {
      "link": "https://metamask.io/download"
    }
  },
  "networks": [
    {
      "chainId": "0x1",
      "chainName": "Ethereum Mainnet",
      "rpcUrls": [
        ""
      ],
      "nativeCurrency": {
        "name": "Ether",
        "symbol": "ETH",
        "decimals": 18
      }
    },
    {
      "chainId": "0xa4b1",
      "chainName": "Arbitrum One",
      "rpcUrls": [
        ""
      ],
      "nativeCurrency": {
        "name": "Ether",
        "symbol": "ETH",
        "decimals": 18
      }
    },
    {
      "chainId": "0x89",
      "chainName": "Polygon",
      "rpcUrls": [
        ""
      ],
      "nativeCurrency": {
        "name": "MATIC",
        "symbol": "MATIC",
        "decimals": 18
      }
    },
    {
      "chainId": "0x2105",
      "chainName": "Base",
      "rpcUrls": [
        ""
      ],
      "nativeCurrency": {
        "name": "Ether",
        "symbol": "ETH",
        "decimals": 18
      }
    }
  ]
};

// WalletConnect Config
export const walletConnectConfig = {
  "projectId": "",
  "metadata": {
    "name": "Diamond Contract",
    "description": "Evolving Diamond Contract with Safe{Wallet}",
    "url": "https://theosmagic.uni.eth",
    "icons": [
      "https://theosmagic.uni.eth/icon.png"
    ]
  },
  "chains": [
    "eip155:1",
    "eip155:42161",
    "eip155:137",
    "eip155:8453"
  ],
  "optionalChains": [
    "eip155:1",
    "eip155:42161",
    "eip155:137",
    "eip155:8453"
  ],
  "methods": [
    "eth_sendTransaction",
    "eth_signTransaction",
    "eth_sign",
    "personal_sign",
    "eth_signTypedData"
  ],
  "events": [
    "chainChanged",
    "accountsChanged"
  ]
};

// Safe{Wallet} Config
export const safeConfig = {
  "safe_address": "",
  "diamond_address": "",
  "ens": "theosmagic.uni.eth",
  "email": "theosmagic.uni.eth@ethermail.io",
  "networks": {
    "ethereum": {
      "chain_id": 1,
      "name": "Ethereum Mainnet"
    },
    "arbitrum": {
      "chain_id": 42161,
      "name": "Arbitrum One",
      "primary": true
    },
    "polygon": {
      "chain_id": 137,
      "name": "Polygon"
    },
    "base": {
      "chain_id": 8453,
      "name": "Base"
    }
  },
  "rpc_urls": {
    "ethereum": "",
    "arbitrum": "",
    "polygon": "",
    "base": ""
  }
};
