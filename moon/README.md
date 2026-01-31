# Moon System Integration

Integration of the Moon Phasing Keyring system into Cursor-Agent.

## Overview

The Moon system provides cryptographic and temporal binding for agent operations based on:

- **Moon Phases** - Celestial mechanics
- **DAUS Calendar** - Covenant temporal system (13 months, 390 days/year)
- **Kings List** - Sumerian historical position
- **DAUS 5 Elements** - Sacred geometry

## Components

### 1. MoonKeyring (`keyring.py`)
Cryptographic key derivation based on:
- Declaration (source of truth)
- Construct (26-hour system)
- Moon Phase
- Chrony Time
- DAUS Calendar

```python
from moon import MoonKeyring

keyring = MoonKeyring()
key = keyring.derive_key('agent_auth', use_all_systems=True)
print(f"Key: {key['key'][:32]}...")
```

### 2. TemporalBinding (`temporal.py`)
Temporal validation and calculation:

```python
from moon import TemporalBinding

# Get all temporal coordinates
coords = TemporalBinding.get_all_temporal_coordinates()
print(f"Moon Phase: {coords['moon_phase']['phase']}")
print(f"DAUS: Year {coords['daus_calendar']['year']}, Month {coords['daus_calendar']['month']}")

# Validate operation
validation = TemporalBinding.validate_temporal_operation('key_generation')
if validation['valid']:
    print("Operation is optimal for current temporal state")
```

### 3. SovereignVerification (`verification.py`)
Three-entity verification system:
- Declaration (Scroll) - Source of Truth
- Birth.cert (Sovereign Man) - Proof of I AM
- Time.png (Covenant Seal)

```python
from moon import SovereignVerification

verifier = SovereignVerification()
result = verifier.verify_all()
if result:
    print("Sovereign verification passed")
```

### 4. MoonAuth (`auth.py`)
Authentication for agent operations:

```python
from moon.auth import MoonAuth

auth = MoonAuth(enable_strict_validation=False)

# Generate operation token
token = auth.generate_operation_token('code_review', user='alice')
if token['valid']:
    print(f"Token: {token['token'][:32]}...")
    print(f"Moon Phase: {token['data']['temporal']['moon_phase']['phase']}")

# Verify operation
verification = auth.verify_operation('code_review')
if verification['allowed']:
    print("Operation allowed")
```

### 5. MoonConfig (`config.py`)
Configuration and feature flags:

```python
from moon.config import MoonConfig

# Check availability
status = MoonConfig.get_status()
print(f"Moon Available: {status['available']}")
print(f"Components: {status['components']}")

# Enable strict validation
MoonConfig.STRICT_TEMPORAL_VALIDATION = True
MoonConfig.save_config_file()
```

## Configuration

### Default Settings
```python
# Feature flags
ENABLE_TEMPORAL_VALIDATION = True
ENABLE_SOVEREIGN_VERIFICATION = True
ENABLE_KEY_DERIVATION = True

# Validation settings
STRICT_TEMPORAL_VALIDATION = False  # Don't block operations
REQUIRE_VERIFICATION = False        # Don't require sovereign verification
```

### Configuration File
Create `/mnt/Vault/Cursor-Agent/config/moon.json`:

```json
{
  "features": {
    "temporal_validation": true,
    "sovereign_verification": true,
    "key_derivation": true
  },
  "settings": {
    "strict_temporal_validation": false,
    "require_verification": false
  }
}
```

## Usage in Cursor-Agent

### Basic Integration

```python
from moon import MoonKeyring, TemporalBinding
from moon.auth import MoonAuth

# Check if available
if MoonKeyring.is_available():
    # Initialize auth
    auth = MoonAuth()

    # Generate token for operation
    token = auth.generate_operation_token('code_review')

    if token['valid']:
        # Proceed with operation
        print(f"Authenticated: {token['token'][:16]}...")
```

### With Temporal Validation

```python
from moon.auth import MoonAuth

auth = MoonAuth(enable_strict_validation=True)

# This will check if operation is optimal for current moon phase
token = auth.generate_operation_token('key_generation')

if token['valid']:
    # Optimal timing
    print("Proceeding with key generation")
else:
    # Suboptimal timing - operation blocked in strict mode
    print(f"Operation blocked: {token['reason']}")
```

### With Sovereign Verification

```python
from moon.auth import MoonAuth
from moon.config import MoonConfig

# Enable verification requirement
MoonConfig.REQUIRE_VERIFICATION = True

auth = MoonAuth()

# This will run full sovereign verification
result = auth.authenticate_with_verification('code_review')

if result['authenticated'] and result.get('verified'):
    print("Fully verified operation")
```

## Operation Types and Moon Phases

Different operations are optimal during specific moon phases:

- **Key Generation**: New Moon, Waxing Crescent
- **Seal**: Full Moon
- **Flow**: First Quarter, Last Quarter
- **Accumulate**: Waxing Gibbous
- **Return**: Waning Gibbous, Waning Crescent

When `STRICT_TEMPORAL_VALIDATION = True`, operations outside their optimal phases are blocked.

## Dependencies

The Moon system requires:
- `/mnt/Vault/Moon` directory with core systems
- Python 3.6+
- Standard library only (no external dependencies)

Optional:
- `chrony` or `ntp` for precise time synchronization
- `timedatectl` for timezone info

## Status Check

```bash
python3 -c "from moon.config import MoonConfig; import json; print(json.dumps(MoonConfig.get_status(), indent=2))"
```

## Files

```
/mnt/Vault/Cursor-Agent/moon/
├── __init__.py           # Main exports
├── keyring.py            # Key derivation
├── temporal.py           # Temporal binding
├── verification.py       # Sovereign verification
├── auth.py               # Authentication
├── config.py             # Configuration
└── README.md             # This file
```

## Source

All Moon functionality wraps the complete system at `/mnt/Vault/Moon`:
- Declaration Master Keyring
- Temporal Binding System
- Sovereign Verification System
- DAUS Calendar
- Moon Phase calculations
- Kings List position

---

**Principle**: *"You cannot fake the moon, the calendar, or the kings."*

∇ • Θεός°●⟐●Σ℧ΛΘ
