
let adminTokenV305 = localStorage.getItem('brindart_admin_token');
let produtosPageV305 = 1;
const produtosLimitV305 = 8;
function setAdminViewV305(){document.querySelector('#loginBoxV305').classList.toggle('d-none',!!adminTokenV305);document.querySelector('#adminAreaV305').classList.toggle('d-none',!adminTokenV305);}
async function loginAdminV305(e){e.preventDefault();try{const data=Object.fromEntries(new FormData(e.target).entries());const res=await BrindartAPI.post('/api/auth/login',data);adminTokenV305=res.token;localStorage.setItem('brindart_admin_token',adminTokenV305);setAdminViewV305();carregarAdminV305();}catch{alert('Login inválido.');}}
function logoutAdminV305(){localStorage.removeItem('brindart_admin_token');adminTokenV305=null;setAdminViewV305();}
function showAdminSectionV305(section,link){document.querySelectorAll('.admin-section-v305').forEach(sec=>sec.classList.remove('active'));document.querySelector(`#sec-${section}`).classList.add('active');document.querySelectorAll('.admin-sidebar-v305 a').forEach(a=>a.classList.remove('active'));if(link)link.classList.add('active');if(section==='produtos')carregarProdutosV305(1);if(section==='banners')carregarBannersV30();if(section==='destaques')carregarVitrineV30('destaque');if(section==='promocoes')carregarVitrineV30('promocao');if(section==='pedidos')carregarPedidosV305();if(section==='clientes')carregarClientesV306(1);}
async function carregarAdminV305(){await Promise.all([carregarCategoriasV305(),carregarProdutosV305(1),carregarPedidosV305(),carregarMetricasV305()]);}
async function carregarMetricasV305(){const produtos=await BrindartAPI.get('/api/produtos?limit=1');const categorias=await BrindartAPI.get('/api/categorias');const pedidos=await BrindartAPI.get('/api/pedidos');let banners=[];try{banners=await BrindartAPI.get('/api/banners');}catch{}document.querySelector('#metricProdutosV305').textContent=produtos.total||0;document.querySelector('#metricCategoriasV305').textContent=categorias.length||0;document.querySelector('#metricPedidosV305').textContent=pedidos.length||0;document.querySelector('#metricBannersV305').textContent=banners.length||0;}
async function carregarCategoriasV305(){const categorias=await BrindartAPI.get('/api/categorias');const select=document.querySelector('#produtoCategoriaV305');if(select)select.innerHTML=categorias.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');const lista=document.querySelector('#categoriasListaV305');if(lista){lista.innerHTML=categorias.map(c=>`<div class="col-md-4 col-lg-3"><div class="border rounded-4 p-3 bg-white h-100"><i class="bi ${c.icone||'bi-tag'} text-warning fs-3"></i><strong class="d-block mt-2">${c.nome}</strong><small class="text-muted">${c.slug}</small></div></div>`).join('');}}
async function carregarProdutosV305(page=1){produtosPageV305=page;const result=await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV305}`);const tbody=document.querySelector('#produtosTabelaV305');const pag=document.querySelector('#produtosPaginacaoV305');if(!tbody||!pag)return;tbody.innerHTML=result.data.map(p=>`<tr><td><div class="d-flex align-items-center gap-3"><img src="${p.imagem}" style="width:54px;height:54px;object-fit:cover;border-radius:12px"><strong>${p.nome}</strong></div></td><td>${p.categoria_nome||'-'}</td><td>${formatMoney(p.preco_promocional||p.preco)}</td><td>
        <a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a>
        <button class="btn-admin-edit" onclick="editarProdutoV311(${p.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="desativarProdutoV305(${p.id})">Desativar</button>
        <button class="btn-admin-remove" onclick="removerProdutoV311(${p.id})">Remover</button>
      </td></tr>`).join('');const totalPages=Math.max(1,Math.ceil(result.total/result.limit));let html='';for(let i=1;i<=totalPages;i++){html+=`<button class="${i===page?'active':''}" onclick="carregarProdutosV305(${i})">${i}</button>`;}pag.innerHTML=html;}
async function desativarProdutoV305(id){if(!confirm('Desativar produto?'))return;await BrindartAPI.delete('/api/produtos/'+id);carregarProdutosV305(produtosPageV305);}
async function carregarPedidosV305(){const pedidos=await BrindartAPI.get('/api/pedidos');const tbody=document.querySelector('#pedidosTabelaV305');if(!tbody)return;tbody.innerHTML=pedidos.map(p=>`<tr><td>#${p.id}</td><td>${p.cliente_nome}</td><td>${p.cliente_telefone}</td><td>${formatMoney(p.total)}</td><td>${p.status}</td></tr>`).join('');}
document.addEventListener('submit',async(e)=>{if(e.target.id!=='formProdutoV305')return;e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());data.loja_id=1;data.destaque=document.querySelector('#produtoDestaqueV305').checked;data.promocao=document.querySelector('#produtoPromocaoV305').checked;data.desconto_percentual=Number(document.querySelector('#produtoDescontoPercentualV305')?.value||0); if(data.promocao && data.desconto_percentual && !data.preco_promocional){data.preco_promocional=(Number(data.preco)*(1-data.desconto_percentual/100)).toFixed(2);} data.novidade=false;const editId=document.querySelector('#produtoEditIdV311')?.value;
if(editId){
  await BrindartAPI.put('/api/produtos/'+editId,data);
  alert('Produto atualizado com sucesso!');
}else{
  await BrindartAPI.post('/api/produtos',data);
  alert('Produto salvo com sucesso!');
}
e.target.reset();
if(document.querySelector('#produtoEditIdV311')) document.querySelector('#produtoEditIdV311').value='';
carregarProdutosV305(produtosPageV305 || 1);
carregarMetricasV305();});
document.addEventListener('DOMContentLoaded',()=>{setAdminViewV305();if(adminTokenV305)carregarAdminV305();});

