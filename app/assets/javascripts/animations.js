/* ===================================================
   Animations d'entrée — IntersectionObserver
   Déclenche les classes CSS .anim-reveal et .anim-fade
   quand les éléments entrent dans le viewport.
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- 1. Slide-up : titres dans .overflow-hidden ----

     POURQUOI on observe le PARENT et non l'enfant :
     Quand on applique transform: translateY(105%) à l'enfant,
     il sort visuellement du conteneur. overflow: hidden le masque.
     L'IntersectionObserver calcule la portion VISIBLE de l'élément :
     si le parent le clips à 0%, l'observer ne se déclenche jamais.
     Solution : observer le conteneur .overflow-hidden (toujours
     visible), puis animer son enfant quand le conteneur entre
     dans le viewport. */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var child = entry.target.firstElementChild;
        if (child) child.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.overflow-hidden').forEach(function (container) {
    var child = container.firstElementChild;
    if (!child) return;

    child.classList.add('anim-reveal');

    /* Stagger : délai croissant pour les .overflow-hidden consécutifs
       dans le même parent (effet cascade sur les titres) */
    var siblings = Array.from(container.parentElement.children).filter(function (el) {
      return el.classList.contains('overflow-hidden');
    });
    var idx = siblings.indexOf(container);
    if (idx > 0) {
      child.style.transitionDelay = (idx * 0.12) + 's';
    }

    revealObserver.observe(container); /* observer le PARENT, pas l'enfant */
  });

  /* ---- 2. Fade-up : éléments ciblés par classe ----
     Ces éléments partent de opacity:0 + légèrement en bas,
     puis remontent et apparaissent progressivement. */
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  var fadeSelectors = [
    '.text-meta',
    '.heading-alt-h2',
    '.heading-alt-small',
    '.heading-alt-h3',
    '.heading-alt-h5',
    '.home-hero-logos',
    '.home-services-item',
    '.clients-item',
    '.button-row',
  ];

  fadeSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (!el.classList.contains('anim-reveal')) {
        el.classList.add('anim-fade');
        fadeObserver.observe(el);
      }
    });
  });

});
