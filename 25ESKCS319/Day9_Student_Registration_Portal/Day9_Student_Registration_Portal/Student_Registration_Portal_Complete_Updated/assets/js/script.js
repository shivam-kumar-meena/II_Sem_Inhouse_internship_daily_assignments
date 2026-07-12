document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phone');
  const nameInput = document.getElementById('name');
  const cgpaInput = document.getElementById('cgpa');
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  const photoPlaceholder = document.getElementById('photoPlaceholder');

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[0-9]/g, '');
    });
  }

  if (cgpaInput) {
    cgpaInput.addEventListener('input', () => {
      const value = Number(cgpaInput.value);
      if (cgpaInput.value !== '' && value > 10) cgpaInput.value = '10';
      if (cgpaInput.value !== '' && value < 0) cgpaInput.value = '0';
    });
  }

  if (photoInput) {
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
        alert('Please select a JPG, PNG or WebP image.');
        photoInput.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('Photo must not exceed 2 MB.');
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
  }
});
