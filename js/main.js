// ============================================================
//  MAIN.JS — Comportements interactifs
//  La carte est chargée depuis data/carte.json
// ============================================================


// --- Rendu d'un article ---
function renderPrix(article, accent) {
  const cls = 'menu-item__prix' + (accent ? ' menu-item__prix--rose' : '');

  if (article.tarifs) {
    const lignes = article.tarifs.map(t =>
      `<span class="${cls}"><span class="menu-item__tarif-label">${t.label}</span><span class="menu-item__tarif-prix">${t.prix}</span></span>`
    ).join('');
    return `<span class="menu-item__tarifs">${lignes}</span>`;
  }

  if (article.prix) {
    return `<span class="${cls}">${article.prix}</span>`;
  }

  return '';
}

function genererMenu(carte, produits, accent) {
  const corps = document.getElementById('menu-' + carte);
  if (!corps) return;

  corps.innerHTML = produits[carte].sections.map(section => {
    const articles = section.articles.map(article => {
      const multi = article.tarifs && article.tarifs.length > 1;
      return `<div class="menu-item${multi ? ' menu-item--multi' : ''}">`
        + `<span class="menu-item__name">${article.nom}</span>`
        + renderPrix(article, accent)
        + `</div>`;
    }).join('');

    return `<div class="menu-cat${accent ? ' menu-cat--rose' : ''}">${section.titre}</div>${articles}`;
  }).join('');
}


// --- Chargement de la carte ---
fetch('data/carte.json')
  .then(res => res.json())
  .then(produits => {
    genererMenu('chauds', produits, false);
    genererMenu('froids', produits, true);
  });


// --- Carrousels ---
document.querySelectorAll('.carrousel').forEach(carrousel => {
  const piste    = carrousel.querySelector('.carrousel__piste');
  const points   = carrousel.querySelectorAll('.carrousel__point');
  const nbSlides = carrousel.querySelectorAll('.carrousel__piste img').length;
  let index = 0;

  function allerA(i) {
    index = (i + nbSlides) % nbSlides;
    piste.style.transform = `translateX(-${index * 100}%)`;
    points.forEach((p, j) => p.classList.toggle('carrousel__point--actif', j === index));
  }

  carrousel.querySelector('.carrousel__btn--prev').addEventListener('click', () => allerA(index - 1));
  carrousel.querySelector('.carrousel__btn--next').addEventListener('click', () => allerA(index + 1));

  setInterval(() => allerA(index + 1), 4000);
});




// --- Popup mentions légales ---
const overlay    = document.getElementById('mentions-overlay');
const btnMentions = document.getElementById('btn-mentions');
const btnClose   = document.getElementById('mentions-close');

if (overlay && btnMentions) {
  btnMentions.addEventListener('click', () => overlay.classList.add('visible'));
  btnClose.addEventListener('click',    () => overlay.classList.remove('visible'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('visible'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.classList.remove('visible'); });
}


// --- Bouton "Retour en haut" ---
const btnTop = document.querySelector('.back-to-top');
if (btnTop) {
  window.addEventListener('scroll', () => {
    const visible = window.scrollY > 300;
    btnTop.style.opacity       = visible ? '1' : '0';
    btnTop.style.pointerEvents = visible ? 'auto' : 'none';
  });
  btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


// --- Popup alerte ---
const alerteOverlay = document.getElementById('alerte-overlay');
const alerteClose   = document.getElementById('alerte-close');
const alerteBtn     = document.getElementById('alerte-btn');

function fermerPopupAlerte() {
  if (alerteOverlay) alerteOverlay.classList.remove('visible');
  sessionStorage.setItem('alerte-vue', '1');
}

if (alerteClose) alerteClose.addEventListener('click', fermerPopupAlerte);
if (alerteBtn)   alerteBtn.addEventListener('click', fermerPopupAlerte);
if (alerteOverlay) {
  alerteOverlay.addEventListener('click', e => { if (e.target === alerteOverlay) fermerPopupAlerte(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerPopupAlerte(); });
}

if (!sessionStorage.getItem('alerte-vue')) {
  fetch('data/alertes.json')
    .then(res => res.json())
    .then(data => {
      const today  = new Date().toISOString().slice(0, 10);
      const active = (data.periodes || []).find(p => today >= p.debut && today <= p.fin);
      if (!active || !alerteOverlay) return;

      const titreEl = document.getElementById('alerte-titre');
      const msgEl   = document.getElementById('alerte-message');
      if (titreEl) titreEl.textContent = active.titre;
      if (msgEl)   msgEl.textContent   = active.message;

      alerteOverlay.classList.add('visible');
    });
}
