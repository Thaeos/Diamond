"""
Chainlist Integration
=====================

Chainlist (DefiLlama) provides a comprehensive chain registry with RPC endpoints.

Repository: https://github.com/DefiLlama/chainlist
API: https://chainlist.org/rpcs.json
"""

import httpx
from typing import Dict, Any, Optional, List
import asyncio


class ChainlistAPI:
    """
    Chainlist API Integration
    
    Provides chain metadata and RPC endpoints from DefiLlama's Chainlist.
    """
    
    CHAINLIST_API_URL = "https://chainlist.org/rpcs.json"
    
    def __init__(self):
        """Initialize Chainlist API"""
        self.cache: Optional[Dict[str, Any]] = None
    
    async def fetch_all_chains(self) -> List[Dict[str, Any]]:
        """
        Fetch all chains from Chainlist
        
        Returns complete chain registry with RPC endpoints
        Note: Chainlist API returns a list of chain objects
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(self.CHAINLIST_API_URL)
            response.raise_for_status()
            data = response.json()
            # Chainlist returns a list of chain objects
            if isinstance(data, list):
                self.cache = data
            elif isinstance(data, dict):
                # If it's a dict, convert to list
                self.cache = list(data.values()) if data else []
            else:
                self.cache = []
            return self.cache
    
    async def get_chain_by_id(self, chain_id: int) -> Optional[Dict[str, Any]]:
        """
        Get chain information by chain ID
        
        Args:
            chain_id: Chain ID (1=Ethereum, 42161=Arbitrum, etc.)
        
        Returns:
            Chain information including RPC endpoints
        """
        if not self.cache:
            await self.fetch_all_chains()
        
        if not self.cache:
            return None
        
        # Chainlist returns a list of chain objects
        if isinstance(self.cache, list):
            for chain_data in self.cache:
                if isinstance(chain_data, dict) and chain_data.get('chainId') == chain_id:
                    # Extract RPC URLs (can be strings or objects with 'url' property)
                    rpc_list = []
                    for rpc in chain_data.get('rpc', []):
                        if isinstance(rpc, str):
                            rpc_list.append(rpc)
                        elif isinstance(rpc, dict) and 'url' in rpc:
                            rpc_list.append(rpc['url'])
                    
                    return {
                        'name': chain_data.get('name', 'Unknown'),
                        'chainId': chain_id,
                        'rpc': rpc_list,
                        'nativeCurrency': chain_data.get('nativeCurrency'),
                        'explorers': chain_data.get('explorers', []),
                        'infoURL': chain_data.get('infoURL'),
                        'shortName': chain_data.get('shortName')
                    }
        elif isinstance(self.cache, dict):
            # Fallback for dict format
            for chain_name, chain_data in self.cache.items():
                if isinstance(chain_data, dict) and chain_data.get('chainId') == chain_id:
                    rpc_list = []
                    for rpc in chain_data.get('rpc', []):
                        if isinstance(rpc, str):
                            rpc_list.append(rpc)
                        elif isinstance(rpc, dict) and 'url' in rpc:
                            rpc_list.append(rpc['url'])
                    
                    return {
                        'name': chain_data.get('name', chain_name),
                        'chainId': chain_id,
                        'rpc': rpc_list,
                        'nativeCurrency': chain_data.get('nativeCurrency'),
                        'explorers': chain_data.get('explorers', []),
                        'infoURL': chain_data.get('infoURL'),
                        'shortName': chain_data.get('shortName')
                    }
        
        return None
    
    async def get_rpc_endpoints(self, chain_id: int) -> List[str]:
        """
        Get RPC endpoints for a chain
        
        Args:
            chain_id: Chain ID
        
        Returns:
            List of RPC endpoint URLs
        """
        chain_info = await self.get_chain_by_id(chain_id)
        if chain_info:
            return chain_info.get('rpc', [])
        return []
    
    async def get_best_rpc(self, chain_id: int) -> Optional[str]:
        """
        Get best RPC endpoint for a chain
        
        Prefers HTTPS endpoints, falls back to HTTP
        
        Args:
            chain_id: Chain ID
        
        Returns:
            Best RPC endpoint URL
        """
        rpcs = await self.get_rpc_endpoints(chain_id)
        
        # Prefer HTTPS
        for rpc in rpcs:
            if isinstance(rpc, str) and rpc.startswith('https://'):
                return rpc
        
        # Fallback to HTTP
        for rpc in rpcs:
            if isinstance(rpc, str) and rpc.startswith('http://'):
                return rpc
        
        # Return first available
        if rpcs:
            return rpcs[0] if isinstance(rpcs[0], str) else None
        
        return None
    
    async def search_chains(self, query: str) -> List[Dict[str, Any]]:
        """
        Search chains by name or chain ID
        
        Args:
            query: Search query (name or chain ID)
        
        Returns:
            List of matching chains
        """
        if not self.cache:
            await self.fetch_all_chains()
        
        if not self.cache:
            return []
        
        results = []
        query_lower = query.lower()
        
        # Try to parse as chain ID
        try:
            chain_id = int(query)
            chain_info = await self.get_chain_by_id(chain_id)
            if chain_info:
                results.append(chain_info)
                return results
        except ValueError:
            pass
        
        # Search by name (handle both list and dict formats)
        if isinstance(self.cache, list):
            for chain_data in self.cache:
                if isinstance(chain_data, dict):
                    chain_name = chain_data.get('name', '')
                    if query_lower in chain_name.lower():
                        rpc_list = []
                        for rpc in chain_data.get('rpc', []):
                            if isinstance(rpc, str):
                                rpc_list.append(rpc)
                            elif isinstance(rpc, dict) and 'url' in rpc:
                                rpc_list.append(rpc['url'])
                        
                        results.append({
                            'name': chain_name,
                            'chainId': chain_data.get('chainId'),
                            'rpc': rpc_list,
                            'nativeCurrency': chain_data.get('nativeCurrency'),
                            'explorers': chain_data.get('explorers', []),
                            'infoURL': chain_data.get('infoURL'),
                            'shortName': chain_data.get('shortName')
                        })
        elif isinstance(self.cache, dict):
            for chain_name, chain_data in self.cache.items():
                if isinstance(chain_data, dict):
                    if query_lower in chain_name.lower():
                        rpc_list = []
                        for rpc in chain_data.get('rpc', []):
                            if isinstance(rpc, str):
                                rpc_list.append(rpc)
                            elif isinstance(rpc, dict) and 'url' in rpc:
                                rpc_list.append(rpc['url'])
                        
                        results.append({
                            'name': chain_data.get('name', chain_name),
                            'chainId': chain_data.get('chainId'),
                            'rpc': rpc_list,
                            'nativeCurrency': chain_data.get('nativeCurrency'),
                            'explorers': chain_data.get('explorers', []),
                            'infoURL': chain_data.get('infoURL'),
                            'shortName': chain_data.get('shortName')
                        })
        
        return results
    
    async def get_supported_chains(self) -> List[int]:
        """
        Get list of all supported chain IDs
        
        Returns:
            List of chain IDs
        """
        if not self.cache:
            await self.fetch_all_chains()
        
        if not self.cache:
            return []
        
        chain_ids = []
        
        # Handle both list and dict formats
        if isinstance(self.cache, list):
            for chain_data in self.cache:
                if isinstance(chain_data, dict):
                    chain_id = chain_data.get('chainId')
                    if chain_id:
                        chain_ids.append(chain_id)
        elif isinstance(self.cache, dict):
            for chain_name, chain_data in self.cache.items():
                if isinstance(chain_data, dict):
                    chain_id = chain_data.get('chainId')
                    if chain_id:
                        chain_ids.append(chain_id)
        
        return sorted(set(chain_ids))


# Convenience functions

async def get_rpc_for_chain(chain_id: int) -> Optional[str]:
    """Quick function to get RPC endpoint for a chain"""
    api = ChainlistAPI()
    return await api.get_best_rpc(chain_id)


async def get_all_rpcs_for_chain(chain_id: int) -> List[str]:
    """Get all RPC endpoints for a chain"""
    api = ChainlistAPI()
    return await api.get_rpc_endpoints(chain_id)


if __name__ == "__main__":
    async def test():
        api = ChainlistAPI()
        
        # Test fetching chains
        print("Fetching chains from Chainlist...")
        chains = await api.fetch_all_chains()
        print(f"Found {len(chains)} chains")
        
        # Test getting chain by ID
        print("\nTesting chain lookup:")
        arbitrum = await api.get_chain_by_id(42161)
        if arbitrum:
            print(f"Arbitrum: {arbitrum['name']}")
            print(f"RPCs: {len(arbitrum.get('rpc', []))} endpoints")
        
        # Test getting best RPC
        best_rpc = await api.get_best_rpc(42161)
        print(f"\nBest RPC for Arbitrum: {best_rpc}")
        
        # Test search
        print("\nSearching for 'arbitrum':")
        results = await api.search_chains("arbitrum")
        for result in results[:3]:
            print(f"  - {result['name']} (Chain ID: {result['chainId']})")
    
    asyncio.run(test())
