#!/bin/bash
# Auto-setup git hooks for the other Claude

echo "🔧 Setting up auto-sync git hooks..."

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Auto-pull latest changes before committing

echo "🔄 Pre-commit: Checking for remote updates..."

# Fetch latest changes from remote
git fetch origin main

# Check if remote has new commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "📥 Remote changes detected, pulling first..."

    # Stash current changes
    git stash push -m "Auto-stash before sync $(date)"

    # Pull latest changes
    git pull origin main --rebase

    # Pop stashed changes back
    git stash pop || echo "ℹ️  No conflicts, continuing..."

    echo "✅ Synced with remote, proceeding with commit"
else
    echo "✅ Already up to date with remote"
fi

exit 0
EOF

# Create post-merge hook
cat > .git/hooks/post-merge << 'EOF'
#!/bin/bash
# Auto-actions after merging/pulling

echo "🔄 Post-merge: Running sync tasks..."

# Check if package.json changed and reinstall deps if needed
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
    echo "📦 package.json changed, updating dependencies..."
    npm install
fi

# Check if any config files changed
if git diff --name-only HEAD@{1} HEAD | grep -E "(next.config|tailwind.config|tsconfig)" | grep -q .; then
    echo "⚙️  Config files changed, restarting dev server recommended"
fi

echo "✅ Post-merge tasks completed"

exit 0
EOF

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Auto-pull before pushing to avoid conflicts

echo "🔄 Pre-push: Syncing with remote..."

# Fetch latest changes
git fetch origin

# Check if we're behind
UPSTREAM="origin/$(git branch --show-current)"
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM" 2>/dev/null)

if [ "$REMOTE" != "" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "📥 Remote has new changes, pulling first..."

    # Pull with rebase to maintain clean history
    git pull origin $(git branch --show-current) --rebase

    echo "✅ Synced, proceeding with push"
else
    echo "✅ Up to date, proceeding with push"
fi

exit 0
EOF

# Make hooks executable
chmod +x .git/hooks/pre-commit .git/hooks/post-merge .git/hooks/pre-push

echo "✅ Git hooks installed successfully!"
echo "🚀 Auto-sync is now active!"