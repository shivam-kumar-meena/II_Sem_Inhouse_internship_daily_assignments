<?php
session_start();

$pageTitle = 'Student Registration';
$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);

function oldValue(string $key): string {
    global $old;
    return htmlspecialchars($old[$key] ?? '', ENT_QUOTES, 'UTF-8');
}

include __DIR__ . '/includes/header.php';
?>

<main class="page-shell">
  <div class="container py-5">
    <section class="registration-card glass-panel mx-auto">
      <div class="registration-heading text-center">
        <span class="eyebrow"><i class="fa-solid fa-user-plus"></i> Student Registration</span>
        <h1 class="mt-3">Create your student profile</h1>
        <p>Enter the details below to generate your confirmation dashboard.</p>
      </div>

      <div class="progress-shell mb-4" aria-label="Registration progress">
        <div class="d-flex justify-content-between mb-2">
          <span class="progress-label">Profile completion</span>
          <strong id="progressText">0%</strong>
        </div>
        <div class="progress">
          <div id="formProgress" class="progress-bar" style="width:0%" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>

      <div class="registration-heading-spacer d-none">
      </div>

      <?php if (!empty($errors)): ?>
        <div class="alert alert-danger error-box" role="alert">
          <div class="d-flex gap-3">
            <i class="fa-solid fa-triangle-exclamation mt-1"></i>
            <div>
              <strong>Please correct the following:</strong>
              <ul class="mb-0 mt-2">
                <?php foreach ($errors as $error): ?>
                  <li><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          </div>
        </div>
      <?php endif; ?>

      <form id="registrationForm" action="process.php" method="POST" enctype="multipart/form-data" novalidate>
        <div class="row g-4">
          <div class="col-md-6">
            <label for="name" class="form-label">Full Name *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
              <input
                type="text"
                class="form-control tracked-field"
                id="name"
                name="name"
                value="<?= oldValue('name') ?>"
                placeholder="Enter your full name"
                maxlength="80"
                required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="email" class="form-label">Email Address *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
              <input
                type="email"
                class="form-control tracked-field"
                id="email"
                name="email"
                value="<?= oldValue('email') ?>"
                placeholder="student@example.com"
                maxlength="120"
                required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="cgpa" class="form-label">CGPA *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-chart-line"></i></span>
              <input
                type="number"
                class="form-control tracked-field"
                id="cgpa"
                name="cgpa"
                value="<?= oldValue('cgpa') ?>"
                placeholder="Example: 8.5"
                min="0"
                max="10"
                step="0.01"
                required>
            </div>
            <div class="form-text">Enter a value between 0 and 10.</div>
          </div>

          <div class="col-md-6">
            <label for="branch" class="form-label">Branch *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-code-branch"></i></span>
              <select class="form-select tracked-field" id="branch" name="branch" required>
                <option value="">Select branch</option>
                <?php
                $branches = [
                    'Computer Science',
                    'Information Technology',
                    'Electronics and Communication',
                    'Mechanical Engineering',
                    'Civil Engineering',
                    'Business Administration'
                ];
                foreach ($branches as $branch):
                    $selected = (($old['branch'] ?? '') === $branch) ? 'selected' : '';
                ?>
                  <option value="<?= htmlspecialchars($branch, ENT_QUOTES, 'UTF-8') ?>" <?= $selected ?>>
                    <?= htmlspecialchars($branch, ENT_QUOTES, 'UTF-8') ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
          </div>

          <div class="col-12">
            <label for="college" class="form-label">College Name *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="fa-solid fa-building-columns"></i></span>
              <input
                type="text"
                class="form-control tracked-field"
                id="college"
                name="college"
                value="<?= oldValue('college') ?>"
                placeholder="Enter your college name"
                maxlength="120"
                required>
            </div>
          </div>

          <div class="col-12">
            <label for="photo" class="form-label">Profile Photo</label>
            <div class="photo-upload-box">
              <div class="photo-preview-wrap">
                <div id="photoPlaceholder" class="photo-placeholder">
                  <i class="fa-solid fa-camera"></i><span>Preview</span>
                </div>
                <img id="photoPreview" class="photo-preview d-none" alt="Selected profile photo preview">
              </div>
              <div class="flex-grow-1">
                <input class="form-control" type="file" id="photo" name="photo" accept="image/png,image/jpeg,image/webp">
                <small class="form-text d-block mt-2">JPG, PNG or WebP. Preview only; no server upload required.</small>
              </div>
            </div>
          </div>

          <div class="col-12 d-grid d-sm-flex gap-3">
            <button class="btn btn-primary btn-lg flex-grow-1" type="submit">
              <i class="fa-solid fa-circle-check me-2"></i>
              Submit Registration
            </button>
            <button class="btn btn-outline-light btn-lg" type="reset">
              <i class="fa-solid fa-arrow-rotate-left me-2"></i>
              Reset
            </button>
          </div>
        </div>
      </form>
    </section>
  </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
