
const FALLBACK_CATEGORIES = [
  { nome:'Brinquedos Pedagógicos', slug:'brinquedos-pedagogicos', icone:'bi-puzzle' },
  { nome:'Decoração', slug:'decoracao', icone:'bi-house-heart' },
  { nome:'Bonecas', slug:'bonecas', icone:'bi-balloon-heart' },
  { nome:'Costura Criativa', slug:'costura-criativa', icone:'bi-scissors' },
  { nome:'Canecas', slug:'canecas', icone:'bi-cup-hot' },
  { nome:'Marcadores de Página', slug:'marcadores-de-pagina', icone:'bi-bookmark-heart' },
  { nome:'Papelaria Criativa', slug:'papelaria-criativa', icone:'bi-journal-richtext' },
  { nome:'Lembrancinhas', slug:'lembrancinhas', icone:'bi-gift' },
  { nome:'MDF', slug:'mdf', icone:'bi-box-seam' },
  { nome:'Religiosos', slug:'religiosos', icone:'bi-heart' },
  { nome:'Jogos Educativos', slug:'jogos-educativos', icone:'bi-controller' },
  { nome:'Materiais para Artesanato', slug:'materiais-para-artesanato', icone:'bi-palette' }
];

const BrindartAPI = {
  base: '',
  headers(json = false) {
    const headers = {};
    const token = localStorage.getItem('brindart_admin_token');
    if (json) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },
  async request(path, options = {}) {
    const res = await fetch(this.base + path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && localStorage.getItem('brindart_admin_token')) {
        localStorage.removeItem('brindart_admin_token');
      }
      throw new Error(data.error || 'Erro na requisição');
    }
    return data;
  },
  get(path) {
    return this.request(path, { headers: this.headers(false), cache: 'no-store' });
  },
  post(path, data) {
    return this.request(path, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(data)
    });
  },
  put(path, data) {
    return this.request(path, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify(data)
    });
  },
  delete(path) {
    return this.request(path, { method: 'DELETE', headers: this.headers(false) });
  }
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function stars(value = 5) {
  const full = Math.round(value);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function normalizeText(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getParams() {
  return new URLSearchParams(window.location.search);
}

function cartItems() {
  return JSON.parse(localStorage.getItem('brindart_cart') || '[]');
}

function saveCart(items) {
  localStorage.setItem('brindart_cart', JSON.stringify(items));
  updateCartCount();
  window.dispatchEvent(new CustomEvent('brindart:cart-updated', { detail: { total: cartItems().reduce((sum, item) => sum + Number(item.quantidade || 0), 0) } }));
}

function addToCart(product, qty = 1) {
  if (Number(product.estoque || 0) <= 0) {
    showBrindartNotice('Produto sem estoque no momento. Fale conosco pelo WhatsApp para consultar previsão ou encomenda personalizada.');
    return;
  }
  const items = cartItems();
  const found = items.find(item => Number(item.id) === Number(product.id));
  if (found) found.quantidade += qty;
  else items.push({
    id: product.id,
    nome: product.nome,
    preco: product.preco_promocional || product.preco,
    imagem: product.imagem,
    loja_nome: product.loja_nome,
    quantidade: qty
  });
  saveCart(items);
  showToast('Produto adicionado ao carrinho.');
}

function updateCartCount() {
  const total = cartItems().reduce((sum, item) => sum + Number(item.quantidade || 0), 0);

  // Atualiza todos os modelos de contador usados no site:
  // - páginas novas: [data-cart-count]
  // - páginas de detalhe/produtos antigas: #cartCount
  // - eventuais variações futuras com .cart-count
  document.querySelectorAll('[data-cart-count], #cartCount, .cart-count').forEach(el => {
    el.textContent = total;
  });
}

function showBrindartNotice(msg, title = 'Brindart Decore') {
  document.querySelectorAll('.brindart-notice-overlay').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = 'brindart-notice-overlay';
  overlay.innerHTML = `
    <div class="brindart-notice-box" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="brindart-notice-icon"><i class="bi bi-heart-fill"></i></div>
      <h3>${title}</h3>
      <p>${msg}</p>
      <button type="button" class="brindart-notice-btn">OK</button>
    </div>
  `;

  const close = () => overlay.remove();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('.brindart-notice-btn').addEventListener('click', close);
  document.body.appendChild(overlay);
}

function showToast(msg) {
  showBrindartNotice(msg);
}

function productCard(p) {
  const promo = typeof descontoAtivoV38 === 'function' && descontoAtivoV38(p);
  const laserAreaV42 = (p.tipo_precificacao === 'calculadora' || p.tipo_precificacao === 'laser_area') && (p.calculadora_config?.ativo || p.laser_config?.ativo);
  const price = typeof precoFinalV38 === 'function' ? precoFinalV38(p) : (p.preco_promocional || p.preco);
  const semEstoque = Number(p.estoque || 0) <= 0;
  return `
    <div class="col">
      <article class="product-card">
        <div class="product-img position-relative">
          <button type="button" class="favorite-toggle-v45 ${isFavoriteV45(p.id)?'active':''}" data-favorite-id="${p.id}" onclick="event.preventDefault();event.stopPropagation();toggleFavorite(${p.id})" aria-label="${isFavoriteV45(p.id)?'Remover dos favoritos':'Adicionar aos favoritos'}">
            <i class="bi ${isFavoriteV45(p.id)?'bi-heart-fill':'bi-heart'}"></i>
          </button>
          ${p.selo ? `<span class="product-selo-v34 product-selo-lista-v34">${p.selo}</span>` : ''}
          ${promo ? `<span class="discount-badge-v38">-${Number(p.desconto_percentual)}% OFF</span>` : ''}
          <a href="${productUrlV353(p)}">
            <img src="${p.imagem}" alt="${p.nome}">
          </a>
        </div>
        <div class="p-3">
          ${Number(p.destaque_ativo || 0) === 1 ? `<span class="highlight-plaque-v38 highlight-inline-v497">${p.destaque_texto || 'DESTAQUE'}</span>` : ''}
          <span class="bd-badge">${p.destaque ? 'Destaque' : 'Artesanal'}</span>
          ${p.referencia ? `<small class="product-ref-v40 mt-2">Ref.: ${p.referencia}</small>` : ''}
          <h3 class="h6 fw-bold mt-2 mb-1" style="min-height:42px">${p.nome}</h3>
          <div class="small text-muted mb-1">${p.loja_nome || 'Brindart Decore'}</div>
          <div class="stars mb-2">${stars(p.avaliacao)} <span class="text-muted">(${Number(p.vendas || 0)})</span></div>
          ${promo || p.preco_promocional ? `<div class="old-price">${formatMoney(p.preco)}</div>` : ''}
          <div class="price">${laserAreaV42 ? 'A partir de ' : ''}${formatMoney(price)}</div>
          ${Number(p.quantidade_config?.ativo || 0) === 1 ? `<div class="quantity-card-note-v44">Preço progressivo por quantidade</div>` : ''}
          <div class="small text-muted">ou 3x sem juros</div>
          ${semEstoque ? `<div class="stock-warning-client-v349 py-2 px-3 mt-2">Produto sem estoque</div>` : ''}
          <div class="d-grid gap-2 mt-3">
            <a class="btn btn-outline-dark rounded-pill" href="${productUrlV353(p)}">Ver detalhes</a>
            ${(laserAreaV42 || Number(p.quantidade_config?.ativo || 0) === 1 || Array.isArray(p.variacoes) && p.variacoes.length) ? `
              <a class="btn btn-gold rounded-pill" href="${productUrlV353(p)}">
                <i class="bi bi-sliders"></i> Configurar
              </a>` : `
              <button class="btn btn-gold rounded-pill" ${semEstoque ? 'disabled title="Produto sem estoque"' : `onclick='addToCart(${JSON.stringify(p).replaceAll("'", "&apos;")})'`}>
                <i class="bi bi-cart-plus"></i> ${semEstoque ? 'Sem estoque' : 'Adicionar'}
              </button>`}
          </div>
        </div>
      </article>
    </div>`;
}

function getFavoritesV45(){
  return JSON.parse(localStorage.getItem('brindart_favs') || '[]').map(Number);
}

function isFavoriteV45(id){
  return getFavoritesV45().includes(Number(id));
}

function updateFavoriteButtonsV45(){
  const favs=getFavoritesV45();
  document.querySelectorAll('[data-favorite-id]').forEach(btn=>{
    const active=favs.includes(Number(btn.dataset.favoriteId));
    btn.classList.toggle('active',active);
    const icon=btn.querySelector('i');
    if(icon) icon.className=active?'bi bi-heart-fill':'bi bi-heart';
    btn.setAttribute('aria-label',active?'Remover dos favoritos':'Adicionar aos favoritos');
  });
  document.querySelectorAll('[data-favorite-count]').forEach(el=>el.textContent=favs.length);
}

function toggleFavorite(id) {
  const favs = getFavoritesV45();
  const idx = favs.indexOf(Number(id));
  const removed=idx>=0;
  if (removed) favs.splice(idx, 1);
  else favs.push(Number(id));
  localStorage.setItem('brindart_favs', JSON.stringify(favs));
  updateFavoriteButtonsV45();
  window.dispatchEvent(new CustomEvent('brindart:favorites-updated',{detail:{count:favs.length}}));
  showToast(removed ? 'Removido dos favoritos.' : 'Adicionado aos favoritos.');
}

window.getFavoritesV45=getFavoritesV45;
window.isFavoriteV45=isFavoriteV45;
window.updateFavoriteButtonsV45=updateFavoriteButtonsV45;

async function renderSharedMenus() {
  try {
    let categorias = [];
    try {
      categorias = await BrindartAPI.get('/api/categorias');
    } catch (e) {
      categorias = [];
    }

    if (!Array.isArray(categorias) || categorias.length === 0) {
      categorias = FALLBACK_CATEGORIES;
    }
    const nav = document.querySelector('[data-nav-categorias]');
    const side = document.querySelector('[data-side-categorias]');
    const mega = document.querySelector('[data-mega-categorias]');
    const tiles = document.querySelector('[data-category-tiles]');

    const links = categorias.map(c => `<a href="${categoryUrlV353(c)}"><i class="bi ${c.icone || 'bi-tag'} me-2"></i>${c.nome}</a>`).join('');
    if (nav) {
      const topCategorias = categorias.slice(0, 10);
      nav.innerHTML = topCategorias.map(c => `<a href="${categoryUrlV353(c)}"><i class="bi ${c.icone || 'bi-tag'} me-2"></i>${c.nome}</a>`).join('');
    }
    if (side) side.innerHTML = categorias.map(c => `<a href="${categoryUrlV353(c)}"><span class="left"><i class="bi ${c.icone || 'bi-tag'}"></i>${c.nome}</span><i class="bi bi-chevron-right"></i></a>`).join('');
    if (mega) mega.innerHTML = categorias.slice(0, 12).map(c => `<div class="col-6 col-md-3"><a class="d-block p-3 rounded-4 bg-light text-dark" href="${categoryUrlV353(c)}"><i class="bi ${c.icone || 'bi-tag'} me-2 text-warning"></i>${c.nome}<small class="d-block text-muted mt-1">Ver produtos</small></a></div>`).join('');
    if (tiles) tiles.innerHTML = categorias.slice(0, 8).map(c => `<div class="col"><a href="${categoryUrlV353(c)}" class="category-tile text-dark"><i class="bi ${c.icone || 'bi-tag'} fs-2 text-warning"></i><strong>${c.nome}</strong><span class="small text-muted">Explorar agora →</span></a></div>`).join('');

    const overview = document.querySelector('[data-category-overview]');
    if (overview) {
      overview.innerHTML = categorias.slice(0, 12).map(c => `
        <a href="${categoryUrlV353(c)}" class="category-overview-card text-decoration-none text-dark">
          <i class="bi ${c.icone || 'bi-tag'}"></i>
          <span>${c.nome}</span>
          <small>Ver produtos</small>
        </a>
      `).join('');
    }
  } catch (e) {
    console.warn('Categorias indisponíveis', e);
  }
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', renderSharedMenus);

function highlightActiveSidebarCategory() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('categoria');

  if (!categoria) return;

  document.querySelectorAll('.sidebar-modelo a, .sidebar-proposta a, .category-sidebar a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.includes('categoria=' + categoria)) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(highlightActiveSidebarCategory, 300);
});

// Garante contador correto assim que qualquer página carregar.
document.addEventListener('DOMContentLoaded', updateCartCount);
window.addEventListener('storage', updateCartCount);
window.addEventListener('brindart:cart-updated', updateCartCount);


// V35.3 - URLs amigáveis para SEO
function basePublicaV472() {
  const path = String(window.location.pathname || '');
  const localServer = ['127.0.0.1','localhost'].includes(window.location.hostname) || /^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname);
  if (localServer && path.startsWith('/publicar/')) return '/publicar';
  return '';
}

function productUrlV353(product) {
  const localFile = window.location.protocol === 'file:';
  if (localFile) {
    if (product && product.id) return 'produto-detalhe.html?id=' + encodeURIComponent(product.id);
    return 'produtos.html';
  }

  const base = basePublicaV472();
  if (product && product.slug) return base + '/produto/' + encodeURIComponent(product.slug) + '/';
  if (product && product.id) return base + '/produto-detalhe.html?id=' + encodeURIComponent(product.id);
  return base + '/produtos.html';
}

function categoryUrlV353(categoryOrSlug) {
  const slug = typeof categoryOrSlug === 'string' ? categoryOrSlug : (categoryOrSlug && categoryOrSlug.slug);

  if (window.location.protocol === 'file:') {
    return slug ? 'produtos.html?categoria=' + encodeURIComponent(slug) : 'produtos.html';
  }

  const base = basePublicaV472();
  return slug ? base + '/categoria/' + encodeURIComponent(slug) + '/' : base + '/produtos.html';
}
window.productUrlV353 = productUrlV353;
window.categoryUrlV353 = categoryUrlV353;


// V3.8 - promoções automáticas
function precoFinalV38(produto) {
  const original = Number(produto?.preco || 0);
  if (Number(produto?.desconto_ativo || 0) === 1 && Number(produto?.desconto_percentual || 0) > 0) {
    const pct = Math.min(100, Math.max(0, Number(produto.desconto_percentual)));
    return Math.round((original * (1 - pct / 100)) * 100) / 100;
  }
  return Number(produto?.preco_promocional ?? original);
}

function descontoAtivoV38(produto) {
  return Number(produto?.desconto_ativo || 0) === 1 && Number(produto?.desconto_percentual || 0) > 0;
}

window.precoFinalV38 = precoFinalV38;
window.descontoAtivoV38 = descontoAtivoV38;


// V4.4 - quantidade mínima e preço progressivo
function faixaQuantidadeV44(produto, quantidade) {
  const cfg = produto?.quantidade_config;
  if (!cfg || Number(cfg.ativo || 0) !== 1) return null;

  const qtd = Math.max(1, Number(quantidade || 1));
  const faixas = Array.isArray(cfg.faixas) ? [...cfg.faixas] : [];
  faixas.sort((a,b) => Number(a.minimo || 1) - Number(b.minimo || 1));

  let aplicada = null;
  for (const faixa of faixas) {
    if (qtd >= Number(faixa.minimo || 1)) aplicada = faixa;
  }
  return aplicada;
}

function precoQuantidadeV44(produto, quantidade, precoBase) {
  const base = Number(
    precoBase != null
      ? precoBase
      : (typeof precoFinalV38 === 'function'
          ? precoFinalV38(produto)
          : (produto?.preco_promocional ?? produto?.preco ?? 0))
  );

  const cfg = produto?.quantidade_config;
  if (!cfg || Number(cfg.ativo || 0) !== 1) {
    return { preco_unitario:base, desconto_percentual:0, faixa:null };
  }

  const faixa = faixaQuantidadeV44(produto, quantidade);
  if (!faixa) return { preco_unitario:base, desconto_percentual:0, faixa:null };

  if ((cfg.modo || 'desconto_percentual') === 'preco_unitario') {
    const unit = Math.max(0, Number(faixa.valor || 0));
    return {
      preco_unitario:Math.round(unit * 100) / 100,
      desconto_percentual:base > 0 ? Math.max(0, Math.round((1 - unit/base) * 10000) / 100) : 0,
      faixa
    };
  }

  const pct = Math.min(100, Math.max(0, Number(faixa.valor || 0)));
  return {
    preco_unitario:Math.round((base * (1 - pct/100)) * 100) / 100,
    desconto_percentual:pct,
    faixa
  };
}

function quantidadeMinimaV44(produto) {
  const cfg = produto?.quantidade_config;
  return cfg && Number(cfg.ativo || 0) === 1
    ? Math.max(1, Number(cfg.minimo || 1))
    : 1;
}

window.faixaQuantidadeV44 = faixaQuantidadeV44;
window.precoQuantidadeV44 = precoQuantidadeV44;
window.quantidadeMinimaV44 = quantidadeMinimaV44;

document.addEventListener('DOMContentLoaded',()=>{ if(typeof updateFavoriteButtonsV45==='function') updateFavoriteButtonsV45(); });
