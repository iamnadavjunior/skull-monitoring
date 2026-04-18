<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class StudentController {
    public static function index(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $search = sanitize($_GET['search'] ?? '');
        $grade = sanitize($_GET['grade'] ?? '');
        $year = sanitize($_GET['year'] ?? '');
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $where = ['s.school_id = ?'];
        $params = [$user['school_id']];

        if ($search) {
            $where[] = '(s.first_name LIKE ? OR s.last_name LIKE ? OR s.parent_phone LIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($grade) { $where[] = 's.grade = ?'; $params[] = $grade; }
        if ($year) { $where[] = 's.school_year = ?'; $params[] = $year; }

        $whereSQL = implode(' AND ', $where);

        $countStmt = $db->prepare("SELECT COUNT(*) FROM students s WHERE $whereSQL");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $params[] = $limit;
        $params[] = $offset;
        $stmt = $db->prepare("SELECT s.* FROM students s WHERE $whereSQL ORDER BY s.last_name, s.first_name LIMIT ? OFFSET ?");
        $stmt->execute($params);

        Response::success([
            'students' => $stmt->fetchAll(),
            'total' => $total,
            'page' => $page,
            'pages' => ceil($total / $limit),
        ]);
    }

    public static function store(): void {
        $user = Auth::requireAuth();
        $input = getInput();

        $required = ['first_name', 'last_name', 'school_year'];
        foreach ($required as $field) {
            if (empty($input[$field])) Response::error("$field is required");
        }

        // Validate input lengths
        require_once __DIR__ . '/../core/Security.php';
        Security::validateLength(sanitize($input['first_name']), 1, 100, 'first_name');
        Security::validateLength(sanitize($input['last_name']), 1, 100, 'last_name');
        Security::validateLength(sanitize($input['school_year']), 4, 20, 'school_year');
        if (!empty($input['date_of_birth']) && !Security::isValidDate($input['date_of_birth'])) {
            Response::error('Invalid date_of_birth format (expected YYYY-MM-DD)');
        }

        $db = Database::getInstance();

        // Auto-derive grade from class name if not provided
        $grade = sanitize($input['grade'] ?? '');
        if (empty($grade) && !empty($input['class_id'])) {
            $clsStmt = $db->prepare('SELECT name FROM classes WHERE id = ?');
            $clsStmt->execute([(int)$input['class_id']]);
            $cls = $clsStmt->fetch();
            if ($cls) $grade = $cls['name'];
        }

        $qrToken = generateUUID();

        $photo = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $photo = uploadFile($_FILES['photo'], 'photos');
        }

        $validityStart = date('Y-09-01'); // Academic year start
        $validityEnd = date('Y-07-31', strtotime('+1 year'));

        $stmt = $db->prepare('INSERT INTO students (school_id, qr_token, first_name, last_name, date_of_birth, school_year, grade, class_id, photo, parent_name, parent_phone, validity_start, validity_end) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $user['school_id'],
            $qrToken,
            sanitize($input['first_name']),
            sanitize($input['last_name']),
            $input['date_of_birth'] ?? null,
            sanitize($input['school_year']),
            $grade,
            !empty($input['class_id']) ? (int)$input['class_id'] : null,
            $photo,
            sanitize($input['parent_name'] ?? ''),
            sanitize($input['parent_phone'] ?? ''),
            $validityStart,
            $validityEnd,
        ]);

        $id = $db->lastInsertId();

        // Auto-create registration payment (200,000 FBU)
        $feeStmt = $db->prepare('SELECT registration_fee FROM fee_structures WHERE school_id = ? AND academic_year = ?');
        $feeStmt->execute([$user['school_id'], sanitize($input['school_year'])]);
        $feeRow = $feeStmt->fetch();
        $regFee = $feeRow ? (float)$feeRow['registration_fee'] : 200000;

        $payStmt = $db->prepare('INSERT INTO payments (student_id, fee_type, amount, payment_method, notes, recorded_by) VALUES (?,?,?,?,?,?)');
        $payStmt->execute([$id, 'registration', $regFee, 'cash', 'Paiement automatique à l\'inscription', $user['id']]);

        $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$id]);

        Response::success($stmt->fetch(), 'Student created');
    }

    public static function show(array $params): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT * FROM students WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        $student = $stmt->fetch();
        if (!$student) Response::error('Student not found', 404);
        Response::success($student);
    }

    public static function update(array $params): void {
        $user = Auth::requireAuth();
        $input = getInput();
        $db = Database::getInstance();

        // Verify student belongs to school
        $stmt = $db->prepare('SELECT id FROM students WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        if (!$stmt->fetch()) Response::error('Student not found', 404);

        $fields = [];
        $values = [];
        $allowed = ['first_name', 'last_name', 'date_of_birth', 'school_year', 'grade', 'class_id', 'parent_name', 'parent_phone', 'is_active'];

        foreach ($allowed as $field) {
            if (isset($input[$field])) {
                $fields[] = "$field = ?";
                $values[] = sanitize((string)$input[$field]);
            }
        }

        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $photo = uploadFile($_FILES['photo'], 'photos');
            if ($photo) { $fields[] = 'photo = ?'; $values[] = $photo; }
        }

        if (empty($fields)) Response::error('No fields to update');

        $values[] = $params['id'];
        $db->prepare('UPDATE students SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);

        $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$params['id']]);
        Response::success($stmt->fetch(), 'Student updated');
    }

    public static function delete(array $params): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM students WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        if ($stmt->rowCount() === 0) Response::error('Student not found', 404);
        Response::success(null, 'Student deleted');
    }

    // PUBLIC: QR Code scan endpoint - no auth required
    public static function publicProfile(array $params): void {
        $token = $params['token'] ?? '';
        if (!$token || !preg_match('/^[a-f0-9\-]{36}$/', $token)) {
            Response::error('Invalid token', 400);
        }

        $db = Database::getInstance();
        $stmt = $db->prepare('
            SELECT s.first_name, s.last_name, s.date_of_birth, s.school_year, s.grade, s.photo, s.parent_name, s.parent_phone, s.validity_start, s.validity_end, s.is_active, sc.name as school_name, sc.logo as school_logo
            FROM students s
            JOIN schools sc ON s.school_id = sc.id
            WHERE s.qr_token = ?
        ');
        $stmt->execute([$token]);
        $student = $stmt->fetch();
        if (!$student) Response::error('Student not found', 404);

        // Get fee structure
        $feeStmt = $db->prepare('SELECT * FROM fee_structures WHERE school_id = (SELECT school_id FROM students WHERE qr_token = ?) AND academic_year = ?');
        $feeStmt->execute([$token, $student['school_year']]);
        $feeStructure = $feeStmt->fetch();

        // Get payments
        $payStmt = $db->prepare('SELECT fee_type, SUM(amount) as total_paid FROM payments WHERE student_id = (SELECT id FROM students WHERE qr_token = ?) GROUP BY fee_type');
        $payStmt->execute([$token]);
        $payments = [];
        while ($row = $payStmt->fetch()) {
            $payments[$row['fee_type']] = (float)$row['total_paid'];
        }

        // Get grace periods
        $graceStmt = $db->prepare('SELECT fee_type, message, deadline FROM grace_periods WHERE student_id = (SELECT id FROM students WHERE qr_token = ?) AND is_active = 1');
        $graceStmt->execute([$token]);
        $graces = $graceStmt->fetchAll();

        // Build fee breakdown
        $fees = [];
        if ($feeStructure) {
            $feeTypes = [
                'registration' => (float)$feeStructure['registration_fee'],
                'quarter_1' => (float)$feeStructure['quarter_1_fee'],
                'quarter_2' => (float)$feeStructure['quarter_2_fee'],
                'quarter_3' => (float)$feeStructure['quarter_3_fee'],
            ];
            $totalDue = 0;
            $totalPaid = 0;
            foreach ($feeTypes as $type => $amount) {
                $paid = $payments[$type] ?? 0;
                $remaining = max(0, $amount - $paid);
                $status = $remaining <= 0 ? 'paid' : ($paid > 0 ? 'partial' : 'pending');
                $fees[] = [
                    'type' => $type,
                    'amount' => $amount,
                    'paid' => $paid,
                    'remaining' => $remaining,
                    'status' => $status,
                ];
                $totalDue += $amount;
                $totalPaid += $paid;
            }
        }

        Response::success([
            'student' => $student,
            'fees' => $fees ?? [],
            'total_due' => $totalDue ?? 0,
            'total_paid' => $totalPaid ?? 0,
            'total_remaining' => ($totalDue ?? 0) - ($totalPaid ?? 0),
            'grace_periods' => $graces,
        ]);
    }

    public static function grades(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT DISTINCT grade FROM students WHERE school_id = ? ORDER BY grade');
        $stmt->execute([$user['school_id']]);
        Response::success(array_column($stmt->fetchAll(), 'grade'));
    }
}
