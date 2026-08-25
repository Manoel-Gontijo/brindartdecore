(() => {
  function removerTopbarV494(){
    if(window.innerWidth > 767) return;
    document.querySelectorAll('.bd-topbar').forEach(el=>{
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('height','0','important');
      el.style.setProperty('min-height','0','important');
      el.style.setProperty('max-height','0','important');
      el.style.setProperty('margin','0','important');
      el.style.setProperty('padding','0','important');
      el.setAttribute('aria-hidden','true');
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',removerTopbarV494,{once:true});
  }else{
    removerTopbarV494();
  }

  window.addEventListener('resize',removerTopbarV494,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(removerTopbarV494,100),{passive:true});
})();