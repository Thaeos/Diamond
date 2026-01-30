#!/usr/bin/env python3
"""
Setup Safe{Wallet} Integration
===============================

Sets up Safe{Wallet} with MetaMask SDK + WalletConnect + Diamond Contract.
"""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "integrations"))

from safe_wallet import UnifiedWalletInterface, SafeWalletIntegration


def setup_safe_wallet(diamond_address: str = None, safe_address: str = None):
    """Setup Safe{Wallet} integration"""
    print("=" * 80)
    print("SAFE{WALLET} INTEGRATION SETUP")
    print("=" * 80)
    print()
    
    # Initialize
    wallet = UnifiedWalletInterface(diamond_address)
    
    # Get configurations
    config = wallet.get_unified_config()
    
    print("Configuration:")
    print(f"  ENS: {config['ens']}")
    print(f"  Email: {config['email']}")
    print(f"  Diamond Address: {config['diamond']['address'] or 'Not set'}")
    print(f"  Safe Address: {config['safe']['address'] or 'Not set'}")
    print()
    
    print("Networks:")
    for name, net in config['networks'].items():
        primary = " (PRIMARY)" if net.get('primary') else ""
        print(f"  {name}: Chain ID {net['chain_id']}{primary}")
    print()
    
    # Generate React config
    print("Generating React/TypeScript configuration...")
    react_config = wallet.generate_react_config()
    
    # Save configs
    config_dir = Path(__file__).parent.parent / "config" / "wallet"
    config_dir.mkdir(parents=True, exist_ok=True)
    
    # Save JSON config
    config_file = config_dir / "safe_wallet_config.json"
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    print(f"✅ Config saved: {config_file}")
    
    # Save React config
    react_config_file = config_dir / "wallet.config.ts"
    with open(react_config_file, 'w') as f:
        f.write(react_config)
    print(f"✅ React config saved: {react_config_file}")
    
    print()
    print("=" * 80)
    print("SETUP COMPLETE")
    print("=" * 80)
    print()
    print("Next steps:")
    print("  1. Install dependencies:")
    print("     npm install @metamask/sdk @walletconnect/modal @safe-global/safe-core-sdk")
    print()
    print("  2. Deploy Safe{Wallet} on all chains")
    print("  3. Add Diamond Contract as Safe module")
    print("  4. Configure multi-sig threshold")
    print("  5. Test integration")
    print()
    
    return config


def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Setup Safe{Wallet} integration")
    parser.add_argument("--diamond", type=str, help="Diamond contract address")
    parser.add_argument("--safe", type=str, help="Safe{Wallet} address")
    
    args = parser.parse_args()
    
    setup_safe_wallet(
        diamond_address=args.diamond,
        safe_address=args.safe
    )


if __name__ == "__main__":
    main()
