#!/usr/bin/env bash
#
# Finishes the rogerraker.com setup on the VPS. Safe to run repeatedly: every
# step checks the current state first and only does what is still missing.
#
#   scp deploy/finish-setup.sh root@72.60.208.52:/tmp/
#   ssh root@72.60.208.52 'ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="a long passphrase" bash /tmp/finish-setup.sh'
#
# It never touches the josh-mojica app, its service, its database, or its nginx
# config. Everything it creates is namespaced to this app.
#
set -euo pipefail

APP=rogerraker
APP_DIR=/srv/$APP
DOMAIN=rogerraker.com
REPO=https://github.com/carlcastanas/$APP.git
DB_NAME=roger_raker
DB_USER=deploy
DEPLOY_USER=deploy
PORT=3100

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m!! %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------- 1. code ----
say "Application directory"
if [ ! -d "$APP_DIR/.git" ]; then
    echo "    cloning $REPO"
    mkdir -p "$APP_DIR"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
    sudo -u "$DEPLOY_USER" git clone "$REPO" "$APP_DIR"
else
    echo "    already cloned, pulling latest"
    sudo -u "$DEPLOY_USER" git -C "$APP_DIR" fetch --prune origin
    sudo -u "$DEPLOY_USER" git -C "$APP_DIR" reset --hard origin/main
fi
chmod +x "$APP_DIR"/scripts/deploy.sh "$APP_DIR"/deploy/*.sh 2>/dev/null || true

# ------------------------------------------------------------ 2. database ----
say "Postgres role and database"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
    | grep -q 1 || sudo -u postgres createuser "$DB_USER"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
    | grep -q 1 || sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
echo "    database $DB_NAME ready"

say "Environment file"
if [ ! -f "$APP_DIR/.env.production" ]; then
    cat > "$APP_DIR/.env.production" <<ENVEOF
DATABASE_URL=postgresql://$DB_USER@localhost:5432/$DB_NAME
AUTH_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
PORT=$PORT
ENVEOF
    chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env.production"
    chmod 600 "$APP_DIR/.env.production"
    echo "    created with a fresh AUTH_SECRET"
else
    echo "    already exists, left alone"
fi

# ------------------------------------------------------------- 3. service ----
# npm is not always at /usr/bin/npm (nvm, nodesource, fnm all differ), and a
# wrong ExecStart is the classic reason a unit fails instantly on start.
say "systemd unit"
NPM_BIN=$(command -v npm || true)
if [ -z "$NPM_BIN" ]; then
    for c in /usr/bin/npm /usr/local/bin/npm /root/.nvm/versions/node/*/bin/npm \
             /home/$DEPLOY_USER/.nvm/versions/node/*/bin/npm; do
        [ -x "$c" ] && NPM_BIN="$c" && break
    done
fi
[ -n "$NPM_BIN" ] || { warn "npm not found. Install Node before re-running."; exit 1; }
NODE_DIR=$(dirname "$NPM_BIN")
echo "    using npm at $NPM_BIN"

sed -e "s#^ExecStart=.*#ExecStart=$NPM_BIN run start -- --port $PORT#" \
    -e "s#^Environment=PORT=.*#Environment=PORT=$PORT\nEnvironment=PATH=$NODE_DIR:/usr/local/bin:/usr/bin:/bin#" \
    "$APP_DIR/deploy/$APP.service" > "/etc/systemd/system/$APP.service"
systemctl daemon-reload
systemctl enable "$APP" >/dev/null

say "Sudo rules for the deploy user"
cat > "/etc/sudoers.d/$APP" <<SUDOEOF
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart $APP
$DEPLOY_USER ALL=(root) NOPASSWD: /bin/rm -rf $APP_DIR/.next*
SUDOEOF
chmod 440 "/etc/sudoers.d/$APP"
visudo -cf "/etc/sudoers.d/$APP" >/dev/null && echo "    valid"

# --------------------------------------------------------------- 4. nginx ----
say "nginx server block"
sed -E "s/^([[:space:]]*server_name).*/\1 $DOMAIN www.$DOMAIN;/" \
    "$APP_DIR/deploy/nginx-$APP.conf" > "/etc/nginx/sites-available/$APP"
ln -sf "/etc/nginx/sites-available/$APP" "/etc/nginx/sites-enabled/$APP"
nginx -t && systemctl reload nginx
echo "    serving $DOMAIN on port 80 to 127.0.0.1:$PORT"

# --------------------------------------------------------- 5. deploy key -----
say "Deploy key for GitHub Actions"
KEY=/home/$DEPLOY_USER/.ssh/${APP}_deploy
AUTH=/home/$DEPLOY_USER/.ssh/authorized_keys
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
if [ ! -f "$KEY" ]; then
    sudo -u "$DEPLOY_USER" ssh-keygen -t ed25519 -N '' -C "github-actions-$APP" -f "$KEY"
    echo "    generated"
else
    echo "    already exists"
fi
# The key may do exactly one thing: run this app's deploy script.
if ! grep -qF "$(cat "$KEY.pub" | awk '{print $2}')" "$AUTH" 2>/dev/null; then
    printf 'command="%s/scripts/deploy.sh",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding %s\n' \
        "$APP_DIR" "$(cat "$KEY.pub")" >> "$AUTH"
    chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"
    chmod 600 "$AUTH"
    echo "    authorised with a forced command"
