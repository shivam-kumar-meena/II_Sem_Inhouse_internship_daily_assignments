<?php
session_start();

$pageTitle = 'Register Student';
$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
$success = $_SESSION['success'] ?? '';
unset($_SESSION['errors'], $_SESSION['old'], $_SESSION['success']);

function oldValue(string $key): string {
    global $old;
    return htmlspecialchars($old[$key] ?? '', ENT_QUOTES, 'UTF-8');
}

include __DIR__ . '/includes/header.php';
?>

<main class="page-shell">
  <div class="container py-5">
    <section class="glass-card registration-card mx-auto">
      <div class="section-heading text-center mb-4">
        <span class="eyebrow"><i class="bi bi-person-vcard"></i> Student Registration</span>
        <h1 class="mt-3">Create a student record</h1>
        <p>Complete the form below. All required details are validated before saving.</p>
      </div>

      <?php if ($success): ?>
        <div class="alert alert-success d-flex align-items-center gap-2" role="alert">
          <i class="bi bi-check-circle-fill"></i>
          <div><?= htmlspecialchars($success, ENT_QUOTES, 'UTF-8') ?></div>
        </div>
      <?php endif; ?>

      <?php if (!empty($errors)): ?>
        <div class="alert alert-danger" role="alert">
          <div class="d-flex gap-2">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>
              <strong>Please fix the following:</strong>
              <ul class="mb-0 mt-2">
                <?php foreach ($errors as $error): ?>
                  <li><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></li>
                <?php endforeach; ?>
              </ul>
            </div>
          </div>
        </div>
      <?php endif; ?>

      <form action="register.php" method="POST" enctype="multipart/form-data" novalidate>
        <div class="row g-4">
          <div class="col-md-6">
            <label for="name" class="form-label">Full Name *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input type="text" class="form-control" id="name" name="name"
                value="<?= oldValue('name') ?>" placeholder="Enter full name" maxlength="80" required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="email" class="form-label">Email Address *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input type="email" class="form-control" id="email" name="email"
                value="<?= oldValue('email') ?>" placeholder="student@example.com" maxlength="120" required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="phone" class="form-label">Phone Number *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-telephone"></i></span>
              <input type="tel" class="form-control" id="phone" name="phone"
                value="<?= oldValue('phone') ?>" placeholder="10-digit number" maxlength="10" required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="cgpa" class="form-label">CGPA *</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-graph-up-arrow"></i></span>
              <input type="number" class="form-control" id="cgpa" name="cgpa"
                value="<?= oldValue('cgpa') ?>" placeholder="Example: 8.5"
                min="0" max="10" step="0.01" required>
            </div>
          </div>

          <div class="col-md-6">
            <label for="branch" class="form-label">Branch *</label>
            <select class="form-select" id="branch" name="branch" required>
              <option value="">Select branch</option>
              <?php
              $branches = [
                  'Computer Science',
                  'Information Technology',
                  'Electronics',
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

          <div class="col-md-6">
            <label for="course" class="form-label">Course *</label>
            <select class="form-select" id="course" name="course" required>
              <option value="">Select course</option>
              <?php
              $courses = ['B.Tech', 'BCA', 'BBA', 'B.Sc', 'MCA', 'MBA'];
              foreach ($courses as $course):
                $selected = (($old['course'] ?? '') === $course) ? 'selected' : '';
              ?>
                <option value="<?= htmlspecialchars($course, ENT_QUOTES, 'UTF-8') ?>" <?= $selected ?>>
                  <?= htmlspecialchars($course, ENT_QUOTES, 'UTF-8') ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-12">
            <label for="college" class="form-label">College *</label>
            <input type="text" class="form-control" id="college" name="college"
              value="<?= oldValue('college') ?>" placeholder="Enter college name" maxlength="120" required>
          </div>

          <div class="col-12">
            <label for="address" class="form-label">Address *</label>
            <textarea class="form-control" id="address" name="address" rows="4"
              minlength="10" maxlength="500" placeholder="Enter complete address" required><?= oldValue('address') ?></textarea>
          </div>

          <div class="col-12">
            <label for="photo" class="form-label">Profile Photo</label>
            <div class="photo-upload-box">
              <div class="photo-preview-wrap">
                <div id="photoPlaceholder" class="photo-placeholder">
                  <i class="bi bi-image"></i>
                  <span>Preview</span>
                </div>
                <img id="photoPreview" class="photo-preview d-none" alt="Selected student photo preview">
              </div>

              <div class="flex-grow-1">
                <input class="form-control" type="file" id="photo" name="photo"
                  accept="image/jpeg,image/png,image/webp">
                <small class="form-text d-block mt-2">
                  Optional. JPG, PNG or WebP, maximum 2 MB.
                </small>
              </div>
            </div>
          </div>

          <div class="col-12 d-grid d-sm-flex gap-3">
            <button class="btn btn-primary btn-lg flex-grow-1" type="submit">
              <i class="bi bi-database-add me-2"></i>
              Save Student
            </button>
            <a class="btn btn-outline-light btn-lg" href="students.php">
              <i class="bi bi-table me-2"></i>
              View Records
            </a>
          </div>
        </div>
      </form>
    </section>
  </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
