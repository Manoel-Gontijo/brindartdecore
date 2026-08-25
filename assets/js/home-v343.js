(() => {
  function moneyV343(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));
  }

  async function getJsonV343(url) {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Erro na API');
    return res.json();
  }

  function limparHomeV343() {
    const oficial = document.querySelector('#brindartCarouselNovo #brindartCarouselV34');

    document.querySelectorAll('#heroCarouselV339,#heroCarouselV335,#homeMainCarouselStableV3311,#carouselHomeBrindart,#homeCarousel,#mainCarousel').forEach(el => {
      if (oficial && el === oficial) return;
      if (el.closest('#brindartCarouselNovo')) return;

      const wrapper = el.closest('section,.container,.hero-section,.brindart-carousel-area') || el;
      if (wrapper && wrapper !== document.body && wrapper !== document.documentElement) wrapper.remove();
    });

    document.querySelectorAll('#brindartCarouselNovo').forEach((el, index) => {
      if (index > 0) el.remove();
    });

    document.querySelectorAll('.promo-mini-grid').forEach(el => {
      const sec = el.closest('section');
      if (sec && !sec.querySelector('#maisVisitadosHomeV343')) sec.remove();
      else el.remove();
    });
  }

  function cardProdutoV343(p) {
    return `
      <a class="home-product-card-v343" href="${productUrlV353(p)}">
        <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome || 'Produto'}">
        <div class="info">
          <strong>${p.nome || 'Produto artesanal'}</strong>
          <span>${moneyV343(p.preco_promocional || p.preco)}</span>
          ${p.categoria_nome ? `<small>${p.categoria_nome}</small>` : ''}
        </div>
      </a>
    `;
  }

  async function renderMaisVisitadosV343() {
    const box = document.querySelector('#maisVisitadosHomeV343');
    if (!box) return;

    let produtos = [];
    try {
      let result = await getJsonV343('/api/produtos?visitados=true&limit=4');
      produtos = result.data || [];
    } catch {}

    if (!produtos.length) {
      try {
        let result = await getJsonV343('/api/produtos?limit=4');
        produtos = result.data || [];
      } catch {}
    }

    box.innerHTML = produtos.length
      ? produtos.slice(0,4).map(cardProdutoV343).join('')
      : '<p class="text-muted">Nenhum produto cadastrado ainda.</p>';
  }

  async function renderDestaquesV343() {
    const selectors = ['#destaquesHomeV343', '#produtosDestaques', '#destaquesHome', '.destaques-grid'];
    const targets = selectors.map(s => document.querySelector(s)).filter(Boolean);

    if (!targets.length) return;

    let produtos = [];

    try {
      const result = await getJsonV343('/api/produtos?destaque=true&limit=8');
      produtos = result.data || [];
    } catch {}

    if (!produtos.length) {
      try {
        const result = await getJsonV343('/api/produtos?limit=8');
        produtos = result.data || [];
      } catch {}
    }

    const html = produtos.length
      ? produtos.slice(0,8).map(cardProdutoV343).join('')
      : '<p class="text-muted">Nenhum produto em destaque ainda.</p>';

    targets.forEach(target => {
      target.classList.add('home-products-grid-v343');
      target.innerHTML = html;
    });
  }

  function runV343() {
    limparHomeV343();
    renderMaisVisitadosV343();
    renderDestaquesV343();
    setTimeout(limparHomeV343, 600);
    setTimeout(renderMaisVisitadosV343, 700);
    setTimeout(renderDestaquesV343, 800);
  }

  document.addEventListener('DOMContentLoaded', runV343);
  window.addEventListener('load', runV343);
})();
