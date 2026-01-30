"""
Default Configuration
=====================

Default ENS, email, and primary wallet settings for theosmagic.uni.eth
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional

# Default ENS, Email, and Wallet
DEFAULT_ENS = "theosmagic.uni.eth"
DEFAULT_EMAIL = "theosmagic.uni.eth@ethermail.io"
DEFAULT_WALLET_ADDRESS = "0x67A977eaD94C3b955ECbf27886CE9f62464423B2"

# Load defaults from config file
DEFAULTS_FILE = Path(__file__).parent.parent / "config" / "defaults.json"
WALLET_FILE = Path(__file__).parent.parent / "config" / "wallet.json"

# Load defaults
if DEFAULTS_FILE.exists():
    with open(DEFAULTS_FILE, 'r') as f:
        DEFAULTS = json.load(f)
        DEFAULT_ENS = DEFAULTS.get("ens", {}).get("domain", DEFAULT_ENS)
        DEFAULT_EMAIL = DEFAULTS.get("ens", {}).get("email", DEFAULT_EMAIL)
        # Get primary wallet address
        primary_wallet = DEFAULTS.get("primary_wallet", {})
        if primary_wallet:
            DEFAULT_WALLET_ADDRESS = primary_wallet.get("address", DEFAULT_WALLET_ADDRESS)
            DEFAULT_EMAIL = primary_wallet.get("email", DEFAULT_EMAIL)
            DEFAULT_ENS = primary_wallet.get("ens", DEFAULT_ENS)
else:
    DEFAULTS = {
        "ens": {
            "domain": DEFAULT_ENS,
            "email": DEFAULT_EMAIL
        },
        "primary_wallet": {
            "address": DEFAULT_WALLET_ADDRESS,
            "email": DEFAULT_EMAIL,
            "ens": DEFAULT_ENS
        }
    }

# Override with environment variables if present
DEFAULT_WALLET_ADDRESS = os.getenv("PUBLIC_ADDRESS", DEFAULT_WALLET_ADDRESS)
DEFAULT_EMAIL = os.getenv("DIGITAL_PERSONA_EMAIL", os.getenv("EMAIL", DEFAULT_EMAIL))
DEFAULT_ENS = os.getenv("ENS_NAME", DEFAULT_ENS)

# Brave Browser API Key
BRAVE_BROWSER_API_KEY = os.getenv("BRAVE_BROWSER_API", os.getenv("BRAVE_API_KEY", ""))

# Load wallet config if exists
WALLET_CONFIG = {}
if WALLET_FILE.exists():
    with open(WALLET_FILE, 'r') as f:
        WALLET_CONFIG = json.load(f)
        primary_wallet = WALLET_CONFIG.get("primary_wallet", {})
        if primary_wallet:
            DEFAULT_WALLET_ADDRESS = primary_wallet.get("address", DEFAULT_WALLET_ADDRESS)
            DEFAULT_EMAIL = primary_wallet.get("email", DEFAULT_EMAIL)
            DEFAULT_ENS = primary_wallet.get("ens", DEFAULT_ENS)


def get_default_ens():
    """Get default ENS domain"""
    return DEFAULT_ENS


def get_default_email():
    """Get default email address"""
    return DEFAULT_EMAIL


def get_default_wallet_address():
    """Get primary/default wallet address"""
    return DEFAULT_WALLET_ADDRESS


def get_primary_wallet() -> Dict[str, Any]:
    """Get primary wallet configuration"""
    return {
        "address": DEFAULT_WALLET_ADDRESS,
        "email": DEFAULT_EMAIL,
        "ens": DEFAULT_ENS,
        "is_primary": True
    }


def get_brave_api_key():
    """Get Brave Browser API key"""
    return BRAVE_BROWSER_API_KEY

def get_defaults():
    """Get all defaults"""
    return {
        "ens": {
            "domain": DEFAULT_ENS,
            "email": DEFAULT_EMAIL
        },
        "primary_wallet": {
            "address": DEFAULT_WALLET_ADDRESS,
            "email": DEFAULT_EMAIL,
            "ens": DEFAULT_ENS,
            "is_primary": True
        },
        "brave_browser_api": {
            "key": BRAVE_BROWSER_API_KEY,
            "description": "Brave Browser API key for search functionality"
        },
        **DEFAULTS
    }
