/* ===================================================
   Animations d'entrée — IntersectionObserver
   Déclenche les classes CSS .anim-reveal et .anim-fade
   quand les éléments entrent dans le viewport.
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- 1. Slide-up : enfants directs de .overflow-hidden ----
     Chaque titre (h1, h2, h3) est à l'intérieur d'un conteneur
     .overflow-hidden qui masque le dépassement. Le titre part
     du bas et remonte (effet "store relevé"). */
  document.querySelectorAll('.overflow-hidden > *').forEach(function (el) {
    el.classList.add('anim-reveal');
  });

  /* Stagger : si plusieurs .overflow-hidden sont frères dans le
     même parent, chaque enfant reçoit un délai croissant de 0.12s
     pour que les titres apparaissent les uns après les autres. */
  document.querySelectorAll('.overflow-hidden').forEach(function (container) {
    var siblings = Array.from(container.parentElement.children).filter(function (el) {
      return el.classList.contains('overflow-hidden');
    });
    var idx = siblings.indexOf(container);
    if (idx > 0) {
      var child = container.firstElementChild;
      if (child) child.style.transitionDelay = (idx * 0.12) + 's';
    }
  });

  /* ---- 2. Fade-up : éléments ciblés par classe ----
     Ces éléments partent de opacity:0 + légèrement en bas,
     puis remontent et apparaissent progressivement. */
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
      /* Ne pas écraser .anim-reveal si l'élément est
         déjà ciblé par la règle overflow-hidden */
      if (!el.classList.contains('anim-reveal')) {
        el.classList.add('anim-fade');
      }
    });
  });

  /* ---- 3. IntersectionObserver ----
     Quand un élément entre dans le viewport (avec une marge
     de 40px en bas pour anticiper légèrement), on lui ajoute
     la classe .is-visible qui déclenche la transition CSS.
     Une fois animé, on arrête de l'observer (unobserve). */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,           /* déclenche dès que 10% de l'élément est visible */
    rootMargin: '0px 0px -40px 0px'  /* anticipe 40px avant d'atteindre le bas */
  });

  document.querySelectorAll('.anim-reveal, .anim-fade').forEach(function (el) {
    observer.observe(el);
  });

});
