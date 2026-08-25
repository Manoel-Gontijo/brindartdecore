let currentPage = 1;

function categoriaSlugV353() {
  const match = window.location.pathname.match(/^\/categoria\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function carregarProdutos() {
  const params = getParams();
  const categoriaPath = categoriaSlugV353();
  if (categoriaPath) params.set('categoria', categoriaPath);
  const form = document.querySelector('#filtersForm');
  if (form) {
    const fd = new FormData(form);
    for (const [key, value] of fd.entries()) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
  }
  params.set('page', currentPage);
  params.set('limit', 12);

  const result = await BrindartAPI.get('/api/produtos?' + params.toString());
  document.querySelector('#produtosGrid').innerHTML = result.data.length
    ? result.data.map(productCard).join('')
    : '<div class="col-12"><div class="alert alert-warning">Nenhum produto encontrado.</div></div>';

  document.querySelector('#resultCount').textContent = `${result.total} produto(s) encontrado(s)`;
  document.querySelector('#pageInfo').textContent = `Página ${result.page}`;
  document.querySelector('#prevPage').disabled = result.page <= 1;
  document.querySelector('#nextPage').disabled = result.page * result.limit >= result.total;
  renderSitePagination(result.page, Math.max(1, Math.ceil(result.total / result.limit)));
}

function applyFilters(e) {
  e.preventDefault();
  currentPage = 1;
  carregarProdutos();
}

function changePage(delta) {
  currentPage = Math.max(1, currentPage + delta);
  carregarProdutos();
}

async function preencherFiltroCategorias() {
  const categorias = await BrindartAPI.get('/api/categorias');
  const select = document.querySelector('#categoriaFiltro');
  if (!select) return;
  select.innerHTML = '<option value="">Todas</option>' + categorias.map(c => `<option value="${c.slug}">${c.nome}</option>`).join('');
  const params = getParams();
  const categoriaPath = categoriaSlugV353();
  if (categoriaPath) params.set('categoria', categoriaPath);
  if (params.get('categoria')) select.value = params.get('categoria');
  if (params.get('q')) document.querySelector('[name="q"]').value = params.get('q');
}

document.addEventListener('DOMContentLoaded', async () => {
  await preencherFiltroCategorias();
  await carregarProdutos();
});

function renderSitePagination(page, totalPages) {
  let box = document.querySelector('#produtosSitePagination');
  if (!box) {
    box = document.createElement('div');
    box.id = 'produtosSitePagination';
    box.className = 'site-pagination';
    document.querySelector('#produtosGrid').after(box);
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="currentPage=${i}; carregarProdutos(); window.scrollTo({top:0, behavior:'smooth'});">${i}</button>`;
  }
  box.innerHTML = html;
}


document.addEventListener('DOMContentLoaded', () => {
  const categoriaParamV325 = categoriaSlugV353() || new URLSearchParams(window.location.search).get('categoria');
  const categoriaSelectV325 = document.querySelector('#categoriaFiltro, #filterCategoria, select[name="categoria"]');
  if (categoriaParamV325 && categoriaSelectV325) {
    categoriaSelectV325.value = categoriaParamV325;
  }
});
