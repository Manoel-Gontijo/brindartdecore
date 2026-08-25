
let adminV30Page = 1;
const adminV30Limit = 8;
let adminV30ProdutosCache = [];

function showAdminTab(id, btn) {
  document.querySelectorAll('.admin-v30-tab').forEach(el => el.classList.add('d-none'));
  document.getElementById(id).classList.remove('d-none');

  document.querySelectorAll('.admin-subnav button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (id === 'bannersV30') carregarBannersV30();
  if (id === 'destaquesV30') carregarVitrineV30('destaque');
  if (id === 'promocoesV30') carregarVitrineV30('promocao');
}

async function carregarProdutosPaginadosV30(page = 1) {
  adminV30Page = page;
  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${adminV30Limit}`);
  const tbody = document.querySelector('#adminProdutosPaginados');
  const pagination = document.querySelector('#adminProdutosPagination');
  if (!tbody || !pagination) return;

  tbody.innerHTML = result.data.map(p => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${p.imagem}" style="width:52px;height:52px;object-fit:cover;border-radius:12px">
          <strong>${p.nome}</strong>
        </div>
      </td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td>
        <a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a>
      </td>
    </tr>
  `).join('');

  const pages = Math.max(1, Math.ceil(result.total / result.limit));
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="carregarProdutosPaginadosV30(${i})">${i}</button>`;
  }
  pagination.innerHTML = html;
}

async function carregarBannersV30() {
  const banners = await BrindartAPI.get('/api/banners');
  const box = document.querySelector('#listaBannersV30');
  if (!box) return;

  box.innerHTML = banners.map(b => `
    <div class="border rounded-4 p-3 mb-2 bg-white">
      <div class="row align-items-center g-2">
        <div class="col-md-2"><img src="${b.imagem}" class="w-100 rounded-3"></div>
        <div class="col-md-3"><strong>${b.titulo}</strong><div class="small text-muted">${b.subtitulo || ''}</div></div>
        <div class="col-md-3 small">${b.imagem}</div>
        <div class="col-md-2">Ordem: ${b.ordem || 0}</div>
        <div class="col-md-2 text-end">
          <button class="btn btn-sm btn-outline-dark rounded-pill" onclick='editarBannerV30(${JSON.stringify(b)})'>Editar</button>
          <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="excluirBannerV30(${b.id})">Remover</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editarBannerV30(b) {
  const form = document.querySelector('#formBannerV30');
  form.id.value = b.id;
  form.titulo.value = b.titulo || '';
  form.subtitulo.value = b.subtitulo || '';
  form.imagem.value = b.imagem || '';
  form.link.value = b.link || '';
  form.ordem.value = b.ordem || 0;
}

async function excluirBannerV30(id) {
  if (!confirm('Remover banner?')) return;
  await BrindartAPI.delete('/api/banners/' + id);
  carregarBannersV30();
}

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'formBannerV30') return;
  e.preventDefault();

  const data = Object.fromEntries(new FormData(e.target).entries());
  const id = data.id;
  delete data.id;

  if (id) await BrindartAPI.put('/api/banners/' + id, data);
  else await BrindartAPI.post('/api/banners', data);

  e.target.reset();
  carregarBannersV30();
});

