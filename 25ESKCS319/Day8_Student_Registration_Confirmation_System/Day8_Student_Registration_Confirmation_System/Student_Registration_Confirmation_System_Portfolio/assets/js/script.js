document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const form = document.getElementById('registrationForm');
  const trackedFields = [...document.querySelectorAll('.tracked-field')];
  const progressBar = document.getElementById('formProgress');
  const progressText = document.getElementById('progressText');
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');
  const nameInput = document.getElementById('name');
  const cgpaInput = document.getElementById('cgpa');

  function showToast(title, message, type = 'success') {
    const el = document.getElementById('appToast');
    if (!el) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    el.querySelector('.toast-dot').style.background = type === 'error' ? 'var(--danger)' : 'var(--success)';
    bootstrap.Toast.getOrCreateInstance(el, { delay: 3800 }).show();
  }

  if (window.serverToast) setTimeout(() => showToast(window.serverToast.title, window.serverToast.message, window.serverToast.type), 300);

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('campus-theme', next);
    showToast('Theme changed', `${next[0].toUpperCase() + next.slice(1)} mode enabled.`);
  });

  function updateProgress() {
    if (!form || !progressBar || !progressText) return;
    const required = trackedFields.filter(field => field.required);
    const done = required.filter(field => field.value.trim() !== '').length;
    const percent = required.length ? Math.round((done / required.length) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', String(percent));
    progressText.textContent = `${percent}%`;
  }

  trackedFields.forEach(field => {
    field.addEventListener('input', updateProgress);
    field.addEventListener('change', updateProgress);
  });

  nameInput?.addEventListener('input', () => {
    nameInput.value = nameInput.value.replace(/[0-9]/g, '');
  });

  cgpaInput?.addEventListener('input', () => {
    const value = Number(cgpaInput.value);
    if (cgpaInput.value !== '' && value > 10) cgpaInput.value = '10';
    if (cgpaInput.value !== '' && value < 0) cgpaInput.value = '0';
  });

  photoInput?.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      photoInput.value = '';
      showToast('Invalid photo', 'Choose a JPG, PNG or WebP image.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      photoPreview.src = event.target.result;
      photoPreview.classList.remove('d-none');
      photoPlaceholder.classList.add('d-none');
      showToast('Photo ready', 'Your profile photo preview has been updated.');
    };
    reader.readAsDataURL(file);
  });

  form?.addEventListener('reset', () => setTimeout(() => {
    if (photoPreview) { photoPreview.src = ''; photoPreview.classList.add('d-none'); }
    photoPlaceholder?.classList.remove('d-none');
    updateProgress();
    showToast('Form reset', 'All fields have been cleared.');
  }, 0));

  form?.addEventListener('submit', () => showToast('Submitting', 'Validating your registration details...'));
  updateProgress();
});
