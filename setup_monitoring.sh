#!/bin/bash
# Setup script for Diamond monitoring across 65 repos

echo "🔷 Setting Up Diamond Monitoring System"
echo "========================================"
echo ""

# Check if env.txt exists
if [ ! -f "env.txt" ]; then
    echo "⚠️  env.txt not found. Creating template..."
    cat > env.txt << 'EOF'
# GitHub Token for fetching Treasure repos
GITHUB_TOKEN=ghp_your_token_here

# Tenderly credentials (for contract verification/simulation)
TENDERLY_ACCESS_KEY=your_tenderly_key
TENDERLY_USERNAME=your_username
TENDERLY_PROJECT=your_project
TENDERLY_NODE_ACCESS_KEY=your_node_key

# Optional: Reservoir API key (for treasure-floor monitor)
RESERVOIR_API_KEY=your_reservoir_key
EOF
    echo "✅ Created env.txt template"
    echo "   Please edit env.txt with your actual credentials"
    echo ""
fi

# Check if diamond_deployments.json exists
if [ ! -f "diamond_deployments.json" ]; then
    echo "⚠️  diamond_deployments.json not found. Creating template..."
    cat > diamond_deployments.json << 'EOF'
{
  "description": "Diamond contract deployments across 65 Treasure repos",
  "deployments": []
}
EOF
    echo "✅ Created diamond_deployments.json template"
    echo "   Add your Diamond addresses here"
    echo ""
fi

# Load environment variables
if [ -f "env.txt" ]; then
    echo "📝 Loading environment variables from env.txt..."
    set -a
    source env.txt
    set +a
    echo "✅ Environment variables loaded"
    echo ""
fi

# Run initial checks
echo "🔍 Running Initial Checks..."
echo ""

echo "1. Checking Treasure repos..."
npm run treasure-repos-check

echo ""
echo "2. Checking Blockscout monitoring..."
npm run blockscout-monitor 2>&1 | head -15

echo ""
echo "3. Checking Tenderly status..."
npm run tenderly-treasure status

echo ""
echo "4. Checking Chainlink upkeep config..."
npm run chainlink-upkeep -- --check

echo ""
echo "========================================"
echo "✅ Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Edit env.txt with your Tenderly credentials"
echo "2. Add Diamond addresses to diamond_deployments.json"
echo "3. Run: npm run blockscout-monitor -- --watch"
echo "4. Run: npm run tenderly-diamond-repos -- --watch"
echo ""
