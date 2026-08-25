function formatMoneyDetailV331(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

function getProdutoReferenciaV353() {
  const pathname = String(window.location.pathname || '');
  const match = pathname.match(/^(?:\/publicar)?\/produto\/([^/]+)\/?(?:index\.html)?$/);
  if (match) return { tipo: 'slug', valor: decodeURIComponent(match[1]) };

  // Fallback para site instalado em subpasta.
  const partes = pathname.split('/').filter(Boolean);
  const posProduto = partes.lastIndexOf('produto');
  if (posProduto >= 0 && partes[posProduto + 1]) {
    return { tipo: 'slug', valor: decodeURIComponent(partes[posProduto + 1]) };
  }

  const id = new URLSearchParams(window.location.search).get('id');
  return id ? { tipo: 'id', valor: id } : null;
}

async function carregarProdutoDetalheV331() {
  const referencia = getProdutoReferenciaV353();
  const box = document.querySelector('#produtoDetalheV331');

  if (!referencia) {
    box.innerHTML = '<div class="alert alert-warning">Produto não informado.</div>';
    return;
  }

  try {
    const produto = await BrindartAPI.get(referencia.tipo === 'slug' ? '/api/produtos/slug/' + encodeURIComponent(referencia.valor) : '/api/produtos/' + encodeURIComponent(referencia.valor));
    document.title = `${produto.nome} - Brindart Decore ♡`;
    const calcConfigV43 = produto.calculadora_config || produto.laser_config || null;
    const calculadoraAtivaV43 = Number(calcConfigV43?.ativo || 0) === 1 &&
      (produto.tipo_precificacao === 'calculadora' || produto.tipo_precificacao === 'laser_area');

    let galeria = [];
    try {
      galeria = JSON.parse(produto.galeria || '[]');
    } catch {
      galeria = [];
    }

    if (!galeria.length) {
      galeria = [produto.imagem || 'assets/img/produtos/home-produto-1.png'];
    }

    galeria = galeria.filter(Boolean).slice(0, 8);

    const precoOriginal = Number(produto.preco || 0);
    const precoFinal = typeof precoFinalV38 === 'function' ? precoFinalV38(produto) : Number(produto.preco_promocional || produto.preco || 0);
    const preco = precoFinal;
    const descontoPercentual = typeof descontoAtivoV38 === 'function' && descontoAtivoV38(produto)
      ? Number(produto.desconto_percentual || 0)
      : (produto.preco_promocional && precoOriginal > precoFinal
          ? Math.round(((precoOriginal - precoFinal) / precoOriginal) * 100)
          : 0);
    const estoqueAtual = Number(produto.estoque || 0);
    const semEstoque = estoqueAtual <= 0;
    const whatsappTexto = encodeURIComponent(
      `Olá! Tenho interesse no produto: ${produto.nome}\nValor: ${formatMoneyDetailV331(preco)}`
    );

    box.innerHTML = `
      <div class="product-detail-layout-v334">
        <div class="product-gallery-v334">
          <div class="product-main-image-wrap-v334">
            <img id="produtoImagemPrincipalV334" src="${galeria[0]}" alt="${produto.nome}">
          </div>

          <div class="product-thumbs-v334">
            ${galeria.map((img, index) => `
              <img class="${index === 0 ? 'active' : ''}" src="${img}" onclick="trocarImagemProdutoV334('${img}', this)" alt="${produto.nome}">
            `).join('')}
          </div>
        </div>

        <div class="product-info-v334">
          <span class="product-category-badge-v334">${produto.categoria_nome || 'Produto artesanal'}</span>${descontoPercentual ? `<span class="discount-badge-v336">-${descontoPercentual}% OFF</span>` : ''}
          ${Number(produto.destaque_ativo || 0) === 1 ? `<div class="detail-highlight-plaque-v38"><i class="bi bi-stars"></i> ${produto.destaque_texto || 'DESTAQUE'}</div>` : ''}
          <h1>${produto.nome}</h1>
          ${produto.referencia ? `<div class="detail-ref-v40"><i class="bi bi-upc-scan"></i> Ref.: <strong>${produto.referencia}</strong></div>` : ''}

          <p class="product-description-v334">
            ${produto.descricao || 'Produto artesanal personalizado da Brindart Decore.'}
          </p>

          <div>
            ${descontoPercentual ? `<div class="product-old-price-v334">${formatMoneyDetailV331(produto.preco)}</div>` : ''}
            <div id="produtoPrecoPrincipalV42" class="product-price-v334">${calculadoraAtivaV43 ? 'A partir de ' : ''}${formatMoneyDetailV331(preco)}</div>
          </div>

          <div class="product-meta-v334">
            <div><strong>Estoque:</strong> ${estoqueAtual}</div>
            <div><strong>Categoria:</strong> ${produto.categoria_nome || '-'}</div>
          </div>

          ${calculadoraAtivaV43 ? `
            <div class="laser-config-v42" id="laserConfigV42">
              <div class="laser-config-title-v42"><i class="bi bi-calculator"></i> Calcule seu produto</div>

              <div class="laser-mode-v42">
                <label class="laser-mode-option-v42">
                  <input type="radio" name="laserModoV42" value="padrao" checked onchange="trocarModoLaserV42()">
                  <span>Modelo padronizado</span>
                </label>
                <label class="laser-mode-option-v42">
                  <input type="radio" name="laserModoV42" value="personalizado" onchange="trocarModoLaserV42()">
                  <span>Medida personalizada</span>
                </label>
              </div>

              <div id="laserPadraoV42">
                <label class="form-label fw-bold">Escolha o tamanho</label>
                <select id="laserModeloV42" class="form-select" onchange="recalcularLaserV42()">
                  ${(calcConfigV43.modelos_padrao || []).map((m,i)=>`
                    <option value="${i}">${m.nome}</option>
                  `).join('')}
                </select>
              </div>

              <div id="laserPersonalizadoV42" class="d-none">
                <label class="form-label fw-bold">Informe as medidas (cm)</label>
                <div class="row g-2">
                  <div class="${calcConfigV43.tipo === 'caixa_3d' ? 'col-4' : 'col-6'}">
                    <input id="laserLarguraV42" type="number" min="1" step="0.1" class="form-control" value="15" placeholder="Largura" oninput="recalcularLaserV42()">
                    <small>Largura</small>
                  </div>
                  ${calcConfigV43.tipo === 'caixa_3d' ? `
                    <div class="col-4">
                      <input id="laserComprimentoV42" type="number" min="1" step="0.1" class="form-control" value="15" placeholder="Comprimento" oninput="recalcularLaserV42()">
                      <small>Comprimento</small>
                    </div>` : ''}
                  <div class="${calcConfigV43.tipo === 'caixa_3d' ? 'col-4' : 'col-6'}">
                    <input id="laserAlturaV42" type="number" min="1" step="0.1" class="form-control" value="${calcConfigV43.tipo === 'caixa_3d' ? '8' : '12'}" placeholder="${calcConfigV43.tipo === 'caixa_3d' ? 'Altura' : 'Altura'}" oninput="recalcularLaserV42()">
                    <small>${calcConfigV43.tipo === 'caixa_3d' ? 'Altura da caixa' : 'Altura'}</small>
                  </div>
                </div>
              </div>

              <div class="row g-2 mt-2">
                <div class="col-md-7">
                  <label class="form-label fw-bold">Material</label>
                  <select id="laserMaterialV42" class="form-select" onchange="atualizarEspessurasLaserV42();recalcularLaserV42()">
                    ${(calcConfigV43.materiais || []).map((m,i)=>`<option value="${i}">${m.nome}</option>`).join('')}
                  </select>
                </div>
                <div class="col-md-5">
                  <label class="form-label fw-bold">Espessura</label>
                  <select id="laserEspessuraV42" class="form-select" onchange="recalcularLaserV42()"></select>
                </div>
              </div>

              <div class="laser-price-box-v42">
                <span>Valor calculado</span>
                <strong id="laserPrecoV42">Calculando...</strong>
                <small id="laserResumoV42">Escolha as opções acima.</small>
              </div>

              <div class="laser-note-v42">
                <i class="bi bi-info-circle"></i>
                O valor é atualizado automaticamente conforme as medidas e as opções escolhidas.
              </div>
            </div>
          ` : ''}

          ${Array.isArray(produto.variacoes) && produto.variacoes.length ? `
            <div class="personalizacao-v33" style="margin-top:18px;padding:16px;border:1px solid #f2d7dc;border-radius:16px;background:#fffafa">
              <strong style="display:block;margin-bottom:10px">${produto.titulo_variacao || 'Escolha uma opção'}</strong>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                ${produto.variacoes.map((v,index)=>`
                  <button type="button" class="personalizacao-opcao-v33 ${index===0?'active':''}"
                    data-nome="${v.nome}" data-imagem="${v.imagem || ''}"
                    onclick="selecionarVariacaoV33(this)"
                    style="border:1px solid #e8b9c3;background:#fff;border-radius:999px;padding:8px 14px">
                    ${v.nome}
                  </button>`).join('')}
              </div>
              ${produto.permite_personalizacao ? `
                <label style="display:block;font-weight:700;margin:14px 0 8px">Nome, frase ou observação</label>
                <input id="personalizacaoTextoV33" class="form-control" maxlength="120"
                  placeholder="Ex.: nome Maria, cor desejada, observação...">` : ''}
            </div>` : ''}

          ${Number(produto.quantidade_config?.ativo || 0) === 1 ? `
            <div class="quantity-pricing-v44">
              <div class="quantity-pricing-head-v44">
                <div>
                  <strong><i class="bi bi-boxes"></i> Quantidade</strong>
                  <small>Quantidade mínima: ${Math.max(1,Number(produto.quantidade_config.minimo || 1))}</small>
                </div>
                <div class="quantity-input-v44">
                  <button type="button" onclick="alterarQuantidadeDetalheV44(-1)">−</button>
                  <input id="quantidadeProdutoV44" type="number"
                    min="${Math.max(1,Number(produto.quantidade_config.minimo || 1))}"
                    value="${Math.max(1,Number(produto.quantidade_config.minimo || 1))}"
                    onchange="normalizarQuantidadeDetalheV44();atualizarPrecoQuantidadeDetalheV44()"
                    oninput="atualizarPrecoQuantidadeDetalheV44()">
                  <button type="button" onclick="alterarQuantidadeDetalheV44(1)">+</button>
                </div>
              </div>

              ${(produto.quantidade_config.faixas || []).length ? `
                <div class="quantity-tiers-v44">
                  ${(produto.quantidade_config.faixas || []).map(f=>`
                    <div>
                      <b>A partir de ${f.minimo} un.</b>
                      <span>${produto.quantidade_config.modo === 'preco_unitario'
                        ? `${formatMoneyDetailV331(f.valor)} cada`
                        : `${Number(f.valor)}% de desconto`}</span>
                    </div>
                  `).join('')}
                </div>` : ''}

              <div class="quantity-total-v44">
                <span id="quantidadePrecoUnitV44">Preço unitário: —</span>
                <strong id="quantidadeTotalV44">Total: —</strong>
                <small id="quantidadeEconomiaV44"></small>
              </div>
            </div>
          ` : ''}

          ${semEstoque ? `<div class="stock-warning-client-v349"><i class="bi bi-exclamation-triangle"></i> Produto sem estoque no momento. Fale conosco pelo WhatsApp para consultar previsão ou encomenda personalizada.</div>` : ''}

          <div class="product-actions-v334">
            <button class="btn btn-gold rounded-pill px-4" ${semEstoque ? 'disabled title="Produto sem estoque"' : `onclick="adicionarAoCarrinhoDetalheV331(${produto.id})"`}>
              <i class="bi bi-cart-plus"></i> ${semEstoque ? 'Sem estoque' : 'Adicionar ao carrinho'}
            </button>

            <button type="button" class="btn btn-outline-danger rounded-pill px-4" onclick="comprarWhatsAppPersonalizadoV33(${produto.id})">
              <i class="bi bi-whatsapp"></i> Comprar pelo WhatsApp
            </button>

            <a class="btn btn-outline-dark rounded-pill px-4" href="${categoryUrlV353(produto.categoria_slug || '')}">
              Ver categoria
            </a>

            <button type="button" class="btn btn-outline-dark rounded-pill px-4" onclick="compartilharProdutoV37(${produto.id})">
              <i class="bi bi-share"></i> Compartilhar
            </button>

            <button type="button" class="btn btn-outline-dark rounded-pill px-4 favorite-detail-v45 ${typeof isFavoriteV45==='function'&&isFavoriteV45(produto.id)?'active':''}" data-favorite-id="${produto.id}" onclick="toggleFavorite(${produto.id})">
              <i class="bi ${typeof isFavoriteV45==='function'&&isFavoriteV45(produto.id)?'bi-heart-fill':'bi-heart'}"></i> Favoritar
            </button>
          </div>

          <div class="social-product-v37">
            <span>Siga a Brindart:</span>
            ${window.BRINDART_STATIC?.empresa?.instagram ? `
              <a href="${window.BRINDART_STATIC.empresa.instagram}" target="_blank" rel="noopener" aria-label="Instagram">
                <i class="bi bi-instagram"></i>
              </a>` : ''}
            ${window.BRINDART_STATIC?.empresa?.facebook ? `
              <a href="${window.BRINDART_STATIC.empresa.facebook}" target="_blank" rel="noopener" aria-label="Facebook">
                <i class="bi bi-facebook"></i>
              </a>` : ''}
          </div>
        </div>
      </div>
    `;

    produtoQuantidadeAtualV44 = produto;
    if (calculadoraAtivaV43) {
      inicializarLaserV42(produto);
    }
    if (Number(produto.quantidade_config?.ativo || 0) === 1) {
      atualizarPrecoQuantidadeDetalheV44();
    }

    await carregarRelacionadosV331(produto);
  } catch (err) {
    box.innerHTML = '<div class="alert alert-danger">Não foi possível carregar o produto.</div>';
  }
}

async function carregarRelacionadosV331(produto) {
  const box = document.querySelector('#produtosRelacionadosV331');
  if (!box) return;

  try {
    const result = await BrindartAPI.get('/api/produtos?limit=500');
    const todos=(result.data||[]).filter(p=>Number(p.id)!==Number(produto.id) && Number(p.ativo??1)===1);

    const mesmaCategoria=todos.filter(p =>
      (produto.categoria_slug && p.categoria_slug===produto.categoria_slug) ||
      (produto.categoria_id && Number(p.categoria_id)===Number(produto.categoria_id))
    );

    const palavras=String(produto.nome||'').toLowerCase().split(/\s+/).filter(x=>x.length>3);
    const semelhantes=todos.filter(p =>
      !mesmaCategoria.some(x=>Number(x.id)===Number(p.id)) &&
      palavras.some(w=>String(p.nome||'').toLowerCase().includes(w))
    );

    const restantes=todos.filter(p =>
      !mesmaCategoria.some(x=>Number(x.id)===Number(p.id)) &&
      !semelhantes.some(x=>Number(x.id)===Number(p.id))
    );

    const relacionados=[...mesmaCategoria,...semelhantes,...restantes].slice(0,4);

    if (!relacionados.length) {
      box.innerHTML = '<p class="text-muted">Novidades serão adicionadas em breve.</p>';
      return;
    }

    box.innerHTML = relacionados.map(p => `
      <div class="related-wrap-v46">
        <button type="button" class="favorite-toggle-v45 related-fav-v46 ${typeof isFavoriteV45==='function'&&isFavoriteV45(p.id)?'active':''}"
          data-favorite-id="${p.id}" onclick="toggleFavorite(${p.id})" aria-label="Favoritar">
          <i class="bi ${typeof isFavoriteV45==='function'&&isFavoriteV45(p.id)?'bi-heart-fill':'bi-heart'}"></i>
        </button>
        <a class="related-card-v334" href="${productUrlV353(p)}">
          <img src="${p.imagem || 'assets/img/produtos/home-produto-1.png'}" alt="${p.nome}" loading="lazy">
          <strong>${p.nome}</strong>
          <small class="text-muted">${p.referencia ? 'REF: '+p.referencia : ''}</small>
          <span>${(p.tipo_precificacao === 'calculadora' || p.tipo_precificacao === 'laser_area') && (p.calculadora_config?.ativo || p.laser_config?.ativo) ? 'A partir de ' : ''}${formatMoneyDetailV331(p.preco_promocional || p.preco)}</span>
        </a>
      </div>
    `).join('');

    if(typeof updateFavoriteButtonsV45==='function') updateFavoriteButtonsV45();
  } catch(e) {
    box.innerHTML='<p class="text-muted">Veja também outros produtos da nossa loja.</p>';
  }
}

function trocarImagemProdutoV334(src, element) {
  const img = document.querySelector('#produtoImagemPrincipalV334');
  if (img) img.src = src;

  document.querySelectorAll('.product-thumbs-v334 img').forEach(item => item.classList.remove('active'));
  if (element) element.classList.add('active');
}



let produtoQuantidadeAtualV44 = null;

function quantidadeSelecionadaV44() {
  const produto = produtoQuantidadeAtualV44;
  const minimo = typeof quantidadeMinimaV44 === 'function' ? quantidadeMinimaV44(produto) : 1;
  const input = document.querySelector('#quantidadeProdutoV44');
  return Math.max(minimo, Number(input?.value || minimo));
}

function normalizarQuantidadeDetalheV44() {
  const input = document.querySelector('#quantidadeProdutoV44');
  if (!input) return;
  const minimo = typeof quantidadeMinimaV44 === 'function'
    ? quantidadeMinimaV44(produtoQuantidadeAtualV44)
    : Math.max(1, Number(input.min || 1));
  input.value = Math.max(minimo, Math.floor(Number(input.value || minimo)));
}

function alterarQuantidadeDetalheV44(delta) {
  const input = document.querySelector('#quantidadeProdutoV44');
  if (!input) return;
  const minimo = typeof quantidadeMinimaV44 === 'function'
    ? quantidadeMinimaV44(produtoQuantidadeAtualV44)
    : 1;
  input.value = Math.max(minimo, Number(input.value || minimo) + Number(delta || 0));
  atualizarPrecoQuantidadeDetalheV44();
}

function precoBaseAtualV44() {
  const produto = produtoQuantidadeAtualV44;
  if (!produto) return 0;
  const calc = selecaoLaserAtualV42;
  if (calc && Number(calc.preco) >= 0) return Number(calc.preco);
  return typeof precoFinalV38 === 'function'
    ? Number(precoFinalV38(produto))
    : Number(produto.preco_promocional || produto.preco || 0);
}

function atualizarPrecoQuantidadeDetalheV44() {
  const produto = produtoQuantidadeAtualV44;
  if (!produto) return null;

  const qtd = quantidadeSelecionadaV44();
  const base = precoBaseAtualV44();
  const r = typeof precoQuantidadeV44 === 'function'
    ? precoQuantidadeV44(produto, qtd, base)
    : {preco_unitario:base,desconto_percentual:0,faixa:null};

  const unit = Number(r.preco_unitario || 0);
  const total = Math.round(unit * qtd * 100) / 100;
  const originalTotal = Math.round(base * qtd * 100) / 100;

  const principal = document.querySelector('#produtoPrecoPrincipalV42');
  if (principal) principal.textContent = formatMoneyDetailV331(unit);

  const unitEl = document.querySelector('#quantidadePrecoUnitV44');
  const totalEl = document.querySelector('#quantidadeTotalV44');
  const economiaEl = document.querySelector('#quantidadeEconomiaV44');

  if (unitEl) unitEl.textContent = `Preço unitário: ${formatMoneyDetailV331(unit)}`;
  if (totalEl) totalEl.textContent = `Total (${qtd} un.): ${formatMoneyDetailV331(total)}`;

  if (economiaEl) {
    const economia = Math.max(0, originalTotal - total);
    economiaEl.textContent = economia > 0
      ? `Você economiza ${formatMoneyDetailV331(economia)} nesta quantidade.`
      : '';
  }

  return {
    quantidade:qtd,
    preco_unitario:unit,
    total,
    desconto_percentual:r.desconto_percentual || 0,
    faixa:r.faixa || null
  };
}

let produtoLaserAtualV42 = null;
let selecaoLaserAtualV42 = null;

function calcularAreaCaixaV42(larguraCm, comprimentoCm, alturaCm, config) {
  const L = Math.max(0, Number(larguraCm || 0)) / 100;
  const C = Math.max(0, Number(comprimentoCm || 0)) / 100;
  const A = Math.max(0, Number(alturaCm || 0)) / 100;
  const fatorPerda = Math.max(1, Number(config?.fator_perda || 1));

  if ((config?.tipo || 'caixa_3d') === 'area_plana') {
    return Math.round((L * A) * fatorPerda * 10000) / 10000;
  }

  const bases = Number(config?.com_tampa ?? 1) === 1 ? (2 * L * C) : (L * C);
  const laterais = (2 * L * A) + (2 * C * A);
  return Math.round((bases + laterais) * fatorPerda * 10000) / 10000;
}

function faixaM2LaserV42(area, config) {
  if ((config?.modo_preco_m2 || 'faixas') === 'unico') {
    return Number(config?.valor_m2 || 0);
  }
  const faixas = Array.isArray(config?.faixas_m2) ? config.faixas_m2 : [];
  for (const faixa of faixas) {
    if (faixa.ate == null || area <= Number(faixa.ate)) return Number(faixa.valor_m2 || 0);
  }
  return Number(config?.valor_m2 || 0);
}

function atualizarEspessurasLaserV42() {
  if (!produtoLaserAtualV42) return;
  const config = produtoLaserAtualV42.calculadora_config || produtoLaserAtualV42.laser_config || {};
  const matIndex = Number(document.querySelector('#laserMaterialV42')?.value || 0);
  const material = config.materiais?.[matIndex];
  const select = document.querySelector('#laserEspessuraV42');
  if (!select || !material) return;
  const atual = select.value;
  select.innerHTML = (material.espessuras || []).map((e,i)=>`<option value="${i}">${e.nome}</option>`).join('');
  if ([...select.options].some(o => o.value === atual)) select.value = atual;
}

function trocarModoLaserV42() {
  const modo = document.querySelector('input[name="laserModoV42"]:checked')?.value || 'padrao';
  document.querySelector('#laserPadraoV42')?.classList.toggle('d-none', modo !== 'padrao');
  document.querySelector('#laserPersonalizadoV42')?.classList.toggle('d-none', modo !== 'personalizado');
  recalcularLaserV42();
}

function recalcularLaserV42() {
  const produto = produtoLaserAtualV42;
  const config = produto?.calculadora_config || produto?.laser_config;
  if (!config) return null;
  const modo = document.querySelector('input[name="laserModoV42"]:checked')?.value || 'padrao';

  let largura=0, comprimento=0, altura=0, modeloNome='Sob medida';
  if (modo === 'padrao') {
    const idx = Number(document.querySelector('#laserModeloV42')?.value || 0);
    const modelo = config.modelos_padrao?.[idx] || {};
    largura = Number(modelo.largura || 0);
    comprimento = (config.tipo || 'caixa_3d') === 'area_plana' ? 0 : Number(modelo.comprimento || 0);
    altura = Number(modelo.altura || 0);
    modeloNome = modelo.nome || 'Modelo padronizado';
  } else {
    largura = Number(document.querySelector('#laserLarguraV42')?.value || 0);
    comprimento = (config.tipo || 'caixa_3d') === 'area_plana'
      ? 0
      : Number(document.querySelector('#laserComprimentoV42')?.value || 0);
    altura = Number(document.querySelector('#laserAlturaV42')?.value || 0);
  }

  const matIndex = Number(document.querySelector('#laserMaterialV42')?.value || 0);
  const material = config.materiais?.[matIndex] || {nome:'Material',fator:1,espessuras:[]};
  const espIndex = Number(document.querySelector('#laserEspessuraV42')?.value || 0);
  const espessura = material.espessuras?.[espIndex] || {nome:'-',fator:1};

  const area = calcularAreaCaixaV42(largura, comprimento, altura, config);
  const valorM2 = faixaM2LaserV42(area, config);
  const custoBase = area * valorM2;
  const precoCalculado = custoBase * Number(material.fator || 1) * Number(espessura.fator || 1) + Number(config.custo_fixo || 0);
  const preco = Math.max(Number(config.preco_minimo || 0), precoCalculado);
  const precoFinal = Math.round(preco * 100) / 100;

  selecaoLaserAtualV42 = {
    modo,
    tipo_calculo: config.tipo || 'caixa_3d',
    modelo: modo === 'padrao' ? modeloNome : 'Medida personalizada',
    largura,
    comprimento,
    altura,
    material: material.nome,
    espessura: espessura.nome,
    area_m2: area,
    valor_m2: valorM2,
    preco: precoFinal
  };

  const price = document.querySelector('#laserPrecoV42');
  const resumo = document.querySelector('#laserResumoV42');
  const principal = document.querySelector('#produtoPrecoPrincipalV42');
  if (price) price.textContent = formatMoneyDetailV331(precoFinal);
  if (principal) principal.textContent = formatMoneyDetailV331(precoFinal);
  if (resumo) resumo.textContent = `${modeloNome} • ${material.nome} • ${espessura.nome} • ${area.toFixed(4).replace('.', ',')} m²`;
  if (produtoQuantidadeAtualV44 && Number(produtoQuantidadeAtualV44.quantidade_config?.ativo || 0) === 1) {
    atualizarPrecoQuantidadeDetalheV44();
  }
  return selecaoLaserAtualV42;
}

function inicializarLaserV42(produto) {
  produtoLaserAtualV42 = produto;
  atualizarEspessurasLaserV42();
  recalcularLaserV42();
}

function dadosLaserCarrinhoV42() {
  const cfg = produtoLaserAtualV42?.calculadora_config || produtoLaserAtualV42?.laser_config;
  if (!cfg) return null;
  return recalcularLaserV42();
}

function descricaoLaserV42(config) {
  if (!config) return '';
  const medidas = config.tipo_calculo === 'area_plana'
    ? `${config.largura} x ${config.altura} cm`
    : `${config.largura} x ${config.comprimento} x ${config.altura} cm`;
  return `${config.modelo} | ${medidas} | ${config.material} | ${config.espessura}`;
}

function selecionarVariacaoV33(el) {
  document.querySelectorAll('.personalizacao-opcao-v33').forEach(b => {
    b.classList.remove('active'); b.style.background='#fff';
  });
  el.classList.add('active'); el.style.background='#fce7ec';
  const img=el.dataset.imagem;
  if(img){ const principal=document.querySelector('#produtoImagemPrincipalV334'); if(principal) principal.src=img; }
}
function dadosPersonalizacaoV33(){
  const v=document.querySelector('.personalizacao-opcao-v33.active');
  const o=document.querySelector('#personalizacaoTextoV33');
  return {variacao:v?v.dataset.nome:'',personalizacao:o?o.value.trim():''};
}
function adicionarAoCarrinhoDetalheV331(id) {
  const carrinho=JSON.parse(localStorage.getItem('brindart_cart')||'[]');
  const d=dadosPersonalizacaoV33();
  const calc=dadosLaserCarrinhoV42();
  const configKey = calc ? JSON.stringify(calc) : '';
  const qtdInfo = atualizarPrecoQuantidadeDetalheV44();
  const quantidade = qtdInfo?.quantidade || 1;

  const item=carrinho.find(p=>
    Number(p.id)===Number(id) &&
    String(p.variacao||'')===d.variacao &&
    String(p.personalizacao||'')===d.personalizacao &&
    String(p.config_calculadora_key||p.config_laser_key||'')===configKey
  );

  if(item)item.quantidade=Number(item.quantidade||0)+quantidade;
  else carrinho.push({
    id,
    quantidade,
    variacao:d.variacao,
    personalizacao:d.personalizacao,
    config_calculadora:calc,
    config_calculadora_key:configKey,
    preco_configurado:calc ? Number(calc.preco) : null
  });

  localStorage.setItem('brindart_cart',JSON.stringify(carrinho));
  if(typeof updateCartCount==='function')updateCartCount();
  window.dispatchEvent(new CustomEvent('brindart:cart-updated'));
  if(typeof showBrindartNotice==='function')showBrindartNotice(`${quantidade} unidade(s) adicionada(s) ao carrinho.`);
  else alert(`${quantidade} unidade(s) adicionada(s) ao carrinho!`);
}
async function comprarWhatsAppPersonalizadoV33(id){
  const produto=await BrindartAPI.get('/api/produtos/'+id);
  produtoQuantidadeAtualV44=produto;
  const d=dadosPersonalizacaoV33();
  const calc=dadosLaserCarrinhoV42();
  const base = calc ? Number(calc.preco) : (typeof precoFinalV38==='function' ? Number(precoFinalV38(produto)) : Number(produto.preco_promocional||produto.preco||0));
  const qtd = quantidadeSelecionadaV44();
  const pr = typeof precoQuantidadeV44==='function' ? precoQuantidadeV44(produto,qtd,base) : {preco_unitario:base};
  const unit = Number(pr.preco_unitario||0);
  const total = Math.round(unit*qtd*100)/100;

  let texto=`Olá! Tenho interesse no produto: ${produto.referencia ? produto.referencia + ' | ' : ''}${produto.nome}`;
  texto+=`\nQuantidade: ${qtd}`;
  texto+=`\nValor unitário: ${formatMoneyDetailV331(unit)}`;
  texto+=`\nTotal: ${formatMoneyDetailV331(total)}`;
  if(calc) texto+=`\nConfiguração: ${descricaoLaserV42(calc)}`;
  if(d.variacao)texto+=`\nModelo: ${d.variacao}`;
  if(d.personalizacao)texto+=`\nPersonalização: ${d.personalizacao}`;
  window.open(`https://wa.me/${window.BRINDART_STATIC?.empresa?.whatsapp || '5537988259454'}?text=${encodeURIComponent(texto)}`,'_blank');
}

async function compartilharProdutoV37(id) {
  try {
    const produto = await BrindartAPI.get('/api/produtos/' + id);
    const url = productUrlV353(produto);
    const absoluteUrl = window.location.protocol === 'file:'
      ? window.location.href.split('?')[0] + '?id=' + encodeURIComponent(produto.id)
      : new URL(url, window.location.origin).href;

    const shareData = {
      title: produto.nome,
      text: `${produto.referencia ? produto.referencia + ' | ' : ''}${produto.nome} - ${formatMoneyDetailV331(typeof precoFinalV38 === 'function' ? precoFinalV38(produto) : (produto.preco_promocional || produto.preco))}`,
      url: absoluteUrl
    };

    const podeUsarShareNativo =
      window.location.protocol === 'https:' &&
      typeof navigator.share === 'function';

    if (podeUsarShareNativo) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Se o usuário cancelar ou o navegador falhar, usa o menu próprio.
      }
    }

    abrirMenuCompartilhamentoV37(produto, absoluteUrl);
  } catch (err) {
    alert('Não foi possível compartilhar este produto.');
  }
}

