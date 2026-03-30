"use strict";

/* ── Service Worker ── */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

/* ── Helpers ── */
const escapeHTML = (e) => {
  const t = document.createElement("div");
  return t.appendChild(document.createTextNode(e)), t.innerHTML;
};

const unique = (e) => [...new Set(e.filter(Boolean))];

const debounce = (fn, ms) => {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
};

/* ── Year ── */
const updateYear = () => {
  document.querySelectorAll(".yr").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
};

/* ── Mobile Menu ── */
const initMobileMenu = () => {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mob-menu");
  if (!btn || !menu) return;

  btn.setAttribute("aria-expanded", "false");

  const close = () => {
    menu.classList.remove("open");
    btn.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    const paletteOpen = document.getElementById("command-palette")?.classList.contains("is-open");
    if (!paletteOpen) document.body.classList.remove("scroll-locked");
  };

  document.addEventListener("moldart:closemob", close);
  window.closeMob = close;

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    btn.classList.toggle("is-open");
    menu.classList.toggle("open");
    document.body.classList.toggle("scroll-locked", !expanded);
  });

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

  document.addEventListener("click", (ev) => {
    if (menu.classList.contains("open") && !menu.contains(ev.target) && !btn.contains(ev.target)) {
      close();
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && menu.classList.contains("open")) close();
  });
};

/* ── Nav Shadow ── */
const initNavShadow = () => {
  const nav = document.querySelector("nav");
  if (!nav) return;
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  update();
  window.addEventListener("scroll", update, { passive: true });
};

/* ── Nav Active State ── */
const initNavActive = () => {
  const route = document.body.getAttribute("data-route");
  if (!route) return;

  // Map sub-routes to parent nav items
  const parentMap = {
    "products": "products",
    "applications": "applications",
    "resources": "resources",
    "faq": "faq",
    "process": "process",
    "about": "about",
    "contact": "contact",
    "home": "home"
  };

  // Determine the parent route for nav highlighting
  const parentRoute = parentMap[route] || route.split("/")[0] || route;
  const href = parentRoute === "home" ? "/" : `/${parentRoute}/`;

  document.querySelectorAll(`.nav-link[href="${href}"], .nav-link[href="/${parentRoute}"]`).forEach((el) => {
    el.classList.add("is-active");
    el.setAttribute("aria-current", "page");
  });
};

/* ── Fade-Up Animations ── */
const initFadeUps = () => {
  const els = document.querySelectorAll(".fade-up");
  if (!els.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );
  els.forEach((el) => obs.observe(el));
  setTimeout(() => els.forEach((el) => el.classList.add("visible")), 3000);
};