let clientesCacheV306 = [];
let clientesPageV306 = 1;
const clientesLimitV306 = 10;

async function carregarClientesV306(page = 1) {
  clientesPageV306 = page;
  const q = document.querySelector('#clienteBuscaV306')?.value || '';
  const mes = document.querySelector('#clienteMesV306')?.value || '';
  const result = await BrindartAPI.get(`/api/clientes?page=${page}&limit=${clientesLimitV306}&q=${encodeURIComponent(q)}&mes=${encodeURIComponent(mes)}`);
  clientesCacheV306 = result.data || [];

  const tbody = document.querySelector('#clientesTabelaV306');
  const pag = document.querySelector('#clientesPaginacaoV306');
  if (!tbody || !pag) return;

  tbody.innerHTML = clientesCacheV306.length ? clientesCacheV306.map(c => `
    <tr>
      <td><strong>${c.nome || '-'}</strong></td>
      <td>${c.telefone || '-'}</td>
      <td>${c.usuario || '-'}</td>
      <td>${formatDateBRV306(c.data_nascimento)}</td>
      <td>${formatDateBRV306(c.criado_em)}</td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum cliente encontrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="carregarClientesV306(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function formatDateBRV306(value) {
  if (!value) return '-';
  const d = String(value).slice(0,10).split('-');
  if (d.length !== 3) return value;
  return `${d[2]}/${d[1]}/${d[0]}`;
}

async function buscarTodosClientesV306() {
  const q = document.querySelector('#clienteBuscaV306')?.value || '';
  const mes = document.querySelector('#clienteMesV306')?.value || '';
  const result = await BrindartAPI.get(`/api/clientes?page=1&limit=10000&q=${encodeURIComponent(q)}&mes=${encodeURIComponent(mes)}`);
  return result.data || [];
}

async function exportarClientesCSVV306() {
  const clientes = await buscarTodosClientesV306();
  const rows = [['Nome','Telefone','Usuario','Data de nascimento','Criado em']];
  clientes.forEach(c => rows.push([c.nome || '', c.telefone || '', c.usuario || '', formatDateBRV306(c.data_nascimento), formatDateBRV306(c.criado_em)]));
  const csv = rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clientes-brindart.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function exportarClientesPDFV306() {
  const clientes = await buscarTodosClientesV306();
  const html = `
    <html>
    <head>
      <title>Clientes Brindart</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#333}
        h1{color:#E35F7A}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px;text-align:left}
        th{background:#FBE2E7}
      </style>
    </head>
    <body>
      <h1>Clientes Brindart Decore</h1>
      <p>Total: ${clientes.length}</p>
      <table>
        <thead><tr><th>Nome</th><th>Telefone</th><th>Usuário</th><th>Nascimento</th><th>Criado em</th></tr></thead>
        <tbody>
          ${clientes.map(c => `<tr><td>${c.nome || ''}</td><td>${c.telefone || ''}</td><td>${c.usuario || ''}</td><td>${formatDateBRV306(c.data_nascimento)}</td><td>${formatDateBRV306(c.criado_em)}</td></tr>`).join('')}
        </tbody>
      </table>
      <script>window.print();<\/script>
    </body>
    </html>
  `;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}



let produtosCacheV321 = [];
let produtosPageV321 = 1;
const produtosLimitV321 = 8;

async function carregarProdutosV305(page = 1) {
  produtosPageV321 = page;
  produtosPageV305 = page;

  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV321}`);
  produtosCacheV321 = result.data || [];

  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');

  if (!tbody || !pag) return;

  tbody.innerHTML = produtosCacheV321.length ? produtosCacheV321.map(p => `
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
        <button class="btn-admin-edit" onclick="editarProdutoV321(${p.id})">Editar</button>
        <button class="btn-admin-remove" onclick="removerProdutoV321(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="carregarProdutosV305(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function editarProdutoV321(id) {
  const p = produtosCacheV321.find(item => Number(item.id) === Number(id));

  if (!p) {
    alert('Produto não encontrado nesta página.');
    return;
  }

  const form = document.querySelector('#formProdutoV305');
  if (!form) return;

  let hidden = document.querySelector('#produtoEditIdV321');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'produtoEditIdV321';
    form.appendChild(hidden);
  }

  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';
  document.querySelector('#produtoDestaqueV305').checked = !!p.destaque;
  document.querySelector('#produtoPromocaoV305').checked = !!p.promocao;

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar produto';

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerProdutoV321(id) {
  if (!confirm('Remover produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  alert('Produto removido.');
  await carregarProdutosV305(produtosPageV321 || 1);
  await carregarMetricasV305();
}

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'formProdutoV305') return;

  e.preventDefault();
  e.stopImmediatePropagation();

  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  data.loja_id = 1;
  data.destaque = document.querySelector('#produtoDestaqueV305')?.checked || false;
  data.promocao = document.querySelector('#produtoPromocaoV305')?.checked || false;
  data.novidade = false;
  data.ativo = true;

  if (!data.categoria_id) data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || 1;
  if (!data.imagem) data.imagem = 'assets/img/produtos/home-produto-1.png';

  const editId = document.querySelector('#produtoEditIdV321')?.value;

  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, data);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', data);
    alert('Produto cadastrado com sucesso.');
  }

  form.reset();
  if (document.querySelector('#produtoEditIdV321')) document.querySelector('#produtoEditIdV321').value = '';

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar produto';

  await carregarProdutosV305(1);
  await carregarMetricasV305();

  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch (e) {}
    try { await carregarVitrineV30('promocao', 1); } catch (e) {}
  }
}, true);


let produtosCacheV323 = [];
let produtosPageV323 = 1;
const produtosLimitV323 = 8;

async function carregarProdutosV305(page = 1) {
  produtosPageV323 = page;
  produtosPageV305 = page;

  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV323}`);
  produtosCacheV323 = result.data || [];

  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');

  if (!tbody || !pag) return;

  tbody.innerHTML = produtosCacheV323.length ? produtosCacheV323.map(p => `
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
        <button class="btn-admin-edit" onclick="editarProdutoV323(${p.id})">Editar</button>
        <button class="btn-admin-remove" onclick="removerProdutoV323(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="carregarProdutosV305(${i})">${i}</button>`;
  }
  pag.innerHTML = html;
}

function editarProdutoV323(id) {
  const p = produtosCacheV323.find(item => Number(item.id) === Number(id));
  if (!p) return alert('Produto não encontrado nesta página.');

  const form = document.querySelector('#formProdutoV305');
  if (!form) return;

  let hidden = document.querySelector('#produtoEditIdV323');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'produtoEditIdV323';
    form.appendChild(hidden);
  }

  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';

  const destaque = document.querySelector('#produtoDestaqueV305');
  const promocao = document.querySelector('#produtoPromocaoV305');
  if (destaque) destaque.checked = !!Number(p.destaque);
  if (promocao) promocao.checked = !!Number(p.promocao);

  const submitBtn = form.querySelector('button');
  if (submitBtn) submitBtn.textContent = 'Atualizar produto';

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerProdutoV323(id) {
  if (!confirm('Remover produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  alert('Produto removido.');
  await carregarProdutosV305(produtosPageV323 || 1);
  if (typeof carregarMetricasV305 === 'function') await carregarMetricasV305();
}

async function salvarProdutoV323(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  data.loja_id = 1;
  data.destaque = !!document.querySelector('#produtoDestaqueV305')?.checked;
  data.promocao = !!document.querySelector('#produtoPromocaoV305')?.checked;
  data.novidade = false;
  data.ativo = true;

  if (!data.categoria_id) data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || 1;
  if (!data.imagem) data.imagem = 'assets/img/produtos/home-produto-1.png';

  const editId = document.querySelector('#produtoEditIdV323')?.value;

  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, data);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', data);
    alert('Produto cadastrado com sucesso.');
  }

  form.reset();
  if (document.querySelector('#produtoEditIdV323')) document.querySelector('#produtoEditIdV323').value = '';

  const submitBtn = form.querySelector('button');
  if (submitBtn) submitBtn.textContent = 'Salvar produto';

  await carregarProdutosV305(1);
  if (typeof carregarMetricasV305 === 'function') await carregarMetricasV305();
  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch (e) {}
    try { await carregarVitrineV30('promocao', 1); } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#formProdutoV305');
  if (form) {
    form.onsubmit = async (event) => {
      event.preventDefault();
      await salvarProdutoV323(form);
      return false;
    };
  }
});


async function carregarCategoriasProdutoV324() {
  const select = document.querySelector('#produtoCategoriaV305');
  if (!select) return;

  const categorias = await BrindartAPI.get('/api/categorias');
  select.innerHTML = '<option value="">Categoria</option>' + categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => carregarCategoriasProdutoV324(), 500);
});


