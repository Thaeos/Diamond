"""
Safe{Wallet} Integration
========================

Integrates MetaMask SDK + WalletConnect kit + Diamond Contract into Safe{Wallet}.

Safe{Wallet} is a smart contract wallet with:
- Multi-sig support
- Modular architecture
- Programmable security
- Gasless transactions
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
import json


def load_env():
    """Load environment variables from env.txt"""
    config = {}
    possible_paths = [
        "/mnt/Vault/env.txt",
        "/mnt/Vault/Cursor-Agent/env.txt",
        os.path.join(os.getcwd(), "env.txt")
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#') or line.startswith('-----'):
                        continue
                    if '=' in line:
                        key_part, value = line.split('=', 1)
                        key = key_part.strip()
                        if key.startswith('export '):
                            key = key[7:].strip()
                        config[key] = value.strip().strip('"').strip("'")
            break
    
    return config


ENV = load_env()


class SafeWalletIntegration:
    """
    Safe{Wallet} Integration
    
    Combines:
    - MetaMask SDK (browser extension)
    - WalletConnect kit (mobile/QR)
    - Diamond Contract (single address, evolving)
    - Safe{Wallet} (smart contract wallet)
    """
    
    def __init__(self, diamond_address: str = None):
        """
        Initialize Safe{Wallet} integration
        
        Args:
            diamond_address: Diamond Contract address
        """
        self.diamond_address = diamond_address or ENV.get('DIAMOND_ADDRESS', '')
        self.safe_address = ENV.get('SAFE_WALLET_ADDRESS', '')
        
        # Default ENS
        self.ens = ENV.get('ENS_NAME', 'theosmagic.uni.eth')
        self.email = ENV.get('DIGITAL_PERSONA_EMAIL', 'theosmagic.uni.eth@ethermail.io')
        
        # Network configuration
        self.networks = {
            "ethereum": {"chain_id": 1, "name": "Ethereum Mainnet"},
            "arbitrum": {"chain_id": 42161, "name": "Arbitrum One", "primary": True},
            "polygon": {"chain_id": 137, "name": "Polygon"},
            "base": {"chain_id": 8453, "name": "Base"},
        }
    
    def get_safe_config(self) -> Dict[str, Any]:
        """
        Get Safe{Wallet} configuration
        
        Returns:
            Configuration for Safe SDK
        """
        return {
            "safe_address": self.safe_address,
            "diamond_address": self.diamond_address,
            "ens": self.ens,
            "email": self.email,
            "networks": self.networks,
            "rpc_urls": {
                "ethereum": ENV.get('ETHEREUM_RPC_URL', ''),
                "arbitrum": ENV.get('ARBITRUM_RPC_URL', ''),
                "polygon": ENV.get('POLYGON_RPC_URL', ''),
                "base": ENV.get('BASE_RPC_URL', ''),
            }
        }
    
    def get_metamask_sdk_config(self) -> Dict[str, Any]:
        """
        Get MetaMask SDK configuration
        
        Returns:
            Configuration for MetaMask SDK
        """
        return {
            "dapp_metadata": {
                "name": "Diamond Contract",
                "url": f"https://{self.ens}",
            },
            "infura_api_key": ENV.get('INFURA_API_KEY', ''),
            "modals": {
                "install": {
                    "link": "https://metamask.io/download"
                }
            },
            "networks": [
                {
                    "chainId": "0x1",
                    "chainName": "Ethereum Mainnet",
                    "rpcUrls": [ENV.get('ETHEREUM_RPC_URL', '')],
                    "nativeCurrency": {
                        "name": "Ether",
                        "symbol": "ETH",
                        "decimals": 18
                    }
                },
                {
                    "chainId": "0xa4b1",
                    "chainName": "Arbitrum One",
                    "rpcUrls": [ENV.get('ARBITRUM_RPC_URL', '')],
                    "nativeCurrency": {
                        "name": "Ether",
                        "symbol": "ETH",
                        "decimals": 18
                    }
                },
                {
                    "chainId": "0x89",
                    "chainName": "Polygon",
                    "rpcUrls": [ENV.get('POLYGON_RPC_URL', '')],
                    "nativeCurrency": {
                        "name": "MATIC",
                        "symbol": "MATIC",
                        "decimals": 18
                    }
                },
                {
                    "chainId": "0x2105",
                    "chainName": "Base",
                    "rpcUrls": [ENV.get('BASE_RPC_URL', '')],
                    "nativeCurrency": {
                        "name": "Ether",
                        "symbol": "ETH",
                        "decimals": 18
                    }
                }
            ]
        }
    
    def get_walletconnect_config(self) -> Dict[str, Any]:
        """
        Get WalletConnect kit configuration
        
        Returns:
            Configuration for WalletConnect
        """
        project_id = ENV.get('WALLETCONNECT_PROJECT_ID', '')
        
        return {
            "projectId": project_id,
            "metadata": {
                "name": "Diamond Contract",
                "description": "Evolving Diamond Contract with Safe{Wallet}",
                "url": f"https://{self.ens}",
                "icons": [f"https://{self.ens}/icon.png"]
            },
            "chains": [
                "eip155:1",      # Ethereum
                "eip155:42161",   # Arbitrum
                "eip155:137",     # Polygon
                "eip155:8453",    # Base
            ],
            "optionalChains": [
                "eip155:1",
                "eip155:42161",
                "eip155:137",
                "eip155:8453",
            ],
            "methods": [
                "eth_sendTransaction",
                "eth_signTransaction",
                "eth_sign",
                "personal_sign",
                "eth_signTypedData",
            ],
            "events": [
                "chainChanged",
                "accountsChanged",
            ]
        }
    
    def get_diamond_safe_integration(self) -> Dict[str, Any]:
        """
        Get Diamond Contract + Safe{Wallet} integration config
        
        Returns:
            Configuration for Diamond-Safe integration
        """
        return {
            "diamond_address": self.diamond_address,
            "safe_address": self.safe_address,
            "integration_type": "diamond_as_safe_module",
            "description": "Diamond Contract integrated as Safe{Wallet} module",
            "capabilities": [
                "diamond_cut",
                "facet_upgrades",
                "multi_chain_operations",
                "gasless_transactions",
                "programmable_security"
            ],
            "networks": {
                chain_id: {
                    "diamond": self.diamond_address,
                    "safe": self.safe_address,
                    "chain_id": chain_id
                }
                for chain_id in [1, 42161, 137, 8453]
            }
        }


class UnifiedWalletInterface:
    """
    Unified Wallet Interface
    
    Provides single interface for:
    - MetaMask SDK
    - WalletConnect kit
    - Safe{Wallet}
    - Diamond Contract
    """
    
    def __init__(self, diamond_address: str = None):
        """Initialize unified wallet interface"""
        self.safe = SafeWalletIntegration(diamond_address)
        self.diamond_address = diamond_address or self.safe.diamond_address
        self.safe_address = self.safe.safe_address
        
        # Configurations
        self.metamask_config = self.safe.get_metamask_sdk_config()
        self.walletconnect_config = self.safe.get_walletconnect_config()
        self.safe_config = self.safe.get_safe_config()
        self.diamond_safe_config = self.safe.get_diamond_safe_integration()
    
    def get_unified_config(self) -> Dict[str, Any]:
        """
        Get unified configuration for all wallet systems
        
        Returns:
            Complete configuration
        """
        return {
            "ens": self.safe.ens,
            "email": self.safe.email,
            "diamond": {
                "address": self.diamond_address,
                "description": "Evolving Diamond Contract"
            },
            "safe": {
                "address": self.safe_address,
                "description": "Safe{Wallet} smart contract wallet"
            },
            "metamask": self.metamask_config,
            "walletconnect": self.walletconnect_config,
            "integration": self.diamond_safe_config,
            "networks": self.safe.networks
        }
    
    def generate_react_config(self) -> str:
        """
        Generate React/TypeScript configuration
        
        Returns:
            TypeScript config for React app
        """
        config = self.get_unified_config()
        
        return f"""// Unified Wallet Configuration
