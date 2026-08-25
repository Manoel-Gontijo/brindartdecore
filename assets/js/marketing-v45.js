(() => {
  const KEYS={
    cookie:'brindart_cookie_consent_v452',
    once:'brindart_popup_once_v452',
    day:'brindart_popup_day_v452',
    session:'brindart_popup_session_v452'
  };

  function safeGet(store,key){
    try { return store.getItem(key); } catch(e) { return null; }
  }
  function safeSet(store,key,value){
    try { store.setItem(key,value); return true; } catch(e) { return false; }
  }

  function config(){
    return window.BRINDART_STATIC || {};
  }

  function localPath(raw){
    raw=String(raw||'').trim();
    if(!raw) return '#';
    if(/^https?:\/\//i.test(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:')) return raw;

    // Servidor local do ADMIN
    if(location.hostname==='127.0.0.1' && location.pathname.startsWith('/publicar/')){
      if(raw.startsWith('/')) return '/publicar'+raw;
      return raw;
    }

    // Abertura direta do Windows
    if(location.protocol==='file:') return raw.replace(/^\//,'');

    return raw;
  }

  function queryFlag(name){
    try { return new URLSearchParams(location.search).get(name)==='1'; }
    catch(e){ return false; }
  }

  function removeExisting(selector){
    document.querySelectorAll(selector).forEach(el=>el.remove());
  }

  function cookieAccepted(){
    return !!safeGet(localStorage,KEYS.cookie);
  }

  function showCookies(force=false){
    const cfg=config().cookies_config||{};
    if(!force && Number(cfg.ativo||0)!==1) return;
    if(!force && cookieAccepted()) return;

    removeExisting('.cookie-banner-v45');

    const el=document.createElement('div');
    el.className='cookie-banner-v45';
    el.innerHTML=`
      <div class="cookie-inner-v45">
        <div class="cookie-icon-v45"><i class="bi bi-shield-check"></i></div>
        <div class="cookie-copy-v45">
          <strong>${cfg.titulo||'Sua privacidade é importante'}</strong>
          <p>${cfg.texto||'Usamos armazenamento local essencial para o funcionamento do carrinho, favoritos e preferências.'}</p>
          ${cfg.link_politica?`<a href="${localPath(cfg.link_politica)}">Política de Privacidade e Cookies</a>`:''}
        </div>
        <div class="cookie-actions-v45">
          <button type="button" class="btn btn-outline-secondary btn-sm" data-cookie-essential>
            ${cfg.texto_botao_necessarios||'Somente necessários'}
          </button>
          <button type="button" class="btn btn-brand-cookie-v45 btn-sm" data-cookie-accept>
            ${cfg.texto_botao_aceitar||'Aceitar'}
          </button>
        </div>
      </div>`;

    function finish(choice){
      safeSet(localStorage,KEYS.cookie,JSON.stringify({choice,date:new Date().toISOString()}));
      el.remove();
      window.dispatchEvent(new CustomEvent('brindart:cookie-consent',{detail:{choice}}));
    }

    el.querySelector('[data-cookie-essential]').onclick=()=>finish('necessarios');
    el.querySelector('[data-cookie-accept]').onclick=()=>finish('aceitos');
    document.body.appendChild(el);
  }

  function popupAllowed(cfg){
    const freq=String(cfg.frequencia||'sessao');
    if(freq==='sempre') return true;
    if(freq==='uma_vez') return !safeGet(localStorage,KEYS.once);
    if(freq==='diario'){
      const today=new Date().toISOString().slice(0,10);
      return safeGet(localStorage,KEYS.day)!==today;
    }
    return !safeGet(sessionStorage,KEYS.session);
  }

  function markPopup(cfg){
    const freq=String(cfg.frequencia||'sessao');
    if(freq==='uma_vez') safeSet(localStorage,KEYS.once,'1');
    else if(freq==='diario') safeSet(localStorage,KEYS.day,new Date().toISOString().slice(0,10));
    else if(freq==='sessao') safeSet(sessionStorage,KEYS.session,'1');
  }

  function isHome(){
    const p=(location.pathname||'').toLowerCase();
    return p==='/' || p.endsWith('/index.html') || p.endsWith('/publicar/');
  }

  function showPopup(force=false){
    const cfg=config().popup_promocional||{};
    if(!force && Number(cfg.ativo||0)!==1) return;
    if(!force && (cfg.paginas||'home')==='home' && !isHome()) return;
    if(!force && !popupAllowed(cfg)) return;

    removeExisting('.promo-popup-overlay-v45');

    const delay=force?50:Math.max(0,Number(cfg.atraso_segundos||0))*1000;
    setTimeout(()=>{
      const overlay=document.createElement('div');
      overlay.className='promo-popup-overlay-v45';
      overlay.innerHTML=`
        <div class="promo-popup-v45" role="dialog" aria-modal="true">
          <button type="button" class="promo-close-v45" aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
          ${cfg.imagem?`
            <a class="promo-image-link-v45" href="${localPath(cfg.link||'#')}" ${Number(cfg.nova_aba||0)===1?'target="_blank" rel="noopener"':''}>
              <img src="${localPath(cfg.imagem)}" alt="${cfg.titulo||'Promoção'}">
            </a>`:''}
          <div class="promo-content-v45">
            <span class="promo-flash-badge-v45"><i class="bi bi-lightning-charge-fill"></i> PROMOÇÃO RELÂMPAGO</span>
            <h2>${cfg.titulo||'OFERTA RELÂMPAGO'}</h2>
            <p>${cfg.subtitulo||'Aproveite nossas condições especiais!'}</p>
            ${cfg.link?`
              <a class="promo-action-v45" href="${localPath(cfg.link)}" ${Number(cfg.nova_aba||0)===1?'target="_blank" rel="noopener"':''}>
                ${cfg.texto_botao||'Ver promoção'} <i class="bi bi-arrow-right"></i>
              </a>`:''}
          </div>
        </div>`;

      function close(){
        if(!force) markPopup(cfg);
        overlay.remove();
      }

      overlay.querySelector('.promo-close-v45').onclick=close;
      overlay.onclick=e=>{ if(e.target===overlay) close(); };
      overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(!force)markPopup(cfg)}));
      document.body.appendChild(overlay);
    },delay);
  }

  function favoriteShortcut(){
    if(document.querySelector('[data-favorite-shortcut-v45]')) return;
    const host=document.querySelector('.bd-header .text-end, .bd-header .container');
    if(!host) return;
    const a=document.createElement('a');
    a.setAttribute('data-favorite-shortcut-v45','1');
    a.href=localPath('/favoritos.html');
    a.className='btn btn-sm btn-outline-dark rounded-pill position-relative me-2';
    let count=0;
    try{
      if(typeof getFavoritesV45==='function') count=getFavoritesV45().length;
    }catch(e){}
    a.innerHTML=`<i class="bi bi-heart"></i><span data-favorite-count class="badge bg-danger text-white favorite-count-v45">${count}</span>`;
    const cart=host.querySelector('a[href*="carrinho"]');
    if(cart) host.insertBefore(a,cart); else host.appendChild(a);
  }

  function diagnostic(text){
    if(!queryFlag('teste-popup') && !queryFlag('teste-cookies')) return;
    const d=document.createElement('div');
    d.className='marketing-test-status-v452';
    d.textContent=text;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),3500);
  }

  function start(){
    const forcePopup=queryFlag('teste-popup');
    const forceCookies=queryFlag('teste-cookies');

    favoriteShortcut();

    if(forcePopup){
      diagnostic('V4.5.2 carregada — abrindo popup de teste');
      showPopup(true);
      return;
    }

    if(forceCookies){
      diagnostic('V4.5.2 carregada — abrindo aviso de cookies');
      showCookies(true);
      return;
    }

    const cookieCfg=config().cookies_config||{};
    const needsCookie=Number(cookieCfg.ativo||0)===1 && !cookieAccepted();

    if(needsCookie){
      showCookies(false);
      window.addEventListener('brindart:cookie-consent',()=>showPopup(false),{once:true});
    }else{
      showPopup(false);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }
})();
