#!/bin/bash
set -e

# ── Generate database.php from environment variables ──
cat > /var/www/html/api/config/database.php <<PHPEOF
<?php
define('DB_HOST', '${DB_HOST:-db}');
define('DB_PORT', '${DB_PORT:-3306}');
define('DB_NAME', '${DB_NAME:-openschool}');
define('DB_USER', '${DB_USER:-openschool}');
define('DB_PASS', '${DB_PASS:-openschool_secret}');
define('DB_CHARSET', 'utf8mb4');

define('APP_URL', '${APP_URL:-http://localhost}');
define('API_URL', APP_URL . '/api');
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('JWT_SECRET', '${JWT_SECRET:-CHANGE_ME_TO_A_RANDOM_64_CHAR_STRING}');
define('JWT_EXPIRY', ${JWT_EXPIRY:-86400});
PHPEOF

# ── Ensure upload directories exist with correct permissions ──
mkdir -p /var/www/html/uploads/photos /var/www/html/uploads/slips
chown -R www-data:www-data /var/www/html/uploads

echo "✓ Configuration generated, starting Apache..."

# ── Hand off to Apache ──
exec "$@"
