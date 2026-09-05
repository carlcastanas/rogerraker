#!/usr/bin/env bash
#
# Auto-deploy for the rogerraker app.
# Triggered by GitHub Actions over SSH; can also be run manually as the
# deploy user:   /srv/rogerraker/scripts/deploy.sh
#
# Same shape as the josh-mojica deploy on this box, with two differences:
#   - no Prisma; the schema is raw SQL in db/schema.sql
#   - the database is NEVER seeded here. scripts/seed.ts truncates every table,
#     so it stays a manual, local-only command.
#
set -euo pipefail

APP_DIR=/srv/rogerraker
BRANCH=main
SERVICE=rogerraker
PORT=3100
DB_NAME=roger_raker

# Prevent overlapping deploys.
exec 9>/tmp/rogerraker-deploy.lock
flock -n 9 || { echo "Another deploy is already running. Aborting."; exit 1; }

cd "$APP_DIR"
echo "==> [$(date -u +%FT%TZ)] Deploy starting (branch: $BRANCH)"

echo "==> Fetching latest code"
git fetch --prune origin
git reset --hard "origin/$BRANCH"

echo "==> Installing dependencies"
npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Apply the schema only when the database is still empty. Existing rows are
# never touched; migrations after the first release go in db/migrations/ and are
# applied in filename order, each one wrapped in its own transaction.
echo "==> Database"
if ! psql -d "$DB_NAME" -tAc "SELECT to_regclass('public.products')" | grep -q products; then
    echo "    fresh database, applying db/schema.sql"
    psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f db/schema.sql
else
    echo "    schema already present, leaving data alone"
fi
if [ -d db/migrations ]; then
    for m in $(find db/migrations -maxdepth 1 -name '*.sql' | sort); do
        name=$(basename "$m")
        applied=$(psql -d "$DB_NAME" -tAc \
            "SELECT 1 FROM pg_tables WHERE tablename='schema_migrations'" || true)
        if [ -z "$applied" ]; then
            psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c \
                "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())"
        fi
        if psql -d "$DB_NAME" -tAc "SELECT 1 FROM schema_migrations WHERE name='$name'" | grep -q 1; then
            continue
        fi
        echo "    applying migration $name"
        psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -1 -f "$m"
        psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -c \
            "INSERT INTO schema_migrations (name) VALUES ('$name')"
    done
fi

# Robustly remove a build directory.
#
# The systemd service may run as a different user than the deploy user and
# writes cache files into .next at runtime (image-optimizer cache, etc.).
# Renaming a directory only needs write permission on its PARENT, so a
# move-aside always frees the name; the actual delete is then best-effort and
# can never abort the deploy.
nuke() {
    [ -e "$1" ] || return 0
    local aside="$1.discard.$$-$RANDOM"
    if mv "$1" "$aside" 2>/dev/null; then
        rm -rf "$aside" 2>/dev/null || sudo -n /bin/rm -rf "$aside" 2>/dev/null || true
    else
        rm -rf "$1" 2>/dev/null || sudo -n /bin/rm -rf "$1" 2>/dev/null || true
    fi
    return 0
}

echo "==> Building (previous build kept for rollback)"
for d in .next.prev.discard.* .next.discard.*; do
    if [ -e "$d" ]; then
        rm -rf "$d" 2>/dev/null || sudo -n /bin/rm -rf "$d" 2>/dev/null || true
    fi
done

nuke .next.prev
[ -d .next ] && mv .next .next.prev
if npm run build; then
    nuke .next.prev
    echo "==> Build succeeded"
else
    echo "!! Build FAILED, restoring previous build; service left on old build"
    nuke .next
    [ -d .next.prev ] && mv .next.prev .next
    exit 1
fi

echo "==> Restarting $SERVICE"
sudo /usr/bin/systemctl restart "$SERVICE"

echo "==> Health check"
for i in $(seq 1 20); do
    if curl -fsS -o /dev/null --max-time 4 "http://127.0.0.1:$PORT/"; then
        echo "==> [$(date -u +%FT%TZ)] Deploy complete, app healthy"
        exit 0
    fi
    sleep 2
done
echo "!! App did not respond after restart. Check: journalctl -u $SERVICE -n 50"
exit 1
