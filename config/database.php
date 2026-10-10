<?php
// ========================================
// config/database.php
// DB Connection (matches your existing setup)
// ========================================

$host     = 'localhost';
$dbname   = 'restaurant_db';
$username = 'Krishu';
$password = 'krishu@123';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Return JSON error (this file is used by api/*.php)
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Start session (safe here, before any output)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}