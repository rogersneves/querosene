<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$postId = $data['postId'] ?? '';
$voteType = $data['voteType'] ?? '';

$votes = Database::getVotes();
if (!isset($votes[$postId])) {
    $votes[$postId] = ['like' => 0, 'dislike' => 0];
}

if ($voteType === 'like' || $voteType === 'dislike') {
    $votes[$postId][$voteType]++;
    Database::saveVotes($votes);
    echo json_encode(['count' => $votes[$postId][$voteType]]);
} else {
    echo json_encode(['error' => 'Tipo de voto inválido']);
}
?>
