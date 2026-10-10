<?php
header('Content-Type: application/json');
session_start();
require_once '../config/database.php';

// Allow guests (session id works without login)
$sessionId = session_id();

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? ($_GET['action'] ?? null);

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

switch ($action) {

    case 'add':
        $item = $input['item'] ?? null;
        if (!$item || !isset($item['id'], $item['name'], $item['price'])) {
            echo json_encode(['error' => 'Missing item data']);
            exit;
        }

        $id = (int)$item['id'];
        if (isset($_SESSION['cart'][$id])) {
            $_SESSION['cart'][$id]['qty'] += 1;
        } else {
            $_SESSION['cart'][$id] = [
                'id'    => $id,
                'name'  => $item['name'],
                'price' => (float)$item['price'],
                'image' => $item['image'] ?? '',
                'qty'   => 1
            ];
        }
        echo json_encode(['success' => true, 'cart' => array_values($_SESSION['cart'])]);
        break;

    case 'get':
        echo json_encode([
            'success' => true,
            'cart'    => array_values($_SESSION['cart']),
            'total'   => array_sum(array_map(
                fn($i) => $i['price'] * $i['qty'],
                $_SESSION['cart']
            ))
        ]);
        break;

    case 'update':
        $id  = (int)($input['id']  ?? 0);
        $qty = (int)($input['qty'] ?? 0);
        if (isset($_SESSION['cart'][$id])) {
            if ($qty <= 0) unset($_SESSION['cart'][$id]);
            else $_SESSION['cart'][$id]['qty'] = $qty;
        }
        echo json_encode(['success' => true, 'cart' => array_values($_SESSION['cart'])]);
        break;

    case 'remove':
        $id = (int)($input['id'] ?? 0);
        unset($_SESSION['cart'][$id]);
        echo json_encode(['success' => true, 'cart' => array_values($_SESSION['cart'])]);
        break;

    case 'clear':
        $_SESSION['cart'] = [];
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['error' => 'Unknown action']);
}