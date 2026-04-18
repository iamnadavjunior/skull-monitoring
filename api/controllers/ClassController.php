<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/helpers.php';

class ClassController {
    public static function index(): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $stmt = $db->prepare('SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.is_active = 1) as student_count FROM classes c WHERE c.school_id = ? ORDER BY c.category, c.name');
        $stmt->execute([$user['school_id']]);

        Response::success($stmt->fetchAll());
    }

    public static function store(): void {
        $user = Auth::requireAuth();
        $input = getInput();

        if (empty($input['name'])) Response::error('Class name is required');
        if (empty($input['category']) || !in_array($input['category'], ['preschool', 'elementary'])) {
            Response::error('Category must be preschool or elementary');
        }

        $db = Database::getInstance();

        // Check for duplicate
        $stmt = $db->prepare('SELECT id FROM classes WHERE school_id = ? AND name = ?');
        $stmt->execute([$user['school_id'], sanitize($input['name'])]);
        if ($stmt->fetch()) Response::error('A class with this name already exists');

        $stmt = $db->prepare('INSERT INTO classes (school_id, category, name) VALUES (?, ?, ?)');
        $stmt->execute([
            $user['school_id'],
            $input['category'],
            sanitize($input['name']),
        ]);

        $id = $db->lastInsertId();
        $stmt = $db->prepare('SELECT c.*, 0 as student_count FROM classes c WHERE c.id = ?');
        $stmt->execute([$id]);

        Response::success($stmt->fetch(), 'Class created');
    }

    public static function update(array $params): void {
        $user = Auth::requireAuth();
        $input = getInput();
        $db = Database::getInstance();

        $stmt = $db->prepare('SELECT id FROM classes WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        if (!$stmt->fetch()) Response::error('Class not found', 404);

        $fields = [];
        $values = [];

        if (!empty($input['name'])) {
            $fields[] = 'name = ?';
            $values[] = sanitize($input['name']);
        }
        if (!empty($input['category']) && in_array($input['category'], ['preschool', 'elementary'])) {
            $fields[] = 'category = ?';
            $values[] = $input['category'];
        }

        if (empty($fields)) Response::error('No fields to update');

        $values[] = $params['id'];
        $db->prepare('UPDATE classes SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);

        $stmt = $db->prepare('SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.is_active = 1) as student_count FROM classes c WHERE c.id = ?');
        $stmt->execute([$params['id']]);

        Response::success($stmt->fetch(), 'Class updated');
    }

    public static function delete(array $params): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $stmt = $db->prepare('SELECT id FROM classes WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        if (!$stmt->fetch()) Response::error('Class not found', 404);

        // Set students' class_id to NULL
        $db->prepare('UPDATE students SET class_id = NULL WHERE class_id = ?')->execute([$params['id']]);

        $db->prepare('DELETE FROM classes WHERE id = ?')->execute([$params['id']]);

        Response::success(null, 'Class deleted');
    }

    public static function students(array $params): void {
        $user = Auth::requireAuth();
        $db = Database::getInstance();

        $stmt = $db->prepare('SELECT id, name, category FROM classes WHERE id = ? AND school_id = ?');
        $stmt->execute([$params['id'], $user['school_id']]);
        $class = $stmt->fetch();
        if (!$class) Response::error('Class not found', 404);

        $stmt = $db->prepare('
            SELECT s.id, s.first_name, s.last_name, s.grade, s.photo, s.parent_phone,
                COALESCE(SUM(p.amount), 0) as total_paid
            FROM students s
            LEFT JOIN payments p ON p.student_id = s.id
            WHERE s.class_id = ? AND s.school_id = ? AND s.is_active = 1
            GROUP BY s.id
            ORDER BY s.last_name, s.first_name
        ');
        $stmt->execute([$params['id'], $user['school_id']]);

        Response::success([
            'class' => $class,
            'students' => $stmt->fetchAll(),
        ]);
    }
}
