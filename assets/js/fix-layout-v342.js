(() => {
  function limparDuplicadosV342() {
    const oficial = document.querySelector('#brindartCarouselNovo #brindartCarouselV34');

    document.querySelectorAll('#brindartCarouselV34').forEach(el => {
      if (!el.closest('#brindartCarouselNovo')) {
        const wrapper = el.closest('.brindart-carousel-area, section, .container, div') || el;
        if (wrapper && wrapper !== document.body && wrapper !== document.documentElement) wrapper.remove();
      }
    });

    document.querySelectorAll('#heroCarouselV339,#heroCarouselV335,#homeMainCarouselStableV3311,#carouselHomeBrindart,#homeCarousel,#mainCarousel').forEach(el => {
      if (oficial && el === oficial) return;
      const wrapper = el.closest('#heroCarouselV339,#heroCarouselV335,#homeMainCarouselStableV3311,.hero-section,.container.my-4,section') || el;
      if (wrapper && !wrapper.closest('#brindartCarouselNovo') && wrapper !== document.body && wrapper !== document.documentElement) {
        wrapper.remove();
      }
    });

    const roots = document.querySelectorAll('#brindartCarouselNovo');
    roots.forEach((root, index) => {
      if (index > 0) root.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    limparDuplicadosV342();
    setTimeout(limparDuplicadosV342, 500);
    setTimeout(limparDuplicadosV342, 1200);
    setTimeout(limparDuplicadosV342, 2500);
  });

  window.addEventListener('load', () => {
    limparDuplicadosV342();
    setTimeout(limparDuplicadosV342, 1000);
  });
})();
