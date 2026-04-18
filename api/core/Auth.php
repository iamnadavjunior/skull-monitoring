<?php
class Auth {
    public static function generateToken(array $payload): string {
        require_once __DIR__ . '/../config/database.php';
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload['exp'] = time() + JWT_EXPIRY;
        $payload = base64_encode(json_encode($payload));
        $signature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
        return "$header.$payload.$signature";
    }

    public static function verifyToken(string $token): ?array {
        require_once __DIR__ . '/../config/database.php';
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;
        $expectedSig = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));

        if (!hash_equals($expectedSig, $signature)) return null;

        $data = json_decode(base64_decode($payload), true);
        if (!$data || ($data['exp'] ?? 0) < time()) return null;

        return $data;
    }

    public static function requireAuth(): array {
        // Try multiple sources — Apache mod_fcgid often strips Authorization header
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? apache_request_headers()['Authorization']
            ?? '';
        if (!preg_match('/Bearer\s+(.+)/', $header, $m)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        $user = self::verifyToken($m[1]);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }
        return $user;
    }
}
