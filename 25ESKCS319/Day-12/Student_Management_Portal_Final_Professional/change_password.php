<?php
require __DIR__ . '/config/auth.php';
require __DIR__ . '/config/database.php';
require __DIR__ . '/includes/functions.php';
$pageTitle='Change Password';
$error='';$success='';
if($_SERVER['REQUEST_METHOD']==='POST'){
 $current=$_POST['current_password']??'';$new=$_POST['new_password']??'';$confirm=$_POST['confirm_password']??'';
 $stmt=$pdo->prepare('SELECT password FROM users WHERE id=?');$stmt->execute([$_SESSION['user_id']]);$hash=$stmt->fetchColumn();
 if(!$hash||!password_verify($current,$hash))$error='Current password is incorrect.';
 elseif(strlen($new)<8)$error='New password must contain at least 8 characters.';
 elseif($new!==$confirm)$error='New password and confirmation do not match.';
 else{$pdo->prepare('UPDATE users SET password=? WHERE id=?')->execute([password_hash($new,PASSWORD_DEFAULT),$_SESSION['user_id']]);$success='Password changed successfully.';}
}
include __DIR__.'/includes/header.php';
?>
<main class="page-shell"><div class="container py-5"><section class="glass-card form-card mx-auto"><div class="section-heading mb-4"><span class="eyebrow"><i class="bi bi-key"></i> Account Security</span><h1 class="mt-3">Change password</h1></div><?php if($error):?><div class="alert alert-danger"><?=e($error)?></div><?php endif;?><?php if($success):?><div class="alert alert-success"><?=e($success)?></div><?php endif;?><form method="POST"><label class="form-label">Current Password</label><input class="form-control mb-3" type="password" name="current_password" required><label class="form-label">New Password</label><input class="form-control mb-3" type="password" name="new_password" required><label class="form-label">Confirm New Password</label><input class="form-control mb-3" type="password" name="confirm_password" required><button class="btn btn-primary" type="submit">Change Password</button> <a class="btn btn-outline-light" href="profile.php">Back</a></form></section></div></main>
<?php include __DIR__.'/includes/footer.php';?>
