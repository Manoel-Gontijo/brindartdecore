let carrinhoHidratadoV44 = [];

function formatMoneyCartV336(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

function getCartV336() {
  return JSON.parse(localStorage.getItem('brindart_cart') || localStorage.getItem('cart') || '[]');
}

function setCartV336(cart) {
  localStorage.setItem('brindart_cart', JSON.stringify(cart));
}

async function hydrateCartV336() {
  const raw = getCartV336();

  const items = [];
  for (const [cart_index, item] of raw.entries()) {
    if (!item || !item.id) continue;

    try {
      const produto = await BrindartAPI.get('/api/produtos/' + item.id);
      const minimoQtd = typeof quantidadeMinimaV44 === 'function' ? quantidadeMinimaV44(produto) : 1;
      items.push({
        ...produto,
        cart_index,
        quantidade: Math.max(minimoQtd, Number(item.quantidade || item.qtd || minimoQtd)),
        variacao: item.variacao || '',
        personalizacao: item.personalizacao || '',
        config_calculadora: item.config_calculadora || item.config_laser || null,
        config_calculadora_key: item.config_calculadora_key || item.config_laser_key || '',
        preco_configurado: item.preco_configurado != null ? Number(item.preco_configurado) : null
      });
    } catch {}
  }

  return items;
}

async function renderCarrinhoV336() {
  const list = document.querySelector('#cartItems, #carrinhoItens, .cart-items, #listaCarrinho');
  const totalBox = document.querySelector('#cartTotal, #totalCarrinho, .cart-total-value');

  if (!list) return;

  const items = await hydrateCartV336();
  carrinhoHidratadoV44 = items;

  if (!items.length) {
    list.innerHTML = '<div class="alert alert-light border rounded-4">Seu carrinho está vazio.</div>';
    if (totalBox) totalBox.textContent = formatMoneyCartV336(0);
    return;
  }

  let total = 0;

  list.innerHTML = items.map(item => {
    const precoBase = item.preco_configurado != null
      ? Number(item.preco_configurado)
      : (typeof precoFinalV38 === 'function' ? Number(precoFinalV38(item)) : Number(item.preco_promocional || item.preco || 0));
    const precoInfo = typeof precoQuantidadeV44 === 'function'
      ? precoQuantidadeV44(item, item.quantidade, precoBase)
      : {preco_unitario:precoBase,desconto_percentual:0};
    const preco = Number(precoInfo.preco_unitario || 0);
    const subtotal = preco * item.quantidade;
    total += subtotal;

    return `
      <div class="cart-line-v336">
        <img src="${item.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${item.nome}">
        <div class="cart-line-info-v336">
          <strong>${item.nome}</strong>
          ${item.referencia ? `<small style="display:block"><b>Ref.:</b> ${item.referencia}</small>` : ''}
          ${item.variacao ? `<small style="display:block"><b>Modelo:</b> ${item.variacao}</small>` : ''}
          ${item.personalizacao ? `<small style="display:block"><b>Personalização:</b> ${item.personalizacao}</small>` : ''}
          ${item.config_calculadora ? `<small style="display:block"><b>Configuração:</b> ${item.config_calculadora.modelo} • ${item.config_calculadora.tipo_calculo === 'area_plana' ? `${item.config_calculadora.largura} x ${item.config_calculadora.altura} cm` : `${item.config_calculadora.largura} x ${item.config_calculadora.comprimento} x ${item.config_calculadora.altura} cm`} • ${item.config_calculadora.material} • ${item.config_calculadora.espessura}</small>` : ''}
          <span>${formatMoneyCartV336(preco)} cada</span>
          ${Number(precoInfo.desconto_percentual || 0) > 0 ? `<small style="display:block;color:#b83f5b"><b>${Number(precoInfo.desconto_percentual).toLocaleString('pt-BR')}% de desconto por quantidade</b></small>` : ''}
          <small style="display:block"><b>Subtotal:</b> ${formatMoneyCartV336(subtotal)}</small>
        </div>
        <div class="cart-line-actions-v336">
          <button onclick="alterarQtdCarrinhoV336(${item.cart_index}, -1)">-</button>
          <b>${item.quantidade}</b>
          <button onclick="alterarQtdCarrinhoV336(${item.cart_index}, 1)">+</button>
          <button class="remove" onclick="removerCarrinhoV336(${item.cart_index})">Remover</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalBox) totalBox.textContent = formatMoneyCartV336(total);

  const summaryTotal = document.querySelector('.summary-total, #resumoTotal');
  if (summaryTotal) summaryTotal.textContent = formatMoneyCartV336(total);
}

function alterarQtdCarrinhoV336(index, delta) {
  const cart = getCartV336();
  const item = cart[Number(index)];
  if (!item) return;

  const produto = carrinhoHidratadoV44.find(x => Number(x.cart_index) === Number(index));
  const minimo = typeof quantidadeMinimaV44 === 'function' ? quantidadeMinimaV44(produto) : 1;
  item.quantidade = Math.max(minimo, Number(item.quantidade || minimo) + Number(delta || 0));
  setCartV336(cart);
  renderCarrinhoV336();
}

function removerCarrinhoV336(index) {
  const cart = getCartV336();
  cart.splice(Number(index), 1);
  setCartV336(cart);
  renderCarrinhoV336();
}

async function enviarCarrinhoWhatsAppV336() {
  const items = await hydrateCartV336();
  if (!items.length) return alert('Seu carrinho está vazio.');

  let total = 0;
  const blocos = items.map((item,idx) => {
    const precoBase = item.preco_configurado != null
      ? Number(item.preco_configurado)
      : (typeof precoFinalV38 === 'function' ? Number(precoFinalV38(item)) : Number(item.preco_promocional || item.preco || 0));
    const precoInfo = typeof precoQuantidadeV44 === 'function'
      ? precoQuantidadeV44(item, item.quantidade, precoBase)
      : {preco_unitario:precoBase,desconto_percentual:0};
    const preco = Number(precoInfo.preco_unitario || 0);
    const subtotal = preco * Number(item.quantidade||1);
    total += subtotal;

    const linhas=[
      `*${idx+1}. ${item.nome}*`,
      item.referencia ? `REF: ${item.referencia}` : '',
      item.config_calculadora ? `Medidas: ${item.config_calculadora.tipo_calculo === 'area_plana' ? `${item.config_calculadora.largura} x ${item.config_calculadora.altura} cm` : `${item.config_calculadora.largura} x ${item.config_calculadora.comprimento} x ${item.config_calculadora.altura} cm`}` : '',
      item.config_calculadora?.material ? `Material: ${item.config_calculadora.material}` : '',
      item.config_calculadora?.espessura ? `Espessura: ${item.config_calculadora.espessura}` : '',
      item.variacao ? `Modelo/Opção: ${item.variacao}` : '',
      item.personalizacao ? `Personalização: ${item.personalizacao}` : '',
      `Quantidade: ${item.quantidade}`,
      `Valor unitário: ${formatMoneyCartV336(preco)}`,
      Number(precoInfo.desconto_percentual||0)>0 ? `Desconto por quantidade: ${Number(precoInfo.desconto_percentual).toLocaleString('pt-BR')}%` : '',
      `Subtotal: ${formatMoneyCartV336(subtotal)}`
    ].filter(Boolean);
    return linhas.join('\n');
  });

  const mensagem=[
    'Olá! Gostaria de solicitar este orçamento/pedido na *Brindart Decore*:',
    '',
    blocos.join('\n\n--------------------\n\n'),
    '',
    `*TOTAL ESTIMADO: ${formatMoneyCartV336(total)}*`,
    '',
    'Podem confirmar disponibilidade e prazo de produção?'
  ].join('\n');

  const numero=String(window.BRINDART_STATIC?.empresa?.whatsapp || '5537988259454').replace(/\D/g,'');
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCarrinhoV336();

  document.querySelectorAll('a[href*="wa.me"], button').forEach(el => {
    const txt = (el.textContent || '').toLowerCase();
    if (txt.includes('whatsapp') || txt.includes('finalizar')) {
      el.onclick = e => {
        e.preventDefault();
        enviarCarrinhoWhatsAppV336();
      };
    }
  });
});

// Compatibilidade com botões antigos do projeto
function finalizarWhatsApp() {
  return enviarCarrinhoWhatsAppV336();
}
