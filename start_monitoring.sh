#!/bin/bash
# Start continuous monitoring for all systems

echo "🚀 Starting Diamond Monitoring System"
echo "======================================"
echo ""

# Load environment variables
if [ -f "env.txt" ]; then
    set -a
    source env.txt
    set +a
fi

# Create log directory
mkdir -p logs

# Start Blockscout monitoring in background
echo "📡 Starting Blockscout monitoring..."
npm run blockscout-monitor -- --watch --poll=60 > logs/blockscout.log 2>&1 &
BLOCKSCOUT_PID=$!
echo "   Blockscout PID: $BLOCKSCOUT_PID"

# Start Tenderly Diamond monitoring in background (if configured)
if [ ! -z "$TENDERLY_ACCESS_KEY" ] && [ ! -z "$TENDERLY_NODE_ACCESS_KEY" ]; then
    echo "🔷 Starting Tenderly Diamond monitoring..."
    npm run tenderly-diamond-repos -- --watch > logs/tenderly_diamond.log 2>&1 &
    TENDERLY_PID=$!
    echo "   Tenderly PID: $TENDERLY_PID"
else
    echo "⚠️  Tenderly not configured - skipping Diamond monitoring"
fi

# Start Treasure floor monitoring in background
echo "💰 Starting Treasure floor monitoring..."
npm run treasure-floor -- --watch --poll=300 > logs/treasure_floor.log 2>&1 &
FLOOR_PID=$!
echo "   Floor monitor PID: $FLOOR_PID"

echo ""
echo "✅ All monitoring systems started!"
echo ""
echo "PIDs:"
echo "  Blockscout: $BLOCKSCOUT_PID"
[ ! -z "$TENDERLY_PID" ] && echo "  Tenderly: $TENDERLY_PID"
echo "  Floor Monitor: $FLOOR_PID"
echo ""
echo "Logs:"
echo "  logs/blockscout.log"
[ ! -z "$TENDERLY_PID" ] && echo "  logs/tenderly_diamond.log"
echo "  logs/treasure_floor.log"
echo ""
echo "To stop monitoring:"
echo "  kill $BLOCKSCOUT_PID $TENDERLY_PID $FLOOR_PID"
echo ""
echo "Or run: ./stop_monitoring.sh"
echo ""

# Save PIDs to file
echo "$BLOCKSCOUT_PID" > .monitoring_pids
[ ! -z "$TENDERLY_PID" ] && echo "$TENDERLY_PID" >> .monitoring_pids
echo "$FLOOR_PID" >> .monitoring_pids

# Keep script running
wait