// Diamond Contract + Safe{{Wallet}} + MetaMask SDK + WalletConnect

export const walletConfig = {{
  ens: "{config['ens']}",
  email: "{config['email']}",
  diamond: {{
    address: "{config['diamond']['address']}",
    description: "{config['diamond']['description']}"
  }},
  safe: {{
    address: "{config['safe']['address']}",
    description: "{config['safe']['description']}"
  }},
  networks: {json.dumps(config['networks'], indent=2)}
}};

// MetaMask SDK Config
export const metamaskConfig = {json.dumps(self.metamask_config, indent=2)};

// WalletConnect Config
export const walletConnectConfig = {json.dumps(self.walletconnect_config, indent=2)};

// Safe{{Wallet}} Config
export const safeConfig = {json.dumps(self.safe_config, indent=2)};
"""


# Convenience functions
def get_unified_wallet_config(diamond_address: str = None) -> Dict[str, Any]:
    """Quick function to get unified wallet config"""
    wallet = UnifiedWalletInterface(diamond_address)
    return wallet.get_unified_config()


if __name__ == "__main__":
    wallet = UnifiedWalletInterface()
    
    print("=" * 80)
    print("UNIFIED WALLET INTERFACE")
    print("=" * 80)
    print()
    
    config = wallet.get_unified_config()
    
    print(f"ENS: {config['ens']}")
    print(f"Email: {config['email']}")
    print(f"Diamond: {config['diamond']['address']}")
    print(f"Safe: {config['safe']['address']}")
    print()
    print("Networks:")
    for name, net in config['networks'].items():
        print(f"  {name}: Chain ID {net['chain_id']}")
    print()
    print("✅ Unified wallet configuration ready")
