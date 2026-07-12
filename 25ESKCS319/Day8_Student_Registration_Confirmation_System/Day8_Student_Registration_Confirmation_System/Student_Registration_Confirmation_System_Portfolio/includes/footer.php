<footer class="app-footer mt-auto">
  <div class="container py-4 d-flex flex-column flex-md-row justify-content-between gap-2">
    <span>© <?= date('Y') ?> CampusConfirm</span>
    <span>Built with Bootstrap 5, PHP and care.</span>
  </div>
</footer>

<div class="toast-container position-fixed top-0 end-0 p-3">
  <div id="appToast" class="toast glass-toast" role="status" aria-live="polite" aria-atomic="true">
    <div class="toast-header">
      <span class="toast-dot me-2"></span>
      <strong class="me-auto" id="toastTitle">CampusConfirm</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body" id="toastMessage"></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/script.js"></script>
</body>
</html>
