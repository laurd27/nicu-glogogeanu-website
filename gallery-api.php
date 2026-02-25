<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Supported categories
$valid_categories = ['nunta', 'botez', 'cununie', 'save-the-date', 'trash-the-dress'];

$category = isset($_GET['cat']) ? $_GET['cat'] : '';

// Validate category to prevent directory traversal
if (!in_array($category, $valid_categories)) {
    echo json_encode(['error' => 'Invalid category']);
    exit;
}

$directory = __DIR__ . '/images/' . $category;
$images = [];

if (is_dir($directory)) {
    // Scan for standard image formats
    $files = glob($directory . '/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', GLOB_BRACE);
    
    if ($files) {
        foreach ($files as $file) {
            $images[] = basename($file);
        }
        
        // Sort images naturally (e.g. 1.jpg, 2.jpg, 10.jpg)
        natsort($images);
        $images = array_values($images);
    }
}

echo json_encode([
    'category' => $category,
    'count' => count($images),
    'images' => $images
]);
?>
