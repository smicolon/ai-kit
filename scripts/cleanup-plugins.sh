#!/bin/bash

# Cleanup script for Smicolon Claude Code packs
# This removes all marketplace and pack registrations for a fresh install

set -e

echo "🧹 Cleaning up Smicolon pack installations..."
echo ""

# Backup current files
BACKUP_DIR=~/.claude/plugins/backup-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

# 1. Backup and remove marketplace registration
if [ -f ~/.claude/plugins/known_marketplaces.json ]; then
    echo "📦 Backing up known_marketplaces.json..."
    cp ~/.claude/plugins/known_marketplaces.json "$BACKUP_DIR/"

    echo "🗑️  Removing Smicolon marketplace registration..."
    # Remove smicolon-marketplace entry from JSON
    python3 -c "
import json
import sys

try:
    with open('${HOME}/.claude/plugins/known_marketplaces.json', 'r') as f:
        data = json.load(f)

    if 'smicolon-marketplace' in data:
        del data['smicolon-marketplace']
        print('   ✓ Removed smicolon-marketplace')

    with open('${HOME}/.claude/plugins/known_marketplaces.json', 'w') as f:
        json.dump(data, f, indent=2)
except Exception as e:
    print(f'   ⚠️  Error: {e}')
    sys.exit(0)
"
fi

# 2. Check for any installed pack directories
echo ""
echo "🔍 Checking for installed pack directories..."
PLUGIN_DIRS=(
    "$HOME/.claude/plugins/django"
    "$HOME/.claude/plugins/nestjs"
    "$HOME/.claude/plugins/nextjs"
    "$HOME/.claude/plugins/nuxtjs"
    "$HOME/.claude/plugins/architect"
    "$HOME/.claude/plugins/dev-loop"
    "$HOME/.claude/plugins/failure-log"
    "$HOME/.claude/plugins/flutter"
    "$HOME/.claude/plugins/hono"
    "$HOME/.claude/plugins/tanstack-router"
    "$HOME/.claude/plugins/better-auth"
    "$HOME/.claude/plugins/worktree"
    "$HOME/.claude/plugins/onboard"
    "$HOME/.claude/plugins/infisical"
    "$HOME/.claude/plugins/clarify"
    "$HOME/.claude/plugins/react-review"
)

for dir in "${PLUGIN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   🗑️  Removing $dir"
        rm -rf "$dir"
    fi
done

# 3. Check Claude Extensions directory
echo ""
echo "🔍 Checking Claude Extensions directory..."
EXTENSIONS_DIR="$HOME/Library/Application Support/Claude/Claude Extensions"
if [ -d "$EXTENSIONS_DIR" ]; then
    find "$EXTENSIONS_DIR" -type d -name "*smi*" 2>/dev/null | while read dir; do
        echo "   🗑️  Removing $dir"
        rm -rf "$dir"
    done
fi

# 4. Clear any cached marketplace data
echo ""
echo "🧹 Clearing marketplace cache..."
if [ -d ~/.claude/plugins/marketplaces ]; then
    rm -rf ~/.claude/plugins/marketplaces/*
    echo "   ✓ Cleared marketplace cache"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📂 Backup saved to: $BACKUP_DIR"
echo ""
echo "🚀 You can now do a fresh installation:"
echo ""
echo "   /plugin marketplace add https://github.com/smicolon/ai-kit"
echo "   /plugin install django"
echo ""
echo "   Or for local testing:"
echo "   /plugin marketplace add smicolon file://$(pwd)"
echo "   /plugin install django"
echo ""
