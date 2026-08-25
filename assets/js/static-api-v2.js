// Compatibilidade local com o frontend da V35.3.
// As páginas continuam usando as mesmas chamadas /api, mas os dados vêm do arquivo static-data-v2.js.
(function(){
  const originalFetch = window.fetch.bind(window);

  function jsonResponse(data, status = 200){
    return new Response(JSON.stringify(data), {
      status,
      headers: {'Content-Type':'application/json; charset=utf-8'}
    });
  }

  function normalizarBuscaStaticV32(value){
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function produtosFiltrados(url){
    const db = window.BRINDART_STATIC;
    const params = url.searchParams;
    let rows = db.produtos.filter(p => Number(p.ativo ?? 1) === 1);

    const categoria = params.get('categoria');
    const q = normalizarBuscaStaticV32(params.get('q') || '');
    const min = Number(params.get('min') || 0);
    const max = Number(params.get('max') || 0);
    const destaque = params.get('destaque');
    const novidade = params.get('novidade');
    const promocao = params.get('promocao');
    const visitados = params.get('visitados');
    const maisVisitado = params.get('mais_visitado');
    const destaqueSemana = params.get('destaque_semana');
    const sort = params.get('sort') || '';

    if (categoria) rows = rows.filter(p => p.categoria_slug === categoria);
    if (q) rows = rows.filter(p =>
      normalizarBuscaStaticV32(`${p.referencia || ''} ${p.nome} ${p.descricao || ''} ${p.categoria_nome || ''} ${p.slug || ''}`).includes(q)
    );
    if (min) rows = rows.filter(p => Number(p.preco_promocional || p.preco || 0) >= min);
    if (max) rows = rows.filter(p => Number(p.preco_promocional || p.preco || 0) <= max);
    if (destaque === 'true') rows = rows.filter(p => Number(p.destaque) === 1);
    if (novidade === 'true') rows = rows.filter(p => Number(p.novidade) === 1);
    if (promocao === 'true') rows = rows.filter(p => Number(p.promocao) === 1);
    if (maisVisitado === 'true') rows = rows.filter(p => Number(p.mais_visitado) === 1);
    if (destaqueSemana === 'true') rows = rows.filter(p => Number(p.destaque_semana) === 1);

    if (visitados === 'true' || sort === 'mais-vendidos') rows.sort((a,b) => Number(b.vendas||0)-Number(a.vendas||0));
    else if (sort === 'menor-preco') rows.sort((a,b) => Number(a.preco_promocional||a.preco||0)-Number(b.preco_promocional||b.preco||0));
    else if (sort === 'maior-preco') rows.sort((a,b) => Number(b.preco_promocional||b.preco||0)-Number(a.preco_promocional||a.preco||0));
    else if (sort === 'novidades') rows.sort((a,b) => Number(b.novidade||0)-Number(a.novidade||0));
    else rows.sort((a,b) => Number(b.destaque||0)-Number(a.destaque||0) || Number(a.id)-Number(b.id));

    const total = rows.length;
    const page = Math.max(1, Number(params.get('page') || 1));
    const limit = Math.max(1, Number(params.get('limit') || 100));
    const start = (page - 1) * limit;
    return { data: rows.slice(start, start + limit), total, page, limit };
  }

  window.fetch = async function(input, options = {}){
    const raw = typeof input === 'string' ? input : input.url;
    const baseForStaticV31 = window.location.protocol === 'file:' ? 'http://brindart.local' : window.location.origin;
    const url = new URL(raw, baseForStaticV31);
    if (!url.pathname.startsWith('/api/')) return originalFetch(input, options);

    const db = window.BRINDART_STATIC;
    const method = String(options.method || 'GET').toUpperCase();

    if (url.pathname === '/api/categorias') return jsonResponse(db.categorias.filter(c => Number(c.ativo ?? 1) === 1));

    if (url.pathname === '/api/carrossel') return jsonResponse({
      data: db.carrossel.filter(s => Number(s.ativo ?? 1) === 1).sort((a,b)=>Number(a.ordem)-Number(b.ordem))
    });

    if (url.pathname === '/api/produtos') return jsonResponse(produtosFiltrados(url));

    let match = url.pathname.match(/^\/api\/produtos\/slug\/([^/]+)$/);
    if (match){
      const slug = decodeURIComponent(match[1]);
      const p = db.produtos.find(x => x.slug === slug && Number(x.ativo ?? 1) === 1);
      return p ? jsonResponse(p) : jsonResponse({error:'Produto não encontrado'},404);
    }

    match = url.pathname.match(/^\/api\/produtos\/(\d+)$/);
    if (match){
      const p = db.produtos.find(x => Number(x.id) === Number(match[1]) && Number(x.ativo ?? 1) === 1);
      return p ? jsonResponse(p) : jsonResponse({error:'Produto não encontrado'},404);
    }

    if (url.pathname === '/api/lojas') return jsonResponse({
      data:[{id:1,nome:db.empresa.nome,slug:'brindart-decore',cidade:db.empresa.cidade,descricao:'Produtos criativos e personalizados.',avaliacao:5,vendas:0,ativo:1}]
    });

    if (url.pathname === '/api/pedidos' && method === 'POST'){
      let body = {};
      try { body = JSON.parse(options.body || '{}'); } catch {}
      const itens = (body.itens || []).map(item => {
        const p = db.produtos.find(x => Number(x.id) === Number(item.id));
        const minimo = p && typeof quantidadeMinimaV44 === 'function' ? quantidadeMinimaV44(p) : 1;
        const quantidade = Math.max(minimo, Number(item.quantidade || minimo));
        const precoBase = item.preco_configurado != null
          ? Number(item.preco_configurado)
          : Number(p ? (typeof precoFinalV38 === 'function' ? precoFinalV38(p) : (p.preco_promocional || p.preco)) : item.preco || 0);
        const precoInfo = p && typeof precoQuantidadeV44 === 'function'
          ? precoQuantidadeV44(p, quantidade, precoBase)
          : {preco_unitario:precoBase,desconto_percentual:0};
        const preco = Number(precoInfo.preco_unitario || 0);
        return {
          id:item.id,
          referencia:p?.referencia || item.referencia || '',
          nome:p?.nome || item.nome || 'Produto',
          quantidade,
          preco,
          desconto_quantidade:Number(precoInfo.desconto_percentual || 0),
          subtotal:preco*quantidade,
          config_calculadora:item.config_calculadora || item.config_laser || null,
          variacao:item.variacao || '',
          personalizacao:item.personalizacao || '',
          preco_configurado:item.preco_configurado != null ? Number(item.preco_configurado) : null
        };
      });
      const total = itens.reduce((s,i)=>s+i.subtotal,0);
      return jsonResponse({id:'WHATSAPP', itens, total},201);
    }

    return jsonResponse({error:'Recurso indisponível nesta versão sem banco.'},404);
  };

  function aplicarEmpresa(){
    const empresa = window.BRINDART_STATIC.empresa;
    document.querySelectorAll('a[href*="wa.me/5537988259454"]').forEach(a => {
      a.href = a.href.replace('5537988259454', empresa.whatsapp);
    });
  }
  document.addEventListener('DOMContentLoaded', aplicarEmpresa);
})();
