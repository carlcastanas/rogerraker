#!/usr/bin/env bash
#
# One-time server setup for rogerraker on the VPS that already runs
# joshmojica.io (72.60.208.52). Run it ONCE, as root:
#
#   scp deploy/bootstrap-vps.sh root@72.60.208.52:/tmp/
#   ssh root@72.60.208.52 'bash /tmp/bootstrap-vps.sh yourdomain.com'
#
# It only ever creates new things: a new directory, a new database, a new
# systemd unit on a new port, a new nginx server block, and a new deploy key.
# It does not touch the josh-mojica app, its service, its database, or its
# nginx config.
#
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then
    echo "Usage: bash bootstrap-vps.sh yourdomain.com"
    exit 1
fi

APP=rogerraker
APP_DIR=/srv/$APP
REPO=https://github.com/carlcastanas/rogerraker.git
DB_NAME=roger_raker
DB_USER=deploy
PORT=3100
DEPLOY_USER=deploy

echo "==> Checking the port is free"
if ss -ltn | grep -q ":$PORT "; then
    echo "!! Port $PORT is already in use. Pick another and update"
    echo "   deploy/rogerraker.service, deploy/nginx-rogerraker.conf and scripts/deploy.sh."
    exit 1
fi

echo "==> Cloning into $APP_DIR"
mkdir -p "$APP_DIR"
chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
    sudo -u "$DEPLOY_USER" git clone "$REPO" "$APP_DIR"
fi
chmod +x "$APP_DIR/scripts/deploy.sh"

echo "==> Postgres role and database"
# The deploy user owns the database so the app and the deploy script can both
# reach it over the local socket with peer auth, no password needed.
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" \
    | grep -q 1 || sudo -u postgres createuser "$DB_USER"
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" \
    | grep -q 1 || sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"

echo "==> Environment file"
if [ ! -f "$APP_DIR/.env.production" ]; then
    SECRET=$(openssl rand -hex 32)
    cat > "$APP_DIR/.env.production" <<ENVEOF
DATABASE_URL=postgresql://$DB_USER@localhost:5432/$DB_NAME
AUTH_SECRET=$SECRET
NODE_ENV=production
PORT=$PORT
ENVEOF
    chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env.production"
    chmod 600 "$APP_DIR/.env.production"
    echo "    wrote $APP_DIR/.env.production with a fresh AUTH_SECRET"
else
    echo "    $APP_DIR/.env.production already exists, leaving it alone"
fi

echo "==> systemd unit"
install -m 644 "$APP_DIR/deploy/$APP.service" "/etc/systemd/system/$APP.service"
systemctl daemon-reload
systemctl enable "$APP"

echo "==> Letting the deploy user restart only this service"
cat > "/etc/sudoers.d/$APP" <<SUDOEOF
$DEPLOY_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart $APP
$DEPLOY_USER ALL=(root) NOPASSWD: /bin/rm -rf $APP_DIR/.next*
SUDOEOF
chmod 440 "/etc/sudoers.d/$APP"
visudo -cf "/etc/sudoers.d/$APP"

echo "==> nginx server block for $DOMAIN"
sed "s/DOMAIN_HERE/$DOMAIN/g" "$APP_DIR/deploy/nginx-rogerraker.conf" \
    > "/etc/nginx/sites-available/$APP"
ln -sf "/etc/nginx/sites-available/$APP" "/etc/nginx/sites-enabled/$APP"
nginx -t
systemctl reload nginx

echo "==> Deploy key locked to this app's deploy script"
KEY=/home/$DEPLOY_USER/.ssh/${APP}_deploy
if [ ! -f "$KEY" ]; then
    sudo -u "$DEPLOY_USER" ssh-keygen -t ed25519 -N '' -C "github-actions-$APP" -f "$KEY"
    # Forced command: this key can do exactly one thing, run the deploy.
    printf 'command="%s/scripts/deploy.sh",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding %s\n' \
        "$APP_DIR" "$(cat "$KEY.pub")" >> "/home/$DEPLOY_USER/.ssh/authorized_keys"
    chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
    chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
fi

echo "==> First deploy"
sudo -u "$DEPLOY_USER" "$APP_DIR/scripts/deploy.sh"

cat <<DONE

================================================================
Done. Two things left, both on your laptop or in the browser.

1. GitHub repository secret
   Copy the single line below and save it at
   https://github.com/carlcastanas/rogerraker/settings/secrets/actions
   as a new secret named:  VPS_SSH_KEY

DONE
base64 -w0 < "$KEY" 2>/dev/null || base64 < "$KEY" | tr -d '\n'
cat <<DONE


2. DNS, at whoever manages $DOMAIN
   A     @      72.60.208.52
   A     www    72.60.208.52

   Once those resolve, come back and run:
   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

The app is live on http://127.0.0.1:$PORT right now, and on
http://$DOMAIN as soon as DNS points here.
================================================================
DONE
