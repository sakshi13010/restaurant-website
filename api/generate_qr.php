<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$order_number = $_GET['order_number'] ?? '';
if (!$order_number) {
    echo json_encode(['error' => 'Missing order_number']);
    exit;
}

// Fetch order
$stmt = $pdo->prepare("SELECT * FROM orders WHERE order_number = ?");
$stmt->execute([$order_number]);
$order = $stmt->fetch();

if (!$order) {
    echo json_encode(['error' => 'Order not found: ' . $order_number]);
    exit;
}

// Fetch payment token
$stmt = $pdo->prepare("SELECT * FROM payments WHERE order_id = ?");
$stmt->execute([$order['id']]);
$payment = $stmt->fetch();

if (!$payment) {
    echo json_encode(['error' => 'Payment not found for order: ' . $order_number]);
    exit;
}

// ============================================================
// YOUR FAMPAY UPI ID
// ============================================================
$upi_id     = '8956207265@fam';       // ← your FamPay UPI ID
$payee_name = 'La Belle Vie';

// Build UPI payment string
// FamPay uses INR, so cu=INR
$upi_string = sprintf(
    'upi://pay?pa=%s&pn=%s&am=%.2f&cu=INR&tn=%s',
    $upi_id,
    urlencode($payee_name),
    (float)$order['total'],
    urlencode('Order #' . $order_number)
);

// Generate QR using QuickChart API (free, no signup)
$qr_url = 'https://quickchart.io/qr?text=' . urlencode($upi_string)
        . '&size=300&margin=2&ecLevel=H';

// Fetch and return as base64 (primary)
$qr_base64 = null;
$ctx = stream_context_create([
    'http' => [
        'timeout' => 5,
        'user_agent' => 'LaBelleVie/1.0'
    ]
]);
$qr_image = @file_get_contents($qr_url, false, $ctx);
if ($qr_image) {
    $qr_base64 = 'data:image/png;base64,' . base64_encode($qr_image);
}

echo json_encode([
    'success'      => true,
    'order_number' => $order_number,
    'amount'       => (float)$order['total'],
    'qr_url'       => $qr_url,
    'qr_base64'    => $qr_base64,
    'upi_string'   => $upi_string,
    'upi_id'       => $upi_id,
    'payment_id'   => (int)$payment['id'],
    'token'        => $payment['qr_token']
]);