async function carregarVitrineV30(tipo) {
  const result = await BrindartAPI.get('/api/produtos?limit=100');
  adminV30ProdutosCache = result.data;
  const box = document.querySelector(tipo === 'destaque' ? '#listaDestaquesV30' : '#listaPromocoesV30');
  if (!box) return;

  box.innerHTML = result.data.map(p => {
    const checked = tipo === 'destaque' ? p.destaque : p.promocao;
    return `
      <div class="col-md-4 col-lg-3">
        <div class="border rounded-4 p-3 bg-white h-100">
          <img src="${p.imagem}" class="w-100 rounded-3 mb-2" style="aspect-ratio:1/1;object-fit:cover">
          <strong>${p.nome}</strong>
          <div class="small text-muted">${formatMoney(p.preco_promocional || p.preco)}</div>
          <label class="form-check mt-2">
            <input class="form-check-input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleVitrineV30(${p.id}, '${tipo}', this.checked)">
            <span class="form-check-label">${tipo === 'destaque' ? 'Destaque' : 'Promoção'}</span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}

async function toggleVitrineV30(id, tipo, checked) {
  const p = adminV30ProdutosCache.find(item => Number(item.id) === Number(id));
  if (!p) return;

  const data = {
    nome: p.nome,
    descricao: p.descricao || '',
    preco: p.preco,
    preco_promocional: p.preco_promocional,
    imagem: p.imagem,
    categoria_id: p.categoria_id || 1,
    loja_id: p.loja_id || 1,
    estoque: p.estoque || 10,
    destaque: tipo === 'destaque' ? checked : !!p.destaque,
    novidade: !!p.novidade,
    promocao: tipo === 'promocao' ? checked : !!p.promocao,
    ativo: true
  };

  await BrindartAPI.put('/api/produtos/' + id, data);
  p[tipo] = checked ? 1 : 0;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => carregarProdutosPaginadosV30(1), 600);
});

let vitrinePageV306 = { destaque: 1, promocao: 1 };
const vitrineLimitV306 = 8;
let vitrineCacheV306 = { destaque: [], promocao: [] };

async function carregarVitrineV30(tipo, page = 1) {
  vitrinePageV306[tipo] = page;
  const result = await BrindartAPI.get('/api/produtos?limit=100');
  const produtos = result.data || [];
  vitrineCacheV306[tipo] = produtos;

  const box = document.querySelector(tipo === 'destaque' ? '#listaDestaquesV30' : '#listaPromocoesV30');
  if (!box) return;

  const start = (page - 1) * vitrineLimitV306;
  const pageItems = produtos.slice(start, start + vitrineLimitV306);

  box.innerHTML = pageItems.map(p => {
    const checked = tipo === 'destaque' ? p.destaque : p.promocao;
    const desconto = calcularDescontoV306(p);
    return `
      <div class="col-md-4 col-lg-3">
        <div class="border rounded-4 p-3 bg-white h-100">
          <img src="${p.imagem}" class="w-100 rounded-3 mb-2" style="aspect-ratio:1/1;object-fit:cover">
          <strong>${p.nome}</strong>
          <div class="small text-muted">${formatMoney(p.preco_promocional || p.preco)}</div>
          ${tipo === 'promocao' ? `
            <div class="desconto-box">
              <div><small>Valor normal:</small> <strong>${formatMoney(p.preco)}</strong></div>
              <div><small>Desconto:</small> <strong>${desconto.percentual}%</strong></div>
              <div><small>Com desconto:</small> <strong class="text-danger">${formatMoney(desconto.valorFinal)}</strong></div>
            </div>
          ` : ''}
          <label class="form-check mt-2">
            <input class="form-check-input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleVitrineV30(${p.id}, '${tipo}', this.checked)">
            <span class="form-check-label">${tipo === 'destaque' ? 'Destaque' : 'Promoção'}</span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  renderVitrinePaginationV306(tipo, produtos.length);
}

function renderVitrinePaginationV306(tipo, total) {
  const box = document.querySelector(tipo === 'destaque' ? '#listaDestaquesV30' : '#listaPromocoesV30');
  if (!box) return;

  let pag = document.querySelector(`#paginacao-${tipo}-v306`);
  if (!pag) {
    pag = document.createElement('div');
    pag.id = `paginacao-${tipo}-v306`;
    pag.className = 'admin-vitrine-pagination';
    box.after(pag);
  }

  const totalPages = Math.max(1, Math.ceil(total / vitrineLimitV306));
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === vitrinePageV306[tipo] ? 'active' : ''}" onclick="carregarVitrineV30('${tipo}', ${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function calcularDescontoV306(p) {
  const normal = Number(p.preco || 0);
  let final = Number(p.preco_promocional || 0);
  let percentual = 0;

  if (!final || final >= normal) {
    percentual = 10;
    final = normal * 0.9;
  } else {
    percentual = Math.round(((normal - final) / normal) * 100);
  }

  return {
    percentual,
    valorFinal: final
  };
}

async function toggleVitrineV30(id, tipo, checked) {
  const p = (vitrineCacheV306[tipo] || []).find(item => Number(item.id) === Number(id)) || adminV30ProdutosCache.find(item => Number(item.id) === Number(id));
  if (!p) return;

  const desconto = calcularDescontoV306(p);
  const data = {
    nome: p.nome,
    descricao: p.descricao || '',
    preco: p.preco,
    preco_promocional: tipo === 'promocao' && checked ? desconto.valorFinal : p.preco_promocional,
    imagem: p.imagem,
    categoria_id: p.categoria_id || 1,
    loja_id: p.loja_id || 1,
    estoque: p.estoque || 10,
    destaque: tipo === 'destaque' ? checked : !!p.destaque,
    novidade: !!p.novidade,
    promocao: tipo === 'promocao' ? checked : !!p.promocao,
    ativo: true
  };

  await BrindartAPI.put('/api/produtos/' + id, data);
  p[tipo] = checked ? 1 : 0;
  if (tipo === 'promocao' && checked) p.preco_promocional = desconto.valorFinal;
}

let produtosPromoCacheV307 = [];

async function prepararPromocoesV307() {
  const result = await BrindartAPI.get('/api/produtos?limit=1000');
  produtosPromoCacheV307 = result.data || [];
  const select = document.querySelector('#promoProdutoSelectV307');
  if (select) {
    select.innerHTML = produtosPromoCacheV307.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    select.onchange = preencherProdutoPromocaoV307;
    preencherProdutoPromocaoV307();
  }
}

function preencherProdutoPromocaoV307() {
  const id = Number(document.querySelector('#promoProdutoSelectV307')?.value);
  const p = produtosPromoCacheV307.find(item => Number(item.id) === id);
  if (!p) return;

  const normal = Number(p.preco || 0);
  const final = Number(p.preco_promocional || (normal * 0.9));
  const desconto = normal ? Math.round(((normal - final) / normal) * 100) : 10;

  document.querySelector('#promoPrecoNormalV307').value = normal.toFixed(2);
  document.querySelector('#promoDescontoV307').value = desconto;
  document.querySelector('#promoPrecoFinalV307').value = final.toFixed(2);
}

['promoPrecoNormalV307','promoDescontoV307'].forEach(id => {
  document.addEventListener('input', (e) => {
    if (e.target.id !== id) return;
    const normal = Number(document.querySelector('#promoPrecoNormalV307')?.value || 0);
    const desc = Number(document.querySelector('#promoDescontoV307')?.value || 0);
    document.querySelector('#promoPrecoFinalV307').value = (normal * (1 - desc / 100)).toFixed(2);
  });
});

async function salvarPromocaoV307() {
  const id = Number(document.querySelector('#promoProdutoSelectV307')?.value);
  const p = produtosPromoCacheV307.find(item => Number(item.id) === id);
  if (!p) return alert('Selecione um produto.');

  const preco = Number(document.querySelector('#promoPrecoNormalV307').value || p.preco || 0);
  const precoPromocional = Number(document.querySelector('#promoPrecoFinalV307').value || 0);

  const data = {
    nome: p.nome,
    descricao: p.descricao || '',
    preco,
    preco_promocional: precoPromocional,
    imagem: p.imagem,
    categoria_id: p.categoria_id || 1,
    loja_id: p.loja_id || 1,
    estoque: p.estoque || 10,
    destaque: !!p.destaque,
    novidade: !!p.novidade,
    promocao: true,
    ativo: true
  };

  await BrindartAPI.put('/api/produtos/' + id, data);
  alert('Promoção salva com sucesso!');
  await prepararPromocoesV307();
  await carregarVitrineV30('promocao', 1);
}

async function carregarVitrineV30(tipo, page = 1) {
  vitrinePageV306[tipo] = page;
  const result = await BrindartAPI.get('/api/produtos?limit=1000');
  const produtos = result.data || [];
  vitrineCacheV306[tipo] = produtos;

  if (tipo === 'promocao') prepararPromocoesV307();

  const box = document.querySelector(tipo === 'destaque' ? '#listaDestaquesV30' : '#listaPromocoesV30');
  if (!box) return;

  const filtered = tipo === 'promocao' ? produtos.filter(p => p.promocao) : produtos;
  const start = (page - 1) * vitrineLimitV306;
  const pageItems = filtered.slice(start, start + vitrineLimitV306);

  box.innerHTML = pageItems.length ? pageItems.map(p => {
    const checked = tipo === 'destaque' ? p.destaque : p.promocao;
    const desconto = calcularDescontoV306(p);
    return `
      <div class="col-md-4 col-lg-3">
        <div class="${tipo === 'promocao' ? 'promo-edit-card' : 'border rounded-4 p-3 bg-white h-100'}">
          <img src="${p.imagem}" class="w-100 rounded-3 mb-2" style="aspect-ratio:1/1;object-fit:cover">
          <strong>${p.nome}</strong>
          ${tipo === 'promocao' ? `
            <div class="promo-price-grid">
              <input class="form-control rounded-4" id="normal-${p.id}" type="number" step="0.01" value="${Number(p.preco || 0).toFixed(2)}" title="Valor normal">
              <input class="form-control rounded-4" id="desc-${p.id}" type="number" step="0.01" value="${desconto.percentual}" title="% desconto">
              <input class="form-control rounded-4" id="final-${p.id}" type="number" step="0.01" value="${Number(desconto.valorFinal).toFixed(2)}" title="Valor final">
              <button class="btn btn-sm btn-gold rounded-pill" onclick="editarPromocaoV307(${p.id})">Salvar</button>
            </div>
          ` : `<div class="small text-muted">${formatMoney(p.preco_promocional || p.preco)}</div>`}
          <label class="form-check mt-2">
            <input class="form-check-input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleVitrineV30(${p.id}, '${tipo}', this.checked)">
            <span class="form-check-label">${tipo === 'destaque' ? 'Destaque' : 'Promoção'}</span>
          </label>
        </div>
      </div>
    `;
  }).join('') : '<div class="col-12"><p class="text-muted">Nenhum produto em promoção. Use o formulário acima para cadastrar.</p></div>';

  renderVitrinePaginationV306(tipo, filtered.length);
}

async function editarPromocaoV307(id) {
  const p = produtosPromoCacheV307.find(item => Number(item.id) === Number(id)) || (vitrineCacheV306.promocao || []).find(item => Number(item.id) === Number(id));
  if (!p) return;

  const preco = Number(document.querySelector(`#normal-${id}`).value || 0);
  const desconto = Number(document.querySelector(`#desc-${id}`).value || 0);
  const finalInput = document.querySelector(`#final-${id}`);
  const precoPromocional = Number(finalInput.value || (preco * (1 - desconto / 100)));

  const data = {
    nome: p.nome,
    descricao: p.descricao || '',
    preco,
    preco_promocional: precoPromocional,
    imagem: p.imagem,
    categoria_id: p.categoria_id || 1,
    loja_id: p.loja_id || 1,
    estoque: p.estoque || 10,
    destaque: !!p.destaque,
    novidade: !!p.novidade,
    promocao: true,
    ativo: true
  };

  await BrindartAPI.put('/api/produtos/' + id, data);
  alert('Promoção atualizada.');
  carregarVitrineV30('promocao', vitrinePageV306.promocao);
}


async function carregarPromocoesAdminV324(page = 1) {
  if (typeof vitrinePageV306 !== 'undefined') vitrinePageV306.promocao = page;

  const result = await BrindartAPI.get('/api/produtos?promocao=true&limit=1000');
  const produtos = result.data || [];
  const box = document.querySelector('#listaPromocoesV30');
  if (!box) return;

  const limit = typeof vitrineLimitV306 !== 'undefined' ? vitrineLimitV306 : 8;
  const start = (page - 1) * limit;
  const pageItems = produtos.slice(start, start + limit);

  box.innerHTML = pageItems.length ? pageItems.map(p => {
    const normal = Number(p.preco || 0);
    const final = Number(p.preco_promocional || (normal * 0.9));
    const percentual = normal ? Math.round(((normal - final) / normal) * 100) : 10;

    return `
      <div class="col-md-4 col-lg-3">
        <div class="promo-edit-card">
          <img src="${p.imagem}" class="w-100 rounded-3 mb-2" style="aspect-ratio:1/1;object-fit:cover">
          <strong>${p.nome}</strong>
          <div class="promo-price-grid">
            <input class="form-control rounded-4" id="normal-${p.id}" type="number" step="0.01" value="${normal.toFixed(2)}" title="Valor normal">
            <input class="form-control rounded-4" id="desc-${p.id}" type="number" step="0.01" value="${percentual}" title="% desconto">
            <input class="form-control rounded-4" id="final-${p.id}" type="number" step="0.01" value="${final.toFixed(2)}" title="Valor final">
            <button class="btn btn-sm btn-gold rounded-pill" onclick="editarPromocaoV307(${p.id})">Salvar</button>
          </div>
          <label class="form-check mt-2">
            <input class="form-check-input" type="checkbox" checked onchange="toggleVitrineV30(${p.id}, 'promocao', this.checked)">
            <span class="form-check-label">Promoção</span>
          </label>
        </div>
      </div>
    `;
  }).join('') : '<div class="col-12"><p class="text-muted">Nenhum produto em promoção.</p></div>';

  let pag = document.querySelector('#paginacao-promocao-v306');
  if (!pag) {
    pag = document.createElement('div');
    pag.id = 'paginacao-promocao-v306';
    pag.className = 'admin-vitrine-pagination';
    box.after(pag);
  }

  const totalPages = Math.max(1, Math.ceil(produtos.length / limit));
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="carregarPromocoesAdminV324(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

const carregarVitrineV30OriginalV324 = typeof carregarVitrineV30 === 'function' ? carregarVitrineV30 : null;
carregarVitrineV30 = async function(tipo, page = 1) {
  if (tipo === 'promocao') {
    await prepararPromocoesV307?.();
    return carregarPromocoesAdminV324(page);
  }

  if (carregarVitrineV30OriginalV324) {
    return carregarVitrineV30OriginalV324(tipo, page);
  }
};
