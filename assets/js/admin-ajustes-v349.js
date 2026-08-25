// Ajustes finais v34.9: estoque, categorias editáveis e remoção de duplicidade do carrossel
let estoqueProdutosV349 = [];
let categoriasCacheV349 = [];

function escapeHtmlV349(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function normalizarV349(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function apiJsonV349(url, options = {}) {
  const res = await fetch(url, {
    cache: 'no-store',
    headers: options.body ? BrindartAPI.headers(true) : BrindartAPI.headers(false),
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.details || 'Erro na operação.');
  return data;
}

async function carregarCategoriasV305() {
  categoriasCacheV349 = await BrindartAPI.get('/api/categorias');

  const select = document.querySelector('#produtoCategoriaV305');
  if (select) {
    select.innerHTML = '<option value="">Selecione a categoria</option>' + categoriasCacheV349.map(c => `<option value="${c.id}">${escapeHtmlV349(c.nome)}</option>`).join('');
  }

  const lista = document.querySelector('#categoriasListaV305');
  if (lista) {
    lista.innerHTML = categoriasCacheV349.length ? categoriasCacheV349.map(c => `
      <div class="col-md-4 col-lg-3">
        <div class="border rounded-4 p-3 bg-white h-100 category-admin-card-v349">
          <i class="bi ${escapeHtmlV349(c.icone || 'bi-tag')} fs-3"></i>
          <strong class="d-block mt-2">${escapeHtmlV349(c.nome)}</strong>
          <small class="text-muted d-block mb-3">${escapeHtmlV349(c.slug)}</small>
          <div class="d-flex gap-2">
            <button class="btn-admin-edit" onclick="editarCategoriaV349(${c.id})">Editar</button>
            <button class="btn-admin-remove" onclick="removerCategoriaV349(${c.id})">Remover</button>
          </div>
        </div>
      </div>`).join('') : '<div class="col-12"><p class="text-muted">Nenhuma categoria cadastrada.</p></div>';
  }

  const metric = document.querySelector('#metricCategoriasV305');
  if (metric) metric.textContent = categoriasCacheV349.length;
}

function editarCategoriaV349(id) {
  const categoria = categoriasCacheV349.find(c => Number(c.id) === Number(id));
  const form = document.querySelector('#formCategoriaV349');
  if (!categoria || !form) return;
  form.id.value = categoria.id;
  form.nome.value = categoria.nome || '';
  form.icone.value = categoria.icone || 'bi-tag';
  form.slug.value = categoria.slug || '';
  const btn = form.querySelector('button');
  if (btn) btn.textContent = 'Atualizar';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerCategoriaV349(id) {
  if (!confirm('Remover esta categoria? Só será possível remover se não houver produtos vinculados.')) return;
  try {
    await apiJsonV349('/api/categorias/' + id, { method: 'DELETE' });
    alert('Categoria removida com sucesso.');
    await carregarCategoriasV305();
    if (typeof renderSharedMenus === 'function') renderSharedMenus();
  } catch (err) {
    alert(err.message);
  }
}

async function salvarCategoriaV349(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const editId = data.id;
  delete data.id;
  try {
    await apiJsonV349(editId ? '/api/categorias/' + editId : '/api/categorias', {
      method: editId ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    });
    alert(editId ? 'Categoria atualizada.' : 'Categoria cadastrada.');
    form.reset();
    form.icone.value = 'bi-tag';
    document.querySelector('#categoriaEditIdV349').value = '';
    const btn = form.querySelector('button');
    if (btn) btn.textContent = 'Salvar';
    await carregarCategoriasV305();
    if (typeof carregarMetricasV305 === 'function') carregarMetricasV305();
  } catch (err) {
    alert(err.message);
  }
}

async function carregarEstoqueV349() {
  const result = await BrindartAPI.get('/api/produtos?page=1&limit=10000');
  estoqueProdutosV349 = result.data || [];
  renderEstoqueV349();
}

function renderEstoqueV349() {
  const tbody = document.querySelector('#estoqueTabelaV349');
  if (!tbody) return;
  const q = normalizarV349(document.querySelector('#buscaEstoqueV349')?.value || '');
  const lista = estoqueProdutosV349.filter(p => !q || normalizarV349(p.nome).includes(q) || normalizarV349(p.categoria_nome).includes(q));
  tbody.innerHTML = lista.length ? lista.map(p => {
    const estoque = Number(p.estoque || 0);
    return `
      <tr>
        <td><div class="d-flex align-items-center gap-3"><img src="${escapeHtmlV349(p.imagem || 'assets/img/produtos/home-produto-1.png')}" style="width:54px;height:54px;object-fit:cover;border-radius:12px"><strong>${escapeHtmlV349(p.nome)}</strong></div></td>
        <td>${escapeHtmlV349(p.categoria_nome || '-')}</td>
        <td style="max-width:160px"><input id="estoque-prod-${p.id}" type="number" min="0" class="form-control rounded-4" value="${estoque}"></td>
        <td>${estoque <= 0 ? '<span class="stock-badge-zero-v349">Sem estoque</span>' : '<span class="stock-badge-ok-v349">Disponível</span>'}</td>
        <td><button class="btn btn-gold rounded-pill btn-sm" onclick="salvarEstoqueV349(${p.id})">Salvar estoque</button></td>
      </tr>`;
  }).join('') : '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum produto encontrado.</td></tr>';
}

async function salvarEstoqueV349(id) {
  const produto = estoqueProdutosV349.find(p => Number(p.id) === Number(id));
  if (!produto) return alert('Produto não encontrado.');
  const input = document.querySelector('#estoque-prod-' + id);
  const novoEstoque = Math.max(0, Number(input?.value || 0));
  const payload = {
    nome: produto.nome,
    descricao: produto.descricao || '',
    preco: produto.preco || 0,
    preco_promocional: produto.preco_promocional,
    imagem: produto.imagem || '',
    categoria_id: produto.categoria_id || 1,
    loja_id: produto.loja_id || 1,
    estoque: novoEstoque,
    destaque: !!produto.destaque,
    promocao: !!produto.promocao,
    novidade: !!produto.novidade,
    ativo: true
  };
  await BrindartAPI.put('/api/produtos/' + id, payload);
  produto.estoque = novoEstoque;
  renderEstoqueV349();
  alert('Estoque atualizado.');
}

const showAdminSectionOriginalV349 = window.showAdminSectionV305;
window.showAdminSectionV305 = function(section, link) {
  if (typeof showAdminSectionOriginalV349 === 'function') showAdminSectionOriginalV349(section, link);
  if (section === 'categorias') carregarCategoriasV305();
  if (section === 'estoque') carregarEstoqueV349();
};

document.addEventListener('DOMContentLoaded', () => {
  const formCategoria = document.querySelector('#formCategoriaV349');
  if (formCategoria) formCategoria.addEventListener('submit', salvarCategoriaV349);
  setTimeout(() => carregarCategoriasV305().catch(() => {}), 500);
});
