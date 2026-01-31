#!/usr/bin/env python3
"""
Temporal Binding System
=======================
Wrapper for temporal binding from /mnt/Vault/Moon
"""

import sys
from pathlib import Path
from datetime import datetime, timezone

# Add Moon directory to path
moon_path = Path("/mnt/Vault/Moon")
if moon_path.exists() and str(moon_path) not in sys.path:
    sys.path.insert(0, str(moon_path))

try:
    from temporal_binding import (
        get_system_time,
        calculate_moon_phase,
        calculate_daus_calendar,
        calculate_kings_position,
        update_json_files
    )
    TEMPORAL_AVAILABLE = True
except ImportError:
    TEMPORAL_AVAILABLE = False


class TemporalBinding:
    """
    Temporal Binding interface for Cursor-Agent
    Provides temporal validation based on:
    - Moon Phase (astronomical calculation)
    - DAUS Calendar (covenant calendar)
    - Kings List (historical position)
    """

    @staticmethod
    def is_available():
        """Check if temporal binding system is available"""
        return TEMPORAL_AVAILABLE

    @staticmethod
    def get_current_time():
        """Get current system time with NTP sync info"""
        if not TEMPORAL_AVAILABLE:
            return datetime.now(timezone.utc), {}
        return get_system_time()

    @staticmethod
    def get_moon_phase(date=None):
        """
        Get current moon phase or for specific date.

        Args:
            date: datetime object (default: now)

        Returns:
            dict: Moon phase data with glyph and operation
        """
        if not TEMPORAL_AVAILABLE:
            raise RuntimeError("Temporal binding not available")

        if date is None:
            date = datetime.now(timezone.utc)

        return calculate_moon_phase(date)

    @staticmethod
    def get_daus_calendar(date=None):
        """
        Get current DAUS calendar position or for specific date.

        Args:
            date: datetime object (default: now)

        Returns:
            dict: DAUS calendar data
        """
        if not TEMPORAL_AVAILABLE:
            raise RuntimeError("Temporal binding not available")

        if date is None:
            date = datetime.now(timezone.utc)

        return calculate_daus_calendar(date)

    @staticmethod
    def get_kings_position(date=None):
        """
        Get current Kings List position or for specific date.

        Args:
            date: datetime object (default: now)

        Returns:
            dict: Kings position data
        """
        if not TEMPORAL_AVAILABLE:
            raise RuntimeError("Temporal binding not available")

        if date is None:
            date = datetime.now(timezone.utc)

        return calculate_kings_position(date)

    @staticmethod
    def get_all_temporal_coordinates():
        """Get all current temporal coordinates"""
        if not TEMPORAL_AVAILABLE:
            raise RuntimeError("Temporal binding not available")

        now_utc, _ = get_system_time()

        coords = {
            'moon_phase': calculate_moon_phase(now_utc),
            'daus_calendar': calculate_daus_calendar(now_utc),
            'kings_position': calculate_kings_position(now_utc),
            'timestamp_utc': now_utc.isoformat()
        }
        # Include beacon state if available (new apex model)
        try:
            from apex_beacon import compute_beacon_state, load_moon_phase_file
            moon_json = load_moon_phase_file()
            beacon = compute_beacon_state(now_utc=now_utc, moon_json=moon_json)
            coords["beacon"] = {
                "hemisphere": beacon.hemisphere,
                "layer": beacon.layer,
                "cosmic_value": beacon.cosmic_value,
                "moon_day_0_full_to_new_30": beacon.moon_day_0_full_to_new_30,
                "waxing_or_waning": beacon.waxing_or_waning,
                "arcanum": beacon.arcanum,
                "hash": beacon.hash,
            }
        except Exception:
            pass
        return coords

    @staticmethod
    def update_temporal_files():
        """Update the JSON files with current temporal data"""
        if not TEMPORAL_AVAILABLE:
            raise RuntimeError("Temporal binding not available")

        now_utc, _ = get_system_time()
        moon = calculate_moon_phase(now_utc)
        daus = calculate_daus_calendar(now_utc)
        kings = calculate_kings_position(now_utc)

        update_json_files(moon, daus, kings)

        return {
            'moon_phase': moon,
            'daus_calendar': daus,
            'kings_position': kings
        }

    @staticmethod
    def validate_temporal_operation(operation: str):
        """
        Validate if an operation is appropriate for current temporal state.

        Args:
            operation: Operation type (e.g., 'key_generation', 'seal', 'flow')

        Returns:
            dict: Validation result with recommendations
        """
        if not TEMPORAL_AVAILABLE:
            return {'valid': True, 'reason': 'Temporal validation not available'}

        coords = TemporalBinding.get_all_temporal_coordinates()
        moon_phase = coords['moon_phase']

        # Map operations to moon phases
        operation_phases = {
            'key_generation': ['New Moon', 'Waxing Crescent'],
            'seal': ['Full Moon'],
            'flow': ['First Quarter', 'Last Quarter'],
            'accumulate': ['Waxing Gibbous'],
            'return': ['Waning Gibbous', 'Waning Crescent']
        }

        current_phase = moon_phase['phase']
        recommended_phases = operation_phases.get(operation, [])

        if not recommended_phases:
            return {
                'valid': True,
                'reason': 'Operation type not restricted by temporal state',
                'current_phase': current_phase
            }

        if current_phase in recommended_phases:
            return {
                'valid': True,
                'reason': f'Operation {operation} is optimal during {current_phase}',
                'current_phase': current_phase,
                'glyph': moon_phase['glyph']
            }
        else:
            return {
                'valid': False,
                'reason': f'Operation {operation} is recommended during {recommended_phases}, currently {current_phase}',
                'current_phase': current_phase,
                'recommended_phases': recommended_phases,
                'glyph': moon_phase['glyph']
            }
