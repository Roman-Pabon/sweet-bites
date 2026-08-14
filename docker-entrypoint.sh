#!/bin/sh
set -e

mkdir -p /app/data/uploads/avatars
chown -R nextjs:nodejs /app/data

exec su -s /bin/sh nextjs -c "cd /app && exec $*"
