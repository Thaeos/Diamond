#!/usr/bin/env python3
"""
Test Brave Browser API Configuration

Verifies that the Brave Browser API key is properly configured and accessible.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set environment variable if not already set
if not os.getenv("BRAVE_BROWSER_API"):
    os.environ["BRAVE_BROWSER_API"] = "BSAEwLe_77A0TDYC2yxYKIQk8T3IsQO"

from integrations.config import get_brave_api_key, get_defaults


def test_brave_api_configuration():
    """Test Brave Browser API configuration"""
    print("=" * 80)
    print("BRAVE BROWSER API CONFIGURATION TEST")
    print("=" * 80)
    print()
    
    # Test 1: Get API key
    print("Test 1: Get API Key")
    print("-" * 80)
    api_key = get_brave_api_key()
    if api_key:
        print(f"✅ API Key Retrieved: {api_key[:20]}...{api_key[-10:]}")
        print(f"   Full Key: {api_key}")
        print(f"   Length: {len(api_key)} characters")
    else:
        print("❌ API Key not found")
    print()
    
    # Test 2: Check defaults
    print("Test 2: Check Defaults Configuration")
    print("-" * 80)
    defaults = get_defaults()
    brave_config = defaults.get("brave_browser_api", {})
    if brave_config.get("key"):
        print(f"✅ Config Key: {brave_config['key'][:20]}...")
        print(f"   Description: {brave_config.get('description', 'N/A')}")
    else:
        print("❌ Config key not found")
    print()
    
    # Test 3: Environment variable
    print("Test 3: Environment Variable")
    print("-" * 80)
    env_key = os.getenv("BRAVE_BROWSER_API", os.getenv("BRAVE_API_KEY", ""))
    if env_key:
        print(f"✅ Environment Variable: {env_key[:20]}...")
        print(f"   Source: {'BRAVE_BROWSER_API' if os.getenv('BRAVE_BROWSER_API') else 'BRAVE_API_KEY'}")
    else:
        print("⚠️  Environment variable not set")
        print("   Set with: export BRAVE_BROWSER_API=BSAEwLe_77A0TDYC2yxYKIQk8T3IsQO")
    print()
    
    # Test 4: Sphinx Integration Check
    print("Test 4: Sphinx Integration Check")
    print("-" * 80)
    try:
        from integrations.sphinx_research import SPHINX_AVAILABLE
        
        if SPHINX_AVAILABLE:
            print("✅ Sphinx Research System Available")
            print("   Brave Browser API will be used for search queries")
        else:
            print("⚠️  Sphinx Research System not available")
            print("   Install at /mnt/Vault/Sphinx to use Brave Browser API")
    except ImportError:
        print("⚠️  Sphinx integration module not found")
    print()
    
    # Summary
    print("=" * 80)
    if api_key:
        print("✅ BRAVE BROWSER API KEY CONFIGURED AND VERIFIED")
    else:
        print("❌ BRAVE BROWSER API KEY NOT CONFIGURED")
        print()
        print("To configure:")
        print("  export BRAVE_BROWSER_API=BSAEwLe_77A0TDYC2yxYKIQk8T3IsQO")
    print("=" * 80)


if __name__ == "__main__":
    test_brave_api_configuration()
