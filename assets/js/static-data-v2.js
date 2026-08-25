// Gerado pelo Gerenciador Brindart V4.1
window.BRINDART_STATIC = {
  "empresa": {
    "nome": "Brindart Decore",
    "subtitulo": "Loja Criativa",
    "whatsapp": "5537988259454",
    "instagram": "https://instagram.com/SEU_USUARIO",
    "facebook": "https://facebook.com/SUA_PAGINA",
    "email": "",
    "cidade": "Divinópolis - MG",
    "dominio": "https://seudominio.com.br"
  },
  "cookies_config": {
    "ativo": 1,
    "titulo": "Sua privacidade é importante",
    "texto": "Usamos cookies e armazenamento local essenciais para manter o carrinho, favoritos e melhorar sua experiência no site.",
    "texto_botao_aceitar": "Aceitar",
    "texto_botao_necessarios": "Somente necessários",
    "link_politica": "/privacidade.html"
  },
  "popup_promocional": {
    "ativo": 1,
    "titulo": "OFERTA RELÂMPAGO",
    "subtitulo": "Aproveite nossas condições especiais por tempo limitado!",
    "imagem": "assets/img/banners/banner-modelo-1.png",
    "texto_botao": "Ver promoção",
    "link": "/produtos.html",
    "nova_aba": 0,
    "frequencia": "sessao",
    "paginas": "home",
    "atraso_segundos": 3
  },
  "categorias": [
    {
      "id": 1,
      "nome": "Produtos Religiosos",
      "slug": "produtos-religiosos",
      "icone": "bi-heart",
      "ativo": 1
    },
    {
      "id": 2,
      "nome": "Brinquedos Pedagógicos",
      "slug": "brinquedos-pedagogicos",
      "icone": "bi-puzzle",
      "ativo": 1
    },
    {
      "id": 3,
      "nome": "Corte a Laser",
      "slug": "corte-a-laser",
      "icone": "bi-bounding-box",
      "ativo": 1
    },
    {
      "id": 4,
      "nome": "Velas",
      "slug": "velas",
      "icone": "bi-fire",
      "ativo": 1
    },
    {
      "id": 5,
      "nome": "Materiais para Artesanato",
      "slug": "materiais-para-artesanato",
      "icone": "bi-palette",
      "ativo": 1
    },
    {
      "id": 6,
      "nome": "Costura Criativa",
      "slug": "costura-criativa",
      "icone": "bi-scissors",
      "ativo": 1
    },
    {
      "id": 7,
      "nome": "Bonecas de Tecido",
      "slug": "bonecas-de-tecido",
      "icone": "bi-balloon-heart",
      "ativo": 1
    },
    {
      "id": 8,
      "nome": "Canecas",
      "slug": "canecas",
      "icone": "bi-cup-hot",
      "ativo": 1
    },
    {
      "id": 9,
      "nome": "Decoração",
      "slug": "decoracao",
      "icone": "bi-house-heart",
      "ativo": 1
    }
  ],
  "carrossel": [
    {
      "id": 1,
      "titulo": "Canecas personalizadas",
      "subtitulo": "Presentes criativos, delicados e feitos com carinho.",
      "imagem": "assets/img/banners/banner-modelo-1.png",
      "link": "/categoria/canecas",
      "texto_botao": "Ver canecas",
      "ativo": 1,
      "ordem": 1
    },
    {
      "id": 2,
      "titulo": "Produtos artesanais exclusivos",
      "subtitulo": "Peças criativas para decorar, presentear e encantar.",
      "imagem": "assets/img/banners/banner-modelo-2.png",
      "link": "/produtos.html",
      "texto_botao": "Ver coleção",
      "ativo": 1,
      "ordem": 2
    },
    {
      "id": 3,
      "titulo": "Feito à mão com amor",
      "subtitulo": "Personalizados para momentos especiais.",
      "imagem": "assets/img/banners/banner-modelo-3.png",
      "link": "/produtos.html",
      "texto_botao": "Conhecer produtos",
      "ativo": 1,
      "ordem": 3
    }
  ],
  "anuncios_externos": [
    {
      "id": 1,
      "ativo": 1,
      "anunciante": "Empresa Parceira 1",
      "imagem": "assets/img/publicidade/publicidade-meio.png",
      "link": "https://www.exemplo.com.br",
      "posicao": "meio",
      "nova_aba": 1
    },
    {
      "id": 2,
      "ativo": 1,
      "anunciante": "Empresa Parceira 2",
      "imagem": "assets/img/publicidade/publicidade-final.png",
      "link": "https://www.exemplo.com.br",
      "posicao": "final",
      "nova_aba": 1
    }
  ],
  "produtos": [
    {
      "id": 1,
      "referencia": "LAS-002",
      "nome": "Supla",
      "slug": "supla",
      "descricao": "Supla em MDF de 3mm \n35cm de diâmetro",
      "preco": 6,
      "preco_promocional": null,
      "quantidade_config": null,
      "tipo_precificacao": "fixo",
      "calculadora_config": null,
      "desconto_ativo": 1,
      "desconto_percentual": 10,
      "destaque_ativo": 0,
      "destaque_texto": "DESTAQUE",
      "imagem": "assets/img/produtos/LAS-002-01.png",
      "galeria": "[\"assets/img/produtos/LAS-002-01.png\",\"assets/img/produtos/LAS-002-02.png\"]",
      "categoria_id": 3,
      "estoque": 50,
      "avaliacao": 5,
      "vendas": 0,
      "mais_visitado": 0,
      "destaque_semana": 1,
      "destaque": 0,
      "novidade": 0,
      "promocao": 0,
      "selo": "",
      "ativo": 1,
      "seo_titulo": "Supla de MDF Personalizado para Mesa Posta | BrindArt",
      "seo_descricao": "Supla de MDF cortado a laser, ideal para mesa posta, festas e eventos. Escolha o modelo e personalize seu pedido com a BrindArt.",
      "permite_personalizacao": 0,
      "titulo_variacao": "Escolha uma opção",
      "variacoes": []
    }
  ]
};

(function enriquecerDados(){
  const db=window.BRINDART_STATIC;
  (db.produtos||[]).forEach(p=>{
    const c=(db.categorias||[]).find(x=>Number(x.id)===Number(p.categoria_id));
    p.categoria_nome=c?c.nome:''; p.categoria_slug=c?c.slug:''; p.loja_id=1; p.loja_nome=db.empresa?.nome||'Brindart Decore'; p.loja_slug='brindart-decore';
  });
})();
