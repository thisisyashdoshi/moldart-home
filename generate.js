#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
let sharp = null;
let chromium = null;
try {
  sharp = require('sharp');
} catch (_) {}
try {
  ({ chromium } = require('playwright'));
} catch (_) {}
const { importedInsights, insightDossiers } = require('./insight-enhancements.js');

const WORK = __dirname;
const SITE = 'https://moldartindia.com';
const NOW = new Date().toISOString().split('T')[0];
const VER = '2026.32';
const FOUNDING_YEAR = 1989;
const YEARS_ACTIVE = Math.max(1, new Date().getFullYear() - FOUNDING_YEAR);
const COMPANY_LINKEDIN = 'https://www.linkedin.com/company/moldartindia';
const YASH_LINKEDIN = 'https://www.linkedin.com/in/thisisyashdoshi';
const WHATSAPP_PRIMARY = { number: '917208088788', display: '+91 7208088788' };
const WHATSAPP_SECONDARY = { number: '917208188788', display: '+91 7208188788' };
const BRAND_LINE = 'Wood and steel supply programmes from Mumbai, aligned to the requirement.';
const NAV_SEARCH_META = 'Explore • Solutions • Resources • Insights • FAQ • Process';
const SUPPLY_FLOW_ITEMS = [
  { step: '01', title: 'Source', detail: 'Start from the actual requirement, then align the likely supply route instead of quoting a generic equivalent.' },
  { step: '02', title: 'Verify', detail: 'Use reference decks and samples to validate fit before volume or price becomes the only conversation.' },
  { step: '03', title: 'Supply', detail: 'Confirm grade, finish, commercial route, and documentation only after the technical path is clear.' }
];
const PUBLIC_DOWNLOAD_BRANCH = 'public-downloads';
const LARGE_DOWNLOAD_PATHS = new Set([
  '/downloads/HPL - OL - 4.pdf',
  '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf',
  '/downloads/LPL - SPECIALTY DECORATIVE PANELS.pdf',
  '/downloads/WOOD - FURNITURE - 3.pdf',
  '/downloads/LPL - GB - 01.pdf',
  '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf'
]);

// ============================================================
// READ EXISTING DATA
// ============================================================
function stableHash(input = '') {
  let hash = 0;
  for (const ch of String(input)) {
    hash = ((hash << 5) - hash) + ch.charCodeAt(0);
    hash |= 0;
  }
  return Math.abs(hash);
}

function shiftUtcDate(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isoDate(value) {
  return value.toISOString().split('T')[0];
}

function formatHumanDate(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  const value = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(value);
}

function normalizeInsightDates(articles = []) {
  const today = new Date();
  const base = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  let cursor = shiftUtcDate(base, -(22 + (stableHash(articles[0]?.slug || 'moldart') % 45)));
  return articles.map((article, index) => {
    if (index > 0) {
      cursor = shiftUtcDate(cursor, -(42 + (stableHash(article.slug) % 84)));
    }
    const date = isoDate(cursor);
    return { ...article, date, displayDate: formatHumanDate(date) };
  });
}

function articleDateLabel(article) {
  return article.displayDate || formatHumanDate(article.date);
}

function whatsappHref(number, text = '') {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

function mergeInsightArticles(base = [], extra = []) {
  const merged = [];
  const seen = new Set();
  for (const article of [...extra, ...base]) {
    if (!article?.slug || seen.has(article.slug)) continue;
    seen.add(article.slug);
    merged.push(article);
  }
  return merged;
}

const rawProducts = JSON.parse(fs.readFileSync(path.join(WORK, 'data/product-directory.json'), 'utf8'));
const rawFaq = JSON.parse(fs.readFileSync(path.join(WORK, 'data/faq.json'), 'utf8'));
const rawInsightsBase = JSON.parse(fs.readFileSync(path.join(WORK, 'data/insights.json'), 'utf8'));
const rawInsightsSource = { ...rawInsightsBase, articles: mergeInsightArticles(rawInsightsBase.articles, importedInsights) };
let rawInsights = { ...rawInsightsSource, editorial: normalizeInsightDates(rawInsightsSource.articles), generated: [], articles: normalizeInsightDates(rawInsightsSource.articles) };
const getAllResourceItems = () => resourceGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));
const getTotalResourceItems = () => getAllResourceItems().length;
const getInstantResourceItems = () => getAllResourceItems().filter((item) => !isRequestOnlyResource(item));
const getRequestResourceItems = () => getAllResourceItems().filter((item) => isRequestOnlyResource(item));

