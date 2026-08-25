document.addEventListener('DOMContentLoaded', async () => {
  const grid=document.querySelector('#favoritosGridV45');
  const empty=document.querySelector('#favoritosEmptyV45');
  const count=document.querySelector('#favoritosCountV45');
  if(!grid) return;

  const ids=typeof getFavoritesV45==='function' ? getFavoritesV45() : [];
  if(count) count.textContent=ids.length;

  if(!ids.length){
    grid.innerHTML='';
    if(empty) empty.classList.remove('d-none');
    return;
  }

  try{
    const result=await BrindartAPI.get('/api/produtos?limit=500');
    const produtos=(result.data||[]).filter(p=>ids.includes(Number(p.id)));
    grid.innerHTML=produtos.map(productCard).join('');
    if(!produtos.length && empty) empty.classList.remove('d-none');
    if(typeof updateFavoriteButtonsV45==='function') updateFavoriteButtonsV45();
  }catch{
    grid.innerHTML='<div class="alert alert-light border">Não foi possível carregar seus favoritos.</div>';
  }

  window.addEventListener('brindart:favorites-updated',()=>location.reload());
});
