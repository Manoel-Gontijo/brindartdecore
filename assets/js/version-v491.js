document.addEventListener('DOMContentLoaded',()=>{
  try{
    if(new URLSearchParams(location.search).get('v')!=='4910') return;
    const d=document.createElement('div');
    d.textContent='BRINDART V4.9.1 ATIVA';
    d.style.cssText='position:fixed;top:8px;right:8px;z-index:1000000;background:#111;color:#fff;padding:7px 10px;border-radius:8px;font:700 11px Arial;box-shadow:0 4px 14px rgba(0,0,0,.2)';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),5000);
  }catch(e){}
});