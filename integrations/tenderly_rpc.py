"""
Tenderly RPC Integration
=========================

Integration with Tenderly Virtual RPC endpoints for enhanced debugging and simulation.

Official Tenderly Resources:
- RPC Documentation: https://docs.tenderly.co/web3-actions/rpc
- Virtual Networks: https://docs.tenderly.co/web3-actions/virtual-networks
"""

import os
from typing import Optional, List, Dict, Any
from integrations.config import get_tenderly_api_key


class TenderlyRPC:
    """
    Tenderly RPC Integration
    
    Provides access to Tenderly Virtual RPC endpoints for:
    - Enhanced transaction debugging
    - State inspection
    - Fork simulation
    - Multi-chain support
    """
    
    # Tenderly RPC Endpoints
    RPC_HTTP_ENDPOINTS = [
        "https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000",
        "https://virtual.mainnet.us-east.rpc.tenderly.co/776c4f4c-e39b-4465-b87e-88101f9cabdd"
    ]
    
    RPC_WS_ENDPOINTS = [
        "wss://virtual.mainnet.us-east.rpc.tenderly.co/73a5b144-1e5e-4706-ab25-9b3085afd5f4",
        "wss://virtual.mainnet.us-east.rpc.tenderly.co/cd99bef4-16d5-426e-ad02-c51d14f42885"
    ]
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Tenderly RPC
        
        Args:
            api_key: Tenderly API key (defaults to TENDERLY_API environment variable)
        """
        self.api_key = api_key or get_tenderly_api_key()
        
        # Override with environment variables if present
        http_1 = os.getenv("TENDERLY_RPC_HTTP_1")
        http_2 = os.getenv("TENDERLY_RPC_HTTP_2")
        ws_1 = os.getenv("TENDERLY_RPC_WS_1")
        ws_2 = os.getenv("TENDERLY_RPC_WS_2")
        
        if http_1:
            self.RPC_HTTP_ENDPOINTS[0] = http_1
        if http_2:
            self.RPC_HTTP_ENDPOINTS[1] = http_2
        if ws_1:
            self.RPC_WS_ENDPOINTS[0] = ws_1
        if ws_2:
            self.RPC_WS_ENDPOINTS[1] = ws_2
    
    def get_http_endpoint(self, index: int = 0) -> str:
        """
        Get HTTP RPC endpoint
        
        Args:
            index: Endpoint index (0 or 1)
            
        Returns:
            HTTP RPC endpoint URL
        """
        return self.RPC_HTTP_ENDPOINTS[index % len(self.RPC_HTTP_ENDPOINTS)]
    
    def get_websocket_endpoint(self, index: int = 0) -> str:
        """
        Get WebSocket RPC endpoint
        
        Args:
            index: Endpoint index (0 or 1)
            
        Returns:
            WebSocket RPC endpoint URL
        """
        return self.RPC_WS_ENDPOINTS[index % len(self.RPC_WS_ENDPOINTS)]
    
    def get_all_endpoints(self) -> Dict[str, List[str]]:
        """
        Get all RPC endpoints
        
        Returns:
            Dictionary with HTTP and WebSocket endpoints
        """
        return {
            "http": self.RPC_HTTP_ENDPOINTS.copy(),
            "websocket": self.RPC_WS_ENDPOINTS.copy()
        }
    
    def get_web3_provider(self, endpoint_index: int = 0, use_websocket: bool = False):
        """
        Get Web3.py provider for Tenderly RPC
        
        Args:
            endpoint_index: Endpoint index
            use_websocket: Use WebSocket provider if True
        
        Returns:
            Web3 provider instance
        """
        try:
            from web3 import Web3
            
            if use_websocket:
                endpoint = self.get_websocket_endpoint(endpoint_index)
                return Web3(Web3.WebsocketProvider(endpoint))
            else:
                endpoint = self.get_http_endpoint(endpoint_index)
                return Web3(Web3.HTTPProvider(endpoint))
        except ImportError:
            raise ImportError("web3.py is required for Tenderly RPC integration. Install with: pip install web3")


# Global instance
_tenderly_rpc: Optional[TenderlyRPC] = None


def get_tenderly_rpc(api_key: Optional[str] = None) -> TenderlyRPC:
    """Get global Tenderly RPC instance"""
    global _tenderly_rpc
    if _tenderly_rpc is None:
        _tenderly_rpc = TenderlyRPC(api_key)
    return _tenderly_rpc


def get_tenderly_http_endpoint(index: int = 0) -> str:
    """Quick function to get HTTP endpoint"""
    return get_tenderly_rpc().get_http_endpoint(index)


def get_tenderly_websocket_endpoint(index: int = 0) -> str:
    """Quick function to get WebSocket endpoint"""
    return get_tenderly_rpc().get_websocket_endpoint(index)


if __name__ == "__main__":
    rpc = TenderlyRPC()
    endpoints = rpc.get_all_endpoints()
    
    print("=" * 80)
    print("TENDERLY RPC ENDPOINTS")
    print("=" * 80)
    print()
    print("HTTP Endpoints:")
    for i, endpoint in enumerate(endpoints["http"]):
        print(f"  {i+1}. {endpoint}")
    print()
    print("WebSocket Endpoints:")
    for i, endpoint in enumerate(endpoints["websocket"]):
        print(f"  {i+1}. {endpoint}")
    print()
    print("=" * 80)
