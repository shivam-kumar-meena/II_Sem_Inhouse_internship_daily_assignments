<?php
session_start();
require __DIR__ . '/config/database.php';
require __DIR__ . '/includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('login.php');

$email = clean($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    $_SESSION['error'] = 'Enter a valid email and password.';
    redirect('login.php');
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    $_SESSION['error'] = 'Invalid email or password.';
    redirect('login.php');
}

$previousLogin = $user['last_login'];
$pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

session_regenerate_id(true);
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_photo'] = $user['profile_picture'];
$_SESSION['previous_login'] = $previousLogin;
$_SESSION['last_activity'] = time();
$_SESSION['success'] = 'Welcome back, ' . $user['name'] . '!';
redirect('index.php');
