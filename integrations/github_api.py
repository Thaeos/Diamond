"""
GitHub API Integration
Complete GitHub API wrapper with CLI integration
"""

import os
import subprocess
import json
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
    
    env_file = None
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


class GitHubAPI:
    """
    GitHub API Integration

    Manages:
    - Repositories
    - Issues and Pull Requests
    - Actions and workflows
    - Releases
    - Gists
    - GitHub CLI integration
    """

    def __init__(self):
        """Initialize GitHub API with token from env.txt"""
        self.token = ENV.get('GITHUB_TOKEN', '')
        self.base_url = "https://api.github.com"
        
        # Default ENS and email
        self.default_ens = ENV.get('ENS_NAME', 'theosmagic.uni.eth')
        self.default_email = ENV.get('DIGITAL_PERSONA_EMAIL', 'theosmagic.uni.eth@ethermail.io')

        if not self.token:
            raise ValueError("GitHub token not found in env.txt")

        # Setup gh CLI with token
        os.environ['GITHUB_TOKEN'] = self.token
        os.environ['GH_TOKEN'] = self.token

    def _get_headers(self) -> Dict[str, str]:
        """Get API headers"""
        return {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }

    # CLI Integration

    def gh(self, command: str) -> Dict[str, Any]:
        """
        Execute gh CLI command

        Example:
            gh("repo list")
            gh("issue list --repo owner/repo")
            gh("pr create --title 'Fix bug' --body 'Description'")
        """
        try:
            result = subprocess.run(
                f"gh {command}",
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )

            return {
                'success': result.returncode == 0,
                'stdout': result.stdout.strip(),
                'stderr': result.stderr.strip(),
                'returncode': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'stdout': '',
                'stderr': 'Command timed out',
                'returncode': -1
            }
        except Exception as e:
            return {
                'success': False,
                'stdout': '',
                'stderr': str(e),
                'returncode': -1
            }

    def gh_json(self, command: str) -> Any:
        """
        Execute gh CLI command and parse JSON output

        Example:
            gh_json("repo list --json name,owner")
        """
        if '--json' not in command:
            command += ' --json'

        result = self.gh(command)

        if result['success'] and result['stdout']:
            try:
                return json.loads(result['stdout'])
            except json.JSONDecodeError:
                return result['stdout']

        return None

    # Repository Operations

    async def get_user(self) -> Dict[str, Any]:
        """Get authenticated user"""
        url = f"{self.base_url}/user"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def list_repos(self, username: Optional[str] = None) -> List[Dict[str, Any]]:
        """List repositories"""
        if username:
            url = f"{self.base_url}/users/{username}/repos"
        else:
            url = f"{self.base_url}/user/repos"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def get_repo(self, owner: str, repo: str) -> Dict[str, Any]:
        """Get repository information"""
        url = f"{self.base_url}/repos/{owner}/{repo}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def create_repo(
        self,
        name: str,
        description: Optional[str] = None,
        private: bool = False,
        auto_init: bool = True
    ) -> Dict[str, Any]:
        """Create repository"""
        url = f"{self.base_url}/user/repos"

        payload = {
            "name": name,
            "private": private,
            "auto_init": auto_init
        }
        if description:
            payload["description"] = description

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()

    # Issues

    async def list_issues(
        self,
        owner: str,
        repo: str,
        state: str = "open"
    ) -> List[Dict[str, Any]]:
        """List issues"""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues"
        params = {"state": state}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def get_issue(self, owner: str, repo: str, issue_number: int) -> Dict[str, Any]:
        """Get issue"""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def create_issue(
        self,
        owner: str,
        repo: str,
        title: str,
        body: Optional[str] = None,
        labels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Create issue"""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues"

        payload = {"title": title}
        if body:
            payload["body"] = body
        if labels:
            payload["labels"] = labels

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()

    async def update_issue(
        self,
        owner: str,
        repo: str,
        issue_number: int,
        title: Optional[str] = None,
        body: Optional[str] = None,
        state: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update issue"""
        url = f"{self.base_url}/repos/{owner}/{repo}/issues/{issue_number}"

        payload = {}
        if title:
            payload["title"] = title
        if body:
            payload["body"] = body
        if state:
            payload["state"] = state

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.patch(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()

    # Pull Requests

    async def list_pull_requests(
        self,
        owner: str,
        repo: str,
        state: str = "open"
    ) -> List[Dict[str, Any]]:
        """List pull requests"""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"
        params = {"state": state}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers(), params=params)
            response.raise_for_status()
            return response.json()

    async def get_pull_request(
        self,
        owner: str,
        repo: str,
        pr_number: int
    ) -> Dict[str, Any]:
        """Get pull request"""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def create_pull_request(
        self,
        owner: str,
        repo: str,
        title: str,
        head: str,
        base: str,
        body: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create pull request"""
        url = f"{self.base_url}/repos/{owner}/{repo}/pulls"

        payload = {
            "title": title,
            "head": head,
            "base": base
        }
        if body:
            payload["body"] = body

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()

    # GitHub Actions

    async def list_workflows(self, owner: str, repo: str) -> Dict[str, Any]:
        """List workflows"""
        url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def list_workflow_runs(
        self,
        owner: str,
        repo: str,
        workflow_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """List workflow runs"""
        if workflow_id:
            url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
        else:
            url = f"{self.base_url}/repos/{owner}/{repo}/actions/runs"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def trigger_workflow(
        self,
        owner: str,
        repo: str,
        workflow_id: str,
        ref: str = "main",
        inputs: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Trigger workflow dispatch"""
        url = f"{self.base_url}/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"

        payload = {"ref": ref}
        if inputs:
            payload["inputs"] = inputs

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return {"status": "triggered", "workflow_id": workflow_id}

    # Releases

    async def list_releases(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """List releases"""
        url = f"{self.base_url}/repos/{owner}/{repo}/releases"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def get_latest_release(self, owner: str, repo: str) -> Dict[str, Any]:
        """Get latest release"""
        url = f"{self.base_url}/repos/{owner}/{repo}/releases/latest"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def create_release(
        self,
        owner: str,
        repo: str,
        tag_name: str,
        name: Optional[str] = None,
        body: Optional[str] = None,
        draft: bool = False,
        prerelease: bool = False
    ) -> Dict[str, Any]:
        """Create release"""
        url = f"{self.base_url}/repos/{owner}/{repo}/releases"

        payload = {
            "tag_name": tag_name,
            "draft": draft,
            "prerelease": prerelease
        }
        if name:
            payload["name"] = name
        if body:
            payload["body"] = body

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()

    # Gists

    async def list_gists(self) -> List[Dict[str, Any]]:
        """List gists"""
        url = f"{self.base_url}/gists"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()

    async def create_gist(
        self,
        files: Dict[str, Dict[str, str]],
        description: Optional[str] = None,
        public: bool = False
    ) -> Dict[str, Any]:
        """
        Create gist

        files format:
        {
            "filename.txt": {"content": "file content"},
            "another.py": {"content": "print('hello')"}
        }
        """
        url = f"{self.base_url}/gists"

        payload = {
            "files": files,
            "public": public
        }
        if description:
            payload["description"] = description

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            response.raise_for_status()
            return response.json()


# Synchronous wrapper functions for convenience

def get_user() -> Dict[str, Any]:
    """Synchronous: Get authenticated user"""
    api = GitHubAPI()
    return asyncio.run(api.get_user())


def list_repos(username: Optional[str] = None) -> List[Dict[str, Any]]:
    """Synchronous: List repositories"""
    api = GitHubAPI()
    return asyncio.run(api.list_repos(username))


def gh_command(command: str) -> Dict[str, Any]:
    """Synchronous: Execute gh CLI command"""
    api = GitHubAPI()
    return api.gh(command)


if __name__ == "__main__":
    # Test
    print("Testing GitHub API...")
    api = GitHubAPI()

    # Get user
    user = asyncio.run(api.get_user())
    print(f"User: {user.get('login')}")
    print(f"Name: {user.get('name')}")

    # List repos
    repos = asyncio.run(api.list_repos())
    print(f"\nRepositories: {len(repos)}")
    for repo in repos[:5]:
        print(f"  - {repo['full_name']}")

    # Test gh CLI
    print("\nTesting gh CLI...")
    result = api.gh("auth status")
    print(result['stdout'])
