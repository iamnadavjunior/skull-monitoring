<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class PaymentController {
    public static function index(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $studentId = (int)($_GET['student_id'] ?? 0);
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $where = ['s.school_id = ?'];
        $params = [$user['school_id']];

        if ($studentId) { $where[] = 'p.student_id = ?'; $params[] = $studentId; }

        $whereSQL = implode(' AND ', $where);

        $params[] = $limit;
        $params[] = $offset;
        $stmt = $db->prepare("
            SELECT p.*, s.first_name, s.last_name, s.grade
            FROM payments p
            JOIN students s ON p.student_id = s.id
            WHERE $whereSQL
            ORDER BY p.paid_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute($params);

        Response::success($stmt->fetchAll());
    }

    public static function store(): void {
        $user = Auth::requireAuth();
        $input = getInput();
        $db = Database::getInstance();

        $studentId = (int)($input['student_id'] ?? 0);
        $feeType = $input['fee_type'] ?? '';
        $amount = (float)($input['amount'] ?? 0);
        $method = $input['payment_method'] ?? 'cash';

        if (!$studentId || !$feeType || $amount <= 0) {
            Response::error('student_id, fee_type, and amount are required');
        }

        // Enforce max reasonable payment amount
        if ($amount > 100000000) Response::error('Amount exceeds maximum allowed');

        $validTypes = ['registration', 'quarter_1', 'quarter_2', 'quarter_3'];
        if (!in_array($feeType, $validTypes, true)) Response::error('Invalid fee_type');

        $validMethods = ['cash', 'bank_slip', 'mobile_money'];
        if (!in_array($method, $validMethods, true)) Response::error('Invalid payment_method');

        // Verify student belongs to school
        $stmt = $db->prepare('SELECT id FROM students WHERE id = ? AND school_id = ?');
        $stmt->execute([$studentId, $user['school_id']]);
        if (!$stmt->fetch()) Response::error('Student not found', 404);

        $slipFile = null;
        if (isset($_FILES['bank_slip']) && $_FILES['bank_slip']['error'] === UPLOAD_ERR_OK) {
            $slipFile = uploadFile($_FILES['bank_slip'], 'slips');
        }

        $stmt = $db->prepare('INSERT INTO payments (student_id, fee_type, amount, payment_method, bank_slip_file, notes, recorded_by) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([
            $studentId,
            $feeType,
            $amount,
            $method,
            $slipFile,
            sanitize($input['notes'] ?? ''),
            $user['id'],
        ]);

        Response::success(['id' => $db->lastInsertId()], 'Payment recorded');
    }

    public static function studentSummary(array $params): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $stmt = $db->prepare('SELECT s.*, fs.registration_fee, fs.quarter_1_fee, fs.quarter_2_fee, fs.quarter_3_fee FROM students s LEFT JOIN fee_structures fs ON fs.school_id = s.school_id AND fs.academic_year = s.school_year WHERE s.id = ? AND s.school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        $student = $stmt->fetch();
        if (!$student) Response::error('Student not found', 404);

        $payStmt = $db->prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY paid_at DESC');
        $payStmt->execute([$params['id']]);
        $payments = $payStmt->fetchAll();

        $graceStmt = $db->prepare('SELECT * FROM grace_periods WHERE student_id = ? AND is_active = 1');
        $graceStmt->execute([$params['id']]);

        Response::success([
            'student' => $student,
            'payments' => $payments,
            'grace_periods' => $graceStmt->fetchAll(),
        ]);
    }
}
