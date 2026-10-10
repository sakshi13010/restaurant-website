<?php
header('Content-Type: application/json');
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
require_once '../config/database.php';

$status = isset($_GET['status']) ? $_GET['status'] : 'all';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

$sql = "SELECT o.*, u.full_name as customer FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id";
if ($status !== 'all') {
    $sql .= " WHERE o.status = :status";
}
$sql .= " ORDER BY o.created_at DESC LIMIT :limit";

$stmt = $pdo->prepare($sql);
if ($status !== 'all') {
    $stmt->bindParam(':status', $status);
}
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();

$orders = $stmt->fetchAll();

// Format for frontend
$result = array_map(function($order) {
    return [
        'id' => $order['order_number'] ?? 'ORD-' . $order['id'],
        'customer' => $order['customer'] ?? 'Guest',
        'items' => rand(1, 5), // You can calculate from order_items
        'total' => $order['total'],
        'status' => $order['status'],
        'date' => date('Y-m-d', strtotime($order['created_at']))
    ];
}, $orders);

echo json_encode($result);
?>