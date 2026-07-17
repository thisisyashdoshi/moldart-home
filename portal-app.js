(() => {
  'use strict';

  if (!window.location.pathname.startsWith('/portal/')) return;

  const mount = document.querySelector('#portal-app[data-portal-view]');
  if (!mount) return;

  const STORAGE_KEY = 'moldart-portal-demo-v2026-48';
  const VIEW = mount.dataset.portalView || 'auth';
  const AUTH_VIEWS = new Set(['auth', 'sign-in', 'sign-up']);
  const WORKSPACE_VIEWS = new Set(['dashboard', 'catalog', 'rfq', 'approvals', 'orders']);
  const ORDER_STAGES = ['PI issued', 'Production', 'Inspection', 'Shipped', 'Arrived'];

  const PRODUCTS = [
    {
      id: 'press-plates',
      name: 'Press Plates',
      route: 'Lamination tooling',
      image: '/images/page5_img1.webp',
      summary: 'Chrome-finished transfer plates for decorative laminate programmes.',
      tags: ['Texture transfer', 'Sheet ready', 'MOQ controlled'],
      page: '/products/press-plates/',
      reference: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf',
      unit: 'plate'
    },
    {
      id: 'press-pads',
      name: 'Press Pads',
      route: 'Lamination tooling',
      image: '/images/page5_img2.webp',
      summary: 'Composite press pads for heat and pressure balance in the press route.',
      tags: ['Heat balance', 'Pad life', 'Plate pair'],
      page: '/products/press-pads/',
      reference: '/downloads/INTRODUCTION TO MOLDART.pdf',
      unit: 'pad'
    },
    {
      id: 'decor-paper',
      name: 'Printed Decor Paper',
      route: 'Surface layer',
      image: '/images/page7_img4.webp',
      summary: 'Printed decor papers for laminate, furniture, and panel programmes.',
      tags: ['Design-led', 'Batch control', 'Sheet ready'],
      page: '/products/printed-decor-paper/',
      reference: '/downloads/HPL - OL - 1.pdf',
      unit: 'ream'
    },
    {
      id: 'decorative-panels',
      name: 'Decorative SS Panels',
      route: 'Architecture + interiors',
      image: '/images/page9_img1.webp',
      summary: 'Decorative stainless sheet and panel routes for interior applications.',
      tags: ['Sheet finish', 'Architecture', 'Approval-led'],
      page: '/products/decorative-ss-panels/',
      reference: '/products/decorative-ss-panels/',
      unit: 'sheet'
    },
    {
      id: 'wood-flooring',
      name: 'Wood Flooring',
      route: 'Flooring systems',
      image: '/images/page7_img1.webp',
      summary: 'Engineered flooring systems with coordinated accessories and documents.',
      tags: ['Flooring', 'Accessories', 'Project-led'],
      page: '/products/wood-flooring/',
      reference: '/downloads/WOOD - FLOORING.pdf',
      unit: 'sqm'
    },
    {
      id: 'industrial-press-plates',
      name: 'Industrial Press Plates',
      route: 'Industrial tooling',
      image: '/images/page9_img4.webp',
      summary: 'Industrial pressing plates for electronics and technical lamination routes.',
      tags: ['Industrial', 'Tolerance-led', 'Receiving checks'],
      page: '/products/industrial-press-plates/',
      reference: '/products/industrial-press-plates/',
      unit: 'plate'
    }
  ];

  const SELLERS = [
    {
      id: 'seller-a',
      name: 'Ningbo tooling desk',
      port: 'FOB Ningbo',
      leadTime: '5 weeks',
      quality: 'Tighter on tooling files',
      prices: {
        'press-plates': 100,
        'press-pads': 46,
        'decor-paper': 8,
        'decorative-panels': 132,
        'wood-flooring': 20,
        'industrial-press-plates': 142
      },
      moq: {
        'press-plates': 40,
        'press-pads': 8,
        'decor-paper': 20,
        'decorative-panels': 24,
        'wood-flooring': 300,
        'industrial-press-plates': 20
      }
    },
    {
      id: 'seller-b',
      name: 'Shanghai materials desk',
      port: 'FOB Shanghai',
      leadTime: '6 weeks',
      quality: 'Balanced commercial route',
      prices: {
        'press-plates': 97,
        'press-pads': 49,
        'decor-paper': 7,
        'decorative-panels': 126,
        'wood-flooring': 19,
        'industrial-press-plates': 139
      },
      moq: {
        'press-plates': 60,
        'press-pads': 10,
        'decor-paper': 30,
        'decorative-panels': 30,
        'wood-flooring': 400,
        'industrial-press-plates': 24
      }
    },
    {
      id: 'seller-c',
      name: 'Qingdao export desk',
      port: 'FOB Qingdao',
      leadTime: '7 weeks',
      quality: 'Lower MOQ on selected items',
      prices: {
        'press-plates': 102,
        'press-pads': 44,
        'decor-paper': 8.5,
        'decorative-panels': 129,
        'wood-flooring': 21,
        'industrial-press-plates': 136
      },
      moq: {
        'press-plates': 20,
        'press-pads': 6,
        'decor-paper': 15,
        'decorative-panels': 18,
        'wood-flooring': 250,
        'industrial-press-plates': 12
      }
    }
  ];

  const DEMO_HISTORY = {
    id: 'ORD-8834',
    sellerId: 'seller-b',
    stage: 3,
    payment: 'PI confirmed',
    eta: 'ETA 11 days',
    updatedAt: 'Today',
    docs: [
      { label: 'Proforma invoice', href: '/downloads/INTRODUCTION TO MOLDART.pdf' },
      { label: 'Selected technical sheet', href: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { label: 'Dispatch note', href: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' }
    ]
  };

  function defaultState() {
    return {
      session: null,
      ui: {
        catalogSearch: '',
        catalogRoute: 'all',
        authPortal: 'buyer',
        authMode: VIEW === 'sign-up' ? 'register' : 'sign-in'
      },
      rfq: {
        id: 'RFQ-24021',
        currency: 'USD',
        incoterm: 'FOB China port',
        destination: 'Mumbai',
        targetWindow: '6 weeks',
        note: '',
        preferredSeller: 'seller-a',
        items: [
          { productId: 'press-plates', qty: 60 },
          { productId: 'press-pads', qty: 12 }
        ]
      },
      approvals: {
        technical: false,
        commercial: false,
        baseline: false,
        logistics: false
      },
      order: null,
      history: [DEMO_HISTORY]
    };
  }

  function normalizeState(state) {
    const base = defaultState();
    const session = state?.session
      ? {
          portalType: state.session.portalType || 'buyer',
          name: state.session.name || 'Portal User',
          company: state.session.company || 'Portal Company',
          email: state.session.email || 'portal@company.com',
          role: state.session.role || (state.session.portalType === 'seller' ? 'Sales' : 'Procurement')
        }
      : null;

    return {
      ...base,
      ...state,
      session,
      ui: { ...base.ui, ...(state?.ui || {}) },
      rfq: {
        ...base.rfq,
        ...(state?.rfq || {}),
        items: Array.isArray(state?.rfq?.items)
          ? state.rfq.items.filter((item) => PRODUCTS.some((product) => product.id === item.productId))
          : base.rfq.items
      },
      approvals: { ...base.approvals, ...(state?.approvals || {}) },
      history: Array.isArray(state?.history) && state.history.length ? state.history : base.history
    };
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultState());
    } catch (_) {
      return defaultState();
    }
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function esc(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name = 'arrow') {
    const icons = {
      arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"></path></svg>',
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle></svg>',
      file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>',
      rfq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>',
      compare: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18"></path><path d="M5 7h7"></path><path d="M5 17h7"></path><path d="M12 7h7"></path><path d="M12 17h7"></path></svg>',
      shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17h4V5H2v12h3"></path><path d="M14 9h4l4 4v4h-2"></path><circle cx="7.5" cy="17.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>',
      repeat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>',
      spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z"></path></svg>',
      logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>',
      check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
      image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-5-5L5 21"></path></svg>',
      wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V7Z"></path><path d="M16 13h4"></path><path d="M18 11v4"></path></svg>',
      building: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M9 10h.01"></path><path d="M9 14h.01"></path><path d="M15 10h.01"></path><path d="M15 14h.01"></path></svg>'
    };
    return `<span class="portal-icon">${icons[name] || icons.arrow}</span>`;
  }

  function money(value = 0, currency = 'USD') {
    const code = /^[A-Z]{3}$/.test(String(currency || '').toUpperCase()) ? String(currency).toUpperCase() : 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(Number(value) || 0);
    } catch (_) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
    }
  }

  function portalType() {
    return state.session?.portalType || state.ui.authPortal || 'buyer';
  }

  function isSellerPortal() {
    return portalType() === 'seller';
  }

  function currentUser() {
    if (state.session) return state.session;
    return isSellerPortal()
      ? { portalType: 'seller', name: 'Seller User', company: 'Seller Desk', email: 'seller@company.com', role: 'Sales' }
      : { portalType: 'buyer', name: 'Buyer User', company: 'Buyer Team', email: 'buyer@company.com', role: 'Procurement' };
  }

  function portalCopy() {
    return isSellerPortal()
      ? {
          portalLabel: 'Seller portal',
          workspaceLead: 'Review product lines, respond to enquiries, manage documents, and update orders, payments, and logistics.',
          catalogLabel: 'Products',
          inquiryLabel: 'Enquiries',
          inquiryAction: 'Add to quote pack',
          compareLabel: 'Commercial benchmark',
          basketLabel: 'Quote pack',
          docsLabel: 'Documents + release',
          ordersLabel: 'Orders + tracking',
          repeatLabel: 'Reopen programme'
        }
      : {
          portalLabel: 'Buyer portal',
          workspaceLead: 'Review products, raise enquiries, release documents, place orders, and track payments and logistics.',
          catalogLabel: 'Products',
          inquiryLabel: 'Inquiries',
          inquiryAction: 'Add to inquiry',
          compareLabel: 'Commercial compare',
          basketLabel: 'Inquiry basket',
          docsLabel: 'Documents + approvals',
          ordersLabel: 'Orders + tracking',
          repeatLabel: 'Repeat order'
        };
  }

  function authContext() {
    const seller = state.ui.authPortal === 'seller';
    return seller
      ? {
          roleOptions: ['Sales', 'Operations', 'Documentation', 'Logistics'],
          title: 'Open the seller workspace.',
          signInCopy: 'Sign in to review enquiries, documents, orders, payments, and dispatch status.',
          registerCopy: 'Register the seller desk, set the role, and continue into the workspace.',
          companyPlaceholder: 'Seller desk name',
          emailPlaceholder: 'seller@company.com'
        }
      : {
          roleOptions: ['Procurement', 'Technical', 'Commercial', 'Management'],
          title: 'Open the buyer workspace.',
          signInCopy: 'Sign in to review products, submit enquiries, place orders, and track payments and logistics.',
          registerCopy: 'Register the buyer team, set the role, and continue into the workspace.',
          companyPlaceholder: 'Buyer company',
          emailPlaceholder: 'buyer@company.com'
        };
  }

  function getProduct(id) {
    return PRODUCTS.find((product) => product.id === id);
  }

  function rfqItems() {
    return state.rfq.items
      .map((item) => ({ ...item, product: getProduct(item.productId) }))
      .filter((item) => item.product);
  }

  function quoteOffers() {
    const items = rfqItems();
    if (!items.length) return [];
    return SELLERS.map((seller) => {
      const subtotal = items.reduce((sum, item) => sum + ((seller.prices[item.productId] || 0) * item.qty), 0);
      const moqFailed = items.some((item) => item.qty < (seller.moq[item.productId] || 1));
      return {
        ...seller,
        subtotal,
        moqFailed,
        selected: state.rfq.preferredSeller === seller.id
      };
    }).sort((a, b) => a.subtotal - b.subtotal);
  }

  function preferredOffer() {
    return quoteOffers().find((offer) => offer.id === state.rfq.preferredSeller) || quoteOffers()[0] || null;
  }

  function pendingApprovalCount() {
    return Object.values(state.approvals).filter((value) => !value).length;
  }

  function approvalsReady() {
    return Object.values(state.approvals).every(Boolean) && !!preferredOffer() && rfqItems().length > 0;
  }

  function activeOrder() {
    return state.order || state.history[0] || null;
  }

  function addItem(productId) {
    const existing = state.rfq.items.find((item) => item.productId === productId);
    if (existing) existing.qty += 1;
    else state.rfq.items.push({ productId, qty: 1 });
    saveState();
    toast(isSellerPortal() ? 'Added to quote pack' : 'Added to inquiry');
    render();
  }

  function removeItem(productId) {
    state.rfq.items = state.rfq.items.filter((item) => item.productId !== productId);
    saveState();
    render();
  }

  function updateItemQty(productId, value) {
    const target = state.rfq.items.find((item) => item.productId === productId);
    if (!target) return;
    target.qty = Math.max(1, Number(value) || 1);
    saveState();
    render();
  }

  function setRfqField(field, value) {
    state.rfq[field] = value;
    saveState();
  }

  function chooseSeller(sellerId) {
    state.rfq.preferredSeller = sellerId;
    saveState();
    toast('Commercial option selected');
    render();
  }

  function toggleApproval(key) {
    state.approvals[key] = !state.approvals[key];
    saveState();
    render();
  }

  function markAllApprovals() {
    Object.keys(state.approvals).forEach((key) => {
      state.approvals[key] = true;
    });
    saveState();
    toast('All checks completed');
    render();
  }

  function createOrder() {
    const offer = preferredOffer();
    if (!offer || !approvalsReady()) return;
    state.order = {
      id: `ORD-${String(Date.now()).slice(-4)}`,
      sellerId: offer.id,
      stage: 0,
      payment: 'PI awaiting confirmation',
      eta: 'ETA pending release',
      updatedAt: 'Just now',
      docs: [
        { label: 'Proforma invoice', href: '/downloads/INTRODUCTION TO MOLDART.pdf' },
        { label: 'Selected technical sheet', href: rfqItems()[0]?.product?.page || '/products/' },
        { label: 'Reference file', href: rfqItems()[0]?.product?.reference || '/resources/' }
      ]
    };
    saveState();
    toast('Order created');
    window.location.href = '/portal/orders/';
  }

  function advanceOrder() {
    if (!state.order) state.order = { ...DEMO_HISTORY };
    state.order.stage = Math.min(ORDER_STAGES.length - 1, Number(state.order.stage || 0) + 1);
    state.order.updatedAt = 'Just now';
    state.order.payment = state.order.stage > 0 ? 'PI confirmed' : 'PI awaiting confirmation';
    state.order.eta = state.order.stage >= 3 ? 'ETA 11 days' : state.order.stage >= 1 ? 'ETA pending vessel booking' : 'ETA pending release';
    saveState();
    toast('Order stage updated');
    render();
  }

  function repeatOrder() {
    state.rfq.id = `RFQ-${String(Date.now()).slice(-5)}`;
    state.approvals = { technical: false, commercial: false, baseline: false, logistics: false };
    saveState();
    toast(isSellerPortal() ? 'Programme reopened' : 'Repeat inquiry opened');
    window.location.href = '/portal/rfq/';
  }

  function signIn(payload) {
    const seller = payload.portalType === 'seller';
    state.session = {
      portalType: payload.portalType || 'buyer',
      name: payload.name || payload.email.split('@')[0].replace(/[._-]+/g, ' '),
      company: payload.company || (seller ? 'Seller desk' : 'Buyer team'),
      email: payload.email,
      role: payload.role || (seller ? 'Sales' : 'Procurement')
    };
    state.ui.authPortal = payload.portalType || 'buyer';
    state.ui.authMode = 'sign-in';
    saveState();
    window.location.href = '/portal/dashboard/';
  }

  function signOut() {
    state.session = null;
    state.ui.authMode = 'sign-in';
    saveState();
    window.location.href = '/portal/';
  }

  function setAuthPortal(type) {
    state.ui.authPortal = type === 'seller' ? 'seller' : 'buyer';
    saveState();
    render();
  }

  function setAuthMode(mode) {
    state.ui.authMode = mode === 'register' ? 'register' : 'sign-in';
    saveState();
    render();
  }

  function workspaceNav(active) {
    const copy = portalCopy();
    const items = [
      { key: 'dashboard', href: '/portal/dashboard/', label: 'Overview' },
      { key: 'catalog', href: '/portal/catalog/', label: copy.catalogLabel },
      { key: 'rfq', href: '/portal/rfq/', label: copy.inquiryLabel },
      { key: 'approvals', href: '/portal/approvals/', label: 'Documents' },
      { key: 'orders', href: '/portal/orders/', label: copy.ordersLabel }
    ];
    return `<div class="portal-prototype-nav portal-workspace-nav">${items.map((item) => `<a href="${item.href}" class="portal-prototype-link${active === item.key ? ' is-active' : ''}">${esc(item.label)}</a>`).join('')}</div>`;
  }

  function workspaceFrame(active, content) {
    const copy = portalCopy();
    const user = currentUser();
    return `
      <section class="portal-workspace-shell">
        <div class="portal-topbar">
          <div class="portal-topbar-user">
            <div class="portal-avatar">${esc((user.name || 'P').slice(0, 1).toUpperCase())}</div>
            <div><strong>${esc(user.name)}</strong><span>${esc(user.company)} · ${esc(user.role)}</span></div>
          </div>
          <div class="portal-topbar-actions">
            <a href="/portal/catalog/" class="btn-outline portal-action-link">${esc(copy.catalogLabel)}</a>
            <button type="button" class="btn-outline portal-action-link" data-portal-action="sign-out">${icon('logout')} Sign out</button>
          </div>
        </div>
        <article class="portal-block-card portal-workspace-head">
          <div class="portal-mini-kicker">${isSellerPortal() ? icon('building') : icon('user')} ${esc(copy.portalLabel)}</div>
          <p class="portal-workspace-note">${esc(copy.workspaceLead)}</p>
          ${workspaceNav(active)}
        </article>
        ${content}
      </section>`;
  }

  function renderLocked() {
    mount.innerHTML = `
      <article class="portal-empty-card">
        <div class="portal-mini-kicker">${icon('user')} Access required</div>
        <h3>Sign in or register to open this workspace.</h3>
        <p>Portal access starts from one buyer or seller login surface.</p>
        <div class="portal-card-actions">
          <a href="/portal/" class="btn-primary portal-action-link">Open sign in</a>
          <a href="/portal/sign-up/" class="btn-outline portal-action-link">Register</a>
        </div>
      </article>`;
  }

  function renderAccess() {
    const ctx = authContext();
    const mode = state.ui.authMode === 'register' ? 'register' : 'sign-in';
    const seller = state.ui.authPortal === 'seller';
    const previewItems = seller
      ? ['Products', 'Enquiries', 'Documents', 'Orders', 'Payments', 'Logistics']
      : ['Products', 'Inquiries', 'Documents', 'Orders', 'Payments', 'Logistics'];

    mount.innerHTML = `
      <div class="portal-auth-shell-live">
        <article class="portal-block-card portal-auth-form-wrap">
          <div class="portal-mini-kicker">${seller ? icon('building') : icon('user')} ${seller ? 'Seller access' : 'Buyer access'}</div>
          <div class="portal-auth-toggle-stack">
            <div class="portal-filter-row">
              <button type="button" class="portal-filter-chip${seller ? '' : ' is-active'}" data-portal-action="set-auth-portal" data-portal-type="buyer">Buyer</button>
              <button type="button" class="portal-filter-chip${seller ? ' is-active' : ''}" data-portal-action="set-auth-portal" data-portal-type="seller">Seller</button>
            </div>
          </div>
          <h2>${esc(ctx.title)}</h2>
          <p>${esc(mode === 'sign-in' ? ctx.signInCopy : ctx.registerCopy)}</p>
          <form class="portal-live-form" data-portal-form="${mode}">
            ${mode === 'sign-in'
              ? `
                <label><span>Work email</span><input type="email" name="email" placeholder="${esc(ctx.emailPlaceholder)}" required></label>
                <label><span>Password</span><input type="password" name="password" placeholder="••••••••" required></label>
              `
              : `
                <label><span>Company</span><input type="text" name="company" placeholder="${esc(ctx.companyPlaceholder)}" required></label>
                <label><span>Full name</span><input type="text" name="name" placeholder="Your name" required></label>
                <label><span>Work email</span><input type="email" name="email" placeholder="${esc(ctx.emailPlaceholder)}" required></label>
                <label><span>Role</span><select name="role">${ctx.roleOptions.map((option) => `<option>${esc(option)}</option>`).join('')}</select></label>
              `}
            <button type="submit" class="btn-primary portal-action-link">${mode === 'sign-in' ? 'Open portal' : 'Register and open portal'}</button>
          </form>
        </article>
        <article class="portal-block-card portal-auth-visual-wrap">
          <div class="portal-mini-kicker">${icon('spark')} Inside the workspace</div>
          <div class="portal-auth-points">${previewItems.map((item) => `<span>${esc(item)}</span>`).join('')}</div>
          <div class="portal-hero-media-grid portal-hero-media-grid-tight">
            ${PRODUCTS.slice(0, 3).map((product) => `<figure class="portal-thumb-card"><img src="${product.image}" alt="${esc(product.name)}" loading="lazy"><figcaption>${esc(product.name)}</figcaption></figure>`).join('')}
          </div>
          <div class="portal-link-list">
            <a href="/products/" class="portal-inline-link">${icon('image')} Review products</a>
            <a href="/resources/" class="portal-inline-link">${icon('file')} Technical sheets</a>
            <a href="/process/" class="portal-inline-link">${icon('rfq')} Inquiry to order flow</a>
          </div>
        </article>
      </div>`;
  }

  function renderDashboard() {
    const copy = portalCopy();
    const stats = isSellerPortal()
      ? [
          { label: 'Product lines', value: PRODUCTS.length, note: 'Lines visible in the portal.' },
          { label: 'Buyer enquiries', value: rfqItems().length ? 1 : 0, note: 'Working enquiry pack.' },
          { label: 'Pending docs', value: pendingApprovalCount(), note: 'Checks still open.' },
          { label: 'Live orders', value: activeOrder() ? 1 : 0, note: 'Orders under execution.' }
        ]
      : [
          { label: 'Shortlisted products', value: rfqItems().length, note: 'Items moved into the inquiry.' },
          { label: 'Open inquiries', value: rfqItems().length ? 1 : 0, note: 'Current working inquiry.' },
          { label: 'Pending docs', value: pendingApprovalCount(), note: 'Documents and checks still open.' },
          { label: 'Live orders', value: activeOrder() ? 1 : 0, note: 'Orders under execution.' }
        ];

    const content = `
      <div class="portal-dashboard-grid">
        ${stats.map((stat) => `<article class="portal-kpi-card"><div class="portal-mini-kicker">${esc(stat.label)}</div><div class="portal-kpi-value">${esc(stat.value)}</div><p>${esc(stat.note)}</p></article>`).join('')}
      </div>
      <div class="portal-quick-grid">
        <a href="/portal/catalog/" class="portal-prototype-card"><div class="portal-mini-kicker">${icon('image')} ${esc(copy.catalogLabel)}</div><h3>Review products</h3><p>Open sheets, references, and product imagery.</p><span class="portal-prototype-card-link">Open</span></a>
        <a href="/portal/rfq/" class="portal-prototype-card"><div class="portal-mini-kicker">${icon('rfq')} ${esc(copy.inquiryLabel)}</div><h3>Build the inquiry</h3><p>Confirm quantities, commercials, and route fit.</p><span class="portal-prototype-card-link">Open</span></a>
        <a href="/portal/approvals/" class="portal-prototype-card"><div class="portal-mini-kicker">${icon('shield')} Documents</div><h3>Release documents</h3><p>Keep files, comments, and checks together.</p><span class="portal-prototype-card-link">Open</span></a>
        <a href="/portal/orders/" class="portal-prototype-card"><div class="portal-mini-kicker">${icon('truck')} Orders</div><h3>Track execution</h3><p>Follow payment status and logistics movement.</p><span class="portal-prototype-card-link">Open</span></a>
      </div>
      <div class="portal-screen-grid">
        <article class="portal-block-card">
          <div class="portal-mini-kicker">${icon('spark')} Working now</div>
          <div class="portal-timeline">
            <div class="portal-timeline-item"><strong>${esc(state.rfq.id)}</strong><span>${rfqItems().length} item(s) in the ${esc(copy.inquiryLabel.toLowerCase())} flow</span></div>
            <div class="portal-timeline-item"><strong>Documents</strong><span>${pendingApprovalCount()} check(s) still open</span></div>
            <div class="portal-timeline-item"><strong>${activeOrder() ? esc(activeOrder().id) : 'Order pending'}</strong><span>${activeOrder() ? esc(ORDER_STAGES[activeOrder().stage || 0]) : 'Create the order after documents are cleared'}</span></div>
          </div>
        </article>
        <article class="portal-block-card">
          <div class="portal-mini-kicker">${icon('file')} Workspace snapshot</div>
          <table class="portal-screen-table">
            <thead><tr><th>Module</th><th>Status</th><th>Owner</th></tr></thead>
            <tbody>
              <tr><td data-label="Module">${esc(copy.catalogLabel)}</td><td data-label="Status"><span class="portal-status-chip">${PRODUCTS.length} products</span></td><td data-label="Owner">${esc(currentUser().company)}</td></tr>
              <tr><td data-label="Module">${esc(copy.inquiryLabel)}</td><td data-label="Status"><span class="portal-status-chip is-live">${esc(state.rfq.id)}</span></td><td data-label="Owner">${esc(currentUser().role)}</td></tr>
              <tr><td data-label="Module">Orders</td><td data-label="Status"><span class="portal-status-chip">${esc(activeOrder() ? ORDER_STAGES[activeOrder().stage || 0] : 'Pending')}</span></td><td data-label="Owner">Operations</td></tr>
            </tbody>
          </table>
        </article>
      </div>`;

    mount.innerHTML = workspaceFrame('dashboard', content);
  }

  function catalogFilters() {
    const routes = ['all', ...new Set(PRODUCTS.map((product) => product.route))];
    return `
      <div class="portal-toolbar">
        <label class="portal-search-box">${icon('image')}<input type="search" value="${esc(state.ui.catalogSearch)}" placeholder="Search products or routes" data-portal-input="catalog-search"></label>
        <div class="portal-filter-row">
          ${routes.map((route) => `<button type="button" class="portal-filter-chip${state.ui.catalogRoute === route ? ' is-active' : ''}" data-portal-route="${esc(route)}">${esc(route === 'all' ? 'All routes' : route)}</button>`).join('')}
        </div>
      </div>`;
  }

  function productCard(product) {
    const copy = portalCopy();
    const inRfq = state.rfq.items.some((item) => item.productId === product.id);
    return `
      <article class="portal-product-card">
        <div class="portal-product-media"><img src="${product.image}" alt="${esc(product.name)}" loading="lazy"></div>
        <div class="portal-product-body">
          <div class="portal-mini-kicker">${icon('image')} ${esc(product.route)}</div>
          <h3>${esc(product.name)}</h3>
          <p>${esc(product.summary)}</p>
          <div class="portal-chip-row">${product.tags.map((tag) => `<span class="portal-chip">${esc(tag)}</span>`).join('')}</div>
          <div class="portal-card-actions">
            <a href="${product.page}" class="btn-outline portal-action-link">Open sheet</a>
            <button type="button" class="btn-primary portal-action-link" data-portal-action="add-item" data-product="${product.id}">${inRfq ? 'Add again' : esc(copy.inquiryAction)}</button>
          </div>
        </div>
      </article>`;
  }

  function renderBasketSummary() {
    const copy = portalCopy();
    const items = rfqItems();
    return `
      <article class="portal-block-card portal-basket-card">
        <div class="portal-mini-kicker">${icon('rfq')} ${esc(copy.basketLabel)}</div>
        <h3>${items.length ? `${items.length} item(s)` : 'No items yet'}</h3>
        <div class="portal-basket-list">
          ${items.length ? items.map((item) => `<div class="portal-basket-row"><strong>${esc(item.product.name)}</strong><span>${item.qty} ${esc(item.product.unit)}</span></div>`).join('') : '<p>Add items from the product view.</p>'}
        </div>
        <div class="portal-card-actions">
          <a href="/portal/rfq/" class="btn-outline portal-action-link">Open ${esc(copy.inquiryLabel.toLowerCase())}</a>
        </div>
      </article>`;
  }

  function renderCatalog() {
    const search = state.ui.catalogSearch.trim().toLowerCase();
    const route = state.ui.catalogRoute;
    const visible = PRODUCTS.filter((product) => {
      const matchesSearch = !search || `${product.name} ${product.route} ${product.summary}`.toLowerCase().includes(search);
      const matchesRoute = route === 'all' || product.route === route;
      return matchesSearch && matchesRoute;
    });

    const content = `
      ${catalogFilters()}
      <div class="portal-catalog-layout">
        <div class="portal-product-grid">${visible.map(productCard).join('')}</div>
        ${renderBasketSummary()}
      </div>`;

    mount.innerHTML = workspaceFrame('catalog', content);
  }

  function rfqItemCard(item) {
    return `
      <article class="portal-rfq-item">
        <div class="portal-rfq-item-head">
          <div>
            <div class="portal-mini-kicker">${icon('file')} ${esc(item.product.route)}</div>
            <h3>${esc(item.product.name)}</h3>
          </div>
          <button type="button" class="portal-inline-button" data-portal-action="remove-item" data-product="${item.product.id}">Remove</button>
        </div>
        <div class="portal-rfq-item-body">
          <img src="${item.product.image}" alt="${esc(item.product.name)}" loading="lazy">
          <div class="portal-rfq-item-controls">
            <label><span>Qty</span><input type="number" min="1" value="${item.qty}" data-portal-qty="${item.product.id}"></label>
            <a href="${item.product.page}" class="portal-inline-link">${icon('arrow')} Open sheet</a>
            <a href="${item.product.reference}" class="portal-inline-link">${icon('file')} Reference file</a>
          </div>
        </div>
      </article>`;
  }

  function offerCard(offer) {
    return `
      <article class="portal-offer-card${offer.selected ? ' is-selected' : ''}">
        <div class="portal-offer-head">
          <div>
            <div class="portal-mini-kicker">${icon('compare')} ${esc(offer.port)}</div>
            <h3>${esc(offer.name)}</h3>
          </div>
          <span class="portal-status-chip${offer.selected ? ' is-live' : ''}">${offer.selected ? 'Active option' : 'Available'}</span>
        </div>
        <div class="portal-offer-price">${money(offer.subtotal, state.rfq.currency)}</div>
        <div class="portal-offer-meta">
          <span>${esc(offer.leadTime)}</span>
          <span>${esc(offer.quality)}</span>
          <span>${offer.moqFailed ? 'MOQ mismatch' : 'MOQ fit'}</span>
        </div>
        <button type="button" class="${offer.selected ? 'btn-primary' : 'btn-outline'} portal-action-link" data-portal-action="choose-seller" data-seller="${offer.id}">${offer.selected ? 'Selected' : 'Use option'}</button>
      </article>`;
  }

  function renderRFQ() {
    const items = rfqItems();
    const copy = portalCopy();

    if (!items.length) {
      mount.innerHTML = workspaceFrame('rfq', `
        <article class="portal-empty-card">
          <div class="portal-mini-kicker">${icon('rfq')} ${esc(copy.inquiryLabel)}</div>
          <h3>Add products first.</h3>
          <div class="portal-card-actions"><a href="/portal/catalog/" class="btn-primary portal-action-link">Open ${esc(copy.catalogLabel.toLowerCase())}</a></div>
        </article>`);
      return;
    }

    const offers = quoteOffers();
    const preferred = preferredOffer();
    const subtotal = preferred ? preferred.subtotal : 0;

    const content = `
      <div class="portal-rfq-layout">
        <section class="portal-rfq-main">
          <article class="portal-block-card">
            <div class="portal-mini-kicker">${icon('rfq')} ${esc(state.rfq.id)}</div>
            <div class="portal-rfq-config-grid">
              <label><span>Destination</span><input type="text" value="${esc(state.rfq.destination)}" data-portal-field="destination"></label>
              <label><span>Incoterm</span><input type="text" value="${esc(state.rfq.incoterm)}" data-portal-field="incoterm"></label>
              <label><span>Currency</span><input type="text" value="${esc(state.rfq.currency)}" data-portal-field="currency"></label>
              <label><span>Target window</span><input type="text" value="${esc(state.rfq.targetWindow)}" data-portal-field="targetWindow"></label>
            </div>
          </article>
          <div class="portal-rfq-item-list">${items.map(rfqItemCard).join('')}</div>
        </section>
        <aside class="portal-rfq-side">
          <article class="portal-block-card portal-summary-card">
            <div class="portal-mini-kicker">${icon('spark')} Working summary</div>
            <h3>${preferred ? esc(preferred.name) : 'Choose an option'}</h3>
            <div class="portal-summary-value">${money(subtotal, state.rfq.currency)}</div>
            <div class="portal-summary-meta">
              <span>${esc(state.rfq.currency)}</span>
              <span>${esc(state.rfq.incoterm)}</span>
              <span>${esc(state.rfq.destination)}</span>
            </div>
            <div class="portal-card-actions">
              <a href="/portal/approvals/" class="btn-primary portal-action-link">Open documents</a>
              <a href="/portal/catalog/" class="btn-outline portal-action-link">Add more items</a>
            </div>
          </article>
        </aside>
      </div>
      <section class="portal-offer-board">
        <div class="portal-section-head-inline"><h3>${esc(copy.compareLabel)}</h3><span>${offers.length} option(s)</span></div>
        <div class="portal-offer-grid">${offers.map(offerCard).join('')}</div>
      </section>`;

    mount.innerHTML = workspaceFrame('rfq', content);
  }

  function approvalCard(key, title, note) {
    const done = !!state.approvals[key];
    return `
      <article class="portal-approval-card${done ? ' is-done' : ''}">
        <div class="portal-mini-kicker">${done ? icon('check') : icon('shield')} ${done ? 'Done' : 'Open'}</div>
        <h3>${esc(title)}</h3>
        <p>${esc(note)}</p>
        <button type="button" class="${done ? 'btn-primary' : 'btn-outline'} portal-action-link" data-portal-action="toggle-approval" data-check="${key}">${done ? 'Completed' : 'Mark complete'}</button>
      </article>`;
  }

  function renderApprovals() {
    const items = rfqItems();
    if (!items.length) {
      mount.innerHTML = workspaceFrame('approvals', `
        <article class="portal-empty-card">
          <div class="portal-mini-kicker">${icon('shield')} Documents</div>
          <h3>Build the inquiry first.</h3>
          <div class="portal-card-actions"><a href="/portal/rfq/" class="btn-primary portal-action-link">Open inquiries</a></div>
        </article>`);
      return;
    }

    const offer = preferredOffer();
    const content = `
      <div class="portal-screen-grid">
        <article class="portal-block-card">
          <div class="portal-mini-kicker">${icon('compare')} Active commercial option</div>
          <h3>${esc(offer ? offer.name : 'Choose option in inquiries')}</h3>
          <div class="portal-chip-row">
            <span class="portal-chip">${esc(state.rfq.id)}</span>
            <span class="portal-chip">${esc(state.rfq.incoterm)}</span>
            <span class="portal-chip">${esc(state.rfq.currency)}</span>
          </div>
          <div class="portal-link-list">
            ${items.map((item) => `<a href="${item.product.page}" class="portal-inline-link">${icon('file')} ${esc(item.product.name)} sheet</a>`).join('')}
          </div>
        </article>
        <article class="portal-block-card">
          <div class="portal-mini-kicker">${icon('spark')} Release gate</div>
          <h3>${approvalsReady() ? 'Ready to create order' : 'Checks still open'}</h3>
          <div class="portal-card-actions">
            <button type="button" class="btn-primary portal-action-link" data-portal-action="create-order" ${approvalsReady() ? '' : 'disabled'}>Create order</button>
            <button type="button" class="btn-outline portal-action-link" data-portal-action="mark-all">Complete all for demo</button>
          </div>
        </article>
      </div>
      <div class="portal-approval-grid">
        ${approvalCard('technical', 'Technical sheet', 'Sizes, route, and material fit checked.')}
        ${approvalCard('commercial', 'Commercial lock', 'Commercial basis and selected option confirmed.')}
        ${approvalCard('baseline', 'Reference baseline', 'Approved file set and reference locked.')}
        ${approvalCard('logistics', 'Logistics note', 'Dispatch window and document path checked.')}
      </div>`;

    mount.innerHTML = workspaceFrame('approvals', content);
  }

  function orderStageTrack(order) {
    const currentStage = Number(order.stage || 0);
    return `
      <div class="portal-stage-track">
        ${ORDER_STAGES.map((stage, index) => `<div class="portal-stage-node${index <= currentStage ? ' is-active' : ''}"><strong>${esc(stage)}</strong><span>${index < currentStage ? 'Done' : index === currentStage ? 'Live' : 'Next'}</span></div>`).join('')}
      </div>`;
  }

  function renderOrders() {
    const copy = portalCopy();
    const order = activeOrder();

    if (!order) {
      mount.innerHTML = workspaceFrame('orders', `
        <article class="portal-empty-card">
          <div class="portal-mini-kicker">${icon('truck')} No order yet</div>
          <h3>Create the order from documents first.</h3>
          <div class="portal-card-actions"><a href="/portal/approvals/" class="btn-primary portal-action-link">Open documents</a></div>
        </article>`);
      return;
    }

    const seller = SELLERS.find((entry) => entry.id === order.sellerId) || SELLERS[0];
    const content = `
      <div class="portal-order-header">
        <div>
          <div class="portal-mini-kicker">${icon('truck')} ${esc(order.id)}</div>
          <h3>${esc(seller.name)}</h3>
          <p>${esc(order.payment)} · ${esc(order.eta)}</p>
        </div>
        <div class="portal-card-actions">
          <button type="button" class="btn-primary portal-action-link" data-portal-action="advance-order">Advance stage</button>
          <button type="button" class="btn-outline portal-action-link" data-portal-action="repeat-order">${esc(copy.repeatLabel)}</button>
        </div>
      </div>
      ${orderStageTrack(order)}
      <div class="portal-screen-grid">
        <article class="portal-block-card" id="payments">
          <div class="portal-mini-kicker">${icon('wallet')} Payments</div>
          <h3>${esc(order.payment)}</h3>
          <div class="portal-chip-row">
            <span class="portal-chip">${esc(state.rfq.currency)}</span>
            <span class="portal-chip">${esc(state.rfq.incoterm)}</span>
            <span class="portal-chip">${esc(order.updatedAt || 'Today')}</span>
          </div>
        </article>
        <article class="portal-block-card" id="logistics">
          <div class="portal-mini-kicker">${icon('truck')} Logistics</div>
          <h3>${esc(order.eta)}</h3>
          <p>${esc(ORDER_STAGES[Number(order.stage || 0)])}</p>
        </article>
      </div>
      <div class="portal-screen-grid">
        <article class="portal-block-card" id="documents">
          <div class="portal-mini-kicker">${icon('file')} Documents</div>
          <div class="portal-link-list">
            ${order.docs.map((doc) => `<a href="${doc.href}" class="portal-inline-link">${icon('file')} ${esc(doc.label)}</a>`).join('')}
          </div>
        </article>
        <article class="portal-block-card">
          <div class="portal-mini-kicker">${icon('repeat')} ${esc(copy.repeatLabel)}</div>
          <p>${isSellerPortal() ? 'Reopen the programme and continue the next working pack.' : 'Reuse the approved history and open a fresh inquiry in one click.'}</p>
          <div class="portal-card-actions"><button type="button" class="btn-outline portal-action-link" data-portal-action="repeat-order">${isSellerPortal() ? 'Open next pack' : 'Open repeat inquiry'}</button></div>
        </article>
      </div>`;

    mount.innerHTML = workspaceFrame('orders', content);
  }

  function toast(message) {
    let box = document.querySelector('.portal-toast');
    if (!box) {
      box = document.createElement('div');
      box.className = 'portal-toast';
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.add('is-visible');
    clearTimeout(box._timeout);
    box._timeout = setTimeout(() => box.classList.remove('is-visible'), 1800);
  }

  function render() {
    if (state.session && AUTH_VIEWS.has(VIEW)) {
      window.location.replace('/portal/dashboard/');
      return;
    }

    if (!state.session && WORKSPACE_VIEWS.has(VIEW)) {
      renderLocked();
      return;
    }

    switch (VIEW) {
      case 'sign-in':
        state.ui.authMode = 'sign-in';
        saveState();
        renderAccess();
        break;
      case 'sign-up':
        state.ui.authMode = 'register';
        saveState();
        renderAccess();
        break;
      case 'dashboard':
        renderDashboard();
        break;
      case 'catalog':
        renderCatalog();
        break;
      case 'rfq':
        renderRFQ();
        break;
      case 'approvals':
        renderApprovals();
        break;
      case 'orders':
        renderOrders();
        break;
      default:
        state.ui.authMode = 'sign-in';
        saveState();
        renderAccess();
        break;
    }
  }

  mount.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-portal-action], [data-portal-route]');
    if (!actionTarget) return;

    if (actionTarget.dataset.portalRoute) {
      state.ui.catalogRoute = actionTarget.dataset.portalRoute;
      saveState();
      render();
      return;
    }

    const action = actionTarget.dataset.portalAction;
    if (action === 'add-item') addItem(actionTarget.dataset.product);
    if (action === 'remove-item') removeItem(actionTarget.dataset.product);
    if (action === 'choose-seller') chooseSeller(actionTarget.dataset.seller);
    if (action === 'toggle-approval') toggleApproval(actionTarget.dataset.check);
    if (action === 'mark-all') markAllApprovals();
    if (action === 'create-order') createOrder();
    if (action === 'advance-order') advanceOrder();
    if (action === 'repeat-order') repeatOrder();
    if (action === 'sign-out') signOut();
    if (action === 'set-auth-portal') setAuthPortal(actionTarget.dataset.portalType);
    if (action === 'set-auth-mode') setAuthMode(actionTarget.dataset.portalMode);
  });

  mount.addEventListener('input', (event) => {
    const qtyField = event.target.closest('[data-portal-qty]');
    if (qtyField) {
      updateItemQty(qtyField.dataset.portalQty, qtyField.value);
      return;
    }

    const field = event.target.closest('[data-portal-field]');
    if (field) {
      setRfqField(field.dataset.portalField, field.value);
      return;
    }

    const searchField = event.target.closest('[data-portal-input="catalog-search"]');
    if (searchField) {
      state.ui.catalogSearch = searchField.value;
      saveState();
      render();
    }
  });

  mount.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-portal-form]');
    if (!form) return;
    event.preventDefault();
    const fd = new FormData(form);
    const payload = {
      portalType: state.ui.authPortal || 'buyer',
      name: String(fd.get('name') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      email: String(fd.get('email') || '').trim() || (state.ui.authPortal === 'seller' ? 'seller@company.com' : 'buyer@company.com'),
      role: String(fd.get('role') || '').trim() || (state.ui.authPortal === 'seller' ? 'Sales' : 'Procurement')
    };
    signIn(payload);
  });

  render();
})();
