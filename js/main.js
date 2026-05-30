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
