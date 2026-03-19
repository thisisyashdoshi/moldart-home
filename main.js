const updateYear = () => {
  document.querySelectorAll('.yr').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
};

const initMobileMenu = () => {
  const menuButton = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mob-menu');
  if (!menuButton || !mobileMenu) return;

  menuButton.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    menuButton.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    const paletteOpen = document.getElementById('command-palette')?.classList.contains('is-open');
    if (!paletteOpen) document.body.classList.remove('scroll-locked');
  };

  window.closeMob = closeMenu;

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.classList.toggle('is-open');
    mobileMenu.classList.toggle('open');
    document.body.classList.toggle('scroll-locked', !expanded);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.classList.contains('open')) return;
    if (mobileMenu.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });
};

const initNavShadow = () => {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const sync = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
};

const initNavActive = () => {
  const route = document.body.getAttribute('data-route');
  if (!route) return;

  const href = route === 'home' ? '/' : `/${route}/`;
  document.querySelectorAll(`.nav-link[href="${href}"], .nav-link[href="/${route}"]`).forEach(link => {
    link.classList.add('is-active');
    link.setAttribute('aria-current', 'page');
  });
};

const initFadeUps = () => {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  items.forEach((item) => observer.observe(item));

  // Safety net: reveal all fade-ups after 3s in case observer fails
  setTimeout(() => {
    items.forEach((item) => item.classList.add('visible'));
  }, 3000);
};

