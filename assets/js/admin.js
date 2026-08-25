let adminToken = localStorage.getItem('brindart_admin_token');

function setAdminView() {
  document.querySelector('#loginBox').classList.toggle('d-none', !!adminToken);
  document.querySelector('#adminPanel').classList.toggle('d-none', !adminToken);
}

async function loginAdmin(e) {
  e.preventDefault();
  try {
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = await BrindartAPI.post('/api/auth/login', data);
    adminToken = res.token;
    localStorage.setItem('brindart_admin_token', adminToken);
    setAdminView();
    carregarAdmin();
  } catch {
    alert('Login inválido.');
  }
}

function logoutAdmin() {
  localStorage.removeItem('brindart_admin_token');
  adminToken = null;
  setAdminView();
}

async function carregarAdmin() {
  if (!adminToken) return;
  const produtos = await BrindartAPI.get('/api/produtos?limit=100');
  const categorias = await BrindartAPI.get('/api/categorias');
  const lojas = await BrindartAPI.get('/api/lojas');
  const pedidos = await BrindartAPI.get('/api/pedidos');

  document.querySelector('#metricProdutos').textContent = produtos.total;
  document.querySelector('#metricLojas').textContent = lojas.length;
  document.querySelector('#metricPedidos').textContent = pedidos.length;
  document.querySelector('#metricCategorias').textContent = categorias.length;

  document.querySelector('#produtoCategoria').innerHTML = categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  document.querySelector('#produtoLoja').innerHTML = lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');

  document.querySelector('#adminProdutos').innerHTML = produtos.data.map(p => `
    <tr>
      <td><img src="${p.imagem}" style="width:48px;height:48px;object-fit:cover;border-radius:10px"></td>
      <td>${p.nome}</td>
      <td>${p.categoria_nome || ''}</td>
      <td>${formatMoney(p.preco_promocional || p.preco)}</td>
      <td>${p.loja_nome || ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="removerProduto(${p.id})">Desativar</button>
      </td>
    </tr>
  `).join('');

  document.querySelector('#adminPedidos').innerHTML = pedidos.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>${p.cliente_nome}</td>
      <td>${p.cliente_telefone}</td>
      <td>${formatMoney(p.total)}</td>
      <td>${p.status}</td>
      <td>
        <button class="btn btn-sm btn-success rounded-pill" onclick="statusPedido(${p.id}, 'APROVADO')">Aprovar</button>
      </td>
    </tr>
  `).join('');
}

async function salvarProdutoAdmin(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.destaque = document.querySelector('#produtoDestaque').checked;
  data.novidade = document.querySelector('#produtoNovidade').checked;
  data.categoria_id = Number(data.categoria_id);
  data.loja_id = Number(data.loja_id);
  await BrindartAPI.post('/api/produtos', data);
  e.target.reset();
  carregarAdmin();
}

async function removerProduto(id) {
  if (!confirm('Desativar produto?')) return;
  await BrindartAPI.delete('/api/produtos/' + id);
  carregarAdmin();
}

async function statusPedido(id, status) {
  await BrindartAPI.put(`/api/pedidos/${id}/status`, { status });
  carregarAdmin();
}

document.addEventListener('DOMContentLoaded', () => {
  setAdminView();
  carregarAdmin();
});