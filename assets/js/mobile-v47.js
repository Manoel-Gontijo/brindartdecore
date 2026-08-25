(() => {
 function initCategoriasV49(){
  const b=document.getElementById('categoriasToggleV471'), p=document.getElementById('categoriasHomeV344');
  if(!b||!p)return; b.setAttribute('aria-expanded','false'); p.classList.remove('v49-open');
  b.onclick=e=>{e.preventDefault();const o=p.classList.toggle('v49-open');b.setAttribute('aria-expanded',o?'true':'false')};
 }
 function initFiltrosV49(){
  const b=document.getElementById('filtersToggleV472'), p=document.getElementById('filtersForm');
  if(!b||!p)return; b.setAttribute('aria-expanded','false'); p.classList.remove('v49-open');
  b.onclick=e=>{e.preventDefault();const o=p.classList.toggle('v49-open');b.setAttribute('aria-expanded',o?'true':'false')};
 }
 function ajustarProdutoV49(){
  if(innerWidth>767)return;
  const i=document.getElementById('produtoImagemPrincipalV334');
  if(i){i.removeAttribute('width');i.removeAttribute('height');i.style.width='auto';i.style.height='auto';i.style.maxWidth='94%';i.style.maxHeight='38vh';i.style.objectFit='contain';i.style.margin='0 auto';i.style.display='block'}
 }
 function init(){
  initCategoriasV49();initFiltrosV49();ajustarProdutoV49();
  const a=document.getElementById('produtoDetalheV331');
  if(a){new MutationObserver(()=>setTimeout(ajustarProdutoV49,20)).observe(a,{childList:true,subtree:true})}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('resize',ajustarProdutoV49,{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(ajustarProdutoV49,120),{passive:true});
})();