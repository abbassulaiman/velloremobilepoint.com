#!/bin/bash

PORT=${1:-9000}
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Vellore Mobile Point dev server..."
echo "URL: http://localhost:$PORT"
echo "Press Ctrl+C to stop."
echo ""

open "http://localhost:$PORT"

python3 -m http.server "$PORT" --directory "$ROOT"