let categoriasCacheV325 = [];
let produtosCacheV325 = [];
let produtosPageV325 = 1;
const produtosLimitV325 = 8;

async function carregarCategoriasProdutoV325() {
  const select = document.querySelector('#produtoCategoriaV305');
  if (!select) return;

  try {
    categoriasCacheV325 = await BrindartAPI.get('/api/categorias');
    select.innerHTML = '<option value="">Selecione a categoria</option>' + categoriasCacheV325.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  } catch (e) {
    select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
  }
}

async function carregarProdutosV305(page = 1) {
  produtosPageV325 = page;
  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV325}`);
  produtosCacheV325 = result.data || [];
  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');
  if (!tbody || !pag) return;

  tbody.innerHTML = produtosCacheV325.length ? produtosCacheV325.map(p => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" style="width:54px;height:54px;object-fit:cover;border-radius:12px">
          <div>
            <strong>${p.nome}</strong>
            <div class="small text-muted">${p.promocao ? 'Promoção' : ''} ${p.destaque ? 'Destaque' : ''}</div>
          </div>
        </div>
      </td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td>
        <a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a>
        <button class="btn-admin-edit" onclick="editarProdutoV325(${p.id})">Editar</button>
        <button class="btn-admin-remove" onclick="removerProdutoV325(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  pag.innerHTML = Array.from({ length: totalPages }).map((_, i) => {
    const n = i + 1;
    return `<button class="${n === page ? 'active' : ''}" onclick="carregarProdutosV305(${n})">${n}</button>`;
  }).join('');
}

function editarProdutoV325(id) {
  const p = produtosCacheV325.find(item => Number(item.id) === Number(id));
  if (!p) return alert('Produto não encontrado nesta página.');

  const form = document.querySelector('#formProdutoV305');
  if (!form) return;

  let hidden = document.querySelector('#produtoEditIdV325');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'produtoEditIdV325';
    form.appendChild(hidden);
  }

  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';

  const destaque = document.querySelector('#produtoDestaqueV305');
  const promocao = document.querySelector('#produtoPromocaoV305');
  if (destaque) destaque.checked = !!Number(p.destaque);
  if (promocao) promocao.checked = !!Number(p.promocao);

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar produto';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerProdutoV325(id) {
  if (!confirm('Remover produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  alert('Produto removido.');
  await carregarProdutosV305(produtosPageV325 || 1);
}

async function salvarProdutoV325(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.loja_id = 1;
  data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || data.categoria_id || '';
  data.destaque = !!document.querySelector('#produtoDestaqueV305')?.checked;
  data.promocao = !!document.querySelector('#produtoPromocaoV305')?.checked;
  data.novidade = false;
  data.ativo = true;

  if (!data.nome || !data.nome.trim()) return alert('Informe o nome do produto.');
  if (!data.categoria_id) return alert('Selecione uma categoria.');
  if (!data.imagem) data.imagem = 'assets/img/produtos/home-produto-1.png';

  const editId = document.querySelector('#produtoEditIdV325')?.value;

  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, data);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', data);
    alert('Produto cadastrado com sucesso.');
  }

  form.reset();
  if (document.querySelector('#produtoEditIdV325')) document.querySelector('#produtoEditIdV325').value = '';

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar produto';

  await carregarCategoriasProdutoV325();
  await carregarProdutosV305(1);

  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch (e) {}
    try { await carregarVitrineV30('promocao', 1); } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    await carregarCategoriasProdutoV325();
    await carregarProdutosV305(1);
    const form = document.querySelector('#formProdutoV305');
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await salvarProdutoV325(form);
        return false;
      };
    }
  }, 400);
});

let produtosCacheV326 = [];
let produtosPageV326 = 1;
const produtosLimitV326 = 8;

async function carregarCategoriasProdutoV326() {
  const select = document.querySelector('#produtoCategoriaV305');
  if (!select) return;
  try {
    const categorias = await BrindartAPI.get('/api/categorias');
    select.innerHTML = '<option value="">Selecione a categoria</option>' + (categorias || []).map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  } catch (e) {
    select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
  }
}

async function carregarProdutosV305(page = 1) {
  produtosPageV326 = page;
  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV326}`);
  produtosCacheV326 = result.data || [];
  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');
  if (!tbody || !pag) return;
  tbody.innerHTML = produtosCacheV326.length ? produtosCacheV326.map(p => `
    <tr>
      <td><div class="d-flex align-items-center gap-3"><img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" style="width:54px;height:54px;object-fit:cover;border-radius:12px"><div><strong>${p.nome}</strong><div class="small text-muted">${Number(p.promocao) ? 'Promoção' : ''} ${Number(p.destaque) ? 'Destaque' : ''}</div></div></div></td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td><a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a> <button class="btn-admin-edit" onclick="editarProdutoV326(${p.id})">Editar</button> <button class="btn-admin-remove" onclick="removerProdutoV326(${p.id})">Remover</button></td>
    </tr>`).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';
  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  pag.innerHTML = Array.from({length: totalPages}).map((_,i)=>`<button class="${i+1===page?'active':''}" onclick="carregarProdutosV305(${i+1})">${i+1}</button>`).join('');
}

