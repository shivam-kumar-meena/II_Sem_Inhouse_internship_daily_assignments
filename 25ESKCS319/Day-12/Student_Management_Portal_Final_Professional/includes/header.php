<?php
if (!isset($pageTitle)) $pageTitle = 'Student Management Portal';
$current = basename($_SERVER['PHP_SELF']);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Professional student management system with authentication, CRUD, uploads, search, and dashboard analytics.">
  <title><?= e($pageTitle) ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
  <div class="container">
    <a class="navbar-brand fw-bold" href="index.php"><span class="brand-icon"><i class="bi bi-mortarboard-fill"></i></span>CampusManage</a>
    <button class="navbar-toggler border-0 shadow-none" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button>
    <div id="nav" class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
        <li class="nav-item"><a class="nav-link <?= $current==='index.php'?'active':'' ?>" href="index.php"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a></li>
        <li class="nav-item"><a class="nav-link <?= $current==='add_student.php'?'active':'' ?>" href="add_student.php"><i class="bi bi-person-plus me-1"></i>Add Student</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle user-menu <?= in_array($current,['profile.php','change_password.php'],true)?'active':'' ?>" href="#" data-bs-toggle="dropdown">
            <?php if(!empty($_SESSION['user_photo'])): ?>
              <img src="uploads/users/<?=e($_SESSION['user_photo'])?>" class="nav-avatar" alt="Profile">
            <?php else: ?>
              <img src="assets/images/default-avatar.svg" class="nav-avatar" alt="Default profile">
            <?php endif; ?>
            <span><?=e($_SESSION['user_name']??'User')?></span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="profile.php"><i class="bi bi-person-circle me-2"></i>Profile</a></li>
            <li><a class="dropdown-item" href="change_password.php"><i class="bi bi-key me-2"></i>Change Password</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</nav>
