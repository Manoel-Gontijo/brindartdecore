document.addEventListener('DOMContentLoaded',()=>{
  try{
    const q=new URLSearchParams(location.search);
    if(q.get('mostrar-versao')!=='1') return;
    const d=document.createElement('div');
    d.textContent='BRINDART V4.8 ATIVA';
    d.style.cssText='position:fixed;top:6px;right:6px;z-index:999999;background:#111;color:#fff;padding:6px 9px;border-radius:8px;font:700 11px Arial';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),6000);
  }catch(e){}
});