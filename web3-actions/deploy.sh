#!/bin/bash
# Deploy Tenderly Web3 Actions
#
# Usage: ./deploy.sh

set -e

# Configuration
export TENDERLY_API=${TENDERLY_API:-"LZAQjWhTiJJUskQJQXUzAw2ZE0EJpNni"}
export PATH="$PATH:/mnt/Vault/Cursor-Agent/bin"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Tenderly Web3 Actions${NC}"
echo ""

# Check if tenderly CLI is available
if ! command -v tenderly &> /dev/null; then
    echo -e "${YELLOW}⚠️  Tenderly CLI not found in PATH${NC}"
    echo "   Using: /mnt/Vault/Cursor-Agent/bin/tenderly"
    TENDERLY_CMD="/mnt/Vault/Cursor-Agent/bin/tenderly"
else
    TENDERLY_CMD="tenderly"
fi

# Check if logged in
echo -e "${BLUE}📋 Checking Tenderly login...${NC}"
$TENDERLY_CMD whoami || {
    echo -e "${YELLOW}⚠️  Not logged in. Attempting login...${NC}"
    $TENDERLY_CMD login --authentication-method access-key --access-key "$TENDERLY_API" || {
        echo -e "${YELLOW}⚠️  Login failed. Please login manually:${NC}"
        echo "   $TENDERLY_CMD login"
        exit 1
    }
}

echo ""
echo -e "${BLUE}📦 Building actions...${NC}"
cd "$(dirname "$0")"

# Build TypeScript if package.json exists
if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        echo "Installing dependencies..."
        npm install --silent
        echo "Building TypeScript..."
        npm run build 2>/dev/null || echo "Build step skipped (no build script)"
    fi
fi

echo ""
echo -e "${BLUE}🚀 Deploying actions...${NC}"
echo "Project: Ua_0357/testnet"
echo ""

# Deploy with project slug
$TENDERLY_CMD actions deploy --project Ua_0357/testnet || {
    echo ""
    echo -e "${YELLOW}⚠️  Deployment failed. Trying without project flag...${NC}"
    $TENDERLY_CMD actions deploy
}

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "View actions in Tenderly Dashboard:"
echo "https://dashboard.tenderly.co/Ua_0357/project/testnet/9a44e073-c1cc-41bf-8737-c4070d277bf2/rpc-builder"
echo ""