const initFormSuccess = () => {
  const params = new URLSearchParams(window.location.search);

  // Handle ?submitted=true
  if (params.get('submitted') === 'true') {
    const alert = document.getElementById('form-success-alert');
    if (alert) {
      alert.classList.remove('hidden');
      params.delete('submitted');
      const remaining = params.toString();
      const cleanUrl = window.location.pathname + (remaining ? '?' + remaining : '');
      window.history.replaceState({}, document.title, cleanUrl);
      alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Handle ?product= pre-fill on contact form
  const product = params.get('product');
  if (product) {
    const select = document.querySelector('select[name="interest"]');
    if (select) {
      const options = Array.from(select.options);
      const match = options.find(opt => opt.value.toLowerCase() === product.toLowerCase());
      if (match) {
        select.value = match.value;
      }
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const unique = (values) => [...new Set(values.filter(Boolean))];

const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

const renderFilterGroup = (label, group, options) => `
  <div class="filter-group">
    <div class="section-label mb-3">${label}</div>
    <div class="filter-chip-row">
      ${options.map((option) => `<button type="button" class="filter-chip${option === 'All' ? ' is-active' : ''}" data-group="${group}" data-value="${option}">${option}</button>`).join('')}
    </div>
  </div>
`;

const renderProductCard = (product) => {
  const inquiryLink = `/contact/?product=${encodeURIComponent(product.name)}`;
  return `
    <details class="directory-card card-hover">
      <summary>
        <div class="directory-card-image img-hover"><img src="${product.image}" alt="${product.name}" width="600" height="400" loading="lazy"></div>
        <div class="directory-card-body">
          <div class="directory-card-meta">
            <span class="directory-pill">${product.material}</span>
            <span class="directory-pill">${product.stage}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.summary}</p>
          <span class="directory-toggle">View technical notes</span>
        </div>
      </summary>
      <div class="directory-card-panel">
        <div>
          <div class="section-label mb-3">Key Specifications</div>
          <ul class="directory-list">${product.specs.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div>
          <div class="section-label mb-3">Typical Applications</div>
          <ul class="directory-list">${product.applications.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="directory-card-footer">
          <p class="text-sm text-zinc-500">${product.customization}</p>
          <a class="btn-primary" href="${inquiryLink}">Share Requirement</a>
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
        <th>Customization</th>
        <th>Inquiry Route</th>
      </tr>
    </thead>
    <tbody>
      ${products.map((product) => `
        <tr>
          <td><strong>${product.name}</strong></td>
          <td>${product.use}</td>
          <td>${product.industry.join(', ')}</td>
          <td>${product.customization}</td>
          <td><a href="/contact/?product=${encodeURIComponent(product.name)}">Contact</a></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

const syncFilterState = (root, state) => {
  root.querySelectorAll('.filter-chip').forEach((button) => {
    const active = state[button.dataset.group] === button.dataset.value;
    button.classList.toggle('is-active', active);
  });
};

const renderSkeleton = () => `
  <div class="skeleton-grid">
    ${Array.from({length: 4}, () => `
      <div class="skeleton-card">
        <div class="skeleton-card-image"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line skeleton-line-sm"></div>
          <div class="skeleton-line skeleton-line-lg"></div>
          <div class="skeleton-line skeleton-line-md"></div>
        </div>
      </div>
    `).join('')}
  </div>
`;

const initIndustryExplorer = async () => {
  const root = document.getElementById('product-directory-root');
  if (!root) return;

  // Show loading skeleton while fetching
  root.insertAdjacentHTML('afterbegin', `<div id="directory-skeleton" class="fade-up visible">${renderSkeleton()}</div>`);

  try {
    const [catalogResponse, faqResponse] = await Promise.all([
      fetch('/data/product-directory.json'),
      fetch('/data/faq.json')
    ]);

    if (!catalogResponse.ok) throw new Error(`Catalog failed: ${catalogResponse.status}`);
    if (!faqResponse.ok) throw new Error(`FAQ failed: ${faqResponse.status}`);

    const catalog = await catalogResponse.json();
    const faq = await faqResponse.json();
    const filters = {
      material: ['All', ...unique(catalog.products.map((item) => item.material))],
      stage: ['All', ...unique(catalog.products.map((item) => item.stage))],
      use: ['All', ...unique(catalog.products.map((item) => item.use))],
      industry: ['All', ...unique(catalog.products.flatMap((item) => item.industry))]
    };

    // Remove skeleton
    const skeleton = root.querySelector('#directory-skeleton');
    if (skeleton) skeleton.remove();

    root.insertAdjacentHTML('afterbegin', `
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
          ${renderFilterGroup('Material', 'material', filters.material)}
          ${renderFilterGroup('Stage', 'stage', filters.stage)}
          ${renderFilterGroup('Use', 'use', filters.use)}
          ${renderFilterGroup('Industry', 'industry', filters.industry)}
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
          <div id="directory-faq">${faq.items.map((item, index) => `
            <details class="faq-item" ${index === 0 ? 'open' : ''}>
              <summary>${item.question}</summary>
              <p>${item.answer}</p>
            </details>
          `).join('')}</div>
        </section>
      </div>
    `);

    const state = { material: 'All', stage: 'All', use: 'All', industry: 'All', search: '' };
    const search = root.querySelector('#directory-search');
    const grid = root.querySelector('#directory-grid');
    const matrix = root.querySelector('#application-matrix');
    const count = root.querySelector('#directory-count');

    // Pre-fill search if navigating from bento grid or cmd+k
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('q');
    if (initialSearch) {
      state.search = initialSearch.toLowerCase();
      search.value = initialSearch;
    }

    const update = () => {
      const results = catalog.products.filter((product) => {
        const haystack = [product.name, product.summary, product.material, product.stage, product.use, ...product.industry, ...product.specs, ...product.applications].join(' ').toLowerCase();
        const matchesSearch = !state.search || haystack.includes(state.search);
        const matchesMaterial = state.material === 'All' || product.material === state.material;
        const matchesStage = state.stage === 'All' || product.stage === state.stage;
        const matchesUse = state.use === 'All' || product.use === state.use;
        const matchesIndustry = state.industry === 'All' || product.industry.includes(state.industry);
        return matchesSearch && matchesMaterial && matchesStage && matchesUse && matchesIndustry;
      });

      count.textContent = `${results.length} product option${results.length === 1 ? '' : 's'} shown`;
      if (results.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;"><p class="text-sm text-zinc-500">No products match your selected filters. Please adjust your search or <button type="button" id="empty-state-reset" class="link-line text-zinc-700 font-medium" style="background:none;border:none;cursor:pointer;font-size:inherit;">reset all filters</button>.</p></div>';
        const resetBtn = grid.querySelector('#empty-state-reset');
        if (resetBtn) resetBtn.addEventListener('click', () => root.querySelector('#directory-reset').click());
      } else {
        grid.innerHTML = results.map(renderProductCard).join('');
      }
      matrix.innerHTML = renderMatrix(results);
    };

    root.querySelectorAll('.filter-chip').forEach((button) => {
      button.addEventListener('click', () => {
        state[button.dataset.group] = button.dataset.value;
        syncFilterState(root, state);
        update();
      });
    });

    root.querySelector('#directory-reset').addEventListener('click', () => {
      state.material = 'All';
      state.stage = 'All';
      state.use = 'All';
      state.industry = 'All';
      state.search = '';
      search.value = '';
      syncFilterState(root, state);
      update();
    });

    search.addEventListener('input', debounce(() => {
      state.search = search.value.trim().toLowerCase();
      update();
    }, 150));

    syncFilterState(root, state);
    update();
  } catch (error) {
    console.error(error);
    const skeleton = root.querySelector('#directory-skeleton');
    if (skeleton) skeleton.remove();
    root.insertAdjacentHTML('afterbegin', '<div class="p-8 text-center border rounded-xl"><p>The interactive directory is temporarily unavailable. Please use the catalog and contact section below for technical assistance.</p></div>');
  }
};

const initCommandPalette = () => {
  const overlay = document.getElementById('command-palette');
  const input = document.getElementById('cmd-input');
  const resultsContainer = document.getElementById('cmd-results');
  if (!overlay || !input || !resultsContainer) return;

  const cmdIndex = [
    { type: 'Page', title: 'Home', url: '/', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { type: 'Page', title: 'About Moldart', url: '/about/', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>' },
    { type: 'Page', title: 'Product Directory', url: '/industry/', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
    { type: 'Page', title: 'Contact & Inquiry', url: '/contact/', icon: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>' },
    { type: 'Page', title: 'Trade Portal', url: '/login/', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>' },

    { type: 'Lamination Tooling', title: 'Press Plates', url: '/industry/?q=press+plates', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },
    { type: 'Lamination Tooling', title: 'Press Pads', url: '/industry/?q=press+pads', icon: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>' },
    { type: 'Lamination Tooling', title: 'Engraved Cylinders', url: '/industry/?q=cylinders', icon: '<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    { type: 'Lamination Tooling', title: 'Printed Decor Paper', url: '/industry/?q=decor+paper', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },
    { type: 'Engineered Substrates', title: 'Plywood', url: '/industry/?q=plywood', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>' },
    { type: 'Engineered Substrates', title: 'Fiberboard (MDF/HDF)', url: '/industry/?q=fiberboard', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>' },
    { type: 'Engineered Substrates', title: 'Particleboard', url: '/industry/?q=particleboard', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>' },
    { type: 'Engineered Substrates', title: 'OSB', url: '/industry/?q=osb', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>' },
    { type: 'Finished Products', title: 'Wood Flooring', url: '/industry/?q=flooring', icon: '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8l-4 4v14a2 2 0 002 2z"/>' },
    { type: 'Finished Products', title: 'Flooring Accessories', url: '/industry/?q=accessories', icon: '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8l-4 4v14a2 2 0 002 2z"/>' },
    { type: 'Finished Products', title: 'Ready-Made Furniture', url: '/industry/?q=ready-made', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' },
    { type: 'Finished Products', title: 'Custom Furniture', url: '/industry/?q=custom+furniture', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' },
    { type: 'Architectural Steel', title: 'Decorative SS Panels', url: '/industry/?q=decorative+ss', icon: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
    { type: 'Architectural Steel', title: 'SS Profiles', url: '/industry/?q=profiles', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
    { type: 'Architectural Steel', title: 'SS Furniture', url: '/industry/?q=ss+furniture', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' },
    { type: 'Architectural Steel', title: 'Industrial Press Plates', url: '/industry/?q=industrial+press', icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>' },

    { type: 'Action', title: 'Download Company Catalog (PDF)', url: '/downloads/INTRODUCTION TO MOLDART.pdf', icon: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>' }
  ];

  let selectedIndex = 0;
  let currentResults = cmdIndex;

  let previousFocus = null;

  const openCmd = () => {
    previousFocus = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('scroll-locked');
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 50);
  };

  const closeCmd = () => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('scroll-locked');
    input.blur();
    if (previousFocus) { previousFocus.focus(); previousFocus = null; }
  };

  const renderResults = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      currentResults = cmdIndex;
    } else {
      currentResults = cmdIndex.filter(item =>
        item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      );
    }

    if (currentResults.length === 0) {
      selectedIndex = 0;
      resultsContainer.innerHTML = '<div class="p-4 text-center text-sm text-zinc-500">No results found.</div>';
      return;
    }

    // Clamp selectedIndex to valid range
    selectedIndex = Math.min(selectedIndex, currentResults.length - 1);

    const groups = {};
    currentResults.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });

    let html = '';
    let globalIndex = 0;

    Object.entries(groups).forEach(([type, items]) => {
      html += `<div class="cmd-palette-group-label">${type}</div>`;
      items.forEach(item => {
        const isActive = globalIndex === selectedIndex ? ' is-active' : '';
        html += `
          <a href="${item.url}" class="cmd-palette-item${isActive}" data-index="${globalIndex}" tabindex="-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
            ${item.title}
          </a>
        `;
        globalIndex++;
      });
    });

    resultsContainer.innerHTML = html;

    const activeEl = resultsContainer.querySelector('.is-active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  };

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('is-open')) closeCmd();
      else openCmd();
    }

    if (!overlay.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeCmd();
    }

    if (e.key === 'ArrowDown' && currentResults.length) {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % currentResults.length;
      renderResults(input.value);
    }

    if (e.key === 'ArrowUp' && currentResults.length) {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
      renderResults(input.value);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const activeEl = resultsContainer.querySelector('.is-active');
      if (activeEl) {
        window.location.href = activeEl.getAttribute('href');
      }
    }

    // Trap Tab inside palette
    if (e.key === 'Tab') {
      e.preventDefault();
      input.focus();
    }
  });

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeCmd();
  });

  input.addEventListener('input', (e) => {
    selectedIndex = 0;
    renderResults(e.target.value);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  updateYear();
  initNavActive();
  initMobileMenu();
  initNavShadow();
  initFadeUps();
  initFormSuccess();
  initIndustryExplorer();
  initCommandPalette();

  // OS-aware keyboard shortcut hints
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('.cmd-k-hint kbd').forEach(kbd => {
    if (kbd.textContent.trim() === '⌘K') kbd.textContent = isMac ? '⌘K' : 'Ctrl+K';
  });
});
