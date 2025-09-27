#!/bin/bash
# Auto-sync script - run this every 2-3 minutes

echo "🔄 Syncing with remote..."

# Fetch latest changes
git fetch origin

# Check if main has updates
UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")

if [ $LOCAL != $REMOTE ]; then
    echo "📥 Changes detected, pulling..."
    git pull origin main --rebase
    echo "✅ Synced with main"
else
    echo "✅ Already up to date"
fi

# Push current branch if it exists
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "📤 Pushing current branch: $CURRENT_BRANCH"
    git push origin $CURRENT_BRANCH 2>/dev/null || echo "ℹ️  Branch not ready to push"
fi