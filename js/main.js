/* =========================================================
   MONITA VILLA — Script principal (JS vanilla, sans dépendance)
   - En-tête transparent → opaque au scroll
   - Menu hamburger plein écran (mobile)
   - Bascule de langue FR / EN sans rechargement
   - Animations d'apparition au scroll
   - Lightbox de galerie (zoom, navigation, fermeture)
   - Formulaire de contact → message WhatsApp pré-rempli
   ========================================================= */

/* ⚠️ NUMÉRO À REMPLACER : indiquez ici le numéro WhatsApp (format international, sans +).
   Exemple Polynésie française : 68987XXXXXX                                            */
const WHATSAPP_NUMBER = '68987000507';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initLanguage();
  initReveal();
  initLightbox();
  initContactForm();
});

/* ---------- 1. En-tête au scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header || header.classList.contains('solid')) return; // pages internes : déjà opaque
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- 2. Menu mobile (hamburger plein écran) ---------- */
function initMobileMenu() {
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (!burger || !nav) return;

  const toggle = (open) => {
    const willOpen = open ?? !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    burger.classList.toggle('open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    document.body.classList.toggle('menu-open', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggle());
  // Ferme le menu après un clic sur un lien
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  // Ferme avec Échap
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
}

/* ---------- 3. Bascule de langue FR / EN ---------- */
function initLanguage() {
  const saved = localStorage.getItem('mv-lang') || 'fr';
  applyLanguage(saved);

  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('mv-lang', lang);

  // Textes : data-fr / data-en
  document.querySelectorAll('[data-fr]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (val !== null) el.innerHTML = val;
  });

  // Attributs placeholder : data-fr-placeholder / data-en-placeholder
  document.querySelectorAll('[data-fr-placeholder]').forEach(el => {
    const val = el.getAttribute('data-' + lang + '-placeholder');
    if (val !== null) el.placeholder = val;
  });

  // Attributs alt : data-fr-alt / data-en-alt
  document.querySelectorAll('[data-fr-alt]').forEach(el => {
    const val = el.getAttribute('data-' + lang + '-alt');
    if (val !== null) el.alt = val;
  });

  // État des boutons FR/EN
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/* Petit utilitaire : renvoie le texte traduit d'un élément selon la langue courante */
function tr(el) {
  const lang = document.documentElement.lang || 'fr';
  return el.getAttribute('data-' + lang) || el.textContent;
}

/* ---------- 4. Apparition au scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
}

/* ---------- 5. Lightbox de galerie ---------- */
function initLightbox() {
  const items = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!items.length) return;

  // Construction de la lightbox
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.innerHTML = `
    <button class="lightbox__btn lightbox__close" aria-label="Fermer">&times;</button>
    <button class="lightbox__btn lightbox__prev" aria-label="Précédent">&#8249;</button>
    <img alt="">
    <button class="lightbox__btn lightbox__next" aria-label="Suivant">&#8250;</button>
    <div class="lightbox__counter"></div>`;
  document.body.appendChild(box);

  const imgEl = box.querySelector('img');
  const counter = box.querySelector('.lightbox__counter');
  let index = 0;

  const srcOf = (el) => el.dataset.full || el.querySelector('img')?.src || el.src;
  const altOf = (el) => el.querySelector('img')?.alt || el.alt || '';

  const show = (i) => {
    index = (i + items.length) % items.length;
    const el = items[index];
    imgEl.src = srcOf(el);
    imgEl.alt = altOf(el);
    counter.textContent = `${index + 1} / ${items.length}`;
  };
  const open = (i) => { show(i); box.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { box.classList.remove('open'); document.body.style.overflow = ''; };

  items.forEach((el, i) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => open(i));
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));
  box.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
}

/* ---------- 6. Formulaire de contact → WhatsApp ---------- */
function initContactForm() {
  const btn = document.getElementById('send-whatsapp');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const get = id => (document.getElementById(id)?.value || '').trim();
    const lang = document.documentElement.lang || 'fr';

    const nom = get('f-nom');
    const email = get('f-email');
    const arrivee = get('f-arrivee');
    const depart = get('f-depart');
    const personnes = get('f-personnes');
    const message = get('f-message');

    let body;
    if (lang === 'en') {
      body =
`Hello Félix and Miri, I would like to book Monita Villa.
• Name: ${nom || '—'}
• Email: ${email || '—'}
• Arrival: ${arrivee || '—'}
• Departure: ${depart || '—'}
• Guests: ${personnes || '—'}
• Message: ${message || '—'}`;
    } else {
      body =
`Iaorana Félix et Miri, je souhaite réserver à Monita Villa.
• Nom : ${nom || '—'}
• E-mail : ${email || '—'}
• Arrivée : ${arrivee || '—'}
• Départ : ${depart || '—'}
• Personnes : ${personnes || '—'}
• Message : ${message || '—'}`;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  });
}
