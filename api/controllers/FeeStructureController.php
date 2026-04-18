<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class FeeStructureController {
    public static function index(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $year = sanitize($_GET['year'] ?? '');

        $where = ['school_id = ?'];
        $params = [$user['school_id']];
        if ($year) { $where[] = 'academic_year = ?'; $params[] = $year; }

        $stmt = $db->prepare('SELECT * FROM fee_structures WHERE ' . implode(' AND ', $where) . ' ORDER BY grade');
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }

    public static function store(): void {
        $user = Auth::requireAuth();
        $input = getInput();
        $db = Database::getInstance();

        $required = ['academic_year'];
        foreach ($required as $f) {
            if (empty($input[$f])) Response::error("$f is required");
        }

        $stmt = $db->prepare('INSERT INTO fee_structures (school_id, academic_year, registration_fee, quarter_1_fee, quarter_2_fee, quarter_3_fee) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE registration_fee=VALUES(registration_fee), quarter_1_fee=VALUES(quarter_1_fee), quarter_2_fee=VALUES(quarter_2_fee), quarter_3_fee=VALUES(quarter_3_fee)');
        $stmt->execute([
            $user['school_id'],
            sanitize($input['academic_year']),
            (float)($input['registration_fee'] ?? 200000),
            (float)($input['quarter_1_fee'] ?? 100000),
            (float)($input['quarter_2_fee'] ?? 100000),
            (float)($input['quarter_3_fee'] ?? 100000),
        ]);

        Response::success(null, 'Fee structure saved');
    }
}
