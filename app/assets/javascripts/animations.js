/* ===================================================
   Animations d'entrée — IntersectionObserver
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Observers ---- */

  /* Slide-up : on observe le PARENT .overflow-hidden (visible),
     pas l'enfant (clippé à 0% quand transformé → threshold jamais atteint) */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var child = entry.target.firstElementChild;
        if (child) child.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  /* Fade-up : on observe l'élément directement */
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  /* ---- Étape 1 : appliquer les états cachés initiaux ---- */

  document.querySelectorAll('.overflow-hidden').forEach(function (container) {
    var child = container.firstElementChild;
    if (!child) return;

    child.classList.add('anim-reveal');

    /* Stagger : délai croissant pour les .overflow-hidden consécutifs
       dans le même parent (cascade sur les titres) */
    var siblings = Array.from(container.parentElement.children).filter(function (el) {
      return el.classList.contains('overflow-hidden');
    });
    var idx = siblings.indexOf(container);
    if (idx > 0) {
      child.style.transitionDelay = (idx * 0.12) + 's';
    }
  });

  /* ---- Étape 2 : attendre 2 frames avant d'observer ----

     POURQUOI 2 requestAnimationFrame :
     Si on observe immédiatement après avoir ajouté .anim-reveal,
     le navigateur n'a pas encore eu le temps de peindre l'état
     caché (transform: translateY(105%)). L'observer déclenche
     is-visible dans le même rendu → aucune transition visible.
     Les 2 rAF garantissent que l'état caché est peint AVANT
     que l'observer commence à surveiller les éléments du hero. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {

      /* Slide-up : observer tous les conteneurs */
      document.querySelectorAll('.overflow-hidden').forEach(function (container) {
        if (container.firstElementChild) {
          revealObserver.observe(container);
        }
      });

      /* Fade-up : ajouter la classe et observer */
      [
        '.text-meta',
        '.heading-alt-h2',
        '.heading-alt-small',
        '.heading-alt-h3',
        '.heading-alt-h5',
        '.home-hero-logos',
        '.home-services-item',
        '.clients-item',
        '.button-row',
      ].forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
          if (!el.classList.contains('anim-reveal')) {
            el.classList.add('anim-fade');
            fadeObserver.observe(el);
          }
        });
      });

    });
  });

});
