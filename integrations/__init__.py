"""
Cursor-Agent Integrations
Third-party API and CLI integrations
"""

from .cloudflare_api import CloudflareAPI
from .github_api import GitHubAPI
from .lavague_api import LaVagueAgent, LaVagueTaskRunner, run_objective, create_agent
from .blockscout_api import BlockscoutAPI
from .chainlist_api import ChainlistAPI
from .chainlink_api import ChainlinkIntegration, ChainlinkPriceFeeds, ChainlinkAutomation, ChainlinkCCIP, ChainlinkFunctions
from .config import get_default_ens, get_default_email, get_default_wallet_address, get_primary_wallet, get_brave_api_key, get_tenderly_api_key, get_defaults
from .ens_resolver import ENSResolver, get_ens_resolver, resolve_ens_name, reverse_resolve_address

# Tenderly integration
try:
    from .tenderly_monitoring import TenderlyIntegration, get_tenderly_integration
    from .tenderly_rpc import TenderlyRPC, get_tenderly_rpc, get_tenderly_http_endpoint, get_tenderly_websocket_endpoint
    TENDERLY_AVAILABLE = True
except ImportError:
    TENDERLY_AVAILABLE = False
    TenderlyIntegration = None
    get_tenderly_integration = None
    TenderlyRPC = None
    get_tenderly_rpc = None
    get_tenderly_http_endpoint = None
    get_tenderly_websocket_endpoint = None

# Foundry + Tenderly integration
try:
    from .foundry_tenderly import FoundryTenderlyIntegration, get_foundry_tenderly
    FOUNDRY_TENDERLY_AVAILABLE = True
except ImportError:
    FOUNDRY_TENDERLY_AVAILABLE = False
    FoundryTenderlyIntegration = None
    get_foundry_tenderly = None

# Safe{Wallet} integration
try:
    from .safe_wallet import SafeWalletIntegration, UnifiedWalletInterface, get_unified_wallet_config
    SAFE_WALLET_AVAILABLE = True
except ImportError:
    SAFE_WALLET_AVAILABLE = False
    SafeWalletIntegration = None
    UnifiedWalletInterface = None
    get_unified_wallet_config = None

# Autonomous Agent Wallet integration
try:
    from .autonomous_agent_wallet import AutonomousAgentWallet, get_autonomous_agent_wallet
    AUTONOMOUS_WALLET_AVAILABLE = True
except ImportError:
    AUTONOMOUS_WALLET_AVAILABLE = False
    AutonomousAgentWallet = None
    get_autonomous_agent_wallet = None

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
    'get_default_wallet_address',
    'get_primary_wallet',
    'get_brave_api_key',
    'get_tenderly_api_key',
    'get_defaults',
    'ENSResolver',
    'get_ens_resolver',
    'resolve_ens_name',
    'reverse_resolve_address',
    'TenderlyIntegration',
    'get_tenderly_integration',
    'TenderlyRPC',
    'get_tenderly_rpc',
    'get_tenderly_http_endpoint',
    'get_tenderly_websocket_endpoint',
    'TENDERLY_AVAILABLE',
    'FoundryTenderlyIntegration',
    'get_foundry_tenderly',
    'FOUNDRY_TENDERLY_AVAILABLE',
    'SafeWalletIntegration',
    'UnifiedWalletInterface',
    'get_unified_wallet_config',
    'SAFE_WALLET_AVAILABLE',
    'AutonomousAgentWallet',
    'get_autonomous_agent_wallet',
    'AUTONOMOUS_WALLET_AVAILABLE',
]

# Default ENS and Email
DEFAULT_ENS = "theosmagic.uni.eth"
DEFAULT_EMAIL = "theosmagic.uni.eth@ethermail.io"
