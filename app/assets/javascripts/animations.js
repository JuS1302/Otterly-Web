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

  var navItems = [];

  /* Éléments fade-up du hero (bouton uniquement — skills gérés séparément) */
  var heroFadeEls = [];
  [
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

      /* Lancer le scramble dès que l'écran commence à partir */
      demarrerHero();

      /* Masquer l'intro quand la transition est terminée */
      setTimeout(function () {
        intro.style.display = 'none';
      }, introExit);

    }, introDelay);

  } else {
    /* Pas d'intro : animer le hero immédiatement */
    demarrerHero();
  }


  /* ---- Étape 4 : animation du hero après l'intro ---- */
  function demarrerHero() {
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!$%&*';

    function scramble(el, startDelay) {
      var node = el.querySelector('span') || el;
      var original = node.textContent;

      /* Verrouiller la largeur du h1 pour éviter tout décalage de mise en page */
      el.style.width = el.offsetWidth + 'px';

      setTimeout(function () {
        var frame = 0;
        var interval = setInterval(function () {
          var resolved = Math.floor(frame / 7);
          node.textContent = original.split('').map(function (ch, i) {
            if (i < resolved) return ch;
            if (!/[A-Z0-9]/i.test(ch)) return ch; /* conserver ©, espaces… */
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          frame++;
          if (resolved >= original.length) {
            clearInterval(interval);
            node.textContent = original;
            el.style.width = '';
          }
        }, 37);
      }, startDelay);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        /* OTTERLY démarre immédiatement, WEB© 150ms après */
        document.querySelectorAll('.heading-style-large').forEach(function (el, i) {
          scramble(el, i * 150);
        });
      });
    });
  }


  /* Animations au scroll supprimées — les éléments sont visibles par défaut */
  function configurerObservers() {}

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


/* ---- About — texte dépliable ---- */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var toggle      = document.querySelector('.about-toggle');
    var collapsible = document.querySelector('.about-collapsible');
    var label       = toggle && toggle.querySelector('.about-toggle-label');
    if (!toggle || !collapsible) return;

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      collapsible.classList.toggle('is-open', !isOpen);
      if (label) label.textContent = isOpen ? 'En savoir plus' : 'Réduire';
    });
  });
}());


/* ---- Skills — animation pop-in au scroll ---- */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var grid = document.querySelector('.skills-grid');
    if (!grid) return;

    /* Préparer les délais en cascade sur chaque pill */
    grid.querySelectorAll('.skill-item').forEach(function (item, idx) {
      item.style.setProperty('--skill-delay', (idx * 0.05) + 's');
    });

    /* Masquer les pills jusqu'à ce que la section soit visible */
    grid.classList.add('skills-will-animate');

    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        grid.classList.add('is-visible');
      } else {
        grid.classList.remove('is-visible');
      }
    }, { threshold: 0.15 });

    observer.observe(grid);
  });
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


/* ---- Carrousel 3D services ---- */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var stack = document.querySelector('.fan-stack');
    if (!stack) return;

    var cards   = Array.from(stack.querySelectorAll('.fan-card'));
    var total   = cards.length;
    var current = 0;

    var counterEl = document.querySelector('.fan-current');
    var prevBtn   = document.querySelector('.fan-btn-prev');
    var nextBtn   = document.querySelector('.fan-btn-next');

    /* Positionne les cartes : center = active, right = suivante, left = précédente */
    function activate(centerIdx) {
      var positions = ['center', 'right', 'left'];
      cards.forEach(function (card) { card.removeAttribute('data-pos'); });
      for (var p = 0; p < positions.length; p++) {
        cards[(centerIdx + p) % total].setAttribute('data-pos', positions[p]);
      }
      current = centerIdx;
      if (counterEl) {
        counterEl.textContent = (centerIdx + 1 < 10 ? '0' : '') + (centerIdx + 1);
      }
    }

    function next() { activate((current + 1) % total); }
    function prev() { activate((current - 1 + total) % total); }

    /* Cliquer une carte latérale la ramène au centre */
    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var pos = card.getAttribute('data-pos');
        if (pos === 'right') next();
        if (pos === 'left')  prev();
      });
    });

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    activate(0);
  });
}());


/* ---- Curseur custom — pattes de loutre ---- */
(function () {
  /* Ne s'active que sur les appareils avec souris (pas les écrans tactiles) */
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.addEventListener('DOMContentLoaded', function () {
    /* Créer l'élément curseur */
    var cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28" fill="#56e817">'
      + '<ellipse cx="22" cy="26" rx="11" ry="14"/>'
      + '<ellipse cx="46" cy="14" rx="11" ry="14"/>'
      + '<ellipse cx="70" cy="14" rx="11" ry="14"/>'
      + '<ellipse cx="86" cy="38" rx="10" ry="13"/>'
      + '<ellipse cx="52" cy="68" rx="32" ry="26"/>'
      + '</svg>';
    document.body.appendChild(cursor);

    var mouseX = -100;
    var mouseY = -100;
    var cursorX = -100;
    var cursorY = -100;
    var rafId;

    /* Suivi fluide avec requestAnimationFrame pour éviter les saccades */
    function animate() {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.left = cursorX + 'px';
      cursor.style.top  = cursorY + 'px';
      rafId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.classList.add('is-visible');
    });

    /* Cacher le curseur quand la souris quitte la fenêtre */
    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });

    /* Grossir le curseur quand on survole un élément cliquable */
    document.addEventListener('mouseover', function (e) {
      var target = e.target.closest('a, button, [role="button"], input, label, select, textarea, .fan-card');
      cursor.classList.toggle('is-hover', !!target);
    });

    animate();
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


/* ---- Scroll fluide — liens internes + menu mobile ---- */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {

      function scrollToSectionTop(targetId) {
        var targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        var startPosition = window.pageYOffset;
        var distance = targetElement.offsetTop - startPosition;
        var duration = Math.max(800, Math.abs(distance) * 0.5);
        var startTime = null;

        function animateScroll(currentTime) {
          if (startTime === null) startTime = currentTime;
          var progress = Math.min((currentTime - startTime) / duration, 1);
          var ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          window.scrollTo(0, startPosition + distance * ease);
          if (progress < 1) requestAnimationFrame(animateScroll);
        }

        requestAnimationFrame(animateScroll);
      }

      /* Liens internes (footer, nav) */
      document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (link) {
        if (!link.closest('.mobile-menu-list')) {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            scrollToSectionTop(link.getAttribute('href'));
          });
        }
      });

      /* Menu mobile — fermer puis scroller */
      var menuToggle = document.getElementById('menu-toggle');
      document.querySelectorAll('.mobile-menu-list a').forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var targetId = link.getAttribute('href');
          if (menuToggle) menuToggle.checked = false;
          setTimeout(function () { scrollToSectionTop(targetId); }, 300);
        });
      });

    }, 100);
  });
}());
