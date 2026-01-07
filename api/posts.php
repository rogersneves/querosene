<?php
require 'config.php';

$page = $_GET['page'] ?? 1;
$limit = 20;
$offset = ($page - 1) * $limit;

$posts = Database::getPosts();
$sliced = array_slice($posts, $offset, $limit);

echo json_encode($sliced);
?>
