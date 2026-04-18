<?php
class Response {
    public static function json($data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, int $code = 400): void {
        self::json(['error' => $message], $code);
    }

    public static function success($data = null, string $message = 'OK'): void {
        self::json(['message' => $message, 'data' => $data]);
    }
}

function getInput(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    return $_POST;
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function generateUUID(): string {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        random_int(0, 0xffff), random_int(0, 0xffff),
        random_int(0, 0xffff),
        random_int(0, 0x0fff) | 0x4000,
        random_int(0, 0x3fff) | 0x8000,
        random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff)
    );
}

function uploadFile(array $file, string $subdir = 'general'): ?string {
    require_once __DIR__ . '/../config/database.php';

    // Verify upload was a real HTTP upload (prevents file path injection)
    if (!is_uploaded_file($file['tmp_name'])) return null;

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) return null;

    // Validate MIME from actual file content (not client-supplied header)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $realMime = $finfo->file($file['tmp_name']);
    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];
    if (!isset($allowedMimes[$realMime])) return null;

    // Enforce 5 MB max
    if ($file['size'] > 5 * 1024 * 1024) return null;

    // Use the safe extension derived from real MIME (ignore user-supplied extension)
    $ext = $allowedMimes[$realMime];

    // Prevent directory traversal in subdir
    $subdir = basename($subdir);
    $dir = UPLOAD_DIR . $subdir . '/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);

    $filename = bin2hex(random_bytes(16)) . '.' . $ext;
    move_uploaded_file($file['tmp_name'], $dir . $filename);
    return $subdir . '/' . $filename;
}
