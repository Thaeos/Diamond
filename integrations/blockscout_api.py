"""
Blockscout API Integration
==========================

"Bloomberg Terminal" for your agents - Real-time on-chain data feed
for autonomous decision-making.

Features:
- Transaction monitoring
- Contract interaction tracking
- Token analytics
- Mempool watching
- Internal transaction traces
- Token holder analysis
"""

import os
import httpx
from typing import Dict, Any, Optional, List
import asyncio


def load_env():
    """Load environment variables from env.txt"""
    config = {}
    possible_paths = [
        "/mnt/Vault/env.txt",
        "/mnt/Vault/Cursor-Agent/env.txt",
        os.path.join(os.getcwd(), "env.txt")
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith('#') or line.startswith('-----'):
                        continue
                    if '=' in line:
                        key_part, value = line.split('=', 1)
                        key = key_part.strip()
                        if key.startswith('export '):
                            key = key[7:].strip()
                        config[key] = value.strip().strip('"').strip("'")
            break
    
    for key, value in config.items():
        os.environ[key] = value
    
    return config


ENV = load_env()


class BlockscoutAPI:
    """
    Blockscout API Integration
    
    "Bloomberg Terminal" for agents - provides real-time on-chain data
    for autonomous decision-making.
    """
    
    def __init__(self, chain_id: int = 42161):
        """
        Initialize Blockscout API
        
        Args:
            chain_id: Chain ID (1=Ethereum, 42161=Arbitrum, 137=Polygon, 8453=Base)
        """
        self.chain_id = chain_id
        
        # Check for custom Blockscout instance first
        custom_url = ENV.get(f'BLOCKSCOUT_CHAIN_{chain_id}_URL') or ENV.get('BLOCKSCOUT_URL', '')
        
        if custom_url:
            self.base_url = custom_url.rstrip('/')
            self.api_type = "blockscout"
        else:
            # Official Blockscout/Etherscan API endpoints
            # Blockscout: https://docs.blockscout.com/api-reference
            # Etherscan-compatible APIs for chains without Blockscout
            self.api_configs = {
                1: {
                    "url": "https://eth.blockscout.com/api/v2",
                    "type": "blockscout",
                    "api_key_name": "BLOCKSCOUT_API_KEY"
                },
                42161: {
                    "url": "https://api.arbiscan.io/api",
                    "type": "etherscan",
                    "api_key_name": "ARBISCAN_API_KEY"
                },
                137: {
                    "url": "https://api.polygonscan.com/api",
                    "type": "polygonscan",
                    "api_key_name": "POLYGONSCAN_API_KEY"
                },
                8453: {
                    "url": "https://api.basescan.org/api",
                    "type": "basescan",
                    "api_key_name": "BASESCAN_API_KEY"
                }
            }
            
            config = self.api_configs.get(chain_id, {})
            self.base_url = config.get("url", "")
            self.api_type = config.get("type", "blockscout")
            api_key_name = config.get("api_key_name", "BLOCKSCOUT_API_KEY")
            self.api_key = ENV.get(api_key_name) or ENV.get('ETHERSCAN_API_KEY') or ""
    
    def _get_headers(self) -> Dict[str, str]:
        """Get API headers"""
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    def _get_params(self, **kwargs) -> Dict[str, Any]:
        """Get API parameters"""
        params = kwargs.copy()
        if self.api_key and 'apikey' not in params:
            params['apikey'] = self.api_key
        return params
    
    async def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """
        Get transaction details
        
        Returns full transaction data including internal traces
        """
        url = f"{self.base_url}"
        
        # Use appropriate endpoint based on chain
        if self.chain_id == 42161:  # Arbitrum (Etherscan API)
            params = self._get_params(module="proxy", action="eth_getTransactionByHash", txhash=tx_hash)
        else:  # Blockscout API v2
            url = f"{self.base_url}/transactions/{tx_hash}"
            params = {}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()
    
    async def get_transaction_traces(self, tx_hash: str) -> List[Dict[str, Any]]:
        """
        Get internal transaction traces
        
        Critical for debugging failed deployments
        """
        url = f"{self.base_url}"
        
        if self.chain_id == 42161:  # Arbitrum (Etherscan API)
            params = self._get_params(module="proxy", action="trace_transaction", txhash=tx_hash)
        else:  # Blockscout API v2
            url = f"{self.base_url}/transactions/{tx_hash}/internal-transactions"
            params = {}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            data = response.json()
            
            # Handle different response formats
            if isinstance(data, dict) and 'result' in data:
                return data['result'] if isinstance(data['result'], list) else [data['result']]
            return data if isinstance(data, list) else []
    
    async def get_contract_transactions(
        self,
        contract_address: str,
        page: int = 1,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get transactions for a contract
        
        Monitor contract interactions in real-time
        """
        if self.api_type == "etherscan" or self.api_type == "polygonscan" or self.api_type == "basescan":
            # Use Etherscan-style API
            params = self._get_params(
                module="account",
                action="txlist",
                address=contract_address,
                startblock=0,
                endblock=99999999,
                page=page,
                offset=limit,
                sort="desc"
            )
            url = self.base_url
        else:
            # Use Blockscout API v2
            url = f"{self.base_url}/addresses/{contract_address}/transactions"
            params = {"page": page, "limit": limit}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            data = response.json()
            
            # Handle Etherscan-style response
            if self.api_type in ["etherscan", "polygonscan", "basescan"]:
                if "result" in data:
                    transactions = data["result"] if isinstance(data["result"], list) else []
                    return {
                        "items": transactions,
                        "total": len(transactions),
                        "page": page
                    }
            
            return data
    
    async def get_token_transfers(
        self,
        token_address: str,
        page: int = 1,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get token transfers
        
        Track MAGIC, SAND, MANA movements
        """
        url = f"{self.base_url}/tokens/{token_address}/transfers"
        params = {"page": page, "limit": limit}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()
    
    async def get_token_holders(
        self,
        token_address: str,
        page: int = 1,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get top token holders
        
        Analyze market sentiment
        """
        url = f"{self.base_url}/tokens/{token_address}/holders"
        params = {"page": page, "limit": limit}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()
    
    async def get_address_balance(self, address: str) -> Dict[str, Any]:
        """Get address balance and token holdings"""
        url = f"{self.base_url}/addresses/{address}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
    
    async def search_transactions(
        self,
        query: str,
        page: int = 1,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Search transactions"""
        url = f"{self.base_url}/transactions"
        params = {"q": query, "page": page, "limit": limit}
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()
    
    async def monitor_contract(
        self,
        contract_address: str,
        callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Monitor contract for new transactions
        
        Real-time monitoring for "Hot or Not" agent
        """
        # Get latest transactions
        data = await self.get_contract_transactions(contract_address, page=1, limit=10)
        
        if callback:
            transactions = data.get('items', [])
            for tx in transactions:
                await callback(tx)
        
        return data
    
    async def detect_volume_spike(
        self,
        token_address: str,
        threshold_multiplier: float = 2.0
    ) -> Dict[str, Any]:
        """
        Detect volume spike
        
        "Hot or Not" detection for trading opportunities
        """
        # Get recent transfers
        transfers = await self.get_token_transfers(token_address, limit=100)
        
        # Calculate volume
        recent_volume = sum(
            float(t.get('value', 0)) 
            for t in transfers.get('items', [])[:10]
        )
        
        historical_volume = sum(
            float(t.get('value', 0)) 
            for t in transfers.get('items', [])[10:100]
        ) / 9  # Average of remaining
        
        spike_detected = recent_volume > (historical_volume * threshold_multiplier)
        
        return {
            "spike_detected": spike_detected,
            "recent_volume": recent_volume,
            "historical_volume": historical_volume,
            "multiplier": recent_volume / historical_volume if historical_volume > 0 else 0,
            "token_address": token_address
        }
    
    async def detect_whale_movement(
        self,
        token_address: str,
        threshold: float = 10000.0
    ) -> List[Dict[str, Any]]:
        """
        Detect whale movements
        
        Large transfers that might indicate market moves
        """
        transfers = await self.get_token_transfers(token_address, limit=100)
        
        whale_transfers = [
            t for t in transfers.get('items', [])
            if float(t.get('value', 0)) >= threshold
        ]
        
        return whale_transfers


# Convenience functions

async def get_transaction_traces(tx_hash: str, chain_id: int = 42161) -> List[Dict[str, Any]]:
    """Quick function to get transaction traces"""
    api = BlockscoutAPI(chain_id)
    return await api.get_transaction_traces(tx_hash)


async def monitor_contract_for_spikes(
    contract_address: str,
    chain_id: int = 42161,
    callback: Optional[callable] = None
) -> Dict[str, Any]:
    """Monitor contract and detect spikes"""
    api = BlockscoutAPI(chain_id)
    return await api.monitor_contract(contract_address, callback)


if __name__ == "__main__":
    # Test
    async def test():
        api = BlockscoutAPI(chain_id=42161)
        
        # Test getting transaction
        # tx = await api.get_transaction("0x...")
        # print(tx)
        
        print("Blockscout API initialized")
        print(f"Chain ID: {api.chain_id}")
        print(f"Base URL: {api.base_url}")
    
    asyncio.run(test())
