<?php
/**
 * Security middleware — rate limiting, request validation, headers.
 */
class Security {
    /**
     * Apply all security measures at the start of every request.
     */
    public static function boot(): void {
        self::setSecurityHeaders();
        self::enforceRequestLimits();
    }

    /**
     * Set security headers on every response.
     */
    private static function setSecurityHeaders(): void {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
        header('Cache-Control: no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        // Remove PHP version exposure
        header_remove('X-Powered-By');
    }

    /**
     * Reject oversized request bodies (max 2 MB).
     */
    private static function enforceRequestLimits(): void {
        $maxBody = 2 * 1024 * 1024; // 2 MB
        $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
        if ($contentLength > $maxBody) {
            http_response_code(413);
            echo json_encode(['error' => 'Request body too large']);
            exit;
        }
    }

    /**
     * Simple file-based rate limiter.
     * Returns true if the request should be blocked.
     *
     * @param string $key   Unique key (e.g. IP + endpoint)
     * @param int    $max   Max attempts in the window
     * @param int    $window Window in seconds
     */
    public static function rateLimit(string $key, int $max = 5, int $window = 300): bool {
        $dir = sys_get_temp_dir() . '/openschool_ratelimit';
        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }

        // Sanitize key for filesystem
        $file = $dir . '/' . md5($key) . '.json';

        $data = [];
        if (file_exists($file)) {
            $raw = file_get_contents($file);
            $data = json_decode($raw, true) ?: [];
        }

        $now = time();
        // Remove expired entries
        $data = array_values(array_filter($data, fn($ts) => $ts > ($now - $window)));

        if (count($data) >= $max) {
            return true; // blocked
        }

        $data[] = $now;
        file_put_contents($file, json_encode($data), LOCK_EX);
        return false;
    }

    /**
     * Get the client IP address (behind proxy-aware).
     */
    public static function getClientIp(): string {
        // Only trust X-Forwarded-For if behind a known reverse proxy.
        // For direct connections, use REMOTE_ADDR only.
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Validate a date string (Y-m-d format).
     */
    public static function isValidDate(?string $date): bool {
        if ($date === null || $date === '') return false;
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    /**
     * Validate string length.
     */
    public static function validateLength(string $value, int $min, int $max, string $fieldName): void {
        $len = mb_strlen($value, 'UTF-8');
        if ($len < $min || $len > $max) {
            Response::error("$fieldName must be between $min and $max characters");
        }
    }

    /**
     * Validate that a value is in an allowed list.
     */
    public static function validateEnum(string $value, array $allowed, string $fieldName): void {
        if (!in_array($value, $allowed, true)) {
            Response::error("Invalid $fieldName");
        }
    }
}
