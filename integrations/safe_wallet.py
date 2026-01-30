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
from integrations.wallet_manager import get_primary_wallet_manager
from integrations.signature_verification import get_signature_verifier, verify_primary_wallet_signature


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
        # Import config to get primary wallet
        from integrations.config import get_primary_wallet, get_default_wallet_address
        
        self.diamond_address = diamond_address or ENV.get('DIAMOND_ADDRESS', '')
        self.safe_address = ENV.get('SAFE_WALLET_ADDRESS', '')
        
        # Get primary wallet manager
        wallet_manager = get_primary_wallet_manager()
        self.primary_wallet_address = wallet_manager.address
        self.ens = wallet_manager.ens
        self.email = wallet_manager.email
        
        # Override with environment variables if present
        self.primary_wallet_address = ENV.get('PUBLIC_ADDRESS', self.primary_wallet_address)
        self.ens = ENV.get('ENS_NAME', self.ens)
        self.email = ENV.get('DIGITAL_PERSONA_EMAIL', ENV.get('EMAIL', self.email))
        
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
        wallet_manager = get_primary_wallet_manager()
        
        return {
            "safe_address": self.safe_address,
            "diamond_address": self.diamond_address,
            "primary_wallet_address": self.primary_wallet_address,
            "primary_wallet_owners": wallet_manager.get_safe_owners(),
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
        
        Note: Recommended approach is to use Wagmi with MetaMask SDK connector
        
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
            "use_deeplink": True,
            "check_installation_immediately": True,
            "wagmi_integration": {
                "enabled": True,
                "recommended": True,
                "connector": "metaMask"
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
        Get WalletConnect AppKit configuration
        
        Note: WalletConnect has migrated from @walletconnect/modal to AppKit (@reown/appkit)
        
        Returns:
            Configuration for WalletConnect AppKit
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
                {"id": 1, "name": "Ethereum"},
                {"id": 42161, "name": "Arbitrum"},
                {"id": 137, "name": "Polygon"},
                {"id": 8453, "name": "Base"}
            ],
            "features": {
                "analytics": True,
                "email": False,
                "socials": False,
                "swaps": False,
                "onramp": False
            },
            "wagmiAdapter": {
                "enabled": True,
                "networks": [1, 42161, 137, 8453]
            }
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
            "primary_wallet_address": self.primary_wallet_address,
            "primary_wallet_email": self.email,
            "primary_wallet_ens": self.ens,
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
                    "primary_wallet": self.primary_wallet_address,
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
        
        # Signature verifier
        from integrations.signature_verification import get_signature_verifier
        self.signature_verifier = get_signature_verifier()
        self.signature_data = self.signature_verifier.get_signature_data()
    
    def get_unified_config(self) -> Dict[str, Any]:
        """
        Get unified configuration for all wallet systems
        
        Returns:
            Complete configuration
        """
        return {
            "primary_wallet": {
                "address": self.safe.primary_wallet_address,
                "email": self.safe.email,
                "ens": self.safe.ens,
                "is_primary": True,
                "description": "Primary default wallet - controls all operations",
                "signature": {
                    "message": self.signature_data["message"],
                    "signature": self.signature_data["signature"],
                    "is_valid": self.signature_data["is_valid"],
                    "verification_status": self.signature_data["verification_status"]
                }
            },
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
    
    def verify_signature(self, message: str = None, signature: str = None) -> Dict[str, Any]:
        """
        Verify Ethereum signature
        
        Args:
            message: Optional message to verify (defaults to primary wallet message)
            signature: Optional signature to verify (defaults to primary wallet signature)
        
        Returns:
            Verification result
        """
        if message is None and signature is None:
            # Verify primary wallet signature
            is_valid, recovered_address = verify_primary_wallet_signature()
        else:
            # Verify custom signature
            is_valid, recovered_address = self.signature_verifier.verify_signature(
                message or self.signature_verifier.PRIMARY_WALLET_MESSAGE,
                signature or self.signature_verifier.PRIMARY_WALLET_SIGNATURE,
                self.safe.primary_wallet_address
            )
        
        return {
            "is_valid": is_valid,
            "recovered_address": recovered_address,
            "expected_address": self.safe.primary_wallet_address,
            "matches_primary": recovered_address and recovered_address.lower() == self.safe.primary_wallet_address.lower()
        }
    
    def sign_message(self, message: str, private_key: str = None) -> str:
        """
        Sign a message (requires private key)
        
        Args:
            message: The message to sign
            private_key: The private key (if None, will use environment variable)
        
        Returns:
            The signature hex string
        """
        if private_key is None:
            # In production, get from secure storage
            raise ValueError("Private key required for signing")
        
        return self.signature_verifier.sign_message(message, private_key)
    
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
