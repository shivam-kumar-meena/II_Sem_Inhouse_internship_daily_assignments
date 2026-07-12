document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.phone-input').forEach(i=>i.addEventListener('input',()=>i.value=i.value.replace(/\D/g,'').slice(0,10)));
  document.querySelectorAll('.delete-link').forEach(a=>a.addEventListener('click',e=>{if(!confirm('Delete this student permanently? This action cannot be undone.'))e.preventDefault();}));
  document.querySelectorAll('.photo-input').forEach(input=>input.addEventListener('change',()=>{
    const file=input.files[0];
    const preview=input.closest('.photo-upload-panel')?.querySelector('.student-photo-preview');
    if(!file){if(preview) preview.src=preview.dataset.default;return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){alert('Choose JPG, PNG or WebP.');input.value='';return;}
    if(file.size>2*1024*1024){alert('Photo must be under 2 MB.');input.value='';return;}
    if(preview){const reader=new FileReader();reader.onload=e=>preview.src=e.target.result;reader.readAsDataURL(file);}
  }));
});
