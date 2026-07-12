<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

function clean(string $value): string {
    return trim($value);
}

function calculateGrade(float $cgpa): array {
    if ($cgpa >= 9.0) {
        return ['grade' => 'A+', 'class' => 'success', 'message' => 'Outstanding performance'];
    }
    if ($cgpa >= 8.0) {
        return ['grade' => 'A', 'class' => 'primary', 'message' => 'Excellent performance'];
    }
    if ($cgpa >= 7.0) {
        return ['grade' => 'B+', 'class' => 'info', 'message' => 'Very good performance'];
    }
    if ($cgpa >= 6.0) {
        return ['grade' => 'B', 'class' => 'warning', 'message' => 'Good performance'];
    }
    if ($cgpa >= 5.0) {
        return ['grade' => 'C', 'class' => 'secondary', 'message' => 'Satisfactory performance'];
    }

    return ['grade' => 'F', 'class' => 'danger', 'message' => 'Needs improvement'];
}

$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$cgpaInput = clean($_POST['cgpa'] ?? '');
$branch = clean($_POST['branch'] ?? '');
$college = clean($_POST['college'] ?? '');

$allowedBranches = [
    'Computer Science',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration'
];

$errors = [];

if ($name === '') {
    $errors[] = 'Full name is required.';
} elseif (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    $errors[] = 'Full name must be between 2 and 80 characters.';
} elseif (!preg_match("/^[\p{L}\s.'-]+$/u", $name)) {
    $errors[] = 'Full name must not contain numbers or invalid symbols.';
}

if ($email === '') {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if ($cgpaInput === '') {
    $errors[] = 'CGPA is required.';
} elseif (!is_numeric($cgpaInput)) {
    $errors[] = 'CGPA must be a valid number.';
} else {
    $cgpaValue = (float) $cgpaInput;
    if ($cgpaValue < 0 || $cgpaValue > 10) {
        $errors[] = 'CGPA must be between 0 and 10.';
    }
}

if ($branch === '') {
    $errors[] = 'Please select a branch.';
} elseif (!in_array($branch, $allowedBranches, true)) {
    $errors[] = 'Selected branch is invalid.';
}

if ($college === '') {
    $errors[] = 'College name is required.';
} elseif (mb_strlen($college) < 3 || mb_strlen($college) > 120) {
    $errors[] = 'College name must be between 3 and 120 characters.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = [
        'name' => $name,
        'email' => $email,
        'cgpa' => $cgpaInput,
        'branch' => $branch,
        'college' => $college
    ];

    header('Location: index.php');
    exit;
}

$cgpa = (float) $cgpaInput;
$gradeInfo = calculateGrade($cgpa);
$registrationId = 'REG-' . date('Y') . '-' . strtoupper(substr(hash('sha256', $email . microtime(true)), 0, 6));
$today = date('d F Y');

function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$initials = '';
foreach (preg_split('/\s+/', $name) as $part) {
    if ($part !== '') {
        $initials .= mb_strtoupper(mb_substr($part, 0, 1));
    }
}
$initials = mb_substr($initials, 0, 2);

$pageTitle = 'Registration Confirmation';
include __DIR__ . '/includes/header.php';
?>

<main class="confirmation-page">
  <div class="container py-5">
    <section class="welcome-card dashboard-card glass-panel mx-auto">
      <div class="welcome-hero">
        <div class="success-animation">
          <div class="success-ring"></div>
          <div class="success-icon"><i class="fa-solid fa-check"></i></div>
          <span class="spark spark-one"></span><span class="spark spark-two"></span>
          <span class="spark spark-three"></span><span class="spark spark-four"></span>
        </div>
        <span class="confirmation-label">Registration Confirmed</span>
        <h1>Welcome, <?= e($name) ?>!</h1>
        <p>Your student registration has been completed successfully.</p>
      </div>

      <div class="profile-content dashboard-main">
        <div class="profile-header">
          <div class="profile-avatar"><?= e($initials) ?></div>
          <div>
            <span class="registration-id"><?= e($registrationId) ?></span>
            <h2><?= e($name) ?></h2>
            <p><?= e($college) ?></p>
          </div>
          <div class="grade-panel ms-lg-auto">
            <small>Calculated Grade</small>
            <span class="badge text-bg-<?= e($gradeInfo['class']) ?> grade-badge">
              <?= e($gradeInfo['grade']) ?>
            </span>
            <strong><?= e($gradeInfo['message']) ?></strong>
          </div>
        </div>

        <div class="row g-3 mt-3 dashboard-grid">
          <div class="col-md-6">
            <div class="detail-card">
              <i class="fa-solid fa-envelope"></i>
              <div>
                <small>Email</small>
                <strong><?= e($email) ?></strong>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="detail-card">
              <i class="fa-solid fa-chart-line"></i>
              <div>
                <small>CGPA</small>
                <strong><?= number_format($cgpa, 2) ?> / 10</strong>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="detail-card">
              <i class="fa-solid fa-code-branch"></i>
              <div>
                <small>Branch</small>
                <strong><?= e($branch) ?></strong>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="detail-card">
              <i class="fa-solid fa-building-columns"></i>
              <div>
                <small>College</small>
                <strong><?= e($college) ?></strong>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="detail-card">
              <i class="fa-solid fa-calendar-days"></i>
              <div>
                <small>Registration Date</small>
                <strong><?= e($today) ?></strong>
              </div>
            </div>
          </div>
        </div>

        <div class="d-grid d-sm-flex gap-3 mt-4">
          <a href="index.php" class="btn btn-primary btn-lg flex-grow-1">
            <i class="fa-solid fa-user-plus me-2"></i>
            Register Another Student
          </a>
          <button class="btn btn-outline-light btn-lg" type="button" onclick="window.print()">
            <i class="fa-solid fa-print me-2"></i>
            Print Confirmation
          </button>
        </div>
      </div>
    </section>
  </div>
</main>

<script>window.serverToast={title:'Registration successful',message:'Your professional confirmation dashboard is ready.',type:'success'};</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
