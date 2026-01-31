#!/bin/bash
# Stop all monitoring processes

echo "🛑 Stopping Diamond Monitoring System"
echo "======================================"
echo ""

if [ -f ".monitoring_pids" ]; then
    while read pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping PID $pid..."
            kill "$pid"
        fi
    done < .monitoring_pids
    rm .monitoring_pids
    echo "✅ All monitoring stopped"
else
    echo "⚠️  No monitoring processes found"
fi

echo ""
