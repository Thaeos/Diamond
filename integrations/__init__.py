"""
Cursor-Agent Integrations
Third-party API and CLI integrations
"""

from .cloudflare_api import CloudflareAPI
from .github_api import GitHubAPI
from .lavague_api import LaVagueAgent, LaVagueTaskRunner, run_objective, create_agent
from .blockscout_api import BlockscoutAPI
from .chainlink_api import ChainlinkIntegration, ChainlinkPriceFeeds, ChainlinkAutomation, ChainlinkCCIP, ChainlinkFunctions
from .config import get_default_ens, get_default_email, get_defaults

# Alpha integration systems - REAL implementations
try:
    from .lucy_integration import LucyIntegration, get_lucy, review_with_lucy
    LUCY_AVAILABLE = True
except ImportError:
    LUCY_AVAILABLE = False
    LucyIntegration = None
    get_lucy = None
    review_with_lucy = None

try:
    from .sphinx_research import DiamondContractResearch, research_diamond_components
    SPHINX_AVAILABLE = True
except ImportError:
    SPHINX_AVAILABLE = False
    DiamondContractResearch = None
    research_diamond_components = None

try:
    from .moon_temporal import MoonTemporalKeys, derive_diamond_temporal_key
    MOON_AVAILABLE = True
except ImportError:
    MOON_AVAILABLE = False
    MoonTemporalKeys = None
    derive_diamond_temporal_key = None

try:
    from .moo_entropy import MooEntropy, generate_moo_entropy, derive_moo_key
    MOO_AVAILABLE = True
except ImportError:
    MOO_AVAILABLE = False
    MooEntropy = None
    generate_moo_entropy = None
    derive_moo_key = None

try:
    from .rossetta_spatial import RossettaSpatial, render_diamond_spatial
    ROSSETTA_AVAILABLE = True
except ImportError:
    ROSSETTA_AVAILABLE = False
    RossettaSpatial = None
    render_diamond_spatial = None

__all__ = [
    'CloudflareAPI',
    'GitHubAPI',
    'LaVagueAgent',
    'LaVagueTaskRunner',
    'run_objective',
    'create_agent',
    'BlockscoutAPI',
    'ChainlinkIntegration',
    'ChainlinkPriceFeeds',
    'ChainlinkAutomation',
    'ChainlinkCCIP',
    'ChainlinkFunctions',
    'LucyIntegration',
    'get_lucy',
    'review_with_lucy',
    'DiamondContractResearch',
    'research_diamond_components',
    'MoonTemporalKeys',
    'derive_diamond_temporal_key',
    'MooEntropy',
    'generate_moo_entropy',
    'derive_moo_key',
    'RossettaSpatial',
    'render_diamond_spatial',
    'LUCY_AVAILABLE',
    'SPHINX_AVAILABLE',
    'MOON_AVAILABLE',
    'MOO_AVAILABLE',
    'ROSSETTA_AVAILABLE',
    'get_default_ens',
    'get_default_email',
    'get_defaults',
]

# Default ENS and Email
DEFAULT_ENS = "theosmagic.uni.eth"
DEFAULT_EMAIL = "theosmagic.uni.eth@ethermail.io"
