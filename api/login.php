<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$users = Database::getUsers();
$user = null;
foreach ($users as $u) {
    if ($u['email'] === $email && password_verify($password, $u['password'])) {
        $user = $u;
        break;
    }
}

if ($user) {
    echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'type' => $user['type']]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
}
?>