function abrirMenuCompartilhamentoV37(produto, url) {
  document.querySelectorAll('.share-overlay-v37').forEach(el => el.remove());

  const texto = `${produto.nome} - ${formatMoneyDetailV331(produto.preco_promocional || produto.preco)}`;
  const overlay = document.createElement('div');
  overlay.className = 'share-overlay-v37';
  overlay.innerHTML = `
    <div class="share-box-v37">
      <button class="share-close-v37" type="button" aria-label="Fechar">&times;</button>
      <h3>Compartilhar produto</h3>
      <p>${produto.nome}</p>
      <div class="share-actions-v37">
        <a target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(texto + '\n' + url)}">
          <i class="bi bi-whatsapp"></i><span>WhatsApp</span>
        </a>
        <a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">
          <i class="bi bi-facebook"></i><span>Facebook</span>
        </a>
        <button type="button" onclick="copiarLinkProdutoV37('${url.replace(/'/g,"\\'")}')">
          <i class="bi bi-link-45deg"></i><span>Copiar link</span>
        </button>
      </div>
    </div>
  `;

  overlay.querySelector('.share-close-v37').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

async function copiarLinkProdutoV37(url) {
  try {
    await navigator.clipboard.writeText(url);
    if (typeof showBrindartNotice === 'function') showBrindartNotice('Link do produto copiado.');
    else alert('Link copiado.');
  } catch {
    prompt('Copie o link do produto:', url);
  }
}

document.addEventListener('DOMContentLoaded', carregarProdutoDetalheV331);
