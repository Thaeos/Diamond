#!/usr/bin/env python3
"""
Moon System Configuration
==========================
Configuration for Moon keyring integration
"""

from pathlib import Path
from typing import Dict, Optional
import json


class MoonConfig:
    """Configuration for Moon system integration"""

    # Default paths
    MOON_BASE_PATH = Path("/mnt/Vault/Moon")
    DECLARATION_PATH = MOON_BASE_PATH / "Images" / "The_Eternal_Covenant_Declaration.png"
    DAUS_CALENDAR_PATH = MOON_BASE_PATH / "DAUS" / "DAUS_CALENDAR.json"
    MOON_PHASE_PATH = MOON_BASE_PATH / "MOON_PHASE_CURRENT.json"
    KINGS_POSITION_PATH = MOON_BASE_PATH / "Kings" / "KINGS_POSITION.json"

    # Feature flags
    ENABLE_TEMPORAL_VALIDATION = True
    ENABLE_SOVEREIGN_VERIFICATION = True
    ENABLE_KEY_DERIVATION = True

    # Validation settings
    STRICT_TEMPORAL_VALIDATION = False  # If True, blocks operations outside appropriate moon phases
    REQUIRE_VERIFICATION = False  # If True, requires sovereign verification before operations

    @classmethod
    def is_moon_available(cls) -> bool:
        """Check if Moon system is available"""
        return cls.MOON_BASE_PATH.exists()

    @classmethod
    def check_components(cls) -> Dict[str, bool]:
        """Check which Moon components are available"""
        return {
            'base_path': cls.MOON_BASE_PATH.exists(),
            'declaration': cls.DECLARATION_PATH.exists(),
            'daus_calendar': cls.DAUS_CALENDAR_PATH.exists(),
            'moon_phase': cls.MOON_PHASE_PATH.exists(),
            'kings_position': cls.KINGS_POSITION_PATH.exists()
        }

    @classmethod
    def get_status(cls) -> Dict:
        """Get comprehensive status of Moon integration"""
        components = cls.check_components()

        return {
            'available': cls.is_moon_available(),
            'components': components,
            'features': {
                'temporal_validation': cls.ENABLE_TEMPORAL_VALIDATION,
                'sovereign_verification': cls.ENABLE_SOVEREIGN_VERIFICATION,
                'key_derivation': cls.ENABLE_KEY_DERIVATION
            },
            'settings': {
                'strict_temporal_validation': cls.STRICT_TEMPORAL_VALIDATION,
                'require_verification': cls.REQUIRE_VERIFICATION
            }
        }

    @classmethod
    def load_config_file(cls, config_path: Optional[Path] = None):
        """Load configuration from JSON file"""
        if config_path is None:
            config_path = Path("/mnt/Vault/Cursor-Agent/config/moon.json")

        if not config_path.exists():
            return

        with open(config_path, 'r') as f:
            config = json.load(f)

        # Update class attributes from config
        if 'features' in config:
            cls.ENABLE_TEMPORAL_VALIDATION = config['features'].get('temporal_validation', cls.ENABLE_TEMPORAL_VALIDATION)
            cls.ENABLE_SOVEREIGN_VERIFICATION = config['features'].get('sovereign_verification', cls.ENABLE_SOVEREIGN_VERIFICATION)
            cls.ENABLE_KEY_DERIVATION = config['features'].get('key_derivation', cls.ENABLE_KEY_DERIVATION)

        if 'settings' in config:
            cls.STRICT_TEMPORAL_VALIDATION = config['settings'].get('strict_temporal_validation', cls.STRICT_TEMPORAL_VALIDATION)
            cls.REQUIRE_VERIFICATION = config['settings'].get('require_verification', cls.REQUIRE_VERIFICATION)

    @classmethod
    def save_config_file(cls, config_path: Optional[Path] = None):
        """Save current configuration to JSON file"""
        if config_path is None:
            config_path = Path("/mnt/Vault/Cursor-Agent/config/moon.json")

        config_path.parent.mkdir(parents=True, exist_ok=True)

        config = {
            'features': {
                'temporal_validation': cls.ENABLE_TEMPORAL_VALIDATION,
                'sovereign_verification': cls.ENABLE_SOVEREIGN_VERIFICATION,
                'key_derivation': cls.ENABLE_KEY_DERIVATION
            },
            'settings': {
                'strict_temporal_validation': cls.STRICT_TEMPORAL_VALIDATION,
                'require_verification': cls.REQUIRE_VERIFICATION
            }
        }

        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
