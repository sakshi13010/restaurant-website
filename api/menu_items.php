<?php
// ========================================
// api/menu_items.php
// Returns menu items (all or by category)
// ========================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$category = isset($_GET['category']) ? trim($_GET['category']) : null;

try {
    if ($category) {
        $stmt = $pdo->prepare("SELECT id, name, price, image, category 
                               FROM menu_items 
                               WHERE category = ? 
                               ORDER BY id");
        $stmt->execute([$category]);
    } else {
        $stmt = $pdo->query("SELECT id, name, price, image, category 
                             FROM menu_items 
                             ORDER BY category, id");
    }

    $items = $stmt->fetchAll();

    foreach ($items as &$item) {
        $item['id']    = (int)$item['id'];
        $item['price'] = (float)$item['price'];
    }

    echo json_encode([
        'success'  => true,
        'category' => $category,
        'count'    => count($items),
        'items'    => $items
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}