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
  const piste   = carrousel.querySelector('.carrousel__piste');
  const points  = carrousel.querySelectorAll('.carrousel__point');
  const btnPrev = carrousel.querySelector('.carrousel__btn--prev');
  const btnNext = carrousel.querySelector('.carrousel__btn--next');
  const nb      = piste.querySelectorAll('img').length;
  function indexActuel() {
    return Math.round(piste.scrollLeft / piste.clientWidth);
  }

  function allerA(i) {
    piste.scrollTo({ left: ((i + nb) % nb) * piste.clientWidth, behavior: 'smooth' });
  }

  function majPoints() {
    const idx = indexActuel();
    points.forEach((p, j) => p.classList.toggle('carrousel__point--actif', j === idx));
  }

  if (btnPrev) btnPrev.addEventListener('click', () => allerA(indexActuel() - 1));
  if (btnNext) btnNext.addEventListener('click', () => allerA(indexActuel() + 1));
  piste.addEventListener('scroll', majPoints, { passive: true });
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

// --- Avis Google ---
function renderEtoiles(note) {
  const n = Math.round(note);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

fetch('data/avis.json')
  .then(res => res.json())
  .then(data => {
    const noteEl  = document.getElementById('avis-note');
    const etEl    = document.getElementById('avis-etoiles-globales');
    const countEl = document.getElementById('avis-count');
    const majEl   = document.getElementById('avis-maj');
    const lienEl  = document.getElementById('avis-lien-maps');
    const grid    = document.getElementById('avis-grid');

    if (noteEl)  noteEl.textContent  = data.note.toFixed(1).replace('.', ',');
    if (etEl)    etEl.textContent    = renderEtoiles(data.note);
    if (countEl) countEl.textContent = `${data.total} avis Google`;
    if (majEl && data.date_maj) majEl.textContent = `Mis à jour : ${data.date_maj}`;
    if (lienEl && data.lien_maps) lienEl.href = data.lien_maps;

    if (!grid) return;

    const couleurs = ['#4F729B', '#D98883', '#7a9cbf'];
    grid.innerHTML = data.avis.map((avis, i) => {
      const mots     = avis.auteur.trim().split(/\s+/);
      const initiales = (mots[0][0] + (mots[1] ? mots[1][0] : '')).toUpperCase();
      const couleur  = couleurs[i % couleurs.length];
      return `<div class="review-card">
        <div class="review-card__header">
          <div class="review-card__avatar" style="background:${couleur};">${initiales}</div>
          <div class="review-card__meta">
            <span class="review-card__nom">${avis.auteur}</span>
            <span class="review-card__date">${avis.date}</span>
          </div>
        </div>
        <div class="review-card__etoiles">${renderEtoiles(avis.note)}</div>
        <p class="review-card__texte">${avis.texte}</p>
      </div>`;
    }).join('');
  });


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