fi

# -------------------------------------------------------------- 6. deploy ----
say "Building and starting the app"
sudo -u "$DEPLOY_USER" "$APP_DIR/scripts/deploy.sh"

# ------------------------------------------------------------- 7. content ----
say "Content"
cd "$APP_DIR"
sudo -u "$DEPLOY_USER" env $(grep -v '^#' .env.production | xargs) \
    npx --yes tsx scripts/seed-content.ts

if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
    say "Admin login"
    sudo -u "$DEPLOY_USER" env $(grep -v '^#' .env.production | xargs) \
        ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" \
        ADMIN_NAME="${ADMIN_NAME:-Roger Raker}" \
        npx --yes tsx scripts/create-admin.ts
else
    warn "ADMIN_EMAIL / ADMIN_PASSWORD not set, so no admin login was created."
    warn "Run later:  cd $APP_DIR && ADMIN_EMAIL=... ADMIN_PASSWORD='...' npm run create-admin"
fi

# ----------------------------------------------------------------- 8. TLS ----
# Preferred: a Cloudflare Origin Certificate at /etc/ssl/cloudflare/. It needs
# no ACME challenge, so the orange cloud can stay on, and it lasts 15 years.
# Falls back to Let's Encrypt if no origin certificate has been installed.
say "TLS certificate"
CF_CRT=/etc/ssl/cloudflare/$DOMAIN.pem
CF_KEY=/etc/ssl/cloudflare/$DOMAIN.key
if [ -s "$CF_CRT" ] && [ -s "$CF_KEY" ]; then
    echo "    Cloudflare origin certificate found, enabling the HTTPS block"
    chmod 600 "$CF_KEY"
    sed -E "s/^([[:space:]]*server_name).*/\1 $DOMAIN www.$DOMAIN;/" \
        "$APP_DIR/deploy/nginx-$APP-ssl.conf" >> "/etc/nginx/sites-available/$APP"
    if nginx -t; then
        systemctl reload nginx
        echo "    HTTPS live. Set Cloudflare SSL/TLS to Full (strict)."
    else
        warn "nginx rejected the HTTPS block; leaving HTTP only."
    fi
elif [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "    Let's Encrypt certificate already present"
elif [ "${SKIP_CERTBOT:-0}" = "1" ]; then
    echo "    skipped (SKIP_CERTBOT=1)"
elif command -v certbot >/dev/null && curl -fsS -o /dev/null --max-time 10 "http://127.0.0.1:$PORT/"; then
    echo "    no origin certificate, trying Let's Encrypt"
    if certbot --nginx -n --agree-tos --redirect \
        -m "${ADMIN_EMAIL:-admin@$DOMAIN}" -d "$DOMAIN" -d "www.$DOMAIN"; then
        echo "    issued"
    else
        warn "certbot failed, which is usually Cloudflare answering the HTTP-01"
        warn "challenge instead of this server. Two ways out:"
        warn "  a) SSL/TLS > Origin Server > Create Certificate, save it to"
        warn "     $CF_CRT and $CF_KEY, then re-run this script. Best option."
        warn "  b) Set both A records to 'DNS only', re-run, then re-enable the proxy."
        warn "Until then set Cloudflare SSL/TLS to Flexible so the site loads."
    fi
fi

# --------------------------------------------------------------- summary -----
printf '\n================================================================\n'
say "Status"
printf '  service   : %s\n' "$(systemctl is-active $APP)"
printf '  port %s : %s\n' "$PORT" "$(ss -ltn | grep -q ":$PORT " && echo listening || echo 'NOT LISTENING')"
printf '  local http: %s\n' "$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 http://127.0.0.1:$PORT/ || echo unreachable)"
printf '  projects  : %s\n' "$(sudo -u postgres psql -tAd $DB_NAME -c 'SELECT count(*) FROM projects' 2>/dev/null || echo '?')"
printf '  products  : %s\n' "$(sudo -u postgres psql -tAd $DB_NAME -c 'SELECT count(*) FROM products' 2>/dev/null || echo '?')"
printf '  admins    : %s\n' "$(sudo -u postgres psql -tAd $DB_NAME -c 'SELECT count(*) FROM admin_users' 2>/dev/null || echo '?')"
printf '  tls       : %s\n' "$([ -s /etc/ssl/cloudflare/$DOMAIN.pem ] && echo 'cloudflare origin cert' || { [ -d /etc/letsencrypt/live/$DOMAIN ] && echo "let's encrypt" || echo 'none yet, use Flexible'; })"

cat <<'DONE'

Save this as the VPS_SSH_KEY secret at
https://github.com/carlcastanas/rogerraker/settings/secrets/actions
(one line, no spaces):

DONE
base64 -w0 < "$KEY" 2>/dev/null || base64 < "$KEY" | tr -d '\n'
cat <<DONE


Then in Cloudflare, SSL/TLS > Overview:
  certificate installed -> set "Full (strict)"
  no certificate yet    -> set "Flexible" so the site loads now, and switch to
                           Full (strict) once the certificate is issued.
================================================================
DONE
