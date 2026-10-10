<?php
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
require_once '../config/database.php';

$stmt = $pdo->query("SELECT id, full_name as name, email, phone, role, 
                     is_active as status, created_at as joined 
                     FROM users ORDER BY created_at DESC");
$users = $stmt->fetchAll();

echo json_encode($users);
?>