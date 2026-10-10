<?php
// ========================================
// api/get_order.php
// Fetch an order + its items for invoice display
// ========================================

require_once __DIR__ . '/../config/database.php';

$orderNumber = $_GET['order_number'] ?? $_GET['order'] ?? '';
if (!$orderNumber) jsonResponse(['success' => false, 'error' => 'Order number required']);

$db = getDB();

$stmt = $db->prepare("SELECT * FROM orders WHERE order_number = ?");
$stmt->execute([$orderNumber]);
$order = $stmt->fetch();

if (!$order) jsonResponse(['success' => false, 'error' => 'Order not found']);

$stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = ?");
$stmt->execute([$order['id']]);
$items = $stmt->fetchAll();

$order['subtotal']       = (float)$order['subtotal'];
$order['tax']            = (float)$order['tax'];
$order['service_charge'] = (float)$order['service_charge'];
$order['grand_total']    = (float)$order['grand_total'];

foreach ($items as &$it) {
    $it['price']      = (float)$it['price'];
    $it['quantity']   = (int)$it['quantity'];
    $it['line_total'] = (float)$it['line_total'];
}

jsonResponse(['success' => true, 'order' => $order, 'items' => $items]);