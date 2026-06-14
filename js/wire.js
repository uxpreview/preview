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

    function activate(idx, focus, updateHash, scrollToContent) {
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
      // On an explicit switch, return to the start of the new tab's content if the
      // user had scrolled down. The tab strip is sticky at --shell-header-h, so
      // aligning the tabs root to that offset lands the panel's first section just
      // below the strip. Only fires when scrolled past it, so a switch near the top
      // never jolts the page.
      if (scrollToContent) {
        const stickyTop = parseFloat(getComputedStyle(tablist).top) || 0;
        // Document-space target so it's stable even as the panel swap shrinks the
        // page. Jump instantly: a smooth scroll gets canceled by that same-tick
        // reflow. Only reset when the user has actually scrolled past the top.
        const target = root.getBoundingClientRect().top + window.scrollY - stickyTop;
        if (window.scrollY > target) window.scrollTo(0, target);
      }
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i, false, true, true));
      tab.addEventListener("keydown", (e) => {
        let next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next >= 0) { e.preventDefault(); activate(next, true, true, true); }
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

  /* ---------- Menu (action menu / dropdown) — ARIA APG menu button ----------
     A trigger button (aria-haspopup="menu", aria-expanded) controls a popup
     list of menuitems. Opening moves focus into the list; Up/Down/Home/End
     roam it; Escape closes and returns focus to the trigger; an outside click
     or activating an item closes it. The popup is plain DOM toggled with the
     hidden attribute — no portal, no scroll lock (it is not modal).
       Reads: data-wire-menu (root), data-wire-menu-trigger, data-wire-menu-popup */
  function initMenu(root) {
    const trigger = root.querySelector("[data-wire-menu-trigger]");
    const popup = root.querySelector("[data-wire-menu-popup]");
    if (!trigger || !popup) return;

    const items = () =>
      Array.from(popup.querySelectorAll('[role="menuitem"]')).filter(
        (el) => el.getAttribute("aria-disabled") !== "true" && !el.hasAttribute("disabled")
      );

    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    popup.hidden = true;

    function isOpen() {
      return trigger.getAttribute("aria-expanded") === "true";
    }

    function setOpen(open, focusFirst) {
      trigger.setAttribute("aria-expanded", String(open));
      popup.hidden = !open;
      if (open) {
        document.addEventListener("click", onDocClick, true);
        document.addEventListener("keydown", onKey);
        if (focusFirst !== false) {
          const list = items();
          if (list.length) list[0].focus();
        }
      } else {
        document.removeEventListener("click", onDocClick, true);
        document.removeEventListener("keydown", onKey);
      }
    }

    function onDocClick(e) {
      if (!root.contains(e.target)) setOpen(false, false);
    }

    function onKey(e) {
      const list = items();
      const idx = list.indexOf(document.activeElement);
      switch (e.key) {
        case "Escape":
          setOpen(false, false);
          trigger.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          (list[idx + 1] || list[0]).focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          (list[idx - 1] || list[list.length - 1]).focus();
          break;
        case "Home":
          e.preventDefault();
          if (list[0]) list[0].focus();
          break;
        case "End":
          e.preventDefault();
          if (list.length) list[list.length - 1].focus();
          break;
        case "Tab":
          // Moving out of the menu closes it (focus naturally leaves).
          setOpen(false, false);
          break;
      }
    }

    trigger.addEventListener("click", () => setOpen(!isOpen()));

    trigger.addEventListener("keydown", (e) => {
      if (!isOpen() && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        setOpen(true);
      }
    });

    // Activating an item closes the menu and returns focus to the trigger.
    popup.addEventListener("click", (e) => {
      const item = e.target.closest('[role="menuitem"]');
      if (item && item.getAttribute("aria-disabled") !== "true") {
        setOpen(false, false);
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

      // Give the dialog an accessible description by pointing aria-describedby
      // at the body (APG). Authors can override by setting it themselves.
      const bodyEl = modal.querySelector(".wire-modal__body");
      if (bodyEl && !modal.getAttribute("aria-describedby")) {
        if (!bodyEl.id) bodyEl.id = targetId + "-body";
        modal.setAttribute("aria-describedby", bodyEl.id);
      }

      // Static: a backdrop click does NOT dismiss (decisions that need an
      // explicit choice). Esc and the close/cancel controls still close it, so
      // the dialog is never a keyboard trap (WCAG 2.1.2).
      const isStatic = modal.hasAttribute("data-wire-modal-static");

      let previouslyFocused = null;

      function open() {
        previouslyFocused = document.activeElement;
        modal.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
        // Initial focus: an explicit [data-wire-modal-autofocus] target (e.g.
        // the safe action on a destructive confirm), else the first focusable.
        const target = modal.querySelector("[data-wire-modal-autofocus]") || modal.querySelector(FOCUSABLE);
        if (target) target.focus();
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
      if (backdrop && !isStatic) backdrop.addEventListener("click", close);

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
        trap(e);
      });
    });
  }

  /* ---------- Toast — transient status messages, WCAG 4.1.3 ---------- */
  function initToast() {
    // Two lazily-created regions: a polite one for confirmations and an
    // assertive one for errors that should interrupt. Pages without toasts
    // pay for neither. Errors render in the assertive region so screen
    // readers announce them at once; everything else stays polite.
    const regions = {};

    function ensureRegion(assertive) {
      const key = assertive ? "assertive" : "polite";
      if (regions[key]) return regions[key];
      const r = document.createElement("div");
      r.className = "wire-toast-region" + (assertive ? " wire-toast-region--assertive" : "");
      r.setAttribute("role", assertive ? "alert" : "status");
      r.setAttribute("aria-live", assertive ? "assertive" : "polite");
      r.setAttribute("aria-atomic", "false");
      document.body.appendChild(r);
      regions[key] = r;
      return r;
    }

    function show({ title = "", body = "", duration = 5000, assertive = false } = {}) {
      const r = ensureRegion(assertive);
      const toast = document.createElement("div");
      toast.className = "wire-toast" + (assertive ? " wire-toast--assertive" : "");
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

      // Auto-dismiss with hover/focus pause (NN/g): the countdown holds while
      // the pointer is over the toast or focus is inside it, so a user reading
      // — or a keyboard user tabbing to the close — is never rushed.
      let timer = null, remaining = duration, startedAt = 0;
      const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
      const startTimer = () => {
        if (duration <= 0) return;
        startedAt = performance.now();
        timer = setTimeout(dismiss, Math.max(remaining, 400));
      };
      const pause = () => {
        if (!timer) return;
        clear();
        remaining -= performance.now() - startedAt;
      };
      if (duration > 0) {
        toast.addEventListener("mouseenter", pause);
        toast.addEventListener("mouseleave", startTimer);
        toast.addEventListener("focusin", pause);
        toast.addEventListener("focusout", startTimer);
        startTimer();
      }

      toast.querySelector(".wire-toast__close").addEventListener("click", () => {
        clear();
        dismiss();
      });
    }

    // Public API.
    window.wireToast = show;

    // Declarative triggers: any [data-wire-toast-trigger] with data-toast-*.
    // data-toast-assertive (or data-toast-variant="error") routes the message
    // to the assertive region.
    document.querySelectorAll("[data-wire-toast-trigger]").forEach((btn) => {
      btn.addEventListener("click", () => {
        show({
          title: btn.getAttribute("data-toast-title") || "",
          body: btn.getAttribute("data-toast-body") || "",
          duration: Number(btn.getAttribute("data-toast-duration")) || 5000,
          assertive: btn.hasAttribute("data-toast-assertive") || btn.getAttribute("data-toast-variant") === "error",
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

  /* ---------- Tooltip — Esc dismisses without moving focus (WCAG 1.4.13) ----------
     The bubble itself is pure CSS (::after on [data-wire-tooltip]); this adds
     only the "dismissable" leg of SC 1.4.13: Escape hides the hint while the
     trigger keeps focus, and the hint returns on the next blur / pointer-leave
     so it is never lost. No JS is required for the tooltip to appear. */
  function initTooltip() {
    document.querySelectorAll("[data-wire-tooltip]").forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !el.classList.contains("is-tooltip-dismissed")) {
          el.classList.add("is-tooltip-dismissed");
          e.stopPropagation();
        }
      });
      const restore = () => el.classList.remove("is-tooltip-dismissed");
      el.addEventListener("blur", restore);
      el.addEventListener("mouseleave", restore);
    });
  }

  /* ---------- Rail disclosures: smooth expand/collapse (progressive enhancement) ----------
     Native <details> in the left rail snap open/closed. This animates the
     height of the content after each <summary> so sections and category groups
     glide (Nextra-style). With JS off the rail still works — it just snaps, as
     before. Honors prefers-reduced-motion by letting the native toggle run. */
  function initNavDisclosure() {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const DUR = 200;
    const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

    document.querySelectorAll(".wire-doc-nav details").forEach((d) => {
      const summary = d.querySelector(":scope > summary");
      const body = summary && summary.nextElementSibling;
      if (!summary || !body) return;
      let anim = null;

      summary.addEventListener("click", (e) => {
        // A section label can be a link (folder with an index page). Let clicks
        // on it navigate rather than toggle — don't preventDefault those.
        if (e.target.closest("a")) return;
        e.preventDefault();
        if (anim) { anim.cancel(); anim = null; }
        const opening = !d.open;
        if (opening) d.open = true;        // reveal before measuring
        const full = body.offsetHeight;
        const frames = [{ height: "0px", opacity: 0 }, { height: full + "px", opacity: 1 }];
        body.style.overflow = "hidden";
        anim = body.animate(opening ? frames : frames.slice().reverse(), { duration: DUR, easing: EASE });
        anim.onfinish = () => {
          body.style.overflow = "";
          body.style.height = "";
          if (!opening) d.open = false;    // hide only after the collapse finishes
          anim = null;
        };
      });
    });
  }

  /* ---------- Rail search: client-side filter over the nav links ----------
     Filters the left rail by component/section name as you type. Auto-expands
     groups that contain a match, hides the rest, and restores the prior
     open/closed state when cleared. Esc clears. This filters the NAV only — it
     is not a full-text page search. JS-only: the box is revealed by adding
     `.is-js` so it never shows as a dead control without scripting. */
  function initNavSearch() {
    const wrap = document.querySelector("[data-wire-nav-search]");
    if (!wrap) return;
    const input = wrap.querySelector("input");
    const nav = wrap.closest(".wire-doc-nav");
    if (!input || !nav) return;

    nav.classList.add("is-js");

    const links = Array.from(nav.querySelectorAll(".wire-doc-nav__link, .wire-doc-nav__top-link"));
    // Sections AND category groups are both <details>, so one list drives both
    // levels of disclosure — hidden/open settle deepest-first in filter().
    const details = Array.from(nav.querySelectorAll("details"));

    const empty = document.createElement("p");
    empty.className = "wire-doc-nav__noresults";
    empty.setAttribute("role", "status");
    empty.hidden = true;
    empty.textContent = "No matches.";
    nav.appendChild(empty);

    const rowFor = (a) => a.closest("li.wire-doc-nav__item") || a;
    const isVisible = (a) => !rowFor(a).hidden;
    let savedOpen = null;

    function restore() {
      links.forEach((a) => { rowFor(a).hidden = false; });
      details.forEach((d, i) => { d.hidden = false; if (savedOpen) d.open = savedOpen[i]; });
      savedOpen = null;
      empty.hidden = true;
    }

    function filter(raw) {
      const q = raw.trim().toLowerCase();
      if (!q) { restore(); return; }
      if (!savedOpen) savedOpen = details.map((d) => d.open);

      let any = false;
      links.forEach((a) => {
        const match = a.textContent.toLowerCase().includes(q);
        rowFor(a).hidden = !match;
        if (match) any = true;
      });
      // Deepest-first: a group's visibility/open settles before its parent
      // section (both are <details>). A leaf match reveals and opens its group
      // and section; a fully-filtered details is hidden.
      for (let i = details.length - 1; i >= 0; i--) {
        const d = details[i];
        const hit = Array.from(d.querySelectorAll(".wire-doc-nav__link, .wire-doc-nav__top-link")).some(isVisible);
        d.hidden = !hit;
        if (hit) d.open = true;
      }
      empty.hidden = any;
    }

    input.addEventListener("input", () => filter(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { input.value = ""; filter(""); }
    });
  }

  /* ---------- Theme toggle: light / dark / system ----------
     Stores the PREFERENCE (light|dark|system) and applies the RESOLVED theme
     (light|dark) to <html data-theme>. A pre-paint head script (injected by
     sync-nav into chrome pages) sets the same attribute before first paint, so
     there's no flash; this re-applies it and wires the control. Scoped to the
     doc-site shell so client demo pages are never themed. */
  function initTheme() {
    if (!document.body.classList.contains("wire-shell")) return;
    const root = document.documentElement;
    const nav = document.querySelector(".wire-doc-nav");
    if (nav) nav.classList.add("is-js");   // reveal the toggle (and search) once JS is live
    const group = document.querySelector("[data-wire-theme]");
    const KEY = "wire-theme";
    const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    const resolve = (pref) =>
      pref === "dark" ? "dark" : pref === "light" ? "light" : (mq && mq.matches ? "dark" : "light");

    function readPref() {
      try { return localStorage.getItem(KEY) || "system"; } catch (_) { return "system"; }
    }

    function apply(pref) {
      root.setAttribute("data-theme", resolve(pref));
      if (group) {
        group.querySelectorAll("[data-wire-theme-value]").forEach((b) => {
          b.setAttribute("aria-pressed", b.dataset.wireThemeValue === pref ? "true" : "false");
        });
      }
      try { localStorage.setItem(KEY, pref); } catch (_) {}
    }

    apply(readPref());

    if (group) {
      group.querySelectorAll("[data-wire-theme-value]").forEach((b) => {
        b.addEventListener("click", () => apply(b.dataset.wireThemeValue));
      });
    }

    if (mq) {
      const onChange = () => { if (readPref() === "system") root.setAttribute("data-theme", resolve("system")); };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------- Scrollable code blocks ----------
     A region that scrolls must be reachable and operable by keyboard (WCAG
     2.1.1; axe "scrollable-region-focusable"). Code samples overflow only at
     some widths, so mark just the ones that actually scroll — no inert tab
     stops on blocks that fit. Re-checked on resize. */
  function initScrollableCode() {
    const blocks = document.querySelectorAll("pre");
    const sync = () => blocks.forEach((pre) => {
      const scrolls = pre.scrollWidth > pre.clientWidth || pre.scrollHeight > pre.clientHeight;
      if (scrolls && !pre.hasAttribute("tabindex")) pre.setAttribute("tabindex", "0");
      else if (!scrolls && pre.getAttribute("tabindex") === "0") pre.removeAttribute("tabindex");
    });
    sync();
    let raf = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    });
  }

  /* ---------- Slider (range) ----------
     Keeps a visible <output> in sync with a native range input. The input
     already exposes role=slider + aria-valuenow to AT; the output is a
     sighted convenience. Optional data-wire-slider-suffix appends a unit. */
  function initSlider(root) {
    const range = root.querySelector(".wire-slider__range");
    const output = root.querySelector(".wire-slider__output");
    if (!range || !output) return;
    const suffix = root.getAttribute("data-wire-slider-suffix") || "";
    const sync = () => { output.textContent = range.value + suffix; };
    range.addEventListener("input", sync);
    sync();
  }

  /* ---------- Number stepper ----------
     −/+ buttons drive a native number input. The input itself stays the value
     carrier (role=spinbutton, arrow-key operable); buttons are a pointer/touch
     convenience. Buttons disable at the min/max bound. */
  function initNumberStepper(root) {
    const field = root.querySelector(".wire-number-stepper__field");
    if (!field) return;
    const dec = root.querySelector(".wire-number-stepper__btn--dec");
    const inc = root.querySelector(".wire-number-stepper__btn--inc");
    const step = parseFloat(field.step) || 1;
    const min = field.min !== "" ? parseFloat(field.min) : -Infinity;
    const max = field.max !== "" ? parseFloat(field.max) : Infinity;

    function nudge(delta) {
      const cur = parseFloat(field.value);
      let v = (isNaN(cur) ? (isFinite(min) ? min : 0) : cur) + delta;
      v = Math.min(max, Math.max(min, v));
      // round to the step grid to avoid float drift (0.1 + 0.2 …)
      if (isFinite(step) && step > 0) v = Math.round(v / step) * step;
      field.value = String(parseFloat(v.toFixed(10)));
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      syncBounds();
    }
    function syncBounds() {
      const cur = parseFloat(field.value);
      if (dec) dec.disabled = !isNaN(cur) && cur <= min;
      if (inc) inc.disabled = !isNaN(cur) && cur >= max;
    }
    if (dec) dec.addEventListener("click", () => nudge(-step));
    if (inc) inc.addEventListener("click", () => nudge(step));
    field.addEventListener("input", syncBounds);
    syncBounds();
  }

  /* ---------- File upload ----------
     Echoes the chosen filename(s) into a visible status next to the styled
     button. The native input keeps its own value for AT; the status is the
     sighted mirror (and is aria-live so the change is also announced). */
  function initFileUpload(root) {
    const input = root.querySelector(".wire-file__input");
    const status = root.querySelector("[data-wire-file-status]");
    if (!input || !status) return;
    const empty = status.getAttribute("data-wire-file-empty") || status.textContent.trim() || "No file chosen";
    input.addEventListener("change", () => {
      const files = input.files;
      if (!files || !files.length) { status.textContent = empty; return; }
      status.textContent = files.length === 1 ? files[0].name : files.length + " files selected";
    });
  }

  /* ---------- Rating (interactive) ----------
     A radio group in natural DOM order (so arrow keys behave), styled as
     stars. Fill is painted up to the hovered/focused/selected star; the radios
     remain the source of truth and the accessible control. */
  function initRating(root) {
    const options = Array.from(root.querySelectorAll(".wire-rating__option"));
    if (!options.length) return;
    const inputs = options.map((o) => o.querySelector("input"));
    const stars = options.map((o) => o.querySelector(".wire-rating__star"));
    const paint = (level) => stars.forEach((s, i) =>
      s.classList.toggle("wire-rating__star--filled", i < level));
    const current = () => {
      const idx = inputs.findIndex((i) => i && i.checked);
      return idx < 0 ? 0 : idx + 1;
    };
    options.forEach((o, i) => {
      o.addEventListener("mouseenter", () => paint(i + 1));
      if (inputs[i]) {
        inputs[i].addEventListener("focus", () => paint(i + 1));
        inputs[i].addEventListener("change", () => paint(current()));
        inputs[i].addEventListener("blur", () => paint(current()));
      }
    });
    root.addEventListener("mouseleave", () => paint(current()));
    paint(current());
  }

  /* ---------- Error summary ----------
     Each link focuses the field it names (not just scrolls to it), so keyboard
     and SR users land on the input. The app opts into moving focus to the
     summary on a failed submit via data-wire-error-summary-focus; we don't
     steal focus on load otherwise. */
  function initErrorSummary(root) {
    if (root.hasAttribute("data-wire-error-summary-focus")) {
      if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
      root.focus();
    }
    root.addEventListener("click", (e) => {
      const link = e.target.closest(".wire-error-summary__link");
      if (!link) return;
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const focusable = target.matches("input, select, textarea, button, [tabindex]")
        ? target
        : target.querySelector("input, select, textarea, button, [tabindex]");
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      if (focusable) focusable.focus({ preventScroll: true });
    });
  }

  /* ---------- Combobox (editable autocomplete) ----------
     APG combobox with list autocomplete. The text input (role=combobox) owns
     focus and keyboard; the listbox is a popup whose active option is tracked
     with aria-activedescendant (no roving focus). Typing filters; Arrow/Home/
     End move; Enter selects; Esc closes; outside click closes. */
  function initCombobox(root) {
    const input = root.querySelector(".wire-combobox__input");
    const listbox = root.querySelector(".wire-combobox__listbox");
    if (!input || !listbox) return;
    const toggle = root.querySelector(".wire-combobox__toggle");
    const empty = listbox.querySelector(".wire-combobox__empty");
    const allOptions = () => Array.from(listbox.querySelectorAll('[role="option"]'));
    const shownOptions = () => allOptions().filter((o) => !o.hidden);
    let activeId = null;

    function open() {
      if (!listbox.hidden) return;
      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }
    function close() {
      if (listbox.hidden) return;
      listbox.hidden = true;
      input.setAttribute("aria-expanded", "false");
      setActive(null);
    }
    function setActive(opt) {
      allOptions().forEach((o) => o.classList.remove("is-active"));
      if (opt) {
        opt.classList.add("is-active");
        input.setAttribute("aria-activedescendant", opt.id);
        activeId = opt.id;
        opt.scrollIntoView({ block: "nearest" });
      } else {
        input.removeAttribute("aria-activedescendant");
        activeId = null;
      }
    }
    function filter() {
      const q = input.value.trim().toLowerCase();
      let any = false;
      allOptions().forEach((o) => {
        const hay = (o.dataset.value || o.textContent).toLowerCase();
        const match = !q || hay.indexOf(q) !== -1;
        o.hidden = !match;
        if (match) any = true;
      });
      if (empty) empty.hidden = any;
      return any;
    }
    function selectOption(opt) {
      input.value = opt.dataset.value || opt.textContent.trim();
      allOptions().forEach((o) => o.setAttribute("aria-selected", "false"));
      opt.setAttribute("aria-selected", "true");
      filter();
      close();
      input.focus();
    }

    input.addEventListener("input", () => { filter(); open(); setActive(null); });
    input.addEventListener("keydown", (e) => {
      const opts = shownOptions();
      const curIdx = opts.findIndex((o) => o.id === activeId);
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (listbox.hidden) { filter(); open(); }
          setActive(opts[curIdx + 1] || opts[0]);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (listbox.hidden) { filter(); open(); }
          setActive(curIdx > 0 ? opts[curIdx - 1] : opts[opts.length - 1]);
          break;
        case "Enter":
          if (!listbox.hidden && activeId) {
            e.preventDefault();
            const o = document.getElementById(activeId);
            if (o) selectOption(o);
          }
          break;
        case "Escape":
          if (!listbox.hidden) { e.preventDefault(); close(); }
          break;
        case "Home":
          if (!listbox.hidden) { e.preventDefault(); setActive(opts[0]); }
          break;
        case "End":
          if (!listbox.hidden) { e.preventDefault(); setActive(opts[opts.length - 1]); }
          break;
      }
    });
    listbox.addEventListener("click", (e) => {
      const o = e.target.closest('[role="option"]');
      if (o) selectOption(o);
    });
    listbox.addEventListener("mousemove", (e) => {
      const o = e.target.closest('[role="option"]');
      if (o && o.id !== activeId) setActive(o);
    });
    if (toggle) {
      toggle.addEventListener("click", () => {
        if (listbox.hidden) { filter(); open(); } else { close(); }
        input.focus();
      });
    }
    document.addEventListener("click", (e) => { if (!root.contains(e.target)) close(); });
  }

  /* ---------- Boot ---------- */
  function boot() {
    document.querySelectorAll("[data-wire-slider]").forEach(initSlider);
    document.querySelectorAll("[data-wire-number-stepper]").forEach(initNumberStepper);
    document.querySelectorAll("[data-wire-file]").forEach(initFileUpload);
    document.querySelectorAll("[data-wire-rating]").forEach(initRating);
    document.querySelectorAll("[data-wire-error-summary]").forEach(initErrorSummary);
    document.querySelectorAll("[data-wire-combobox]").forEach(initCombobox);
    document.querySelectorAll("[data-wire-tabs]").forEach(initTabs);
    document.querySelectorAll("[data-wire-accordion]").forEach(initAccordion);
    document.querySelectorAll("[data-wire-megamenu]").forEach(initMegamenu);
    document.querySelectorAll("[data-wire-menu]").forEach(initMenu);
    initDrawer();
    initInPageNav();
    initTextSize();
    initModal();
    initToast();
    initBanner();
    initTooltip();
    initNavDisclosure();
    initNavSearch();
    initTheme();
    initScrollableCode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
