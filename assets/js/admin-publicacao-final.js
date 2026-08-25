let produtosPublicacaoCache = [];
let produtosPublicacaoPage = 1;
const produtosPublicacaoLimit = 8;

function boolValue(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function produtoPayloadFromForm(form) {
  const preco = Number(form.preco.value || 0);
  const desconto = Number(document.querySelector('#produtoDescontoPercentualV305')?.value || 0);
  let precoPromocional = form.preco_promocional.value ? Number(form.preco_promocional.value) : null;

  if (document.querySelector('#produtoPromocaoV305')?.checked && desconto > 0 && !precoPromocional) {
    precoPromocional = Number((preco * (1 - desconto / 100)).toFixed(2));
  }

  return {
    nome: form.nome.value.trim(),
    descricao: form.descricao.value || '',
    seo_titulo: form.seo_titulo?.value?.trim() || '',
    seo_descricao: form.seo_descricao?.value?.trim() || '',
    preco,
    preco_promocional: precoPromocional,
    imagem: form.imagem.value || 'assets/img/produtos/caneca-placeholder.png',
    categoria_id: Number(form.categoria_id.value || 1),
    loja_id: 1,
    estoque: Number(form.estoque.value || 10),
    destaque: document.querySelector('#produtoDestaqueV305')?.checked || false,
    promocao: document.querySelector('#produtoPromocaoV305')?.checked || false,
    desconto_percentual: desconto,
    novidade: false,
    ativo: true
  };
}

window.carregarProdutosV305 = async function(page = 1) {
  produtosPublicacaoPage = page;
  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosPublicacaoLimit}`);
  produtosPublicacaoCache = result.data || [];

  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');
  if (!tbody || !pag) return;

  tbody.innerHTML = produtosPublicacaoCache.length ? produtosPublicacaoCache.map(p => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${p.imagem}" style="width:54px;height:54px;object-fit:cover;border-radius:12px">
          <strong>${p.nome}</strong>
        </div>
      </td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td>
        <a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a>
        <button class="btn-admin-edit" type="button" onclick="editarProdutoPublicacao(${p.id})">Editar</button>
        <button class="btn-admin-remove" type="button" onclick="removerProdutoPublicacao(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  pag.innerHTML = Array.from({ length: totalPages }).map((_, i) => {
    const n = i + 1;
    return `<button class="${n === page ? 'active' : ''}" onclick="carregarProdutosV305(${n})">${n}</button>`;
  }).join('');
};

window.editarProdutoPublicacao = function(id) {
  const p = produtosPublicacaoCache.find(item => Number(item.id) === Number(id));
  const form = document.querySelector('#formProdutoV305');
  if (!p || !form) return;

  document.querySelector('#produtoEditIdV311').value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 10;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';
  if (form.seo_titulo) form.seo_titulo.value = p.seo_titulo || '';
  if (form.seo_descricao) form.seo_descricao.value = p.seo_descricao || '';
  document.querySelector('#produtoDestaqueV305').checked = boolValue(p.destaque);
  document.querySelector('#produtoPromocaoV305').checked = boolValue(p.promocao);

  const descontoInput = document.querySelector('#produtoDescontoPercentualV305');
  if (descontoInput) {
    const preco = Number(p.preco || 0);
    const promo = Number(p.preco_promocional || 0);
    descontoInput.value = preco && promo ? Math.round(((preco - promo) / preco) * 100) : (p.desconto_percentual || '');
  }

  form.querySelector('button[type="submit"], button:not([type])').textContent = 'Atualizar produto';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.removerProdutoPublicacao = async function(id) {
  if (!confirm('Remover este produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  await carregarProdutosV305(produtosPublicacaoPage);
  if (typeof carregarMetricasV305 === 'function') carregarMetricasV305();
};

document.addEventListener('submit', async function(e) {
  if (e.target.id !== 'formProdutoV305') return;

  e.preventDefault();
  e.stopImmediatePropagation();

  const form = e.target;
  const payload = produtoPayloadFromForm(form);
  const editId = document.querySelector('#produtoEditIdV311')?.value;

  if (!payload.nome) {
    alert('Informe o nome do produto.');
    return;
  }

  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, payload);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', payload);
    alert('Produto cadastrado com sucesso.');
  }

  form.reset();
  document.querySelector('#produtoEditIdV311').value = '';
  form.querySelector('button[type="submit"], button:not([type])').textContent = 'Salvar produto';

  await carregarProdutosV305(editId ? produtosPublicacaoPage : 1);
  if (typeof carregarMetricasV305 === 'function') carregarMetricasV305();
}, true);

window.carregarVitrineV30 = async function(tipo, page = 1) {
  const result = await BrindartAPI.get('/api/produtos?limit=1000');
  const produtos = result.data || [];
  const box = document.querySelector(tipo === 'destaque' ? '#listaDestaquesV30' : '#listaPromocoesV30');
  if (!box) return;

  const source = tipo === 'promocao' ? produtos.filter(p => boolValue(p.promocao)) : produtos;
  const limit = 8;
  const totalPages = Math.max(1, Math.ceil(source.length / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const items = source.slice((safePage - 1) * limit, safePage * limit);

  box.innerHTML = items.length ? items.map(p => {
    const checked = tipo === 'destaque' ? boolValue(p.destaque) : boolValue(p.promocao);
    const preco = Number(p.preco || 0);
    const promo = Number(p.preco_promocional || 0);
    const desconto = preco && promo ? Math.round(((preco - promo) / preco) * 100) : 10;
    return `
      <div class="col-md-4 col-lg-3">
        <div class="promo-edit-card">
          <img src="${p.imagem}" class="w-100 rounded-3 mb-2" style="aspect-ratio:1/1;object-fit:cover">
          <strong>${p.nome}</strong>
          ${tipo === 'promocao' ? `
            <div class="promo-price-grid">
              <input class="form-control rounded-4" id="normal-${p.id}" type="number" step="0.01" value="${preco.toFixed(2)}">
              <input class="form-control rounded-4" id="desc-${p.id}" type="number" step="0.01" value="${desconto}">
              <input class="form-control rounded-4" id="final-${p.id}" type="number" step="0.01" value="${(promo || preco * 0.9).toFixed(2)}">
              <button class="btn btn-sm btn-gold rounded-pill" onclick="salvarPromocaoAdmin(${p.id})">Salvar</button>
            </div>
          ` : `<div class="small text-muted">${formatMoney(p.preco_promocional || p.preco)}</div>`}
          <label class="form-check mt-2">
            <input class="form-check-input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleVitrinePublicacao(${p.id}, '${tipo}', this.checked)">
            <span class="form-check-label">${tipo === 'destaque' ? 'Destaque' : 'Promoção'}</span>
          </label>
        </div>
      </div>
    `;
  }).join('') : '<div class="col-12"><p class="text-muted">Nenhum produto encontrado.</p></div>';

  let pag = document.querySelector(`#paginacao-${tipo}-publicacao`);
  if (!pag) {
    pag = document.createElement('div');
    pag.id = `paginacao-${tipo}-publicacao`;
    pag.className = 'admin-vitrine-pagination';
    box.after(pag);
  }

  pag.innerHTML = Array.from({ length: totalPages }).map((_, i) => {
    const n = i + 1;
    return `<button class="${n === safePage ? 'active' : ''}" onclick="carregarVitrineV30('${tipo}', ${n})">${n}</button>`;
  }).join('');
};

