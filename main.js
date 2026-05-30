// ============================================================
//  MAIN.JS — Comportements interactifs
//  Dépendance : prix.js doit être chargé avant ce fichier
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Injection des prix depuis prix.js ---
  document.querySelectorAll('[data-prix]').forEach(el => {
    const cle = el.dataset.prix;
    if (PRIX[cle] !== undefined) {
      el.textContent = PRIX[cle];
    }
  });

  // --- Bouton "Retour en haut" ---
  const btn = document.querySelector('.back-to-top');
  if (btn) {
    window.addEventListener('scroll', () => {
      const visible = window.scrollY > 300;
      btn.style.opacity = visible ? '1' : '0';
      btn.style.pointerEvents = visible ? 'auto' : 'none';
    });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
