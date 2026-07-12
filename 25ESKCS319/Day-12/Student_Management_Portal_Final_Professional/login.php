<?php
session_start();
require __DIR__ . '/config/database.php';
require __DIR__ . '/includes/functions.php';

if (isset($_SESSION['user_id'])) {
    redirect('index.php');
}

$error = $_SESSION['error'] ?? '';
$success = $_SESSION['success'] ?? '';
unset($_SESSION['error'], $_SESSION['success']);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | CampusManage</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="auth-body">
  <main class="auth-shell">
    <section class="auth-card">
      <div class="auth-brand"><span class="brand-icon"><i class="bi bi-mortarboard-fill"></i></span><strong>CampusManage</strong></div>
      <span class="eyebrow"><i class="bi bi-shield-lock"></i> Secure Login</span>
      <h1 class="mt-3">Welcome back</h1>
      <p>Sign in to manage student records.</p>

      <?php if ($error): ?><div class="alert alert-danger"><?= e($error) ?></div><?php endif; ?>
      <?php if ($success): ?><div class="alert alert-success"><?= e($success) ?></div><?php endif; ?>

      <form action="authenticate.php" method="POST" novalidate>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <div class="input-group"><span class="input-group-text"><i class="bi bi-envelope"></i></span><input class="form-control" type="email" name="email" required></div>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group"><span class="input-group-text"><i class="bi bi-key"></i></span><input class="form-control" type="password" name="password" required></div>
        </div>
        <button class="btn btn-primary btn-lg w-100" type="submit"><i class="bi bi-box-arrow-in-right me-2"></i>Login</button>
      </form>

      <div class="auth-links mt-3"><a href="forgot_password.php">Forgot password?</a></div>
      <div class="demo-box mt-4"><strong>Demo login</strong><span>admin@example.com</span><span>Admin@123</span></div>
    </section>
  </main>
</body>
</html>
