<?php
if (!isset($pageTitle)) {
    $pageTitle = 'Student Registration Confirmation System';
}
?>
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Bootstrap and PHP student registration confirmation system.">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
  <script>
    (() => {
      const saved = localStorage.getItem('campus-theme');
      const preferred = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', saved || preferred);
    })();
  </script>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="animated-background" aria-hidden="true">
  <span class="gradient-orb orb-one"></span>
  <span class="gradient-orb orb-two"></span>
  <span class="gradient-orb orb-three"></span>
</div>
<nav class="navbar navbar-expand-lg navbar-dark app-navbar">
  <div class="container">
    <a class="navbar-brand fw-bold" href="index.php">
      <span class="brand-icon"><i class="fa-solid fa-graduation-cap"></i></span>
      CampusConfirm
    </a>
    <div class="d-flex align-items-center gap-3">
      <span class="navbar-text d-none d-md-inline">Student Registration Portal</span>
      <button id="themeToggle" class="theme-toggle" type="button" aria-label="Toggle dark and light mode">
        <i class="fa-solid fa-sun light-icon"></i>
        <i class="fa-solid fa-moon dark-icon"></i>
      </button>
    </div>
  </div>
</nav>
