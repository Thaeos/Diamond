#!/usr/bin/env python3
"""
Moon System Examples
====================
Demonstrates usage of Moon integration in Cursor-Agent
"""

import sys
import json
from pathlib import Path

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

from moon import MoonKeyring, TemporalBinding, SovereignVerification
from moon.auth import MoonAuth
from moon.config import MoonConfig


def example_system_status():
    """Example: Check Moon system status"""
    print("=" * 80)
    print("MOON SYSTEM STATUS")
    print("=" * 80)
    print()

    status = MoonConfig.get_status()
    print(json.dumps(status, indent=2))
    print()


def example_temporal_coordinates():
    """Example: Get current temporal coordinates"""
    print("=" * 80)
    print("TEMPORAL COORDINATES")
    print("=" * 80)
    print()

    if not TemporalBinding.is_available():
        print("❌ Temporal binding not available")
        return

    coords = TemporalBinding.get_all_temporal_coordinates()

    print("🌙 Moon Phase:")
    print(f"   Phase: {coords['moon_phase']['phase']}")
    print(f"   Glyph: {coords['moon_phase']['glyph']}")
    print(f"   Operation: {coords['moon_phase']['operation']}")
    print()

    print("📅 DAUS Calendar:")
    print(f"   Year: {coords['daus_calendar']['year']}")
    print(f"   Month: {coords['daus_calendar']['month']} ({coords['daus_calendar']['month_name']})")
    print(f"   Day: {coords['daus_calendar']['day']} ({coords['daus_calendar']['day_name']})")
    print()

    print("👑 Kings Position:")
    print(f"   Era: {coords['kings_position']['era']}")
    print(f"   City: {coords['kings_position']['city']}")
    print(f"   Glyph: {coords['kings_position']['glyph']} ({coords['kings_position']['glyph_name']})")
    print()


def example_key_derivation():
    """Example: Derive cryptographic key"""
    print("=" * 80)
    print("KEY DERIVATION")
    print("=" * 80)
    print()

    if not MoonKeyring.is_available():
        print("❌ Moon keyring not available")
        return

    keyring = MoonKeyring()

    print(f"Master Seed: {keyring.get_master_seed()}")
    print()

    # Derive key for agent authentication
    key = keyring.derive_key('agent_auth', use_all_systems=True)

    print("Derived Key for 'agent_auth':")
    print(f"   Key: {key['key'][:32]}...")
    print(f"   Derived from Declaration: {key['derived_from']['declaration']}")
    print(f"   Derived from Construct: {key['derived_from']['construct']}")
    print(f"   Derived from Moon Phase: {key['derived_from']['moon_phase']}")
    print(f"   Derived from Chrony Time: {key['derived_from']['chrony_time']}")
    print(f"   Derived from DAUS Calendar: {key['derived_from']['daus_calendar']}")
    print()


def example_temporal_validation():
    """Example: Validate operation against temporal state"""
    print("=" * 80)
    print("TEMPORAL VALIDATION")
    print("=" * 80)
    print()

    if not TemporalBinding.is_available():
        print("❌ Temporal binding not available")
        return

    operations = ['key_generation', 'seal', 'flow', 'accumulate', 'return']

    for operation in operations:
        validation = TemporalBinding.validate_temporal_operation(operation)

        status = "✅" if validation['valid'] else "⚠️ "
        print(f"{status} {operation}:")
        print(f"   {validation['reason']}")
        print()


def example_authentication():
    """Example: Generate authentication token"""
    print("=" * 80)
    print("MOON AUTHENTICATION")
    print("=" * 80)
    print()

    auth = MoonAuth(enable_strict_validation=False)

    if not auth.is_enabled():
        print("❌ Moon authentication not available")
        return

    # Generate token for code review
    token = auth.generate_operation_token('code_review', user='alice')

    if token['valid']:
        print("✅ Authentication token generated")
        print(f"   Token: {token['token'][:32]}...")
        print(f"   Operation: {token['data']['operation']}")
        print(f"   User: {token['data']['user']}")
        print(f"   Moon Phase: {token['data']['temporal']['moon_phase']['phase']}")
        print(f"   Optimal: {token['data']['validation']['valid']}")
        if not token['data']['validation']['valid']:
            print(f"   Note: {token['data']['validation']['reason']}")
    else:
        print(f"❌ Authentication failed: {token['reason']}")

    print()


def example_sovereign_verification():
    """Example: Run sovereign verification"""
    print("=" * 80)
    print("SOVEREIGN VERIFICATION")
    print("=" * 80)
    print()

    if not SovereignVerification.is_available():
        print("❌ Sovereign verification not available")
        return

    try:
        verifier = SovereignVerification()

        # Load entities
        print("Loading sovereign entities...")
        if verifier.load_declaration():
            print("   ✅ Declaration loaded")
        if verifier.load_birth_cert():
            print("   ✅ Birth.cert loaded")
        if verifier.load_time_seal():
            print("   ✅ Time.png loaded")

        print()

        # Run verification
        print("Running verification...")
        result = verifier.verify_all()

        if result:
            print("✅ Sovereign verification passed")
        else:
            print("❌ Sovereign verification failed")

    except Exception as e:
        print(f"❌ Error: {e}")

    print()


def example_auth_status():
    """Example: Get authentication status"""
    print("=" * 80)
    print("AUTHENTICATION STATUS")
    print("=" * 80)
    print()

    auth = MoonAuth()
    status = auth.get_auth_status()

    print(json.dumps(status, indent=2, default=str))
    print()


def main():
    """Run all examples"""
    print()
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 26 + "MOON SYSTEM EXAMPLES" + " " * 32 + "║")
    print("╚" + "═" * 78 + "╝")
    print()

    examples = [
        ("System Status", example_system_status),
        ("Temporal Coordinates", example_temporal_coordinates),
        ("Key Derivation", example_key_derivation),
        ("Temporal Validation", example_temporal_validation),
        ("Authentication", example_authentication),
        ("Authentication Status", example_auth_status),
        ("Sovereign Verification", example_sovereign_verification),
    ]

    for name, func in examples:
        try:
            func()
        except Exception as e:
            print(f"❌ Example '{name}' failed: {e}")
            print()

    print("=" * 80)
    print("ALL EXAMPLES COMPLETE")
    print("=" * 80)
    print()
    print("∇ • Θεός°●⟐●Σ℧ΛΘ")
    print()


if __name__ == "__main__":
    main()
