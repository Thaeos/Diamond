"""
Tenderly Monitoring Integration
================================

Integration with Tenderly for smart contract monitoring, debugging, and alerting.

Official Tenderly Resources:
- Repository: https://github.com/tenderly
- CLI: https://github.com/Tenderly/tenderly-cli
- Web3 Actions: https://github.com/Tenderly/tenderly-actions
- Documentation: https://docs.tenderly.co/
"""

import os
import subprocess
from typing import Optional, Dict, Any, List
from pathlib import Path
from integrations.config import get_tenderly_api_key


class TenderlyIntegration:
    """
    Tenderly Integration
    
    Provides Python interface for Tenderly CLI operations.
    """
    
    def __init__(self, tenderly_path: Optional[str] = None, api_key: Optional[str] = None):
        """
        Initialize Tenderly Integration
        
        Args:
            tenderly_path: Path to tenderly CLI binary (defaults to bin/tenderly)
            api_key: Tenderly API key (defaults to TENDERLY_API environment variable)
        """
        # Get API key from parameter, environment, or config
        self.api_key = api_key or os.getenv("TENDERLY_API") or get_tenderly_api_key()
        
        if self.api_key:
            os.environ["TENDERLY_API"] = self.api_key
        if tenderly_path:
            self.tenderly_path = tenderly_path
        else:
            # Try multiple locations
            possible_paths = [
                "/mnt/Vault/Cursor-Agent/bin/tenderly",
                os.path.join(os.getcwd(), "bin", "tenderly"),
                os.path.expanduser("~/.local/bin/tenderly"),
                "/usr/local/bin/tenderly"
            ]
            
            self.tenderly_path = None
            for path in possible_paths:
                if os.path.exists(path) and os.access(path, os.X_OK):
                    self.tenderly_path = path
                    break
            
            if not self.tenderly_path:
                raise FileNotFoundError(
                    "Tenderly CLI not found. Install it with:\n"
                    "curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-linux.sh | sh"
                )
    
    def _run_command(self, args: List[str], cwd: Optional[str] = None) -> Dict[str, Any]:
        """
        Run Tenderly CLI command
        
        Args:
            args: Command arguments
            cwd: Working directory
            
        Returns:
            Command result dictionary
        """
        try:
            cmd = [self.tenderly_path] + args
            result = subprocess.run(
                cmd,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Command timed out",
                "stdout": "",
                "stderr": ""
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "stdout": "",
                "stderr": ""
            }
    
    def login(self, use_api_key: bool = True) -> Dict[str, Any]:
        """
        Login to Tenderly
        
        Args:
            use_api_key: If True and API key is set, use access key login
        
        Returns:
            Login result
        """
        if use_api_key and self.api_key:
            # Use access key for non-interactive login
            return self._run_command(["login", "--access-key", self.api_key])
        else:
            # Interactive login
            return self._run_command(["login"])
    
    def version(self) -> Dict[str, Any]:
        """
        Get Tenderly CLI version
        
        Returns:
            Version information
        """
        return self._run_command(["version"])
    
    def init_actions(self, template: str = "onboarding", directory: str = "web3-actions") -> Dict[str, Any]:
        """
        Initialize Tenderly Web3 Actions
        
        Args:
            template: Template to use (default: onboarding)
            directory: Directory to initialize in
            
        Returns:
            Initialization result
        """
        return self._run_command(
            ["actions", "init", "--template", template],
            cwd=directory
        )
    
    def deploy_actions(self, directory: str = "web3-actions") -> Dict[str, Any]:
        """
        Deploy Tenderly Web3 Actions
        
        Args:
            directory: Directory containing actions
            
        Returns:
            Deployment result
        """
        return self._run_command(["actions", "deploy"], cwd=directory)
    
    def verify_contract(
        self,
        contract_address: str,
        network_id: str,
        compiler_version: str,
        source_code: str
    ) -> Dict[str, Any]:
        """
        Verify contract on Tenderly
        
        Args:
            contract_address: Contract address
            network_id: Network ID (e.g., "1" for mainnet)
            compiler_version: Solidity compiler version
            source_code: Contract source code
            
        Returns:
            Verification result
        """
        # This would use tenderly verify command
        # Implementation depends on Tenderly CLI API
        return {
            "success": False,
            "error": "Contract verification not yet implemented"
        }
    
    def simulate_transaction(
        self,
        transaction_hash: str,
        network_id: str
    ) -> Dict[str, Any]:
        """
        Simulate transaction on Tenderly
        
        Args:
            transaction_hash: Transaction hash to simulate
            network_id: Network ID
            
        Returns:
            Simulation result
        """
        return self._run_command([
            "simulate",
            transaction_hash,
            "--network",
            network_id
        ])


# Global instance
_tenderly_integration: Optional[TenderlyIntegration] = None


def get_tenderly_integration(tenderly_path: Optional[str] = None) -> TenderlyIntegration:
    """Get global Tenderly integration instance"""
    global _tenderly_integration
    if _tenderly_integration is None:
        _tenderly_integration = TenderlyIntegration(tenderly_path)
    return _tenderly_integration


if __name__ == "__main__":
    try:
        tenderly = TenderlyIntegration()
        version_result = tenderly.version()
        
        print("=" * 80)
        print("TENDERLY INTEGRATION")
        print("=" * 80)
        print()
        
        if version_result["success"]:
            print("✅ Tenderly CLI Available")
            print(version_result["stdout"])
        else:
            print("❌ Tenderly CLI Not Available")
            print(version_result.get("error", version_result["stderr"]))
        
        print()
        print("=" * 80)
    except FileNotFoundError as e:
        print(f"❌ {e}")