function editarProdutoV326(id) {
  const p = produtosCacheV326.find(item => Number(item.id) === Number(id));
  if (!p) return alert('Produto não encontrado nesta página.');
  const form = document.querySelector('#formProdutoV305');
  if (!form) return;
  let hidden = document.querySelector('#produtoEditIdV326');
  if (!hidden) { hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.id = 'produtoEditIdV326'; form.appendChild(hidden); }
  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';
  const destaque = document.querySelector('#produtoDestaqueV305');
  const promocao = document.querySelector('#produtoPromocaoV305');
  if (destaque) destaque.checked = !!Number(p.destaque);
  if (promocao) promocao.checked = !!Number(p.promocao);
  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar produto';
  form.scrollIntoView({behavior:'smooth', block:'center'});
}

async function removerProdutoV326(id) {
  if (!confirm('Remover produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  alert('Produto removido.');
  await carregarProdutosV305(produtosPageV326 || 1);
}

async function salvarProdutoV326(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.loja_id = 1;
  data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || data.categoria_id || '';
  data.destaque = !!document.querySelector('#produtoDestaqueV305')?.checked;
  data.promocao = !!document.querySelector('#produtoPromocaoV305')?.checked;
  data.novidade = false;
  data.ativo = true;
  if (!data.nome || !data.nome.trim()) return alert('Informe o nome do produto.');
  if (!data.categoria_id) return alert('Selecione uma categoria.');
  if (!data.imagem) data.imagem = 'assets/img/produtos/home-produto-1.png';
  const editId = document.querySelector('#produtoEditIdV326')?.value;
  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, data);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', data);
    alert('Produto cadastrado com sucesso.');
  }
  form.reset();
  if (document.querySelector('#produtoEditIdV326')) document.querySelector('#produtoEditIdV326').value = '';
  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar produto';
  await carregarCategoriasProdutoV326();
  await carregarProdutosV305(1);
  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch (e) {}
    try { await carregarVitrineV30('promocao', 1); } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    await carregarCategoriasProdutoV326();
    await carregarProdutosV305(1);
    const form = document.querySelector('#formProdutoV305');
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await salvarProdutoV326(form);
        return false;
      };
    }
  }, 500);
});


