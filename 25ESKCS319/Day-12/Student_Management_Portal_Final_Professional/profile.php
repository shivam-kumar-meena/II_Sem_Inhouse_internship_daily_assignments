<?php
require __DIR__ . '/config/auth.php';
require __DIR__ . '/config/database.php';
require __DIR__ . '/includes/functions.php';

$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();
if (!$user) redirect('logout.php');

$pageTitle = 'My Profile';
$success = $_SESSION['success'] ?? '';
$error = $_SESSION['error'] ?? '';
unset($_SESSION['success'], $_SESSION['error']);
include __DIR__ . '/includes/header.php';
?>
<main class="page-shell"><div class="container py-5"><section class="glass-card form-card mx-auto"><div class="section-heading mb-4"><span class="eyebrow"><i class="bi bi-person-circle"></i> Account Profile</span><h1 class="mt-3">Your profile</h1><p>Update your display name and profile picture.</p></div><?php if($success):?><div class="alert alert-success"><?=e($success)?></div><?php endif;?><?php if($error):?><div class="alert alert-danger"><?=e($error)?></div><?php endif;?><form action="update_profile.php" method="POST" enctype="multipart/form-data"><div class="profile-editor"><div><?php if($user['profile_picture']):?><img class="profile-large" src="uploads/users/<?=e($user['profile_picture'])?>" alt="Profile"><?php else:?><div class="profile-large placeholder-avatar"><?=e(studentInitials($user['name']))?></div><?php endif;?></div><div class="flex-grow-1"><label class="form-label">Name</label><input class="form-control mb-3" type="text" name="name" value="<?=e($user['name'])?>" required><label class="form-label">Email</label><input class="form-control mb-3" value="<?=e($user['email'])?>" disabled><label class="form-label">Profile Picture</label><input class="form-control" type="file" name="profile_picture" accept="image/jpeg,image/png,image/webp"></div></div><button class="btn btn-primary mt-4" type="submit"><i class="bi bi-save me-2"></i>Save Profile</button> <a class="btn btn-outline-light mt-4" href="change_password.php">Change Password</a></form></section></div></main>
<?php include __DIR__ . '/includes/footer.php'; ?>
