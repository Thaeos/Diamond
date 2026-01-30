#!/usr/bin/env python3
"""
Setup Primary Wallet

Configures the primary default wallet that controls all operations.
"""

import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from integrations.wallet_manager import PrimaryWalletManager, get_primary_wallet_manager
from integrations.config import get_defaults


def setup_primary_wallet():
    """Setup and verify primary wallet configuration"""
    print("=" * 80)
    print("PRIMARY WALLET SETUP")
    print("=" * 80)
    print()
    
    manager = get_primary_wallet_manager()
    wallet_info = manager.get_wallet_info()
    
    print("Primary Wallet Configuration:")
    print("-" * 80)
    print(f"Address: {wallet_info['address']}")
    print(f"Email: {wallet_info['email']}")
    print(f"ENS: {wallet_info['ens']}")
    print(f"Is Primary: {wallet_info['is_primary']}")
    print()
    
    print("Controls:")
    for control in wallet_info['controls']:
        print(f"  ✅ {control}")
    print()
    
    print("Safe{Wallet} Owners:")
    owners = manager.get_safe_owners()
    for i, owner in enumerate(owners, 1):
        print(f"  {i}. {owner}")
    print()
    
    # Verify configuration
    defaults = get_defaults()
    primary_wallet_config = defaults.get("primary_wallet", {})
    
    if primary_wallet_config.get("address") == wallet_info['address']:
        print("✅ Primary wallet matches configuration")
    else:
        print("⚠️  Primary wallet address mismatch")
    
    print()
    print("=" * 80)
    print("✅ PRIMARY WALLET CONFIGURED")
    print("=" * 80)
    
    return wallet_info


if __name__ == "__main__":
    setup_primary_wallet()
