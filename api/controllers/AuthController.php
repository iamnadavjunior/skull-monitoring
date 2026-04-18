<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class AuthController {
    public static function login(): void {
        require_once __DIR__ . '/../core/Security.php';

        // Rate limit: 5 login attempts per IP per 5 minutes
        $ip = Security::getClientIp();
        if (Security::rateLimit('login:' . $ip, 5, 300)) {
            Response::error('Too many login attempts. Please try again later.', 429);
        }

        $input = getInput();
        $email = sanitize($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            Response::error('Email and password required');
        }

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format');
        }

        // Validate input lengths
        Security::validateLength($email, 1, 255, 'email');
        if (mb_strlen($password) > 500) Response::error('Password too long');

        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT a.*, s.name as school_name FROM admins a JOIN schools s ON a.school_id = s.id WHERE a.email = ? AND a.is_active = 1');
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password'])) {
            Response::error('Invalid credentials', 401);
        }

        $token = Auth::generateToken([
            'id' => $admin['id'],
            'school_id' => $admin['school_id'],
            'role' => $admin['role'],
        ]);

        Response::success([
            'token' => $token,
            'admin' => [
                'id' => $admin['id'],
                'name' => $admin['name'],
                'email' => $admin['email'],
                'role' => $admin['role'],
                'school_name' => $admin['school_name'],
            ]
        ], 'Login successful');
    }

    public static function me(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT a.id, a.name, a.email, a.role, s.name as school_name FROM admins a JOIN schools s ON a.school_id = s.id WHERE a.id = ?');
        $stmt->execute([$user['id']]);
        Response::success($stmt->fetch());
    }
}
