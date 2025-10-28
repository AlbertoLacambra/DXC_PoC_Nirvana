#!/bin/bash

# Script to start Next.js dev server on port 3000
# Kills any existing process on port 3000 first

echo "🔍 Checking for processes on port 3000..."

# Find and kill processes on port 3000
PORT_PID=$(lsof -ti:3000 2>/dev/null)

if [ ! -z "$PORT_PID" ]; then
  echo "⚠️  Found process $PORT_PID on port 3000"
  echo "🔪 Killing process..."
  kill -9 $PORT_PID 2>/dev/null
  sleep 1
  echo "✅ Port 3000 is now free"
else
  echo "✅ Port 3000 is already free"
fi

echo ""
echo "🚀 Starting Next.js development server on port 3000..."
echo ""

# Start Next.js on port 3000
PORT=3000 npm run dev
