document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.phone-input').forEach(i=>i.addEventListener('input',()=>i.value=i.value.replace(/\D/g,'').slice(0,10)));
 document.querySelectorAll('.delete-link').forEach(a=>a.addEventListener('click',e=>{if(!confirm('Delete this student permanently?'))e.preventDefault();}));
 document.querySelectorAll('.photo-input').forEach(i=>i.addEventListener('change',()=>{const f=i.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){alert('Choose JPG, PNG or WebP.');i.value='';}else if(f.size>2*1024*1024){alert('Photo must be under 2 MB.');i.value='';}}));
});
