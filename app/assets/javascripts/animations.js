/* ===================================================
   Animations — intro + scroll
   Séquence :
   1. Menu et titres du hero cachés immédiatement (pendant l'intro)
   2. Écran noir avec titre qui monte (0.8s)
   3. Pause
   4. Écran part vers le haut (0.9s)
   5. Entrées du menu fade-up avec stagger
   6. Titres du hero slide-up avec stagger
   7. Texte et logos du hero fade-up
   8. IntersectionObserver pour les sections au scroll
   =================================================== */

document.addEventListener('DOMContentLoaded', function () {

  var intro      = document.getElementById('page-intro');
  var introDelay = 1600; /* ms avant que l'écran commence à partir */
  var introExit  = 900;  /* durée de la transition de sortie (CSS) */

  /* ---- Étape 1 : cacher les éléments du hero IMMÉDIATEMENT ----

     POURQUOI : pendant l'intro, la page est sous l'écran noir.
     Si on attendait la fin de l'intro pour cacher les titres,
     ils seraient visibles, puis sauteraient en bas au moment
     d'appliquer anim-reveal → animation bizarre.
     En les cachant dès maintenant, ils sont déjà dans leur
     état final de départ quand l'intro disparaît. */
  var heroContainers = document.querySelectorAll('.section-home-hero .overflow-hidden');
  heroContainers.forEach(function (container) {
    var child = container.firstElementChild;
    if (child) child.classList.add('anim-reveal');
  });

  /* Entrées du menu (navbar tablette + desktop) — cachées pendant l'intro */
  var navItems = [];
  document.querySelectorAll('.navbar-menu-item, .header .button-text, .header-small .button-text').forEach(function (el) {
    el.classList.add('anim-fade');
    navItems.push(el);
  });

  /* Éléments fade-up du hero (texte, logos, bouton) */
  var heroFadeEls = [];
  [
    '.section-home-hero .text-meta',
    '.section-home-hero .heading-alt-h2',
    '.section-home-hero .home-hero-logos',
    '.section-home-hero .button-row',
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (!el.classList.contains('anim-reveal')) {
        el.classList.add('anim-fade');
        heroFadeEls.push(el);
      }
    });
  });

  /* ---- Étape 2 : configurer l'observer pour les sections au scroll ---- */
  configurerObservers();

  /* ---- Étape 3 : séquence d'intro ---- */
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

    /* Après la pause, faire monter l'écran vers le haut */
    setTimeout(function () {
      intro.classList.add('is-leaving');

      /* Quand l'écran est parti, animer le hero */
      setTimeout(function () {
        intro.style.display = 'none';
        demarrerHero();
      }, introExit);

    }, introDelay);

  } else {
    /* Pas d'intro : animer le hero immédiatement */
    demarrerHero();
  }


  /* ---- Étape 4 : animation du hero après l'intro ---- */
  function demarrerHero() {

    /* Les titres ont déjà anim-reveal depuis l'étape 1,
       on attend 2 frames pour s'assurer que l'état caché
       est bien peint, puis on déclenche la transition. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {

        /* Entrées du menu : fade-up avec stagger (60ms entre chaque) */
        navItems.forEach(function (el, idx) {
          setTimeout(function () {
            el.classList.add('is-visible');
          }, idx * 60);
        });

        /* Titres du hero : slide-up avec stagger, après les items du menu */
        var delaiTitres = navItems.length * 60 + 100;
        heroContainers.forEach(function (container, idx) {
          var child = container.firstElementChild;
          if (!child) return;
          setTimeout(function () {
            child.classList.add('is-visible');
          }, delaiTitres + idx * 120);
        });

        /* Éléments fade-up du hero : après les titres */
        var delaiApresTitres = delaiTitres + heroContainers.length * 120 + 150;
        setTimeout(function () {
          heroFadeEls.forEach(function (el, idx) {
            setTimeout(function () {
              el.classList.add('is-visible');
            }, idx * 80);
          });
        }, delaiApresTitres);

      });
    });
  }


  /* ---- IntersectionObserver pour les sections au scroll ---- */
  function configurerObservers() {

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var child = entry.target.firstElementChild;
          if (child) child.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    /* Slide-up pour toutes les sections SAUF le hero et l'intro
       (le hero est géré par demarrerHero, l'intro par la séquence) */
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

    /* Fade-up pour les éléments des sections au scroll */
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
        /* Ignorer les éléments déjà pris en charge (hero ou anim-reveal) */
        if (el.classList.contains('anim-reveal')) return;
        if (el.classList.contains('anim-fade')) return;
        if (el.closest('.section-home-hero')) return;

        el.classList.add('anim-fade');
        fadeObserver.observe(el);
      });
    });
  }

});
