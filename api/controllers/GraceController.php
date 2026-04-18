<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class GraceController {
    public static function store(): void {
        $user = Auth::requireAuth();
        $input = getInput();
        $db = Database::getInstance();

        $studentId = (int)($input['student_id'] ?? 0);
        $feeType = $input['fee_type'] ?? '';
        $message = sanitize($input['message'] ?? '');
        $deadline = $input['deadline'] ?? null;

        if (!$studentId || !$feeType || !$message) {
            Response::error('student_id, fee_type, and message are required');
        }

        // Validate fee_type
        require_once __DIR__ . '/../core/Security.php';
        Security::validateEnum($feeType, ['registration', 'quarter_1', 'quarter_2', 'quarter_3'], 'fee_type');
        Security::validateLength($message, 1, 1000, 'message');

        // Validate deadline format if provided
        if ($deadline !== null && $deadline !== '' && !Security::isValidDate($deadline)) {
            Response::error('Invalid deadline format (expected YYYY-MM-DD)');
        }

        // Verify student
        $stmt = $db->prepare('SELECT id FROM students WHERE id = ? AND school_id = ?');
        $stmt->execute([$studentId, $user['school_id']]);
        if (!$stmt->fetch()) Response::error('Student not found', 404);

        // Deactivate previous grace for same type
        $db->prepare('UPDATE grace_periods SET is_active = 0 WHERE student_id = ? AND fee_type = ?')->execute([$studentId, $feeType]);

        $stmt = $db->prepare('INSERT INTO grace_periods (student_id, fee_type, message, deadline) VALUES (?,?,?,?)');
        $stmt->execute([$studentId, $feeType, $message, $deadline]);

        Response::success(null, 'Grace period set');
    }
}
