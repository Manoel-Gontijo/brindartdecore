// V3.6 - efeitos sutis de entrada e cabeçalho
document.addEventListener('DOMContentLoaded', () => {
  const alvos = document.querySelectorAll(
    '.home-section-v344, .service-strip, .promo-banner-v34, .ad-wrapper-v35, .seo-category-header, .product-detail-layout-v334'
  );

  alvos.forEach(el => el.classList.add('reveal-v36'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-v36');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    alvos.forEach(el => observer.observe(el));
  } else {
    alvos.forEach(el => el.classList.add('show-v36'));
  }

  const header = document.querySelector('.bd-header');
  const atualizarHeader = () => {
    if (!header) return;
    header.classList.toggle('header-scrolled-v36', window.scrollY > 18);
  };
  atualizarHeader();
  window.addEventListener('scroll', atualizarHeader, { passive:true });
});
