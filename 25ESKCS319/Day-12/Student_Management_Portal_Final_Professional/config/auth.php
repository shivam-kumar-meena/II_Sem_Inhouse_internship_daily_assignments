<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$timeoutSeconds = 1800;

if (!isset($_SESSION['user_id'])) {
    $_SESSION['error'] = 'Please log in to access the portal.';
    header('Location: login.php');
    exit;
}

if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > $timeoutSeconds) {
    session_unset();
    session_destroy();
    session_start();
    $_SESSION['error'] = 'Your session expired. Please log in again.';
    header('Location: login.php');
    exit;
}

$_SESSION['last_activity'] = time();