/* ── Form Success Handler ── */
const initFormSuccess = () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("submitted") === "true") {
    const alert = document.getElementById("form-success-alert");
    if (alert) {
      alert.classList.remove("hidden");
      params.delete("submitted");
      const qs = params.toString();
      const clean = window.location.pathname + (qs ? "?" + qs : "");
      window.history.replaceState({}, document.title, clean);
      alert.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const product = params.get("product");
  if (product) {
    const sel = document.querySelector('select[name="interest"]');
    if (sel) {
      const opt = Array.from(sel.options).find((o) => o.value.toLowerCase() === product.toLowerCase());
      if (opt) sel.value = opt.value;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

/* ── Product Directory (Industry Explorer) ── */
const renderFilterGroup = (label, group, values) => `
  <div class="filter-group">
    <div class="section-label mb-3">${label}</div>
    <div class="filter-chip-row">
      ${values.map((v) => `<button type="button" class="filter-chip${v === "All" ? " is-active" : ""}" data-group="${group}" data-value="${v}" aria-pressed="${v === "All"}">${v}</button>`).join("")}
    </div>
  </div>
`;

const renderProductCard = (p) => {
  const href = `/contact/?product=${encodeURIComponent(p.name)}`;
  return `
    <details class="directory-card card-hover">
      <summary>
        <div class="directory-card-image img-hover"><picture><source srcset="${escapeHTML(p.image).replace(/\.webp$/, ".avif")}" type="image/avif"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" width="600" height="400" loading="lazy"></picture></div>
        <div class="directory-card-body">
          <div class="directory-card-meta">
            <span class="directory-pill">${escapeHTML(p.material)}</span>
            <span class="directory-pill">${escapeHTML(p.stage)}</span>
          </div>
          <h3>${escapeHTML(p.name)}</h3>
          <p>${escapeHTML(p.summary)}</p>
          <span class="directory-toggle">View technical notes</span>
        </div>
      </summary>
      <div class="directory-card-panel">
        <div>
          <div class="section-label mb-3">Key Specifications</div>
          <ul class="directory-list">${p.specs.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ul>
        </div>
        <div>
          <div class="section-label mb-3">Typical Applications</div>
          <ul class="directory-list">${p.applications.map((a) => `<li>${escapeHTML(a)}</li>`).join("")}</ul>
        </div>
        <div class="directory-card-footer">
          <p class="text-sm text-zinc-500">${escapeHTML(p.customization)}</p>
          <a class="btn-primary" href="${href}">Share Requirement</a>
        </div>
      </div>
    </details>
  `;
};

const renderMatrix = (products) => `
  <table class="directory-table">
    <thead>
      <tr>
        <th>Product</th>
        <th>Main Function</th>
        <th>Typical Industries</th>
        <th>Material Grades</th>
        <th>Certifications</th>
        <th>Lead Time</th>
        <th>Inquiry Route</th>
      </tr>
    </thead>
    <tbody>
      ${products.map((p) => `
        <tr>
          <td><strong>${escapeHTML(p.name)}</strong></td>
          <td>${escapeHTML(p.use)}</td>
          <td>${p.industry.map((i) => escapeHTML(i)).join(", ")}</td>
          <td>${p.technical?.grades ? p.technical.grades.join(", ") : "-"}</td>
          <td>${p.technical?.certifications ? p.technical.certifications.join(", ") : "-"}</td>
          <td>${escapeHTML(p.technical?.leadTime || "-")}</td>
          <td><a href="/contact/?product=${encodeURIComponent(p.name)}">Contact</a></td>
        </tr>
      `).join("")}
    </tbody>
  </table>
`;

const syncFilterState = (root, filters) => {
  root.querySelectorAll(".filter-chip").forEach((chip) => {
    const active = filters[chip.dataset.group] === chip.dataset.value;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
};

const renderSkeleton = () => `
  <div class="skeleton-grid">
    ${Array.from({ length: 4 }, () => `
      <div class="skeleton-card">
        <div class="skeleton-card-image"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line skeleton-line-sm"></div>
          <div class="skeleton-line skeleton-line-lg"></div>
          <div class="skeleton-line skeleton-line-md"></div>
        </div>
      </div>
    `).join("")}
  </div>
`;

const initIndustryExplorer = async () => {
  const root = document.getElementById("product-directory-root");
  if (!root) return;

  root.insertAdjacentHTML("afterbegin", `<div id="directory-skeleton" class="fade-up visible">${renderSkeleton()}</div>`);

  try {
    const [catRes, faqRes] = await Promise.all([
      fetch("/data/product-directory.json"),
      fetch("/data/faq.json"),
    ]);
    if (!catRes.ok) throw new Error(`Catalog failed: ${catRes.status}`);
    if (!faqRes.ok) throw new Error(`FAQ failed: ${faqRes.status}`);

    const catalog = await catRes.json();
    const faq = await faqRes.json();

    const facets = {
      material: ["All", ...unique(catalog.products.map((p) => p.material))],
      stage: ["All", ...unique(catalog.products.map((p) => p.stage))],
      use: ["All", ...unique(catalog.products.map((p) => p.use))],
      industry: ["All", ...unique(catalog.products.flatMap((p) => p.industry))],
    };

    const skel = root.querySelector("#directory-skeleton");
    if (skel) skel.remove();

    root.insertAdjacentHTML("afterbegin", `
      <div class="directory-shell fade-up visible">
        <div class="directory-head">
          <div>
            <div class="section-label mb-3">Interactive Directory</div>
            <h2 class="font-display font-black text-3xl mb-3">FIND THE RIGHT PRODUCT FASTER.</h2>
            <p class="text-sm text-zinc-500 leading-relaxed max-w-lg">Use filters, search, and expandable technical drawers to move from category browsing to requirement clarity without visual clutter.</p>
          </div>
          <label class="directory-search">
            <span class="section-label">Search</span>
            <input id="directory-search" class="directory-search-input" type="search" placeholder="Search product, use-case, or application">
          </label>
        </div>
        <div class="filter-panel">
          ${renderFilterGroup("Material", "material", facets.material)}
          ${renderFilterGroup("Stage", "stage", facets.stage)}
          ${renderFilterGroup("Use", "use", facets.use)}
          ${renderFilterGroup("Industry", "industry", facets.industry)}
        </div>
        <div class="directory-results-meta mb-6">
          <div class="section-label" id="directory-count" aria-live="polite"></div>
          <button class="btn-ghost" id="directory-reset" type="button">Reset filters</button>
        </div>
        <div class="product-directory-grid" id="directory-grid"></div>
      </div>
      <div class="mt-10 flex flex-col gap-10">
        <section class="matrix-card fade-up visible mt-10">
          <div class="section-label mb-4">Application Matrix</div>
          <div style="overflow-x:auto;" id="application-matrix"></div>
        </section>
        <section class="faq-shell fade-up visible mt-10">
          <div class="section-label mb-4">Commercial FAQ</div>
          <div id="directory-faq">${(faq.categories ? faq.categories.flatMap(c => c.items) : faq.items || []).map((item, idx) => `
            <details class="faq-item"${idx === 0 ? " open" : ""}>
              <summary>${item.question}</summary>
              <p>${item.answer}</p>
            </details>
          `).join("")}</div>
        </section>
      </div>
    `);

    const filters = { material: "All", stage: "All", use: "All", industry: "All", search: "" };
    const searchInput = root.querySelector("#directory-search");
    const grid = root.querySelector("#directory-grid");
    const matrix = root.querySelector("#application-matrix");
    const count = root.querySelector("#directory-count");

    const qParam = new URLSearchParams(window.location.search).get("q");
    if (qParam) {
      filters.search = qParam.toLowerCase();
      searchInput.value = qParam;
    }

    const render = () => {
      const filtered = catalog.products.filter((p) => {
        const text = [p.name, p.summary, p.material, p.stage, p.use, ...p.industry, ...p.specs, ...p.applications].join(" ").toLowerCase();
        return (
          (!filters.search || text.includes(filters.search)) &&
          (filters.material === "All" || p.material === filters.material) &&
          (filters.stage === "All" || p.stage === filters.stage) &&
          (filters.use === "All" || p.use === filters.use) &&
          (filters.industry === "All" || p.industry.includes(filters.industry))
        );
      });

      count.textContent = `${filtered.length} product option${filtered.length === 1 ? "" : "s"} shown`;

      if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;"><p class="text-sm text-zinc-500">No products match your selected filters. Please adjust your search or <button type="button" id="empty-state-reset" class="link-line text-zinc-700 font-medium" style="background:none;border:none;cursor:pointer;font-size:inherit;">reset all filters</button>.</p></div>';
        const resetBtn = grid.querySelector("#empty-state-reset");
        if (resetBtn) resetBtn.addEventListener("click", () => root.querySelector("#directory-reset").click());
      } else {
        grid.innerHTML = filtered.map(renderProductCard).join("");
      }
      matrix.innerHTML = renderMatrix(filtered);
    };

    root.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        filters[chip.dataset.group] = chip.dataset.value;
        syncFilterState(root, filters);
        render();
      });
    });

    root.querySelector("#directory-reset").addEventListener("click", () => {
      filters.material = "All";
      filters.stage = "All";
      filters.use = "All";
      filters.industry = "All";
      filters.search = "";
      searchInput.value = "";
      syncFilterState(root, filters);
      render();
    });

    searchInput.addEventListener("input", debounce(() => {
      filters.search = searchInput.value.trim().toLowerCase();
      render();
    }, 150));

    syncFilterState(root, filters);
    render();
  } catch (err) {
    console.error(err);
    const skel = root.querySelector("#directory-skeleton");
    if (skel) skel.remove();
    root.insertAdjacentHTML("afterbegin", '<div class="p-8 text-center border rounded-xl"><p>The interactive directory is temporarily unavailable. Please use the catalog and contact section below for technical assistance.</p></div>');
  }
};

/* ── Command Palette ── */
const initCommandPalette = () => {
  const palette = document.getElementById("command-palette");
  const input = document.getElementById("cmd-input");
  const results = document.getElementById("cmd-results");
  if (!palette || !input || !results) return;

  const iconPage = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>';
  const iconHome = '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>';
  const iconInfo = '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>';
  const iconGrid = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>';
  const iconPhone = '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>';
  const iconBox = '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>';
  const iconRect = '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>';
  const iconGlobe = '<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>';
  const iconFile = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>';
  const iconLayers = '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>';
  const iconActivity = '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>';
  const iconDownload = '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>';
  const iconQuestion = '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
  const iconBook = '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>';
  const iconFloor = '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8l-4 4v14a2 2 0 002 2z"/>';
  const iconBuild = '<path d="M2 20h20M5 20V8l7-5 7 5v12"/><rect x="9" y="12" width="6" height="8"/>';
  const iconCpu = '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>';

  const entries = [
    // Pages
    { type: "Page", title: "Home", url: "/", icon: iconHome },
    { type: "Page", title: "Products", url: "/products/", icon: iconGrid },
    { type: "Page", title: "Applications", url: "/applications/", icon: iconLayers },
    { type: "Page", title: "About Moldart", url: "/about/", icon: iconInfo },
    { type: "Page", title: "Resources & Downloads", url: "/resources/", icon: iconBook },
    { type: "Page", title: "Contact & Inquiry", url: "/contact/", icon: iconPhone },
    { type: "Page", title: "FAQ", url: "/faq/", icon: iconQuestion },
    { type: "Page", title: "How We Work", url: "/process/", icon: iconActivity },
    { type: "Page", title: "Insights", url: "/insights/", icon: iconFile },
    { type: "Page", title: "Trade Portal", url: "/login/", icon: iconGlobe },

    // Lamination Tooling
    { type: "Lamination Tooling", title: "Press Plates", url: "/products/press-plates/", icon: iconBox },
    { type: "Lamination Tooling", title: "Press Pads", url: "/products/press-pads/", icon: iconRect },
    { type: "Lamination Tooling", title: "Engraved Cylinders", url: "/products/engraved-cylinders/", icon: iconGlobe },
    { type: "Lamination Tooling", title: "Printed Decor Paper", url: "/products/printed-decor-paper/", icon: iconFile },

    // Engineered Substrates
    { type: "Engineered Substrates", title: "Plywood", url: "/products/plywood/", icon: iconRect },
    { type: "Engineered Substrates", title: "Fiberboard (MDF/HDF)", url: "/products/fiberboard/", icon: iconRect },
    { type: "Engineered Substrates", title: "OSB", url: "/products/osb/", icon: iconRect },
    { type: "Engineered Substrates", title: "Particleboard", url: "/products/particleboard/", icon: iconRect },

    // Finished Products
    { type: "Finished Products", title: "Wood Flooring", url: "/products/wood-flooring/", icon: iconFloor },
    { type: "Finished Products", title: "Flooring Accessories", url: "/products/flooring-accessories/", icon: iconFloor },
    { type: "Finished Products", title: "Ready-Made Furniture", url: "/products/ready-made-furniture/", icon: iconRect },
    { type: "Finished Products", title: "Custom Furniture", url: "/products/custom-furniture/", icon: iconRect },

    // Architectural Steel
    { type: "Architectural Steel", title: "Decorative SS Panels", url: "/products/decorative-ss-panels/", icon: iconLayers },
    { type: "Architectural Steel", title: "SS Profiles", url: "/products/ss-profiles/", icon: iconActivity },
    { type: "Architectural Steel", title: "SS Furniture", url: "/products/ss-furniture/", icon: iconRect },
    { type: "Architectural Steel", title: "Industrial Press Plates", url: "/products/industrial-press-plates/", icon: iconBox },

    // Applications
    { type: "Application", title: "Lamination", url: "/applications/lamination/", icon: iconLayers },
    { type: "Application", title: "Furniture Manufacturing", url: "/applications/furniture/", icon: iconRect },
    { type: "Application", title: "Flooring", url: "/applications/flooring/", icon: iconFloor },
    { type: "Application", title: "Architecture & Interiors", url: "/applications/architecture/", icon: iconBuild },
    { type: "Application", title: "Metal Finishing", url: "/applications/metal-finishing/", icon: iconActivity },
    { type: "Application", title: "PCB & CCL", url: "/applications/pcb-ccl/", icon: iconCpu },

    // Downloads
    { type: "Download", title: "Company Catalog (PDF)", url: "/downloads/INTRODUCTION TO MOLDART.pdf", icon: iconDownload },
  ];

  let activeIndex = 0;
  let filtered = entries;
  let lastFocused = null;

  const close = () => {
    palette.classList.remove("is-open");
    document.body.classList.remove("scroll-locked");
    input.blur();
    if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  const renderResults = (query) => {
    const q = query.toLowerCase().trim();
    filtered = q
      ? entries.filter((e) => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
      : entries;

    if (filtered.length === 0) {
      activeIndex = 0;
      results.innerHTML = '<div class="p-4 text-center text-sm text-zinc-500">No results found.</div>';
      return;
    }

    activeIndex = Math.min(activeIndex, filtered.length - 1);

    const groups = {};
    filtered.forEach((e) => {
      if (!groups[e.type]) groups[e.type] = [];
      groups[e.type].push(e);
    });

    let html = "";
    let idx = 0;
    Object.entries(groups).forEach(([group, items]) => {
      html += `<div class="cmd-palette-group-label">${group}</div>`;
      items.forEach((item) => {
        const isActive = idx === activeIndex;
        html += `
          <a href="${item.url}" class="cmd-palette-item${isActive ? " is-active" : ""}" data-index="${idx}" tabindex="-1" role="option" aria-selected="${isActive}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
            ${item.title}
          </a>
        `;
        idx++;
      });
    });

    results.innerHTML = html;
    const active = results.querySelector(".is-active");
    if (active) active.scrollIntoView({ block: "nearest" });
  };

  document.addEventListener("keydown", (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "k") {
      ev.preventDefault();
      if (palette.classList.contains("is-open")) {
        close();
      } else {
        lastFocused = document.activeElement;
        palette.classList.add("is-open");
        document.body.classList.add("scroll-locked");
        input.value = "";
        renderResults("");
        setTimeout(() => input.focus(), 50);
      }
    }

    if (palette.classList.contains("is-open")) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        close();
      }
      if (ev.key === "ArrowDown" && filtered.length) {
        ev.preventDefault();
        activeIndex = (activeIndex + 1) % filtered.length;
        renderResults(input.value);
      }
      if (ev.key === "ArrowUp" && filtered.length) {
        ev.preventDefault();
        activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        renderResults(input.value);
      }
      if (ev.key === "Enter") {
        ev.preventDefault();
        const el = results.querySelector(".is-active");
        if (el) window.location.href = el.getAttribute("href");
      }
      if (ev.key === "Tab") {
        ev.preventDefault();
        input.focus();
      }
    }
  });

  palette.addEventListener("mousedown", (ev) => {
    if (ev.target === palette) close();
  });

  input.addEventListener("input", (ev) => {
    activeIndex = 0;
    renderResults(ev.target.value);
  });
};

