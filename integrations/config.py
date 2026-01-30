"""
Default Configuration
=====================

Default ENS and email settings for theosmagic.uni.eth
"""

import json
from pathlib import Path

# Default ENS and Email
DEFAULT_ENS = "theosmagic.uni.eth"
DEFAULT_EMAIL = "theosmagic.uni.eth@ethermail.io"

# Load defaults from config file
DEFAULTS_FILE = Path(__file__).parent.parent / "config" / "defaults.json"

if DEFAULTS_FILE.exists():
    with open(DEFAULTS_FILE, 'r') as f:
        DEFAULTS = json.load(f)
        DEFAULT_ENS = DEFAULTS.get("ens", {}).get("domain", DEFAULT_ENS)
        DEFAULT_EMAIL = DEFAULTS.get("ens", {}).get("email", DEFAULT_EMAIL)
else:
    DEFAULTS = {
        "ens": {
            "domain": DEFAULT_ENS,
            "email": DEFAULT_EMAIL
        }
    }


def get_default_ens():
    """Get default ENS domain"""
    return DEFAULT_ENS


def get_default_email():
    """Get default email"""
    return DEFAULT_EMAIL


def get_defaults():
    """Get all defaults"""
    return DEFAULTS
