"""
Cloudflare API Integration
Complete Cloudflare API wrapper with MCP server management
"""

import os
import httpx
from typing import Optional, Dict, Any, List
import asyncio


def load_env():
    """Load environment variables from env.txt"""
    config = {}
    possible_paths = [
        "/mnt/Vault/env.txt",
        "/mnt/Vault/Cursor-Agent/env.txt",
        os.path.join(os.getcwd(), "env.txt")
    ]
    
    env_file = None;
    for path in possible_paths:
        if os.path.exists(path):
            env_file = path
            break

    if env_file:
        with open(env_file, 'r') as f:
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
    return config


ENV = load_env()


class CloudflareAPI:
    """
    Cloudflare API Integration

    Manages:
    - DNS records
    - SSL certificates
    - Cloudflare Access (Zero Trust)
    - Web3 gateways (IPFS, Ethereum)
    - Zone configuration
    """

    def __init__(self):
        """Initialize Cloudflare API with credentials from env.txt"""
        self.zone_id = ENV.get('CLOUDFLARE_ZONE_ID', ENV.get('ZONE_ID', ''))
        self.api_token = ENV.get('CLOUDFLARE_API_TOKEN', ENV.get('API_TOKEN', ''))
        self.api_key = ENV.get('CLOUDFLARE_GLOBAL_API', ENV.get('API_KEY', ''))
        # Default to ENS email, fallback to personal email
        self.email = ENV.get('DIGITAL_PERSONA_EMAIL', ENV.get('PERSONAL_EMAIL', ENV.get('CLOUDFLARE_EMAIL', 'theosmagic.uni.eth@ethermail.io')))
        self.ens = ENV.get('ENS_NAME', 'theosmagic.uni.eth')
        self.account_id = ENV.get('CLOUDFLARE_ACCOUNT_ID', ENV.get('ACCOUNT_ID', ''))

        self.base_url = "https://api.cloudflare.com/client/v4"

        if not self.api_token and not self.api_key:
            print(f"DEBUG: ENV keys found: {list(ENV.keys())}")
            print(f"DEBUG: api_token: {'Found' if self.api_token else 'Missing'}")
            print(f"DEBUG: api_key: {'Found' if self.api_key else 'Missing'}")
            raise ValueError("Cloudflare API credentials not found in env.txt")

    def _get_headers(self) -> Dict[str, str]:
        """Get API headers - Prefer Global API Key for reliability"""
        if self.api_key and self.email:
            return {
                "X-Auth-Email": self.email,
                "X-Auth-Key": self.api_key,
                "Content-Type": "application/json"
            }
        elif self.api_token:
            return {
                "Authorization": f"Bearer {self.api_token}",
                "Content-Type": "application/json"
            }
        else:
            raise ValueError("No Cloudflare API credentials available")

    # DNS Operations

    async def list_dns_records(self, record_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all DNS records for zone"""
        url = f"{self.base_url}/zones/{self.zone_id}/dns_records"
        params = {}
        if record_type:
            params['type'] = record_type

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json().get('result', [])

    async def get_dns_record(self, record_id: str) -> Dict[str, Any]:
        """Get specific DNS record"""
        url = f"{self.base_url}/zones/{self.zone_id}/dns_records/{record_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    async def create_dns_record(
        self,
        name: str,
        record_type: str,
        content: str,
        ttl: int = 1,  # Auto
        proxied: bool = False
    ) -> Dict[str, Any]:
        """Create DNS record"""
        url = f"{self.base_url}/zones/{self.zone_id}/dns_records"

        payload = {
            "type": record_type,
            "name": name,
            "content": content,
            "ttl": ttl,
            "proxied": proxied
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json().get('result', {})

    async def update_dns_record(
        self,
        record_id: str,
        name: str,
        record_type: str,
        content: str,
        ttl: int = 1,
        proxied: bool = False
    ) -> Dict[str, Any]:
        """Update DNS record"""
        url = f"{self.base_url}/zones/{self.zone_id}/dns_records/{record_id}"

        payload = {
            "type": record_type,
            "name": name,
            "content": content,
            "ttl": ttl,
            "proxied": proxied
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json().get('result', {})

    async def delete_dns_record(self, record_id: str) -> Dict[str, Any]:
        """Delete DNS record"""
        url = f"{self.base_url}/zones/{self.zone_id}/dns_records/{record_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    # SSL Operations

    async def list_ssl_certificates(self) -> List[Dict[str, Any]]:
        """Get SSL certificates for zone"""
        url = f"{self.base_url}/zones/{self.zone_id}/ssl/certificate_packs"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', [])

    async def get_ssl_settings(self) -> Dict[str, Any]:
        """Get SSL/TLS settings"""
        url = f"{self.base_url}/zones/{self.zone_id}/settings/ssl"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    async def update_ssl_settings(self, value: str) -> Dict[str, Any]:
        """
        Update SSL/TLS settings

        Values: off, flexible, full, strict
        """
        url = f"{self.base_url}/zones/{self.zone_id}/settings/ssl"

        payload = {"value": value}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.patch(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json().get('result', {})

    # Cloudflare Access (Zero Trust)

    async def list_access_applications(self) -> List[Dict[str, Any]]:
        """Get all Cloudflare Access applications"""
        url = f"{self.base_url}/accounts/{self.account_id}/access/apps"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', [])

    async def get_access_application(self, app_id: str) -> Dict[str, Any]:
        """Get specific Access application"""
        url = f"{self.base_url}/accounts/{self.account_id}/access/apps/{app_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    async def create_access_application(
        self,
        name: str,
        domain: str,
        session_duration: str = "24h"
    ) -> Dict[str, Any]:
        """Create Cloudflare Access application"""
        url = f"{self.base_url}/accounts/{self.account_id}/access/apps"

        payload = {
            "name": name,
            "domain": domain,
            "session_duration": session_duration,
            "type": "self_hosted"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json().get('result', {})

    # Web3 Gateways

    async def list_web3_hostnames(self) -> List[Dict[str, Any]]:
        """Get Web3 hostnames (IPFS, Ethereum)"""
        url = f"{self.base_url}/zones/{self.zone_id}/web3/hostnames"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', [])

    async def get_web3_hostname(self, hostname_id: str) -> Dict[str, Any]:
        """Get specific Web3 hostname"""
        url = f"{self.base_url}/zones/{self.zone_id}/web3/hostnames/{hostname_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    async def create_web3_hostname(
        self,
        name: str,
        target: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create Web3 hostname (IPFS or Ethereum gateway)"""
        url = f"{self.base_url}/zones/{self.zone_id}/web3/hostnames"

        payload = {
            "name": name,
            "target": target
        }
        if description:
            payload["description"] = description

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json().get('result', {})

    # Zone Operations

    async def get_zone_info(self) -> Dict[str, Any]:
        """Get zone information"""
        url = f"{self.base_url}/zones/{self.zone_id}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', {})

    async def get_zone_settings(self) -> List[Dict[str, Any]]:
        """Get all zone settings"""
        url = f"{self.base_url}/zones/{self.zone_id}/settings"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get('result', [])

    # Convenience Methods

    async def setup_mcp_endpoint(
        self,
        subdomain: str = "system76",
        ip_address: str = None
    ) -> Dict[str, Any]:
        """
        Setup DNS for MCP endpoint

        Creates A record for subdomain.bridgeworld.lol
        """
        zone_info = await self.get_zone_info()
        domain = zone_info.get('name', 'bridgeworld.lol')
        full_domain = f"{subdomain}.{domain}"

        # Check if record exists
        records = await self.list_dns_records(record_type='A')
        existing = [r for r in records if r.get('name') == full_domain]

        if existing:
            record = existing[0]
            return {
                'status': 'exists',
                'record': record,
                'domain': full_domain
            }

        if not ip_address:
            raise ValueError("IP address required to create DNS record")

        # Create A record
        record = await self.create_dns_record(
            name=full_domain,
            record_type='A',
            content=ip_address,
            proxied=True  # Enable Cloudflare proxy
        )

        return {
            'status': 'created',
            'record': record,
            'domain': full_domain
        }

    async def get_mcp_status(self) -> Dict[str, Any]:
        """Get MCP server DNS and Access status"""
        # Get DNS records
        dns_records = await self.list_dns_records()
        mcp_records = [r for r in dns_records if 'system76' in r.get('name', '')]

        # Get Access applications
        try:
            access_apps = await self.list_access_applications()
            mcp_apps = [a for a in access_apps if 'mcp' in a.get('name', '').lower() or 'system76' in a.get('domain', '')]
        except:
            access_apps = []
            mcp_apps = []

        # Get Web3 gateways
        try:
            web3_hostnames = await self.list_web3_hostnames()
        except:
            web3_hostnames = []

        return {
            'dns_records': mcp_records,
            'access_applications': mcp_apps,
            'web3_hostnames': web3_hostnames,
            'zone_id': self.zone_id,
            'account_id': self.account_id
        }


# Synchronous wrapper functions for convenience

def get_dns_records(record_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Synchronous: Get DNS records"""
    api = CloudflareAPI()
    return asyncio.run(api.list_dns_records(record_type))


def get_mcp_status() -> Dict[str, Any]:
    """Synchronous: Get MCP server status"""
    api = CloudflareAPI()
    return asyncio.run(api.get_mcp_status())


def create_dns_record(name: str, record_type: str, content: str, ttl: int = 1, proxied: bool = False) -> Dict[str, Any]:
    """Synchronous: Create DNS record"""
    api = CloudflareAPI()
    return asyncio.run(api.create_dns_record(name, record_type, content, ttl, proxied))


if __name__ == "__main__":
    # Test
    print("Testing Cloudflare API...")
    api = CloudflareAPI()

    print(f"Zone ID: {api.zone_id}")
    print(f"Account ID: {api.account_id}")
    print(f"Email: {api.email}")

    # Get MCP status
    status = asyncio.run(api.get_mcp_status())
    print(f"\nMCP DNS Records: {len(status['dns_records'])}")
    print(f"MCP Access Apps: {len(status['access_applications'])}")
    print(f"Web3 Hostnames: {len(status['web3_hostnames'])}")
