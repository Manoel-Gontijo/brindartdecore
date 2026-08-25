function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

async function carregarCategoriasHomeV341() {
  const areas = document.querySelectorAll('#listaCategorias, .categorias-lista, .categories-list');
  if (!areas.length) return;

  try {
    const categorias = await BrindartAPI.get('/api/categorias');
    const html = (categorias || []).map(c => `
      <a href="${categoryUrlV353(c)}" class="category-item">
        <i class="bi ${c.icone || 'bi-heart'}"></i>
        <span>${c.nome}</span>
        <i class="bi bi-chevron-right"></i>
      </a>
    `).join('');

    areas.forEach(area => area.innerHTML = html);
  } catch {}
}

async function carregarPromocoesHomeV341() {
  const grid = document.querySelector('.promo-mini-grid');
  if (!grid) return;

  let produtos = [];

  try {
    const result = await BrindartAPI.get('/api/produtos?promocao=true&limit=2');
    produtos = result.data || [];
  } catch {}

  if (!produtos.length) return;

  grid.innerHTML = produtos.map(p => `
    <a class="promo-product-card-v334" href="${productUrlV353(p)}">
      <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome}">
      <div class="info">
        <strong>${p.nome}</strong>
        <span>${formatMoney(p.preco_promocional || p.preco)}</span>
      </div>
    </a>
  `).join('');
}

async function carregarDestaquesHomeV341() {
  const target = document.querySelector('#produtosDestaques, #destaquesHome, .destaques-grid');
  if (!target) return;

  try {
    const result = await BrindartAPI.get('/api/produtos?destaque=true&limit=8');
    const produtos = result.data || [];

    if (!produtos.length) return;

    target.innerHTML = produtos.map(p => `
      <a class="product-card text-decoration-none" href="${productUrlV353(p)}">
        <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome}">
        <div class="card-body">
          <h5>${p.nome}</h5>
          <strong class="price">${formatMoney(p.preco_promocional || p.preco)}</strong>
        </div>
      </a>
    `).join('');
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  carregarCategoriasHomeV341();
  carregarPromocoesHomeV341();
  carregarDestaquesHomeV341();
});
