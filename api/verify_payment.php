<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$order_number = $data['order_number'] ?? '';
$token        = $data['token'] ?? '';

if (!$order_number || !$token) {
    echo json_encode(['error' => 'Missing parameters']); exit;
}

try {
    $pdo->beginTransaction();

    // Verify payment record
    $stmt = $pdo->prepare("SELECT * FROM payments WHERE order_number = ? AND qr_token = ?");
    $stmt->execute([$order_number, $token]);
    $payment = $stmt->fetch();

    if (!$payment) {
        $pdo->rollBack();
        echo json_encode(['error' => 'Invalid payment token']); exit;
    }

    if ($payment['status'] === 'paid') {
        $pdo->commit();
        echo json_encode([
            'success'      => true,
            'already_paid' => true,
            'order_number' => $order_number,
            'redirect'     => 'payment-success.html?order=' . urlencode($order_number)
        ]);
        exit;
    }

    // Mark as paid
    $stmt = $pdo->prepare("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE id = ?");
    $stmt->execute([$payment['id']]);

    // Mark order as paid
    $stmt = $pdo->prepare("UPDATE orders SET payment_status = 'paid', payment_method = 'upi', paid_at = NOW() WHERE id = ?");
    $stmt->execute([$payment['order_id']]);

    $pdo->commit();

    echo json_encode([
        'success'      => true,
        'order_number' => $order_number,
        'amount'       => (float)$payment['amount'],
        'redirect'     => 'payment-success.html?order=' . urlencode($order_number)
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}