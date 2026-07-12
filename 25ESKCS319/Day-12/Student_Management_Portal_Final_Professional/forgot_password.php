<?php
session_start();
require __DIR__ . '/includes/functions.php';
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = clean($_POST['email'] ?? '');
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'If an account exists for that email, reset instructions have been requested.';
    } else {
        $message = 'Please enter a valid email address.';
    }
}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forgot Password</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"><link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet"><link rel="stylesheet" href="assets/css/style.css"></head><body class="auth-body"><main class="auth-shell"><section class="auth-card"><span class="eyebrow"><i class="bi bi-lock"></i> Password Recovery</span><h1 class="mt-3">Forgot password</h1><p>Enter your email to request reset instructions. No email is sent in this demo.</p><?php if($message):?><div class="alert alert-info"><?=e($message)?></div><?php endif;?><form method="POST"><label class="form-label">Email</label><input class="form-control mb-3" type="email" name="email" required><button class="btn btn-primary w-100" type="submit">Request Reset</button></form><div class="auth-links mt-3"><a href="login.php">Back to login</a></div></section></main></body></html>
