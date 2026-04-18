<?php
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3308');
define('DB_NAME', 'openschool');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

define('APP_URL', 'http://localhost/openschool');
define('API_URL', APP_URL . '/api');
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
define('JWT_SECRET', '3e57a9dba226f79c8d276b662d5fd2b907b4c724f1d0093717e4896be55168bd');
define('JWT_EXPIRY', 86400); // 24 hours
