async function carregarItensCheckout() {
  const salvos = cartItems();
  const atualizados = [];

  for (const item of salvos) {
    try {
      const produto = await BrindartAPI.get('/api/produtos/' + item.id);
      const estoque = Number(produto.estoque || 0);
      const minimo = typeof quantidadeMinimaV44 === 'function' ? quantidadeMinimaV44(produto) : 1;
      let quantidade = Math.max(minimo, Number(item.quantidade || minimo));
      if (estoque >= minimo) quantidade = Math.min(quantidade, estoque);

      const precoBase = item.preco_configurado != null
        ? Number(item.preco_configurado)
        : (typeof precoFinalV38 === 'function' ? Number(precoFinalV38(produto)) : Number(produto.preco_promocional ?? produto.preco ?? 0));
      const precoInfo = typeof precoQuantidadeV44 === 'function'
        ? precoQuantidadeV44(produto, quantidade, precoBase)
        : {preco_unitario:precoBase,desconto_percentual:0};

      atualizados.push({
        id: produto.id,
        nome: produto.nome,
        referencia: produto.referencia || '',
        preco: Number(precoInfo.preco_unitario || 0),
        desconto_quantidade: Number(precoInfo.desconto_percentual || 0),
        imagem: produto.imagem,
        quantidade,
        estoque,
        variacao: item.variacao || '',
        personalizacao: item.personalizacao || '',
        config_calculadora: item.config_calculadora || item.config_laser || null,
        preco_configurado: item.preco_configurado != null ? Number(item.preco_configurado) : null
      });
    } catch (_) {}
  }

  localStorage.setItem('brindart_cart', JSON.stringify(atualizados));
  return atualizados;
}

async function renderResumoCheckout() {
  const items = await carregarItensCheckout();
  const resumo = document.querySelector('#checkoutResumo');
  const totalEl = document.querySelector('#checkoutTotal');

  if (!items.length) {
    resumo.innerHTML = '<div class="alert alert-light border">Seu carrinho está vazio.</div>';
    totalEl.textContent = formatMoney(0);
    return;
  }

  const total = items.reduce((sum, item) => sum + Number(item.preco) * Number(item.quantidade), 0);
  resumo.innerHTML = items.map(item => `
    <div class="d-flex justify-content-between border-bottom py-2">
      <span>${item.quantidade}x ${item.nome}${Number(item.estoque) <= 0 ? ' <small class="text-danger">(sem estoque)</small>' : ''}${item.referencia ? `<small class="d-block"><b>Ref.:</b> ${item.referencia}</small>` : ''}${item.variacao ? `<small class="d-block"><b>Modelo:</b> ${item.variacao}</small>` : ''}${item.personalizacao ? `<small class="d-block"><b>Personalização:</b> ${item.personalizacao}</small>` : ''}${item.config_calculadora ? `<small class="d-block"><b>Configuração:</b> ${item.config_calculadora.modelo} • ${item.config_calculadora.tipo_calculo === 'area_plana' ? `${item.config_calculadora.largura} x ${item.config_calculadora.altura} cm` : `${item.config_calculadora.largura} x ${item.config_calculadora.comprimento} x ${item.config_calculadora.altura} cm`} • ${item.config_calculadora.material} • ${item.config_calculadora.espessura}</small>` : ''}${Number(item.desconto_quantidade||0)>0 ? `<small class="d-block text-danger"><b>Desconto por quantidade:</b> ${Number(item.desconto_quantidade).toLocaleString('pt-BR')}%</small>` : ''}<small class="d-block"><b>Unitário:</b> ${formatMoney(item.preco)}</small></span>
      <strong>${formatMoney(item.preco * item.quantidade)}</strong>
    </div>
  `).join('');
  totalEl.textContent = formatMoney(total);
}

async function enviarPedido(e) {
  e.preventDefault();
  const submit = e.target.querySelector('button[type="submit"], button:not([type])');
  if (submit) submit.disabled = true;

  try {
    const items = cartItems();
    if (!items.length) return alert('Carrinho vazio.');

    const data = Object.fromEntries(new FormData(e.target).entries());
    data.itens = items;

    const pedido = await BrindartAPI.post('/api/pedidos', data);
    const itensConfirmados = Array.isArray(pedido.itens) ? pedido.itens : items;
    const linhas = itensConfirmados.map(item => {
      const nome = item.nome || item.nome_produto || 'Produto';
      const qtd = Number(item.quantidade || 1);
      const subtotal = Number(item.subtotal ?? (Number(item.preco || 0) * qtd));
      const original = item.config_calculadora || item.config_laser || item.variacao || item.personalizacao
        ? item
        : (items.find(x=>Number(x.id)===Number(item.id))||{});
      const calcCfg = item.config_calculadora || item.config_laser || original.config_calculadora || original.config_laser;
      const det=[
        calcCfg?`Configuração: ${calcCfg.modelo}, ${calcCfg.tipo_calculo === 'area_plana' ? `${calcCfg.largura}x${calcCfg.altura} cm` : `${calcCfg.largura}x${calcCfg.comprimento}x${calcCfg.altura} cm`}, ${calcCfg.material}, ${calcCfg.espessura}`:'',
        original.variacao?`Modelo: ${original.variacao}`:'',
        original.personalizacao?`Personalização: ${original.personalizacao}`:'',
        Number(item.desconto_quantidade || original.desconto_quantidade || 0)>0 ? `Desc. qtd.: ${Number(item.desconto_quantidade || original.desconto_quantidade).toLocaleString('pt-BR')}%` : ''
      ].filter(Boolean).join(' | ');
      return `- ${qtd}x ${(item.referencia || original.referencia) ? (item.referencia || original.referencia) + ' | ' : ''}${nome}${det?` (${det})`:''} | ${formatMoney(Number(item.preco || 0))} cada | Subtotal: ${formatMoney(subtotal)}`;
    }).join('\n');

    const msg = `Pedido #${pedido.id}\nCliente: ${data.cliente_nome}\nTelefone: ${data.cliente_telefone}\nEndereço: ${data.cliente_endereco || '-'}\nPagamento: ${data.pagamento || '-'}\n\n${linhas}\n\nTotal: ${formatMoney(pedido.total)}\nObs: ${data.observacoes || '-'}`;
    localStorage.removeItem('brindart_cart');
    window.open(`https://wa.me/${window.BRINDART_STATIC?.empresa?.whatsapp || '5537988259454'}?text=${encodeURIComponent(msg)}`, '_blank');
    alert('Pedido registrado com sucesso. Vamos abrir o WhatsApp para enviar os detalhes.');
    location.href = window.location.protocol === 'file:' ? 'index.html' : '/';
  } catch (err) {
    alert(err.message || 'Não foi possível concluir o pedido.');
    await renderResumoCheckout();
  } finally {
    if (submit) submit.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', renderResumoCheckout);
