function moneyV344(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

async function getJsonV344(url) {
  const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Erro na API');
  return res.json();
}

function cardProdutoV344(p) {
  const promo = typeof descontoAtivoV38 === 'function' && descontoAtivoV38(p);
  const laserAreaV42 = (p.tipo_precificacao === 'calculadora' || p.tipo_precificacao === 'laser_area') && (p.calculadora_config?.ativo || p.laser_config?.ativo);
  const final = typeof precoFinalV38 === 'function' ? precoFinalV38(p) : (p.preco_promocional || p.preco);
  return `
    <a class="home-product-card-v344" href="${productUrlV353(p)}">
      <div class="home-product-img-wrap-v34">
        <button type="button" class="favorite-toggle-v45 ${typeof isFavoriteV45==='function'&&isFavoriteV45(p.id)?'active':''}" data-favorite-id="${p.id}" onclick="event.preventDefault();event.stopPropagation();toggleFavorite(${p.id})">
          <i class="bi ${typeof isFavoriteV45==='function'&&isFavoriteV45(p.id)?'bi-heart-fill':'bi-heart'}"></i>
        </button>
        ${p.selo ? `<span class="product-selo-v34">${p.selo}</span>` : ''}
        ${promo ? `<span class="discount-badge-v38">-${Number(p.desconto_percentual)}% OFF</span>` : ''}
        <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome || 'Produto'}">
      </div>
      <div class="info">
        ${Number(p.destaque_ativo || 0) === 1 ? `<span class="highlight-plaque-v38 highlight-inline-v497">${p.destaque_texto || 'DESTAQUE'}</span>` : ''}
        ${p.referencia ? `<small class="product-ref-v40">Ref.: ${p.referencia}</small>` : ''}
        <strong>${p.nome || 'Produto artesanal'}</strong>
        ${promo ? `<small class="old-price-v38">${moneyV344(p.preco)}</small>` : ''}
        <span>${laserAreaV42 ? 'A partir de ' : ''}${moneyV344(final)}</span>
        ${Number(p.quantidade_config?.ativo || 0) === 1 ? `<small class="quantity-card-note-v44">Preço especial por quantidade</small>` : ''}
        ${p.categoria_nome ? `<small>${p.categoria_nome}</small>` : ''}
      </div>
    </a>
  `;
}

async function carregarCategoriasHomeV344() {
  const box = document.querySelector('#categoriasHomeV344');
  if (!box) return;

  try {
    const categorias = await getJsonV344('/api/categorias');
    box.innerHTML = (categorias || []).map(c => `
      <a href="${categoryUrlV353(c)}" class="category-item">
        <i class="bi ${c.icone || 'bi-heart'}"></i>
        <span>${c.nome}</span>
        <i class="bi bi-chevron-right"></i>
      </a>
    `).join('');
  } catch {
    box.innerHTML = '<div class="home-empty-v344">Não foi possível carregar categorias.</div>';
  }
}

async function carregarMaisVisitadosV344() {
  const box = document.querySelector('#maisVisitadosHomeV344');
  if (!box) return;

  let produtos = [];

  try {
    const result = await getJsonV344('/api/produtos?mais_visitado=true&limit=4');
    produtos = result.data || [];
  } catch {}

  if (!produtos.length) {
    try {
      const result = await getJsonV344('/api/produtos?limit=4');
      produtos = result.data || [];
    } catch {}
  }

  box.innerHTML = produtos.length
    ? produtos.slice(0, 4).map(cardProdutoV344).join('')
    : '<div class="home-empty-v344">Nenhum produto cadastrado ainda.</div>';
}

async function carregarDestaquesV344() {
  const box = document.querySelector('#destaquesHomeV344');
  if (!box) return;

  let produtos = [];

  try {
    const result = await getJsonV344('/api/produtos?destaque=true&limit=8');
    produtos = result.data || [];
  } catch {}

  if (!produtos.length) {
    try {
      const result = await getJsonV344('/api/produtos?limit=8');
      produtos = result.data || [];
    } catch {}
  }

  box.innerHTML = produtos.length
    ? produtos.slice(0, 8).map(cardProdutoV344).join('')
    : '<div class="home-empty-v344">Nenhum produto em destaque ainda.</div>';
}

function cardSuperCondicaoV499(p) {
  const precoOriginal = Number(p.preco || 0);
  const precoFinal = typeof precoFinalV38 === 'function'
    ? Number(precoFinalV38(p))
    : Number(p.preco_promocional || p.preco || 0);
  const desconto = precoOriginal > precoFinal && precoOriginal > 0
    ? Math.round((1 - precoFinal / precoOriginal) * 100)
    : 0;

  return `
    <a class="weekly-deal-card-v499" href="${productUrlV353(p)}">
      <div class="weekly-deal-image-v499">
        ${desconto > 0 ? `<span>-${desconto}%</span>` : '<span>SUPER PREÇO</span>'}
        <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome || 'Produto em oferta'}">
      </div>
      <div class="weekly-deal-info-v499">
        <small>${p.referencia ? `REF.: ${p.referencia}` : 'OFERTA DA SEMANA'}</small>
        <strong>${p.nome || 'Produto em oferta'}</strong>
        ${precoOriginal > precoFinal ? `<del>${moneyV344(precoOriginal)}</del>` : ''}
        <b>${moneyV344(precoFinal)}</b>
        <span class="weekly-deal-cta-v499">Ver oferta <i class="bi bi-arrow-right"></i></span>
      </div>
    </a>`;
}

async function carregarSuperCondicoesV499() {
  const box = document.querySelector('#superCondicoesHomeV499');
  if (!box) return;
  let produtos = [];
  try {
    const result = await getJsonV344('/api/produtos?destaque_semana=true&limit=3');
    produtos = result.data || [];
  } catch {}
  if (!produtos.length) {
    try {
      const result = await getJsonV344('/api/produtos?promocao=true&limit=3');
      produtos = result.data || [];
    } catch {}
  }
  box.innerHTML = produtos.length
    ? produtos.slice(0, 3).map(cardSuperCondicaoV499).join('')
    : '<div class="weekly-deals-empty-v499">Selecione até três produtos no Gerenciador em “Super condição da semana”.</div>';
}

function atualizarContadorCarrinhoV344() {
  const cart = JSON.parse(localStorage.getItem('brindart_cart') || '[]');
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = cart.reduce((acc, item) => acc + Number(item.quantidade || 1), 0);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCategoriasHomeV344();
  carregarMaisVisitadosV344();
  carregarDestaquesV344();
  carregarSuperCondicoesV499();
  atualizarContadorCarrinhoV344();
});




