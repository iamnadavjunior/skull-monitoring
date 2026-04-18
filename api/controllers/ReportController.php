<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class ReportController {
    public static function dashboard(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $schoolId = $user['school_id'];

        // Total students
        $stmt = $db->prepare('SELECT COUNT(*) FROM students WHERE school_id = ? AND is_active = 1');
        $stmt->execute([$schoolId]);
        $totalStudents = (int)$stmt->fetchColumn();

        // Total revenue
        $stmt = $db->prepare('SELECT COALESCE(SUM(p.amount),0) FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = ?');
        $stmt->execute([$schoolId]);
        $totalRevenue = (float)$stmt->fetchColumn();

        // Revenue by quarter
        $stmt = $db->prepare('SELECT p.fee_type, SUM(p.amount) as total FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = ? GROUP BY p.fee_type');
        $stmt->execute([$schoolId]);
        $revenueByType = $stmt->fetchAll();

        // Students by grade
        $stmt = $db->prepare('SELECT grade, COUNT(*) as count FROM students WHERE school_id = ? AND is_active = 1 GROUP BY grade ORDER BY grade');
        $stmt->execute([$schoolId]);
        $byGrade = $stmt->fetchAll();

        // Recent payments
        $stmt = $db->prepare('SELECT p.*, s.first_name, s.last_name FROM payments p JOIN students s ON p.student_id = s.id WHERE s.school_id = ? ORDER BY p.paid_at DESC LIMIT 10');
        $stmt->execute([$schoolId]);
        $recentPayments = $stmt->fetchAll();

        Response::success([
            'total_students' => $totalStudents,
            'total_revenue' => $totalRevenue,
            'revenue_by_type' => $revenueByType,
            'students_by_grade' => $byGrade,
            'recent_payments' => $recentPayments,
        ]);
    }

    public static function paidUnpaid(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $feeType = sanitize($_GET['fee_type'] ?? 'registration');
        $year = sanitize($_GET['year'] ?? '');

        // CRITICAL: Validate fee_type BEFORE using it in SQL to prevent injection
        $validTypes = ['registration', 'quarter_1', 'quarter_2', 'quarter_3'];
        if (!in_array($feeType, $validTypes, true)) {
            Response::error('Invalid fee type');
        }

        // Safe to interpolate — value is from the whitelist above
        $feeColumn = $feeType . '_fee';

        $sql = "
            SELECT s.id, s.first_name, s.last_name, s.grade,
                COALESCE(SUM(p.amount), 0) as paid,
                COALESCE(fs.{$feeColumn}, 0) as due
            FROM students s
            LEFT JOIN payments p ON p.student_id = s.id AND p.fee_type = ?
            LEFT JOIN fee_structures fs ON fs.school_id = s.school_id AND fs.academic_year = s.school_year
            WHERE s.school_id = ? AND s.is_active = 1
        ";
        $params = [$feeType, $user['school_id']];

        if ($year) { $sql .= ' AND s.school_year = ?'; $params[] = $year; }

        $sql .= ' GROUP BY s.id ORDER BY s.last_name';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        Response::success($stmt->fetchAll());
    }
}
