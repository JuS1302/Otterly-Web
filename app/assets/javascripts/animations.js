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
  var introDelay = 1300; /* ms avant que l'écran commence à partir */
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

  /* Éléments fade-up du hero (skills, bouton) */
  var heroFadeEls = [];
  [
    '.section-home-hero .skills-grid',
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

        /* Entrées du menu : fade avec stagger (45ms entre chaque) */
        navItems.forEach(function (el, idx) {
          setTimeout(function () {
            el.classList.add('is-visible');
          }, idx * 45);
        });

        /* Titres du hero : slide-up avec stagger, après les items du menu */
        var delaiTitres = navItems.length * 45 + 80;
        heroContainers.forEach(function (container, idx) {
          var child = container.firstElementChild;
          if (!child) return;
          setTimeout(function () {
            child.classList.add('is-visible');
          }, delaiTitres + idx * 90);
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
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    var fadeObserver = new IntersectionObserver(function (entries) {
      var visibles = entries.filter(function (e) { return e.isIntersecting; });
      visibles.forEach(function (entry, idx) {
        fadeObserver.unobserve(entry.target);
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, idx * 70);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

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
      '.clients-item',
      '.button-row',
    ].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        /* Ignorer les éléments déjà pris en charge (hero ou anim-reveal) */
        if (el.classList.contains('anim-reveal')) return;
        if (el.classList.contains('anim-fade')) return;
        if (el.closest('.section-home-hero')) return;
        if (el.closest('.footer')) return;

        el.classList.add('anim-fade');
        fadeObserver.observe(el);
      });
    });
  }

});


/* ---- Fix toggle dark / light mode ----
   Le PLUGIN_VARIABLE de Webflow cible .toggle-color-dot au lieu de :root —
   les variables CSS ne cascadent pas sur le reste de la page.
   Ce handler les définit correctement sur document.documentElement. */
(function () {
  var toggle = document.querySelector('.toggle-color');
  if (!toggle) return;

  var isDark = false;
  var root   = document.documentElement;

  toggle.addEventListener('click', function () {
    isDark = !isDark;
    toggle.classList.toggle('is-dark', isDark);

    if (isDark) {
      root.style.setProperty('--global-colors--background-default',       '#0e1011');
      root.style.setProperty('--global-colors--background-muted',         '#181a1b');
      root.style.setProperty('--global-colors--background-muted-2',       '#1f2122');
      root.style.setProperty('--global-colors--background-primary',       '#ffffff');
      root.style.setProperty('--global-colors--background-primary-muted', '#f5f5f5');
      root.style.setProperty('--global-colors--text-default',             '#ffffff');
      root.style.setProperty('--global-colors--text-inverse',             '#0e1011');
      root.style.setProperty('--global-colors--text-muted',               'rgba(255,255,255,0.6)');
      root.style.setProperty('--global-colors--border-default',           '#262829');
      root.style.setProperty('--global-colors--border-inverse',           '#e8eded');
      document.querySelectorAll('.light-mode').forEach(function (el) { el.style.display = 'none'; });
      document.querySelectorAll('.dark-mode').forEach(function (el) { el.style.display = 'block'; });
    } else {
      root.style.setProperty('--global-colors--background-default',       '#ffffff');
      root.style.setProperty('--global-colors--background-muted',         '#f8f8f8');
      root.style.setProperty('--global-colors--background-muted-2',       '#eeeeee');
      root.style.setProperty('--global-colors--background-primary',       '#0e1011');
      root.style.setProperty('--global-colors--background-primary-muted', '#181a1b');
      root.style.setProperty('--global-colors--text-default',             '#0e1011');
      root.style.setProperty('--global-colors--text-inverse',             '#ffffff');
      root.style.setProperty('--global-colors--text-muted',               'rgba(14,16,17,0.6)');
      root.style.setProperty('--global-colors--border-default',           '#e8eded');
      root.style.setProperty('--global-colors--border-inverse',           '#262829');
      document.querySelectorAll('.light-mode').forEach(function (el) { el.style.display = ''; });
      document.querySelectorAll('.dark-mode').forEach(function (el) { el.style.display = 'none'; });
    }
  });
}());


