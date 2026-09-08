/* ==========================================================================
   Ctrl+Care — shared interactions
   Nav drawer, sticky nav shadow, scroll reveals, FAQ accordion, filters.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- Nav */

  // Drop a shadow on the nav once the page has scrolled away from the top.
  var nav = document.querySelector('.nav');
  if (nav) {
    var setStuck = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  // Mobile drawer. Without this the links are simply unreachable under 900px.
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on Escape, and return focus to the button that opened it.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    // Any in-page link should close the drawer behind it.
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    // Reset state if the viewport grows past the breakpoint while open.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ------------------------------------------------------- Scroll reveal */

  var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');

  if (!revealTargets.length) {
    // nothing to do
  } else if (reduceMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately rather than leaving content invisible.
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------------- FAQ */

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      var group = btn.closest('.faq');

      // Accordion behaviour: only one panel open at a time per group.
      if (group) {
        group.querySelectorAll('.faq-q').forEach(function (other) {
          other.setAttribute('aria-expanded', 'false');
        });
      }
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ------------------------------------------------------------ Filters */

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var targetSel = bar.getAttribute('data-filter-bar');
    var scope = document.querySelector(targetSel);
    if (!scope) return;

    var items = scope.querySelectorAll('[data-cat]');
    var empty = document.querySelector(bar.getAttribute('data-filter-empty') || '');

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-btn');
      if (!btn) return;

      var filter = btn.getAttribute('data-filter');

      bar.querySelectorAll('.filter-btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      var shown = 0;
      items.forEach(function (item) {
        var cats = (item.getAttribute('data-cat') || '').split(/\s+/);
        var match = filter === 'all' || cats.indexOf(filter) !== -1;

        if (match) {
          item.removeAttribute('data-filter-hidden');
          shown++;
        } else {
          item.setAttribute('data-filter-hidden', '');
        }
      });

      // Hide section headings that no longer have any visible cards under them.
      scope.querySelectorAll('[data-group]').forEach(function (group) {
        var visible = group.querySelectorAll('[data-cat]:not([data-filter-hidden])').length;
        group.toggleAttribute('data-filter-hidden', visible === 0);
      });

      if (empty) empty.toggleAttribute('hidden', shown !== 0);
    });
  });

  /* -------------------------------------------------- Newsletter stub */

  // No mailing-list backend yet, so confirm inline instead of firing an alert()
  // that would imply a subscription actually happened.
  document.querySelectorAll('[data-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.parentElement.querySelector('[data-newsletter-note]');
      form.reset();
      if (note) {
        note.textContent =
          'Thanks! Our newsletter is still being set up — follow us on Instagram for updates in the meantime.';
        note.removeAttribute('hidden');
      }
    });
  });
})();
