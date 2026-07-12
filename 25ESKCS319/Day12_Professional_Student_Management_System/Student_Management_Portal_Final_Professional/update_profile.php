<?php
require __DIR__ . '/config/auth.php';
require __DIR__ . '/config/database.php';
require __DIR__ . '/includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') redirect('profile.php');
$name = clean($_POST['name'] ?? '');
if ($name === '' || !preg_match("/^[\p{L}\s.'-]+$/u", $name)) {
    $_SESSION['error'] = 'Enter a valid name.';
    redirect('profile.php');
}

$stmt = $pdo->prepare('SELECT profile_picture FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$current = $stmt->fetch();
$newPhoto = $current['profile_picture'] ?? null;

if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['profile_picture'];
    $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 2*1024*1024) {
        $_SESSION['error'] = 'Profile picture upload failed or exceeds 2 MB.';
        redirect('profile.php');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($allowed[$mime])) {
        $_SESSION['error'] = 'Profile picture must be JPG, PNG, or WebP.';
        redirect('profile.php');
    }
    $dir = __DIR__ . '/uploads/users';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $newPhoto = bin2hex(random_bytes(12)) . '.' . $allowed[$mime];
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $newPhoto)) {
        $_SESSION['error'] = 'Could not save profile picture.';
        redirect('profile.php');
    }
    if (!empty($current['profile_picture'])) {
        $old = $dir . '/' . basename($current['profile_picture']);
        if (is_file($old)) @unlink($old);
    }
}

$pdo->prepare('UPDATE users SET name = ?, profile_picture = ? WHERE id = ?')->execute([$name, $newPhoto, $_SESSION['user_id']]);
$_SESSION['user_name'] = $name;
$_SESSION['user_photo'] = $newPhoto;
$_SESSION['success'] = 'Profile updated successfully.';
redirect('profile.php');
