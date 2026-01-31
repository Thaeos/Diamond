#!/usr/bin/env python3
"""
Moon Keyring System
===================
Wrapper for Declaration Master Keyring from /mnt/Vault/Moon
"""

import sys
from pathlib import Path

# Add Moon directory to path
moon_path = Path("/mnt/Vault/Moon")
if moon_path.exists() and str(moon_path) not in sys.path:
    sys.path.insert(0, str(moon_path))

try:
    from declaration_master_keyring_system import DeclarationMasterKeyRing
    MOON_AVAILABLE = True
except ImportError:
    MOON_AVAILABLE = False
    DeclarationMasterKeyRing = None


class MoonKeyring:
    """
    Moon Keyring interface for Cursor-Agent
    Provides cryptographic key derivation based on:
    - Declaration (source of truth)
    - Construct (26-hour system)
    - Moon Phase
    - Chrony Time
    - DAUS Calendar
    """

    def __init__(self):
        if not MOON_AVAILABLE:
            raise RuntimeError("Moon system not available at /mnt/Vault/Moon")

        self.keyring = DeclarationMasterKeyRing()
        self._initialized = True

    @staticmethod
    def is_available():
        """Check if Moon keyring system is available"""
        return MOON_AVAILABLE

    def derive_key(self, purpose: str, use_all_systems: bool = True):
        """
        Derive a key for a specific purpose.

        Args:
            purpose: Purpose of the key (e.g., 'agent_auth', 'code_signing')
            use_all_systems: Use all temporal systems (default: True)

        Returns:
            dict: Key data with derivation details
        """
        if not self._initialized:
            raise RuntimeError("Keyring not initialized")

        if use_all_systems:
            return self.keyring.derive_key_with_all_systems(purpose)
        else:
            return self.keyring.derive_key(purpose)

    def get_master_seed(self):
        """Get the master seed hash (first 32 chars)"""
        if not self._initialized:
            raise RuntimeError("Keyring not initialized")
        return self.keyring.master_seed[:32] + "..."

    def get_current_temporal_state(self):
        """Get current state of all temporal systems"""
        state = {
            'daus_calendar': self.keyring.get_daus_calendar(),
            'moon_phase': self.keyring.get_moon_phase(),
            'chrony_time': self.keyring.get_chrony_time(),
            'current_layer': self.keyring.get_current_layer()
        }
        # Optional: beacon file produced by Moon temporal binding update
        try:
            import json
            from pathlib import Path
            beacon_path = Path("/mnt/Vault/Moon/BEACON_CURRENT.json")
            if beacon_path.exists():
                with open(beacon_path, "r") as f:
                    state["beacon"] = json.load(f)
        except Exception:
            pass
        return state