window.toggleVitrinePublicacao = async function(id, tipo, checked) {
  const produto = await BrindartAPI.get('/api/produtos/' + id);
  const payload = {
    nome: produto.nome,
    descricao: produto.descricao || '',
    preco: produto.preco,
    preco_promocional: produto.preco_promocional,
    imagem: produto.imagem,
    categoria_id: produto.categoria_id || 1,
    loja_id: produto.loja_id || 1,
    estoque: produto.estoque || 10,
    destaque: tipo === 'destaque' ? checked : boolValue(produto.destaque),
    promocao: tipo === 'promocao' ? checked : boolValue(produto.promocao),
    desconto_percentual: produto.desconto_percentual || 0,
    novidade: boolValue(produto.novidade),
    ativo: true
  };

  if (tipo === 'promocao' && checked && !payload.preco_promocional) {
    payload.preco_promocional = Number((Number(payload.preco || 0) * 0.9).toFixed(2));
    payload.desconto_percentual = 10;
  }

  await BrindartAPI.put('/api/produtos/' + id, payload);
  await carregarVitrineV30(tipo, 1);
};

window.salvarPromocaoAdmin = async function(id) {
  const produto = await BrindartAPI.get('/api/produtos/' + id);
  const preco = Number(document.querySelector(`#normal-${id}`).value || 0);
  const final = Number(document.querySelector(`#final-${id}`).value || 0);
  const desconto = preco ? Math.round(((preco - final) / preco) * 100) : 0;

  await BrindartAPI.put('/api/produtos/' + id, {
    nome: produto.nome,
    descricao: produto.descricao || '',
    preco,
    preco_promocional: final,
    imagem: produto.imagem,
    categoria_id: produto.categoria_id || 1,
    loja_id: produto.loja_id || 1,
    estoque: produto.estoque || 10,
    destaque: boolValue(produto.destaque),
    promocao: true,
    desconto_percentual: desconto,
    novidade: boolValue(produto.novidade),
    ativo: true
  });

  alert('Promoção atualizada.');
  await carregarVitrineV30('promocao', 1);
};

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => carregarProdutosV305(1), 300);
});
