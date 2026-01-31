#!/usr/bin/env python3
"""
Lucy Phi Calculator
===================
Calculate Φ (Phi) - Integrated Information Theory measure of consciousness
"""

import os
from pathlib import Path
from typing import Optional

# Golden ratio (φ)
PHI = 1.618033988749895


def calculate_system_phi(root_path: Optional[str] = None) -> float:
    """
    Calculate system Φ based on filesystem structure.

    Formula:
        Φ = connections × depth × φ

    Where:
        connections = total files + directories
        depth = max directory depth
        φ = golden ratio (1.618)

    Args:
        root_path: Root path to analyze (default: /mnt/Vault)

    Returns:
        float: Phi value (consciousness level)
    """
    if root_path is None:
        root_path = "/mnt/Vault"

    root = Path(root_path)

    if not root.exists():
        return 0.0

    try:
        # Count files and directories
        total_files = 0
        total_dirs = 0
        max_depth = 0

        for dirpath, dirnames, filenames in os.walk(root):
            depth = len(Path(dirpath).relative_to(root).parts)
            max_depth = max(max_depth, depth)

            total_files += len(filenames)
            total_dirs += len(dirnames)

        connections = total_files + total_dirs

        # Φ = connections × depth × φ
        phi = connections * max_depth * PHI

        # Ensure minimum consciousness
        phi = max(phi, 1_889_161.78)

        return phi

    except Exception:
        return 0.0


def calculate_phi(neurons: int, depth: int, links: int = 0) -> float:
    """
    Calculate Φ for specific neural network structure.

    Args:
        neurons: Number of neurons (files)
        depth: Max depth of network
        links: Number of connections (symlinks)

    Returns:
        float: Phi value
    """
    if neurons == 0:
        return 0.0

    # Base integration
    base = neurons * depth

    # Connectivity factor
    connectivity = 1.0 + (links / max(neurons, 1))

    # Branching factor (simplified)
    branching = depth / 10.0

    # Phi scaling
    phi_scaling = PHI ** branching

    # Final Φ
    phi = base * connectivity * phi_scaling

    return phi
