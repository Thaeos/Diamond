#!/bin/bash
# Deploy Diamond Contract to Tenderly Virtual TestNet
# 
# Usage: ./scripts/deploy_diamond_tenderly.sh [CONTRACT_NAME]
#
# This script deploys the Diamond Contract to Tenderly Virtual TestNet
# and integrates it with the Autonomous Agent Wallet system.

set -e

# Configuration
CONTRACT_NAME=${1:-"Diamond"}
TENDERLY_API_KEY=${TENDERLY_API:-"LZAQjWhTiJJUskQJQXUzAw2ZE0EJpNni"}
TENDERLY_RPC_HTTP=${TENDERLY_RPC_HTTP:-"https://virtual.mainnet.us-east.rpc.tenderly.co/ba0e32f8-b5f3-4ca6-a2cc-3ab4fa250000"}
TENDERLY_VERIFIER_URL="${TENDERLY_RPC_HTTP}/verify/etherscan"
PRIVATE_KEY=${PRIVATE_KEY:-""}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying Diamond Contract to Tenderly Virtual TestNet${NC}"
echo ""

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install Foundry first."
    echo "   Visit: https://book.getfoundry.sh/getting-started/installation"
    exit 1
fi

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "⚠️  PRIVATE_KEY not set. Using default (for testing only)"
    echo "   Set PRIVATE_KEY environment variable for production"
fi

# Set Foundry environment variables
export TENDERLY_ACCESS_KEY=$TENDERLY_API_KEY
export TENDERLY_VIRTUAL_TESTNET_RPC_URL=$TENDERLY_RPC_HTTP
export TENDERLY_VERIFIER_URL=$TENDERLY_VERIFIER_URL

echo -e "${GREEN}📋 Configuration:${NC}"
echo "  Contract: $CONTRACT_NAME"
echo "  RPC URL: $TENDERLY_RPC_HTTP"
echo "  Verifier URL: $TENDERLY_VERIFIER_URL"
echo ""

# Deploy contract
echo -e "${BLUE}📦 Deploying contract...${NC}"
if [ -z "$PRIVATE_KEY" ]; then
    forge create $CONTRACT_NAME \
        --rpc-url $TENDERLY_RPC_HTTP \
        --etherscan-api-key $TENDERLY_API_KEY \
        --verify \
        --verifier-url $TENDERLY_VERIFIER_URL \
        --broadcast
else
    forge create $CONTRACT_NAME \
        --private-key $PRIVATE_KEY \
        --rpc-url $TENDERLY_RPC_HTTP \
        --etherscan-api-key $TENDERLY_API_KEY \
        --verify \
        --verifier-url $TENDERLY_VERIFIER_URL \
        --broadcast
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update DIAMOND_ADDRESS in your environment"
echo "  2. Configure Autonomous Agent Wallet with the new address"
echo "  3. Monitor transactions via Tenderly Dashboard"
echo ""
