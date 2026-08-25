async function getSlidesCarrosselV34() {
  const response = await fetch('/api/carrossel?_=' + Date.now(), { cache: 'no-store' });
  if (!response.ok) throw new Error('Erro ao carregar carrossel');
  const result = await response.json();
  return result.data || [];
}

function normalizarLinkCarrosselStaticV31(link) {
  if (window.location.protocol !== 'file:') return link || 'produtos.html';
  const raw = String(link || 'produtos.html');
  const cat = raw.match(/^\/categoria\/([^/]+)/);
  if (cat) return 'produtos.html?categoria=' + encodeURIComponent(decodeURIComponent(cat[1]));
  if (raw === '/produtos' || raw === '/produtos.html') return 'produtos.html';
  return raw.replace(/^\//, '');
}

function fallbackSlidesV34() {
  return [
    {
      titulo:'Canecas personalizadas',
      subtitulo:'Presentes criativos, delicados e feitos com carinho.',
      imagem:'assets/img/banners/banner-modelo-1.png',
      link:'/categoria/canecas',
      texto_botao:'Ver canecas'
    },
    {
      titulo:'Produtos artesanais exclusivos',
      subtitulo:'Peças criativas para decorar, presentear e encantar.',
      imagem:'assets/img/banners/banner-modelo-2.png',
      link:'produtos.html',
      texto_botao:'Ver coleção'
    },
    {
      titulo:'Feito à mão com amor',
      subtitulo:'Personalizados para momentos especiais.',
      imagem:'assets/img/banners/banner-modelo-3.png',
      link:'produtos.html',
      texto_botao:'Conhecer produtos'
    }
  ];
}

async function renderCarrosselV34() {
  const root = document.querySelector('#brindartCarouselNovo');
  if (!root) return;

  let slides = [];

  try {
    slides = await getSlidesCarrosselV34();
  } catch {}

  if (!slides.length) slides = fallbackSlidesV34();
  slides = slides.slice(0, 3);

  root.innerHTML = `
    <div id="brindartCarouselV34" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="4300">
      <div class="carousel-indicators">
        ${slides.map((_, i) => `
          <button type="button" data-bs-target="#brindartCarouselV34" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}"></button>
        `).join('')}
      </div>

      <div class="carousel-inner">
        ${slides.map((s, i) => `
          <div class="carousel-item ${i === 0 ? 'active' : ''}">
            <div class="brindart-slide-v34">
              <a href="${normalizarLinkCarrosselStaticV31(s.link)}" class="brindart-slide-link-v34" aria-label="${s.titulo || 'Banner Brindart'}">
                <img src="${s.imagem}" alt="${s.titulo || 'Banner Brindart'}">
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      ${slides.length > 1 ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#brindartCarouselV34" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#brindartCarouselV34" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      ` : ''}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderCarrosselV34);
window.addEventListener('load', renderCarrosselV34);
