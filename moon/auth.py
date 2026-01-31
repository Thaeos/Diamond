#!/usr/bin/env python3
"""
Moon Authentication System
===========================
Provides authentication for agent operations using Moon temporal binding
"""

from typing import Optional, Dict
from datetime import datetime, timezone
import hashlib
import json

from .keyring import MoonKeyring
from .temporal import TemporalBinding
from .verification import SovereignVerification
from .config import MoonConfig


class MoonAuth:
    """
    Authentication system for agent operations using Moon keyring
    """

    def __init__(self, enable_strict_validation: bool = False):
        """
        Initialize Moon authentication.

        Args:
            enable_strict_validation: If True, blocks operations outside appropriate temporal windows
        """
        self.keyring = None
        self.strict_validation = enable_strict_validation
        self._initialized = False

        # Try to initialize keyring
        if MoonKeyring.is_available():
            try:
                self.keyring = MoonKeyring()
                self._initialized = True
            except Exception as e:
                print(f"Warning: Could not initialize Moon keyring: {e}")

    def is_enabled(self) -> bool:
        """Check if Moon authentication is enabled and available"""
        return self._initialized and MoonConfig.ENABLE_KEY_DERIVATION

    def generate_operation_token(self, operation: str, user: Optional[str] = None) -> Dict:
        """
        Generate an authentication token for an operation.

        Args:
            operation: Operation type (e.g., 'code_review', 'code_write', 'bug_fix')
            user: Optional user identifier

        Returns:
            dict: Token data with temporal binding
        """
        if not self.is_enabled():
            return {
                'token': None,
                'valid': False,
                'reason': 'Moon authentication not available'
            }

        # Get temporal coordinates
        temporal = TemporalBinding.get_all_temporal_coordinates()

        # Validate operation against temporal state
        validation = TemporalBinding.validate_temporal_operation(operation)

        if self.strict_validation and not validation['valid']:
            return {
                'token': None,
                'valid': False,
                'reason': validation['reason'],
                'temporal': temporal
            }

        # Derive key for operation
        purpose = f"agent_operation_{operation}"
        if user:
            purpose += f"_{user}"

        key_data = self.keyring.derive_key(purpose, use_all_systems=True)

        # Create token
        token_data = {
            'operation': operation,
            'user': user,
            'key': key_data['key'],
            'derived_from': key_data['derived_from'],
            'temporal': temporal,
            'validation': validation,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        # Generate token hash
        token_str = json.dumps(token_data, sort_keys=True)
        token_hash = hashlib.sha256(token_str.encode()).hexdigest()

        return {
            'token': token_hash,
            'valid': True,
            'data': token_data,
            'expires': None  # Tokens are bound to temporal state, not time
        }

    def verify_operation(self, operation: str, show_warnings: bool = True) -> Dict:
        """
        Verify if an operation can be performed in current temporal state.

        Args:
            operation: Operation type
            show_warnings: Show warnings for suboptimal timing

        Returns:
            dict: Verification result
        """
        if not self.is_enabled():
            return {'allowed': True, 'reason': 'Moon authentication not available'}

        validation = TemporalBinding.validate_temporal_operation(operation)

        if self.strict_validation:
            return {
                'allowed': validation['valid'],
                'reason': validation.get('reason', 'Unknown'),
                'temporal_state': validation
            }
        else:
            result = {
                'allowed': True,
                'optimal': validation['valid'],
                'reason': validation.get('reason', 'Unknown'),
                'temporal_state': validation
            }

            if show_warnings and not validation['valid']:
                print(f"⚠️  Warning: {validation['reason']}")

            return result

    def get_auth_status(self) -> Dict:
        """Get current authentication status"""
        if not self.is_enabled():
            return {
                'enabled': False,
                'reason': 'Moon authentication not available'
            }

        temporal = TemporalBinding.get_all_temporal_coordinates()
        master_seed = self.keyring.get_master_seed()

        return {
            'enabled': True,
            'initialized': self._initialized,
            'strict_validation': self.strict_validation,
            'master_seed': master_seed,
            'temporal_coordinates': temporal,
            'moon_config': MoonConfig.get_status()
        }

    def authenticate_with_verification(self, operation: str) -> Dict:
        """
        Authenticate operation with full sovereign verification.

        Args:
            operation: Operation type

        Returns:
            dict: Authentication result with verification
        """
        if not self.is_enabled():
            return {'authenticated': False, 'reason': 'Moon authentication not available'}

        # Check if verification is required
        if not MoonConfig.REQUIRE_VERIFICATION:
            return self.generate_operation_token(operation)

        # Run sovereign verification
        if not SovereignVerification.is_available():
            return {
                'authenticated': False,
                'reason': 'Sovereign verification required but not available'
            }

        try:
            verifier = SovereignVerification()
            verification_result = verifier.verify_all()

            if not verification_result:
                return {
                    'authenticated': False,
                    'reason': 'Sovereign verification failed'
                }

            # Generate token with verification
            token = self.generate_operation_token(operation)
            token['verified'] = True
            token['verification'] = 'sovereign_verification_passed'

            return token

        except Exception as e:
            return {
                'authenticated': False,
                'reason': f'Verification error: {e}'
            }
