<?php
if (!isset($pageTitle)) {
    $pageTitle = 'Student Registration Portal';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Student registration portal with PHP, MySQL and Bootstrap.">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
  <div class="container">
    <a class="navbar-brand fw-bold" href="index.php">
      <span class="brand-icon"><i class="bi bi-mortarboard-fill"></i></span>
      CampusRegister
    </a>

    <button class="navbar-toggler border-0 shadow-none" type="button"
      data-bs-toggle="collapse" data-bs-target="#mainNav">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div id="mainNav" class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
        <li class="nav-item">
          <a class="nav-link" href="index.php"><i class="bi bi-person-plus me-1"></i> Register</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="students.php"><i class="bi bi-table me-1"></i> Students</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
