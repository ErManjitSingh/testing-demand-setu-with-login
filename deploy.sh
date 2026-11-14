#!/bin/bash
set -euo pipefail

REMOTE="demandsetutours@94.136.190.202"
REMOTE_DIR="/home/demandsetutours/htdocs/demandsetutours.com"
KEY="$HOME/.ssh/demandsetutours"

SSH=(ssh -i "$KEY" -o IdentitiesOnly=yes)

echo "1. Checking SSH connection..."
"${SSH[@]}" "$REMOTE" "echo 'Server connected successfully'"

echo "2. Creating server backup..."
"${SSH[@]}" "$REMOTE" "set -e; umask 077; mkdir -p /home/demandsetutours/deploy-backups; BACKUP=/home/demandsetutours/deploy-backups/demandsetutours-\$(date +%Y%m%d-%H%M%S).tar.gz; tar -czf \"\$BACKUP\" --exclude=node_modules --exclude=.next -C '$REMOTE_DIR' .; echo \"Backup created: \$BACKUP\""

echo "3. Checking package dependencies..."
LOCAL_LOCK_HASH=$(shasum -a 256 package-lock.json | awk '{print $1}')
REMOTE_LOCK_HASH=$("${SSH[@]}" "$REMOTE" "cd '$REMOTE_DIR' && sha256sum package-lock.json" | awk '{print $1}')

echo "4. Uploading project files..."
rsync -az \
  -e "ssh -i $KEY -o IdentitiesOnly=yes" \
  --exclude='.env*' \
  --exclude='node_modules/' \
  --exclude='.next/' \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='ecosystem.config.js' \
  --exclude='.well-known/' \
  --exclude='AGENTS.md' \
  --exclude='CLAUDE.md' \
  --exclude='PROJECT_HANDOFF.md' \
  --exclude='_*.log' \
  ./ "$REMOTE:$REMOTE_DIR/"

echo "5. Checking dependencies..."
if [ "$LOCAL_LOCK_HASH" != "$REMOTE_LOCK_HASH" ]; then
  echo "Package lock changed. Installing dependencies..."
  "${SSH[@]}" "$REMOTE" "cd '$REMOTE_DIR' && npm ci"
else
  echo "Dependencies unchanged. Skipping installation."
fi

echo "6. Building production website..."
"${SSH[@]}" "$REMOTE" "set -e; cd '$REMOTE_DIR' && npm run build"

echo "7. Restarting PM2..."
"${SSH[@]}" "$REMOTE" "pm2 restart demandsetutours --update-env && sleep 5 && curl -fsS http://127.0.0.1:3090/ -o /dev/null && pm2 status"

echo "Deployment completed successfully!"
