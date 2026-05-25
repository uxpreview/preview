/* ============================================================
   Primacy Wireframe System — behavior.
   One script. Auto-initializes anything with a data-p-* attribute.
   No dependencies. Drop in <body> with `defer`.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Tabs (ARIA pattern) ---------- */
  function initTabs(root) {
    const tablist = root.querySelector('[role="tablist"]');
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));

    function activate(idx, focus) {
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
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i));
      tab.addEventListener("keydown", (e) => {
        let next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next >= 0) { e.preventDefault(); activate(next, true); }
      });
    });

    const initialIdx = Math.max(0, tabs.findIndex(t => t.getAttribute("aria-selected") === "true"));
    activate(initialIdx);
  }

  /* ---------- Accordion (single-open option) ---------- */
  function initAccordion(root) {
    if (root.dataset.pAccordion !== "single") return;
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
    const trigger = root.querySelector("[data-p-megamenu-trigger]");
    const panel = root.querySelector(".p-megamenu__panel");
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

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    const toggles = document.querySelectorAll("[data-p-drawer-open]");
    toggles.forEach((toggle) => {
      const targetId = toggle.getAttribute("data-p-drawer-open");
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const backdrop = drawer.nextElementSibling && drawer.nextElementSibling.classList.contains("p-drawer-backdrop")
        ? drawer.nextElementSibling
        : null;

      function open() {
        drawer.classList.add("is-open");
        if (backdrop) backdrop.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        const first = drawer.querySelector("button, a, input, select, textarea");
        if (first) first.focus();
      }

      function close() {
        drawer.classList.remove("is-open");
        if (backdrop) backdrop.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }

      toggle.setAttribute("aria-controls", targetId);
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", open);

      const closeBtns = drawer.querySelectorAll("[data-p-drawer-close]");
      closeBtns.forEach((btn) => btn.addEventListener("click", close));
      if (backdrop) backdrop.addEventListener("click", close);

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
      });
    });
  }

  /* ---------- In-page nav: highlight current section on scroll ---------- */
  function initInPageNav() {
    const navs = document.querySelectorAll("[data-p-inpagenav]");
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

  /* ---------- Boot ---------- */
  function boot() {
    document.querySelectorAll("[data-p-tabs]").forEach(initTabs);
    document.querySelectorAll("[data-p-accordion]").forEach(initAccordion);
    document.querySelectorAll("[data-p-megamenu]").forEach(initMegamenu);
    initDrawer();
    initInPageNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
