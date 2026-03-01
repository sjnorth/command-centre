#!/bin/bash
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Pulling latest changes..."
cd "$REPO_DIR"
git pull

echo "==> Installing Python deps..."
uv sync

echo "==> Building dashboard..."
cd "$REPO_DIR/dashboard"
npm install
npm run build

echo "==> Restarting API service..."
launchctl kickstart -k gui/$(id -u)/com.commandcentre.api

echo "==> Done. Dashboard live at http://localhost:8000"