/* ---- Carousel modernisé — navigation + compteur ---- */
(function () {
  var track   = document.querySelector('.carousel-track');
  var prevBtn = document.querySelector('.carousel-btn-prev');
  var nextBtn = document.querySelector('.carousel-btn-next');
  var current = document.querySelector('.carousel-current');
  var slides  = document.querySelectorAll('.carousel-slide');

  if (!track || !slides.length) return;

  var total = slides.length;
  var index = 0;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function goTo(i) {
    index = Math.max(0, Math.min(i, total - 1));
    track.scrollTo({ left: slides[index].offsetLeft, behavior: 'smooth' });
    if (current) current.textContent = pad(index + 1);
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

  /* Mise à jour du compteur au scroll (swipe mobile) */
  track.addEventListener('scroll', function () {
    var slideWidth = slides[0].offsetWidth;
    if (slideWidth > 0) {
      var i = Math.round(track.scrollLeft / slideWidth);
      if (i !== index) { index = i; if (current) current.textContent = pad(index + 1); }
    }
  }, { passive: true });
}());


/* ---- Split screen projets (desktop ≥ 768px) ---- */
(function () {
  var panelItems = [];

  function buildSplitScreen() {
    var container = document.querySelector('.carousel-container');
    var track     = document.querySelector('.carousel-track');
    var slides    = document.querySelectorAll('.carousel-slide');
    if (!container || !track || !slides.length) return;

    /* Supprimer un éventuel panneau existant (rebuild au resize) */
    var existing = container.querySelector('.projects-split-panel');
    if (existing) existing.remove();
    slides.forEach(function (s) { s.classList.remove('is-active'); });
    panelItems = [];

    /* Créer le panneau droit */
    var panel = document.createElement('div');
    panel.className = 'projects-split-panel';

    slides.forEach(function (slide) {
      var image   = slide.querySelector('.project-card-image');
      var content = slide.querySelector('.project-content');
      if (!image || !content) return;

      var item = document.createElement('div');
      item.className = 'split-panel-item';
      item.appendChild(image.cloneNode(true));
      item.appendChild(content.cloneNode(true));
      panel.appendChild(item);
      panelItems.push(item);
    });

    container.appendChild(panel);

    /* Activer le premier projet après 2 frames (pour que la transition CSS joue) */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        activate(0, slides);
      });
    });

    /* Hover sur les items de la liste gauche */
    slides.forEach(function (slide, idx) {
      slide.addEventListener('mouseenter', function () {
        activate(idx, slides);
      });
    });
  }

  function activate(idx, slides) {
    slides.forEach(function (s) { s.classList.remove('is-active'); });
    panelItems.forEach(function (p) { p.classList.remove('is-active'); });
    if (slides[idx]) slides[idx].classList.add('is-active');
    if (panelItems[idx]) panelItems[idx].classList.add('is-active');
  }

  function isDesktop() { return window.innerWidth >= 768; }

  document.addEventListener('DOMContentLoaded', function () {
    if (isDesktop()) buildSplitScreen();
  });

  /* Rebuild si on passe le seuil 768px */
  var wasDesktop = isDesktop();
  window.addEventListener('resize', function () {
    var nowDesktop = isDesktop();
    if (nowDesktop === wasDesktop) return;
    wasDesktop = nowDesktop;
    if (nowDesktop) {
      buildSplitScreen();
    } else {
      var panel = document.querySelector('.projects-split-panel');
      if (panel) panel.remove();
      document.querySelectorAll('.carousel-slide').forEach(function (s) {
        s.classList.remove('is-active');
      });
      panelItems = [];
    }
  });
}());


/* ---- Parallax sur les images de services ---- */
(function () {
  var images = document.querySelectorAll('.image-cover-parallax');
  if (!images.length) return;

  function updateParallax() {
    images.forEach(function (img) {
      var container = img.closest('.home-services-item-image');
      if (!container) return;
      var rect   = container.getBoundingClientRect();
      /* On ne déplace l'image que quand elle est visible (rect.top <= 0).
         Avant qu'elle entre dans le viewport, offset = 0 → image collée en haut. */
      var offset = Math.min(0, rect.top * 0.1);
      img.style.transform = 'translateY(' + offset + 'px)';
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();
}());
