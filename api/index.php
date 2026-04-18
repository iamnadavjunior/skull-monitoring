<?php
// Security middleware — must run first
require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/core/Security.php';
Security::boot();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/helpers.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/PaymentController.php';
require_once __DIR__ . '/controllers/FeeStructureController.php';
require_once __DIR__ . '/controllers/ReportController.php';
require_once __DIR__ . '/controllers/GraceController.php';
require_once __DIR__ . '/controllers/ClassController.php';

$router = new Router();

// Auth
$router->post('/auth/login', ['AuthController', 'login']);
$router->get('/auth/me', ['AuthController', 'me']);

// Students (admin)
$router->get('/students', ['StudentController', 'index']);
$router->post('/students', ['StudentController', 'store']);
$router->get('/students/grades', ['StudentController', 'grades']);
$router->get('/students/{id}', ['StudentController', 'show']);
$router->put('/students/{id}', ['StudentController', 'update']);
$router->delete('/students/{id}', ['StudentController', 'delete']);

// Public student profile (QR scan)
$router->get('/public/student/{token}', ['StudentController', 'publicProfile']);

// Payments
$router->get('/payments', ['PaymentController', 'index']);
$router->post('/payments', ['PaymentController', 'store']);
$router->get('/payments/student/{id}', ['PaymentController', 'studentSummary']);

// Fee structures
$router->get('/fees', ['FeeStructureController', 'index']);
$router->post('/fees', ['FeeStructureController', 'store']);

// Grace periods
$router->post('/grace', ['GraceController', 'store']);

// Classes
$router->get('/classes', ['ClassController', 'index']);
$router->post('/classes', ['ClassController', 'store']);
$router->put('/classes/{id}', ['ClassController', 'update']);
$router->delete('/classes/{id}', ['ClassController', 'delete']);
$router->get('/classes/{id}/students', ['ClassController', 'students']);

// Reports
$router->get('/reports/dashboard', ['ReportController', 'dashboard']);
$router->get('/reports/paid-unpaid', ['ReportController', 'paidUnpaid']);

// Biometric placeholder (future)
$router->post('/biometric/enroll', function() { Response::success(null, 'Biometric API placeholder - not yet implemented'); });
$router->get('/biometric/verify/{card_uid}', function() { Response::success(null, 'Biometric API placeholder - not yet implemented'); });

// Resolve route
$uri = $_GET['route'] ?? '/';
$router->resolve($_SERVER['REQUEST_METHOD'], $uri);