// ============================================================
// EXTENDED PRODUCT METADATA
// ============================================================
const productMeta = {
  'press-plates': {
    slug: 'press-plates',
    seoTitle: 'Press Plates Supplier | Lamination Press Plates — Moldart',
    metaDesc: 'Lamination press plates in SS 304, SS 420, and SS 630 grades with hard-chrome working surfaces for decorative laminate production.',
    overview: 'Moldart supplies surface-critical press plates for decorative laminate production where texture fidelity, wear resistance, and repeatable finish quality matter. The focus stays on supported grades, hardness ranges, and application-led confirmation.',
    workflow: 'Press plates are the tooling surface in lamination presses. They transfer texture and finish to laminate surfaces during the pressing cycle, making them critical to final product quality.',
    commercialNotes: 'Available in 1S and 2S configurations on request. Final grade, surface pattern, chrome route, and quantity are confirmed against the actual programme.',
    relatedProducts: ['press-pads', 'engraved-cylinders', 'industrial-press-plates'],
    relatedApps: ['lamination', 'furniture'],
    downloads: [
      { title: 'Press Plate Standard Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { title: 'Press Plates for Shuttering Plywood', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' },
      { title: 'Press Plate Texture Collection', url: '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  'press-pads': {
    slug: 'press-pads',
    seoTitle: 'Press Pads Supplier | Silicone-Copper Lamination Pads — Moldart',
    metaDesc: 'Silicone-copper composite press pads for uniform heat transfer and pressure distribution in lamination. Up to 100,000 cycles. Maximum width 3300 mm.',
    overview: 'Moldart supplies silicone-copper composite press pads engineered for uniform heat transfer and reliable pressure distribution across the full press area. Designed for high-volume lamination environments, these pads support consistent output quality over extended production cycles.',
    workflow: 'Press pads sit between the heating platen and the press plate in lamination presses. They ensure even heat and pressure distribution, which directly affects surface quality and lamination bond strength.',
    commercialNotes: 'Rated for approximately 80,000–100,000 pressing cycles. Maximum width of 3300 mm. Widths and construction can be aligned to specific press line requirements.',
    relatedProducts: ['press-plates', 'engraved-cylinders'],
    relatedApps: ['lamination'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'engraved-cylinders': {
    slug: 'engraved-cylinders',
    seoTitle: 'Engraved Cylinders for Decor Paper | Rotogravure Cylinders — Moldart',
    metaDesc: 'Precision rotogravure engraved cylinders for high-definition pattern transfer in decor paper printing. Engraving depth 18–25 μm, surface roughness Ra 0.2–0.3 μm.',
    overview: 'Moldart supplies precision rotogravure cylinders built for high-definition pattern transfer and repeat accuracy in decor paper printing. These cylinders enable faithful woodgrain, stone, and abstract pattern reproduction for decorative laminate production.',
    workflow: 'Engraved cylinders are used in rotogravure printing lines to transfer decorative patterns onto base paper. The printed decor paper is then impregnated with melamine resin and used in laminate pressing.',
    commercialNotes: 'Pattern-specific engraving support available. Engraving depth typically 18–25 μm with surface roughness of Ra 0.2–0.3 μm for HD pattern fidelity.',
    relatedProducts: ['decor-paper', 'press-plates'],
    relatedApps: ['lamination'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' },
      { title: 'Gravure Cylinder & Printed Decor Paper Deck', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  'decor-paper': {
    slug: 'printed-decor-paper',
    seoTitle: 'Printed Decor Paper Supplier | Melamine Decor Paper — Moldart',
    metaDesc: 'Melamine-ready printed decor papers at 60–85 GSM with wet tensile over 6N. Woodgrain and custom patterns for decorative laminates, flooring, and furniture.',
    overview: 'Moldart supplies melamine-ready decor papers designed for stable print quality and production consistency across decorative laminate, flooring, and furniture applications. Available in woodgrain and custom pattern options with reliable impregnation compatibility.',
    workflow: 'Printed decor paper is the decorative surface layer in laminated panels. After printing, the paper is impregnated with melamine resin and pressed onto substrate boards to create the finished decorative surface.',
    commercialNotes: 'Weight range: 60–85 GSM. Wet tensile strength over 6N. Compatible with standard melamine impregnation lines. Design, finish, and decor coordination supported.',
    relatedProducts: ['engraved-cylinders', 'fiberboard', 'plywood'],
    relatedApps: ['lamination', 'furniture'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' },
      { title: 'HPL Overlay Collection OL-01', url: '/downloads/HPL - OL - 1.pdf' },
      { title: 'Gravure Cylinder & Printed Decor Paper Deck', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  'plywood': {
    slug: 'plywood',
    seoTitle: 'Plywood Supplier | Structural & Furniture-Grade Plywood — Moldart',
    metaDesc: 'Structural and furniture-grade plywood at 500–700 kg/m³ density, 3–40 mm thickness. High shear strength for furniture, interiors, and architectural panels.',
    overview: 'Moldart supplies structural and furniture-grade plywood engineered for high-strength panel applications. With controlled density profiles and reliable shear strength, these panels serve as core substrates in furniture manufacturing, interior fit-outs, and architectural panel systems.',
    workflow: 'Plywood is a cross-laminated wood panel used as a structural substrate. It is commonly laminated with decorative surfaces or used as-is in load-bearing and furniture carcass applications.',
    commercialNotes: 'Density: 500–700 kg/m³. Thickness range: 3–40 mm. Shear strength ≥ 1.5 MPa. Core build-up and thickness can be aligned to project needs.',
    relatedProducts: ['fiberboard', 'particleboard', 'osb'],
    relatedApps: ['furniture', 'architecture'],
    downloads: [
      { title: 'Press Plates for Shuttering Plywood', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' },
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'fiberboard': {
    slug: 'fiberboard',
    seoTitle: 'Fiberboard Supplier | MDF & HDF Panels — Moldart',
    metaDesc: 'MDF (700–820 kg/m³) and HDF (780–900 kg/m³) panels. EU E1, TSCA Title VI, Japan F4 star compliant. Moisture-resistant grades available for flooring and furniture.',
    overview: 'Moldart supplies MDF and HDF engineered panels with exceptionally smooth surfaces suited for high-gloss lamination, painting, and precision conversion. Available in multiple density profiles and emission standards to match destination market requirements.',
    workflow: 'Fiberboard panels serve as the core substrate in laminated furniture fronts, door skins, decorative panel systems, and flooring cores. Their smooth surface is critical for high-quality surface finishing.',
    commercialNotes: 'MDF density: 700–820 kg/m³. HDF density: 780–900 kg/m³. Compliant with EU E1, TSCA Title VI, and Japan F4 star standards. Moisture Resistant (MR) grades available.',
    relatedProducts: ['plywood', 'particleboard', 'wood-flooring'],
    relatedApps: ['furniture', 'flooring', 'architecture'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'osb': {
    slug: 'osb',
    seoTitle: 'OSB Supplier | Oriented Strand Board — Moldart',
    metaDesc: 'OSB/3 and Fine OSB panels. ENF grade (No Added Formaldehyde), CARB-NAF & EPA-NAF certified, FSC certified, Japan F4 star. Structural and load-bearing use.',
    overview: 'Moldart supplies high-strength oriented strand board compliant with EN 13986 and EN 300 standards. Available in OSB/3 and Fine OSB (F-OSB) grades, these panels are engineered for structural, load-bearing, and heavy-duty industrial applications.',
    workflow: 'OSB is a structural engineered wood panel used in construction, packaging, and furniture frameworks. Its oriented strand structure provides exceptional load-bearing performance.',
    commercialNotes: 'ENF grade (No Added Formaldehyde). CARB-NAF & EPA-NAF certified. FSC certified and Japan F4 star (JAS) compliant. Available in 6mm, 9mm, 15mm, and custom cut-to-size formats.',
    relatedProducts: ['plywood', 'particleboard', 'fiberboard'],
    relatedApps: ['architecture', 'furniture'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'particleboard': {
    slug: 'particleboard',
    seoTitle: 'Particleboard Supplier | Commercial Furniture-Grade Panels — Moldart',
    metaDesc: 'Particleboard panels at 650–760 kg/m³, 9–38 mm thickness. E1, TSCA Title VI, Japan F4 star compliant. MR and EN 312 P6 grades for furniture and cabinetry.',
    overview: 'Moldart supplies cost-effective, highly workable particleboard cores engineered for commercial furniture manufacturing. With reliable density profiles and multiple emission compliance options, these panels serve the core needs of office furniture, cabinetry, and shelving production.',
    workflow: 'Particleboard is used as the core substrate in laminated furniture panels, cabinetry, and shelving. It is typically faced with melamine, HPL, or veneer finishes before use in final products.',
    commercialNotes: 'Density: 650–760 kg/m³. Thickness: 9–38 mm. Compliant with E1, TSCA Title VI, and Japan F4 star. MR and EN 312 P6 grades available. Custom thicknesses supported.',
    relatedProducts: ['plywood', 'fiberboard', 'osb'],
    relatedApps: ['furniture'],
    downloads: [
      { title: 'Moldart Company Profile', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'wood-flooring': {
    slug: 'wood-flooring',
    seoTitle: 'Engineered Wood Flooring Supplier | Laminate Flooring — Moldart',
    metaDesc: 'Engineered laminate flooring systems compliant with EN 13329. Wear class AC3–AC5. HDF E1 or Hydro HDF core. Unilin/Valinge click-lock. EIR deep emboss available.',
    overview: 'Moldart supplies engineered flooring systems compliant with EN 13329 standards, focused on wear resistance and dimensional stability. Available with multiple core options, wear classes, and surface finishes including Embossed-in-Register (EIR) for authentic woodgrain texture.',
    workflow: 'Engineered wood flooring consists of a decorative surface layer bonded to an HDF core with integrated click-lock profiles. It is installed as a floating floor system over prepared subfloors in residential and commercial spaces.',
    commercialNotes: 'HDF E1 or Hydro HDF (water-resistant) core. Wear class: AC3–AC5 (Class 31–33). Embossed, Woodgrain, or EIR finishes. Precision Unilin/Valinge click-lock profiles. Full accessory coordination available.',
    relatedProducts: ['flooring-accessories', 'fiberboard'],
    relatedApps: ['flooring', 'architecture'],
    downloads: [
      { title: 'Engineered Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  'flooring-accessories': {
    slug: 'flooring-accessories',
    seoTitle: 'Flooring Accessories | Transition Profiles & Skirting — Moldart',
    metaDesc: 'Coordinated flooring transition profiles, skirting, and stair nosing in aluminium, MDF, or PVC. Custom matched to floor decor for complete installations.',
    overview: 'Moldart supplies coordinated transition profiles, skirting, and stair nosing designed to complete laminate flooring installations. Available in aluminium, MDF, or PVC base materials with durable wear surfaces matched to the installed floor decor.',
    workflow: 'Flooring accessories are the finishing components installed alongside laminate flooring. They cover expansion gaps, transitions between rooms, wall-to-floor junctions, and staircase edges.',
    commercialNotes: 'Profile types include T-bar, End cap, and Stair nosing. Base materials: Aluminium, MDF, or PVC. Profiles can be custom matched to any specific floor decor.',
    relatedProducts: ['wood-flooring'],
    relatedApps: ['flooring'],
    downloads: [
      { title: 'Engineered Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  'ready-made-furniture': {
    slug: 'ready-made-furniture',
    seoTitle: 'Ready-Made Furniture Supplier | Modular Furniture — Moldart',
    metaDesc: 'Precision-manufactured modular furniture with melamine or HPL facing. CNC precision within 0.1 mm. Scratch resistance over 3N. Flat-pack or assembled delivery.',
    overview: 'Moldart supplies precision-manufactured modular furniture components and assemblies for commercial and residential use. Built with CNC accuracy and durable surface finishes, these products serve office, kitchen, and wardrobe applications.',
    workflow: 'Ready-made furniture is manufactured from engineered wood substrates faced with melamine or HPL, then precision-cut and edge-banded before assembly or flat-pack dispatch.',
    commercialNotes: 'Melamine or HPL faced surfaces. Scratch resistance over 3N. CNC precision within 0.1 mm. PVC/ABS edging 0.4–2.0 mm. Flat-pack or assembled delivery based on project requirements.',
    relatedProducts: ['custom-furniture', 'plywood', 'fiberboard'],
    relatedApps: ['furniture'],
    downloads: [
      { title: 'Furniture Program Catalog 01', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Program Catalog 02', url: '/downloads/WOOD - FURNITURE - 2.pdf' },
      { title: 'Furniture Program Catalog 03', url: '/downloads/WOOD - FURNITURE - 3.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  'custom-furniture': {
    slug: 'custom-furniture',
    seoTitle: 'Custom Furniture Manufacturer | Bespoke Hospitality & Retail — Moldart',
    metaDesc: 'CAD/CNC-driven custom furniture development for hospitality, residential, and retail environments. MDF, HDF, and plywood cores. Built to project-specific layouts.',
    overview: 'Moldart supplies CAD/CNC-driven furniture developed for hospitality, residential, and retail environments. Each project is engineered to specific layouts, finish requirements, and spatial constraints using MDF, HDF, and plywood cores.',
    workflow: 'Custom furniture begins with design coordination (CAD/CNC), followed by material selection, precision manufacturing, finish application, and project-specific packaging and delivery.',
    commercialNotes: 'Designed and built to project-specific layouts and finishes. Core materials include MDF, HDF, and plywood. Suitable for hospitality, retail, and residential applications.',
    relatedProducts: ['ready-made-furniture', 'plywood', 'fiberboard'],
    relatedApps: ['furniture', 'architecture'],
    downloads: [
      { title: 'Furniture Program Catalog 01', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Program Catalog 02', url: '/downloads/WOOD - FURNITURE - 2.pdf' },
      { title: 'Furniture Program Catalog 03', url: '/downloads/WOOD - FURNITURE - 3.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  'decorative-panels': {
    slug: 'decorative-ss-panels',
    seoTitle: 'Decorative Stainless Steel Panels | PVD SS Sheets — Moldart',
    metaDesc: 'Decorative stainless steel panels for architectural interiors with SS 201 / 304 routes, Hairline, Mirror, and selected PVD finishes.',
    overview: 'Moldart supplies decorative stainless steel panels for architectural and interior programmes where finish control, consistency, and application fit matter more than long finish lists. The focus stays on the finish routes most clearly supported in the available material.',
    workflow: 'Decorative SS panels are used as wall cladding, elevator cabin interiors, retail displays, and architectural accent surfaces. They are cut to size, finished with the specified surface treatment and approved finish route, then installed.',
    commercialNotes: 'Common working reference points include SS 201 / 304 routes, Hairline, Mirror, and selected PVD finishes. Higher-corrosion environments, anti-fingerprint needs, and final finish approval are confirmed per enquiry.',
    relatedProducts: ['ss-profiles', 'ss-furniture'],
    relatedApps: ['architecture', 'metal-finishing'],
    downloads: [
      { title: 'Decorative SS Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Decorative SS Stamped Finishes', url: '/downloads/STAMPED.pdf' },
      { title: 'Decorative SS Heat-Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' },
      { title: 'Decorative SS Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  'ss-profiles': {
    slug: 'ss-profiles',
    seoTitle: 'Stainless Steel Profiles Supplier | SS Trims & Inlays — Moldart',
    metaDesc: 'Precision-formed stainless steel profiles and trims in common architectural shapes, coordinated to decorative panel finish routes.',
    overview: 'Moldart supplies stainless steel profiles, trims, and inlays for cleaner architectural transitions and edge detailing, with emphasis on profile coordination, finish matching, and project-led confirmation.',
    workflow: 'SS profiles are used as transition trims, panel edging, floor-to-wall junctions, and decorative inlays in architectural interiors. They are typically installed alongside decorative stainless steel panels.',
    commercialNotes: 'Common profile routes include T, U, L, C, and box forms with finish coordination to the selected panel programme. Final grade, length, folding geometry, and groove detail are confirmed per enquiry.',
    relatedProducts: ['decorative-panels', 'ss-furniture'],
    relatedApps: ['architecture'],
    downloads: [
      { title: 'Stainless Steel Profiles Catalog', url: '/downloads/PROFILE.pdf' },
      { title: 'Stainless Steel Divider Systems', url: '/downloads/DIVIDER.pdf' }
    ]
  },
  'ss-furniture': {
    slug: 'ss-furniture',
    seoTitle: 'Stainless Steel Furniture | PVD-Plated Luxury Furniture — Moldart',
    metaDesc: 'Decorative stainless steel furniture with PVD and electroplated finishes. Tables, consoles, partitions. Marble, glass, and MDF tops. Custom design support.',
    overview: 'Moldart supplies decorative stainless steel furniture with plated finishes and mixed-material top options for luxury interior environments. From tables and consoles to partitions and lobby features, each piece combines structural precision with premium surface treatment.',
    workflow: 'SS furniture is fabricated from stainless steel frames, finished with PVD or electroplating, then assembled with selected top materials (marble, glass, MDF) before delivery to site.',
    commercialNotes: 'Product types: Tables, consoles, and partitions. Finish options: PVD and electroplated. Top materials: Marble, glass, and MDF. Custom design support available.',
    relatedProducts: ['decorative-panels', 'ss-profiles'],
    relatedApps: ['architecture', 'furniture', 'metal-finishing'],
    downloads: [
      { title: 'Decorative SS Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Decorative SS Heat-Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' }
    ]
  },
  'industrial-press-plates': {
    slug: 'industrial-press-plates',
    seoTitle: 'Industrial Press Plates | HPL, CCL & PCB Press Plates — Moldart',
    metaDesc: 'Industrial press plates for CCL, PCB, and technical laminate pressing where flatness, parallelism, and surface discipline are critical.',
    overview: 'Moldart supplies heavy-duty steel plates for high-pressure technical laminate, CCL, and PCB programmes where dimensional tolerance and surface discipline are more demanding than standard decorative lamination work.',
    workflow: 'Industrial press plates are used in high-pressure presses for manufacturing technical laminates, CCL, and PCB substrates. They must maintain precise flatness, parallelism, and surface behaviour under demanding pressing conditions.',
    commercialNotes: 'Reference points stay focused on tolerance-led supply: flatness, parallelism, surface condition, and application fit. Final grade, magnetism control, and supporting documentation are confirmed per enquiry.',
    relatedProducts: ['press-plates', 'press-pads'],
    relatedApps: ['lamination', 'pcb-ccl'],
    downloads: [
      { title: 'Press Plate Standard Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' }
    ]
  }
};

// ============================================================
// APPLICATION DATA
// ============================================================
const applications = [
  {
    slug: 'lamination',
    name: 'Lamination',
    seoTitle: 'Lamination Tooling & Materials Supplier — Moldart',
    metaDesc: 'Complete lamination supply chain: press plates, press pads, engraved cylinders, printed decor paper, and industrial press plates for HPL and LPL production.',
    overview: 'Moldart supports the full lamination supply chain — from the tooling that creates surface texture to the decorative inputs that define the final appearance. Whether you manufacture HPL, LPL, or technical laminates, Moldart supplies the critical components that determine surface quality, production efficiency, and finish consistency.',
    considerations: [
      'Press plate grade selection depends on required surface hardness and production volume',
      'Press pad construction affects heat distribution uniformity across the press area',
      'Engraved cylinder specifications must match the target decor paper design and repeat length',
      'Decor paper GSM and wet tensile strength affect impregnation and pressing behavior',
      'Industrial press plates for CCL/PCB require demagnetization control'
    ],
    products: ['press-plates', 'press-pads', 'engraved-cylinders', 'decor-paper', 'industrial-press-plates'],
    downloads: [
      { title: 'Press Plate Standard Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { title: 'Press Plates for Shuttering Plywood', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' },
      { title: 'HPL Overlay Collection OL-01', url: '/downloads/HPL - OL - 1.pdf' }
    ]
  },
  {
    slug: 'furniture',
    name: 'Furniture Manufacturing',
    seoTitle: 'Furniture Materials & Components Supplier — Moldart',
    metaDesc: 'Substrates, decor inputs, and finished furniture for commercial and residential manufacturing. Plywood, MDF, HDF, particleboard, and CNC-built furniture.',
    overview: 'Moldart supplies the materials and finished products that furniture manufacturers need — from substrate panels and decorative inputs to fully manufactured furniture components. The portfolio covers the full production chain, from raw boards to assembled, finish-ready products.',
    considerations: [
      'Substrate selection depends on the structural requirements and end-use environment',
      'Emission compliance standards vary by destination market (E1, CARB-NAF, F4 star)',
      'Surface finish quality depends on substrate smoothness — MDF/HDF provides the best base for high-gloss',
      'Edging compatibility should be verified against substrate thickness and material',
      'Custom furniture requires early-stage design coordination for optimal material utilization'
    ],
    products: ['plywood', 'fiberboard', 'particleboard', 'ready-made-furniture', 'custom-furniture', 'decor-paper'],
    downloads: [
      { title: 'Furniture Program Catalog 01', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Program Catalog 02', url: '/downloads/WOOD - FURNITURE - 2.pdf' }
    ]
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    seoTitle: 'Engineered Wood Flooring & Accessories Supplier — Moldart',
    metaDesc: 'Engineered laminate flooring systems (AC3–AC5) with coordinated accessories. HDF core, click-lock profiles, and transition trims for residential and commercial use.',
    overview: 'Moldart supplies engineered laminate flooring systems with coordinated accessories for complete installation packages. From the HDF core panel to transition profiles and skirting, the flooring portfolio covers everything needed for residential and commercial floor installations.',
    considerations: [
      'Wear class selection (AC3–AC5) depends on traffic intensity and commercial vs. residential use',
      'HDF core moisture resistance matters for kitchens, bathrooms, and humid environments',
      'Click-lock system compatibility should be confirmed for the installation method',
      'Accessory profiles must match the floor decor for a coordinated finish',
      'Subfloor preparation requirements vary by flooring thickness and installation method'
    ],
    products: ['wood-flooring', 'flooring-accessories', 'fiberboard'],
    downloads: [
      { title: 'Engineered Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  {
    slug: 'architecture',
    name: 'Architecture & Interiors',
    seoTitle: 'Architectural Materials Supplier | Steel Panels & Wood Panels — Moldart',
    metaDesc: 'Decorative stainless steel panels, profiles, and engineered wood substrates for architectural interiors. PVD finishes, structural panels, and custom fabrication.',
    overview: 'Moldart supplies materials for architectural interior projects — from decorative stainless steel panels and profiles to engineered wood substrates and custom furniture. The portfolio serves architects, interior designers, and project contractors who need premium materials with reliable technical specifications.',
    considerations: [
      'Decorative stainless-steel grade selection depends on environment, corrosion exposure, and the project finish route',
      'PVD color consistency across batches should be confirmed for large-area installations',
      'Structural panel selection depends on load, span, and environmental conditions',
      'Custom furniture lead times depend on complexity, finish, and production scheduling',
      'Anti-fingerprint coating is recommended for high-touch architectural surfaces'
    ],
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture', 'plywood', 'fiberboard', 'osb'],
    downloads: [
      { title: 'Decorative SS Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Stainless Steel Profiles Catalog', url: '/downloads/PROFILE.pdf' },
      { title: 'Decorative SS Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  {
    slug: 'metal-finishing',
    name: 'Metal Finishing',
    seoTitle: 'Decorative Metal Finishing | PVD Stainless Steel — Moldart',
    metaDesc: 'Decorative-finished stainless steel panels, profiles, and furniture for premium interiors, with finish approval confirmed per programme.',
    overview: 'Moldart supplies decorative stainless steel products with advanced surface finishing for premium interior and architectural applications. The metal finishing portfolio includes PVD coating, electroplating, etching, and embossing across panels, profiles, and furniture.',
    considerations: [
      'Finish route, colour approval, and surface preparation should be aligned before commercial comparison',
      'Anti-fingerprint requirements should be confirmed for high-touch surfaces',
      'Large-area or repeat orders should be reviewed for colour and finish consistency',
      'Surface preparation affects the final decorative appearance and should be approved early',
      'Grade, environment, and finish route should be aligned before approval is locked'
    ],
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture'],
    downloads: [
      { title: 'Decorative SS Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Decorative SS Stamped Finishes', url: '/downloads/STAMPED.pdf' },
      { title: 'Decorative SS Heat-Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' },
      { title: 'Decorative SS Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  {
    slug: 'pcb-ccl',
    name: 'PCB & CCL Manufacturing',
    seoTitle: 'Press Plates for PCB & CCL Manufacturing — Moldart',
    metaDesc: 'Industrial press plates for printed circuit board (PCB) and copper-clad laminate (CCL) manufacturing. Demagnetized plates with strict flatness and parallelism tolerances.',
    overview: 'Moldart supplies specialized industrial press plates for the PCB and CCL manufacturing sector. These plates require controlled magnetic properties, strict dimensional tolerances, and high thermal conductivity to meet the precision demands of electronic laminate production.',
    considerations: [
      'Residual magnetism control should be confirmed for electronics pressing routes',
      'Flatness and parallelism should be matched to the production requirement',
      'Surface condition and plate consistency influence laminate results across the press area',
      'Final plate grade should be confirmed against the process requirement',
      'Incoming inspection and demagnetization checks should be agreed before production use'
    ],
    products: ['industrial-press-plates'],
    downloads: [
      { title: 'Press Plate Standard Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' }
    ]
  }
];

const SOLUTION_PRODUCT_ROLES = {
  lamination: {
    'press-plates': 'Defines the visible press surface, texture transfer, and finish repeatability in decorative lamination lines.',
    'press-pads': 'Helps stabilise heat transfer and pressure equalisation across the press build-up.',
    'engraved-cylinders': 'Creates the printed decor pattern that later becomes the visible surface language of the panel.',
    'decor-paper': 'Carries the approved printed design into impregnation and pressing.',
    'industrial-press-plates': 'Steps in when the programme moves into tighter-tolerance technical laminate, PCB, or CCL routes.'
  },
  furniture: {
    plywood: 'Supports structural furniture parts where strength, screw holding, or substrate stability matter.',
    fiberboard: 'Provides the smoother core route when paint, foil, melamine, or decorative facing needs a more uniform base.',
    particleboard: 'Supports commercial furniture programmes where cost control and repeat conversion matter.',
    'ready-made-furniture': 'Moves the conversation from raw board supply into finished modular or assembled output.',
    'custom-furniture': 'Turns layouts, finish intent, and site conditions into a build-to-brief furniture route.',
    'decor-paper': 'Supports décor alignment where the furniture programme depends on laminated visual surfaces.'
  },
  flooring: {
    'wood-flooring': 'Acts as the finished walking surface and the main performance layer of the flooring system.',
    'flooring-accessories': 'Closes the installation properly through skirting, stair nosing, and transition details.',
    fiberboard: 'Supports the core build where density, lock precision, and surface readiness affect floor performance.'
  },
  architecture: {
    'decorative-panels': 'Creates the visible stainless-steel surface language for cladding, lifts, features, and interiors.',
    'ss-profiles': 'Finishes edges, transitions, joints, and inlay conditions so the panel route looks intentional and complete.',
    'ss-furniture': 'Adds fabricated decorative pieces where the project needs furniture or feature elements in the same finish family.',
    plywood: 'Supports backing, carcass, or hidden structural routes behind visible interior finishes.',
    fiberboard: 'Supports smoother painted or laminated interior build-ups where face quality matters.',
    osb: 'Supports selected structural or non-visible build-up conditions where panel strength matters more than a refined face.'
  },
  'metal-finishing': {
    'decorative-panels': 'Acts as the main decorative sheet route when finish, reflection, and surface approval drive the decision.',
    'ss-profiles': 'Keeps trims and divider details aligned with the approved decorative finish route.',
    'ss-furniture': 'Extends the same finish logic into fabricated furniture or feature pieces.'
  },
  'pcb-ccl': {
    'industrial-press-plates': 'Carries the tolerance-critical plate role for electronics lamination work where flatness, parallelism, and surface discipline are not optional.'
  }
};

const SOLUTION_AUDIENCES = {
  lamination: ['Procurement', 'Production teams', 'Quality teams', 'Technical buyers'],
  furniture: ['Procurement', 'OEM teams', 'Design teams', 'Production teams'],
  flooring: ['Category buyers', 'Project teams', 'Installation partners', 'Procurement'],
  architecture: ['Architects', 'Interior teams', 'Procurement', 'Fabricators'],
  'metal-finishing': ['Architects', 'Finish approvers', 'Procurement', 'Fabricators'],
  'pcb-ccl': ['Technical buyers', 'Production engineers', 'Quality teams', 'Operations']
};

const SOLUTION_FLOWS = {
  lamination: [
    { title: 'Define the target surface', detail: 'Lock the finish language, plate condition expectations, and press context before asking for a generic quote.' },
    { title: 'Align the tooling stack', detail: 'Confirm whether the programme needs only plates, or also pads, cylinders, decor paper, or industrial plate support.' },
    { title: 'Approve the reference route', detail: 'Texture, pattern, and replacement expectations should be agreed before production scales.' }
  ],
  furniture: [
    { title: 'Start from the end use', detail: 'Cabinetry, modular programmes, hospitality work, and custom fit-outs do not all need the same substrate route.' },
    { title: 'Lock the board logic', detail: 'Strength, surface readiness, compliance, and finish route should be aligned before price comparison dominates.' },
    { title: 'Move into finished output only when ready', detail: 'Ready-made or custom furniture works best after the board, finish, and layout logic are already clear.' }
  ],
  flooring: [
    { title: 'Choose the floor system', detail: 'Traffic level, core build, and moisture exposure shape the right flooring route.' },
    { title: 'Coordinate the accessories', detail: 'Skirting, transitions, and stair details should follow the floor decision, not appear as an afterthought.' },
    { title: 'Confirm installation conditions', detail: 'Subfloor readiness, lock profile, and site conditions affect the final performance.' }
  ],
  architecture: [
    { title: 'Begin with the visible surface', detail: 'The finish approval route matters because large-area stainless programmes expose inconsistency quickly.' },
    { title: 'Align trims and support materials', detail: 'Profiles, backing materials, and fabricated pieces should follow the same approved route.' },
    { title: 'Approve before scale', detail: 'Sample-backed finish approval is safer than assuming a brochure image will translate to project quantity.' }
  ],
  'metal-finishing': [
    { title: 'Fix the finish family early', detail: 'Hairline, mirror, etched, stamped, or PVD routes should be narrowed before commercial negotiation.' },
    { title: 'Coordinate decorative parts together', detail: 'Panels, trims, and furniture are easier to approve when they are treated as one finish system.' },
    { title: 'Keep final approval sample-led', detail: 'Visual acceptance should be tied to the approved route, not only to a catalogue description.' }
  ],
  'pcb-ccl': [
    { title: 'Start from tolerance, not only grade', detail: 'Electronics lamination decisions fail when the discussion stays too broad and grade-only.' },
    { title: 'Match the line condition', detail: 'Flatness, parallelism, surface behaviour, and documentation should all align with the actual production line.' },
    { title: 'Confirm incoming checks', detail: 'Inspection discipline at receipt matters because the downstream process is less forgiving.' }
  ]
};

// ============================================================
// RESOURCE/DOWNLOAD GROUPS
// ============================================================
const resourceGroups = [
  {
    title: 'Company Overview',
    items: [
      { title: 'Moldart Company Profile', desc: 'Overview of operating model, sectors served, and product portfolio.', url: '/downloads/INTRODUCTION TO MOLDART.pdf', access: 'instant' }
    ]
  },
  {
    title: 'Press Plates & Tooling',
    items: [
      { title: 'Press Plate Standard Collection', desc: 'Standard lamination press plate patterns and technical references.', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf', access: 'instant' },
      { title: 'Press Plates for Shuttering Plywood', desc: 'Press plate collection aligned to shuttering plywood production.', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf', access: 'instant' },
      { title: 'Press Plate Texture Collection', desc: 'Extended texture deck for surface-led approval work and pattern comparison.', url: '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  {
    title: 'Decor & Lamination',
    items: [
      { title: 'HPL Overlay Collection OL-01', desc: 'High-pressure laminate overlay reference set.', url: '/downloads/HPL - OL - 1.pdf', access: 'instant' },
      { title: 'HPL Overlay Collection OL-02', desc: 'High-pressure laminate overlay reference set.', url: '/downloads/HPL - OL - 2.pdf', access: 'instant' },
      { title: 'HPL Overlay Collection OL-03', desc: 'High-pressure laminate overlay reference set.', url: '/downloads/HPL - OL - 3.pdf', access: 'instant' },
      { title: 'HPL Overlay Collection OL-04', desc: 'Expanded overlay set for deeper texture and finish matching.', url: '/downloads/HPL - OL - 4.pdf', access: 'request', note: 'Large reference deck shared on request.' },
      { title: 'LPL Decorative Collection GB-01', desc: 'Low-pressure laminate decor reference set for broad visual matching.', url: '/downloads/LPL - GB - 01.pdf', access: 'request', note: 'Large reference deck shared on request.' },
      { title: 'LPL Decorative Collection GB-02', desc: 'Low-pressure laminate decor reference set.', url: '/downloads/LPL - GB - 02.pdf', access: 'instant' },
      { title: 'LPL PET Board Collection', desc: 'PET-faced decorative board reference deck.', url: '/downloads/LPL - PET BOARD.pdf', access: 'instant' },
      { title: 'LPL Specialty Decorative Panels', desc: 'Specialty decorative panel deck for broader LPL finish programmes.', url: '/downloads/LPL - SPECIALTY DECORATIVE PANELS.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  {
    title: 'Decor Paper & Gravure',
    items: [
      { title: 'Gravure Cylinder & Printed Decor Paper Deck', desc: 'Combined reference deck for gravure cylinders and decor paper programmes.', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  {
    title: 'Wood, Flooring & Furniture',
    items: [
      { title: 'Engineered Wood Flooring Catalog', desc: 'Flooring systems, constructions, and coordinated accessories.', url: '/downloads/WOOD - FLOORING.pdf', access: 'instant' },
      { title: 'Engineered Wood Doors Catalog', desc: 'Wood door references and build options.', url: '/downloads/WOOD - DOOR.pdf', access: 'instant' },
      { title: 'Furniture Program Catalog 01', desc: 'Ready-made and modular furniture references.', url: '/downloads/WOOD - FURNITURE - 1.pdf', access: 'instant' },
      { title: 'Furniture Program Catalog 02', desc: 'Furniture assemblies, components, and range extension.', url: '/downloads/WOOD - FURNITURE - 2.pdf', access: 'instant' },
      { title: 'Furniture Program Catalog 03', desc: 'Expanded furniture deck covering additional ranges and layouts.', url: '/downloads/WOOD - FURNITURE - 3.pdf', access: 'request', note: 'Large reference deck shared on request.' }
    ]
  },
  {
    title: 'Decorative Stainless Steel',
    items: [
      { title: 'Decorative SS Antique Finishes', desc: 'Antique-finish stainless steel reference sheet.', url: '/downloads/ANTIQUE.pdf', access: 'instant' },
      { title: 'Decorative SS Stamped Finishes', desc: 'Stamped surface treatments and pattern references.', url: '/downloads/STAMPED.pdf', access: 'instant' },
      { title: 'Decorative SS Heat-Printed Finishes', desc: 'Heat-printed decorative stainless steel references.', url: '/downloads/HEAT PRINTED.pdf', access: 'instant' },
      { title: 'Decorative SS Mosaic Finishes', desc: 'Mosaic surface references for premium interiors.', url: '/downloads/MOSAIC.pdf', access: 'instant' },
      { title: 'Stainless Steel Profiles Catalog', desc: 'Trim, inlay, and architectural profile references.', url: '/downloads/PROFILE.pdf', access: 'instant' },
      { title: 'Stainless Steel Divider Systems', desc: 'Divider and partition references for interior applications.', url: '/downloads/DIVIDER.pdf', access: 'instant' }
    ]
  }
];

// ============================================================
// PRODUCT CATEGORY GROUPS (for hub page)
// ============================================================
const productCategories = [
  {
    title: 'Lamination Tooling',
    desc: 'Press plates, press pads, engraved cylinders, and printed decor paper for laminate production.',
    products: ['press-plates', 'press-pads', 'engraved-cylinders', 'decor-paper']
  },
  {
    title: 'Engineered Substrates',
    desc: 'Plywood, fiberboard (MDF/HDF), OSB, and particleboard panels for furniture, construction, and industrial use.',
    products: ['plywood', 'fiberboard', 'osb', 'particleboard']
  },
  {
    title: 'Flooring & Furniture',
    desc: 'Engineered wood flooring systems, coordinated accessories, and ready-made or custom-built furniture.',
    products: ['wood-flooring', 'flooring-accessories', 'ready-made-furniture', 'custom-furniture']
  },
  {
    title: 'Decorative Stainless Steel',
    desc: 'PVD-coated panels, precision profiles, and stainless steel furniture for architectural interiors.',
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture']
  },
  {
    title: 'Industrial Press Plates',
    desc: 'Heavy-duty press plates for HPL, CCL, and PCB manufacturing with strict tolerances and demagnetization control.',
    products: ['industrial-press-plates']
  }
];

const portfolioFamilies = [
  {
    title: 'Lamination Tooling',
    intro: 'Surface-transfer tooling and decor inputs for laminate production where repeatability, finish fidelity, and press stability matter.',
    products: ['press-plates', 'press-pads', 'engraved-cylinders', 'decor-paper'],
    highlights: ['SS 304 / 420 / 630', 'Hard-chrome surfaces approx. 65-70 HRC', 'Decor printing and texture-transfer tooling'],
    sectors: ['HPL / LPL', 'Furniture surfacing', 'Flooring overlays']
  },
  {
    title: 'Engineered Wood Substrates',
    intro: 'Panel substrates for furniture, interior fit-outs, and technical build-ups with emission, density, and structural performance control.',
    products: ['plywood', 'fiberboard', 'osb', 'particleboard'],
    highlights: ['E1 / TSCA Title VI / F4 star', 'MDF, HDF, plywood, OSB, particleboard', 'Structural and decorative panel programmes'],
    sectors: ['Furniture manufacturing', 'Interiors', 'Construction support']
  },
  {
    title: 'Flooring & Furniture Programmes',
    intro: 'Engineered flooring systems and furniture programmes coordinated around finish consistency, fit-out speed, and repeat production control.',
    products: ['wood-flooring', 'flooring-accessories', 'ready-made-furniture', 'custom-furniture'],
    highlights: ['AC3-AC5 wear classes', 'Click-lock and coordinated accessory systems', 'CAD / CNC-led furniture development'],
    sectors: ['Residential interiors', 'Commercial spaces', 'Hospitality fit-outs']
  },
  {
    title: 'Decorative Stainless Steel',
    intro: 'Architectural stainless steel surfaces, trims, and fabricated pieces where finish control, corrosion resistance, and visual consistency are critical.',
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture'],
    highlights: ['SS 201 / 304 platforms', 'No.4, Hairline, Mirror, and PVD routes', 'Panels, profiles, and fabricated pieces'],
    sectors: ['Architecture', 'Retail interiors', 'Hospitality and premium fit-outs']
  },
  {
    title: 'Industrial Press Plates',
    intro: 'Heavy-duty press plates for technical laminate lines where tolerance discipline, heat behaviour, and magnetism control affect yield and product stability.',
    products: ['industrial-press-plates'],
    highlights: ['SUS 301 / 420 / 630', 'Flatness below 0.05 mm/m', 'PCB, CCL, security, and technical laminate support'],
    sectors: ['PCB & CCL', 'Technical laminates', 'Security laminate programmes']
  }
];

const applicationVisuals = {
  'lamination': {
    image: '/images/page5_img3.webp',
    alt: 'Lamination tooling and press surfaces',
    eyebrow: 'Texture transfer and press-line control'
  },
  'furniture': {
    image: '/images/page7_img4.webp',
    alt: 'Furniture manufacturing and engineered panels',
    eyebrow: 'Panels, decorative inputs, and finished programmes'
  },
  'flooring': {
    image: '/images/page7_img1.webp',
    alt: 'Engineered flooring systems',
    eyebrow: 'Flooring systems with coordinated accessories'
  },
  'architecture': {
    image: '/images/page9_img1.webp',
    alt: 'Decorative stainless steel for architectural interiors',
    eyebrow: 'Architectural finishes and material coordination'
  },
  'metal-finishing': {
    image: '/images/page9_img2_clean.webp',
    alt: 'Metal finishing and stainless steel detailing',
    eyebrow: 'Surface treatments, trims, and premium detailing'
  },
  'pcb-ccl': {
    image: '/images/page9_img4.webp',
    alt: 'Industrial press plates for PCB and CCL manufacturing',
    eyebrow: 'Tolerance-critical tooling for technical laminate lines'
  }
};

const companyMilestones = [
  { year: '1989', title: 'Foundation', detail: 'Moldart begins operations in Mumbai as a trading and industrial sourcing partner.' },
  { year: '1990s', title: 'Tooling & Panels', detail: 'The wood-focused portfolio expands into press tooling, substrates, and decor-linked material coordination.' },
  { year: '2000s', title: 'Expanded Sourcing Network', detail: 'Long-term manufacturing relationships strengthen programme support across India, China, and export-led supply routes.' },
  { year: '2010s', title: 'Decorative Steel Expansion', detail: 'Decorative stainless steel, profiles, and fabricated programmes are added for architectural and interior buyers.' },
  { year: 'Today', title: 'Integrated Supply Partner', detail: 'Moldart works across tooling, substrates, flooring, furniture, and decorative steel through one commercial and technical interface.' }
];

const primaryPages = [
  { title: 'Explore', url: '/explore/', meta: 'Search the full portfolio', keywords: ['explore', 'search', 'product sheets'] },
  { title: 'Solutions', url: '/solutions/', meta: 'Combined systems, product stacks, and product sheets', keywords: ['solutions', 'systems', 'product stack'] },
  { title: 'Resources', url: '/resources/', meta: 'Catalogues, decks, and references', keywords: ['resources', 'downloads', 'catalogs'] },
  { title: 'Insights', url: '/insights/', meta: 'Technical guides and notes', keywords: ['insights', 'guides', 'notes'] },
  { title: 'FAQ', url: '/faq/', meta: 'Quick answers on products, documents, timing, and first contact', keywords: ['faq', 'questions', 'answers'] },
  { title: 'Process', url: '/process/', meta: 'How the enquiry moves from brief to delivery', keywords: ['process', 'workflow', 'delivery'] },
  { title: 'About', url: '/about/', meta: 'Company, team, and sourcing model', keywords: ['about', 'company', 'leadership'] },
  { title: 'Contact', url: '/contact/', meta: 'Inquiry, WhatsApp, and meetings', keywords: ['contact', 'whatsapp', 'email'] }
];

const familyVisuals = {
  'Lamination Tooling': { image: '/images/page5_img3.webp', alt: 'Lamination tooling surfaces', label: 'Surface transfer and press-line control' },
  'Engineered Wood Substrates': { image: '/images/page6_img1.webp', alt: 'Engineered wood panel substrates', label: 'Panel performance and lamination readiness' },
  'Flooring & Furniture Programmes': { image: '/images/page7_img1.webp', alt: 'Flooring and furniture programmes', label: 'System fit, finish, and project execution' },
  'Decorative Stainless Steel': { image: '/images/page9_img1.webp', alt: 'Decorative stainless steel surfaces', label: 'Architectural finish consistency' },
  'Industrial Press Plates': { image: '/images/page9_img4.webp', alt: 'Industrial press plates', label: 'Tolerance-critical pressing support' }
};

function insightCategoryLabelForProduct(productId) {
  const family = portfolioFamilies.find((item) => item.products.includes(productId));
  if (!family) return 'Technical Guides';
  if (family.title === 'Decorative Stainless Steel') return 'Decorative Steel';
  if (family.title === 'Industrial Press Plates') return 'Industrial Tooling';
  if (family.title === 'Engineered Wood Substrates') return 'Panel Systems';
  if (family.title === 'Flooring & Furniture Programmes') {
    return ['wood-flooring', 'flooring-accessories'].includes(productId) ? 'Flooring Systems' : 'Furniture Programmes';
  }
  return 'Lamination Tooling';
}

function generatedInsightPatterns() {
  return [
    {
      suffix: 'guide',
      type: 'Technical Guide',
      title: (product) => `${product.name}: technical guide for approvals, route fit, and enquiry planning`,
      excerpt: (product) => `A product-specific technical guide to how ${product.name.toLowerCase()} should be read by buyers, technical teams, and approval stakeholders.`
    },
    {
      suffix: 'applications',
      type: 'Application Guide',
      title: (product) => `${product.name}: application fit, buyer use cases, and where the route makes sense`,
      excerpt: (product) => `A practical application note for ${product.name.toLowerCase()}, focused on where the route fits well and what should be checked before approval.`
    },
    {
      suffix: 'buyers-guide',
      type: "Buyer's Guide",
      title: (product) => `${product.name}: buyer checklist before the first RFQ or reorder`,
      excerpt: (product) => `A buyer-focused checklist for ${product.name.toLowerCase()}, covering RFQ inputs, approval logic, receiving discipline, and reorder risk.`
    },
    {
      suffix: 'comparison',
      type: 'Comparative Analysis',
      title: (product) => `${product.name}: comparison checkpoints before choosing the final route`,
      excerpt: (product) => `A comparison-led article for ${product.name.toLowerCase()} that shows what should stay like-for-like before commercial selection begins.`
    },
    {
      suffix: 'quality',
      type: 'Quality & Standards',
      title: (product) => `${product.name}: quality checks, receiving priorities, and approval discipline`,
      excerpt: (product) => `A quality-led note on ${product.name.toLowerCase()}, focusing on incoming checks, surface or dimensional review, and approval stability.`
    },
    {
      suffix: 'specifications',
      type: 'Specification Note',
      title: (product) => `${product.name}: specification notes, technical checkpoints, and document structure`,
      excerpt: (product) => `A specification-focused note for ${product.name.toLowerCase()}, built around the technical checkpoints that matter before quoting and dispatch.`
    }
  ];
}

function buildGeneratedInsightContent(product, meta, pattern) {
  const specs = product.specs.slice(0, 4).map((spec) => `- ${spec}`).join('\n');
  const applications = (product.applications || []).slice(0, 4).map((application) => `- ${application}`).join('\n');
  const grades = (product.technical?.grades || []).length ? (product.technical.grades || []).join(', ') : product.material;
  const standards = (product.technical?.certifications || []).length ? product.technical.certifications.join(', ') : 'Project-specific or enquiry-led';
  const relatedRoutes = relatedSolutionsForProduct(product.id).map((app) => app.name).join(', ') || insightCategoryLabelForProduct(product.id);
  const commercial = meta.commercialNotes || product.customization || 'Final route, documents, and commercial timing are confirmed per enquiry.';
  const receiving = [
    'Match the dispatch to the approved reference, drawing, or sample.',
    'Check visible condition, pack integrity, and any dimensional or finish-sensitive points before release into use.',
    'Log deviations before the material becomes part of production or installation.',
    'Keep the receiving result attached to the next reorder conversation.'
  ].map((item) => `- ${item}`).join('\n');

  if (pattern.suffix === 'guide') {
    return `## What the route is actually doing

${product.summary} ${meta.workflow || ''}

## Technical baseline for the first review

${specs}

## Where the route usually fits best

${applications}

## What tends to go wrong when the brief stays weak

- The product name is used without the real application attached.
- A visible finish, tolerance, or performance requirement is left implicit instead of written down.
- The route is compared against a broader equivalent before the end use is fixed.
- Quantity and timing are discussed before the technical path is clear.

## Approval language that reduces mistakes

- Confirm the actual application and end-use environment.
- Attach the approved reference, drawing, finish family, or accepted benchmark.
- Keep quantity, lead time, destination, and documentation tied to the same technical discussion.
- Use ${grades} as a decision input, not as a shortcut for the full decision.

## What receiving teams should already know

${receiving}

## Related programme routes

${relatedRoutes}

## Final takeaway

${commercial}`;
  }

  if (pattern.suffix === 'applications') {
    return `## Start from the end use, not the catalogue name

${product.name} works best when the requirement is being read from the actual use condition backward. That keeps the route tied to performance, conversion, and approval logic instead of broad equivalence.

## Typical application directions

${applications}

## What makes the fit stronger

- The application is already clear before price comparison begins.
- The approval route is tied to a drawing, sample, or accepted benchmark.
- The receiving team knows what should be checked on arrival.
- The order is being reviewed inside the final production, installation, or operating context.

## Where the fit becomes weaker

- The product is being compared outside its real end use.
- The brief is missing size, finish, tolerance, or destination detail.
- The order is trying to solve a process problem with a generic substitute.
- The reference approval is weaker than the commercial urgency around it.

## Technical pointers for the first application review

${specs}

## What to lock before moving into supply

- Application-specific acceptance points
- Any visible-face, tolerance, or compliance expectation
- Pack handling or receiving sensitivity
- Commercial timing that still protects the technical route

## Final takeaway

${commercial}`;
  }

  if (pattern.suffix === 'buyers-guide') {
    return `## Why buyers still lose time on this route

${product.name} enquiries slow down when the first RFQ is missing the real application, approval reference, or receiving logic. The cleaner route is to front-load those decisions instead of recovering them later by email or WhatsApp.

## What the buyer should bring into the first RFQ

- Application or use case
- Dimensions, size range, or build requirement
- Finish, grade, or visible acceptance criteria
- Quantity, timing, and destination
- Any document, compliance, or inspection expectation

## Core technical checkpoints

${specs}

## Commercial frame that should stay attached

- Lead time: ${product.technical?.leadTime || 'On request'}
- MOQ: ${product.technical?.moq || 'On request'}
- Origin route: ${product.technical?.origin || 'On request'}
- Standards or compliance: ${standards}

## What should be approved before the PO hardens

- The exact route being quoted
- The accepted benchmark or sample logic
- Receiving or inspection priorities
- Any rework risk that would make a cheaper route more expensive later

## Reorder discipline

- Reorder from the last approved record, not from memory.
- Keep the sample, drawing, or accepted finish tied to the PO.
- Reconfirm whether the route, plant condition, or destination changed.
- Check whether the receiving team needs updated document support.

## Final takeaway

${commercial}`;
  }

  if (pattern.suffix === 'comparison') {
    const comparisonOptions = (product.technical?.grades || product.applications || []).slice(0, 3);
    const optionLines = comparisonOptions.length ? comparisonOptions.map((option) => `- ${option}`).join('\n') : `- ${product.name} versus a generic equivalent should only be judged against the same technical and commercial brief.`;
    return `## The comparison should stay like-for-like

${product.name} comparisons become misleading when buyers compare only price, only grade, or only brochure language. The cleaner comparison keeps the technical and commercial frame constant while the route itself changes.

## Useful comparison options or checkpoints

${optionLines}

## What should stay constant in the comparison

- The same application and end-use environment
- The same approval reference or finish expectation
- The same dimensional and receiving requirements
- The same documentation, timing, and destination context

## Where commercial selection usually goes wrong

- A broader available option is treated as equivalent without checking the real fit.
- The receiving and approval costs are ignored while only unit rate is compared.
- A process-sensitive route is judged like a generic material line.
- The plant or project consequence of the wrong choice is not priced into the decision.

## What buyers should ask before choosing the final route

- Which option protects the real end use better?
- Which option makes approval clearer instead of noisier?
- Which option increases receiving risk or repeat-order risk later?
- Which option only looks cheaper because hidden correction cost is being ignored?

## Technical baseline

${specs}

## Final takeaway

${commercial}`;
  }

  if (pattern.suffix === 'quality') {
    return `## Quality starts before release into use

${product.name} quality becomes easier to protect when receiving, approval, storage, and handling are treated as one sequence instead of disconnected moments.

## What should be checked on receipt

${specs}

## What quality teams should document

- Order reference and batch or dispatch linkage
- Surface or dimensional condition on arrival
- Pack integrity and handling observations
- Any deviation before production or installation release

## Storage and handling should not be an afterthought

- Keep the approved route identifiable through storage and issue.
- Separate acceptable material from pending or disputed material.
- Do not let commercial urgency erase the inspection result.
- Keep the reordering record tied to the same acceptance logic.

## Common reasons the route drifts later

- Weak reference matching between approval and actual supply
- Late inspection after the material has already moved into use
- Missing storage or handling discipline
- Commercial urgency overriding the agreed checkpoint list

## Standards or supporting references

${standards}

## Final takeaway

${commercial}`;
  }

  return `## Specification baseline

${product.summary}

## Technical checkpoints that should appear on the brief

${specs}

## Document structure that helps the route stay clean

- Product and application clearly named
- Grade, build, finish, or tolerance references written down
- Approved benchmark attached where relevant
- Quantity, timing, destination, and pack sensitivity included

## What should sit beside the specification

- Related programme routes: ${relatedRoutes}
- Material or grade platform: ${grades}
- Standards or compliance: ${standards}
- Commercial and document expectations that protect the route later

## When the specification needs tightening

- When the product is surface-critical or tolerance-sensitive
- When the route moves across more than one sourcing lane
- When the order depends on export or compliance documents
- When the project or line cannot absorb a late substitution

## Final takeaway

${commercial}`;
}

function generateTechnicalLibraryInsights() {
  const patterns = generatedInsightPatterns();
  return rawProducts.products.flatMap((product) => {
    const meta = productMeta[product.id];
    if (!meta) return [];
    return patterns.map((pattern) => ({
      id: `${product.id}-${pattern.suffix}`,
      slug: `${product.id}-${pattern.suffix}`,
      title: pattern.title(product),
      category: product.id,
      categoryLabel: insightCategoryLabelForProduct(product.id),
      tags: [product.name, product.use, product.stage, pattern.suffix.replace(/-/g, ' '), ...(product.industry || []), ...(product.applications || [])].filter(Boolean),
      type: pattern.type,
      date: NOW,
      readTime: '7 min',
      excerpt: pattern.excerpt(product),
      author: 'Moldart Technical Team',
      generated: true,
      content: buildGeneratedInsightContent(product, meta, pattern)
    }));
  });
}

const editorialInsights = normalizeInsightDates(rawInsightsSource.articles);
const generatedInsights = normalizeInsightDates(generateTechnicalLibraryInsights());
rawInsights = { ...rawInsightsSource, editorial: editorialInsights, generated: generatedInsights, articles: [...editorialInsights, ...generatedInsights] };

// ============================================================
// HELPERS
// ============================================================
function getProduct(id) {
  return rawProducts.products.find(p => p.id === id);
}
function getMeta(id) {
  return productMeta[id];
}
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}
function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${path.relative(WORK, filePath)}`);
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function writeBinaryFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  console.log(`  ✓ ${path.relative(WORK, filePath)}`);
}
function uniqueLinks(items = []) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const href = String(item?.href || '').trim();
    if (!href || seen.has(href)) continue;
    seen.add(href);
    output.push(item);
  }
  return output;
}
function insightTheme(article, context = null) {
  const key = context?.product?.id || article.category || article.categoryLabel;
  if (['press-plates', 'press-pads', 'engraved-cylinders', 'decor-paper'].includes(key) || article.categoryLabel === 'Lamination Tooling') {
    return { primary: '#18181b', soft: '#f4f4f5', accent: '#71717a', ink: '#18181b', glow: '#d4d4d8', image: '/images/page5_img3.webp' };
  }
  if (['plywood', 'fiberboard', 'osb', 'particleboard'].includes(key) || article.categoryLabel === 'Panel Systems') {
    return { primary: '#14532d', soft: '#f0fdf4', accent: '#15803d', ink: '#14532d', glow: '#bbf7d0', image: '/images/page6_img1.webp' };
  }
  if (['decorative-panels', 'ss-profiles', 'ss-furniture'].includes(key) || article.categoryLabel === 'Decorative Steel') {
    return { primary: '#1f2937', soft: '#f8fafc', accent: '#475569', ink: '#111827', glow: '#cbd5e1', image: '/images/page9_img1.webp' };
  }
  if (['industrial-press-plates'].includes(key) || article.categoryLabel === 'Industrial Tooling') {
    return { primary: '#1d4ed8', soft: '#eff6ff', accent: '#2563eb', ink: '#1e3a8a', glow: '#bfdbfe', image: '/images/page9_img4.webp' };
  }
  if (['wood-flooring', 'flooring-accessories'].includes(key) || article.categoryLabel === 'Flooring Systems') {
    return { primary: '#7c2d12', soft: '#fff7ed', accent: '#c2410c', ink: '#7c2d12', glow: '#fdba74', image: '/images/page7_img1.webp' };
  }
  return { primary: '#312e81', soft: '#eef2ff', accent: '#6366f1', ink: '#312e81', glow: '#c7d2fe', image: '/images/page7_img2.webp' };
}
function fallbackInsightReferences(article, context = null) {
  const category = article.categoryLabel;
  if (category === 'Lamination Tooling') {
    return [
      { title: 'How HPL panels are made', source: 'Fundermax', href: 'https://blog.fundermax.us/how-high-pressure-laminates-are-made', note: 'Open process reference for laminate manufacturing context.' },
      { title: 'Decorative laminate overview', source: 'Wikipedia', href: 'https://en.wikipedia.org/wiki/Decorative_laminate', note: 'General background only; useful for open terminology alignment.' },
      { title: 'CAPICARD press plates overview', source: 'C.A. PICARD', href: 'https://www.capicard.de/en/press-plates', note: 'Public reference point for press-plate route language.' },
      { title: 'BIS standards portal', source: 'Bureau of Indian Standards', href: 'https://www.bis.gov.in/standards/', note: 'Public entry point for Indian standards lookup.' }
    ];
  }
  if (category === 'Industrial Tooling') {
    return [
      { title: 'CAPICARD press plates overview', source: 'C.A. PICARD', href: 'https://www.capicard.de/en/press-plates', note: 'Useful public reference for tolerance-led press plate positioning.' },
      { title: 'BIS standards portal', source: 'Bureau of Indian Standards', href: 'https://www.bis.gov.in/standards/', note: 'Helpful when translating process requirements into standards lookup.' },
      { title: 'Stainless steels in architecture and design', source: 'Euro Inox', href: 'https://www.euro-inox.org/', note: 'General stainless background for open reference only.' }
    ];
  }
  if (category === 'Decorative Steel') {
    return [
      { title: 'Euro Inox surface finishes guide', source: 'Euro Inox', href: 'https://www.euro-inox.org/', note: 'Public reference point for stainless surface terminology.' },
      { title: 'Decorative stainless sourcing note', source: 'LinkedIn / Moldart', href: 'https://www.linkedin.com/company/moldartindia', note: 'Company-level public positioning for decorative stainless routes.' },
      { title: 'BIS standards portal', source: 'Bureau of Indian Standards', href: 'https://www.bis.gov.in/standards/', note: 'Open reference entry point for standards lookup.' }
    ];
  }
  if (category === 'Panel Systems') {
    return [
      { title: 'Formwork plywood reference', source: 'ULMA Construction', href: 'https://www.ulmaconstruction.com/en/products/formwork-plywood/birch-phenolic-plywood', note: 'Useful open reference for plywood/formwork orientation.' },
      { title: 'Shuttering plywood reuse guide', source: 'Haren Ply', href: 'https://www.harenply.com/types-applications-of-shuttering-plywood/', note: 'Public market reference for reuse behaviour.' },
      { title: 'EPA composite wood standards', source: 'US EPA', href: 'https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products', note: 'Helpful for emission and composite-wood compliance context.' }
    ];
  }
  if (category === 'Flooring Systems' || category === 'Furniture Programmes') {
    return [
      { title: 'EPA composite wood standards', source: 'US EPA', href: 'https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products', note: 'Open compliance reference for many board-based furniture routes.' },
      { title: 'BIS standards portal', source: 'Bureau of Indian Standards', href: 'https://www.bis.gov.in/standards/', note: 'Public standards lookup entry point.' },
      { title: 'Moldart company page', source: 'LinkedIn', href: COMPANY_LINKEDIN, note: 'Public company reference used alongside the deeper route notes.' }
    ];
  }
  return [
    { title: 'Moldart company page', source: 'LinkedIn', href: COMPANY_LINKEDIN, note: 'Public company reference.' },
    { title: 'BIS standards portal', source: 'Bureau of Indian Standards', href: 'https://www.bis.gov.in/standards/', note: 'Public standards lookup entry point.' }
  ];
}
function defaultInsightCards(article, context = null) {
  const product = context?.product;
  const specRows = product ? product.specs.slice(0, 3).map((spec, index) => specToRow(spec, index)) : [];
  if (specRows.length) {
    return [
      { label: 'Technical signal', value: `${specRows[0].label}: ${specRows[0].value}`, note: article.type },
      { label: 'Best-fit route', value: product.applications?.[0] || article.categoryLabel, note: (product.applications || []).slice(1, 3).join(' • ') || 'Requirement-led review' },
      { label: 'Programme logic', value: product.stage || product.use || article.categoryLabel, note: product.summary },
      { label: 'Use this page for', value: article.type, note: 'Read it against the actual brief, not as a generic substitute.' }
    ];
  }
  return [
    { label: 'Category', value: article.categoryLabel, note: article.type },
    { label: 'Use this page for', value: 'Specification clarity', note: 'Helpful when the brief is still being tightened.' },
    { label: 'Best fit', value: 'Buyer + technical review', note: 'Built to support the next commercial conversation.' },
    { label: 'Read with', value: 'Actual requirement', note: 'The article is strongest when read against the real enquiry.' }
  ];
}
function defaultInsightChart(article, context = null) {
  return {
    title: 'How to read this page',
    caption: 'A practical weighting for the first review rather than a laboratory score.',
    items: [
      { label: 'Application fit', score: 90, value: 'Start here', note: 'Check whether the route really fits the end use.' },
      { label: 'Specification clarity', score: /Specification|Technical|Guide/i.test(article.type) ? 88 : 74, value: 'Important', note: 'Lock the terms before comparing price.' },
      { label: 'Approval discipline', score: /Quality|Standards/i.test(article.type) ? 90 : 76, value: 'Important', note: 'Reference control reduces late-stage correction.' },
      { label: 'Commercial alignment', score: /Buyer|Comparative/i.test(article.type) ? 86 : 70, value: 'Next step', note: 'Use the page to improve the RFQ, not replace it.' }
    ]
  };
}
function defaultInsightTable(article, context = null) {
  const product = context?.product;
  const specRows = product ? product.specs.slice(0, 4).map((spec, index) => specToRow(spec, index)) : [];
  if (specRows.length) {
    return {
      title: 'Quick technical frame',
      columns: ['Checkpoint', 'Reference', 'Why it belongs in the brief'],
      rows: specRows.map((row) => [row.label, row.value, 'Helps keep the review tied to the actual route.'])
    };
  }
  return {
    title: 'Review frame',
    columns: ['Step', 'What to confirm', 'Why it matters'],
    rows: [
      ['Application', 'Where the route really fits', 'Stops broad comparisons from becoming misleading.'],
      ['Reference', 'Drawing, sample, or accepted benchmark', 'Protects approval quality before order confirmation.'],
      ['Commercial fit', 'Quantity, timing, destination, and documents', 'Keeps the technical path attached to the real project.']
    ]
  };
}
function defaultInsightFlow(article, context = null) {
  return {
    title: 'Use the article in this order',
    items: [
      'Read the page against the real application, not against a vague product name.',
      'Lock the strongest technical or approval checkpoints into the RFQ.',
      'Compare alternatives only after the route stays like-for-like.',
      'Carry the approved reference into receiving, supply, and repeat ordering.'
    ]
  };
}
function resolveInsightDossier(article, context = null) {
  const productDossier = insightDossiers?.byProduct?.[article.category] || {};
  const slugDossier = insightDossiers?.bySlug?.[article.slug] || {};
  return {
    ...productDossier,
    ...slugDossier,
    cards: slugDossier.cards || productDossier.cards || defaultInsightCards(article, context),
    chart: slugDossier.chart || productDossier.chart || defaultInsightChart(article, context),
    table: slugDossier.table || productDossier.table || defaultInsightTable(article, context),
    flow: slugDossier.flow || productDossier.flow || defaultInsightFlow(article, context),
    references: uniqueLinks([...(slugDossier.references || []), ...(productDossier.references || []), ...fallbackInsightReferences(article, context)])
  };
}
function insightPosterRelativePath(article, ext = 'svg') {
  return `/images/insights/${article.slug}.${ext}`;
}
function insightPosterOutputPath(article, ext = 'svg') {
  return path.join(WORK, 'images', 'insights', `${article.slug}.${ext}`);
}
function insightPreviewImage(article, context = null) {
  return insightPosterRelativePath(article, 'svg');
}
function insightPreviewAlt(article, context = null) {
  return `${article.title} — Moldart insight cover`;
}
function clampText(text = '', max = 72) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value || value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const safe = cut.includes(' ') ? cut.slice(0, cut.lastIndexOf(' ')).trim() : cut;
  return `${safe || cut}…`;
}
function wrapPosterText(text = '', limit = 22, maxLines = 4) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    const next = line ? `${line} ${word}` : word;
    if (next.length <= limit || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    if (lines.length === maxLines - 1) {
      const remaining = [word, ...words.slice(index + 1)].join(' ');
      lines.push(clampText(remaining, limit));
      return lines;
    }
    line = word;
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}
function renderPosterMetricChips(cards = []) {
  return cards.slice(0, 3).map((card, index) => {
    const x = 68 + (index * 204);
    return `<rect x="${x}" y="496" width="182" height="64" rx="20" fill="rgba(255,255,255,0.94)" stroke="rgba(24,24,27,0.08)"/><text x="${x + 18}" y="520" font-family="Arial, sans-serif" font-size="12" fill="#71717a" letter-spacing="1.4">${escHtml(clampText(String(card.label || '').toUpperCase(), 18))}</text><text x="${x + 18}" y="546" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">${escHtml(clampText(card.value, 18))}</text>`;
  }).join('');
}
function buildInsightPosterSvg(article) {
  const context = articleProductContext(article);
  const dossier = resolveInsightDossier(article, context);
  const theme = insightTheme(article, context);
  const titleLines = wrapPosterText(article.title, 20, 4);
  const noteLines = wrapPosterText(clampText(dossier.posterNote || article.excerpt, 108), 42, 2);
  const chartItems = (dossier.chart?.items || []).slice(0, 3);
  const titleFont = titleLines.length > 3 ? 44 : 50;
  const titleHtml = titleLines.map((line, index) => `<text x="68" y="${170 + (index * 58)}" font-family="Arial, sans-serif" font-size="${titleFont}" font-weight="700" fill="#18181b">${escHtml(line)}</text>`).join('');
  const noteHtml = noteLines.map((line, index) => `<text x="68" y="${422 + (index * 28)}" font-family="Arial, sans-serif" font-size="22" fill="#52525b">${escHtml(line)}</text>`).join('');
  const chartHtml = chartItems.map((item, index) => {
    const y = 180 + (index * 108);
    const barWidth = Math.round(198 * ((item.score || 70) / 100));
    return `<text x="776" y="${y - 20}" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#18181b">${escHtml(clampText(item.label, 26))}</text><rect x="776" y="${y}" width="214" height="12" rx="6" fill="#e4e4e7"/><rect x="776" y="${y}" width="${barWidth}" height="12" rx="6" fill="${theme.primary}"/><text x="1010" y="${y + 11}" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#18181b">${escHtml(clampText(item.value || `${item.score}`, 12))}</text><text x="776" y="${y + 38}" font-family="Arial, sans-serif" font-size="14" fill="#52525b">${escHtml(clampText(item.note || '', 44))}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escHtml(article.title)}">
    <defs>
      <linearGradient id="posterGrad-${escHtml(article.slug)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="${theme.soft}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" rx="36" fill="url(#posterGrad-${escHtml(article.slug)})"/>
    <rect x="38" y="38" width="1124" height="554" rx="30" fill="rgba(255,255,255,0.9)" stroke="rgba(24,24,27,0.06)"/>
    <circle cx="1072" cy="110" r="18" fill="${theme.glow}"/>
    <circle cx="1036" cy="110" r="8" fill="${theme.primary}"/>
    <rect x="68" y="74" width="292" height="38" rx="19" fill="${theme.primary}" opacity="0.94"/>
    <text x="92" y="99" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="1.8">${escHtml(clampText((dossier.posterKicker || article.categoryLabel).toUpperCase(), 24))}</text>
    ${titleHtml}
    ${noteHtml}
    ${renderPosterMetricChips(dossier.cards || [])}
    <rect x="736" y="86" width="394" height="458" rx="30" fill="#ffffff" stroke="rgba(24,24,27,0.08)"/>
    <text x="776" y="128" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="${theme.primary}" letter-spacing="1.7">DASHBOARD SNAPSHOT</text>
    ${chartHtml}
    <text x="776" y="504" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#71717a" letter-spacing="1.4">${escHtml(clampText(article.categoryLabel.toUpperCase(), 26))}</text>
    <text x="776" y="536" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">MOLDART</text>
    <text x="952" y="536" font-family="Arial, sans-serif" font-size="16" fill="#52525b">moldartindia.com</text>
  </svg>`;
}
async function rasterizeSvgSet(tasks = []) {
  if (!chromium || !tasks.length) return;
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const task of tasks) {
    await page.goto(pathToFileURL(task.svgPath).href, { waitUntil: 'load' });
    await page.screenshot({ path: task.pngPath, type: 'png' });
    console.log(`  ✓ ${path.relative(WORK, task.pngPath)}`);
  }
  await browser.close();
}
async function generateInsightPosterAssets() {
  const allArticles = rawInsights.articles || [];
  if (!allArticles.length) return;
  mkdirp(path.join(WORK, 'images', 'insights'));
  const rasterTasks = [];
  for (const article of allArticles) {
    const svg = buildInsightPosterSvg(article);
    const svgPath = insightPosterOutputPath(article, 'svg');
    writeFile(svgPath, svg);
    if (sharp) {
      const input = Buffer.from(svg);
      await sharp(input).png().toFile(insightPosterOutputPath(article, 'png'));
      console.log(`  ✓ ${path.relative(WORK, insightPosterOutputPath(article, 'png'))}`);
    } else {
      rasterTasks.push({ svgPath, pngPath: insightPosterOutputPath(article, 'png') });
    }
  }
  await rasterizeSvgSet(rasterTasks);
}
const SITE_SOCIAL_POSTERS = [
  {
    name: 'moldart-default',
    kicker: 'Moldart',
    title: 'Specification-led wood and steel supply',
    note: 'Lamination tooling, panels, flooring, furniture, decorative stainless steel, and industrial press routes from Mumbai.',
    chips: ['Since 1989', 'Mumbai', 'India + China', 'Requirement-led']
  },
  {
    name: 'moldart-home',
    kicker: 'Homepage preview',
    title: 'Wood and steel supply, aligned to the brief',
    note: 'Solutions, resources, insights, and contact kept under one cleaner Moldart layer.',
    chips: ['Solutions', 'Resources', 'Insights', 'Contact']
  },
  {
    name: 'moldart-solutions',
    kicker: 'Solutions',
    title: 'Application routes before product noise',
    note: 'Use the solutions layer when the requirement is still being narrowed at programme level.',
    chips: ['Lamination', 'Furniture', 'Flooring', 'Architecture']
  },
  {
    name: 'moldart-resources',
    kicker: 'Resources',
    title: 'References, decks, and decision files',
    note: 'A cleaner document layer for approvals, RFQs, and repeat technical checks.',
    chips: ['24 references', 'Downloadable', 'Searchable', 'Support files']
  },
  {
    name: 'moldart-insights',
    kicker: 'Insights',
    title: 'Technical articles for buyers, teams, and partners',
    note: 'Long-form guides, route notes, and public references built around real enquiries.',
    chips: ['Editorial', 'Technical routes', 'Public references', 'Share-ready']
  },
  {
    name: 'moldart-process',
    kicker: 'Process',
    title: 'From brief to a stable supply route',
    note: 'Share the brief, align the route, lock the reference, and carry that logic into repeat supply.',
    chips: ['Brief', 'Route', 'Reference', 'Supply']
  }
];
function siteSocialPosterRelativePath(name, ext = 'png') {
  return `/images/social/${name}.${ext}`;
}
function siteSocialPosterOutputPath(name, ext = 'svg') {
  return path.join(WORK, 'images', 'social', `${name}.${ext}`);
}
function buildSiteSocialSvg(config) {
  const chips = (config.chips || []).slice(0, 4);
  const titleLines = wrapPosterText(config.title, 26, 3);
  const noteLines = wrapPosterText(clampText(config.note, 104), 38, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escHtml(config.title)}">
    <rect width="1200" height="630" rx="36" fill="#f6f5f4"/>
    <rect x="42" y="42" width="1116" height="546" rx="30" fill="#ffffff" stroke="rgba(24,24,27,0.08)"/>
    <rect x="72" y="72" width="220" height="38" rx="19" fill="#18181b"/>
    <text x="96" y="97" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="1.8">${escHtml(clampText(String(config.kicker || 'Moldart').toUpperCase(), 20))}</text>
    ${titleLines.map((line, index) => `<text x="72" y="${184 + (index * 60)}" font-family="Arial, sans-serif" font-size="50" font-weight="700" fill="#18181b">${escHtml(line)}</text>`).join('')}
    ${noteLines.map((line, index) => `<text x="72" y="${392 + (index * 28)}" font-family="Arial, sans-serif" font-size="23" fill="#52525b">${escHtml(line)}</text>`).join('')}
    ${chips.map((chip, index) => `<rect x="${72 + (index * 174)}" y="484" width="160" height="56" rx="18" fill="#ffffff" stroke="rgba(24,24,27,0.08)"/><text x="${92 + (index * 174)}" y="518" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#18181b">${escHtml(clampText(chip, 16))}</text>`).join('')}
    <rect x="756" y="72" width="332" height="486" rx="28" fill="#fafafa" stroke="rgba(24,24,27,0.08)"/>
    <text x="792" y="116" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#71717a" letter-spacing="1.8">PROGRAMME GEOGRAPHY</text>
    <path d="M812 296C842 260 866 236 892 214" fill="none" stroke="#18181b" stroke-opacity="0.18" stroke-width="18" stroke-linecap="round"/>
    <path d="M812 296C868 276 926 248 988 228" fill="none" stroke="#18181b" stroke-opacity="0.22" stroke-width="10" stroke-dasharray="14 16" stroke-linecap="round"/>
    <path d="M812 296C746 272 692 248 644 212" fill="none" stroke="#d4d4d8" stroke-width="10" stroke-linecap="round"/>
    <circle cx="812" cy="296" r="16" fill="#18181b"/>
    <circle cx="892" cy="214" r="12" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
    <circle cx="988" cy="228" r="12" fill="#ffffff" stroke="#18181b" stroke-width="3"/>
    <text x="780" y="342" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">Mumbai</text>
    <text x="862" y="188" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">India</text>
    <text x="958" y="202" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">China</text>
    <text x="792" y="418" font-family="Arial, sans-serif" font-size="16" fill="#52525b">Start from the route, then match the reference.</text>
    <text x="792" y="508" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">moldartindia.com</text>
  </svg>`;
}
async function generateSiteSocialAssets() {
  mkdirp(path.join(WORK, 'images', 'social'));
  const rasterTasks = [];
  for (const config of SITE_SOCIAL_POSTERS) {
    const svg = buildSiteSocialSvg(config);
    const svgPath = siteSocialPosterOutputPath(config.name, 'svg');
    writeFile(svgPath, svg);
    if (sharp) {
      const input = Buffer.from(svg);
      await sharp(input).png().toFile(siteSocialPosterOutputPath(config.name, 'png'));
      console.log(`  ✓ ${path.relative(WORK, siteSocialPosterOutputPath(config.name, 'png'))}`);
    } else {
      rasterTasks.push({ svgPath, pngPath: siteSocialPosterOutputPath(config.name, 'png') });
    }
  }
  await rasterizeSvgSet(rasterTasks);
}
function renderInsightCoverCard(article, context = null, options = {}) {
  const src = insightPreviewImage(article, context);
  const loading = options.eager ? 'eager' : 'lazy';
  const poster = resolveInsightDossier(article, context);
  return `<div class="article-cover-card"><img src="${src}" alt="${escHtml(insightPreviewAlt(article, context))}" loading="${loading}"${options.eager ? ' fetchpriority="high"' : ''}><div class="article-cover-overlay"></div><div class="article-cover-badge">${escHtml(poster.posterKicker || article.categoryLabel)}</div></div>`;
}
function renderInsightCardMedia(article, context = null) {
  return `<div class="ui-insight-card-media"><img src="${insightPreviewImage(article, context)}" alt="${escHtml(insightPreviewAlt(article, context))}" loading="lazy"></div>`;
}
function renderHomeInsightRow(article) {
  return `<div class="ui-article-row"><div class="ui-article-row-media"><img src="${insightPreviewImage(article)}" alt="${escHtml(insightPreviewAlt(article))}" loading="lazy"></div><div class="ui-article-row-copy"><div class="ui-list-title">${escHtml(article.title)}</div><div class="ui-list-meta">${escHtml(article.categoryLabel)} · ${escHtml(article.type)}</div></div><a href="/insights/${article.slug}/" class="ui-list-link">${glyph('arrow', 'icon icon-sm')}</a></div>`;
}
function renderInsightDashboardCards(cards = []) {
  if (!cards.length) return '';
  return `<div class="article-dashboard-grid">${cards.map((card) => `<article class="article-dashboard-card"><div class="article-dashboard-label">${escHtml(card.label)}</div><div class="article-dashboard-value">${escHtml(card.value)}</div><p class="article-dashboard-note">${escHtml(card.note || '')}</p></article>`).join('')}</div>`;
}
function renderInsightChart(chart = null) {
  if (!chart?.items?.length) return '';
  const items = chart.items.slice(0, 4);
  const rowGap = 78;
  const height = 84 + (items.length * rowGap);
  const svg = `<svg class="article-chart-svg" viewBox="0 0 460 ${height}" role="img" aria-label="${escHtml(chart.title)}">${items.map((item, index) => {
    const y = 38 + (index * rowGap);
    const width = Math.max(28, Math.round(248 * ((item.score || 70) / 100)));
    return `<text x="24" y="${y}" class="chart-label">${escHtml(item.label)}</text><rect x="24" y="${y + 14}" width="260" height="12" rx="6" fill="#e4e4e7"></rect><rect x="24" y="${y + 14}" width="${width}" height="12" rx="6" fill="#18181b"></rect><text x="302" y="${y + 25}" class="chart-value">${escHtml(item.value || `${item.score}`)}</text>`;
  }).join('')}</svg>`;
  return `<article class="article-visual-card"><div class="article-visual-label">SVG dashboard</div><h3 class="article-visual-title">${escHtml(chart.title)}</h3><p class="article-visual-copy">${escHtml(chart.caption || '')}</p>${svg}<div class="article-chart-notes">${items.map((item) => `<div class="article-chart-note"><strong>${escHtml(item.label)}:</strong> ${escHtml(item.note || '')}</div>`).join('')}</div></article>`;
}
function renderInsightTablePanel(table = null) {
  if (!table?.rows?.length) return '';
  return `<article class="article-visual-card"><div class="article-visual-label">Reference table</div><h3 class="article-visual-title">${escHtml(table.title)}</h3><div class="article-table-wrap"><table><tr>${(table.columns || []).map((column) => `<th>${escHtml(column)}</th>`).join('')}</tr>${table.rows.map((row) => `<tr>${row.map((value) => `<td>${escHtml(value)}</td>`).join('')}</tr>`).join('')}</table></div></article>`;
}
function renderInsightFlowPanel(flow = null) {
  if (!flow?.items?.length) return '';
  return `<section class="article-flow-section"><div class="article-section-head"><div class="ui-kicker mb-3">${glyph('route', 'icon icon-sm')} Use this page</div><h2>${escHtml(flow.title)}</h2></div><div class="article-flow-grid">${flow.items.map((item, index) => `<article class="article-flow-card"><div class="article-flow-step">0${index + 1}</div><p>${escHtml(item)}</p></article>`).join('')}</div></section>`;
}
function renderInsightReferences(article, context = null) {
  const references = resolveInsightDossier(article, context).references || [];
  if (!references.length) return '';
  return `<section class="article-reference-section"><div class="article-section-head"><div class="ui-kicker mb-3">${glyph('book', 'icon icon-sm')} Public references</div><h2>Reference links and standards context</h2></div><div class="article-reference-grid">${references.map((ref) => `<article class="article-reference-card"><div class="article-reference-source">${escHtml(ref.source || 'Reference')}</div><h3>${escHtml(ref.title)}</h3><p>${escHtml(ref.note || '')}</p><a href="${ref.href}" target="_blank" rel="noopener noreferrer" class="site-inline-link">Open reference ${glyph('arrow', 'icon icon-sm')}</a></article>`).join('')}</div></section>`;
}
function renderInsightDeepPanels(article, context = null) {
  const dossier = resolveInsightDossier(article, context);
  const dashboard = renderInsightDashboardCards(dossier.cards || []);
  const visuals = [renderInsightChart(dossier.chart), renderInsightTablePanel(dossier.table)].filter(Boolean).join('');
  const leadDeck = renderInsightCoverCard(article, context, { eager: true });
  return `${leadDeck}${dashboard ? `<section class="article-dashboard-section">${dashboard}</section>` : ''}${visuals ? `<section class="article-visual-grid">${visuals}</section>` : ''}${renderInsightFlowPanel(dossier.flow)}${renderInsightReferences(article, context)}`;
}
// safeJson() removed — search data now written to external JSON file

function getApplicationVisual(slug) {
  return applicationVisuals[slug] || {
    image: '/images/page5_img3.webp',
    alt: 'Moldart application visual',
    eyebrow: 'Application overview'
  };
}

function safeProductMetaDesc(product) {
  const uses = (product.applications || []).slice(0, 3).join(', ');
  return `${product.name} from Moldart. Verified overview, core specification references, and enquiry-led supply support${uses ? ` for ${uses}` : ''}.`;
}

function standardsText(technical = {}) {
  const standards = (technical.certifications || []).filter(Boolean);
  return standards.length ? standards.join(', ') : 'Confirmed per enquiry';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function safeHref(value = '') {
  return encodeURI(value);
}

function hostedDownloadHref(item = {}) {
  const url = String(item.url || '').trim();
  if (!url) return '';
  if (LARGE_DOWNLOAD_PATHS.has(url)) {
    return `https://github.com/thisisyashdoshi/moldart-home/raw/${PUBLIC_DOWNLOAD_BRANCH}${encodeURI(url)}`;
  }
  return safeHref(url);
}

function isRequestOnlyResource(item = {}) {
  return item.access === 'request' && !hostedDownloadHref(item);
}

function requestDocumentHref(item = {}) {
  const title = item.title || 'Document request';
  const message = item.note
    ? `Please share the resource: ${title}. ${item.note}`
    : `Please share the resource: ${title}.`;
  return `/contact/?product=${encodeURIComponent(title)}&focus=document-request&message=${encodeURIComponent(message)}`;
}

function resourceHref(item = {}) {
  return isRequestOnlyResource(item) ? requestDocumentHref(item) : hostedDownloadHref(item);
}

function glyph(name, className = 'icon') {
  const icons = {
    spark: '<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/><path d="M19 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7z"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-5.5 2.5L8 16l5.5-2.5L16 8z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h4a4 4 0 0 0 4-4V7"/>',
    map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
    factory: '<path d="M3 21h18"/><path d="M5 21V9l5 3V9l5 3V6l4 3v12"/><path d="M9 21v-4h2v4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h1"/><path d="M12 7h1"/><path d="M16 7h1"/><path d="M8 11h1"/><path d="M12 11h1"/><path d="M16 11h1"/><path d="M8 15h1"/><path d="M12 15h1"/><path d="M16 15h1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8 9.62a16 16 0 0 0 6.38 6.38l1.18-1.23a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    'linkedin-brand': '<circle cx="4" cy="4" r="1.25"/><rect x="2.75" y="8" width="2.5" height="10" rx="1"/><path d="M9 8h2.5v1.8A3.3 3.3 0 0 1 14.3 8C17 8 18 9.7 18 12.3V18h-2.6v-5.1c0-1.4-.5-2.3-1.9-2.3-1 0-1.7.7-2 1.5-.1.2-.1.6-.1.9V18H9z"/>',
    'whatsapp-brand': '<path d="M20 11.2A8.8 8.8 0 0 1 7.3 19l-3.3.8.9-3.1A8.8 8.8 0 1 1 20 11.2Z"/><path d="M9 8.8c.2 1.8 1.7 3.8 3.8 5.1"/><path d="m12.7 13 1.3-.5"/><path d="m10.1 10.2.8-1"/>',
    'x-brand': '<path d="M4 4l16 16"/><path d="M20 4 4 20"/>',
    'facebook-brand': '<path d="M14 21v-7h3l1-4h-4V8.4c0-1.1.4-2.1 2.1-2.1H18V3.1c-.3 0-1.4-.1-2.7-.1-2.8 0-4.8 1.7-4.8 4.9V10H7v4h3.5v7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    arrow: '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>'
  };
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}

function familyIconName(title) {
  if (title === 'Lamination Tooling') return 'layers';
  if (title === 'Engineered Wood Substrates') return 'factory';
  if (title === 'Flooring & Furniture Programmes') return 'compass';
  if (title === 'Decorative Stainless Steel') return 'spark';
  return 'shield';
}

function applicationIconName(slug) {
  if (slug === 'lamination') return 'layers';
  if (slug === 'furniture') return 'factory';
  if (slug === 'flooring') return 'compass';
  if (slug === 'architecture') return 'building';
  if (slug === 'metal-finishing') return 'spark';
  return 'shield';
}

function renderMetricCard({ icon, label, value, note = '', suffix = '', animate = false }) {
  const isNumeric = animate && Number.isFinite(Number(value));
  const finalValue = `${value}${suffix}`;
  const valueMarkup = isNumeric
    ? `<span data-count-to="${Number(value)}" data-count-suffix="${escHtml(suffix)}">${escHtml(finalValue)}</span>`
    : escHtml(finalValue);

  return `<article class="ui-metric-card">
      <div class="ui-metric-head">
          <div class="ui-metric-icon">${glyph(icon)}</div>
          <div class="section-label">${escHtml(label)}</div>
      </div>
      <div class="ui-metric-value">${valueMarkup}</div>
      <div class="ui-metric-label">${escHtml(label)}</div>
      <p class="ui-metric-note">${escHtml(note)}</p>
  </article>`;
}

function renderActionCard({ href, title, detail, meta, icon }) {
  return `<a href="${href}" class="ui-action-card">
      <div class="ui-action-icon">${glyph(icon)}</div>
      <div>
          <div class="ui-action-title">${escHtml(title)}</div>
          <p class="ui-action-copy mt-2">${escHtml(detail)}</p>
      </div>
      <div class="ui-action-meta">${escHtml(meta)} →</div>
  </a>`;
}

function renderCompactFamilyCard(family) {
  return `<a href="/solutions/" class="ui-proof-card">
      <div class="ui-proof-label">${glyph(familyIconName(family.title), 'icon icon-sm')} ${escHtml(family.title)}</div>
      <div class="ui-proof-value">${escHtml(family.highlights[0])}</div>
      <p class="ui-proof-copy">${escHtml(family.intro)}</p>
  </a>`;
}

function getInsightSlugs() {
  return new Set(rawInsights.articles.map((article) => article.slug));
}

function getSearchEntries() {
  const pageIconMap = {
    Home: 'home',
    Solutions: 'compass',
    Explore: 'search',
    Resources: 'book',
    Insights: 'spark',
    FAQ: 'message',
    Process: 'route',
    About: 'building',
    Contact: 'message'
  };

  const productIcon = (product) => {
    if (product.id === 'industrial-press-plates') return 'shield';
    if (product.material === 'Steel') return 'spark';
    if (product.use === 'Tooling') return 'layers';
    if (product.use === 'Panel') return 'factory';
    if (product.use === 'Surface') return 'compass';
    return 'layers';
  };

  const insightIcon = (article) => {
    if (article.categoryLabel === 'Lamination Tooling') return 'layers';
    if (article.categoryLabel === 'Industrial Tooling') return 'shield';
    if (article.categoryLabel === 'Decorative Steel') return 'spark';
    if (article.categoryLabel === 'Panel Systems') return 'factory';
    if (article.categoryLabel === 'Flooring Systems') return 'compass';
    if (article.categoryLabel === 'Furniture Programmes') return 'building';
    return 'book';
  };

  const pageEntries = [
    { group: 'Page', title: 'Home', url: '/', meta: 'Home and overview', keywords: ['home', 'overview'], icon: pageIconMap.Home },
    ...primaryPages.map((page) => ({ group: 'Page', ...page, icon: pageIconMap[page.title] || 'book' }))
  ];

  const familyEntries = portfolioFamilies.map((family) => ({
    group: 'Product Family',
    title: family.title,
    url: '/solutions/',
    meta: family.highlights[0],
    keywords: [...family.products, ...family.sectors],
    icon: familyIconName(family.title)
  }));

  const productEntries = rawProducts.products.map((product) => {
    const meta = getMeta(product.id);
    return {
      group: 'Product',
      title: product.name,
      url: meta ? `/products/${meta.slug}/` : '/products/',
      meta: `${product.stage} · ${product.use}`,
      keywords: [product.material, product.stage, product.use, ...product.industry, ...product.applications, ...product.specs],
      icon: productIcon(product)
    };
  });

  const appEntries = applications.map((app) => ({
    group: 'Solution',
    title: app.name,
    url: getSolutionHref(app.slug),
    meta: getApplicationVisual(app.slug).eyebrow,
    keywords: [...app.products, ...app.considerations],
    icon: applicationIconName(app.slug)
  }));

  const resourceEntries = resourceGroups.flatMap((group) => group.items.map((item) => ({
    group: 'Resource',
    title: item.title,
    url: resourceHref(item),
    meta: `${group.title} · ${isRequestOnlyResource(item) ? 'Request file' : 'PDF'}`,
    keywords: [group.title, item.desc, item.note || '', isRequestOnlyResource(item) ? 'request file' : 'download', 'catalog', 'pdf'],
    icon: 'file',
    downloadable: !isRequestOnlyResource(item)
  })));

  const insightEntries = rawInsights.articles.map((article) => ({
    group: 'Insight',
    title: article.title,
    url: `/insights/${article.slug}/`,
    meta: `${article.categoryLabel} · ${article.type}`,
    keywords: [article.categoryLabel, article.type, ...article.tags, article.excerpt],
    icon: insightIcon(article)
  }));

  const allEntries = [...pageEntries, ...familyEntries, ...productEntries, ...appEntries, ...resourceEntries, ...insightEntries];
  const dedupedEntries = [];
  const seen = new Set();
  for (const entry of allEntries) {
    const key = `${entry.group}|${entry.title}|${entry.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedEntries.push(entry);
  }
  return dedupedEntries;
}

function renderHeroNetworkMap() {
  return `<div class="hero-network-card hero-world-map" aria-label="Illustrative global programme map">
      <svg class="hero-network-svg" viewBox="0 0 960 620" role="img" aria-label="Illustrative world map showing Mumbai separately from India, with India and China as sourcing anchors and representative trade lanes across six buyer-relevant regions">
          <defs>
              <linearGradient id="routeFade" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#18181b" stop-opacity="0.98"></stop>
                  <stop offset="100%" stop-color="#71717a" stop-opacity="0.18"></stop>
              </linearGradient>
              <linearGradient id="routeSoft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#18181b" stop-opacity="0.46"></stop>
                  <stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.1"></stop>
              </linearGradient>
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="7"></feGaussianBlur>
              </filter>
          </defs>
          <rect x="0" y="0" width="960" height="620" rx="34" fill="#fafafa"></rect>
          <g class="hero-world-grid">
              <path d="M44 112H916"></path>
              <path d="M44 202H916"></path>
              <path d="M44 292H916"></path>
              <path d="M44 382H916"></path>
              <path d="M44 472H916"></path>
              <path d="M132 52V568"></path>
              <path d="M236 52V568"></path>
              <path d="M340 52V568"></path>
              <path d="M444 52V568"></path>
              <path d="M548 52V568"></path>
              <path d="M652 52V568"></path>
              <path d="M756 52V568"></path>
              <path d="M860 52V568"></path>
          </g>
          <g class="hero-world-continents">
              <path d="M98 182c28-42 71-66 128-70 36-3 67 5 90 24 20 16 31 36 31 58 0 18-10 33-28 46-25 16-45 33-58 49-17 21-40 31-69 31-42 0-78-13-106-39-25-23-23-56 12-99z"></path>
              <path d="M238 330c26 12 45 34 57 66 12 30 11 62-2 91-12 25-28 49-46 72-11 14-25 20-41 17-14-5-20-20-20-45 0-29 7-57 21-84 9-17 14-35 16-53 2-21 8-42 15-64z"></path>
              <path d="M386 136c24-14 56-21 88-18 21 2 39 9 53 22 13 13 15 28 6 44-9 15-25 25-46 29-21 4-38 13-50 27-10 11-22 15-36 15-22 0-40-8-54-23-14-15-18-32-11-48 6-18 22-33 50-48z"></path>
              <path d="M454 260c29 5 53 18 72 40 21 23 34 51 38 85 3 26-1 49-13 69-14 21-33 32-58 31-24-2-44-14-60-37-16-22-24-51-24-86 0-36 6-64 18-82 8-10 17-16 27-20z"></path>
              <path d="M544 104c34-22 76-34 130-34 37 0 70 6 99 20 34 16 52 40 53 71 1 24-8 43-28 56-27 18-49 36-65 56-15 19-33 29-56 33-26 4-49-2-70-19-19-16-32-38-37-66-6-30 0-58 18-84 12-17 23-31 33-43 7-7 14-13 23-16z"></path>
              <path d="M762 348c24 3 44 12 62 28 19 16 31 38 34 65 2 18-3 33-14 45-14 13-32 17-54 12-22-5-40-18-54-38-15-20-21-42-18-65 2-20 11-37 28-51 6-5 11-8 16-8z"></path>
          </g>
          <g class="hero-world-india-shape-group">
              <path class="hero-india-shape" d="M607 230c9 6 16 16 18 30 3 12 9 22 20 30 3 2 4 7 1 11-8 10-17 19-26 29-7 9-10 20-9 32 1 9-3 14-10 12-8-2-15-9-22-21-6-12-12-22-18-29-5-6-6-12-3-18 4-8 9-15 15-24 7-8 10-18 12-29 2-11 9-20 22-23z"></path>
          </g>
          <g class="hero-world-routes hero-world-route-glow">
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C605 266 615 250 623 238"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C628 272 670 252 716 228"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C494 238 362 194 172 175"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C448 296 332 343 236 422"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C536 246 490 204 446 168"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C548 322 520 356 502 392"></path>
              <path class="hero-world-route hero-world-route-glow-line" d="M592 286C670 304 744 346 820 392"></path>
          </g>
          <g class="hero-world-routes">
              <path class="hero-world-route hero-world-route-primary" d="M592 286C605 266 615 250 623 238"></path>
              <path class="hero-world-route hero-world-route-primary" d="M592 286C628 272 670 252 716 228"></path>
              <path class="hero-world-route hero-world-route-soft" d="M592 286C494 238 362 194 172 175"></path>
              <path class="hero-world-route hero-world-route-soft" d="M592 286C448 296 332 343 236 422"></path>
              <path class="hero-world-route hero-world-route-soft" d="M592 286C536 246 490 204 446 168"></path>
              <path class="hero-world-route hero-world-route-soft" d="M592 286C548 322 520 356 502 392"></path>
              <path class="hero-world-route hero-world-route-soft" d="M592 286C670 304 744 346 820 392"></path>
          </g>
          <g class="hero-route-dots">
              <circle class="hero-route-dot" style="animation-delay:0s" cx="606" cy="264" r="5"></circle>
              <circle class="hero-route-dot" style="animation-delay:.35s" cx="619" cy="245" r="5"></circle>
              <circle class="hero-route-dot" style="animation-delay:.7s" cx="654" cy="258" r="5"></circle>
              <circle class="hero-route-dot" style="animation-delay:1.05s" cx="700" cy="236" r="5"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:1.4s" cx="512" cy="247" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:1.75s" cx="428" cy="222" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:2.1s" cx="332" cy="201" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:2.45s" cx="489" cy="313" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:2.8s" cx="394" cy="344" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:3.15s" cx="295" cy="386" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:3.5s" cx="548" cy="248" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:3.85s" cx="494" cy="205" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:4.2s" cx="532" cy="330" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:4.55s" cx="510" cy="367" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:4.9s" cx="690" cy="324" r="4"></circle>
              <circle class="hero-route-dot hero-route-dot-soft" style="animation-delay:5.25s" cx="764" cy="364" r="4"></circle>
          </g>
          <g class="hero-world-nodes">
              <circle class="hero-world-pulse" cx="592" cy="286" r="26"></circle>
              <circle class="hero-world-node hero-world-node-primary" cx="592" cy="286" r="10"></circle>
              <circle class="hero-world-node hero-world-node-source" cx="623" cy="238" r="9"></circle>
              <circle class="hero-world-node hero-world-node-source" cx="716" cy="228" r="9"></circle>
              <circle class="hero-world-node" cx="172" cy="175" r="7"></circle>
              <circle class="hero-world-node" cx="236" cy="422" r="7"></circle>
              <circle class="hero-world-node" cx="446" cy="168" r="7"></circle>
              <circle class="hero-world-node" cx="502" cy="392" r="7"></circle>
              <circle class="hero-world-node" cx="820" cy="392" r="7"></circle>
          </g>
          <g class="hero-label-group">
              <path class="hero-node-pointer" d="M592 270l-30-38"></path>
              <text x="536" y="224" class="hero-node-label hero-node-label-primary">Mumbai</text>
              <text x="536" y="205" class="hero-node-meta">Operating base</text>
              <path class="hero-node-pointer" d="M623 238l18-34"></path>
              <text x="676" y="190" class="hero-node-label">India</text>
              <text x="676" y="171" class="hero-node-meta">Sourcing anchor</text>
              <path class="hero-node-pointer" d="M716 228l30-26"></path>
              <text x="804" y="184" class="hero-node-label">China</text>
              <text x="804" y="165" class="hero-node-meta">Sourcing anchor</text>
          </g>
          <g class="hero-world-region-labels">
              <text x="136" y="144" class="hero-world-region-label">North America</text>
              <text x="186" y="470" class="hero-world-region-label">South America</text>
              <text x="380" y="112" class="hero-world-region-label">Europe</text>
              <text x="430" y="442" class="hero-world-region-label">Africa</text>
              <text x="624" y="96" class="hero-world-region-label">Asia</text>
              <text x="758" y="446" class="hero-world-region-label">Oceania</text>
          </g>
          <g class="hero-map-caption-group">
              <rect x="66" y="520" width="244" height="48" rx="20" fill="rgba(255,255,255,0.94)" stroke="#e4e4e7"></rect>
              <text x="88" y="548" class="hero-world-small hero-world-small-strong">Representative programme lanes only</text>
          </g>
      </svg>
  </div>`;
}

function renderHomepageFamilyBento(family, index) {
  const visual = familyVisuals[family.title] || familyVisuals['Lamination Tooling'];
  const productLinks = family.products.slice(0, 4).map((productId) => productTextLink(productId)).filter(Boolean).join('');
  const large = index === 0 || index === 3;
  return `<article class="home-family-bento${large ? ' home-family-bento-large' : ''}">
      <div class="home-family-media">
          <picture>
              <source srcset="${visual.image.replace('.webp', '.avif')}" type="image/avif">
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="720" height="520" ${large ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} class="w-full h-full object-cover">
          </picture>
          <div class="home-family-media-overlay"></div>
          <div class="home-family-media-label">${escHtml(visual.label)}</div>
      </div>
      <div class="home-family-content">
          <h3 class="font-display font-bold text-2xl mb-3">${escHtml(family.title)}</h3>
          <p class="text-sm text-zinc-500 leading-relaxed mb-5">${escHtml(family.intro)}</p>
          <div class="home-family-facts mb-5">
              ${family.highlights.slice(0, 3).map((item) => `<span>${escHtml(item)}</span>`).join('')}
          </div>
          <div class="portfolio-link-row">${productLinks}</div>
      </div>
  </article>`;
}

function renderApplicationMosaic(app) {
  const cards = app.products.slice(0, 4).map((productId) => {
    const product = getProduct(productId);
    return product ? `<div class="application-mosaic-tile"><img src="${product.image}" alt="${escHtml(product.name)}" width="320" height="240" loading="eager"><span>${escHtml(product.name)}</span></div>` : '';
  }).filter(Boolean).join('');
  return `<div class="application-mosaic">${cards}</div>`;
}

function specToRow(spec, index = 0) {
  const parts = spec.split(':');
  if (parts.length > 1) {
    return {
      label: parts[0].trim(),
      value: parts.slice(1).join(':').trim()
    };
  }
  const fallback = spec.split(',')[0].trim();
  const shortLabel = fallback.split(' ').slice(0, 4).join(' ');
  return {
    label: shortLabel || `Reference ${index + 1}`,
    value: spec
  };
}

function stripMarkdownInline(value = '') {
  return String(value)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

function estimateReadTime(article, renderedHtml = '') {
  const plain = stripMarkdownInline((renderedHtml || article.content || article.excerpt || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  const words = plain ? plain.split(' ').length : 0;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes} min`;
}

function renderShareBar(title, canonicalPath) {
  const fullUrl = `${SITE}${canonicalPath}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  return `<div class="share-bar" data-share-url="${fullUrl}" data-share-title="${escHtml(title)}">
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph('linkedin-brand', 'icon icon-sm')} LinkedIn</a>
      <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph('whatsapp-brand', 'icon icon-sm')} WhatsApp</a>
      <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph('x-brand', 'icon icon-sm')} X</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph('facebook-brand', 'icon icon-sm')} Facebook</a>
      <a href="mailto:?subject=${encodedTitle}&body=${encodedUrl}" class="share-chip">${glyph('mail', 'icon icon-sm')} Email</a>
      <button type="button" class="share-chip share-copy-btn" data-copy-link="${fullUrl}">${glyph('copy', 'icon icon-sm')} Copy link</button>
  </div>`;
}

// ============================================================
// CRITICAL CSS (shared across all pages)
// ============================================================
// ============================================================
// CRITICAL CSS (shared across all pages)
// ============================================================
function criticalCSS() {
  return `@font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:700;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:900;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}body{font-family:'DM Sans',sans-serif;background:#fff;color:#18181b;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.5}:root{--font-display:'Montserrat',sans-serif;--font-body:'DM Sans',sans-serif;--font-mono:'Geist Mono',ui-monospace,'Cascadia Code','Source Code Pro',monospace;--radius:10px;--radius-sm:6px;--radius-md:8px;--radius-lg:12px;--radius-xl:14px;--radius-full:9999px;--shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);--transition-fast:150ms;--transition-normal:200ms}img{display:block;max-width:100%;height:auto}button{cursor:pointer;font:inherit;border:none;background:none}a{color:inherit;text-decoration:none}ul{list-style:none}.mx-auto{margin-left:auto;margin-right:auto}.max-w{max-width:80rem}.px{padding-left:1.5rem;padding-right:1.5rem}.pt-16{padding-top:4rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-24{padding-top:6rem;padding-bottom:6rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mb-10{margin-bottom:2.5rem}.mb-12{margin-bottom:3rem}.mb-14{margin-bottom:3.5rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}.mt-10{margin-top:2.5rem}.flex{display:flex}.inline-flex{display:inline-flex}.flex-col{flex-direction:column}.items-center{align-items:center}.items-start{align-items:start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-7{gap:1.75rem}.gap-8{gap:2rem}.gap-10{gap:2.5rem}.flex-wrap{flex-wrap:wrap}.grid{display:grid}.grid-2{grid-template-columns:repeat(2,1fr)}.col-span-2{grid-column:span 2}.font-display{font-family:'Montserrat',sans-serif}.font-light{font-weight:400}.font-medium{font-weight:500}.font-bold{font-weight:700}.font-black{font-weight:900}.text-xs{font-size:.75rem;line-height:1rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.leading-relaxed{line-height:1.625}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.max-w-lg{max-width:32rem}.max-w-sm{max-width:24rem}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.text-center{text-align:center}.text-white{color:#fff}.text-zinc-300{color:#a1a1aa}.text-zinc-400{color:#a1a1aa}.text-zinc-500{color:#71717a}.text-zinc-600{color:#52525b}.text-zinc-700{color:#3f3f46}.text-zinc-900{color:#18181b}.bg-white{background:#fff}.bg-zinc-50{background:#fafafa}.bg-zinc-100{background:#f4f4f5}.border{border:1px solid #f4f4f5}.border-b{border-bottom:1px solid #f4f4f5}.border-t{border-top:1px solid #f4f4f5}.border-y{border-top:1px solid #f4f4f5;border-bottom:1px solid #f4f4f5}.border-zinc-100{border-color:#f4f4f5}.rounded-xl{border-radius:var(--radius-xl)}.rounded-lg{border-radius:var(--radius-lg)}.fixed{position:fixed}.relative{position:relative}.absolute{position:absolute}.top-0{top:0}.left-0{left:0}.right-0{right:0}.z-50{z-index:50}.z-10{z-index:10}.z-0{z-index:0}.inset-0{top:0;right:0;bottom:0;left:0}.block{display:block}.hidden{display:none}.overflow-hidden{overflow:hidden}.w-full{width:100%}.h-full{height:100%}.h-16{height:4rem}.object-cover{object-fit:cover;width:100%;height:100%}.transition-colors{transition:color .15s ease,background-color .15s ease,border-color .15s ease}.transition-opacity{transition:opacity .5s ease}.backdrop-blur{-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.bg-white-90{background:rgba(255,255,255,0.9)}.section-label{font-family:var(--font-mono);letter-spacing:.2em;font-size:.65rem;text-transform:uppercase;color:#71717a;font-weight:500}.hero-heading{font-family:'Montserrat',sans-serif;font-weight:900;line-height:.85;letter-spacing:-.025em;color:#18181b;font-size:clamp(3.8rem,11vw,7.5rem)}.page-heading{font-family:'Montserrat',sans-serif;font-weight:900;line-height:.85;letter-spacing:-.025em;font-size:clamp(3.5rem,10vw,8rem)}.link-line{position:relative;display:inline-block}.link-line::after{content:'';position:absolute;bottom:-1px;left:0;width:0;height:1px;background:currentColor;transition:width .3s ease}.link-line:hover::after{width:100%}.nav-link{position:relative;padding-bottom:2px}.nav-link:hover{color:#18181b}.nav-link.is-active{color:#18181b;font-weight:600}.nav-link.is-active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:1.5px;background:#18181b;border-radius:1px}.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;background:#18181b;color:#fff;font-size:.875rem;font-weight:500;padding:.625rem 1.25rem;transition:background-color var(--transition-fast) ease,transform var(--transition-fast) ease;border-radius:var(--radius-md)}.btn-primary:hover{background:#3f3f46}.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;border:1px solid #e4e4e7;font-size:.875rem;font-weight:500;padding:.625rem 1.25rem;transition:all .2s ease;border-radius:var(--radius-md)}.btn-outline:hover{border-color:#18181b;background:#18181b;color:#fff}.btn-lg{padding:.875rem 2rem}.icon{width:20px;height:20px;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none;flex-shrink:0}.icon-sm{width:16px;height:16px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.sr-only:focus{position:fixed;top:.5rem;left:.5rem;z-index:200;width:auto;height:auto;clip:auto;padding:.75rem 1.25rem;background:#18181b;color:#fff;font-size:.875rem;font-weight:600;border-radius:var(--radius-md)}:focus-visible{outline:2px solid #18181b;outline-offset:2px;border-radius:2px}nav.scrolled{box-shadow:0 1px 12px rgba(0,0,0,0.06);border-bottom-color:transparent}.whatsapp-fab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:100;width:56px;height:56px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.4);transition:transform .2s ease,box-shadow .2s ease;animation:fabPulse 3s ease-in-out infinite}.whatsapp-fab svg{width:28px;height:28px;fill:#fff}@keyframes fabPulse{0%,100%{box-shadow:0 4px 16px rgba(37,211,102,0.4)}50%{box-shadow:0 4px 24px rgba(37,211,102,0.6)}}@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.fade-up{opacity:1}.js .fade-up{opacity:0}.js .fade-up.is-visible{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) forwards}@media(prefers-reduced-motion:reduce){.js .fade-up{opacity:1}.js .fade-up.is-visible{animation:none}}#mob-menu{transition:max-height .35s cubic-bezier(.22,1,.36,1),opacity .3s ease,padding .3s ease;max-height:0;overflow:hidden;opacity:0;padding-top:0;padding-bottom:0}#mob-menu.open{max-height:420px;opacity:1;padding-top:1.25rem;padding-bottom:1.25rem}body.scroll-locked{overflow:hidden}.breadcrumb{display:flex;align-items:center;gap:.5rem;font-size:.75rem;margin-bottom:2rem;color:#71717a}.breadcrumb a{color:#71717a;transition:color .15s}.breadcrumb a:hover{color:#18181b}.breadcrumb-sep{color:#d4d4d8}@media(max-width:768px){.md-hidden{display:none!important}.md-show{display:flex!important}.md-grid-2,.md-grid-3,.md-grid-4{grid-template-columns:1fr}.col-span-2{grid-column:span 1}.hero-heading{font-size:clamp(2.6rem,10vw,4.5rem)}.page-heading{font-size:clamp(2.8rem,11vw,4.5rem)}.py-24{padding-top:3rem;padding-bottom:3rem}.whatsapp-fab{width:48px;height:48px;bottom:1rem;right:1rem}.whatsapp-fab svg{width:24px;height:24px}}@media(min-width:769px){.md-hidden{display:flex}.md-show{display:none!important}.md-grid-2{grid-template-columns:repeat(2,1fr)}.md-grid-3{grid-template-columns:repeat(3,1fr)}.md-grid-4{grid-template-columns:repeat(4,1fr)}.md-flex-row{flex-direction:row}.md-text-left{text-align:left}}`;
}

function pageEnhancementCSS() {
  return `
  .site-nav-links{display:flex;align-items:center;gap:1rem;margin-left:1rem}
  .site-nav-link{font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#71717a}
  .site-nav-link:hover,.site-nav-link.is-active{color:#18181b}
  .verified-chip-row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.25rem}
  .verified-chip{display:inline-flex;align-items:center;padding:.42rem .72rem;border-radius:9999px;border:1px solid #e4e4e7;background:#fff;font-size:.72rem;color:#3f3f46}
  .verified-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
  .verified-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1.35rem}
  .verified-label{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.65rem}
  .verified-value{font-family:'Montserrat',sans-serif;font-weight:900;font-size:clamp(1.6rem,4vw,2.4rem);line-height:1;color:#18181b;margin-bottom:.45rem}
  .verified-note{font-size:.82rem;line-height:1.6;color:#52525b}
  .flow-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
  .flow-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1.35rem}
  .flow-step{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#71717a;margin-bottom:.85rem}
  .source-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
  .source-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1.25rem}
  .source-title{font-family:'Montserrat',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:.04em;color:#18181b;margin-bottom:.45rem}
  .source-detail{font-size:.82rem;line-height:1.6;color:#52525b}
  .site-header{box-shadow:0 1px 0 rgba(0,0,0,.03)}
  .site-search-trigger-compact{max-width:32rem;margin-left:auto;padding:.55rem .8rem;border-radius:9999px;background:#fafafa;border:1px solid #e4e4e7;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}
  .site-search-trigger-compact:hover{border-color:#18181b;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,.06)}
  .site-search-trigger-label{font-size:.82rem;font-weight:600;color:#18181b}.site-search-trigger-meta{font-size:.68rem;color:#71717a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .site-search-trigger-shortcut kbd{border:1px solid #e4e4e7;border-radius:9999px;padding:.2rem .45rem;background:#fff;color:#71717a;font-size:.66rem}
  .home-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:center}.page-heading-home{font-size:clamp(3rem,8vw,5.4rem);line-height:.94}.home-hero-copy{max-width:34rem;font-size:1rem;line-height:1.85;color:#52525b}
  .hero-network-card{border:1px solid #f4f4f5;border-radius:28px;overflow:hidden;background:#fff;min-height:30rem;box-shadow:0 20px 50px rgba(0,0,0,.04)}.hero-network-svg{width:100%;height:100%}.hero-world-grid path{stroke:#ececf0;stroke-width:1}.hero-world-continents path{fill:#f7f7f8;stroke:#e4e4e7;stroke-width:1.2}.hero-world-route{fill:none;stroke-linecap:round;stroke-dasharray:8 14;animation:routeFlow 11s linear infinite}.hero-world-route-primary{stroke:url(#routeFade);stroke-width:3}.hero-world-route-soft{stroke:url(#routeSoft);stroke-width:2.2;animation-duration:13s}.hero-world-node{fill:#fff;stroke:#18181b;stroke-width:2}.hero-world-node-primary{fill:#18181b}.hero-world-node-source{fill:#fff;stroke:#3f3f46;stroke-width:2}.hero-label-group text,.hero-world-region-label,.hero-world-small{font-family:'DM Sans',sans-serif}.hero-node-label{font-size:17px;font-weight:700;fill:#18181b;text-anchor:middle}.hero-node-label-primary{fill:#18181b}.hero-node-meta{font-size:10px;fill:#71717a;text-anchor:middle;letter-spacing:.12em;text-transform:uppercase}.hero-world-region-label{font-size:12px;font-weight:600;fill:#52525b}.hero-world-small{font-size:11px;fill:#71717a}.hero-world-small-strong{fill:#18181b;font-weight:600}.ui-world-map-legend{display:flex;flex-wrap:wrap;gap:.75rem}.ui-world-map-legend-item{display:inline-flex;flex-direction:column;gap:.2rem;padding:.75rem .9rem;border:1px solid #e4e4e7;border-radius:18px;background:#fff;min-width:10rem}.ui-world-map-legend-item strong{font-size:.82rem;color:#18181b}.ui-world-map-legend-item span{font-size:.72rem;color:#71717a;line-height:1.5}.ui-world-map-legend-item.is-primary{border-color:#18181b;box-shadow:0 14px 32px rgba(0,0,0,.05)}.ui-world-map-note{font-size:.78rem;line-height:1.7;color:#71717a;max-width:34rem}
  .home-family-bento-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}.home-family-bento{display:flex;flex-direction:column;border:1px solid #f4f4f5;border-radius:22px;overflow:hidden;background:#fff}.home-family-bento-large{grid-column:span 1}.home-family-media{position:relative;height:16rem}.home-family-media img{width:100%;height:100%;object-fit:cover}.home-family-media-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(255,255,255,.92),rgba(255,255,255,.15))}.home-family-media-label{position:absolute;left:1rem;bottom:1rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#18181b;background:rgba(255,255,255,.92);padding:.35rem .6rem;border-radius:9999px;border:1px solid #e4e4e7}.home-family-content{padding:1.25rem 1.25rem 1.4rem}.home-family-facts{display:flex;flex-wrap:wrap;gap:.5rem}.home-family-facts span{padding:.38rem .65rem;border:1px solid #e4e4e7;border-radius:9999px;font-size:.73rem;color:#3f3f46}
  .signal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.signal-card,.portal-status-card,.resource-access-note,.product-story-card,.product-summary-card,.spec-table-card,.milestone-card,.insight-side-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff}.signal-card{padding:1.35rem}.signal-card-soft{background:#fafafa}.signal-title{font-family:'Montserrat',sans-serif;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:#18181b;margin-bottom:.9rem}
  .portfolio-link-row{display:flex;flex-wrap:wrap;gap:.5rem}.portfolio-link-chip{display:inline-flex;align-items:center;padding:.42rem .72rem;border-radius:9999px;border:1px solid #e4e4e7;font-size:.74rem;color:#3f3f46;transition:border-color .2s ease,background .2s ease}.portfolio-link-chip:hover{border-color:#18181b;background:#fafafa}
  .product-sheet-grid,.application-hero-grid,.insight-layout,.site-footer-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:1.5rem;align-items:start}.product-sheet-image{height:min(26rem,52vw)}.product-sheet-image,.application-hero-media{border-radius:20px;overflow:hidden;background:#f4f4f5}.product-summary-card-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}.product-summary-card,.product-story-card,.spec-table-card,.insight-side-card{padding:1.15rem}.product-summary-label,.insight-side-label{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.65rem}.product-summary-list{display:flex;flex-direction:column;gap:.45rem;padding-left:1rem}.product-summary-list li{font-size:.86rem;line-height:1.6;color:#52525b}
  .application-mosaic{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.application-mosaic-tile{position:relative;border-radius:18px;overflow:hidden;background:#f4f4f5;min-height:12rem}.application-mosaic-tile img{width:100%;height:100%;object-fit:cover}.application-mosaic-tile span{position:absolute;left:.75rem;bottom:.75rem;padding:.35rem .55rem;background:rgba(255,255,255,.92);border:1px solid #e4e4e7;border-radius:9999px;font-size:.68rem;color:#18181b}
  .resource-access-note{padding:1rem 1.25rem}.resource-access-note-title,.share-chip{font-family:'Montserrat',sans-serif}.resource-access-note-grid{display:flex;flex-wrap:wrap;gap:.6rem}.resource-access-note-grid span{padding:.38rem .62rem;border:1px solid #e4e4e7;border-radius:9999px;font-size:.72rem;color:#52525b}
  .contact-card-grid{display:grid;grid-template-columns:1fr;gap:1rem}.contact-social-row{display:flex;flex-wrap:wrap;gap:.75rem}.contact-social-chip{display:inline-flex;align-items:center;padding:.5rem .8rem;border-radius:9999px;border:1px solid #e4e4e7;color:#18181b;font-size:.78rem;background:#fff}.contact-social-chip:hover{border-color:#18181b;background:#fafafa}.contact-sla-pill{display:inline-flex;align-items:center;padding:.55rem .85rem;border-radius:9999px;background:#edfdf2;border:1px solid #bbf7d0;color:#166534;font-size:.78rem;font-weight:600}
  .site-footer-grid{grid-template-columns:1fr .9fr .8fr;margin-bottom:2.5rem}.site-footer-search-note{font-size:.72rem;line-height:1.7;color:#71717a;max-width:24rem}.site-footer-address{margin-top:1rem;padding-left:1rem;border-left:3px solid #3f3f46}.site-inline-link{display:inline-flex;align-items:center;gap:.4rem;font-size:.84rem;color:#18181b}.site-inline-link:hover{color:#3f3f46}
  .portal-status-card{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.2rem 1.3rem;background:#fff}.portal-status-copy{max-width:32rem}
  .insights-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.insight-card{display:flex;flex-direction:column;border:1px solid #f4f4f5;border-radius:20px;padding:1.2rem;background:#fff;transition:border-color .2s ease,box-shadow .2s ease}.insight-card:hover{border-color:#18181b;box-shadow:0 16px 36px rgba(0,0,0,.06)}.insight-card-type{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.7rem}.insight-card-title{font-family:'Montserrat',sans-serif;font-weight:700;font-size:1rem;line-height:1.4;margin-bottom:.75rem}.insight-card-excerpt{font-size:.84rem;line-height:1.65;color:#52525b;flex:1}.insight-card-meta{display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem;font-size:.72rem;color:#71717a}.insight-layout{align-items:start}.insight-side-panel{position:sticky;top:5.5rem}.insight-side-value{font-size:.92rem;line-height:1.5;color:#18181b}.share-bar{display:flex;flex-wrap:wrap;gap:.6rem;padding:0 0 1.2rem;margin-bottom:1.2rem;border-bottom:1px solid #f4f4f5}.share-chip{display:inline-flex;align-items:center;justify-content:center;padding:.45rem .75rem;border:1px solid #e4e4e7;border-radius:9999px;background:#fff;font-size:.72rem;color:#3f3f46;transition:border-color .2s ease,background .2s ease}.share-chip:hover{border-color:#18181b;background:#fafafa}
  .cmd-palette{width:min(42rem,calc(100vw - 1.5rem));border-radius:22px;border:1px solid #e4e4e7;overflow:hidden;background:#fff;box-shadow:0 30px 80px rgba(0,0,0,.2)}.cmd-palette-input-wrap{display:flex;align-items:center;gap:.75rem;padding:1rem 1.15rem;border-bottom:1px solid #f4f4f5}.cmd-palette-input{width:100%;border:none;outline:none;font-size:1rem;background:transparent}.cmd-palette-results{max-height:28rem;overflow:auto;padding:.5rem}.cmd-palette-item{display:flex;align-items:center;gap:.85rem;padding:.75rem .85rem;border-radius:14px;color:#18181b}.cmd-palette-item.is-active,.cmd-palette-item:hover{background:#fafafa}.cmd-palette-item svg{width:1rem;height:1rem;color:#71717a;flex-shrink:0}.cmd-palette-item-copy{display:flex;flex-direction:column;min-width:0}.cmd-palette-item-meta{font-size:.72rem;color:#71717a;margin-top:.12rem}.cmd-palette-empty{padding:1.5rem;color:#71717a;font-size:.84rem}.cmd-palette-footer{padding:.8rem 1.15rem;border-top:1px solid #f4f4f5;background:#fafafa}
  .resource-gate-dialog{width:min(52rem,100%);display:grid;grid-template-columns:.95fr 1.05fr;gap:1rem;padding:1rem;border-radius:24px;background:#fff;position:relative}.resource-gate-copy,.resource-gate-form{border:1px solid #f4f4f5;border-radius:18px;padding:1.1rem}.resource-gate-copy{background:#fafafa}.resource-gate-list{display:flex;flex-direction:column;gap:.7rem}.resource-gate-list div{position:relative;padding-left:1rem;font-size:.86rem;line-height:1.6;color:#52525b}.resource-gate-list div:before{content:'';position:absolute;left:0;top:.55rem;width:.35rem;height:.35rem;border-radius:9999px;background:#18181b}.resource-gate-close{position:absolute;top:1rem;right:1rem;width:2.1rem;height:2.1rem;border:1px solid #e4e4e7;border-radius:9999px;display:flex;align-items:center;justify-content:center}.resource-gate-close svg{width:1rem;height:1rem;fill:none;stroke:currentColor;stroke-width:2}.resource-gate-overlay{position:fixed;inset:0;background:rgba(24,24,27,.46);display:none;align-items:center;justify-content:center;z-index:120;padding:1rem}.resource-gate-overlay.is-open{display:flex}
  .hero-network-card{border:1px solid #f4f4f5;border-radius:30px;overflow:hidden;background:#fff;min-height:34rem;box-shadow:0 28px 60px rgba(0,0,0,.05)}.hero-network-svg{width:100%;height:100%}.hero-world-grid path{stroke:#ececf0;stroke-width:1}.hero-world-continents path{fill:#f8f8f9;stroke:#e4e4e7;stroke-width:1.25}.hero-india-shape{fill:#e4e4e7;stroke:#a1a1aa;stroke-width:1.2}.hero-world-route{fill:none;stroke-linecap:round;stroke-dasharray:10 13;animation:routeFlow 9.5s linear infinite}.hero-world-route-primary{stroke:url(#routeFade);stroke-width:4.4}.hero-world-route-soft{stroke:url(#routeSoft);stroke-width:3.1;animation-duration:12s}.hero-world-route-glow-line{stroke:rgba(24,24,27,.14);stroke-width:10;filter:url(#routeGlow)}.hero-world-node{fill:#fff;stroke:#18181b;stroke-width:2.2}.hero-world-node-primary{fill:#18181b}.hero-world-node-source{fill:#fff;stroke:#18181b;stroke-width:2.2}.hero-world-pulse{fill:none;stroke:#18181b;stroke-width:1.2;opacity:.18;animation:mapPulse 2.8s ease-in-out infinite}.hero-node-pointer{stroke:#a1a1aa;stroke-width:1.4;fill:none;stroke-linecap:round}.hero-label-group text,.hero-world-region-label,.hero-world-small{font-family:'DM Sans',sans-serif}.hero-node-label{font-size:18px;font-weight:700;fill:#18181b;text-anchor:middle}.hero-node-label-primary{fill:#18181b}.hero-node-meta{font-size:10px;fill:#71717a;text-anchor:middle;letter-spacing:.12em;text-transform:uppercase}.hero-world-region-label{font-size:12px;font-weight:700;fill:#52525b}.hero-world-small{font-size:11px;fill:#71717a}.hero-world-small-strong{fill:#18181b;font-weight:700}.hero-route-dot{fill:#18181b;opacity:.18;animation:routeDotPulse 4.8s ease-in-out infinite}.hero-route-dot-soft{fill:#52525b}.ui-world-stage{display:grid;grid-template-columns:1.08fr .92fr;gap:1.5rem;align-items:start}.ui-world-stage-map{display:flex;flex-direction:column;gap:1rem}.ui-world-stage-copy{display:flex;flex-direction:column;gap:1rem}.ui-map-caption{padding:1rem 1.1rem;border:1px solid #e4e4e7;border-radius:20px;background:#fff;font-size:.9rem;line-height:1.7;color:#3f3f46}.ui-world-lane-grid{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.ui-world-lane-card{padding:1rem 1.05rem;border:1px solid #e4e4e7;border-radius:20px;background:#fff}.ui-world-lane-label{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.5rem}.ui-world-lane-card strong{display:block;font-size:1rem;color:#18181b;margin-bottom:.3rem}.ui-world-lane-card p{font-size:.82rem;line-height:1.6;color:#52525b}.ui-world-map-legend{display:flex;flex-wrap:wrap;gap:.75rem}.ui-world-map-legend-item{display:inline-flex;flex-direction:column;gap:.2rem;padding:.75rem .9rem;border:1px solid #e4e4e7;border-radius:18px;background:#fff;min-width:10rem}.ui-world-map-legend-item strong{font-size:.82rem;color:#18181b}.ui-world-map-legend-item span{font-size:.72rem;color:#71717a;line-height:1.5}.ui-world-map-legend-item.is-primary{border-color:#18181b;box-shadow:0 14px 32px rgba(0,0,0,.05)}.ui-world-map-note{font-size:.8rem;line-height:1.75;color:#71717a;max-width:34rem}.ui-article-row{display:grid;grid-template-columns:5.5rem 1fr auto;gap:.85rem;align-items:center;padding:.7rem 0;border-bottom:1px solid #f4f4f5}.ui-article-row:last-child{border-bottom:none;padding-bottom:0}.ui-article-row-media{width:5.5rem;height:4rem;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;background:#fafafa}.ui-article-row-media img{width:100%;height:100%;object-fit:cover}.ui-article-row-copy{min-width:0}.ui-insight-card-media{position:relative;height:12.5rem;border-radius:18px;overflow:hidden;border:1px solid #f4f4f5;background:#fafafa;margin-bottom:1rem}.ui-insight-card-media img{width:100%;height:100%;object-fit:cover}.ui-insight-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}.ui-insight-feature{grid-column:span 2;display:grid;grid-template-columns:1.05fr .95fr;overflow:hidden;padding:0}.ui-insight-feature .ui-insight-card-media{height:100%;min-height:18rem;margin:0;border:none;border-right:1px solid #f4f4f5;border-radius:0}.ui-insight-card-body{display:flex;flex-direction:column;padding:1.25rem}.ui-topic-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.ui-topic-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1.15rem}.ui-topic-card-head{display:flex;align-items:start;justify-content:space-between;gap:1rem}.ui-topic-copy{font-size:.84rem;line-height:1.7;color:#52525b}.ui-route-directory-stack{display:grid;gap:.9rem}.ui-route-directory{border:1px solid #f4f4f5;border-radius:24px;background:#fff;overflow:hidden}.ui-route-directory[open]{box-shadow:0 18px 38px rgba(0,0,0,.04)}.ui-route-directory summary{list-style:none;cursor:pointer;padding:1.2rem 1.25rem}.ui-route-directory summary::-webkit-details-marker{display:none}.ui-route-directory-summary{display:grid;grid-template-columns:1fr auto;gap:1rem;align-items:start}.ui-route-directory-count{display:inline-flex;align-items:center;justify-content:center;min-width:2rem;height:2rem;border-radius:9999px;background:#18181b;color:#fff;font-size:.78rem;font-weight:700}.ui-route-directory-intro{font-size:.84rem;line-height:1.7;color:#52525b;margin-top:.4rem;max-width:42rem}.ui-route-directory-body{padding:0 1.25rem 1.25rem;display:grid;gap:.8rem}.ui-route-product-row{display:grid;grid-template-columns:1fr auto;gap:1rem;padding:1rem;border:1px solid #f4f4f5;border-radius:18px;background:#fafafa}.ui-route-product-copy h3{font-family:'Montserrat',sans-serif;font-size:1rem;font-weight:700;color:#18181b;margin-bottom:.35rem}.ui-route-product-copy p{font-size:.84rem;line-height:1.7;color:#52525b}.ui-route-product-meta{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.7rem}.ui-route-product-meta span{padding:.35rem .55rem;border-radius:9999px;border:1px solid #e4e4e7;background:#fff;font-size:.72rem;color:#52525b}.ui-route-product-actions{display:flex;gap:.65rem;flex-wrap:wrap;align-items:center;justify-content:flex-end}.article-cover-card{position:relative;height:min(28rem,54vw);border:1px solid #f4f4f5;border-radius:28px;overflow:hidden;background:#fafafa;box-shadow:0 24px 48px rgba(0,0,0,.04)}.article-cover-card img{width:100%;height:100%;object-fit:cover}.article-cover-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.02),rgba(255,255,255,.58))}.article-cover-badge{position:absolute;left:1.1rem;bottom:1.1rem;padding:.5rem .75rem;border-radius:9999px;background:rgba(255,255,255,.92);border:1px solid #e4e4e7;font-size:.75rem;font-weight:700;color:#18181b}.article-dashboard-section{padding:2rem 0 0}.article-dashboard-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.article-dashboard-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1.05rem}.article-dashboard-label{font-family:'Montserrat',sans-serif;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.55rem}.article-dashboard-value{font-family:'Montserrat',sans-serif;font-size:1.15rem;font-weight:700;line-height:1.35;color:#18181b;margin-bottom:.35rem}.article-dashboard-note{font-size:.8rem;line-height:1.6;color:#52525b}.article-visual-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:1rem;padding:2rem 0 0}.article-visual-card{border:1px solid #f4f4f5;border-radius:24px;background:#fff;padding:1.25rem}.article-visual-label{font-family:'Montserrat',sans-serif;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.55rem}.article-visual-title{font-family:'Montserrat',sans-serif;font-size:1.2rem;font-weight:700;color:#18181b;margin-bottom:.45rem}.article-visual-copy{font-size:.84rem;line-height:1.7;color:#52525b;margin-bottom:1rem}.article-chart-svg{width:100%;height:auto}.article-chart-svg .chart-label{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;fill:#18181b}.article-chart-svg .chart-value{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;fill:#18181b}.article-chart-notes{display:grid;gap:.7rem;margin-top:1rem}.article-chart-note{font-size:.82rem;line-height:1.7;color:#52525b}.article-table-wrap{overflow:auto}.article-table-wrap table{min-width:100%;border-collapse:collapse}.article-table-wrap th,.article-table-wrap td{padding:.8rem .85rem;border-bottom:1px solid #f4f4f5;text-align:left;vertical-align:top}.article-table-wrap th{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a}.article-table-wrap td{font-size:.84rem;line-height:1.65;color:#3f3f46}.article-flow-section,.article-reference-section{padding:2rem 0 0}.article-section-head h2{font-family:'Montserrat',sans-serif;font-size:1.6rem;line-height:1.1;color:#18181b}.article-flow-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:1rem}.article-flow-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1rem}.article-flow-step{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.55rem}.article-flow-card p{font-size:.84rem;line-height:1.7;color:#52525b}.article-reference-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1rem}.article-reference-card{border:1px solid #f4f4f5;border-radius:20px;background:#fff;padding:1rem}.article-reference-source{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.55rem}.article-reference-card h3{font-family:'Montserrat',sans-serif;font-size:1rem;font-weight:700;color:#18181b;line-height:1.35;margin-bottom:.45rem}.article-reference-card p{font-size:.82rem;line-height:1.7;color:#52525b;margin-bottom:.85rem}.process-flow-card{border:1px solid #f4f4f5;border-radius:24px;background:#fff;padding:1.1rem}.process-flow-svg{width:100%;height:auto;display:block}.process-flow-label{font-family:'Montserrat',sans-serif;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#71717a;margin-bottom:.65rem}.process-flow-note{font-size:.84rem;line-height:1.7;color:#52525b;margin-top:.8rem}@keyframes routeFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-180}}@keyframes routeDotPulse{0%,100%{opacity:.12;transform:scale(.9)}50%{opacity:.95;transform:scale(1.2)}}@keyframes mapPulse{0%,100%{opacity:.12;transform:scale(.94)}50%{opacity:.34;transform:scale(1.06)}}
  @media (max-width:1024px){.home-hero-grid,.product-sheet-grid,.application-hero-grid,.insight-layout,.site-footer-grid,.signal-grid,.insights-grid,.resource-gate-dialog,.verified-grid,.flow-grid,.source-grid,.ui-world-stage,.ui-topic-grid,.article-dashboard-grid,.article-visual-grid,.article-flow-grid,.article-reference-grid{grid-template-columns:1fr}.home-family-bento-grid{grid-template-columns:1fr}.product-summary-card-grid,.application-mosaic,.ui-world-lane-grid{grid-template-columns:1fr 1fr}.insight-side-panel{position:static}.ui-insight-feature{grid-template-columns:1fr}.ui-insight-feature .ui-insight-card-media{min-height:15rem;border-right:none;border-bottom:1px solid #f4f4f5}}
  @media (max-width:768px){.site-search-trigger-compact{max-width:none}.site-search-trigger-meta,.site-search-trigger-shortcut{display:none}.product-summary-card-grid,.application-mosaic,.insights-grid,.ui-insight-grid,.ui-topic-grid,.article-dashboard-grid,.article-flow-grid,.article-reference-grid,.ui-world-lane-grid{grid-template-columns:1fr}.hero-network-card{min-height:26rem}.hero-node-label{font-size:14px}.hero-node-meta,.hero-world-small{font-size:9px}.hero-world-region-label,.hero-map-caption-group{display:none}.ui-world-map-legend-item{min-width:calc(50% - .375rem)}.home-family-media{height:13rem}.product-sheet-image{height:15rem}.portal-status-card{flex-direction:column;align-items:flex-start}.resource-gate-dialog,.article-visual-grid{grid-template-columns:1fr;padding:.75rem}.ui-article-row{grid-template-columns:4.5rem 1fr auto}.ui-article-row-media{width:4.5rem;height:3.4rem}.article-cover-card{height:16rem}.ui-route-product-row{grid-template-columns:1fr}.ui-route-product-actions{justify-content:flex-start}.ui-world-stage-copy{gap:.85rem}}
  `;
}

// ============================================================
// HTML PARTIALS
// ============================================================
function favicons() {
  return `<link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48-v2.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">`;
}

function fontPreloads() {
  return `<link rel="preload" href="/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/dm-sans-latin.woff2" as="font" type="font/woff2" crossorigin>`;
}

function socialImageMetaPath(image = '') {
  if (!image) return image;
  if (/\.(png|jpg|jpeg|svg)$/i.test(image)) return image;
  if (/\.webp$/i.test(image)) {
    const jpgPath = path.join(WORK, image.replace(/^\//, '').replace(/\.webp$/i, '.jpg'));
    const pngPath = path.join(WORK, image.replace(/^\//, '').replace(/\.webp$/i, '.png'));
    if (fs.existsSync(jpgPath)) return image.replace(/\.webp$/i, '.jpg');
    if (fs.existsSync(pngPath)) return image.replace(/\.webp$/i, '.png');
  }
  return image;
}

function socialImageVersionedUrl(image = '') {
  if (!image) return image;
  return `${image}${String(image).includes('?') ? '&' : '?'}v=${VER}`;
}

function socialImageMimeType(image = '') {
  const clean = String(image || '').split('?')[0].toLowerCase();
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.svg')) return 'image/svg+xml';
  return 'image/png';
}

function headTag({ title, desc, canonical, ogType = 'website', ogImage = '/images/social/moldart-default.png', ogImageAlt = 'Moldart brand overview', noindex = false, schemas = [], prefetch = [] }) {
  const robotsMeta = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const schemaScripts = schemas.map(s => `<script type="application/ld+json">\n    ${JSON.stringify(s)}\n    </script>`).join('\n    ');
  const prefetchLinks = [...new Set(['/data/search-index.json', ...prefetch])].map(p => `<link rel="prefetch" href="${p}">`).join('\n    ');
  const socialImage = socialImageMetaPath(ogImage);
  const socialImageUrl = /^https?:/i.test(socialImage) ? socialImageVersionedUrl(socialImage) : `${SITE}${socialImageVersionedUrl(socialImage)}`;
  const socialImageType = socialImageMimeType(socialImage);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(title)}</title>
    <meta name="description" content="${escHtml(desc)}">
    <meta name="robots" content="${robotsMeta}">
    <meta property="og:title" content="${escHtml(title)}">
    <meta property="og:description" content="${escHtml(desc)}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${SITE}${canonical}">
    <meta property="og:locale" content="en_IN">
    <meta property="og:site_name" content="Moldart">
    <meta property="og:image" content="${socialImageUrl}">
    <meta property="og:image:url" content="${socialImageUrl}">
    <meta property="og:image:secure_url" content="${socialImageUrl}">
    <meta property="og:image:type" content="${socialImageType}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escHtml(ogImageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escHtml(title)}">
    <meta name="twitter:description" content="${escHtml(desc)}">
    <meta name="twitter:image" content="${socialImageUrl}">
    <meta name="twitter:image:alt" content="${escHtml(ogImageAlt)}">
    <meta name="theme-color" content="#18181b">
    <script>document.documentElement.classList.add('js');</script>
    <link rel="canonical" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="en-IN" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="x-default" href="${SITE}${canonical}">
    <link rel="image_src" href="${socialImageUrl}">
    ${favicons()}
    <link rel="dns-prefetch" href="https://wa.me">
    <link rel="preconnect" href="https://moldartindia.com">
    <link rel="dns-prefetch" href="https://formsubmit.co">
    ${fontPreloads()}
    <style>${criticalCSS()}</style>
    <style>${pageEnhancementCSS()}</style>
    <link rel="stylesheet" href="/styles.css?v=${VER}">
    <link rel="stylesheet" href="/pages.css?v=${VER}">
    <link rel="stylesheet" href="/site-overrides.css?v=${VER}">
    ${prefetchLinks}
    ${schemaScripts}
</head>`;
}

function nav(route) {
  return `<body data-route="${route}">
    <a href="#main-content" class="sr-only">Skip to content</a>
    <nav aria-label="Site header" class="site-header fixed top-0 left-0 right-0 z-50 bg-white-90 backdrop-blur border-b border-zinc-100">
        <div class="max-w mx-auto px h-16 flex items-center gap-4">
            <a href="/" class="site-brand flex items-center gap-3" aria-label="Moldart home">
                <div>
                    <div class="font-display font-black text-base" style="letter-spacing:0.14em;line-height:1;">MOLDART</div>
                    <div class="text-xs text-zinc-500 md-hidden" style="margin-top:.18rem;">Since 1989 · Mumbai</div>
                </div>
            </a>
            <button type="button" class="site-search-trigger site-search-trigger-compact" data-open-command-palette aria-label="Search the website">
                ${glyph('search', 'icon site-search-trigger-icon')}
                <span class="site-search-trigger-copy">
                    <span class="site-search-trigger-label">Search</span>
                    <span class="site-search-trigger-meta">${NAV_SEARCH_META}</span>
                </span>
                <span class="site-search-trigger-shortcut cmd-k-hint"><kbd>Ctrl/⌘ K</kbd></span>
            </button>
        </div>
    </nav>`;
}


function footer() {
    return `<footer class="ui-footer">
        <div class="max-w mx-auto px py-16">
            <div class="ui-footer-grid">
                <div class="ui-footer-card">
                    <div class="font-display font-black text-xl tracking-wider mb-4">MOLDART</div>
                    <p class="text-sm text-zinc-400 leading-relaxed font-light mb-5">${BRAND_LINE}</p>
                    <div class="ui-footer-meta">
                        <span class="ui-footer-pill">${glyph('clock', 'icon icon-sm')} Since 1989</span>
                        <span class="ui-footer-pill">${glyph('building', 'icon icon-sm')} Mumbai</span>
                        <span class="ui-footer-pill">${glyph('route', 'icon icon-sm')} India + China</span>
                    </div>
                </div>
                <div class="ui-footer-card">
                    <div class="section-label text-zinc-600 mb-5">Navigate</div>
                    <div class="ui-footer-nav">
                        <a href="/" class="ui-footer-link">Home</a>
                        <a href="/explore/" class="ui-footer-link">Explore</a>
                        <a href="/solutions/" class="ui-footer-link">Solutions</a>
                        <a href="/resources/" class="ui-footer-link">Resources</a>
                        <a href="/insights/" class="ui-footer-link">Insights</a>
                        <a href="/faq/" class="ui-footer-link">FAQ</a>
                        <a href="/process/" class="ui-footer-link">Process</a>
                        <a href="/about/" class="ui-footer-link">About</a>
                        <a href="/contact/" class="ui-footer-link">Contact</a>
                    </div>
                </div>
                <div class="ui-footer-card">
                    <div class="section-label text-zinc-600 mb-5">Talk to Moldart</div>
                    <div class="flex flex-col gap-3">
                        <a href="mailto:info@moldartindia.com" class="ui-footer-link">${glyph('mail', 'icon icon-sm')} info@moldartindia.com</a>
                        <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph('whatsapp-brand', 'icon icon-sm')} ${WHATSAPP_PRIMARY.display}</a>
                        <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph('whatsapp-brand', 'icon icon-sm')} ${WHATSAPP_SECONDARY.display}</a>
                        <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph('linkedin-brand', 'icon icon-sm')} Company LinkedIn</a>
                        <a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph('linkedin-brand', 'icon icon-sm')} Yash Doshi</a>
                        <a href="/contact/" class="ui-footer-link">${glyph('message', 'icon icon-sm')} Share your requirement</a>
                    </div>
                    <p class="text-xs text-zinc-500 leading-relaxed mt-5">Use Contact for enquiry forms, WhatsApp, meetings, and address details.</p>
                </div>
            </div>
            <div class="ui-footer-bottom mt-8">© <span class="yr">2026</span> Moldart · Mumbai, India</div>
        </div>
    </footer>`;
}


function closingElements() {
  return `
    <a href="${whatsappHref(WHATSAPP_PRIMARY.number, `Hi Moldart, I'm interested in your products.`)}" target="_blank" rel="noopener noreferrer" class="whatsapp-fab" aria-label="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.507-4.484-1.375l-.32-.195-2.867.852.852-2.867-.21-.336A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
        </svg>
    </a>
    <button type="button" class="scroll-top-btn" aria-label="Scroll to top">
        <svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
    <div class="lightbox-overlay" aria-hidden="true">
        <button type="button" class="lightbox-close" aria-label="Close lightbox">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <img src="" alt="">
    </div>
    <div id="command-palette" class="cmd-palette-overlay" aria-modal="true" role="dialog" aria-label="Command Palette">
        <div class="cmd-palette">
            <div class="cmd-palette-input-wrap">
                <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" class="cmd-palette-input" id="cmd-input" placeholder="Search pages, products, resources, insights, FAQ, and process..." aria-autocomplete="list" autocomplete="off" spellcheck="false">
            </div>
            <div class="cmd-palette-results" id="cmd-results" role="listbox"></div>
            <div class="cmd-palette-footer">
                <div class="text-xs text-zinc-500">Use search as the primary navigation layer. Page routes appear first, then products, resources, and articles.</div>
            </div>
        </div>
    </div>
    <div id="resource-gate" class="resource-gate-overlay" aria-hidden="true">
        <div class="resource-gate-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-gate-title">
            <button type="button" class="resource-gate-close" data-resource-gate-close aria-label="Close resource form">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <div class="resource-gate-copy">
                <div class="section-label mb-4">Resource Access</div>
                <h2 id="resource-gate-title" class="font-display font-black text-3xl mb-4">ONE-TIME ACCESS.</h2>
                <p class="text-sm text-zinc-500 leading-relaxed mb-6">Share your contact details once to download Moldart catalogs, finish references, and technical documents without repeated prompts on this browser.</p>
                <div class="resource-gate-list">
                    <div>Catalogs and finish references</div>
                    <div>Technical PDFs and collection decks</div>
                    <div>Future downloads unlocked on this device</div>
                </div>
            </div>
            <form action="https://formsubmit.co/info@moldartindia.com" method="POST" class="resource-gate-form" id="resource-gate-form" target="resource-download-frame">
                <input type="hidden" name="_subject" value="Moldart Resource Download Lead">
                <input type="hidden" name="_captcha" value="false">
                <input type="hidden" name="_template" value="table">
                <input type="hidden" name="download_title" id="resource-download-title-field" value="">
                <input type="hidden" name="download_url" id="resource-download-url-field" value="">
                <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">
                <label class="form-group"><span class="form-label">Full Name *</span><input type="text" name="name" class="form-input" required placeholder="Your name"></label>
                <label class="form-group"><span class="form-label">Company *</span><input type="text" name="company" class="form-input" required placeholder="Company name"></label>
                <label class="form-group"><span class="form-label">Email Address *</span><input type="email" name="email" class="form-input" required placeholder="name@company.com"></label>
                <label class="form-group"><span class="form-label">Phone / WhatsApp *</span><input type="tel" name="phone" class="form-input" required placeholder="+91 ..."></label>
                <button type="submit" class="btn-primary btn-lg" style="width:100%;justify-content:center;">Continue to Download</button>
                <p class="text-xs text-zinc-400 text-center">Used only for document sharing and technical-commercial follow-up.</p>
            </form>
            <iframe title="Resource lead capture" name="resource-download-frame" style="display:none;"></iframe>
        </div>
    </div>

    <script src="/main.js?v=${VER}" defer></script>
</body>
</html>`;
}

function breadcrumb(items) {
  const schemaItems = items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    ...(item.url ? { item: SITE + item.url } : {})
  }));
  const htmlParts = items.map((item, i) => {
    if (i === items.length - 1) return `<span aria-current="page">${escHtml(item.name)}</span>`;
    return `<a href="${item.url}">${escHtml(item.name)}</a><span class="breadcrumb-sep">/</span>`;
  });
  return {
    html: `<nav class="breadcrumb" aria-label="Breadcrumb">${htmlParts.join('')}</nav>`,
    schema: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: schemaItems }
  };
}

function downloadLink(dl) {
  if (isRequestOnlyResource(dl)) {
    const href = requestDocumentHref(dl);
    return `<a href="${href}" class="flex items-center justify-between p-3 rounded-lg transition-colors group resource-download-link resource-download-link-request" style="border:1px solid #f4f4f5;">
      <div class="flex items-center gap-3">
          <svg class="icon text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          <span>
              <span class="text-sm font-medium text-zinc-700 block">${escHtml(dl.title)}</span>
              <span class="text-xs text-zinc-500 block">${escHtml(dl.note || 'Shared on request')}</span>
          </span>
      </div>
      <span class="resource-download-badge">Request</span>
  </a>`;
  }
  const href = resourceHref(dl);
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(dl.title)}" class="flex items-center justify-between p-3 rounded-lg transition-colors group resource-download-link" style="border:1px solid #f4f4f5;">
    <div class="flex items-center gap-3">
        <svg class="icon text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        <span class="text-sm font-medium text-zinc-700">${escHtml(dl.title)}</span>
    </div>
    <svg class="icon icon-sm text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
</a>`;
}

function productTextLink(productId) {
  const product = getProduct(productId);
  const meta = getMeta(productId);
  if (!product || !meta) return '';
  return `<a href="/products/${meta.slug}/" class="portfolio-link-chip">${escHtml(product.name)}</a>`;
}

function renderPortfolioFamilyCard(family, options = {}) {
  const visual = familyVisuals[family.title] || familyVisuals['Lamination Tooling'];
  const productLinks = family.products.map((productId) => productTextLink(productId)).filter(Boolean).join('');
  const anchor = `family-${slugify(family.title)}`;
  return `<article id="${anchor}" class="ui-family-card">
      <div class="ui-family-media">
          <picture>
              <source srcset="${visual.image.replace('.webp', '.avif')}" type="image/avif">
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="720" height="520" loading="lazy">
          </picture>
          <div class="ui-family-overlay"></div>
          <div class="ui-family-badge">${glyph(familyIconName(family.title), 'icon icon-sm')} ${family.products.length} routes</div>
      </div>
      <div class="ui-family-body">
          <div class="ui-meta-list mb-4">${family.highlights.slice(0, 3).map((item) => `<span class="ui-meta-pill">${escHtml(item)}</span>`).join('')}</div>
          <h3 class="ui-family-title">${escHtml(family.title)}</h3>
          <p class="ui-family-copy">${escHtml(family.intro)}</p>
          <div class="ui-data-grid mb-4">
              <div class="ui-data-card">
                  <div class="ui-data-label">Key signal</div>
                  <div class="ui-data-value">${escHtml(family.highlights[0])}</div>
                  <p class="ui-data-note">${escHtml(family.highlights[1] || '')}</p>
              </div>
              <div class="ui-data-card">
                  <div class="ui-data-label">Best fit</div>
                  <div class="ui-data-value">${escHtml(family.sectors[0])}</div>
                  <p class="ui-data-note">${escHtml(family.sectors.slice(1, 3).join(' • '))}</p>
              </div>
          </div>
          <div class="ui-link-row">${productLinks}</div>
      </div>
  </article>`;
}


function getSolutionHref(slug) {
  return `/solutions/${slug}/`;
}

function renderProductPillLink(productId, className = 'ui-link-pill') {
  const product = getProduct(productId);
  const meta = getMeta(productId);
  if (!product || !meta) return '';
  return `<a href="/products/${meta.slug}/" class="${className}">${escHtml(product.name)}</a>`;
}

function relatedSolutionsForProduct(productId) {
  return applications.filter((app) => app.products.includes(productId));
}

function productRoleForSolution(slug, productId) {
  const mapped = SOLUTION_PRODUCT_ROLES[slug]?.[productId];
  if (mapped) return mapped;
  return getMeta(productId)?.workflow?.split('. ')[0] || 'Use the product sheet as the reference point, then confirm the final route against the programme.';
}

function solutionAudienceFor(slug) {
  return SOLUTION_AUDIENCES[slug] || ['Procurement', 'Technical teams'];
}

function solutionFlowFor(slug) {
  return SOLUTION_FLOWS[slug] || [];
}

function relatedInsightsForSolution(app, limit = 3) {
  const productIds = new Set(app.products);
  const editorial = rawInsights.editorial.filter((article) => productIds.has(article.category));
  const generated = rawInsights.generated.filter((article) => productIds.has(article.category));
  return [...editorial, ...generated].slice(0, limit);
}

function articleAudienceFor(article) {
  const merged = relatedSolutionsForProduct(article.category).flatMap((app) => solutionAudienceFor(app.slug));
  const unique = [...new Set(merged)];
  return unique.length ? unique.slice(0, 4) : ['Procurement', 'Technical teams'];
}

function renderApplicationPreviewCard(app, options = {}) {
  const { compact = false, priority = false } = options;
  const visual = getApplicationVisual(app.slug);
  const productLinks = app.products.slice(0, compact ? 4 : 5).map((productId) => renderProductPillLink(productId)).filter(Boolean).join('');
  const checkpoints = app.considerations.slice(0, compact ? 2 : 3).map((item) => `<li>${escHtml(item)}</li>`).join('');
  const audienceBadges = solutionAudienceFor(app.slug).slice(0, compact ? 2 : 4).map((item) => `<span>${escHtml(item)}</span>`).join('');
  const summary = compact ? `${app.overview.substring(0, 160).trim()}...` : `${app.overview.substring(0, 220).trim()}...`;
  return `<article class="ui-solution-card${compact ? ' ui-solution-card-compact' : ''}">
      <div class="ui-solution-media">
          <picture>
              <source srcset="${visual.image.replace('.webp', '.avif')}" type="image/avif">
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="800" height="520" ${priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} class="w-full h-full object-cover">
          </picture>
          <div class="ui-solution-overlay"></div>
      </div>
      <div class="ui-solution-body">
          <div class="ui-kicker mb-3">${glyph(applicationIconName(app.slug), 'icon icon-sm')} ${escHtml(visual.eyebrow)}</div>
          <h3 class="ui-family-title">${escHtml(app.name)}</h3>
          <p class="ui-family-copy">${escHtml(summary)}</p>
          <div class="ui-solution-stack-label">Relevant product stack</div>
          <div class="ui-link-row mt-4">${productLinks}</div>
          <div class="ui-app-badges mt-5">${audienceBadges}</div>
          ${compact ? '' : `<ul class="ui-stack-list mt-5">${checkpoints}</ul>`}
          <div class="mt-6"><a href="${getSolutionHref(app.slug)}" class="btn-outline">Explore ${escHtml(app.name)} system</a></div>
      </div>
  </article>`;
}

function renderSolutionProductCard(app, productId) {
  const product = getProduct(productId);
  const meta = getMeta(productId);
  if (!product || !meta) return '';
  return `<article class="ui-stack-product-card">
      <div class="ui-stack-product-head">
          <div>
              <div class="ui-data-label">Product sheet</div>
              <h3 class="font-display font-bold text-xl mt-2">${escHtml(product.name)}</h3>
          </div>
          <span class="ui-meta-pill">${escHtml(product.stage)}</span>
      </div>
      <p class="text-sm text-zinc-500 leading-relaxed mt-4">${escHtml(productRoleForSolution(app.slug, productId))}</p>
      <div class="ui-app-badges mt-5">${(product.applications || []).slice(0, 3).map((item) => `<span>${escHtml(item)}</span>`).join('')}</div>
      <div class="mt-6"><a href="/products/${meta.slug}/" class="btn-outline">Open product sheet</a></div>
  </article>`;
}

function renderProductSolutionCard(productId, appSlug) {
  const app = applications.find((item) => item.slug === appSlug);
  if (!app) return '';
  return `<article class="ui-note-card ui-note-card-solid">
      <div class="ui-data-label">Solution system</div>
      <div class="ui-data-value">${escHtml(app.name)}</div>
      <p class="ui-data-note">${escHtml(productRoleForSolution(app.slug, productId))}</p>
      <div class="mt-6"><a href="${getSolutionHref(app.slug)}" class="btn-outline">Explore system</a></div>
  </article>`;
}

function renderMilestone(milestone) {
  return `<article class="ui-timeline-card">
      <div class="ui-timeline-year">${escHtml(milestone.year)}</div>
      <div>
          <h3 class="font-display font-bold text-lg mb-2">${escHtml(milestone.title)}</h3>
          <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(milestone.detail)}</p>
      </div>
  </article>`;
}


function renderMilestone(milestone) {
  return `<article class="ui-timeline-card">
      <div class="ui-timeline-year">${escHtml(milestone.year)}</div>
      <div>
          <h3 class="font-display font-bold text-lg mb-2">${escHtml(milestone.title)}</h3>
          <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(milestone.detail)}</p>
      </div>
  </article>`;
}


function articleProductContext(article) {
  const product = getProduct(article.category);
  const meta = getMeta(article.category);
  return product && meta ? { product, meta } : null;
}

function extractComparisonOptions(title, product) {
  const beforeColon = title.split(':')[0];
  const normalized = beforeColon.includes(' for ') ? beforeColon.split(' for ').slice(1).join(' for ') : beforeColon;
  const hasVs = beforeColon.includes(' vs ');
  const titleOptions = hasVs ? normalized.split(' vs ').map((part) => part.trim()).filter(Boolean) : [];
  if (titleOptions.length >= 2) return titleOptions.slice(0, 4);
  if (product.technical?.grades?.length >= 2) return product.technical.grades.slice(0, 4);
  return product.specs.slice(0, 3).map((spec) => spec.split(':')[0].trim()).filter(Boolean);
}

function articleDecisionLens(article) {
  if (article.type.includes('Comparative')) return 'Compare like-for-like before choosing a route.';
  if (article.type.includes('Quality')) return 'Inspect the approval-critical points before release.';
  if (article.type.includes('Buyer')) return 'Lock the RFQ inputs before asking for a quote.';
  if (article.type.includes('Technical')) return 'Read the specification against the actual process.';
  if (article.type.includes('Field')) return 'Use operating symptoms, not brochure language, to diagnose the issue.';
  return 'Match the product route to the real application before the commercial step.';
}

function articleChecklistLabel(article) {
  if (article.type.includes('Quality')) return 'Inspection checklist';
  if (article.type.includes('Comparative')) return 'Comparison checklist';
  if (article.type.includes('Buyer')) return 'RFQ checklist';
  if (article.type.includes('Technical')) return 'Technical review checklist';
  return 'Approval checklist';
}

function articleChecklistItems(article, context = null) {
  const product = context?.product;
  const base = [
    'Confirm the actual application, finish expectation, quantity, and timing before comparing prices.',
    'Keep the approved sample, drawing, or accepted technical record tied to the order.',
    'Check how the receiving team will inspect the material before production or installation release.'
  ];
  if (article.type.includes('Quality')) base.unshift('Define the acceptance points before the goods reach receiving.');
  if (article.type.includes('Comparative')) base.unshift('Match both options against the same end use, tolerance, and approval benchmark.');
  if (article.type.includes('Technical')) base.unshift('Treat the process condition as part of the specification, not as a separate discussion.');
  if (article.type.includes('Buyer')) base.unshift('Write down the non-negotiables so the first quote is not built on assumptions.');
  if (product?.specs?.length) base.push(`Use ${stripMarkdownInline(product.specs[0])} as one of the first comparison checkpoints.`);
  return base.slice(0, 4);
}

function articleRiskItems(article, context = null) {
  const product = context?.product;
  const risks = [
    'Generic equivalents replacing a product-specific route too early.',
    'Weak reference control between the approved sample and the actual supply.',
    'Late-stage corrections caused by missing receiving or dispatch discipline.'
  ];
  if (article.category === 'industrial-press-plates') risks.unshift('Flatness, parallelism, or surface condition being reduced to grade-only discussion.');
  if (article.category === 'decorative-panels' || article.category === 'ss-profiles') risks.unshift('Visual approval happening without a real sample or environment context.');
  if (article.category === 'press-pads' || article.category === 'press-plates') risks.unshift('Process drift being blamed on one layer when the stack should be reviewed together.');
  if (product?.applications?.length) risks.push(`The route being judged outside its actual use case, such as ${product.applications[0]}.`);
  return risks.slice(0, 4);
}

function renderInsightSignalStrip(article, context) {
  const product = context?.product;
  const meta = context?.meta;
  const specRows = product ? product.specs.slice(0, 2).map((spec, index) => specToRow(spec, index)) : [];
  const related = relatedSolutionsForProduct(article.category);
  const cards = [
    { label: 'Decision lens', value: articleDecisionLens(article), note: article.type },
    { label: 'Critical signal', value: specRows[0] ? `${specRows[0].label}: ${specRows[0].value}` : article.excerpt, note: product ? product.name : article.categoryLabel },
    { label: 'Best fit', value: product?.applications?.[0] || article.categoryLabel, note: product?.applications?.slice(1, 3).join(' • ') || 'Requirement-led review' },
    { label: 'Linked references', value: meta ? `${Math.min(3, meta.downloads.length)} file${meta.downloads.length === 1 ? '' : 's'}` : `${related.length} solution view${related.length === 1 ? '' : 's'}`, note: meta ? 'Downloads and routes are attached on this page.' : 'Use the linked routes for the next step.' }
  ];
  return `<div class="article-signal-grid mt-8">${cards.map((card) => `<article class="article-signal-card"><div class="article-signal-label">${escHtml(card.label)}</div><div class="article-signal-value">${escHtml(card.value)}</div><p class="article-signal-note">${escHtml(card.note)}</p></article>`).join('')}</div>`;
}

function renderInsightTechnicalAppendix(article, context) {
  if (!context) return '';
  const { product, meta } = context;
  const specRows = product.specs.slice(0, 4).map((spec, index) => specToRow(spec, index));
  const related = relatedSolutionsForProduct(article.category).slice(0, 3);
  const routeArticles = rawInsights.generated.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 4);
  const checklist = articleChecklistItems(article, context);
  const risks = articleRiskItems(article, context);
  const downloads = meta.downloads.slice(0, 3).map((download) => downloadLink(download)).join('');
  return `
    <section class="article-appendix">
      <h2 id="technical-checkpoints-at-a-glance">Technical checkpoints at a glance</h2>
      <div class="article-appendix-grid">
        <article class="article-panel">
          <div class="article-panel-label">Technical reference</div>
          <table>
            <tr><th>Checkpoint</th><th>Reference</th></tr>
            ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join('')}
            <tr><td>Lead time</td><td>${escHtml(product.technical?.leadTime || 'On request')}</td></tr>
            <tr><td>Origin route</td><td>${escHtml(product.technical?.origin || 'On request')}</td></tr>
          </table>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">${escHtml(articleChecklistLabel(article))}</div>
          <ul>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ul>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">Where mistakes happen</div>
          <ul>${risks.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ul>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">Use with these routes</div>
          <div class="article-panel-chip-row">${related.length ? related.map((app) => `<a href="${getSolutionHref(app.slug)}" class="article-panel-chip">${escHtml(app.name)}</a>`).join('') : `<span class="article-panel-chip">${escHtml(article.categoryLabel)}</span>`}</div>
          ${downloads ? `<div class="article-panel-links mt-4">${downloads}</div>` : `<p class="text-sm text-zinc-500 leading-relaxed mt-4">Reference files appear here when they support the route.</p>`}
        </article>
        ${routeArticles.length ? `<article class="article-panel"><div class="article-panel-label">Continue in this route</div><div class="article-panel-links">${routeArticles.map((item) => `<a href="/insights/${item.slug}/" class="article-toc-link">${escHtml(item.type)}</a>`).join('')}</div></article>` : ''}
      </div>
    </section>`;
}

function renderInsightArticleBody(article) {
  const context = articleProductContext(article);
  const authoredContent = String(article.content || '').trim();
  if (authoredContent) {
    return markdownToHtml(authoredContent) + renderInsightDeepPanels(article, context) + renderInsightTechnicalAppendix(article, context);
  }

  if (!context) {
    return markdownToHtml(article.content) + renderInsightDeepPanels(article, context);
  }

  const { product, meta } = context;
  const specRows = product.specs.map((spec, index) => specToRow(spec, index));
  const commercialRows = [
    ['Lead time', product.technical?.leadTime || 'On request'],
    ['MOQ', product.technical?.moq || 'On request'],
    ['Origin', product.technical?.origin || 'On request'],
    ['Standards', (product.technical?.certifications || []).join(', ') || 'On request']
  ];
  const checklist = [
    'Define the application, finish expectation, and end-use environment before requesting a quote.',
    'Lock dimensional requirements, grade, and compliance expectations in the RFQ.',
    'Confirm sampling or reference approval when finish fidelity or surface consistency matters.',
    'Review supply timing, documentation, and packing requirements before order confirmation.'
  ];
  const safeOverview = `${product.summary} ${product.customization || ''}`.trim();
  const safeWorkflow = meta.workflow || product.summary;
  const safeCommercial = `${product.customization || 'Final configuration is confirmed per enquiry.'} Lead time, MOQ, origin, and supporting documents are confirmed against the actual programme.`;
  let body = '';

  if (article.type === 'Buyer\'s Guide') {
    body = `
      <h2>Why This Matters</h2>
      <p>${escHtml(product.name)} buying decisions affect not only landed cost, but also finish quality, production stability, and downstream rework. The strongest RFQs align technical expectations, commercial timing, and inspection checkpoints before production begins.</p>
      <h2>Commercial Baseline</h2>
      <table>
        <tr><th>Parameter</th><th>Reference</th></tr>
        ${commercialRows.map(([label, value]) => `<tr><td>${escHtml(label)}</td><td>${escHtml(value)}</td></tr>`).join('')}
      </table>
      <h2>What To Lock Before Inquiry</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> ${escHtml(row.value)}</li>`).join('')}</ul>
      <h2>Supplier Evaluation Frame</h2>
      <ul>
        <li><strong>Technical fit:</strong> Can the supplier align grade, build-up, finish, and application performance instead of quoting a generic equivalent?</li>
        <li><strong>Quality controls:</strong> Are inspections, approvals, and reference documents defined before dispatch?</li>
        <li><strong>Commercial discipline:</strong> Are lead time assumptions, quantity expectations, and logistics responsibilities clear?</li>
        <li><strong>Communication speed:</strong> Does the supplier respond fast enough for iterative specification work?</li>
      </ul>
      <h2>RFQ Checklist</h2>
      <ol>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ol>
      <h2>How Moldart Usually Engages</h2>
      <p>${escHtml(safeOverview)}</p>
      <p>${escHtml(safeCommercial)}</p>`;
  } else if (article.type === 'Quality & Standards') {
    body = `
      <h2>Quality Scope</h2>
      <p>${escHtml(product.name)} quality should be reviewed through the combined lens of dimensional control, surface acceptance, certification support, and consistency against the approved reference.</p>
      <h2>Applicable Standards</h2>
      <table>
        <tr><th>Control Area</th><th>Reference</th></tr>
        <tr><td>Primary standards</td><td>${escHtml((product.technical?.certifications || []).join(', ') || 'Project-specific')}</td></tr>
        <tr><td>Material platform</td><td>${escHtml((product.technical?.grades || []).join(', ') || product.material)}</td></tr>
        <tr><td>Typical supply route</td><td>${escHtml(product.technical?.origin || 'On request')}</td></tr>
      </table>
      <h2>Inspection Priorities</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> Verify against approved technical reference and supply documentation.</li>`).join('')}</ul>
      <h2>Receiving Checklist</h2>
      <ol>
        <li>Match order line, product description, and quantity against shipping documents.</li>
        <li>Confirm surface condition, dimensional integrity, and pack protection immediately on receipt.</li>
        <li>Review material certificates, compliance references, and any special quality commitments.</li>
        <li>Escalate deviations before installation, conversion, or production release.</li>
      </ol>
      <h2>Common Quality Risks</h2>
      <p>The most common failures happen when reference approval is weak, specifications are incomplete, or incoming inspection is delayed until after processing begins.</p>`;
  } else if (article.type === 'Application Guide') {
    body = `
      <h2>Application Context</h2>
      <p>${escHtml(safeWorkflow)}</p>
      <h2>Typical Use Cases</h2>
      <ul>${product.applications.map((application) => `<li><strong>${escHtml(application)}:</strong> Evaluate the product against finish requirement, production load, and installation or conversion method.</li>`).join('')}</ul>
      <h2>Selection Priorities</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> ${escHtml(row.value)}</li>`).join('')}</ul>
      <h2>Common Mistakes</h2>
      <ol>
        <li>Choosing on price before aligning the technical requirement.</li>
        <li>Skipping reference validation when finish or tolerance is surface-critical.</li>
        <li>Ignoring production timing, storage, or handling conditions before use.</li>
        <li>Under-specifying documentation for export, compliance, or customer approval.</li>
      </ol>
      <h2>Execution Note</h2>
      <p>${escHtml(safeCommercial)}</p>`;
  } else if (article.type === 'Technical Deep-Dive') {
    body = `
      <h2>Technical Scope</h2>
      <p>${escHtml(safeOverview)}</p>
      <h2>Specification Reference</h2>
      <table>
        <tr><th>Technical item</th><th>Reference</th></tr>
        ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join('')}
        <tr><td>Material grades</td><td>${escHtml((product.technical?.grades || []).join(', ') || product.material)}</td></tr>
        <tr><td>Standards</td><td>${escHtml((product.technical?.certifications || []).join(', ') || 'Project-specific')}</td></tr>
      </table>
      <h2>Engineering Notes</h2>
      <ul>
        <li>Specifications should be reviewed against the actual end-use and not copied from unrelated historical orders.</li>
        <li>Dimensional and surface requirements should be documented alongside the commercial quote request.</li>
        <li>Where relevant, destination-market compliance should be validated before production scheduling.</li>
      </ul>
      <h2>Practical Qualification Questions</h2>
      <ol>
        <li>Which of these technical requirements are mandatory versus preferred?</li>
        <li>What reference sample or approved finish defines acceptance?</li>
        <li>Which documents must ship with the order?</li>
        <li>What is the tolerance for batch-to-batch variation?</li>
      </ol>`;
  } else if (article.type === 'Comparative Analysis') {
    const options = extractComparisonOptions(article.title, product);
    const comparisonRows = options.map((option, index) => {
      const note = index === 0
        ? 'Best when commercial efficiency and broad availability are the primary drivers.'
        : index === 1
          ? 'Best when performance, finish control, or service life justify the tighter specification.'
          : 'Best when the requirement is application-specific or tied to an existing approval route.';
      return `<tr><td>${escHtml(option)}</td><td>${escHtml(product.applications[index % product.applications.length] || product.use)}</td><td>${escHtml(note)}</td></tr>`;
    }).join('');
    body = `
      <h2>Decision Frame</h2>
      <p>${escHtml(product.name)} comparisons are rarely just material-versus-material decisions. The right answer depends on tolerance, finish expectation, conversion route, volume, and commercial timing.</p>
      <h2>Comparison Table</h2>
      <table>
        <tr><th>Option</th><th>Typical fit</th><th>Decision note</th></tr>
        ${comparisonRows}
      </table>
      <h2>Shared Evaluation Criteria</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> Use this as a like-for-like comparison checkpoint.</li>`).join('')}</ul>
      <h2>Commercial Overlay</h2>
      <p>Even when multiple options are technically viable, lead time, MOQ, origin, documentation, and approval risk can materially change the best commercial choice.</p>
      <table>
        <tr><th>Commercial item</th><th>Reference</th></tr>
        ${commercialRows.map(([label, value]) => `<tr><td>${escHtml(label)}</td><td>${escHtml(value)}</td></tr>`).join('')}
      </table>`;
  } else if (article.type === 'Comprehensive Guide') {
    body = `
      <h2>Overview</h2>
      <p>${escHtml(safeOverview)}</p>
      <h2>Where It Fits</h2>
      <p>${escHtml(safeWorkflow)}</p>
      <h2>Core Technical References</h2>
      <table>
        <tr><th>Reference area</th><th>Details</th></tr>
        ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join('')}
      </table>
      <h2>Typical Applications</h2>
      <ul>${product.applications.map((application) => `<li>${escHtml(application)}</li>`).join('')}</ul>
      <h2>Commercial Notes</h2>
      <p>${escHtml(safeCommercial)}</p>
      <h2>Selection Checklist</h2>
      <ol>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ol>
      <h2>When To Talk To Moldart</h2>
      <p>Bring Moldart in early when the programme involves finish-sensitive approvals, multi-step sourcing, compliance-sensitive exports, or recurring supply that needs a stable technical-commercial reference.</p>`;
  } else {
    body = markdownToHtml(article.content);
  }

  return body + renderInsightDeepPanels(article, context) + renderInsightTechnicalAppendix(article, context);
}

function productCard(productId) {
  const p = getProduct(productId);
  const m = getMeta(productId);
  if (!p || !m) return '';
  return `<a href="/products/${m.slug}/" class="product-card border rounded-xl overflow-hidden transition-colors group">
    <div class="product-card-img relative overflow-hidden" style="height:180px;">
        <picture>
            <source srcset="${p.image.replace('.webp','.avif')}" type="image/avif">
            <img src="${p.image}" alt="${escHtml(p.name)}" width="400" height="280" loading="lazy" class="w-full h-full object-cover">
        </picture>
    </div>
    <div class="p-4">
        <h3 class="font-display font-bold text-base tracking-wider mb-1">${escHtml(p.name)}</h3>
        <p class="text-xs text-zinc-500 leading-relaxed">${escHtml(p.summary.substring(0, 120))}…</p>
        <div class="mt-3 flex gap-2 flex-wrap">
            ${p.industry.slice(0, 2).map(t => `<span class="directory-pill">${escHtml(t)}</span>`).join('')}
        </div>
    </div>
</a>`;
}

function ctaBlock(heading, subtext, primaryLabel, primaryHref, secondaryLabel, secondaryHref) {
  return `<section class="max-w mx-auto px py-24 fade-up">
    <div class="ui-cta-band">
        <div class="ui-cta-copy">
            <h2 class="font-display font-black text-3xl mb-3" style="line-height:1;">${heading}</h2>
            <p>${subtext}</p>
        </div>
        <div class="ui-cta-actions">
            <a href="${primaryHref}" class="btn-primary btn-lg">${primaryLabel} →</a>
            ${secondaryLabel ? `<a href="${secondaryHref}" class="btn-outline btn-lg">${secondaryLabel}</a>` : ''}
        </div>
    </div>
</section>`;
}


// ============================================================
// PAGE GENERATORS
// ============================================================

function generateHomepage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Moldart', url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/favicon-192x192.png', width: 192, height: 192 }, foundingDate: '1989', sameAs: [COMPANY_LINKEDIN, YASH_LINKEDIN], address: { '@type': 'PostalAddress', streetAddress: '#7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West)', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', postalCode: '400064', addressCountry: 'IN' }, contactPoint: { '@type': 'ContactPoint', telephone: '+917208088788', contactType: 'sales', email: 'info@moldartindia.com', areaServed: 'IN', availableLanguage: ['English', 'Hindi'] }, description: 'Lamination tooling, panels, flooring, furniture programmes, decorative stainless steel, and industrial press surfaces from Mumbai since 1989.' },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', name: 'Moldart', url: SITE + '/', inLanguage: 'en-IN' },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/#webpage', url: SITE + '/', name: 'Moldart | Lamination tooling, panels, flooring & decorative stainless steel', description: 'Moldart works from Mumbai across wood and steel programmes, aligning sourcing from India and China to the requirement.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const featuredDocs = getInstantResourceItems().slice(0, 4);
  const featuredArticles = rawInsights.editorial.slice(0, 4);
  const ecosystemCards = portfolioFamilies.map((family) => `<article class="ui-library-card ui-ecosystem-card"><div class="ui-kicker mb-3">${glyph(familyIconName(family.title), 'icon icon-sm')} ${escHtml(family.title)}</div><h3 class="ui-family-title" style="font-size:1.15rem;">${escHtml(family.highlights[0])}</h3><p class="text-sm text-zinc-500 leading-relaxed mt-3">${escHtml(family.intro)}</p><div class="ui-link-row mt-5">${family.products.slice(0, 4).map((productId) => productTextLink(productId)).filter(Boolean).join('')}</div></article>`).join('');

  return headTag({
    title: 'Moldart | Lamination tooling, panels, flooring & decorative stainless steel',
    desc: 'Moldart works from Mumbai across wood and steel programmes, aligning sourcing from India and China to the application, finish, and commercial route.',
    canonical: '/',
    ogImage: siteSocialPosterRelativePath('moldart-home'),
    ogImageAlt: 'Moldart homepage overview',
    schemas,
    prefetch: ['/solutions/', '/resources/', '/insights/', '/contact/']
  }) + '\n' + nav('home') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 fade-up">
            <div class="ui-hero">
                <div>
                    <div class="ui-kicker mb-6">${glyph('shield', 'icon icon-sm')} Since 1989 · Mumbai</div>
                    <h1 class="page-heading page-heading-home mb-6">LAMINATION TOOLING, PANELS,<br>FLOORING, FURNITURE,<br>AND DECORATIVE STAINLESS STEEL.</h1>
                    <p class="ui-intro">Moldart works from Mumbai across wood and steel programmes, aligning sourcing from India and China to the application, finish, and commercial route.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('clock', 'icon icon-sm')} Since 1989</span>
                        <span class="ui-chip">${glyph('building', 'icon icon-sm')} Mumbai coordination</span>
                        <span class="ui-chip">${glyph('route', 'icon icon-sm')} India + China sourcing</span>
                        <span class="ui-chip">${glyph('message', 'icon icon-sm')} Requirement-led follow-up</span>
                    </div>
                    <div class="flex gap-4 flex-wrap mt-8 hero-cta-wrap">
                        <a href="/solutions/" class="btn-primary btn-lg">Explore Solutions →</a>
                        <a href="/contact/" class="btn-outline btn-lg">Share your requirement</a>
                    </div>
                </div>
                <div class="ui-panel ui-panel-soft home-hero-panel-compact">
                    <div class="ui-panel-inner">
                        <div class="ui-kicker mb-4">${glyph('search', 'icon icon-sm')} Start from the shortest route</div>
                        <div class="ui-metric-grid">
                            ${renderMetricCard({ icon: 'search', label: 'Explore', value: 'Start here', note: 'Use the search-led route when you want the fastest jump into the right page.' })}
                            ${renderMetricCard({ icon: 'compass', label: 'Solutions', value: applications.length, note: 'Application-led programme views with the product stack already attached.', animate: true })}
                            ${renderMetricCard({ icon: 'book', label: 'Resources', value: getTotalResourceItems(), note: 'Downloadable reference decks and product documents in one library.', animate: true })}
                            ${renderMetricCard({ icon: 'spark', label: 'Insights', value: rawInsights.articles.length, note: 'Guides and technical notes built to support buyer decisions.', animate: true })}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px pb-20 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('globe', 'icon icon-sm')} Programme geography</div>
                <h2 class="ui-section-title">A CLEANER VIEW OF THE ROUTE.</h2>
                <p class="ui-section-subtitle">The map stays deliberately simple: Mumbai is shown separately from India, India and China remain the sourcing anchors, and the wider lanes stay illustrative rather than overstated.</p>
            </div>
            <div class="ui-world-stage">
                <div class="ui-world-stage-map">${renderHeroNetworkMap()}</div>
                <aside class="ui-world-stage-copy">
                    <div class="ui-map-caption">Mumbai is the operating base. India and China remain the sourcing anchors. The wider lines describe indicative programme geography, not sales-office coverage.</div>
                    <div class="ui-world-lane-grid">
                        <article class="ui-world-lane-card"><div class="ui-world-lane-label">Operating base</div><strong>Mumbai</strong><p>Commercial coordination, brief handling, and routing stay centred here.</p></article>
                        <article class="ui-world-lane-card"><div class="ui-world-lane-label">Primary anchor</div><strong>India</strong><p>Shown separately from Mumbai so the map does not confuse the city with the country route.</p></article>
                        <article class="ui-world-lane-card"><div class="ui-world-lane-label">Secondary anchor</div><strong>China</strong><p>Used where the category, finish route, or commercial path calls for it.</p></article>
                        <article class="ui-world-lane-card"><div class="ui-world-lane-label">Wider lanes</div><strong>Six-region orientation</strong><p>North America, South America, Europe, Africa, Asia, and Oceania stay illustrative only.</p></article>
                    </div>
                    <div class="ui-world-map-legend mt-4">
                        <span class="ui-world-map-legend-item is-primary"><strong>Mumbai</strong><span>Operating base and commercial coordination</span></span>
                        <span class="ui-world-map-legend-item"><strong>India</strong><span>Shown separately from Mumbai inside the Asia route</span></span>
                        <span class="ui-world-map-legend-item"><strong>China</strong><span>Second sourcing anchor where relevant</span></span>
                        <span class="ui-world-map-legend-item"><strong>Illustrative lanes</strong><span>Route direction only, not office claims</span></span>
                    </div>
                    <div class="ui-world-map-note mt-3">Six-region orientation only. The wider lines stay illustrative and are used only to explain route context around Mumbai, India, and China.</div>
                </aside>
            </div>
        </section>

        <section id="product-ecosystems" class="bg-zinc-50 border-y border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-20">
                <div class="ui-section-head mb-12">
                    <div class="ui-kicker mb-4">${glyph('layers', 'icon icon-sm')} Product ecosystems</div>
                    <h2 class="ui-section-title">START WITH THE CATEGORY,<br>THEN MOVE INTO THE PROGRAMME.</h2>
                    <p class="ui-section-subtitle">Use this preview to understand the families Moldart works across. Open Solutions for the full application views, product stacks, and next-step references.</p>
                </div>
                <div class="ui-library-grid ui-ecosystem-grid">${ecosystemCards}</div>
                <div class="mt-10"><a href="/solutions/" class="btn-outline">Open all solutions</a></div>
            </div>
        </section>

        <section class="max-w mx-auto px py-20 border-t border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('book', 'icon icon-sm')} Decision tools</div>
                <h2 class="ui-section-title">FILES FOR DOWNLOAD,<br>GUIDES FOR DECISIONS.</h2>
                <p class="ui-section-subtitle">Resources stays document-first and Insights stays article-first. They are kept separate so the home page stays useful without repeating the same route twice.</p>
            </div>
            <div class="ui-library-grid">
                <article class="ui-library-card">
                    <div class="ui-kicker mb-2">${glyph('file', 'icon icon-sm')} Reference downloads</div>
                    <div class="ui-list-compact mt-4">
                        ${featuredDocs.map((item) => `<div class="ui-list-row"><div class="ui-list-copy"><div class="ui-list-title">${escHtml(item.title)}</div><div class="ui-list-meta">${escHtml(item.group)} · ${escHtml(item.desc)}</div></div><a href="${resourceHref(item)}" target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(item.title)}" class="ui-list-link">${glyph('arrow', 'icon icon-sm')}</a></div>`).join('')}
                    </div>
                    <div class="mt-8"><a href="/resources/" class="btn-outline">Open Resources</a></div>
                </article>
                <article class="ui-library-card">
                    <div class="ui-kicker mb-2">${glyph('spark', 'icon icon-sm')} Editorial guides</div>
                    <div class="ui-list-compact mt-4">
                        ${featuredArticles.map((article) => renderHomeInsightRow(article)).join('')}
                    </div>
                    <div class="mt-8"><a href="/insights/" class="btn-outline">Open Insights</a></div>
                </article>
            </div>
        </section>

        ${ctaBlock('READY TO START<br>FROM THE RIGHT ROUTE?', 'Use Solutions for the programme view, open references when needed, or send the requirement directly for review.', 'Explore Solutions', '/solutions/', 'Share your requirement', '/contact/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateExplorePage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Explore' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/explore/#webpage', url: SITE + '/explore/', name: 'Explore Moldart | Search the full portfolio', description: 'Search solutions, product sheets, technical guides, and resources across the full Moldart portfolio.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const quickRoutes = [
    { href: '/solutions/', title: 'Solutions', detail: 'Combined system views with the relevant product stack already attached.', meta: `${applications.length} systems`, icon: 'compass' },
    { href: '/explore/#product-directory-root', title: 'Product sheets', detail: 'Open the individual product pages when you already know the category.', meta: `${rawProducts.products.length} sheets`, icon: 'layers' },
    { href: '/resources/', title: 'Resources', detail: 'Document-first discovery for catalogues, finishes, and reference PDFs.', meta: `${getTotalResourceItems()} references`, icon: 'book' },
    { href: '/insights/', title: 'Technical guides', detail: 'Longer-form guidance for buyers, technical teams, and project stakeholders.', meta: `${rawInsights.articles.length} guides`, icon: 'spark' }
  ];

  return headTag({
    title: 'Explore Moldart | Search solutions, product sheets, and guides',
    desc: 'Search and filter Moldart solutions, product sheets, technical resources, and guides from one discovery page.',
    canonical: '/explore/',
    ogImage: siteSocialPosterRelativePath('moldart-home'),
    ogImageAlt: 'Moldart discovery overview',
    schemas,
    prefetch: ['/data/product-directory.json', '/resources/', '/solutions/']
  }) + '\n' + nav('explore') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('search', 'icon icon-sm')} Search the full portfolio</div>
                    <h1 class="ui-section-title">SEARCH SOLUTIONS,<br>PRODUCT SHEETS, AND GUIDES.</h1>
                    <p class="ui-section-subtitle">Use Explore when you do not care which page type the answer lives on. Search by product, application, spec language, or category and jump directly to the right sheet.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('search', 'icon icon-sm')} Search on-page</span>
                        <span class="ui-chip">${glyph('spark', 'icon icon-sm')} Ctrl/⌘ K palette</span>
                        <span class="ui-chip">${glyph('layers', 'icon icon-sm')} Solutions + sheets + guides</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-metric-grid">
                        ${renderMetricCard({ icon: 'compass', label: 'Solutions', value: applications.length, note: 'System views that already include the relevant product stack.', animate: true })}
                        ${renderMetricCard({ icon: 'layers', label: 'Product sheets', value: rawProducts.products.length, note: 'Reference-led pages for individual products and categories.', animate: true })}
                        ${renderMetricCard({ icon: 'book', label: 'Resources', value: getTotalResourceItems(), note: 'One library for catalogues, finish decks, and PDFs.', animate: true })}
                        ${renderMetricCard({ icon: 'spark', label: 'Guides', value: rawInsights.articles.length, note: 'Technical guides covering product, quality, and procurement decisions.', animate: true })}
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16">
            <div id="product-directory-root"></div>
        </section>

        <section class="bg-zinc-50 border-y border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-20">
                <div class="ui-section-head mb-10">
                    <div class="ui-kicker mb-4">${glyph('compass', 'icon icon-sm')} Quick routes</div>
                    <h2 class="ui-section-title">FOUR FAST LANES.</h2>
                    <p class="ui-section-subtitle">If you already know how you want to browse, jump directly into the right route below.</p>
                </div>
                <div class="ui-action-grid">${quickRoutes.map((card) => renderActionCard(card)).join('')}</div>
            </div>
        </section>

        ${ctaBlock('NEED A HUMAN<br>SHORTLIST?', 'If search gets you close but not all the way there, send the requirement and let the team align the right path directly.', 'Share your requirement', '/contact/', 'Explore Solutions', '/solutions/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateSolutionsHub() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Solutions' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/solutions/#webpage', url: SITE + '/solutions/', name: 'Solutions — Moldart', description: 'Programme views across lamination, furniture, flooring, architecture, decorative stainless steel, and industrial press applications.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const solutionCards = applications.map((app, index) => renderApplicationPreviewCard(app, { priority: index < 3 })).join('\n');

  return headTag({
    title: 'Solutions | Moldart',
    desc: 'Start with the programme and see the relevant product stack, guides, and downloads together.',
    canonical: '/solutions/',
    ogImage: siteSocialPosterRelativePath('moldart-solutions'),
    ogImageAlt: 'Moldart solutions overview',
    schemas
  }) + '\n' + nav('solutions') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('compass', 'icon icon-sm')} Solutions</div>
                    <h1 class="ui-section-title">START WITH THE PROGRAMME.</h1>
                    <p class="ui-section-subtitle">Each solution page keeps the relevant products, practical checkpoints, related guides, and reference downloads together so the next step is easier to judge.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('compass', 'icon icon-sm')} ${applications.length} programme views</span>
                        <span class="ui-chip">${glyph('layers', 'icon icon-sm')} Product sheets linked where needed</span>
                        <span class="ui-chip">${glyph('book', 'icon icon-sm')} Guides and downloads attached</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Best for</div><div class="ui-proof-value">Application-first shortlisting</div><p class="ui-proof-copy">Use Solutions when the requirement is still being narrowed at the programme level.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">What you get</div><div class="ui-proof-value">Products, guides, and references together</div><p class="ui-proof-copy">Each route keeps the relevant stack visible instead of hiding it on separate hubs.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Next step</div><div class="ui-proof-value">Move to direct review</div><p class="ui-proof-copy">After shortlisting the route, use Contact for the final commercial and technical confirmation.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16">
            <div class="ui-solution-grid">${solutionCards}</div>
        </section>

        ${ctaBlock('NEED A CLEANER<br>SHORTLIST?', 'Open the solution that matches the requirement, review the stack, and then move into direct discussion when the brief is ready.', 'Share your requirement', '/contact/', 'Open Resources', '/resources/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateProductsHub() {
  return generatePageRedirect('/solutions/', 'Redirecting to Solutions — Moldart', 'Explore solutions');
}


function generateProductPage(productId) {
  const p = getProduct(productId);
  const m = getMeta(productId);
  if (!p || !m) { console.error(`Missing data for ${productId}`); return; }

  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Solutions', url: '/solutions/' }, { name: p.name }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}/products/${m.slug}/#webpage`, url: `${SITE}/products/${m.slug}/`, name: m.seoTitle, description: safeProductMetaDesc(p), isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema,
    { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary, image: SITE + p.image, brand: { '@type': 'Brand', name: 'Moldart' }, manufacturer: { '@type': 'Organization', name: 'Moldart' }, category: `${p.stage} / ${p.use}` }
  ];

  const specTableRows = [
    ...p.specs.map((spec, index) => {
      const row = specToRow(spec, index);
      return `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`;
    }),
    `<tr><td>Material grades</td><td>${escHtml((p.technical?.grades || []).join(', ') || p.material)}</td></tr>`,
    `<tr><td>Reference standard</td><td>${escHtml(standardsText(p.technical))}</td></tr>`,
    `<tr><td>Supply route</td><td>${escHtml(p.technical?.origin || 'Programme-dependent')}</td></tr>`,
    `<tr><td>Commercial schedule</td><td>${escHtml(p.technical?.leadTime || 'On request')}</td></tr>`
  ].join('');

  const relatedSolutions = m.relatedApps.map((slug) => applications.find((item) => item.slug === slug)).filter(Boolean);
  const relatedSolutionPills = relatedSolutions.map((app) => `<a href="${getSolutionHref(app.slug)}" class="ui-link-pill">${escHtml(app.name)}</a>`).join('');
  const relatedSolutionCards = relatedSolutions.map((app) => renderProductSolutionCard(productId, app.slug)).join('');

  return headTag({
    title: m.seoTitle,
    desc: safeProductMetaDesc(p),
    canonical: `/products/${m.slug}/`,
    ogImage: p.image,
    ogImageAlt: p.name + ' — Moldart',
    schemas
  }) + '\n' + nav('solutions') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-product-hero">
                <div class="ui-product-media overflow-hidden">
                    <picture>
                        <source srcset="${p.image.replace('.webp','.avif')}" type="image/avif">
                        <img src="${p.image}" alt="${escHtml(p.name)}" width="900" height="700" loading="eager" class="w-full h-full object-cover">
                    </picture>
                </div>
                <div class="ui-product-side">
                    <div class="ui-page-hero-copy">
                        <div class="ui-kicker mb-4">${glyph('layers', 'icon icon-sm')} ${escHtml(p.stage)} · ${escHtml(p.use)}</div>
                        <h1 class="ui-section-title">${escHtml(p.name)}.</h1>
                        <p class="ui-section-subtitle">${escHtml(p.summary)}</p>
                        <div class="ui-chip-row mt-8">
                            ${p.applications.slice(0, 3).map((application) => `<span class="ui-chip">${glyph('check', 'icon icon-sm')} ${escHtml(application)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="ui-fact-grid">
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Where it fits</div>
                            <div class="ui-data-value">${escHtml(p.applications[0] || 'Project-specific')}</div>
                            <p class="ui-data-note">${escHtml(p.applications.slice(1, 3).join(' • ') || 'Fit is confirmed against the final application.')}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">What it does</div>
                            <div class="ui-data-value">${escHtml((m.workflow || '').split('. ')[0] || 'Supports the process')}</div>
                            <p class="ui-data-note">${escHtml(m.workflow)}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Key checks</div>
                            <div class="ui-data-value">${escHtml(specToRow(p.specs[0] || 'Confirmed per enquiry').value || 'Confirmed per enquiry')}</div>
                            <p class="ui-data-note">${escHtml(p.specs.slice(1, 3).join(' • '))}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Commercial scope</div>
                            <div class="ui-data-value">Reference sheet only</div>
                            <p class="ui-data-note">${escHtml(`${p.customization} Final grade, finish, quantity, and commercial route are confirmed directly.`)}</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-spotlight">
                <div class="ui-table-card">
                    <div class="ui-kicker mb-4">${glyph('file', 'icon icon-sm')} Technical reference</div>
                    <table class="ui-table">
                        <tr><th>Reference</th><th>Details</th></tr>
                        ${specTableRows}
                    </table>
                </div>
                <div class="ui-stack-card">
                    <div class="ui-kicker mb-4">${glyph('book', 'icon icon-sm')} Reference pack</div>
                    <p class="text-sm text-zinc-500 leading-relaxed">Use the related documents as the first filter, then confirm the final specification against the real programme.</p>
                    <div class="flex flex-col gap-2 mt-6">${m.downloads.slice(0, 3).map((download) => downloadLink(download)).join('')}</div>
                    ${relatedSolutionPills ? `<div class="mt-8"><div class="ui-data-label mb-3">Used in systems</div><div class="ui-related-row">${relatedSolutionPills}</div></div>` : ''}
                </div>
            </div>
        </section>

        ${relatedSolutionCards ? `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph('compass', 'icon icon-sm')} System fit</div><h2 class="ui-section-title">WHERE THIS PRODUCT FITS.</h2><p class="ui-section-subtitle">Use the solution views below when the requirement is still being narrowed at the system level.</p></div><div class="ui-library-grid">${relatedSolutionCards}</div></section>` : ''}

        ${ctaBlock(`NEED ${escHtml(p.name.toUpperCase())}<br>SPECS OR PRICING?`, 'Share the application, finish expectation, quantity context, and timing for a faster recommendation.', 'Share your requirement', '/contact/', 'Back to Solutions', '/solutions/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateApplicationsHub() {
  return generatePageRedirect('/solutions/', 'Redirecting to Solutions — Moldart', 'Explore solutions');
}


function generateSolutionPage(app) {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Solutions', url: '/solutions/' }, { name: app.name }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}${getSolutionHref(app.slug)}#webpage`, url: `${SITE}${getSolutionHref(app.slug)}`, name: `${app.name} Solution — Moldart`, description: app.metaDesc, isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const flowItems = solutionFlowFor(app.slug).map((item, index) => `<div class="ui-flow-pill"><div class="ui-flow-step">${String(index + 1).padStart(2, '0')}</div><div class="ui-flow-title">${escHtml(item.title)}</div><p class="ui-flow-copy">${escHtml(item.detail)}</p></div>`).join('');
  const stackCards = app.products.map((productId) => renderSolutionProductCard(app, productId)).join('');
  const guideCards = relatedInsightsForSolution(app, 3).map((article) => `<div class="ui-list-row"><div class="ui-list-copy"><div class="ui-list-title">${escHtml(article.title)}</div><div class="ui-list-meta">${escHtml(article.categoryLabel)} · ${escHtml(article.type)}</div></div><a href="/insights/${article.slug}/" class="ui-list-link">${glyph('arrow', 'icon icon-sm')}</a></div>`).join('');
  const downloads = app.downloads.map((download) => downloadLink(download)).join('');
  const audience = solutionAudienceFor(app.slug).map((item) => `<span>${escHtml(item)}</span>`).join('');
  const visual = getApplicationVisual(app.slug);
  const heroVisualHtml = app.products.length > 1
    ? `${renderApplicationMosaic(app)}<div class="ui-map-caption">Representative products commonly combined in this system.</div>`
    : `<picture>
                            <source srcset="${visual.image.replace('.webp', '.avif')}" type="image/avif">
                            <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="900" height="600" loading="eager" class="w-full h-full object-cover">
                        </picture>
                        <div class="ui-map-caption">Reference product view for this system.</div>`;

  return headTag({
    title: `${app.name} Solution | Moldart`,
    desc: app.metaDesc,
    canonical: getSolutionHref(app.slug),
    ogImage: visual.image,
    ogImageAlt: visual.alt,
    schemas
  }) + '\n' + nav('solutions') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph(applicationIconName(app.slug), 'icon icon-sm')} ${escHtml(visual.eyebrow)}</div>
                    <h1 class="ui-section-title">${escHtml(app.name)}.</h1>
                    <p class="ui-section-subtitle">${escHtml(app.overview)}</p>
                    <div class="ui-app-badges mt-8">${audience}</div>
                    <div class="flex gap-4 flex-wrap mt-8">
                        <a href="/contact/" class="btn-primary btn-lg">Share your requirement →</a>
                        <a href="/resources/" class="btn-outline btn-lg">Open Resources</a>
                    </div>
                </div>
                <div class="ui-map-card ui-panel">
                    <div class="ui-panel-inner">
                        ${heroVisualHtml}
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph('layers', 'icon icon-sm')} Relevant product stack</div>
                <h2 class="ui-section-title">START WITH THE RIGHT STACK.</h2>
                <p class="ui-section-subtitle">Each card below explains why the product belongs in this system and links directly to the narrower product sheet when you need the detail.</p>
            </div>
            <div class="ui-stack-product-grid">${stackCards}</div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-spotlight">
                <div class="ui-stack-card">
                    <div class="ui-kicker mb-4">${glyph('route', 'icon icon-sm')} Decision flow</div>
                    <div class="ui-flow-band">${flowItems}</div>
                </div>
                <div class="ui-stack-card">
                    <div class="ui-kicker mb-4">${glyph('check', 'icon icon-sm')} What to confirm</div>
                    <ul class="ui-stack-list">${app.considerations.map((item) => `<li>${escHtml(item)}</li>`).join('')}</ul>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="ui-library-grid">
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph('spark', 'icon icon-sm')} Related guides</div>
                    <div class="ui-list-compact">${guideCards || '<p class="text-sm text-zinc-500 leading-relaxed">Related guides are shown when they help the next decision.</p>'}</div>
                </article>
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph('book', 'icon icon-sm')} Reference downloads</div>
                    <div class="flex flex-col gap-2">${downloads}</div>
                </article>
            </div>
        </section>

        ${ctaBlock(`READY TO DISCUSS<br>${escHtml(app.name.toUpperCase())}?`, 'Share the requirement, finish logic, quantity, and timing and Moldart can align the right system and product sheet path directly.', 'Share your requirement', '/contact/', 'Back to Solutions', '/solutions/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateApplicationPage(app) {
  return generatePageRedirect(getSolutionHref(app.slug), `Redirecting to ${app.name} — Moldart`, `Open ${app.name}`);
}


function generateResourcesPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Resources' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/resources/#webpage', url: SITE + '/resources/', name: 'Resources & Downloads — Moldart', description: 'Download product catalogues, material references, and finish decks from Moldart.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const groupsHtml = resourceGroups.map((group) => {
    const requestCount = group.items.filter(isRequestOnlyResource).length;
    return `
      <article id="${slugify(group.title)}" class="ui-resource-card fade-up">
          <div class="ui-resource-head">
              <div>
                  <div class="ui-kicker mb-3">${glyph('file', 'icon icon-sm')} ${escHtml(group.title)}</div>
                  <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(group.items[0]?.desc || 'Reference documents.')}</p>
              </div>
              <div class="ui-resource-head-meta">
                  <span class="ui-resource-count">${group.items.length}</span>
                  <span class="ui-resource-status${requestCount ? ' is-request' : ''}">${requestCount ? `${requestCount} request-only` : 'All downloadable'}</span>
              </div>
          </div>
          <div class="ui-resource-list mt-6">
              ${group.items.map((item) => `<div class="ui-list-row${isRequestOnlyResource(item) ? ' is-request' : ''}"><div class="ui-list-copy"><div class="ui-list-title-row"><div class="ui-list-title">${escHtml(item.title)}</div><span class="ui-resource-item-badge${isRequestOnlyResource(item) ? ' is-request' : ''}">${isRequestOnlyResource(item) ? 'Request file' : 'Download PDF'}</span></div><div class="ui-list-meta">${escHtml(item.desc)}</div>${isRequestOnlyResource(item) && item.note ? `<div class="ui-list-note">${escHtml(item.note)}</div>` : ''}</div>${isRequestOnlyResource(item) ? `<a href="${requestDocumentHref(item)}" class="ui-list-link ui-list-link-request">${glyph('message', 'icon icon-sm')}</a>` : `<a href="${resourceHref(item)}" target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(item.title)}" class="ui-list-link">${glyph('arrow', 'icon icon-sm')}</a>`}</div>`).join('')}
          </div>
      </article>`;
  }).join('\n');

  return headTag({
    title: 'Resources & Downloads | Product Catalogues — Moldart',
    desc: 'Download product catalogues, material references, and finish decks for lamination tooling, panels, flooring, furniture, and decorative stainless steel.',
    canonical: '/resources/',
    ogImage: siteSocialPosterRelativePath('moldart-resources'),
    ogImageAlt: 'Moldart resources library',
    schemas
  }) + '\n' + nav('resources') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('book', 'icon icon-sm')} Reference library</div>
                    <h1 class="ui-section-title">RESOURCES.</h1>
                    <p class="ui-section-subtitle">Browse the full reference library in one place. All listed documents open as downloadable PDFs after one short form unlock on the device.</p>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-metric-grid">
                        ${renderMetricCard({ icon: 'file', label: 'Documents', value: getTotalResourceItems(), note: 'Every reference currently available in the public library.', animate: true })}
                        ${renderMetricCard({ icon: 'arrow', label: 'Downloadable PDFs', value: getInstantResourceItems().length, note: 'All listed files now open as downloadable documents.', animate: true })}
                        ${renderMetricCard({ icon: 'layers', label: 'Sections', value: resourceGroups.length, note: 'Grouped by buying route instead of by file name alone.', animate: true })}
                        ${renderMetricCard({ icon: 'clock', label: 'Unlock once', value: '1 form', note: 'Share details once and this browser keeps the full library unlocked.' })}
                    </div>
                </div>
            </div>
        </section>
        <section class="max-w mx-auto px py-12 fade-up">
            <div class="ui-resource-library-note">All ${getTotalResourceItems()} references are downloadable here. Larger decks are served through a dedicated file route so the full library stays complete without hiding anything.</div>
        </section>
        <section class="max-w mx-auto px py-16">
            <div class="ui-resource-group">${groupsHtml}</div>
        </section>
        ${ctaBlock('NEED A SPECIFIC<br>DATA SHEET?', 'If the exact document is not listed here, send the product, application, or finish route and the team can route the right file directly.', 'Request a Document', '/contact/?focus=document-request', 'Explore Solutions', '/solutions/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateFAQPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'FAQ' }]);
  const allFaqItems = rawFaq.categories.flatMap((category) => category.items);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: allFaqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/faq/#webpage', url: SITE + '/faq/', name: 'FAQ — Moldart', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const faqMeta = {
    'Company & Reach': {
      icon: 'building',
      intro: 'Location, company background, sourcing geography, and how Moldart supports domestic and export programmes.'
    },
    'Product Fit & Customisation': {
      icon: 'layers',
      intro: 'How to approach product selection when multiple categories, finishes, or custom routes could fit the requirement.'
    },
    'Samples, Approvals & Documents': {
      icon: 'book',
      intro: 'Catalogues, finish decks, samples, approvals, and why some specifications stay requirement-led instead of fixed across every programme.'
    },
    'Orders, Timing & Logistics': {
      icon: 'route',
      intro: 'How lead time, MOQ, route planning, and dispatch expectations are handled once the requirement becomes specific.'
    },
    'Enquiries & Next Steps': {
      icon: 'message',
      intro: 'What to include in the first enquiry, which contact route to use, and what usually happens after the brief is shared.'
    }
  };

  const quickStarts = [
    { href: '/contact/', title: 'Need a fast first response?', detail: 'Use the enquiry form for a structured brief, or WhatsApp when the first step is simply getting routed correctly.', meta: 'Contact', icon: 'message' },
    { href: '/solutions/', title: 'Comparing more than one route?', detail: 'Open Solutions first when the requirement could move across multiple products or finish systems.', meta: 'Solutions', icon: 'compass' },
    { href: '/resources/', title: 'Need documents before deciding?', detail: 'Open the reference library for catalogues, finish decks, and shortlist material before the commercial discussion.', meta: 'Resources', icon: 'book' },
    { href: '/insights/', title: 'Need practical technical context?', detail: 'Use the guide library when the decision depends on approval logic, finish behaviour, or product fit.', meta: 'Insights', icon: 'spark' }
  ];

  const jumpLinks = rawFaq.categories.map((category) => {
    const meta = faqMeta[category.name] || { icon: 'book' };
    return `<a href="#${slugify(category.name)}" class="ui-faq-jump-link">${glyph(meta.icon, 'icon icon-sm')} <span>${escHtml(category.name)}</span><strong>${category.items.length}</strong></a>`;
  }).join('');

  const faqHtml = rawFaq.categories.map((category) => {
    const meta = faqMeta[category.name] || { icon: 'book', intro: 'Frequently asked questions.' };
    return `
      <article class="ui-faq-card" id="${slugify(category.name)}">
          <div class="ui-faq-head">
              <div>
                  <div class="ui-kicker mb-3">${glyph(meta.icon, 'icon icon-sm')} ${escHtml(category.name)}</div>
                  <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(meta.intro)}</p>
              </div>
              <span class="ui-resource-count">${category.items.length}</span>
          </div>
          <div class="ui-faq-list mt-6">
              ${category.items.map((item) => `
                <details class="ui-faq-item">
                    <summary>
                        <span>${escHtml(item.question)}</span>
                        ${glyph('arrow', 'icon icon-sm')}
                    </summary>
                    <p>${escHtml(item.answer)}</p>
                </details>`).join('')}
          </div>
      </article>`;
  }).join('');

  return headTag({
    title: 'FAQ | Moldart',
    desc: 'Buyer-facing answers on Moldart product groups, documents, enquiries, order planning, and next-step review.',
    canonical: '/faq/',
    schemas
  }) + '\n' + nav('faq') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('book', 'icon icon-sm')} FAQ</div>
                    <h1 class="ui-section-title">QUICK ANSWERS,<br>CLEARER NEXT STEPS.</h1>
                    <p class="ui-section-subtitle">Use this page when you need a fast answer on product fit, samples, documents, timing, or the best way to start the requirement discussion.</p>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Questions</div><div class="ui-proof-value">${allFaqItems.length} answers</div><p class="ui-proof-copy">Grouped by the practical stage of the buying conversation so the right answers are easier to scan.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Categories</div><div class="ui-proof-value">${rawFaq.categories.length} sections</div><p class="ui-proof-copy">Company, product fit, approvals, order planning, and first-contact questions all live here.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Still depends on the brief?</div><div class="ui-proof-value">Ask directly</div><p class="ui-proof-copy">Move to Contact when the right answer depends on the actual grade, finish, quantity, route, or destination.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-10 fade-up">
            <div class="ui-faq-jump-row">${jumpLinks}</div>
        </section>

        <section class="max-w mx-auto px pb-16 fade-up">
            <div class="ui-action-grid">${quickStarts.map((card) => renderActionCard(card)).join('')}</div>
        </section>

        <section class="max-w mx-auto px py-16 border-t border-zinc-100 fade-up">
            <div class="ui-resource-group">${faqHtml}</div>
        </section>
        ${ctaBlock('HAVE A SPECIFIC<br>QUESTION?', 'If the answer depends on the exact requirement, move from FAQ to a direct review with the team.', 'Share your requirement', '/contact/', 'Explore Solutions', '/solutions/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateContactPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Contact' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/contact/#webpage', url: SITE + '/contact/', name: 'Contact Moldart | Inquiry, WhatsApp, Phone, Meeting', description: 'Contact Moldart for product specifications, pricing, and industrial sourcing. Phone, WhatsApp, email, LinkedIn, or meeting booking.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema,
    { '@context': 'https://schema.org', '@type': 'ContactPage', mainEntity: { '@type': 'Organization', name: 'Moldart', url: SITE + '/', contactPoint: { '@type': 'ContactPoint', telephone: '+917208088788', contactType: 'sales', email: 'info@moldartindia.com' } } }
  ];

  const productOptions = rawProducts.products.map((p) => `<option value="${escHtml(p.name)}">${escHtml(p.name)}</option>`).join('\n                                ');

  return headTag({
    title: 'Contact Moldart | Inquiry Form, WhatsApp, Phone & Meeting Booking',
    desc: 'Contact Moldart in Mumbai for product specifications, pricing, and sourcing support. Reach out by form, WhatsApp, phone, email, or meeting request.',
    canonical: '/contact/',
    ogImage: siteSocialPosterRelativePath('moldart-default'),
    ogImageAlt: 'Moldart brand overview',
    schemas
  }) + '\n' + nav('contact') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('message', 'icon icon-sm')} Contact Moldart</div>
                    <h1 class="ui-section-title">SHARE THE REQUIREMENT,<br>THEN CHOOSE THE CHANNEL.</h1>
                    <p class="ui-section-subtitle">Use the form for the clearest handoff, WhatsApp for a fast first conversation, or email when drawings and reference files need to be shared from the start.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('whatsapp-brand', 'icon icon-sm')} WhatsApp</span>
                        <span class="ui-chip">${glyph('mail', 'icon icon-sm')} Email</span>
                        <span class="ui-chip">${glyph('calendar', 'icon icon-sm')} Meetings</span>
                        <span class="ui-chip">${glyph('linkedin-brand', 'icon icon-sm')} LinkedIn</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Best for</div><div class="ui-proof-value">Specifications and pricing</div><p class="ui-proof-copy">Share the application, finish expectation, quantity, and timing so the team can route the enquiry clearly.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Reply route</div><div class="ui-proof-value">Requirement-led follow-up</div><p class="ui-proof-copy">The next step depends on the real requirement, not on a one-size-fits-all answer.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Head office</div><div class="ui-proof-value">Malad West, Mumbai</div><p class="ui-proof-copy">Address, phone, email, and meeting links are kept together on this page.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section id="form-success-alert" class="max-w mx-auto px py-6 hidden">
            <div class="form-success-banner">
                <div class="flex items-center gap-3">
                    ${glyph('check', 'icon')}
                    <strong>Inquiry submitted successfully.</strong>
                </div>
                <p class="mt-2 text-sm">Thank you for reaching out. A member of the Moldart team will review the requirement and reply directly.</p>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-contact-grid">
                <div class="ui-contact-routes">
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph('whatsapp-brand')}</div><div><div class="ui-data-label">WhatsApp</div><div class="ui-data-value">Fast first contact</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Best for first contact, brief sharing, and quick commercial routing. Both WhatsApp lines stay visible so the enquiry can be routed on the faster available number.</p>
                        <div class="flex flex-col gap-2">
                            <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph('whatsapp-brand', 'icon icon-sm')} ${WHATSAPP_PRIMARY.display}</a>
                            <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph('whatsapp-brand', 'icon icon-sm')} ${WHATSAPP_SECONDARY.display}</a>
                        </div>
                    </article>
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph('mail')}</div><div><div class="ui-data-label">Email</div><div class="ui-data-value">Best for files</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Use email when drawings, specifications, and reference files matter from the first message.</p>
                        <a href="mailto:info@moldartindia.com" class="site-inline-link">${glyph('mail', 'icon icon-sm')} info@moldartindia.com</a>
                    </article>
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph('calendar')}</div><div><div class="ui-data-label">Meetings</div><div class="ui-data-value">Scheduled review</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Book a meeting when the requirement needs a detailed technical-commercial discussion.</p>
                        <a href="https://outlook.office.com/bookwithme/user/a07f98546e1e4f7fbb0f12f091a6e3ec@moldartindia.com?anonymous&ep=plink" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph('calendar', 'icon icon-sm')} Schedule a meeting</a>
                    </article>
                    <article class="ui-office-card">
                        <div class="ui-kicker mb-4">${glyph('building', 'icon icon-sm')} Head office</div>
                        <div class="font-display font-bold text-xl tracking-wider mb-3">MUMBAI</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light mb-4">#7, Building No. 1, New Sonal Link Industrial Estate,<br>Link Road, Malad (West), Mumbai — 400064<br>Maharashtra, India</p>
                        <div class="flex flex-col gap-2 mb-4">
                            <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-700 font-medium">Primary WhatsApp: ${WHATSAPP_PRIMARY.display}</a>
                            <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-700 font-medium">Alternate WhatsApp: ${WHATSAPP_SECONDARY.display}</a>
                            <a href="mailto:info@moldartindia.com" class="link-line text-sm text-zinc-700 font-medium">info@moldartindia.com</a>
                        </div>
                        <div class="contact-social-row">
                            <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="contact-social-chip">${glyph('linkedin-brand', 'icon icon-sm')} Moldart on LinkedIn</a>
                            <a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="contact-social-chip">${glyph('linkedin-brand', 'icon icon-sm')} Yash Doshi</a>
                        </div>
                    </article>
                </div>
                <div class="ui-contact-form">
                    <div class="ui-kicker mb-6">${glyph('message', 'icon icon-sm')} Share a requirement</div>
                    <form action="https://formsubmit.co/info@moldartindia.com" method="POST" class="flex flex-col gap-5 contact-form-compact" id="inquiry-form">
                        <input type="hidden" name="_subject" value="New Moldart Web Inquiry">
                        <input type="hidden" name="_template" value="table">
                        <input type="hidden" name="_next" value="${SITE}/contact/?submitted=true">
                        <input type="hidden" name="_captcha" value="false">
                        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">

                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Full Name *</span><input type="text" name="name" class="form-input" required aria-required="true" autocomplete="name" placeholder="John Doe"></label>
                            <label class="form-group"><span class="form-label">Company *</span><input type="text" name="company" class="form-input" required aria-required="true" autocomplete="organization" placeholder="Company name"></label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Email Address *</span><input type="email" name="email" class="form-input" required aria-required="true" autocomplete="email" placeholder="john@example.com"></label>
                            <label class="form-group"><span class="form-label">Phone / WhatsApp *</span><input type="tel" name="phone" class="form-input" required aria-required="true" autocomplete="tel" placeholder="+91 ..."></label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <label class="form-group">
                                <span class="form-label">Primary Interest</span>
                                <select name="interest" class="form-select">
                                    <option value="General Inquiry">General Inquiry</option>
                                    ${productOptions}
                                </select>
                            </label>
                            <label class="form-group"><span class="form-label">Requirement Focus</span><input type="text" name="application" class="form-input" placeholder="Pricing, specs, samples, project brief..."></label>
                        </div>
                        <label class="form-group"><span class="form-label">Message *</span><textarea name="message" class="form-textarea" required aria-required="true" placeholder="Share the application, dimensions, finish expectations, quantity, and timing."></textarea></label>
                        <p class="text-xs text-zinc-500">Your details are used only to review the requirement and respond with the relevant next step.</p>
                        <button type="submit" class="btn-primary btn-lg" style="width:100%;justify-content:center;">Submit Inquiry</button>
                        <p class="text-xs text-zinc-500">Lead time, MOQ, and final commercial timing are confirmed after the requirement is reviewed.</p>
                    </form>
                </div>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateAboutPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'About' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/about/#webpage', url: SITE + '/about/', name: 'About Moldart | Since 1989', description: `Moldart works from Mumbai across wood and steel supply programmes, with sourcing aligned per requirement.`, isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  return headTag({
    title: 'About Moldart | Since 1989',
    desc: 'Founded in 1989 and based in Mumbai, Moldart works across lamination tooling, panels, flooring, furniture, decorative stainless steel, and industrial press surfaces.',
    canonical: '/about/',
    ogImage: siteSocialPosterRelativePath('moldart-default'),
    ogImageAlt: 'Moldart brand overview',
    schemas
  }) + '\n' + nav('about') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('shield', 'icon icon-sm')} About Moldart</div>
                    <h1 class="ui-section-title">MUMBAI-LED SUPPLY<br>SINCE 1989.</h1>
                    <p class="ui-section-subtitle">Moldart works from Mumbai across wood and steel programmes, aligning sourcing by category and requirement rather than treating every order as a generic equivalent.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('clock', 'icon icon-sm')} Founded 1989</span>
                        <span class="ui-chip">${glyph('building', 'icon icon-sm')} Malad West, Mumbai</span>
                        <span class="ui-chip">${glyph('route', 'icon icon-sm')} India + China sourcing</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Head office</div><div class="ui-proof-value">Mumbai</div><p class="ui-proof-copy">The Malad West office remains the primary commercial and technical contact point.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Founded</div><div class="ui-proof-value">1989</div><p class="ui-proof-copy">A long-running trading and sourcing base across wood and steel product routes.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Core sourcing</div><div class="ui-proof-value">India + China</div><p class="ui-proof-copy">Sourcing routes are aligned to the category, finish route, and programme context.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Portfolio</div><div class="ui-proof-value">Wood + steel</div><p class="ui-proof-copy">Wood and steel categories are coordinated through one commercial and technical interface.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('clock', 'icon icon-sm')} Timeline</div>
                <h2 class="ui-section-title">THE COMPANY ARC.</h2>
                <p class="ui-section-subtitle">A concise view of how the company moved from a Mumbai trading base into a broader wood and steel supply programme.</p>
            </div>
            <div class="ui-timeline">
                ${companyMilestones.map((milestone) => renderMilestone(milestone)).join('')}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-library-grid">
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph('building', 'icon icon-sm')} Operating base</div>
                    <h3 class="ui-family-title" style="font-size:1.2rem;">Mumbai remains the primary coordination point.</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed mt-3">#7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West), Mumbai — 400064, Maharashtra, India.</p>
                    <div class="ui-link-row mt-5"><a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-link-pill">Primary WhatsApp ${WHATSAPP_PRIMARY.display}</a><a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-link-pill">Alternate WhatsApp ${WHATSAPP_SECONDARY.display}</a><a href="mailto:info@moldartindia.com" class="ui-link-pill">info@moldartindia.com</a></div>
                </article>
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph('route', 'icon icon-sm')} How Moldart works</div>
                    <div class="ui-flow-band">
                        ${SUPPLY_FLOW_ITEMS.map((item) => `<div class="ui-flow-pill"><div class="ui-flow-step">${escHtml(item.step)}</div><div class="ui-flow-title">${escHtml(item.title)}</div><p class="ui-flow-copy">${escHtml(item.detail)}</p></div>`).join('')}
                    </div>
                </article>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-kicker mb-6">${glyph('building', 'icon icon-sm')} Leadership</div>
            <div class="ui-profile-grid">
                <article class="ui-family-card">
                    <div class="ui-family-media" style="height:min(18rem,50vw);">
                        <picture><source srcset="/images/lalit_doshi.avif" type="image/avif"><img src="/images/lalit_doshi.webp" alt="Mr. Lalit Doshi — Founder and Partner at Moldart" class="w-full h-full object-cover" style="object-position:top;" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <div class="ui-family-body">
                        <h3 class="ui-family-title">MR. LALIT DOSHI</h3>
                        <div class="ui-proof-label mb-3">Founder & Partner</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Founder who established the company’s Mumbai base and long-running commercial relationships across wood and steel programmes.</p>
                    </div>
                </article>
                <article class="ui-family-card">
                    <div class="ui-family-media" style="height:min(18rem,50vw);">
                        <picture><source srcset="/images/yash_doshi.avif" type="image/avif"><img src="/images/yash_doshi.webp" alt="Mr. Yash Doshi — Partner at Moldart" class="w-full h-full object-cover" style="object-position:top;" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <div class="ui-family-body">
                        <h3 class="ui-family-title">MR. YASH DOSHI</h3>
                        <div class="ui-proof-label mb-3">Partner</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Partner working across category development, customer coordination, and programme follow-through.</p>
                        <div class="mt-4"><a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph('linkedin-brand', 'icon icon-sm')} Yash Doshi on LinkedIn</a></div>
                    </div>
                </article>
            </div>
        </section>

        ${ctaBlock('READY TO WORK<br>FROM A CLEARER BRIEF?', 'Open Solutions, review the relevant references, or send the requirement directly for confirmation.', 'Explore Solutions', '/solutions/', 'Share your requirement', '/contact/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateProcessPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Process' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/process/#webpage', url: SITE + '/process/', name: 'How Moldart Works | Sourcing & Supply Process', description: 'A concise view of how Moldart moves from requirement brief to aligned supply and repeat support.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const stages = [
    {
      number: '01',
      title: 'Share the brief',
      detail: 'Application, finish expectation, size, quantity, timing, and destination define the route faster than a generic product name ever can.',
      share: 'Application, drawing, sample, quantity, destination, and timeline.',
      output: 'A practical shortlist of the likely category, references, and next discussion.'
    },
    {
      number: '02',
      title: 'Align the route',
      detail: 'The first review narrows the product family, grade direction, finish family, and sourcing lane before price comparison becomes misleading.',
      share: 'Must-have technical points, approvals, compliance needs, and replacement rhythm.',
      output: 'A cleaner recommendation on the right route and the right reference pack.'
    },
    {
      number: '03',
      title: 'Lock the reference',
      detail: 'Samples, drawings, finish decks, or previous approved records should be matched before production or dispatch planning begins.',
      share: 'Approved sample, drawing, finish family, pattern, or the closest accepted benchmark.',
      output: 'Fewer finish, tolerance, and documentation surprises later in the programme.'
    },
    {
      number: '04',
      title: 'Supply, receive, repeat',
      detail: 'Documentation, packing, dispatch, receiving, and repeat-order logic stay tied to the approved route instead of being rebuilt each time.',
      share: 'Document needs, pack handling notes, receiving feedback, and reorder references.',
      output: 'Cleaner delivery now and a more stable repeat route later.'
    }
  ];

  const quickCards = [
    { title: 'What speeds up the first review', detail: 'A real brief with application, size, finish, quantity, timing, and destination always beats a generic equivalent request.' },
    { title: 'Where approvals need more care', detail: 'Surface-critical products such as press plates, decorative stainless, flooring finishes, and industrial tooling need stronger reference control.' },
    { title: 'What protects repeat supply', detail: 'Keep the last approved sample, drawing, and document trail linked to the next order instead of reordering from memory.' }
  ];

  const processVisual = `<div class="process-flow-card"><div class="process-flow-label">Commercial path</div><svg class="process-flow-svg" viewBox="0 0 860 220" role="img" aria-label="Process flow from brief to route, reference, and supply"><rect x="0" y="0" width="860" height="220" rx="28" fill="#fafafa"></rect><path d="M124 112H736" stroke="#d4d4d8" stroke-width="4" stroke-linecap="round"></path>${stages.map((stage, index) => { const x = 124 + (index * 204); return `<circle cx="${x}" cy="112" r="16" fill="#18181b"></circle><circle cx="${x}" cy="112" r="34" fill="none" stroke="rgba(24,24,27,.12)" stroke-width="2"></circle><text x="${x}" y="116" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#ffffff">${stage.number}</text><text x="${x}" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">${escHtml(stage.title)}</text><text x="${x}" y="178" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#52525b">${escHtml(index === 0 ? 'Brief' : index === 1 ? 'Route' : index === 2 ? 'Reference' : 'Supply')}</text>`; }).join('')}</svg><div class="process-flow-note">The shortest useful path is the commercial one: get the brief clear, narrow the route, lock the approval reference, then keep the same logic through supply and repeat orders.</div></div>`;

  return headTag({
    title: 'How Moldart Works | Sourcing, Quality & Supply Process',
    desc: 'A concise view of how Moldart moves from requirement brief through route alignment, approval, supply, and repeat support.',
    canonical: '/process/',
    ogImage: siteSocialPosterRelativePath('moldart-process'),
    ogImageAlt: 'Moldart process overview',
    schemas
  }) + '\n' + nav('process') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('route', 'icon icon-sm')} Process</div>
                    <h1 class="ui-section-title">FROM BRIEF<br>TO DELIVERY.</h1>
                    <p class="ui-section-subtitle">The page is intentionally short, but the work is not casual: share the brief, align the route, lock the reference, and keep repeat supply tied to what was actually approved.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph('message', 'icon icon-sm')} Start with the real brief</span>
                        <span class="ui-chip">${glyph('book', 'icon icon-sm')} Match the reference</span>
                        <span class="ui-chip">${glyph('shield', 'icon icon-sm')} Protect the approval</span>
                        <span class="ui-chip">${glyph('route', 'icon icon-sm')} Keep repeat supply stable</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    ${processVisual}
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('clock', 'icon icon-sm')} Four stages</div>
                <h2 class="ui-section-title">HOW THE WORK MOVES.</h2>
                <p class="ui-section-subtitle">A compact commercial view of how the requirement usually moves from the first message to aligned supply.</p>
            </div>
            <div class="ui-stage-grid ui-stage-grid-compact">
                ${stages.map((stage) => `<article class="ui-stage-card"><div class="ui-stage-num">${stage.number}</div><h3 class="font-display font-bold text-lg mb-3">${escHtml(stage.title)}</h3><p class="text-sm text-zinc-500 leading-relaxed">${escHtml(stage.detail)}</p><div class="ui-stage-meta"><div class="ui-stage-meta-block"><div class="ui-stage-meta-label">What to share</div><p>${escHtml(stage.share)}</p></div><div class="ui-stage-meta-block"><div class="ui-stage-meta-label">What comes out</div><p>${escHtml(stage.output)}</p></div></div></article>`).join('')}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('check', 'icon icon-sm')} Review notes</div>
                <h2 class="ui-section-title">THREE NOTES THAT KEEP<br>THE ROUTE CLEAN.</h2>
                <p class="ui-section-subtitle">These are the points that usually change speed, approval quality, and repeat stability more than any generic product discussion.</p>
            </div>
            <div class="process-note-board">
                ${quickCards.map((card, index) => `<article class="process-note-card"><div class="process-note-step">0${index + 1}</div><h3>${escHtml(card.title)}</h3><p>${escHtml(card.detail)}</p></article>`).join('')}
            </div>
        </section>

        ${ctaBlock('READY TO START?', 'Share the requirement and the team can align the route, reference, and next step against the actual programme.', 'Share your requirement', '/contact/', 'Open Resources', '/resources/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateLoginPage() {
  return headTag({
    title: 'Trade Portal Preview | Moldart',
    desc: 'Buyer access and supply partner access previews for the Moldart trade portal.',
    canonical: '/login/',
    noindex: true,
    schemas: []
  }) + '\n' + nav('login') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Portal Preview</span></div>
            <h1 class="page-heading">BUYER AND PARTNER<br>ACCESS.</h1>
            <p class="text-base text-zinc-500 font-light max-w-2xl leading-relaxed mt-6">The Moldart portal is being built as a disciplined operational layer for repeat buyers and verified supply partners. Until launch, this page works as an access preview and routing point.</p>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="signal-grid signal-grid-portal">
                <article class="signal-card portal-card">
                    <div class="section-label mb-4">Buyer Access</div>
                    <h2 class="font-display font-black text-2xl mb-4">BUYER WORKSPACE.</h2>
                    <p class="text-sm text-zinc-500 leading-relaxed mb-6">For manufacturers, project buyers, and procurement teams who want a cleaner route for specifications, documentation, downloads, and repeat requirement handling.</p>
                    <ul class="product-summary-list mb-6">
                        <li>Structured RFQ and specification intake</li>
                        <li>Reference documents and approval tracking</li>
                        <li>Repeat-order visibility and coordinated follow-up</li>
                    </ul>
                    <a href="/contact/" class="btn-primary">Request Buyer Access</a>
                </article>
                <article class="signal-card portal-card">
                    <div class="section-label mb-4">Supply Partner Access</div>
                    <h2 class="font-display font-black text-2xl mb-4">SELLER WORKFLOW.</h2>
                    <p class="text-sm text-zinc-500 leading-relaxed mb-6">For verified manufacturing and supply partners who need a cleaner lane for quote alignment, documentation exchange, and production-linked communication.</p>
                    <ul class="product-summary-list mb-6">
                        <li>Standardised quote and document flow</li>
                        <li>Quality checkpoints and approval visibility</li>
                        <li>Operational coordination for repeat programmes</li>
                    </ul>
                    <a href="/contact/" class="btn-outline">Request Partner Access</a>
                </article>
            </div>
        </section>

        <section class="bg-zinc-50 border-y border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-16">
                <div class="portal-status-card">
                    <div class="portal-status-copy">
                        <div class="section-label mb-3">Current Status</div>
                        <p class="text-sm text-zinc-500 leading-relaxed">Portal access is not live yet, but buyer and supplier onboarding can still begin through the contact flow.</p>
                    </div>
                    <div class="flex gap-3 flex-wrap">
                        <a href="/contact/" class="btn-primary">Share your requirement</a>
                        <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="btn-outline">WhatsApp</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generate404() {
  return headTag({
    title: '404 — Page Not Found | Moldart',
    desc: 'This page could not be found.',
    canonical: '/404.html',
    noindex: true,
    schemas: []
  }) + '\n' + nav('404') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-24 text-center">
            <h1 class="page-heading mb-6">404.</h1>
            <p class="text-base text-zinc-500 mb-8">This page could not be found.</p>
            <div class="flex gap-4 justify-center flex-wrap">
                <a href="/" class="btn-primary">Go Home</a>
                <a href="/solutions/" class="btn-outline">View Solutions</a>
                <a href="/contact/" class="btn-outline">Share your requirement</a>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generatePageRedirect(target, title, label, noindex = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    ${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
    <meta http-equiv="refresh" content="0;url=${target}">
    <link rel="canonical" href="${SITE}${target}">
    <title>${escHtml(title)}</title>
</head>
<body>
    <p>This page has moved. <a href="${target}">${escHtml(label)}</a>.</p>
</body>
</html>`;
}

function generateIndustryRedirect() {
  return generatePageRedirect('/solutions/', 'Redirecting to Solutions — Moldart', 'Explore solutions');
}

function generateInsightRedirect(slug) {
  return generatePageRedirect('/insights/', 'Redirecting to Insights — Moldart', 'Open the current insights library', true);
}

// ============================================================
// INSIGHTS
// ============================================================
// ============================================================
// INSIGHTS
// ============================================================
function extractArticleHeadings(md) {
  return String(md || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (!match) return null;
      const text = stripMarkdownInline(match[2]);
      return { level: match[1].length, text, id: slugify(text) };
    })
    .filter(Boolean);
}

function extractHtmlHeadings(html = '') {
  const headings = [];
  const regex = /<h([23])(?:[^>]*id="([^"]+)")?[^>]*>([\s\S]*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(String(html || '')))) {
    const text = String(match[3] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    headings.push({ level: Number(match[1]), text, id: match[2] || slugify(text) });
  }
  return headings;
}

function markdownToHtml(md) {
  const source = String(md || '').replace(/\r/g, '');
  const lines = source.split('\n');
  const html = [];
  let listMode = null;

  const formatInline = (value) => escHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  const closeList = () => {
    if (listMode === 'ul') html.push('</ul>');
    if (listMode === 'ol') html.push('</ol>');
    listMode = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = raw.trim();

    if (!line) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length === 2 ? 'h2' : 'h3';
      const id = slugify(stripMarkdownInline(heading[2]));
      html.push(`<${level} id="${id}">${formatInline(heading[2])}</${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.*)$/);
    if (unordered) {
      if (listMode !== 'ul') {
        closeList();
        html.push('<ul>');
        listMode = 'ul';
      }
      html.push(`<li>${formatInline(unordered[1])}</li>`);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      if (listMode !== 'ol') {
        closeList();
        html.push('<ol>');
        listMode = 'ol';
      }
      html.push(`<li>${formatInline(ordered[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return html.join('\n');
}


function generateInsightsHub() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Insights' }]);
  const articles = rawInsights.articles;
  const editorialArticles = rawInsights.editorial;
  const generatedArticles = rawInsights.generated;
  const categories = [...new Set(editorialArticles.map((a) => a.categoryLabel))];
  const [featuredArticle, ...otherArticles] = editorialArticles;
  const productRouteCount = [...new Set(generatedArticles.map((article) => article.category))].length;

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/insights/#webpage', url: SITE + '/insights/', name: 'Insights — Technical Guides & Notes | Moldart', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const topicMeta = {
    'Lamination Tooling': { icon: 'layers', intro: 'Press plates, press pads, cylinders, and decor-paper decisions for running laminate lines.' },
    'Industrial Tooling': { icon: 'shield', intro: 'Tolerance-led guidance for PCB, CCL, and other more demanding technical laminate routes.' },
    'Decorative Steel': { icon: 'spark', intro: 'Grades, finish approvals, profiles, and decorative stainless programmes for interiors.' },
    'Panel Systems': { icon: 'factory', intro: 'Substrate, panel, and formwork notes for plywood, fiberboard, OSB, and particleboard.' },
    'Flooring Systems': { icon: 'compass', intro: 'Wear class, core build, and accessory coordination for flooring-led programmes.' },
    'Furniture Programmes': { icon: 'building', intro: 'Procurement, briefing, and approval guidance for ready-made and custom furniture work.' }
  };

  const filterBtns = `<div class="insights-filter-row"><button class="insights-filter-btn is-active" data-filter="all">All</button>${categories.map((c) => `<button class="insights-filter-btn" data-filter="${c}">${c}</button>`).join('')}</div>`;
  const topicCards = categories.map((category) => {
    const categoryArticles = articles.filter((article) => article.categoryLabel === category);
    const meta = topicMeta[category] || { icon: 'book', intro: 'Guides and notes grouped by category.' };
    const formats = [...new Set(categoryArticles.map((article) => article.type.replace('Verified ', '')))].slice(0, 4).join(' · ');
    return `<article class="ui-topic-card"><div class="ui-topic-card-head"><div class="ui-kicker mb-3">${glyph(meta.icon, 'icon icon-sm')} ${escHtml(category)}</div><span class="ui-resource-count">${categoryArticles.length}</span></div><p class="ui-topic-copy">${escHtml(meta.intro)}</p><div class="ui-meta-inline mt-4"><span>${escHtml(formats)}</span></div></article>`;
  }).join('');
  const featureHtml = featuredArticle ? `<a href="/insights/${featuredArticle.slug}/" class="ui-insight-feature insight-card" data-category="${escHtml(featuredArticle.categoryLabel)}">${renderInsightCardMedia(featuredArticle)}<div class="ui-insight-card-body"><div class="ui-kicker mb-3">${glyph('spark', 'icon icon-sm')} Start here</div><div class="font-display font-black text-3xl mb-3" style="line-height:1.05;">${escHtml(featuredArticle.title)}</div><p class="text-sm text-zinc-500 leading-relaxed mb-6">${escHtml(featuredArticle.excerpt)}</p><div class="ui-meta-inline"><span>${escHtml(featuredArticle.type)}</span><span>${escHtml(featuredArticle.categoryLabel)}</span><span>${escHtml(articleDateLabel(featuredArticle))}</span></div></div></a>` : '';
  const cardsHtml = otherArticles.map((article) => `<a href="/insights/${article.slug}/" class="ui-insight-card insight-card" data-category="${escHtml(article.categoryLabel)}">${renderInsightCardMedia(article)}<div class="ui-insight-card-body"><div class="ui-kicker mb-3">${glyph('book', 'icon icon-sm')} ${escHtml(article.type)}</div><div class="font-display font-bold text-xl mb-3" style="line-height:1.25;">${escHtml(article.title)}</div><p class="text-sm text-zinc-500 leading-relaxed">${escHtml(article.excerpt)}</p><div class="ui-meta-inline mt-5"><span>${escHtml(article.categoryLabel)}</span><span>${escHtml(articleDateLabel(article))}</span></div></div></a>`).join('');
  const technicalReferenceHtml = portfolioFamilies.map((family, familyIndex) => {
    const productRows = family.products.map((productId) => {
      const product = getProduct(productId);
      const meta = getMeta(productId);
      const productArticles = generatedArticles.filter((article) => article.category === productId);
      if (!product || !meta || !productArticles.length) return '';
      const leadGuide = productArticles.find((article) => article.type === 'Technical Guide') || productArticles[0];
      return `<article class="ui-route-product-row"><div class="ui-route-product-copy"><h3>${escHtml(product.name)}</h3><p>${escHtml(product.summary)}</p><div class="ui-route-product-meta">${product.specs.slice(0, 2).map((spec) => `<span>${escHtml(spec)}</span>`).join('')}<span>${productArticles.length} route pages</span></div></div><div class="ui-route-product-actions"><a href="/insights/${leadGuide.slug}/" class="btn-outline">Open technical guide</a><a href="/products/${meta.slug}/" class="btn-outline">Open product sheet</a></div></article>`;
    }).filter(Boolean).join('');
    if (!productRows) return '';
    return `<details class="ui-route-directory"${familyIndex === 0 ? ' open' : ''}><summary><div class="ui-route-directory-summary"><div><div class="ui-kicker mb-3">${glyph(familyIconName(family.title), 'icon icon-sm')} ${escHtml(family.title)}</div><h3 class="ui-family-title" style="font-size:1.25rem;">${escHtml(family.highlights[0])}</h3><p class="ui-route-directory-intro">${escHtml(family.intro)}</p></div><span class="ui-route-directory-count">${family.products.length}</span></div></summary><div class="ui-route-directory-body">${productRows}</div></details>`;
  }).filter(Boolean).join('');

  return headTag({
    title: 'Insights — Technical Guides & Notes | Moldart',
    desc: 'Technical guides and notes for buyers, procurement teams, project stakeholders, and production teams across Moldart product systems.',
    canonical: '/insights/',
    ogImage: siteSocialPosterRelativePath('moldart-insights'),
    ogImageAlt: 'Moldart insights overview',
    schemas
  }) + '\n' + nav('insights') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph('spark', 'icon icon-sm')} Technical Guides & Notes</div>
                    <h1 class="ui-section-title">DEEPER TECHNICAL<br>GUIDANCE FOR BUYERS.</h1>
                    <p class="ui-section-subtitle">Start with the edited guides below. When the brief narrows, each product route opens into tighter specification, RFQ, quality, and receiving notes without overwhelming the first read.</p>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Total coverage</div><div class="ui-proof-value">${articles.length} live pages</div><p class="ui-proof-copy">Edited guides and route-specific technical pages sit inside one searchable library.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Editorial guides</div><div class="ui-proof-value">${editorialArticles.length}</div><p class="ui-proof-copy">Longer-form articles designed to stay readable, shareable, and commercially useful.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Product routes</div><div class="ui-proof-value">${productRouteCount}</div><p class="ui-proof-copy">Each route opens into focused specification, buyer, quality, and comparison reading when needed.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-12">
            <div class="ui-topic-grid">${topicCards}</div>
        </section>

        <section class="max-w mx-auto px pb-12 border-b border-zinc-100">
            <div class="ui-kicker mb-4">${glyph('book', 'icon icon-sm')} Editorial insights</div>
            ${filterBtns}
            <div class="ui-insight-grid" id="insights-grid">
                ${featureHtml}
                ${cardsHtml}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph('layers', 'icon icon-sm')} Secondary route library</div>
                <h2 class="ui-section-title">OPEN THE ROUTE LIBRARY<br>ONLY WHEN THE BRIEF TIGHTENS.</h2>
                <p class="ui-section-subtitle">This layer stays secondary on purpose. Start with the edited guides above. Open the route library below only when the work becomes specification-led, RFQ-led, receiving-led, or quality-led.</p>
            </div>
            <div class="ui-route-directory-stack">${technicalReferenceHtml}</div>
        </section>
        ${ctaBlock('NEED SPECIFIC<br>GUIDANCE?', 'Use a guide as the starting point, then send the actual requirement for a product-aligned review.', 'Share your requirement', '/contact/', 'Open Resources', '/resources/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}


function generateInsightArticle(article) {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Insights', url: '/insights/' }, { name: article.title.length > 50 ? article.title.substring(0, 47) + '...' : article.title }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, author: { '@type': 'Organization', name: 'Moldart' }, datePublished: article.date, publisher: { '@type': 'Organization', name: 'Moldart', url: SITE } },
    bc.schema
  ];

  const contentHtml = renderInsightArticleBody(article);
  const context = articleProductContext(article);
  const readTime = estimateReadTime(article, contentHtml);
  const audiences = articleAudienceFor(article);
  const headings = extractHtmlHeadings(contentHtml);
  const relatedSolutions = relatedSolutionsForProduct(article.category);
  const routeArticles = context
    ? rawInsights.generated.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 5)
    : [];
  const tocHtml = headings.length ? `<div class="insight-side-card mb-4"><div class="insight-side-label mb-2">In this guide</div>${headings.map((heading) => `<a href="#${heading.id}" class="article-toc-link${heading.level === 3 ? ' is-sub' : ''}">${escHtml(heading.text)}</a>`).join('')}</div>` : '';
  const insightSidebar = `
      <aside class="insight-side-panel">
          ${tocHtml}
          ${context ? `<div class="insight-side-card mb-4"><div class="insight-side-label">Product</div><div class="insight-side-value">${escHtml(context.product.name)}</div></div>` : ''}
          ${routeArticles.length ? `<div class="insight-side-card mb-4"><div class="insight-side-label mb-2">More in this product route</div>${routeArticles.map((item) => `<a href="/insights/${item.slug}/" class="article-toc-link">${escHtml(item.type)}</a>`).join('')}</div>` : ''}
          ${relatedSolutions.length ? `<div class="insight-side-card mb-4"><div class="insight-side-label mb-2">Related solutions</div>${relatedSolutions.map((app) => `<a href="${getSolutionHref(app.slug)}" class="article-toc-link">${escHtml(app.name)}</a>`).join('')}</div>` : ''}
          <div class="insight-side-card mb-4"><div class="insight-side-label">Approx. reading time</div><div class="insight-side-value">${escHtml(readTime)}</div></div>
          ${context ? `<div class="insight-side-card"><div class="insight-side-label mb-3">Reference downloads</div><div class="flex flex-col gap-2">${context.meta.downloads.slice(0, 3).map((download) => downloadLink(download)).join('')}</div></div>` : ''}
      </aside>`;

  const articleOgImage = insightPosterRelativePath(article, 'png');

  return headTag({
    title: `${article.title} | Moldart Insights`,
    desc: article.excerpt.substring(0, 155),
    canonical: `/insights/${article.slug}/`,
    ogImage: articleOgImage,
    ogImageAlt: `${article.title} — Moldart insight`,
    schemas
  }) + '\n' + nav('insights') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-8"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">${escHtml(article.categoryLabel)} · ${escHtml(article.type)}</span></div>
            <h1 class="page-heading" style="font-size:clamp(1.8rem,4vw,3rem);line-height:.95;">${escHtml(article.title)}</h1>
            <div class="flex items-center gap-4 mt-6 text-sm text-zinc-500">
                <span>${escHtml(articleDateLabel(article))}</span>
                <span>·</span>
                <span>${escHtml(readTime)}</span>
                <span>·</span>
                <span>${escHtml(article.author)}</span>
            </div>
            <p class="text-base text-zinc-500 font-light max-w-3xl leading-relaxed mt-6">${escHtml(article.excerpt)}</p>
            <div class="ui-chip-row mt-6">
                <span class="ui-chip">${glyph(article.categoryLabel === 'Lamination Tooling' ? 'layers' : article.categoryLabel === 'Industrial Tooling' ? 'shield' : article.categoryLabel === 'Decorative Steel' ? 'spark' : article.categoryLabel === 'Panel Systems' ? 'factory' : article.categoryLabel === 'Flooring Systems' ? 'compass' : 'building', 'icon icon-sm')} ${escHtml(article.categoryLabel)}</span>
                ${audiences.map((item) => `<span class="ui-chip">${glyph('check', 'icon icon-sm')} ${escHtml(item)}</span>`).join('')}
            </div>
            ${renderInsightSignalStrip(article, context)}
        </section>
        <section class="max-w mx-auto px py-12">
            <div class="insight-layout">
                <div class="insight-article">
                    ${renderShareBar(article.title, `/insights/${article.slug}/`)}
                    ${contentHtml}
                </div>
                ${insightSidebar}
            </div>
        </section>
        <section class="max-w mx-auto px py-16 border-t border-zinc-100 fade-up">
            <div class="article-end-rail">
                <article class="article-end-card">
                    <div class="article-end-label">Explore more</div>
                    <h2>Back to insights</h2>
                    <p>Return to the wider library of edited guides, route notes, and secondary technical references.</p>
                    <a href="/insights/" class="btn-outline">Open insights</a>
                </article>
                <article class="article-end-card article-end-card-primary">
                    <div class="article-end-label">Next step</div>
                    <h2>Share the actual requirement</h2>
                    <p>Use ${escHtml(context?.product?.name || article.categoryLabel)} only as the starting point. The brief, reference, quantity, timing, and destination make the next review faster.</p>
                    <a href="/contact/?product=${encodeURIComponent(context?.product?.name || article.category)}" class="btn-primary">Share your requirement</a>
                </article>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}

// ============================================================
// SITEMAP, ROBOTS, REDIRECTS
// ============================================================
// ============================================================
// SITEMAP, ROBOTS, REDIRECTS
// ============================================================
function generateSitemap() {
  const pages = [
    { url: '/', priority: '1.0', freq: 'monthly' },
    { url: '/explore/', priority: '0.8', freq: 'weekly' },
    { url: '/solutions/', priority: '0.9', freq: 'weekly' },
    { url: '/about/', priority: '0.8', freq: 'monthly' },
    { url: '/insights/', priority: '0.8', freq: 'weekly' },
    { url: '/resources/', priority: '0.7', freq: 'monthly' },
    { url: '/contact/', priority: '0.8', freq: 'monthly' },
    { url: '/faq/', priority: '0.6', freq: 'monthly' },
    { url: '/process/', priority: '0.7', freq: 'monthly' }
  ];
  for (const pid of Object.keys(productMeta)) {
    const m = productMeta[pid];
    pages.push({ url: `/products/${m.slug}/`, priority: '0.7', freq: 'monthly' });
  }
  for (const app of applications) {
    pages.push({ url: getSolutionHref(app.slug), priority: '0.7', freq: 'monthly' });
  }
  for (const article of rawInsights.articles) {
    pages.push({ url: `/insights/${article.slug}/`, priority: '0.5', freq: 'monthly' });
  }

  const urls = pages.map(p => `  <url><loc>${SITE}${p.url}</loc><lastmod>${NOW}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}


function generateRobots() {
  return `User-agent: *
Allow: /
Disallow: /data/
Disallow: /sw.js
Disallow: /offline.html
Disallow: /login/
Disallow: /.tmp/

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/sitemap-images.xml`;
}

function generateLlmsTxt() {
  return `# Moldart

## Primary Pages
- Home: ${SITE}/
- Solutions: ${SITE}/solutions/
- Resources: ${SITE}/resources/
- Insights: ${SITE}/insights/
- Contact: ${SITE}/contact/
- About: ${SITE}/about/

## Key Topics
- Solution systems and product stacks
- Product sheets and technical references
- Technical guides, buyer notes, and comparison articles
- Downloadable catalogues, finish decks, and PDFs
`;
}

function generateLlmsFullTxt() {
  const productLines = Object.keys(productMeta).map((pid) => `- ${getProduct(pid)?.name}: ${SITE}/products/${productMeta[pid].slug}/`).join('\n');
  const solutionLines = applications.map((app) => `- ${app.name}: ${SITE}${getSolutionHref(app.slug)}`).join('\n');
  return `# Moldart Full Index

## Pages
- ${SITE}/
- ${SITE}/solutions/
- ${SITE}/resources/
- ${SITE}/insights/
- ${SITE}/contact/
- ${SITE}/about/

## Solutions
${solutionLines}

## Products
${productLines}
`;
}

function generateRedirects() {
  return `/index.html               /                         301
/about.html               /about/                   301
/industry.html            /industry/                301
/contact.html             /contact/                 301
/login.html               /login/                   301
/about                    /about/                   301
/industry                 /solutions/               301
/industry/                /solutions/               301
/contact                  /contact/                 301
/login                    /login/                   301
/explore                  /explore/                 301
/solutions                /solutions/               301
/products                 /solutions/               301
/products/                /solutions/               301
/applications             /solutions/               301
/applications/            /solutions/               301
/applications/*           /solutions/:splat/        301
/resources                /resources/               301
/faq                      /faq/                     301
/process                  /process/                 301
/insights                 /insights/                301
/*                        /404.html                 404`;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('=== Moldart Page Generator ===\n');

  console.log('Generating social preview assets...');
  await generateSiteSocialAssets();
  await generateInsightPosterAssets();

  console.log('\nGenerating core pages...');
  writeFile(path.join(WORK, 'index.html'), generateHomepage());
  writeFile(path.join(WORK, 'explore/index.html'), generateExplorePage());
  writeFile(path.join(WORK, 'about/index.html'), generateAboutPage());
  writeFile(path.join(WORK, 'contact/index.html'), generateContactPage());
  writeFile(path.join(WORK, 'login/index.html'), generateLoginPage());
  writeFile(path.join(WORK, '404.html'), generate404());

  console.log('\nGenerating solution pages...');
  writeFile(path.join(WORK, 'solutions/index.html'), generateSolutionsHub());
  for (const app of applications) {
    writeFile(path.join(WORK, `solutions/${app.slug}/index.html`), generateSolutionPage(app));
  }

  console.log('\nGenerating product pages...');
  writeFile(path.join(WORK, 'products/index.html'), generateProductsHub());
  for (const pid of Object.keys(productMeta)) {
    const m = productMeta[pid];
    writeFile(path.join(WORK, `products/${m.slug}/index.html`), generateProductPage(pid));
  }

  console.log('\nGenerating legacy application redirects...');
  writeFile(path.join(WORK, 'applications/index.html'), generateApplicationsHub());
  for (const app of applications) {
    writeFile(path.join(WORK, `applications/${app.slug}/index.html`), generateApplicationPage(app));
  }

  console.log('\nGenerating utility pages...');
  writeFile(path.join(WORK, 'resources/index.html'), generateResourcesPage());
  writeFile(path.join(WORK, 'faq/index.html'), generateFAQPage());
  writeFile(path.join(WORK, 'process/index.html'), generateProcessPage());

  console.log('\nGenerating insights pages...');
  writeFile(path.join(WORK, 'insights/index.html'), generateInsightsHub());
  for (const article of rawInsights.articles) {
    writeFile(path.join(WORK, `insights/${article.slug}/index.html`), generateInsightArticle(article));
  }
  const currentInsightSlugs = getInsightSlugs();
  const insightsDir = path.join(WORK, 'insights');
  if (fs.existsSync(insightsDir)) {
    for (const entry of fs.readdirSync(insightsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !currentInsightSlugs.has(entry.name)) {
        writeFile(path.join(insightsDir, entry.name, 'index.html'), generateInsightRedirect(entry.name));
      }
    }
  }

  writeFile(path.join(WORK, 'industry/index.html'), generateIndustryRedirect());

  console.log('\nGenerating search index...');
  writeFile(path.join(WORK, 'data/search-index.json'), JSON.stringify(getSearchEntries()));

  console.log('\nGenerating config files...');
  writeFile(path.join(WORK, 'sitemap.xml'), generateSitemap());
  writeFile(path.join(WORK, 'robots.txt'), generateRobots());
  writeFile(path.join(WORK, 'llms.txt'), generateLlmsTxt());
  writeFile(path.join(WORK, 'llms-full.txt'), generateLlmsFullTxt());
  writeFile(path.join(WORK, '_redirects'), generateRedirects());

  const totalPages = 6 + (1 + applications.length) + (1 + Object.keys(productMeta).length) + (1 + applications.length) + 3 + 1 + 1 + rawInsights.articles.length;
  console.log(`\n=== Generated ${totalPages} pages ===`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
