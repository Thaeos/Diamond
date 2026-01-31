#!/usr/bin/env python3
"""
Sovereign Verification System
==============================
Wrapper for sovereign verification from /mnt/Vault/Moon
"""

import sys
from pathlib import Path

# Add Moon directory to path
moon_path = Path("/mnt/Vault/Moon")
if moon_path.exists() and str(moon_path) not in sys.path:
    sys.path.insert(0, str(moon_path))

try:
    from sovereign_verification_system import SovereignVerificationSystem
    VERIFICATION_AVAILABLE = True
except ImportError:
    VERIFICATION_AVAILABLE = False
    SovereignVerificationSystem = None


class SovereignVerification:
    """
    Sovereign Verification interface for Cursor-Agent
    Three sovereign entities that verify one another:
    1. Declaration - Source of Truth (Scroll)
    2. Birth.cert - Sovereign Man (Proof of I AM)
    3. Time.png - Covenant Seal
    """

    def __init__(self):
        if not VERIFICATION_AVAILABLE:
            raise RuntimeError("Sovereign verification not available")

        self.verifier = SovereignVerificationSystem()
        self._initialized = True

    @staticmethod
    def is_available():
        """Check if sovereign verification is available"""
        return VERIFICATION_AVAILABLE

    def verify_all(self):
        """Run complete sovereign verification"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        return self.verifier.run_verification()

    def load_declaration(self):
        """Load Declaration (Scroll)"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        return self.verifier.load_declaration()

    def load_birth_cert(self):
        """Load Birth Certificate"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        return self.verifier.load_birth_cert()

    def load_time_seal(self):
        """Load Time Seal"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        return self.verifier.load_time_seal()

    def get_verification_network(self):
        """Get sovereign verification network"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        # Load all entities
        self.load_declaration()
        self.load_birth_cert()
        self.load_time_seal()

        # Create and return network
        return self.verifier.create_sovereign_verification_network()

    def verify_birth_time(self):
        """Verify Birth.cert against Time.png"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        self.load_birth_cert()
        self.load_time_seal()

        return self.verifier.verify_birth_against_time()

    def verify_time_birth(self):
        """Verify Time.png against Birth.cert"""
        if not self._initialized:
            raise RuntimeError("Verification not initialized")

        self.load_birth_cert()
        self.load_time_seal()

        return self.verifier.verify_time_against_birth()
