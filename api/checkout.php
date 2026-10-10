<?php
// ========================================
// api/checkout.php
// Converts session cart into database order
// ========================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
// Session already started by config/database.php

if (empty($_SESSION['cart'])) {
    echo json_encode(['error' => 'Cart is empty']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$customer_name  = $data['customer_name']  ?? 'Guest';
$customer_email = $data['customer_email'] ?? '';
$customer_phone = $data['customer_phone'] ?? '';

try {
    $pdo->beginTransaction();

    $ids = array_keys($_SESSION['cart']);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmt = $pdo->prepare("SELECT id, name, price FROM menu_items WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $items = $stmt->fetchAll();

    $subtotal    = 0;
    $order_items = [];

    foreach ($items as $item) {
        $quantity = $_SESSION['cart'][$item['id']];
        $subtotal += $item['price'] * $quantity;
        $order_items[] = [
            'item_id'  => (int)$item['id'],
            'name'     => $item['name'],
            'price'    => (float)$item['price'],
            'quantity' => (int)$quantity
        ];
    }

    $tax            = round($subtotal * 0.08, 2);
    $service_charge = round($subtotal * 0.05, 2);
    $total          = round($subtotal + $tax + $service_charge, 2);

    $order_number = 'LBV-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

    $stmt = $pdo->prepare("INSERT INTO orders 
        (order_number, subtotal, tax, service_charge, total, status, created_at) 
        VALUES (?, ?, ?, ?, ?, 'confirmed', NOW())");
    $stmt->execute([$order_number, $subtotal, $tax, $service_charge, $total]);
    $order_id = (int)$pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO order_items 
        (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($order_items as $item) {
        $stmt->execute([$order_id, $item['item_id'], $item['quantity'], $item['price']]);
    }

    $pdo->commit();

    $_SESSION['cart'] = [];

    echo json_encode([
        'success' => true,
        'order' => [
            'order_number'   => $order_number,
            'subtotal'       => $subtotal,
            'tax'            => $tax,
            'service_charge' => $service_charge,
            'total'          => $total,
            'items'          => $order_items,
            'created_at'     => date('Y-m-d H:i:s')
        ],
        'message' => 'Order placed successfully!'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}