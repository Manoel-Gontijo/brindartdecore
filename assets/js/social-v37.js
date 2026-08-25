document.addEventListener('DOMContentLoaded', () => {
  const empresa = window.BRINDART_STATIC?.empresa || {};
  document.querySelectorAll('[data-social-instagram-v37]').forEach(a => {
    if (empresa.instagram) a.href = empresa.instagram;
    else a.style.display = 'none';
  });
  document.querySelectorAll('[data-social-facebook-v37]').forEach(a => {
    if (empresa.facebook) a.href = empresa.facebook;
    else a.style.display = 'none';
  });
});
