/* ============================================================
   Preview Design System — behavior.
   One script. Auto-initializes anything with a data-wire-* attribute.
   No dependencies. Drop in <body> with `defer`.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Tabs (ARIA pattern) ----------
     Reads: data-wire-tabs (presence) — required to init
            data-wire-tabs-hash (presence) — sync active tab with URL hash
     If hash sync is on, the active tab is reflected in window.location.hash
     via history.replaceState (no scroll jump, no history pollution), and
     browser back/forward (hashchange) re-activates the matching tab.
  */
  function initTabs(root) {
    const tablist = root.querySelector('[role="tablist"]');
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    const useHash = root.hasAttribute("data-wire-tabs-hash");

    function activate(idx, focus, updateHash) {
      tabs.forEach((tab, i) => {
        const selected = i === idx;
        tab.setAttribute("aria-selected", selected);
        tab.setAttribute("tabindex", selected ? "0" : "-1");
        if (panels[i]) {
          panels[i].classList.toggle("is-active", selected);
          panels[i].hidden = !selected;
        }
      });
      if (focus && tabs[idx]) tabs[idx].focus();
      if (useHash && updateHash && tabs[idx]) {
        const panelId = tabs[idx].getAttribute("aria-controls");
        if (panelId) {
          history.replaceState(null, "", "#" + panelId);
        }
      }
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i, false, true));
      tab.addEventListener("keydown", (e) => {
        let next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next >= 0) { e.preventDefault(); activate(next, true, true); }
      });
    });

    // Initial activation: hash > aria-selected > first tab
    let initialIdx = -1;
    if (useHash && window.location.hash) {
      const hashId = window.location.hash.slice(1);
      initialIdx = tabs.findIndex(t => t.getAttribute("aria-controls") === hashId);
    }
    if (initialIdx < 0) {
      initialIdx = Math.max(0, tabs.findIndex(t => t.getAttribute("aria-selected") === "true"));
    }
    activate(initialIdx, false, false);

    if (useHash) {
      window.addEventListener("hashchange", () => {
        const hashId = window.location.hash.slice(1);
        const idx = tabs.findIndex(t => t.getAttribute("aria-controls") === hashId);
        if (idx >= 0) activate(idx, false, false);
      });
    }
  }

  /* ---------- Accordion (single-open option) ---------- */
  function initAccordion(root) {
    if (root.dataset.wireAccordion !== "single") return;
    const items = root.querySelectorAll("details");
    items.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (d.open) {
          items.forEach((other) => { if (other !== d) other.open = false; });
        }
      });
    });
  }

  /* ---------- Mega menu (click-toggle) ---------- */
  function initMegamenu(root) {
    const trigger = root.querySelector("[data-wire-megamenu-trigger]");
    const panel = root.querySelector(".wire-megamenu__panel");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(!root.classList.contains("is-open"));
    });

    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  /* ---------- Mobile drawer / off-canvas rail (focus trap — WCAG 2.1.2) ----------
     The same element can be a persistent <nav> at desktop and an off-canvas
     slide-over at mobile (the shell rail). So modal semantics — role=dialog,
     aria-modal, focus trap, scroll lock — are applied ONLY while open, and
     stripped on close, leaving a plain navigation landmark the rest of the
     time. The trigger that opens it is hidden by CSS above the breakpoint,
     so a persistent rail never enters dialog mode. */
  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function initDrawer() {
    const toggles = document.querySelectorAll("[data-wire-drawer-open]");
    toggles.forEach((toggle) => {
      const targetId = toggle.getAttribute("data-wire-drawer-open");
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const backdrop = drawer.nextElementSibling && drawer.nextElementSibling.classList.contains("wire-drawer-backdrop")
        ? drawer.nextElementSibling
        : null;

      const hadRole = drawer.hasAttribute("role");

      function open() {
        drawer.classList.add("is-open");
        if (backdrop) backdrop.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
        drawer.setAttribute("role", "dialog");
        drawer.setAttribute("aria-modal", "true");
        const first = drawer.querySelector(FOCUSABLE);
        if (first) first.focus();
      }

      function close() {
        drawer.classList.remove("is-open");
        if (backdrop) backdrop.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        drawer.removeAttribute("aria-modal");
        if (!hadRole) drawer.removeAttribute("role");
        toggle.focus();
      }

      function trap(e) {
        if (e.key !== "Tab" || !drawer.classList.contains("is-open")) return;
        const items = Array.from(drawer.querySelectorAll(FOCUSABLE)).filter((el) => !el.disabled && el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      toggle.setAttribute("aria-controls", targetId);
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", open);

      const closeBtns = drawer.querySelectorAll("[data-wire-drawer-close]");
      closeBtns.forEach((btn) => btn.addEventListener("click", close));
      if (backdrop) backdrop.addEventListener("click", close);

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
        trap(e);
      });
    });
  }

  /* ---------- In-page nav: highlight current section on scroll ---------- */
  function initInPageNav() {
    const navs = document.querySelectorAll("[data-wire-inpagenav]");
    navs.forEach((nav) => {
      const links = Array.from(nav.querySelectorAll("a[href^='#']"));
      if (!links.length) return;
      const sections = links.map(l => document.getElementById(l.getAttribute("href").slice(1))).filter(Boolean);

      if (!("IntersectionObserver" in window) || !sections.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => {
              l.classList.toggle("is-current", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });

      sections.forEach((s) => observer.observe(s));
    });
  }

  /* ---------- Text-size control (NIA senior-friendly recommendation) ---------- */
  function initTextSize() {
    const widgets = document.querySelectorAll("[data-wire-text-size]");
    if (!widgets.length) return;

    const STORAGE_KEY = "wire-text-scale";
    const SCALES = { sm: 0.9, md: 1, lg: 1.15, xl: 1.3 };
    const LABELS = { sm: "small", md: "medium", lg: "large", xl: "extra-large" };

    // Polite live region so assistive tech announces scale changes.
    const announcer = document.createElement("span");
    announcer.className = "u-visually-hidden";
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    document.body.appendChild(announcer);

    let initialized = false;

    function apply(value) {
      const scale = SCALES[value] || 1;
      document.documentElement.style.setProperty("--wire-text-scale", String(scale));
      widgets.forEach((w) => {
        w.querySelectorAll("[data-wire-text-size-value]").forEach((btn) => {
          btn.setAttribute("aria-pressed", btn.dataset.wireTextSizeValue === value ? "true" : "false");
        });
      });
      if (initialized) {
        announcer.textContent = "Text size: " + (LABELS[value] || "default");
      }
      try { localStorage.setItem(STORAGE_KEY, value); } catch (_) {}
    }

    widgets.forEach((widget) => {
      widget.querySelectorAll("[data-wire-text-size-value]").forEach((btn) => {
        btn.addEventListener("click", () => apply(btn.dataset.wireTextSizeValue));
      });
    });

    let saved = "md";
    try { saved = localStorage.getItem(STORAGE_KEY) || "md"; } catch (_) {}
    apply(saved);
    initialized = true;
  }

  /* ---------- Modal — centered dialog overlay ---------- */
  function initModal() {
    const toggles = document.querySelectorAll("[data-wire-modal-open]");
    toggles.forEach((toggle) => {
      const targetId = toggle.getAttribute("data-wire-modal-open");
      const modal = document.getElementById(targetId);
      if (!modal) return;

      const backdrop = modal.querySelector(".wire-modal__backdrop");
      const panel = modal.querySelector(".wire-modal__panel");
      if (panel) {
        modal.setAttribute("role", modal.getAttribute("role") || "dialog");
        modal.setAttribute("aria-modal", "true");
      }

      let previouslyFocused = null;

      function open() {
        previouslyFocused = document.activeElement;
        modal.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
        const first = modal.querySelector(FOCUSABLE);
        if (first) first.focus();
      }

      function close() {
        modal.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
      }

      function trap(e) {
        if (e.key !== "Tab" || !modal.classList.contains("is-open")) return;
        const items = Array.from(modal.querySelectorAll(FOCUSABLE)).filter((el) => !el.disabled && el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }

      toggle.setAttribute("aria-controls", targetId);
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", open);

      modal.querySelectorAll("[data-wire-modal-close]").forEach((btn) => btn.addEventListener("click", close));
      if (backdrop) backdrop.addEventListener("click", close);

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        trap(e);
      });
    });
  }

  /* ---------- Toast — transient status messages, WCAG 4.1.3 ---------- */
  function initToast() {
    // Lazily-created region so pages without toasts don't pay for the DOM.
    let region = null;

    function ensureRegion() {
      if (region) return region;
      region = document.createElement("div");
      region.className = "wire-toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
      return region;
    }

    function show({ title = "", body = "", duration = 5000 } = {}) {
      const r = ensureRegion();
      const toast = document.createElement("div");
      toast.className = "wire-toast";
      toast.innerHTML =
        '<div class="wire-toast__content">' +
        (title ? '<div class="wire-toast__title"></div>' : "") +
        (body ? '<div class="wire-toast__body"></div>' : "") +
        "</div>" +
        '<button type="button" class="wire-toast__close" aria-label="Dismiss notification">×</button>';
      if (title) toast.querySelector(".wire-toast__title").textContent = title;
      if (body) toast.querySelector(".wire-toast__body").textContent = body;

      r.appendChild(toast);
      // Force reflow so the transition runs.
      requestAnimationFrame(() => toast.classList.add("is-open"));

      const dismiss = () => {
        toast.classList.remove("is-open");
        setTimeout(() => toast.remove(), 300);
      };

      toast.querySelector(".wire-toast__close").addEventListener("click", dismiss);
      if (duration > 0) setTimeout(dismiss, duration);
    }

    // Public API.
    window.wireToast = show;

    // Declarative triggers: any [data-wire-toast-trigger] with data-title / data-body.
    document.querySelectorAll("[data-wire-toast-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        show({
          title: btn.getAttribute("data-toast-title") || "",
          body: btn.getAttribute("data-toast-body") || "",
          duration: Number(btn.getAttribute("data-toast-duration")) || 5000,
        });
      });
    });
  }

  /* ---------- Banner dismiss — simple close button on [data-wire-banner] ---------- */
  function initBanner() {
    document.querySelectorAll(".wire-banner__close").forEach((btn) => {
      btn.addEventListener("click", () => {
        const banner = btn.closest(".wire-banner");
        if (banner) banner.remove();
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    document.querySelectorAll("[data-wire-tabs]").forEach(initTabs);
    document.querySelectorAll("[data-wire-accordion]").forEach(initAccordion);
    document.querySelectorAll("[data-wire-megamenu]").forEach(initMegamenu);
    initDrawer();
    initInPageNav();
    initTextSize();
    initModal();
    initToast();
    initBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
