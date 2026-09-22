(function () {
  "use strict";

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Single orchestrated hero entrance — not a scroll-triggered effect on
  // every section, just the one page-load sequence for the hero.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    revealEls.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("is-in");
      }, 90 * i + 60);
    });
  }

  // Count-up numbers (Differentiators section) — animate once, on first view.
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) {
        el.textContent = target + suffix;
        return;
      }
      var start = performance.now();
      var duration = 1100;
      var step = function (now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  // Scroll-triggered reveals — every major section fades/slides into view
  // as the visitor scrolls down the page (mirrors the hero's load-in, but
  // driven by IntersectionObserver instead of a fixed timeout).
  var scrollRevealEls = document.querySelectorAll("[data-reveal-scroll]");

  // Stagger siblings that share a data-reveal-group (card grids, FAQ rows).
  var revealGroups = {};
  scrollRevealEls.forEach(function (el) {
    var group = el.getAttribute("data-reveal-group");
    if (!group) return;
    (revealGroups[group] = revealGroups[group] || []).push(el);
  });
  Object.keys(revealGroups).forEach(function (group) {
    revealGroups[group].forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", Math.min(i, 5) * 90 + "ms");
    });
  });

  if (reduceMotion) {
    scrollRevealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else if (scrollRevealEls.length) {
    var srObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            srObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    scrollRevealEls.forEach(function (el) { srObserver.observe(el); });
  }

  // Scroll progress bar — thin gold line under the header that fills as
  // the visitor scrolls through the page.
  var progressEl = document.getElementById("scrollProgress");
  if (progressEl) {
    var progressTicking = false;
    var updateProgress = function () {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressEl.style.width = pct + "%";
      progressTicking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!progressTicking) {
          requestAnimationFrame(updateProgress);
          progressTicking = true;
        }
      },
      { passive: true }
    );
    updateProgress();
  }

  // Subtle hero parallax — the ring drifts slightly as you scroll past it.
  var heroRingWrap = document.querySelector(".hero-ring-wrap");
  var heroSection = document.querySelector(".hero");
  if (heroRingWrap && heroSection && !reduceMotion) {
    var parallaxTicking = false;
    var updateParallax = function () {
      var rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var offset = Math.min(window.scrollY * 0.12, 80);
        heroRingWrap.style.transform = "translateY(" + offset + "px)";
      }
      parallaxTicking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!parallaxTicking) {
          requestAnimationFrame(updateParallax);
          parallaxTicking = true;
        }
      },
      { passive: true }
    );
  }
})();
