<?php
session_start();

$errors = $_SESSION['errors'] ?? [];
$old = $_SESSION['old'] ?? [];
unset($_SESSION['errors'], $_SESSION['old']);

function old_value(string $key): string {
    global $old;
    return htmlspecialchars($old[$key] ?? '', ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Responsive Bootstrap student registration system with PHP validation.">
  <title>Student Registration System</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  <main class="page-shell">
    <div class="container py-5">
      <div class="row g-4 align-items-stretch">
        <div class="col-lg-8 mx-auto">
          <section class="form-panel h-100">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span class="section-label">Registration Form</span>
                <h2 class="mt-2 mb-1">Create your student profile</h2>
                <p class="text-secondary mb-0">Fields marked with * are required.</p>
              </div>
              <div class="form-icon">
                <i class="bi bi-person-plus-fill"></i>
              </div>
            </div>

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

            <form action="process.php" method="POST" enctype="multipart/form-data" novalidate>
              <div class="row g-4">
                <div class="col-md-6">
                  <label for="name" class="form-label">Full Name *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-person"></i></span>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      name="name"
                      value="<?= old_value('name') ?>"
                      placeholder="Enter full name"
                      maxlength="80"
                      required>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="email" class="form-label">Email Address *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      name="email"
                      value="<?= old_value('email') ?>"
                      placeholder="student@example.com"
                      maxlength="120"
                      required>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="branch" class="form-label">Branch *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-diagram-3"></i></span>
                    <select class="form-select" id="branch" name="branch" required>
                      <option value="">Choose branch</option>
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
                </div>

                <div class="col-md-6">
                  <label for="course" class="form-label">Course *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-journal-code"></i></span>
                    <select class="form-select" id="course" name="course" required>
                      <option value="">Choose course</option>
                      <?php
                      $courses = [
                          'B.Tech',
                          'BCA',
                          'BBA',
                          'B.Sc',
                          'MCA',
                          'MBA'
                      ];
                      foreach ($courses as $course):
                          $selected = (($old['course'] ?? '') === $course) ? 'selected' : '';
                      ?>
                        <option value="<?= htmlspecialchars($course, ENT_QUOTES, 'UTF-8') ?>" <?= $selected ?>>
                          <?= htmlspecialchars($course, ENT_QUOTES, 'UTF-8') ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone Number *</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      name="phone"
                      value="<?= old_value('phone') ?>"
                      placeholder="10-digit number"
                      inputmode="numeric"
                      maxlength="10"
                      pattern="[0-9]{10}"
                      required>
                  </div>
                  <div class="form-text">Enter exactly 10 digits.</div>
                </div>

                <div class="col-md-6">
                  <label for="year" class="form-label">Year of Study</label>
                  <select class="form-select" id="year" name="year">
                    <option value="">Select year</option>
                    <?php for ($i = 1; $i <= 4; $i++): ?>
                      <option value="<?= $i ?>" <?= (($old['year'] ?? '') == $i) ? 'selected' : '' ?>>
                        Year <?= $i ?>
                      </option>
                    <?php endfor; ?>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label d-block">Gender *</label>
                  <div class="gender-group">
                    <?php foreach (['Male', 'Female', 'Other'] as $gender): ?>
                      <label class="gender-option">
                        <input
                          type="radio"
                          name="gender"
                          value="<?= $gender ?>"
                          <?= (($old['gender'] ?? '') === $gender) ? 'checked' : '' ?>
                          required>
                        <span><i class="bi bi-person-circle"></i> <?= $gender ?></span>
                      </label>
                    <?php endforeach; ?>
                  </div>
                </div>

                <div class="col-12">
                  <label for="address" class="form-label">Address *</label>
                  <textarea
                    class="form-control"
                    id="address"
                    name="address"
                    rows="4"
                    minlength="10"
                    maxlength="250"
                    placeholder="Enter your complete address"
                    required><?= old_value('address') ?></textarea>
                  <div class="form-text">Minimum 10 characters.</div>
                </div>

                <div class="col-12">
                  <label for="photo" class="form-label">Profile Photo</label>
                  <div class="photo-upload-box">
                    <input
                      class="form-control"
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/png,image/jpeg,image/webp">
                    <div class="photo-preview-wrap mt-3">
                      <div id="photoPlaceholder" class="photo-placeholder">
                        <i class="bi bi-image"></i>
                        <span>Photo preview</span>
                      </div>
                      <img id="photoPreview" class="photo-preview d-none" alt="Selected profile preview">
                    </div>
                    <small class="text-secondary d-block mt-2">
                      Front-end preview only. The photo is not uploaded to the server.
                    </small>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check terms-box">
                    <input class="form-check-input" type="checkbox" id="terms" name="terms" value="1" required>
                    <label class="form-check-label" for="terms">
                      I confirm that the provided information is correct. *
                    </label>
                  </div>
                </div>

                <div class="col-12 d-grid d-sm-flex gap-3">
                  <button class="btn btn-primary btn-lg flex-grow-1" type="submit">
                    <i class="bi bi-check2-circle me-2"></i>
                    Register Student
                  </button>
                  <button class="btn btn-outline-light btn-lg" type="reset">
                    <i class="bi bi-arrow-counterclockwise me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </main>

  <script>
    const phoneInput = document.getElementById('phone');
    const nameInput = document.getElementById('name');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const photoPlaceholder = document.getElementById('photoPlaceholder');

    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });

    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[0-9]/g, '');
    });

    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];

      if (!file) {
        photoPreview.src = '';
        photoPreview.classList.add('d-none');
        photoPlaceholder.classList.remove('d-none');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPG, PNG, or WebP image.');
        photoInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = event => {
        photoPreview.src = event.target.result;
        photoPreview.classList.remove('d-none');
        photoPlaceholder.classList.add('d-none');
      };
      reader.readAsDataURL(file);
    });
  </script>
</body>
</html>
