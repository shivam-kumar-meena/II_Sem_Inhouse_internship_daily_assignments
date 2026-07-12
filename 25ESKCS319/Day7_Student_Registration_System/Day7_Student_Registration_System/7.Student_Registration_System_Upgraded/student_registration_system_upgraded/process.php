<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

function clean(string $value): string {
    return trim($value);
}

$name = clean($_POST['name'] ?? '');
$email = clean($_POST['email'] ?? '');
$branch = clean($_POST['branch'] ?? '');
$course = clean($_POST['course'] ?? '');
$phone = preg_replace('/\D+/', '', $_POST['phone'] ?? '');
$year = clean($_POST['year'] ?? '');
$gender = clean($_POST['gender'] ?? '');
$address = clean($_POST['address'] ?? '');
$terms = isset($_POST['terms']);

$allowedBranches = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration'
];

$allowedCourses = ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'MCA', 'MBA'];
$allowedYears = ['', '1', '2', '3', '4'];
$allowedGenders = ['Male', 'Female', 'Other'];

$errors = [];

if ($name === '') {
    $errors[] = 'Full name is required.';
} elseif (mb_strlen($name) < 2 || mb_strlen($name) > 80) {
    $errors[] = 'Full name must be between 2 and 80 characters.';
} elseif (!preg_match("/^[\p{L}\s.'-]+$/u", $name)) {
    $errors[] = 'Full name contains invalid characters.';
}

if ($email === '') {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if ($branch === '') {
    $errors[] = 'Please select a branch.';
} elseif (!in_array($branch, $allowedBranches, true)) {
    $errors[] = 'Selected branch is invalid.';
}

if ($course === '') {
    $errors[] = 'Please select a course.';
} elseif (!in_array($course, $allowedCourses, true)) {
    $errors[] = 'Selected course is invalid.';
}

if ($phone === '') {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[0-9]{10}$/', $phone)) {
    $errors[] = 'Phone number must contain exactly 10 digits.';
}

if (!in_array($year, $allowedYears, true)) {
    $errors[] = 'Selected year is invalid.';
}

if ($gender === '') {
    $errors[] = 'Please select a gender.';
} elseif (!in_array($gender, $allowedGenders, true)) {
    $errors[] = 'Selected gender is invalid.';
}

if ($address === '') {
    $errors[] = 'Address is required.';
} elseif (mb_strlen($address) < 10) {
    $errors[] = 'Address must contain at least 10 characters.';
} elseif (mb_strlen($address) > 250) {
    $errors[] = 'Address must not exceed 250 characters.';
}

if (!$terms) {
    $errors[] = 'You must confirm that the information is correct.';
}

if (!empty($errors)) {
    $_SESSION['errors'] = $errors;
    $_SESSION['old'] = [
        'name' => $name,
        'email' => $email,
        'branch' => $branch,
        'course' => $course,
        'phone' => $phone,
        'year' => $year,
        'gender' => $gender,
        'address' => $address
    ];

    header('Location: index.php');
    exit;
}

$studentId = 'STU-' . date('Y') . '-' . strtoupper(substr(hash('sha256', $email . microtime(true)), 0, 6));

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
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Registration Successful</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <main class="success-page">
    <div class="container py-5">
      <div class="success-shell mx-auto">
        <div class="success-banner">
          <div class="success-check">
            <i class="bi bi-check-lg"></i>
          </div>
          <span>Registration Successful</span>
          <h1>Welcome, <?= e($name) ?>!</h1>
          <p>Your student profile has been created successfully.</p>
        </div>

        <div class="profile-card">
          <div class="profile-head">
            <div class="profile-avatar"><?= e($initials) ?></div>
            <div>
              <span class="student-id"><?= e($studentId) ?></span>
              <h2><?= e($name) ?></h2>
              <p><?= e($course) ?> · <?= e($branch) ?></p>
            </div>
          </div>

          <div class="row g-3 mt-2">
            <div class="col-md-6">
              <div class="detail-box">
                <i class="bi bi-envelope"></i>
                <div>
                  <small>Email</small>
                  <strong><?= e($email) ?></strong>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="detail-box">
                <i class="bi bi-telephone"></i>
                <div>
                  <small>Phone</small>
                  <strong><?= e($phone) ?></strong>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="detail-box">
                <i class="bi bi-mortarboard"></i>
                <div>
                  <small>Branch</small>
                  <strong><?= e($branch) ?></strong>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="detail-box">
                <i class="bi bi-journal-code"></i>
                <div>
                  <small>Course</small>
                  <strong><?= e($course) ?></strong>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="detail-box">
                <i class="bi bi-calendar3"></i>
                <div>
                  <small>Year</small>
                  <strong><?= $year !== '' ? 'Year ' . e($year) : 'Not provided' ?></strong>
                </div>
              </div>
            </div>

            <?php if ($gender !== ''): ?>
              <div class="col-md-6">
                <div class="detail-box">
                  <i class="bi bi-person-badge"></i>
                  <div>
                    <small>Gender</small>
                    <strong><?= e($gender) ?></strong>
                  </div>
                </div>
              </div>
            <?php endif; ?>

            <?php if ($address !== ''): ?>
              <div class="col-12">
                <div class="detail-box">
                  <i class="bi bi-geo-alt"></i>
                  <div>
                    <small>Address</small>
                    <strong><?= nl2br(e($address)) ?></strong>
                  </div>
                </div>
              </div>
            <?php endif; ?>
          </div>

          <div class="d-grid d-sm-flex gap-3 mt-4">
            <a href="index.php" class="btn btn-primary btn-lg flex-grow-1">
              <i class="bi bi-person-plus me-2"></i>
              Register Another Student
            </a>
            <button class="btn btn-outline-light btn-lg" onclick="window.print()">
              <i class="bi bi-printer me-2"></i>
              Print Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