/* ── Scroll to Top ── */
const initScrollToTop = () => {
  const btn = document.querySelector(".scroll-top-btn");
  if (!btn) return;
  const update = () => btn.classList.toggle("is-visible", window.scrollY > 400);
  update();
  window.addEventListener("scroll", update, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
};

/* ── Lightbox ── */
const initLightbox = () => {
  const overlay = document.querySelector(".lightbox-overlay");
  if (!overlay) return;
  const img = overlay.querySelector("img");

  const closeLb = () => overlay.classList.remove("is-open");

  document.addEventListener("click", (ev) => {
    const target = ev.target.closest(".directory-card-image img, .bento-box img");
    if (target) {
      ev.preventDefault();
      img.src = target.src;
      img.alt = target.alt || "";
      overlay.classList.add("is-open");
    }
  });

  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay || ev.target.closest(".lightbox-close")) closeLb();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && overlay.classList.contains("is-open")) closeLb();
  });
};

/* ── Form Loading State ── */
const initFormLoading = () => {
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  form.addEventListener("submit", () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.classList.add("is-loading");
      btn.textContent = "Submitting...";
    }
  });
};

/* ── Init ── */
document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  initNavActive();
  initMobileMenu();
  initNavShadow();
  initFadeUps();
  initFormSuccess();
  initIndustryExplorer();
  initCommandPalette();
  initScrollToTop();
  initLightbox();
  initFormLoading();
  initChatbot();
  initInsightsFilter();

  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll(".cmd-k-hint kbd").forEach((kbd) => {
    const text = kbd.textContent.trim();
    if (text === "⌘K" || text === "Ctrl/⌘ K" || text === "Ctrl+K") {
      kbd.textContent = isMac ? "⌘K" : "Ctrl+K";
    }
  });
});