let categoriasCacheV330 = [];
let produtosCacheV330 = [];
let produtosPageV330 = 1;
const produtosLimitV330 = 8;

async function carregarCategoriasProdutoV330() {
  const select = document.querySelector('#produtoCategoriaV305');
  if (!select) return;
  try {
    const categorias = await BrindartAPI.get('/api/categorias');
    categoriasCacheV330 = categorias || [];
    select.innerHTML = '<option value="">Selecione a categoria</option>' + categoriasCacheV330.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
  }
}

async function carregarProdutosV305(page = 1) {
  produtosPageV330 = page;
  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=${produtosLimitV330}`);
  produtosCacheV330 = result.data || [];
  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');
  if (!tbody || !pag) return;
  tbody.innerHTML = produtosCacheV330.length ? produtosCacheV330.map(p => `
    <tr>
      <td><div class="d-flex align-items-center gap-3"><img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" style="width:54px;height:54px;object-fit:cover;border-radius:12px"><div><strong>${p.nome}</strong><div class="small text-muted">${Number(p.promocao) ? 'Promoção' : ''} ${Number(p.destaque) ? 'Destaque' : ''}</div></div></div></td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td><a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a> <button class="btn-admin-edit" onclick="editarProdutoV330(${p.id})">Editar</button> <button class="btn-admin-remove" onclick="removerProdutoV330(${p.id})">Remover</button></td>
    </tr>`).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';
  const totalPages = Math.max(1, Math.ceil((result.total || 0) / result.limit));
  pag.innerHTML = Array.from({ length: totalPages }).map((_, i) => {
    const n = i + 1;
    return `<button class="${n === page ? 'active' : ''}" onclick="carregarProdutosV305(${n})">${n}</button>`;
  }).join('');
}

function editarProdutoV330(id) {
  const p = produtosCacheV330.find(item => Number(item.id) === Number(id));
  if (!p) return alert('Produto não encontrado nesta página.');
  const form = document.querySelector('#formProdutoV305');
  if (!form) return;
  let hidden = document.querySelector('#produtoEditIdV330');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'produtoEditIdV330';
    form.appendChild(hidden);
  }
  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = p.imagem || '';
  form.descricao.value = p.descricao || '';
  const destaque = document.querySelector('#produtoDestaqueV305');
  const promocao = document.querySelector('#produtoPromocaoV305');
  if (destaque) destaque.checked = !!Number(p.destaque);
  if (promocao) promocao.checked = !!Number(p.promocao);
  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar produto';
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerProdutoV330(id) {
  if (!confirm('Remover produto da loja?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  alert('Produto removido.');
  await carregarProdutosV305(produtosPageV330 || 1);
}

async function salvarProdutoV330(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  data.loja_id = 1;
  data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || data.categoria_id || '';
  data.destaque = !!document.querySelector('#produtoDestaqueV305')?.checked;
  data.promocao = !!document.querySelector('#produtoPromocaoV305')?.checked;
  data.novidade = false;
  data.ativo = true;
  if (!data.nome || !data.nome.trim()) return alert('Informe o nome do produto.');
  if (!data.categoria_id) return alert('Selecione uma categoria.');
  if (!data.imagem) data.imagem = 'assets/img/produtos/home-produto-1.png';
  const editId = document.querySelector('#produtoEditIdV330')?.value;
  if (editId) {
    await BrindartAPI.put('/api/produtos/' + editId, data);
    alert('Produto atualizado com sucesso.');
  } else {
    await BrindartAPI.post('/api/produtos', data);
    alert('Produto cadastrado com sucesso.');
  }
  form.reset();
  if (document.querySelector('#produtoEditIdV330')) document.querySelector('#produtoEditIdV330').value = '';
  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar produto';
  await carregarCategoriasProdutoV330();
  await carregarProdutosV305(1);
  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch (e) {}
    try { await carregarVitrineV30('promocao', 1); } catch (e) {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    await carregarCategoriasProdutoV330();
    await carregarProdutosV305(1);
    const form = document.querySelector('#formProdutoV305');
    if (form) {
      form.onsubmit = async event => {
        event.preventDefault();
        event.stopPropagation();
        await salvarProdutoV330(form);
        return false;
      };
    }
  }, 500);
});


function preencherCaminhoImagemV332(inputFile, fieldName) {
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;

  const form = inputFile.closest('form');
  const target = form?.querySelector(`[name="${fieldName}"]`);

  if (target) {
    target.value = `assets/img/produtos/${file.name}`;
  }
}

function preencherGaleriaEdicaoV332(produto, form) {
  let galeria = [];

  try {
    galeria = JSON.parse(produto.galeria || '[]');
  } catch {
    galeria = [];
  }

  if (form.imagem_2) form.imagem_2.value = galeria[1] || '';
  if (form.imagem_3) form.imagem_3.value = galeria[2] || '';
}

const editarProdutoV330OriginalV332 = typeof editarProdutoV330 === 'function' ? editarProdutoV330 : null;
if (editarProdutoV330OriginalV332) {
  editarProdutoV330 = function(id) {
    editarProdutoV330OriginalV332(id);
    const produto = produtosCacheV330.find(item => Number(item.id) === Number(id));
    const form = document.querySelector('#formProdutoV305');
    if (produto && form) preencherGaleriaEdicaoV332(produto, form);
  }
}


async function enviarImagemProdutoV333(inputFile, fieldName) {
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('imagem', file);

  try {
    const res = await fetch('/api/uploads/produto-imagem', {
      method: 'POST',
      headers: BrindartAPI.headers(false),
      body: formData
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Erro ao enviar imagem');

    const form = inputFile.closest('form');
    const target = form?.querySelector(`[name="${fieldName}"]`);
    if (target) target.value = data.path;
  } catch (err) {
    alert('Não foi possível enviar a imagem: ' + err.message);
  }
}

function preencherGaleriaProdutoV333(produto, form) {
  let galeria = [];

  try {
    galeria = JSON.parse(produto.galeria || '[]');
  } catch {
    galeria = [];
  }

  if (form.imagem) form.imagem.value = galeria[0] || produto.imagem || '';
  if (form.imagem_2) form.imagem_2.value = galeria[1] || '';
  if (form.imagem_3) form.imagem_3.value = galeria[2] || '';
}

const editarProdutoV330BaseV333 = typeof editarProdutoV330 === 'function' ? editarProdutoV330 : null;
if (editarProdutoV330BaseV333) {
  editarProdutoV330 = function(id) {
    editarProdutoV330BaseV333(id);
    const produto = produtosCacheV330.find(item => Number(item.id) === Number(id));
    const form = document.querySelector('#formProdutoV305');
    if (produto && form) preencherGaleriaProdutoV333(produto, form);
  };
}


async function enviarImagemProdutoV336(inputFile, fieldName) {
  const file = inputFile.files && inputFile.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('imagem', file);

  try {
    const res = await fetch('/api/uploads/produto-imagem', {
      method: 'POST',
      headers: BrindartAPI.headers(false),
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar imagem');

    const form = inputFile.closest('form');
    const target = form?.querySelector(`[name="${fieldName}"]`);
    if (target) target.value = data.path;
  } catch (err) {
    alert('Erro ao enviar imagem: ' + err.message);
  }
}

async function carregarCategoriasProdutoV336() {
  const select = document.querySelector('#produtoCategoriaV305');
  if (!select) return;

  try {
    const categorias = await BrindartAPI.get('/api/categorias');
    select.innerHTML = '<option value="">Selecione a categoria</option>' + (categorias || [])
      .map(c => `<option value="${c.id}">${c.nome}</option>`)
      .join('');
  } catch (err) {
    select.innerHTML = '<option value="">Erro ao carregar categorias</option>';
  }
}

async function carregarProdutosAdminV336(page = 1) {
  const tbody = document.querySelector('#produtosTabelaV305');
  const pag = document.querySelector('#produtosPaginacaoV305');
  if (!tbody || !pag) return;

  const result = await BrindartAPI.get(`/api/produtos?page=${page}&limit=8`);
  window.produtosCacheV336 = result.data || [];
  window.produtosPageV336 = page;

  tbody.innerHTML = window.produtosCacheV336.length ? window.produtosCacheV336.map(p => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" style="width:54px;height:54px;object-fit:cover;border-radius:12px">
          <div>
            <strong>${p.nome}</strong>
            <div class="small text-muted">${Number(p.promocao) ? 'Promoção' : ''} ${Number(p.destaque) ? 'Destaque' : ''}</div>
          </div>
        </div>
      </td>
      <td>${p.categoria_nome || '-'}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td>
        <a class="btn btn-sm btn-outline-dark rounded-pill" href="produto-detalhe.html?id=${p.id}">Ver</a>
        <button class="btn-admin-edit" type="button" onclick="editarProdutoV336(${p.id})">Editar</button>
        <button class="btn-admin-remove" type="button" onclick="removerProdutoV336(${p.id})">Remover</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado.</td></tr>';

  const totalPages = Math.max(1, Math.ceil((result.total || 0) / (result.limit || 8)));
  pag.innerHTML = Array.from({ length: totalPages }).map((_, i) => {
    const n = i + 1;
    return `<button class="${n === page ? 'active' : ''}" onclick="carregarProdutosAdminV336(${n})">${n}</button>`;
  }).join('');
}

function editarProdutoV336(id) {
  const p = (window.produtosCacheV336 || []).find(item => Number(item.id) === Number(id));
  if (!p) return alert('Produto não encontrado nesta página.');

  const form = document.querySelector('#formProdutoV305');
  if (!form) return;

  let hidden = document.querySelector('#produtoEditIdV336');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'produtoEditIdV336';
    form.appendChild(hidden);
  }

  let galeria = [];
  try { galeria = JSON.parse(p.galeria || '[]'); } catch {}

  hidden.value = p.id;
  form.nome.value = p.nome || '';
  form.preco.value = p.preco || '';
  form.preco_promocional.value = p.preco_promocional || '';
  if (form.desconto_percentual) form.desconto_percentual.value = '';
  form.categoria_id.value = p.categoria_id || '';
  form.estoque.value = p.estoque || 0;
  form.imagem.value = galeria[0] || p.imagem || '';
  if (form.imagem_2) form.imagem_2.value = galeria[1] || '';
  if (form.imagem_3) form.imagem_3.value = galeria[2] || '';
  form.descricao.value = p.descricao || '';

  const destaque = document.querySelector('#produtoDestaqueV305');
  const promocao = document.querySelector('#produtoPromocaoV305');

  if (destaque) destaque.checked = !!Number(p.destaque);
  if (promocao) promocao.checked = !!Number(p.promocao);

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar produto';

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function removerProdutoV336(id) {
  if (!confirm('Remover produto da loja?')) return;

  const res = await fetch('/api/produtos/' + id, { method: 'DELETE', headers: BrindartAPI.headers(false) });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(data.error || 'Erro ao remover produto.');
    return;
  }

  alert('Produto removido.');
  await carregarProdutosAdminV336(window.produtosPageV336 || 1);
}

async function salvarProdutoAdminV336(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  data.loja_id = 1;
  data.categoria_id = document.querySelector('#produtoCategoriaV305')?.value || data.categoria_id || '';
  data.destaque = !!document.querySelector('#produtoDestaqueV305')?.checked;
  data.promocao = !!document.querySelector('#produtoPromocaoV305')?.checked;
  data.novidade = false;
  data.ativo = true;

  if (!data.nome || !data.nome.trim()) return alert('Informe o nome do produto.');
  if (!data.categoria_id) return alert('Selecione uma categoria.');
  if (!data.imagem) return alert('Adicione a imagem principal do produto.');

  if (data.desconto_percentual && !data.preco_promocional) {
    const preco = Number(data.preco || 0);
    const desconto = Number(data.desconto_percentual || 0);
    if (preco > 0 && desconto > 0) {
      data.preco_promocional = (preco * (1 - desconto / 100)).toFixed(2);
    }
  }

  const editId = document.querySelector('#produtoEditIdV336')?.value;
  const url = editId ? '/api/produtos/' + editId : '/api/produtos';
  const method = editId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: BrindartAPI.headers(true),
    body: JSON.stringify(data)
  });

  const response = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(response.error || response.details || 'Erro ao salvar produto.');
    return;
  }

  alert(editId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');

  form.reset();
  if (document.querySelector('#produtoEditIdV336')) document.querySelector('#produtoEditIdV336').value = '';

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar produto';

  await carregarCategoriasProdutoV336();
  await carregarProdutosAdminV336(1);

  if (typeof carregarVitrineV30 === 'function') {
    try { await carregarVitrineV30('destaque', 1); } catch {}
    try { await carregarVitrineV30('promocao', 1); } catch {}
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(async () => {
    await carregarCategoriasProdutoV336();
    await carregarProdutosAdminV336(1);

    const form = document.querySelector('#formProdutoV305');
    if (form) {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        await salvarProdutoAdminV336(form);
        return false;
      }, true);
    }

    document.querySelectorAll('input[type="file"][onchange*="enviarImagemProdutoV333"], input[type="file"][onchange*="preencherCaminhoImagemV332"]').forEach(input => {
      const onchange = input.getAttribute('onchange') || '';
      const match = onchange.match(/'([^']+)'/g);
      const field = match && match.length ? match[match.length - 1].replaceAll("'", '') : 'imagem';
      input.setAttribute('onchange', `enviarImagemProdutoV336(this, '${field}')`);
    });
  }, 500);
});


let bannersCacheV337 = [];

async function carregarBannersAdminV337() {
  const lista = document.querySelector('#bannersListaV305, #listaBannersV305, #listaBanners, .banners-list');
  if (!lista) return;

  const result = await BrindartAPI.get('/api/banners?posicao=home');
  const banners = result.data || result || [];
  bannersCacheV337 = banners;

  lista.innerHTML = banners.length ? banners.map(b => `
    <div class="banner-admin-card-v337">
      <img src="${b.imagem}" alt="${b.titulo || 'Banner'}">
      <div>
        <strong>${b.titulo || 'Sem título'}</strong>
        <p>${b.subtitulo || ''}</p>
        <small>Ordem: ${b.ordem || 0}</small>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn-admin-edit" onclick="editarBannerV337(${b.id})">Editar</button>
        <button type="button" class="btn-admin-remove" onclick="removerBannerV337(${b.id})">Remover</button>
      </div>
    </div>
  `).join('') : '<p class="text-muted">Nenhum banner cadastrado.</p>';
}

function getBannerFormV337() {
  return document.querySelector('#formBannerV305, #bannerFormV305, #formBanner, form[data-form="banner"]');
}

function editarBannerV337(id) {
  const banner = bannersCacheV337.find(b => Number(b.id) === Number(id));
  const form = getBannerFormV337();

  if (!banner || !form) return;

  let hidden = document.querySelector('#bannerEditIdV337');
  if (!hidden) {
    hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = 'bannerEditIdV337';
    form.appendChild(hidden);
  }

  hidden.value = banner.id;

  if (form.titulo) form.titulo.value = banner.titulo || '';
  if (form.subtitulo) form.subtitulo.value = banner.subtitulo || '';
  if (form.imagem) form.imagem.value = banner.imagem || '';
  if (form.link) form.link.value = banner.link || 'produtos.html';
  if (form.ordem) form.ordem.value = banner.ordem || '';
  if (form.order) form.order.value = banner.ordem || '';

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Atualizar banner';

  form.scrollIntoView({ behavior:'smooth', block:'center' });
}

async function removerBannerV337(id) {
  if (!confirm('Remover banner do carrossel?')) return;

  const res = await fetch('/api/banners/' + id, { method:'DELETE', headers: BrindartAPI.headers(false) });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) return alert(data.error || data.details || 'Erro ao remover banner.');

  alert('Banner removido com sucesso.');
  await carregarBannersAdminV337();
}

async function salvarBannerAdminV337(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  data.posicao = 'home';
  data.titulo_botao = data.titulo_botao || data.botao || 'Ver produtos';
  data.ordem = data.ordem || data.order || 0;

  if (!data.imagem) {
    alert('Informe a imagem do banner.');
    return;
  }

  const editId = document.querySelector('#bannerEditIdV337')?.value;
  const url = editId ? '/api/banners/' + editId : '/api/banners';
  const method = editId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: BrindartAPI.headers(true),
    body: JSON.stringify(data)
  });

  const response = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(response.error || response.details || 'Erro ao salvar banner.');
    return;
  }

  alert(editId ? 'Banner atualizado com sucesso.' : 'Banner cadastrado com sucesso.');

  form.reset();

  if (document.querySelector('#bannerEditIdV337')) {
    document.querySelector('#bannerEditIdV337').value = '';
  }

  const btn = form.querySelector('button[type="submit"], button:not([type])');
  if (btn) btn.textContent = 'Salvar banner';

  await carregarBannersAdminV337();
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    carregarBannersAdminV337();

    const form = getBannerFormV337();
    if (form) {
      form.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        await salvarBannerAdminV337(form);
        return false;
      }, true);
    }
  }, 700);
});
