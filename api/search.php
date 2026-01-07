<?php
require 'config.php';

$query = $_GET['q'] ?? '';
$posts = Database::getPosts();
$results = [];

foreach ($posts as $post) {
    $title = strtolower($post['title'] ?? '');
    $tags = strtolower(json_encode($post['tags'] ?? []));
    $q = strtolower($query);
    
    if (strpos($title, $q) !== false || strpos($tags, $q) !== false) {
        $results[] = $post;
    }
}

echo json_encode($results);
?>
