/* ===================================================
   Animations — intro + scroll
   Séquence :
   1. Écran d'intro visible (via script inline dans le HTML)
   2. Titre remonte (slide-up, 0.8s)
   3. Pause courte
   4. Écran monte vers le haut et disparaît (0.9s)
   5. Animations du hero démarrent
   6. IntersectionObserver pour les sections au scroll
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var intro      = document.getElementById('page-intro');
  var introDelay = 1600; /* ms avant que l'écran commence à partir */
  var introExit  = 900;  /* durée de la transition de sortie (doit correspondre au CSS) */

  /* ---- Séquence d'intro ---- */
  if (intro) {
    var introContainer = intro.querySelector('.overflow-hidden');
    var introHeading   = introContainer ? introContainer.firstElementChild : null;

    /* Faire monter le titre de l'intro */
    if (introHeading) {
      introHeading.classList.add('anim-reveal');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          introHeading.classList.add('is-visible');
        });
      });
    }

    /* Après la pause, faire monter l'écran entier vers le haut */
    setTimeout(function () {
      intro.classList.add('is-leaving');

      /* Une fois la transition terminée, masquer l'élément
         et démarrer les animations du hero */
      setTimeout(function () {
        intro.style.display = 'none';
        demarrerHero();
      }, introExit);

    }, introDelay);

  } else {
    /* Pas d'intro : démarrer le hero immédiatement */
    demarrerHero();
  }


  /* ---- Animations du hero (après l'intro) ---- */
  function demarrerHero() {

    /* Observer pour les sections au scroll (hors hero) */
    configurerObservers();

    /* Les .overflow-hidden du hero sont déjà dans le viewport.
       On leur applique anim-reveal + on attend 2 frames pour
       que le navigateur peigne l'état caché avant de déclencher
       la transition vers l'état visible. */
    var heroContainers = document.querySelectorAll(
      '.section-home-hero .overflow-hidden'
    );

    heroContainers.forEach(function (container) {
      var child = container.firstElementChild;
      if (child) child.classList.add('anim-reveal');
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroContainers.forEach(function (container, idx) {
          var child = container.firstElementChild;
          if (!child) return;
          /* Stagger : chaque titre apparaît 120ms après le précédent */
          setTimeout(function () {
            child.classList.add('is-visible');
          }, idx * 120);
        });
      });
    });
  }


  /* ---- IntersectionObserver pour les sections au scroll ---- */
  function configurerObservers() {

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

    /* Fade-up */
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    /* Cibler tous les .overflow-hidden SAUF ceux du hero
       (déjà gérés par demarrerHero) et ceux de l'intro */
    document.querySelectorAll('.overflow-hidden').forEach(function (container) {
      if (container.closest('.section-home-hero')) return;
      if (container.closest('#page-intro')) return;

      var child = container.firstElementChild;
      if (!child) return;

      child.classList.add('anim-reveal');

      /* Stagger pour les titres consécutifs dans le même parent */
      var siblings = Array.from(container.parentElement.children).filter(function (el) {
        return el.classList.contains('overflow-hidden');
      });
      var idx = siblings.indexOf(container);
      if (idx > 0) {
        child.style.transitionDelay = (idx * 0.12) + 's';
      }

      revealObserver.observe(container);
    });

    /* Fade-up : éléments ciblés par classe */
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
  }

});
