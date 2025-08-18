#!/bin/bash
# Restore Railway configuration files if needed

BACKUP_DIR="/workspace/backups/railway_config_$(ls -t /workspace/backups/ | head -n1)"

if [ -d "$BACKUP_DIR" ]; then
  echo "Restoring Railway configuration from $BACKUP_DIR..."
  cp "$BACKUP_DIR/railway.json" "$BACKUP_DIR/nixpacks.toml" "$BACKUP_DIR/package.json" "$BACKUP_DIR/vite.config.ts" /workspace/
  echo "Restoration complete."
else
  echo "No backup directory found."
fi
