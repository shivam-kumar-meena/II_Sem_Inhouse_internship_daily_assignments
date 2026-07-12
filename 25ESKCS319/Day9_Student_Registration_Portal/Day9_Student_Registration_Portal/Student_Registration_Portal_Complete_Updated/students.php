<?php
require __DIR__ . '/config/database.php';

$pageTitle = 'Student Records';

$count = (int) $pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
$highestCgpa = $pdo->query('SELECT MAX(cgpa) FROM students')->fetchColumn();

$stmt = $pdo->query('SELECT * FROM students ORDER BY date_registered DESC, id DESC');
$students = $stmt->fetchAll();

include __DIR__ . '/includes/header.php';
?>

<main class="page-shell">
  <div class="container py-5">
    <section class="glass-card table-card">
      <div class="table-heading d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
        <div>
          <span class="eyebrow"><i class="bi bi-people"></i> Student Records</span>
          <h1 class="mt-3 mb-1">Registered students</h1>
          <p class="mb-0">All records stored in the MySQL database.</p>
        </div>

        <div class="d-flex flex-wrap gap-2">
          <span class="count-badge">
            <i class="bi bi-person-check-fill"></i>
            Total Students: <?= $count ?>
          </span>
          <a href="index.php" class="btn btn-primary">
            <i class="bi bi-person-plus me-1"></i>
            Add Student
          </a>
        </div>
      </div>

      <?php if (!$students): ?>
        <div class="empty-state">
          <i class="bi bi-inbox"></i>
          <h2>No student records yet</h2>
          <p>Register your first student to populate this table.</p>
          <a href="index.php" class="btn btn-primary">Register Student</a>
        </div>
      <?php else: ?>
        <div class="table-responsive mt-4">
          <table class="table table-dark table-hover align-middle student-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Student</th>
                <th>Phone</th>
                <th>Course</th>
                <th>Branch</th>
                <th>College</th>
                <th>Address</th>
                <th>CGPA</th>
                <th>Date Registered</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($students as $index => $student): ?>
                <?php $isTop = ((float) $student['cgpa'] === (float) $highestCgpa); ?>
                <tr class="<?= $isTop ? 'top-cgpa-row' : '' ?>">
                  <td><?= $index + 1 ?></td>
                  <td>
                    <?php if (!empty($student['photo'])): ?>
                      <img
                        class="table-photo"
                        src="uploads/<?= htmlspecialchars($student['photo'], ENT_QUOTES, 'UTF-8') ?>"
                        alt="<?= htmlspecialchars($student['name'], ENT_QUOTES, 'UTF-8') ?>">
                    <?php else: ?>
                      <div class="table-photo-placeholder">
                        <?= htmlspecialchars(strtoupper(substr($student['name'], 0, 1)), ENT_QUOTES, 'UTF-8') ?>
                      </div>
                    <?php endif; ?>
                  </td>
                  <td>
                    <div class="student-cell">
                      <div>
                        <strong><?= htmlspecialchars($student['name'], ENT_QUOTES, 'UTF-8') ?></strong>
                        <small><?= htmlspecialchars($student['email'], ENT_QUOTES, 'UTF-8') ?></small>
                      </div>
                    </div>
                  </td>
                  <td><?= htmlspecialchars($student['phone'], ENT_QUOTES, 'UTF-8') ?></td>
                  <td><?= htmlspecialchars($student['course'], ENT_QUOTES, 'UTF-8') ?></td>
                  <td><?= htmlspecialchars($student['branch'], ENT_QUOTES, 'UTF-8') ?></td>
                  <td><?= htmlspecialchars($student['college'], ENT_QUOTES, 'UTF-8') ?></td>
                  <td>
                    <span class="address-cell">
                      <?= nl2br(htmlspecialchars($student['address'], ENT_QUOTES, 'UTF-8')) ?>
                    </span>
                  </td>
                  <td>
                    <span class="cgpa-badge <?= $isTop ? 'top' : '' ?>">
                      <?= number_format((float) $student['cgpa'], 2) ?>
                    </span>
                  </td>
                  <td><?= date('d M Y, h:i A', strtotime($student['date_registered'])) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>

        <div class="legend mt-3">
          <span><i class="bi bi-square-fill"></i> Highest CGPA row</span>
        </div>
      <?php endif; ?>
    </section>
  </div>
</main>

<?php include __DIR__ . '/includes/footer.php'; ?>