// V3.5 - publicidade externa nos mesmos espaços da V3.4
function normalizarLinkAnuncioV35(link) {
  return String(link || '#');
}

function anuncioExternoHtmlV35(anuncio) {
  if (!String(anuncio.imagem || '').trim()) return '';
  const target = Number(anuncio.nova_aba ?? 1) === 1 ? ' target="_blank" rel="noopener sponsored"' : ' rel="sponsored"';
  return `
    <div class="ad-wrapper-v35">
      <div class="ad-label-v35">Publicidade</div>
      <a class="ad-banner-v35" href="${normalizarLinkAnuncioV35(anuncio.link)}"${target} aria-label="Publicidade - ${anuncio.anunciante || 'Anunciante'}">
        <img src="${anuncio.imagem}" alt="Publicidade - ${anuncio.anunciante || 'Anunciante'}">
      </a>
    </div>
  `;
}

function renderAnunciosExternosV35() {
  const anuncios = (window.BRINDART_STATIC?.anuncios_externos || [])
    .filter(a => Number(a.ativo ?? 1) === 1);

  const meio = document.querySelector('#bannerPromocionalMeioV34');
  const final = document.querySelector('#bannerPromocionalFinalV34');

  const adMeio = anuncios.find(a => a.posicao === 'meio');
  const adFinal = anuncios.find(a => a.posicao === 'final');

  if (meio) meio.innerHTML = adMeio?.imagem ? anuncioExternoHtmlV35(adMeio) : '';
  if (final) final.innerHTML = adFinal?.imagem ? anuncioExternoHtmlV35(adFinal) : '';
}

document.addEventListener('DOMContentLoaded', renderAnunciosExternosV35);
