<?php
// ========================================
// api/cart.php
// Session-based cart
// ========================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
// Session already started by config/database.php

if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':    getCart($pdo);       break;
    case 'POST':   addToCart($pdo);     break;
    case 'PUT':    updateQuantity();    break;
    case 'DELETE': removeFromCart();    break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

// ---------- helpers ----------
function readJsonBody() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function buildCartPayload($pdo) {
    if (empty($_SESSION['cart'])) {
        return ['items' => [], 'total' => 0, 'count' => 0];
    }

    $ids = array_map('intval', array_keys($_SESSION['cart']));
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $stmt = $pdo->prepare("SELECT id, name, price, image FROM menu_items WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $rows = $stmt->fetchAll();

    $items = [];
    $total = 0;
    $count = 0;

    foreach ($rows as $row) {
        $qty = (int)$_SESSION['cart'][$row['id']];
        $subtotal = (float)$row['price'] * $qty;
        $total += $subtotal;
        $count += $qty;

        $items[] = [
            'id'       => (int)$row['id'],
            'name'     => $row['name'],
            'price'    => (float)$row['price'],
            'quantity' => $qty,
            'subtotal' => $subtotal,
            'image'    => $row['image'] ?? ''
        ];
    }

    return ['items' => $items, 'total' => $total, 'count' => $count];
}

// ---------- GET ----------
function getCart($pdo) {
    echo json_encode(buildCartPayload($pdo));
}

// ---------- ADD ----------
function addToCart($pdo) {
    $data = readJsonBody();

    if (empty($data['item_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing item_id']);
        return;
    }

    $item_id  = (int)$data['item_id'];
    $quantity = isset($data['quantity']) ? max(1, (int)$data['quantity']) : 1;

    $stmt = $pdo->prepare("SELECT id, name, price, image FROM menu_items WHERE id = ?");
    $stmt->execute([$item_id]);
    $item = $stmt->fetch();

    if (!$item) {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        return;
    }

    if (isset($_SESSION['cart'][$item_id])) {
        $_SESSION['cart'][$item_id] += $quantity;
    } else {
        $_SESSION['cart'][$item_id] = $quantity;
    }

    echo json_encode([
        'success'  => true,
        'message'  => 'Item added',
        'item'     => [
            'id'    => (int)$item['id'],
            'name'  => $item['name'],
            'price' => (float)$item['price'],
            'image' => $item['image'] ?? ''
        ],
        'quantity' => (int)$_SESSION['cart'][$item_id],
        'cart'     => buildCartPayload($pdo)   // ← full cart so frontend can redraw
    ]);
}

// ---------- UPDATE ----------
function updateQuantity($pdo) {
    $data = readJsonBody();

    if (empty($data['item_id']) || !isset($data['quantity'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    $item_id  = (int)$data['item_id'];
    $quantity = (int)$data['quantity'];

    if ($quantity <= 0) {
        unset($_SESSION['cart'][$item_id]);
    } else {
        $_SESSION['cart'][$item_id] = $quantity;
    }

    echo json_encode([
        'success' => true,
        'cart'    => buildCartPayload($pdo)
    ]);
}

// ---------- REMOVE ----------
function removeFromCart($pdo) {
    $data = readJsonBody();

    if (empty($data['item_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing item_id']);
        return;
    }

    $item_id = (int)$data['item_id'];
    unset($_SESSION['cart'][$item_id]);

    echo json_encode([
        'success' => true,
        'cart'    => buildCartPayload($pdo)
    ]);
}