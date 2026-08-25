async function initLojas() {
  const lojas = await BrindartAPI.get('/api/lojas');
  document.querySelector('#lojasGrid').innerHTML = lojas.map(loja => `
    <div class="col">
      <article class="store-card">
        <div class="d-flex align-items-center gap-3">
          <img class="store-avatar" src="${loja.avatar}" alt="${loja.nome}">
          <div>
            <h2 class="h5 fw-bold mb-1">${loja.nome}</h2>
            <p class="text-muted mb-1">${loja.cidade || ''}</p>
            <div class="stars">${stars(loja.avaliacao)}</div>
          </div>
        </div>
        <p class="text-muted mt-3">${loja.descricao || ''}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="small text-muted">${loja.vendas} vendas</span>
          <a class="btn btn-black rounded-pill" href="loja-detalhe.html?id=${loja.id}">Visitar</a>
        </div>
      </article>
    </div>
  `).join('');
}

async function initLojaDetalhe() {
  const id = getParams().get('id');
  const loja = await BrindartAPI.get('/api/lojas/' + id);
  document.querySelector('#lojaInfo').innerHTML = `
    <div class="page-hero">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <img class="store-avatar" src="${loja.avatar}" alt="${loja.nome}">
        <div>
          <h1 class="display-5 fw-bold mb-1">${loja.nome}</h1>
          <p class="mb-1">${loja.cidade || ''}</p>
          <div class="stars">${stars(loja.avaliacao)} <span class="text-white-50">${loja.vendas} vendas</span></div>
        </div>
      </div>
      <p class="mt-3 mb-0">${loja.descricao || ''}</p>
    </div>`;
  document.querySelector('#produtosLoja').innerHTML = loja.produtos.map(productCard).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('#lojasGrid')) initLojas();
  if (document.querySelector('#lojaInfo')) initLojaDetalhe();
});