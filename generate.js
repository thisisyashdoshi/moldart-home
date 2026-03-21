#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const WORK = __dirname;
const SITE = 'https://moldartindia.com';
const NOW = new Date().toISOString().split('T')[0];
const VER = '2026.14';

// ============================================================
// READ EXISTING DATA
// ============================================================
const rawProducts = JSON.parse(fs.readFileSync(path.join(WORK, 'data/product-directory.json'), 'utf8'));
const rawFaq = JSON.parse(fs.readFileSync(path.join(WORK, 'data/faq.json'), 'utf8'));

// ============================================================
// EXTENDED PRODUCT METADATA
// ============================================================
const productMeta = {
  'press-plates': {
    slug: 'press-plates',
    seoTitle: 'Press Plates Supplier | Lamination Press Plates — Moldart India',
    metaDesc: 'Lamination press plates in SS 304, SS 420, SS 630, and SS 633 grades. Custom surface patterns and chrome specifications for decorative laminate manufacturing.',
    overview: 'Moldart supplies surface-critical press plates engineered for texture fidelity, wear resistance, and repeatable finish quality in decorative laminate production. Available in multiple stainless steel grades with custom chrome surface specifications, these plates are a core tooling component in short-cycle and multi-daylight lamination presses.',
    workflow: 'Press plates are the tooling surface in lamination presses. They transfer texture and finish to laminate surfaces during the pressing cycle, making them critical to final product quality.',
    commercialNotes: 'Available in 1S and 2S configurations. Custom surface patterns and chrome thickness (μm) specifications supported. Grades range from SS 304 for standard use to SS 633 for high-performance applications requiring superior hardness.',
    relatedProducts: ['press-pads', 'engraved-cylinders', 'industrial-press-plates'],
    relatedApps: ['lamination', 'furniture'],
    downloads: [
      { title: 'Press Plate — Basic Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { title: 'Press Plate — Texture Collection', url: '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf' },
      { title: 'Press Plate — Shuttering Plywood', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' }
    ]
  },
  'press-pads': {
    slug: 'press-pads',
    seoTitle: 'Press Pads Supplier | Silicone-Copper Lamination Pads — Moldart India',
    metaDesc: 'Silicone-copper composite press pads for uniform heat transfer and pressure distribution in lamination. Up to 100,000 cycles. Maximum width 3300 mm.',
    overview: 'Moldart supplies silicone-copper composite press pads engineered for uniform heat transfer and reliable pressure distribution across the full press area. Designed for high-volume lamination environments, these pads support consistent output quality over extended production cycles.',
    workflow: 'Press pads sit between the heating platen and the press plate in lamination presses. They ensure even heat and pressure distribution, which directly affects surface quality and lamination bond strength.',
    commercialNotes: 'Rated for approximately 80,000–100,000 pressing cycles. Maximum width of 3300 mm. Widths and construction can be aligned to specific press line requirements.',
    relatedProducts: ['press-plates', 'engraved-cylinders'],
    relatedApps: ['lamination'],
    downloads: [
      { title: 'Introduction to Moldart', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
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
      { title: 'Gravure Cylinder & Printed Decor Paper', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf' }
    ]
  },
  'decor-paper': {
    slug: 'printed-decor-paper',
    seoTitle: 'Printed Decor Paper Supplier | Melamine Decor Paper — Moldart India',
    metaDesc: 'Melamine-ready printed decor papers at 60–85 GSM with wet tensile over 6N. Woodgrain and custom patterns for decorative laminates, flooring, and furniture.',
    overview: 'Moldart supplies melamine-ready decor papers designed for stable print quality and production consistency across decorative laminate, flooring, and furniture applications. Available in woodgrain and custom pattern options with reliable impregnation compatibility.',
    workflow: 'Printed decor paper is the decorative surface layer in laminated panels. After printing, the paper is impregnated with melamine resin and pressed onto substrate boards to create the finished decorative surface.',
    commercialNotes: 'Weight range: 60–85 GSM. Wet tensile strength over 6N. Compatible with standard melamine impregnation lines. Design, finish, and decor coordination supported.',
    relatedProducts: ['engraved-cylinders', 'fiberboard', 'plywood'],
    relatedApps: ['lamination', 'furniture'],
    downloads: [
      { title: 'Gravure Cylinder & Printed Decor Paper', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf' },
      { title: 'LPL — GB Collection', url: '/downloads/LPL - GB - 01.pdf' },
      { title: 'HPL — OL Collection 1', url: '/downloads/HPL - OL - 1.pdf' }
    ]
  },
  'plywood': {
    slug: 'plywood',
    seoTitle: 'Plywood Supplier | Structural & Furniture-Grade Plywood — Moldart India',
    metaDesc: 'Structural and furniture-grade plywood at 500–700 kg/m³ density, 3–40 mm thickness. High shear strength for furniture, interiors, and architectural panels.',
    overview: 'Moldart supplies structural and furniture-grade plywood engineered for high-strength panel applications. With controlled density profiles and reliable shear strength, these panels serve as core substrates in furniture manufacturing, interior fit-outs, and architectural panel systems.',
    workflow: 'Plywood is a cross-laminated wood panel used as a structural substrate. It is commonly laminated with decorative surfaces or used as-is in load-bearing and furniture carcass applications.',
    commercialNotes: 'Density: 500–700 kg/m³. Thickness range: 3–40 mm. Shear strength ≥ 1.5 MPa. Core build-up and thickness can be aligned to project needs.',
    relatedProducts: ['fiberboard', 'particleboard', 'osb'],
    relatedApps: ['furniture', 'architecture'],
    downloads: [
      { title: 'Press Plate — Shuttering Plywood', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' },
      { title: 'Introduction to Moldart', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'fiberboard': {
    slug: 'fiberboard',
    seoTitle: 'Fiberboard Supplier | MDF & HDF Panels — Moldart India',
    metaDesc: 'MDF (700–820 kg/m³) and HDF (780–900 kg/m³) panels. EU E1, TSCA Title VI, Japan F4 star compliant. Moisture-resistant grades available for flooring and furniture.',
    overview: 'Moldart supplies MDF and HDF engineered panels with exceptionally smooth surfaces suited for high-gloss lamination, painting, and precision conversion. Available in multiple density profiles and emission standards to match destination market requirements.',
    workflow: 'Fiberboard panels serve as the core substrate in laminated furniture fronts, door skins, decorative panel systems, and flooring cores. Their smooth surface is critical for high-quality surface finishing.',
    commercialNotes: 'MDF density: 700–820 kg/m³. HDF density: 780–900 kg/m³. Compliant with EU E1, TSCA Title VI, and Japan F4 star standards. Moisture Resistant (MR) grades available.',
    relatedProducts: ['plywood', 'particleboard', 'wood-flooring'],
    relatedApps: ['furniture', 'flooring', 'architecture'],
    downloads: [
      { title: 'Introduction to Moldart', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'osb': {
    slug: 'osb',
    seoTitle: 'OSB Supplier | Oriented Strand Board — Moldart India',
    metaDesc: 'OSB/3 and Fine OSB panels. ENF grade (No Added Formaldehyde), CARB-NAF & EPA-NAF certified, FSC certified, Japan F4 star. Structural and load-bearing use.',
    overview: 'Moldart supplies high-strength oriented strand board compliant with EN 13986 and EN 300 standards. Available in OSB/3 and Fine OSB (F-OSB) grades, these panels are engineered for structural, load-bearing, and heavy-duty industrial applications.',
    workflow: 'OSB is a structural engineered wood panel used in construction, packaging, and furniture frameworks. Its oriented strand structure provides exceptional load-bearing performance.',
    commercialNotes: 'ENF grade (No Added Formaldehyde). CARB-NAF & EPA-NAF certified. FSC certified and Japan F4 star (JAS) compliant. Available in 6mm, 9mm, 15mm, and custom cut-to-size formats.',
    relatedProducts: ['plywood', 'particleboard', 'fiberboard'],
    relatedApps: ['architecture', 'furniture'],
    downloads: [
      { title: 'Introduction to Moldart', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'particleboard': {
    slug: 'particleboard',
    seoTitle: 'Particleboard Supplier | Commercial Furniture-Grade Panels — Moldart India',
    metaDesc: 'Particleboard panels at 650–760 kg/m³, 9–38 mm thickness. E1, TSCA Title VI, Japan F4 star compliant. MR and EN 312 P6 grades for furniture and cabinetry.',
    overview: 'Moldart supplies cost-effective, highly workable particleboard cores engineered for commercial furniture manufacturing. With reliable density profiles and multiple emission compliance options, these panels serve the core needs of office furniture, cabinetry, and shelving production.',
    workflow: 'Particleboard is used as the core substrate in laminated furniture panels, cabinetry, and shelving. It is typically faced with melamine, HPL, or veneer finishes before use in final products.',
    commercialNotes: 'Density: 650–760 kg/m³. Thickness: 9–38 mm. Compliant with E1, TSCA Title VI, and Japan F4 star. MR and EN 312 P6 grades available. Custom thicknesses supported.',
    relatedProducts: ['plywood', 'fiberboard', 'osb'],
    relatedApps: ['furniture'],
    downloads: [
      { title: 'Introduction to Moldart', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  'wood-flooring': {
    slug: 'wood-flooring',
    seoTitle: 'Engineered Wood Flooring Supplier | Laminate Flooring — Moldart India',
    metaDesc: 'Engineered laminate flooring systems compliant with EN 13329. Wear class AC3–AC5. HDF E1 or Hydro HDF core. Unilin/Valinge click-lock. EIR deep emboss available.',
    overview: 'Moldart supplies engineered flooring systems compliant with EN 13329 standards, focused on wear resistance and dimensional stability. Available with multiple core options, wear classes, and surface finishes including Embossed-in-Register (EIR) for authentic woodgrain texture.',
    workflow: 'Engineered wood flooring consists of a decorative surface layer bonded to an HDF core with integrated click-lock profiles. It is installed as a floating floor system over prepared subfloors in residential and commercial spaces.',
    commercialNotes: 'HDF E1 or Hydro HDF (water-resistant) core. Wear class: AC3–AC5 (Class 31–33). Embossed, Woodgrain, or EIR finishes. Precision Unilin/Valinge click-lock profiles. Full accessory coordination available.',
    relatedProducts: ['flooring-accessories', 'fiberboard'],
    relatedApps: ['flooring', 'architecture'],
    downloads: [
      { title: 'Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  'flooring-accessories': {
    slug: 'flooring-accessories',
    seoTitle: 'Flooring Accessories | Transition Profiles & Skirting — Moldart India',
    metaDesc: 'Coordinated flooring transition profiles, skirting, and stair nosing in aluminium, MDF, or PVC. Custom matched to floor decor for complete installations.',
    overview: 'Moldart supplies coordinated transition profiles, skirting, and stair nosing designed to complete laminate flooring installations. Available in aluminium, MDF, or PVC base materials with durable wear surfaces matched to the installed floor decor.',
    workflow: 'Flooring accessories are the finishing components installed alongside laminate flooring. They cover expansion gaps, transitions between rooms, wall-to-floor junctions, and staircase edges.',
    commercialNotes: 'Profile types include T-bar, End cap, and Stair nosing. Base materials: Aluminium, MDF, or PVC. Profiles can be custom matched to any specific floor decor.',
    relatedProducts: ['wood-flooring'],
    relatedApps: ['flooring'],
    downloads: [
      { title: 'Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  'ready-made-furniture': {
    slug: 'ready-made-furniture',
    seoTitle: 'Ready-Made Furniture Supplier | Modular Furniture — Moldart India',
    metaDesc: 'Precision-manufactured modular furniture with melamine or HPL facing. CNC precision within 0.1 mm. Scratch resistance over 3N. Flat-pack or assembled delivery.',
    overview: 'Moldart supplies precision-manufactured modular furniture components and assemblies for commercial and residential use. Built with CNC accuracy and durable surface finishes, these products serve office, kitchen, and wardrobe applications.',
    workflow: 'Ready-made furniture is manufactured from engineered wood substrates faced with melamine or HPL, then precision-cut and edge-banded before assembly or flat-pack dispatch.',
    commercialNotes: 'Melamine or HPL faced surfaces. Scratch resistance over 3N. CNC precision within 0.1 mm. PVC/ABS edging 0.4–2.0 mm. Flat-pack or assembled delivery based on project requirements.',
    relatedProducts: ['custom-furniture', 'plywood', 'fiberboard'],
    relatedApps: ['furniture'],
    downloads: [
      { title: 'Furniture Catalog 1', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Catalog 2', url: '/downloads/WOOD - FURNITURE - 2.pdf' }
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
      { title: 'Furniture Catalog 1', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Catalog 3', url: '/downloads/WOOD - FURNITURE - 3.pdf' }
    ]
  },
  'decorative-panels': {
    slug: 'decorative-ss-panels',
    seoTitle: 'Decorative Stainless Steel Panels | PVD SS Sheets — Moldart India',
    metaDesc: 'Premium decorative stainless steel panels in SS 304 and SS 316L. PVD finishes: Gold, Rose Gold, Black, Bronze. Hairline, Mirror, Etched, Embossed surfaces.',
    overview: 'Moldart supplies premium decorative stainless steel panels with an extensive range of surface finishes and PVD color profiles for high-end architectural and interior applications. Available in SS 304 and SS 316L grades with optional anti-fingerprint coating.',
    workflow: 'Decorative SS panels are used as wall cladding, elevator cabin interiors, retail displays, and architectural accent surfaces. They are cut to size, finished with the specified surface treatment and PVD color, then installed.',
    commercialNotes: 'Grades: SS 304, SS 316L (on request). Surface finishes: Hairline, Mirror No.8, Vibration, Bead Blast, Etched, Embossed (5WL). PVD colors: Gold, Rose Gold, Black, Bronze, Champagne. Optional Anti-Fingerprint (AFP) coating. Custom color matching and etching patterns available.',
    relatedProducts: ['ss-profiles', 'ss-furniture'],
    relatedApps: ['architecture', 'metal-finishing'],
    downloads: [
      { title: 'Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Stamped Finishes', url: '/downloads/STAMPED.pdf' },
      { title: 'Heat Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' },
      { title: 'Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  'ss-profiles': {
    slug: 'ss-profiles',
    seoTitle: 'Stainless Steel Profiles Supplier | SS Trims & Inlays — Moldart India',
    metaDesc: 'Precision-formed SS profiles and trims in T, U, L, C, and Box types. SS 304/316 in Hairline, Mirror, and PVD finishes. Lengths up to 3000 mm.',
    overview: 'Moldart supplies precision-formed stainless steel profiles, trims, and inlays for seamless architectural transitions and edge protection. Available in multiple profile types with finishes coordinated to decorative panel specifications.',
    workflow: 'SS profiles are used as transition trims, panel edging, floor-to-wall junctions, and decorative inlays in architectural interiors. They are typically installed alongside decorative stainless steel panels.',
    commercialNotes: 'Profile types: T-Profile (Inlay), U, L, C, and Box-profiles. Finishes: Hairline, Mirror, and PVD color matched. Grades: SS 304 / 316. Length: Up to 3000 mm. Custom folding geometries and grooving available.',
    relatedProducts: ['decorative-panels', 'ss-furniture'],
    relatedApps: ['architecture'],
    downloads: [
      { title: 'Profiles Catalog', url: '/downloads/PROFILE.pdf' },
      { title: 'Divider Catalog', url: '/downloads/DIVIDER.pdf' }
    ]
  },
  'ss-furniture': {
    slug: 'ss-furniture',
    seoTitle: 'Stainless Steel Furniture | PVD-Plated Luxury Furniture — Moldart India',
    metaDesc: 'Decorative stainless steel furniture with PVD and electroplated finishes. Tables, consoles, partitions. Marble, glass, and MDF tops. Custom design support.',
    overview: 'Moldart supplies decorative stainless steel furniture with plated finishes and mixed-material top options for luxury interior environments. From tables and consoles to partitions and lobby features, each piece combines structural precision with premium surface treatment.',
    workflow: 'SS furniture is fabricated from stainless steel frames, finished with PVD or electroplating, then assembled with selected top materials (marble, glass, MDF) before delivery to site.',
    commercialNotes: 'Product types: Tables, consoles, and partitions. Finish options: PVD and electroplated. Top materials: Marble, glass, and MDF. Custom design support available.',
    relatedProducts: ['decorative-panels', 'ss-profiles'],
    relatedApps: ['architecture', 'furniture', 'metal-finishing'],
    downloads: [
      { title: 'Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Heat Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' }
    ]
  },
  'industrial-press-plates': {
    slug: 'industrial-press-plates',
    seoTitle: 'Industrial Press Plates | HPL, CCL & PCB Press Plates — Moldart India',
    metaDesc: 'Heavy-duty industrial press plates in SS 630 and SS 304 for HPL, CCL, and PCB manufacturing. Strict flatness and parallelism tolerances. Demagnetization control.',
    overview: 'Moldart supplies heavy-duty steel plates engineered for high-pressure technical laminates, copper-clad laminates (CCL), and printed circuit board (PCB) manufacturing. These plates require strict dimensional tolerances and controlled magnetic properties.',
    workflow: 'Industrial press plates are used in high-pressure presses for manufacturing technical laminates, CCL, and PCB substrates. They must maintain precise flatness, parallelism, and thermal conductivity under extreme pressing conditions.',
    commercialNotes: 'Grades: SS 630, SS 304. Strict tolerances for flatness, parallelism, and thickness. High thermal conductivity. Demagnetization (residual magnetism) control available for PCB/CCL applications. Machined to exact specifications.',
    relatedProducts: ['press-plates', 'press-pads'],
    relatedApps: ['lamination', 'pcb-ccl'],
    downloads: [
      { title: 'Press Plate — Basic Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' }
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
    seoTitle: 'Lamination Tooling & Materials Supplier — Moldart India',
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
      { title: 'Press Plate — Basic Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { title: 'Press Plate — Texture Collection', url: '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf' },
      { title: 'Gravure Cylinder & Printed Decor Paper', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf' }
    ]
  },
  {
    slug: 'furniture',
    name: 'Furniture Manufacturing',
    seoTitle: 'Furniture Materials & Components Supplier — Moldart India',
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
      { title: 'Furniture Catalog 1', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Catalog 2', url: '/downloads/WOOD - FURNITURE - 2.pdf' },
      { title: 'Furniture Catalog 3', url: '/downloads/WOOD - FURNITURE - 3.pdf' }
    ]
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    seoTitle: 'Engineered Wood Flooring & Accessories Supplier — Moldart India',
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
      { title: 'Wood Flooring Catalog', url: '/downloads/WOOD - FLOORING.pdf' }
    ]
  },
  {
    slug: 'architecture',
    name: 'Architecture & Interiors',
    seoTitle: 'Architectural Materials Supplier | Steel Panels & Wood Panels — Moldart',
    metaDesc: 'Decorative stainless steel panels, profiles, and engineered wood substrates for architectural interiors. PVD finishes, structural panels, and custom fabrication.',
    overview: 'Moldart supplies materials for architectural interior projects — from decorative stainless steel panels and profiles to engineered wood substrates and custom furniture. The portfolio serves architects, interior designers, and project contractors who need premium materials with reliable technical specifications.',
    considerations: [
      'Decorative SS panel grade selection (304 vs 316L) depends on environment and corrosion exposure',
      'PVD color consistency across batches should be confirmed for large-area installations',
      'Structural panel selection depends on load, span, and environmental conditions',
      'Custom furniture lead times depend on complexity, finish, and production scheduling',
      'Anti-fingerprint coating is recommended for high-touch architectural surfaces'
    ],
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture', 'plywood', 'fiberboard', 'osb'],
    downloads: [
      { title: 'Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Profiles Catalog', url: '/downloads/PROFILE.pdf' },
      { title: 'Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  {
    slug: 'metal-finishing',
    name: 'Metal Finishing',
    seoTitle: 'Decorative Metal Finishing | PVD Stainless Steel — Moldart India',
    metaDesc: 'PVD-coated and electroplated stainless steel panels, profiles, and furniture. Custom finishes including Gold, Rose Gold, Black, Bronze, and Champagne.',
    overview: 'Moldart supplies decorative stainless steel products with advanced surface finishing for premium interior and architectural applications. The metal finishing portfolio includes PVD coating, electroplating, etching, and embossing across panels, profiles, and furniture.',
    considerations: [
      'PVD coating provides superior durability and color consistency compared to electroplating',
      'Anti-fingerprint (AFP) coating is recommended for high-traffic surfaces',
      'Color matching across large orders requires production batch coordination',
      'Surface preparation (hairline, mirror, bead blast) affects the final PVD appearance',
      'SS 316L should be specified for marine or high-humidity environments'
    ],
    products: ['decorative-panels', 'ss-profiles', 'ss-furniture'],
    downloads: [
      { title: 'Antique Finishes', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Stamped Finishes', url: '/downloads/STAMPED.pdf' },
      { title: 'Heat Printed Finishes', url: '/downloads/HEAT PRINTED.pdf' },
      { title: 'Mosaic Finishes', url: '/downloads/MOSAIC.pdf' }
    ]
  },
  {
    slug: 'pcb-ccl',
    name: 'PCB & CCL Manufacturing',
    seoTitle: 'Press Plates for PCB & CCL Manufacturing — Moldart India',
    metaDesc: 'Industrial press plates for printed circuit board (PCB) and copper-clad laminate (CCL) manufacturing. Demagnetized plates with strict flatness and parallelism tolerances.',
    overview: 'Moldart supplies specialized industrial press plates for the PCB and CCL manufacturing sector. These plates require controlled magnetic properties, strict dimensional tolerances, and high thermal conductivity to meet the precision demands of electronic laminate production.',
    considerations: [
      'Residual magnetism must be controlled to prevent interference with electronic laminate production',
      'Flatness and parallelism tolerances are stricter than standard lamination press plates',
      'Thermal conductivity uniformity affects laminate bond quality across the press area',
      'Plate grade selection (SS 630 vs SS 304) depends on the specific pressing parameters',
      'Regular demagnetization verification may be required during production cycles'
    ],
    products: ['industrial-press-plates'],
    downloads: [
      { title: 'Press Plate — Basic Collection', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' }
    ]
  }
];

// ============================================================
// RESOURCE/DOWNLOAD GROUPS
// ============================================================
const resourceGroups = [
  {
    title: 'Company Introduction',
    items: [
      { title: 'Introduction to Moldart', desc: 'Company overview, capabilities, and product portfolio summary', url: '/downloads/INTRODUCTION TO MOLDART.pdf' }
    ]
  },
  {
    title: 'Press Plates & Tooling',
    items: [
      { title: 'Press Plate — Basic Collection', desc: 'Standard press plate patterns and specifications', url: '/downloads/PRESS PLATE - BASIC COLLECTION.pdf' },
      { title: 'Press Plate — Texture Collection', desc: 'Textured surface press plate portfolio', url: '/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf' },
      { title: 'Press Plate — Shuttering Plywood', desc: 'Press plates for shuttering plywood production', url: '/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf' }
    ]
  },
  {
    title: 'Decor & Lamination',
    items: [
      { title: 'Gravure Cylinder & Decor Paper', desc: 'Rotogravure cylinders and printed decor paper for HPL and LPL', url: '/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf' },
      { title: 'LPL — GB Collection 01', desc: 'Low-pressure laminate decor samples', url: '/downloads/LPL - GB - 01.pdf' },
      { title: 'LPL — GB Collection 02', desc: 'Low-pressure laminate decor samples', url: '/downloads/LPL - GB - 02.pdf' },
      { title: 'LPL — PET Board', desc: 'PET board laminate collection', url: '/downloads/LPL - PET BOARD.pdf' },
      { title: 'LPL — Specialty Decorative Panels', desc: 'Specialty decorative panel collection', url: '/downloads/LPL - SPECIALTY DECORATIVE PANELS.pdf' },
      { title: 'HPL — OL Collection 1', desc: 'High-pressure laminate overlay samples', url: '/downloads/HPL - OL - 1.pdf' },
      { title: 'HPL — OL Collection 2', desc: 'High-pressure laminate overlay samples', url: '/downloads/HPL - OL - 2.pdf' },
      { title: 'HPL — OL Collection 3', desc: 'High-pressure laminate overlay samples', url: '/downloads/HPL - OL - 3.pdf' },
      { title: 'HPL — OL Collection 4', desc: 'High-pressure laminate overlay samples', url: '/downloads/HPL - OL - 4.pdf' }
    ]
  },
  {
    title: 'Wood & Flooring Products',
    items: [
      { title: 'Wood Flooring', desc: 'Engineered laminate flooring systems and specifications', url: '/downloads/WOOD - FLOORING.pdf' },
      { title: 'Wood Doors', desc: 'Engineered wood door catalog', url: '/downloads/WOOD - DOOR.pdf' },
      { title: 'Furniture Catalog 1', desc: 'Modular and ready-made furniture', url: '/downloads/WOOD - FURNITURE - 1.pdf' },
      { title: 'Furniture Catalog 2', desc: 'Furniture components and assemblies', url: '/downloads/WOOD - FURNITURE - 2.pdf' },
      { title: 'Furniture Catalog 3', desc: 'Custom and project furniture', url: '/downloads/WOOD - FURNITURE - 3.pdf' }
    ]
  },
  {
    title: 'Decorative Stainless Steel',
    items: [
      { title: 'Antique Finishes', desc: 'Antique-style stainless steel surface treatments', url: '/downloads/ANTIQUE.pdf' },
      { title: 'Stamped Finishes', desc: 'Stamped pattern stainless steel panels', url: '/downloads/STAMPED.pdf' },
      { title: 'Heat Printed Finishes', desc: 'Heat transfer printed stainless steel', url: '/downloads/HEAT PRINTED.pdf' },
      { title: 'Mosaic Finishes', desc: 'Mosaic pattern stainless steel panels', url: '/downloads/MOSAIC.pdf' },
      { title: 'Profiles', desc: 'Stainless steel trim and profile catalog', url: '/downloads/PROFILE.pdf' },
      { title: 'Dividers', desc: 'Stainless steel divider and partition catalog', url: '/downloads/DIVIDER.pdf' }
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
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// CRITICAL CSS (shared across all pages)
// ============================================================
function criticalCSS() {
  return `@font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:700;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:900;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}body{font-family:'DM Sans',sans-serif;background:#fff;color:#18181b;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.5}:root{--font-display:'Montserrat',sans-serif;--font-body:'DM Sans',sans-serif;--font-mono:'Geist Mono',ui-monospace,'Cascadia Code','Source Code Pro',monospace;--radius:10px;--radius-sm:6px;--radius-md:8px;--radius-lg:12px;--radius-xl:14px;--radius-full:9999px;--shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);--transition-fast:150ms;--transition-normal:200ms}img{display:block;max-width:100%;height:auto}button{cursor:pointer;font:inherit;border:none;background:none}a{color:inherit;text-decoration:none}ul{list-style:none}.mx-auto{margin-left:auto;margin-right:auto}.max-w{max-width:80rem}.px{padding-left:1.5rem;padding-right:1.5rem}.pt-16{padding-top:4rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-24{padding-top:6rem;padding-bottom:6rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mb-10{margin-bottom:2.5rem}.mb-12{margin-bottom:3rem}.mb-14{margin-bottom:3.5rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}.mt-10{margin-top:2.5rem}.flex{display:flex}.inline-flex{display:inline-flex}.flex-col{flex-direction:column}.items-center{align-items:center}.items-start{align-items:start}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-7{gap:1.75rem}.gap-8{gap:2rem}.gap-10{gap:2.5rem}.flex-wrap{flex-wrap:wrap}.grid{display:grid}.grid-2{grid-template-columns:repeat(2,1fr)}.col-span-2{grid-column:span 2}.font-display{font-family:'Montserrat',sans-serif}.font-light{font-weight:400}.font-medium{font-weight:500}.font-bold{font-weight:700}.font-black{font-weight:900}.text-xs{font-size:.75rem;line-height:1rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.leading-relaxed{line-height:1.625}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.max-w-lg{max-width:32rem}.max-w-sm{max-width:24rem}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.text-center{text-align:center}.text-white{color:#fff}.text-zinc-300{color:#a1a1aa}.text-zinc-400{color:#a1a1aa}.text-zinc-500{color:#71717a}.text-zinc-600{color:#52525b}.text-zinc-700{color:#3f3f46}.text-zinc-900{color:#18181b}.bg-white{background:#fff}.bg-zinc-50{background:#fafafa}.bg-zinc-100{background:#f4f4f5}.border{border:1px solid #f4f4f5}.border-b{border-bottom:1px solid #f4f4f5}.border-t{border-top:1px solid #f4f4f5}.border-y{border-top:1px solid #f4f4f5;border-bottom:1px solid #f4f4f5}.border-zinc-100{border-color:#f4f4f5}.rounded-xl{border-radius:var(--radius-xl)}.rounded-lg{border-radius:var(--radius-lg)}.fixed{position:fixed}.relative{position:relative}.absolute{position:absolute}.top-0{top:0}.left-0{left:0}.right-0{right:0}.z-50{z-index:50}.z-10{z-index:10}.z-0{z-index:0}.inset-0{top:0;right:0;bottom:0;left:0}.block{display:block}.hidden{display:none}.overflow-hidden{overflow:hidden}.w-full{width:100%}.h-full{height:100%}.h-16{height:4rem}.object-cover{object-fit:cover;width:100%;height:100%}.transition-colors{transition:color .15s ease,background-color .15s ease,border-color .15s ease}.transition-opacity{transition:opacity .5s ease}.backdrop-blur{-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}.bg-white-90{background:rgba(255,255,255,0.9)}.section-label{font-family:var(--font-mono);letter-spacing:.2em;font-size:.65rem;text-transform:uppercase;color:#71717a;font-weight:500}.hero-heading{font-family:'Montserrat',sans-serif;font-weight:900;line-height:.85;letter-spacing:-.025em;color:#18181b;font-size:clamp(3.8rem,11vw,7.5rem)}.page-heading{font-family:'Montserrat',sans-serif;font-weight:900;line-height:.85;letter-spacing:-.025em;font-size:clamp(3.5rem,10vw,8rem)}.link-line{position:relative;display:inline-block}.link-line::after{content:'';position:absolute;bottom:-1px;left:0;width:0;height:1px;background:currentColor;transition:width .3s ease}.link-line:hover::after{width:100%}.nav-link{position:relative;padding-bottom:2px}.nav-link:hover{color:#18181b}.nav-link.is-active{color:#18181b;font-weight:600}.nav-link.is-active::after{content:'';position:absolute;bottom:-2px;left:0;width:100%;height:1.5px;background:#18181b;border-radius:1px}.btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;background:#18181b;color:#fff;font-size:.875rem;font-weight:500;padding:.625rem 1.25rem;transition:background-color var(--transition-fast) ease,transform var(--transition-fast) ease;border-radius:var(--radius-md)}.btn-primary:hover{background:#3f3f46}.btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;border:1px solid #e4e4e7;font-size:.875rem;font-weight:500;padding:.625rem 1.25rem;transition:all .2s ease;border-radius:var(--radius-md)}.btn-outline:hover{border-color:#18181b;background:#18181b;color:#fff}.btn-lg{padding:.875rem 2rem}.icon{width:20px;height:20px;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;fill:none;flex-shrink:0}.icon-sm{width:16px;height:16px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.sr-only:focus{position:fixed;top:.5rem;left:.5rem;z-index:200;width:auto;height:auto;clip:auto;padding:.75rem 1.25rem;background:#18181b;color:#fff;font-size:.875rem;font-weight:600;border-radius:var(--radius-md)}:focus-visible{outline:2px solid #18181b;outline-offset:2px;border-radius:2px}nav.scrolled{box-shadow:0 1px 12px rgba(0,0,0,0.06);border-bottom-color:transparent}.whatsapp-fab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:100;width:56px;height:56px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.4);transition:transform .2s ease,box-shadow .2s ease;animation:fabPulse 3s ease-in-out infinite}.whatsapp-fab svg{width:28px;height:28px;fill:#fff}@keyframes fabPulse{0%,100%{box-shadow:0 4px 16px rgba(37,211,102,0.4)}50%{box-shadow:0 4px 24px rgba(37,211,102,0.6)}}@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.fade-up{opacity:0}.fade-up.visible{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) forwards}#mob-menu{transition:max-height .35s cubic-bezier(.22,1,.36,1),opacity .3s ease,padding .3s ease;max-height:0;overflow:hidden;opacity:0;padding-top:0;padding-bottom:0}#mob-menu.open{max-height:420px;opacity:1;padding-top:1.25rem;padding-bottom:1.25rem}body.scroll-locked{overflow:hidden}.breadcrumb{display:flex;align-items:center;gap:.5rem;font-size:.75rem;margin-bottom:2rem;color:#71717a}.breadcrumb a{color:#71717a;transition:color .15s}.breadcrumb a:hover{color:#18181b}.breadcrumb-sep{color:#d4d4d8}@media(max-width:768px){.md-hidden{display:none!important}.md-show{display:flex!important}.md-grid-2,.md-grid-3,.md-grid-4{grid-template-columns:1fr}.col-span-2{grid-column:span 1}.hero-heading{font-size:clamp(2.6rem,10vw,4.5rem)}.page-heading{font-size:clamp(2.8rem,11vw,4.5rem)}.py-24{padding-top:3rem;padding-bottom:3rem}.whatsapp-fab{width:48px;height:48px;bottom:1rem;right:1rem}.whatsapp-fab svg{width:24px;height:24px}}@media(min-width:769px){.md-hidden{display:flex}.md-show{display:none!important}.md-grid-2{grid-template-columns:repeat(2,1fr)}.md-grid-3{grid-template-columns:repeat(3,1fr)}.md-grid-4{grid-template-columns:repeat(4,1fr)}.md-flex-row{flex-direction:row}.md-text-left{text-align:left}}`;
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

function headTag({ title, desc, canonical, ogType = 'website', ogImage = '/images/press_pad_new.webp', ogImageAlt = 'Moldart industrial supply', noindex = false, schemas = [], prefetch = [] }) {
  const robotsMeta = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const schemaScripts = schemas.map(s => `<script type="application/ld+json">\n    ${JSON.stringify(s)}\n    </script>`).join('\n    ');
  const prefetchLinks = prefetch.map(p => `<link rel="prefetch" href="${p}">`).join('\n    ');
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
    <meta property="og:image" content="${SITE}${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${escHtml(ogImageAlt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escHtml(title)}">
    <meta name="twitter:description" content="${escHtml(desc)}">
    <meta name="twitter:image" content="${SITE}${ogImage}">
    <meta name="theme-color" content="#18181b">
    <link rel="canonical" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="en-IN" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="x-default" href="${SITE}${canonical}">
    ${favicons()}
    <link rel="dns-prefetch" href="https://wa.me">
    <link rel="preconnect" href="https://static.cloudflareinsights.com" crossorigin>
    ${fontPreloads()}
    <style>${criticalCSS()}</style>
    <link rel="stylesheet" href="/styles.css?v=${VER}">
    <link rel="stylesheet" href="/pages.css?v=${VER}">
    ${prefetchLinks}
    ${schemaScripts}
</head>`;
}

function nav(route) {
  return `<body data-route="${route}">
    <a href="#main-content" class="sr-only">Skip to content</a>
    <nav aria-label="Main navigation" class="fixed top-0 left-0 right-0 z-50 bg-white-90 backdrop-blur border-b border-zinc-100">
        <div class="max-w mx-auto px h-16 flex items-center justify-between">
            <a href="/" class="flex items-center gap-3">
                <div class="font-display font-black text-xl" style="letter-spacing:0.15em;line-height:1;">MOLDART</div>
            </a>
            <div class="md-hidden items-center gap-7">
                <button type="button" class="cmd-k-hint" onclick="document.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', metaKey: true}))">Search <kbd>Ctrl/⌘ K</kbd></button>
                <a href="/" class="nav-link link-line text-sm font-medium text-zinc-500 transition-colors">Home</a>
                <a href="/products/" class="nav-link link-line text-sm font-medium text-zinc-500 transition-colors">Products</a>
                <a href="/applications/" class="nav-link link-line text-sm font-medium text-zinc-500 transition-colors">Applications</a>
                <a href="/about/" class="nav-link link-line text-sm font-medium text-zinc-500 transition-colors">About</a>
                <a href="/resources/" class="nav-link link-line text-sm font-medium text-zinc-500 transition-colors">Resources</a>
                <a href="/contact/" class="btn-primary" style="padding:0.625rem 1.25rem;">Contact
                    <svg class="icon icon-sm" style="margin-left:0.375rem;" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
            </div>
            <button type="button" class="md-show" style="flex-direction:column;gap:6px;padding:8px;" aria-label="Menu" aria-controls="mob-menu" id="mobile-menu-btn" aria-expanded="false">
                <span style="display:block;width:1.25rem;height:1px;background:#18181b;" aria-hidden="true"></span>
                <span style="display:block;width:1.25rem;height:1px;background:#18181b;" aria-hidden="true"></span>
                <span style="display:block;width:0.875rem;height:1px;background:#18181b;align-self:flex-end;" aria-hidden="true"></span>
            </button>
        </div>
        <div id="mob-menu" style="border-top:1px solid #f4f4f5;background:#fff;padding:1.25rem 1.5rem;" class="md-show">
            <div style="display:flex;flex-direction:column;gap:1rem;">
                <button type="button" class="directory-search mb-2" onclick="document.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', metaKey: true})); if(window.closeMob) window.closeMob();" style="cursor:pointer;text-align:left;">
                    <span class="directory-search-input" style="cursor:pointer;display:block;padding:0.5rem 0.75rem;border:1px solid #e4e4e7;border-radius:var(--radius-md);font-size:0.875rem;color:#71717a;">Search products… Ctrl/⌘ K</span>
                </button>
                <a href="/" class="block text-sm font-medium text-zinc-600">Home</a>
                <a href="/products/" class="block text-sm font-medium text-zinc-600">Products</a>
                <a href="/applications/" class="block text-sm font-medium text-zinc-600">Applications</a>
                <a href="/about/" class="block text-sm font-medium text-zinc-600">About</a>
                <a href="/resources/" class="block text-sm font-medium text-zinc-600">Resources</a>
                <a href="/contact/" class="btn-primary mt-2" style="text-align:center;">Contact →</a>
            </div>
        </div>
    </nav>`;
}

function footer() {
  return `<footer class="bg-zinc-950 text-white">
        <div class="max-w mx-auto px py-16">
            <div class="grid md-grid-4 gap-10 mb-14">
                <div class="col-span-2">
                    <div class="font-display font-black text-2xl tracking-wider mb-4">MOLDART</div>
                    <p class="text-sm text-zinc-400 leading-relaxed font-light max-w-sm">Integrated supply solutions for the wood-working and metallurgical industries since 1989. Press plates, engineered substrates, flooring, decorative steel.</p>
                    <div class="mt-6 flex flex-col gap-2">
                        <a href="tel:+917208088788" class="link-line text-sm text-zinc-400">+91 7208088788</a>
                        <a href="mailto:info@moldartindia.com" class="link-line text-sm text-zinc-400">info@moldartindia.com</a>
                        <div class="flex gap-4 mt-2">
                            <a href="https://wa.me/917208088788" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-500">WhatsApp</a>
                            <a href="https://www.linkedin.com/in/thisisyashdoshi" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-500">LinkedIn</a>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="section-label text-zinc-600 mb-5">Products</div>
                    <div class="flex flex-col gap-3">
                        <a href="/products/press-plates/" class="link-line text-sm text-zinc-400">Press Plates</a>
                        <a href="/products/fiberboard/" class="link-line text-sm text-zinc-400">Fiberboard (MDF/HDF)</a>
                        <a href="/products/wood-flooring/" class="link-line text-sm text-zinc-400">Wood Flooring</a>
                        <a href="/products/decorative-ss-panels/" class="link-line text-sm text-zinc-400">Decorative Steel</a>
                        <a href="/products/industrial-press-plates/" class="link-line text-sm text-zinc-400">Industrial Plates</a>
                        <a href="/products/" class="link-line text-sm text-zinc-500 mt-1">All Products →</a>
                    </div>
                </div>
                <div>
                    <div class="section-label text-zinc-600 mb-5">Company</div>
                    <div class="flex flex-col gap-3">
                        <a href="/about/" class="link-line text-sm text-zinc-400">About</a>
                        <a href="/applications/" class="link-line text-sm text-zinc-400">Applications</a>
                        <a href="/resources/" class="link-line text-sm text-zinc-400">Resources</a>
                        <a href="/faq/" class="link-line text-sm text-zinc-400">FAQ</a>
                        <a href="/contact/" class="link-line text-sm text-zinc-400">Contact</a>
                    </div>
                </div>
            </div>
            <div class="border-t border-zinc-800 pt-8 flex flex-col md-flex-row justify-between items-center gap-4">
                <div class="section-label text-zinc-600">© <span class="yr">2026</span> Moldart · All rights reserved · Mumbai, India</div>
                <div class="section-label text-zinc-700">Quality · Service · Price</div>
            </div>
        </div>
    </footer>`;
}

function closingElements() {
  return `
    <a href="https://wa.me/917208088788?text=Hi%20Moldart%2C%20I%27m%20interested%20in%20your%20products." target="_blank" rel="noopener noreferrer" class="whatsapp-fab" aria-label="Chat on WhatsApp">
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
                <input type="text" class="cmd-palette-input" id="cmd-input" placeholder="Search pages, products, or actions..." aria-autocomplete="list" autocomplete="off" spellcheck="false">
            </div>
            <div class="cmd-palette-results" id="cmd-results" role="listbox"></div>
            <div class="cmd-palette-footer">
                <div class="flex items-center gap-2"><kbd>↑</kbd><kbd>↓</kbd> <span class="text-xs text-zinc-500">to navigate</span></div>
                <div class="flex items-center gap-2"><kbd>↵</kbd> <span class="text-xs text-zinc-500">to select</span></div>
                <div class="flex items-center gap-2"><kbd>ESC</kbd> <span class="text-xs text-zinc-500">to close</span></div>
            </div>
        </div>
    </div>
    <script src="/main.js?v=${VER}" defer></script>
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "f6d93d7003db408894839c492c46acb9"}' crossorigin="anonymous"></script>
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
  return `<a href="${dl.url}" target="_blank" rel="noopener noreferrer" download class="flex items-center justify-between p-3 rounded-lg transition-colors group" style="border:1px solid #f4f4f5;">
    <div class="flex items-center gap-3">
        <svg class="icon text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
        <span class="text-sm font-medium text-zinc-700">${escHtml(dl.title)}</span>
    </div>
    <svg class="icon icon-sm text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
</a>`;
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
    <div class="grid md-grid-2 gap-10 items-center">
        <div>
            <h2 class="font-display font-black text-4xl mb-4" style="line-height:1;">${heading}</h2>
            <p class="text-sm text-zinc-500 leading-relaxed max-w-sm">${subtext}</p>
        </div>
        <div class="flex gap-4 md-justify-end flex-wrap">
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
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Moldart', url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/favicon-192x192.png', width: 192, height: 192 }, foundingDate: '1989', sameAs: ['https://www.linkedin.com/in/thisisyashdoshi'], address: { '@type': 'PostalAddress', streetAddress: '#7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West)', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', postalCode: '400064', addressCountry: 'IN' }, contactPoint: { '@type': 'ContactPoint', telephone: '+917208088788', contactType: 'sales', email: 'info@moldartindia.com', areaServed: 'IN', availableLanguage: ['English', 'Hindi'] }, description: 'Integrated industrial supply solutions for the wood-working and metallurgical industries since 1989.' },
    { '@context': 'https://schema.org', '@type': 'WebSite', '@id': SITE + '/#website', name: 'Moldart', url: SITE + '/', inLanguage: 'en-IN' },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/#webpage', url: SITE + '/', name: 'Moldart India | Press Plates, Engineered Wood & Decorative Steel Since 1989', description: 'Moldart — 35+ years of integrated supply solutions for wood-working and metallurgical industries. Press plates, substrates, flooring, decorative steel.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  return headTag({
    title: 'Moldart India | Press Plates, Engineered Wood & Decorative Steel Since 1989',
    desc: 'Moldart supplies press plates, lamination tooling, engineered wood substrates, flooring systems, and decorative stainless steel from Mumbai, India. 35+ years serving manufacturers, architects, and distributors.',
    canonical: '/',
    schemas,
    prefetch: ['/products/', '/contact/', '/data/product-directory.json']
  }) + '\n' + nav('home') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-16 fade-up">
            <div class="flex flex-col" style="max-width:52rem;">
                <div class="inline-flex items-center gap-3 mb-10">
                    <span style="width:2rem;height:1px;background:#d4d4d8;"></span>
                    <span class="section-label">Est. 1989 · Mumbai, India</span>
                </div>
                <h1 class="hero-heading mb-10">PRESS PLATES.<br>SUBSTRATES.<br><span class="text-zinc-300">SURFACES.</span></h1>
                <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed mb-8">Moldart supplies lamination tooling, engineered wood panels, flooring systems, and decorative stainless steel to manufacturers, architects, and distributors. 35+ years of integrated industrial supply from Mumbai.</p>
                <div class="flex gap-4 flex-wrap">
                    <a href="/products/" class="btn-primary btn-lg">Explore Products →</a>
                    <a href="/contact/" class="btn-outline btn-lg">Share a Requirement</a>
                </div>
            </div>
        </section>

        <section class="bg-zinc-50 border-y border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-12">
                <div class="section-label mb-6 text-center">Who We Supply</div>
                <div class="grid grid-2 md-grid-4 gap-4 text-center">
                    <div class="p-4"><div class="font-display font-bold text-sm tracking-wider">MANUFACTURERS</div><div class="text-xs text-zinc-500 mt-1">Lamination, furniture, flooring</div></div>
                    <div class="p-4"><div class="font-display font-bold text-sm tracking-wider">ARCHITECTS</div><div class="text-xs text-zinc-500 mt-1">Decorative steel, substrates, custom</div></div>
                    <div class="p-4"><div class="font-display font-bold text-sm tracking-wider">DISTRIBUTORS</div><div class="text-xs text-zinc-500 mt-1">Panels, flooring, steel products</div></div>
                    <div class="p-4"><div class="font-display font-bold text-sm tracking-wider">PROJECT TEAMS</div><div class="text-xs text-zinc-500 mt-1">Custom furniture, fit-outs</div></div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-24 fade-up">
            <div class="section-label mb-4">Product Categories</div>
            <h2 class="font-display font-black text-3xl mb-12">WHAT WE SUPPLY.</h2>
            <div class="grid md-grid-3 gap-4 bento-grid">
                <a href="/products/press-plates/" class="bento-box col-span-2 group overflow-hidden bg-zinc-50 relative">
                    <picture><source srcset="/images/page5_img3.avif" type="image/avif"><img src="/images/page5_img3.webp" alt="Precision press plates for lamination" width="800" height="480" loading="eager" fetchpriority="high" class="absolute inset-0 w-full h-full object-cover transition-opacity z-0" style="opacity:0.10;"></picture>
                    <div class="bento-content z-10"><div class="bento-header flex justify-between items-start"><h3 class="font-display font-bold text-2xl">Lamination Tooling</h3><svg class="icon icon-sm opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div><p class="text-sm text-zinc-500 mt-2 mb-6">Press plates, press pads, engraved cylinders, and printed decor paper for laminate manufacturing.</p><div class="flex gap-2 flex-wrap"><span class="directory-pill">SS 420 / SS 633</span><span class="directory-pill">65–70 HRC Chrome</span></div></div>
                </a>
                <a href="/products/plywood/" class="bento-box group relative overflow-hidden">
                    <picture><source srcset="/images/page6_img1.avif" type="image/avif"><img src="/images/page6_img1.webp" alt="Engineered wood substrate panels" width="600" height="480" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-opacity z-0" style="opacity:0.12;"></picture>
                    <div class="bento-content z-10"><div class="bento-header flex justify-between items-start"><h3 class="font-display font-bold text-2xl">Engineered Substrates</h3><svg class="icon icon-sm opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div><p class="text-sm text-zinc-500 mt-2 mb-6">Plywood, OSB, MDF, HDF, and particleboard — EN, CARB-NAF, and JIS certified.</p><div class="flex gap-2 flex-wrap"><span class="directory-pill">E1 / NAF</span><span class="directory-pill">FSC Certified</span></div></div>
                </a>
                <a href="/products/wood-flooring/" class="bento-box group relative overflow-hidden">
                    <picture><source srcset="/images/page7_img1.avif" type="image/avif"><img src="/images/page7_img1.webp" alt="Engineered wood flooring" width="600" height="480" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-opacity z-0" style="opacity:0.12;"></picture>
                    <div class="bento-content z-10"><div class="bento-header flex justify-between items-start"><h3 class="font-display font-bold text-2xl">Flooring & Furniture</h3><svg class="icon icon-sm opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div><p class="text-sm text-zinc-500 mt-2 mb-6">Engineered flooring systems, transition profiles, and architectural furniture solutions.</p><div class="flex gap-2 flex-wrap"><span class="directory-pill">AC3–AC5</span><span class="directory-pill">Click-Lock</span></div></div>
                </a>
                <a href="/products/decorative-ss-panels/" class="bento-box col-span-2 group overflow-hidden bg-zinc-50 relative">
                    <picture><source srcset="/images/page9_img1.avif" type="image/avif"><img src="/images/page9_img1.webp" alt="PVD decorative stainless steel panels" width="800" height="480" loading="lazy" class="absolute inset-0 w-full h-full object-cover transition-opacity z-0" style="opacity:0.15;"></picture>
                    <div class="bento-content z-10"><div class="bento-header flex justify-between items-start"><h3 class="font-display font-bold text-2xl">Decorative Steel</h3><svg class="icon icon-sm opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div><p class="text-sm text-zinc-500 mt-2 mb-6">PVD-coated panels, precision profiles, and stainless steel furniture for premium interiors.</p><div class="flex gap-2 flex-wrap"><span class="directory-pill">SS 304 / 316L</span><span class="directory-pill">PVD Coating</span><span class="directory-pill">Anti-Fingerprint</span></div></div>
                </a>
            </div>
            <div class="mt-12 text-center">
                <a href="/products/" class="btn-outline">View All 16 Products →</a>
            </div>
        </section>

        <section class="bg-zinc-50 border-y border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-16">
                <div class="grid md-grid-2 gap-10 items-center">
                    <div>
                        <div class="section-label mb-6">How We Work</div>
                        <h2 class="font-display font-black text-3xl mb-4">REQUIREMENT TO DELIVERY.</h2>
                        <p class="text-sm text-zinc-500 leading-relaxed">Every material follows a structured execution flow — from requirement understanding through technical review, sourcing coordination, quality validation, and delivery oversight.</p>
                    </div>
                    <div class="process-timeline" style="margin-top:0;">
                        <div class="process-timeline-step"><div class="process-timeline-dot">01</div><div><div class="process-timeline-label">Share Requirement</div><div class="process-timeline-desc">Application, specifications, volume, and timeline.</div></div></div>
                        <div class="process-timeline-step"><div class="process-timeline-dot">02</div><div><div class="process-timeline-label">Technical Review</div><div class="process-timeline-desc">Grade selection, material alignment, and supply path.</div></div></div>
                        <div class="process-timeline-step"><div class="process-timeline-dot">03</div><div><div class="process-timeline-label">Sourcing & QC</div><div class="process-timeline-desc">Manufacturing coordination and quality validation.</div></div></div>
                        <div class="process-timeline-step"><div class="process-timeline-dot">04</div><div><div class="process-timeline-label">Delivery</div><div class="process-timeline-desc">Logistics, documentation, and delivery support.</div></div></div>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="grid grid-2 md-grid-4 gap-4">
                <div class="trust-stat"><div class="trust-stat-value">35+</div><div class="trust-stat-label">Years Experience</div></div>
                <div class="trust-stat"><div class="trust-stat-value">16</div><div class="trust-stat-label">Product Categories</div></div>
                <div class="trust-stat"><div class="trust-stat-value">1989</div><div class="trust-stat-label">Founded, Mumbai</div></div>
                <div class="trust-stat"><div class="trust-stat-value">2</div><div class="trust-stat-label">Core Sectors</div></div>
            </div>
        </section>

        ${ctaBlock('NEED SPECIFICATIONS<br>OR PRICING?', 'Share your requirement and our team will respond with the right technical and commercial guidance.', 'Share Requirement', '/contact/', 'Download Catalog', '/resources/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateProductsHub() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Products' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/products/#webpage', url: SITE + '/products/', name: 'Products — Moldart India', description: 'Complete product portfolio: lamination tooling, engineered substrates, flooring, furniture, and decorative stainless steel.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema,
    { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Moldart Products', numberOfItems: rawProducts.products.length, itemListElement: rawProducts.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: SITE + '/products/' + (productMeta[p.id]?.slug || p.id) + '/' })) }
  ];

  let categoryHtml = '';
  for (const cat of productCategories) {
    const cards = cat.products.map(pid => productCard(pid)).join('\n');
    categoryHtml += `
        <div class="mb-16 fade-up">
            <h2 class="font-display font-bold text-2xl tracking-wider mb-2">${escHtml(cat.title.toUpperCase())}</h2>
            <p class="text-sm text-zinc-500 leading-relaxed mb-8 max-w-2xl">${escHtml(cat.desc)}</p>
            <div class="grid md-grid-${Math.min(cat.products.length, 4)} gap-4">${cards}</div>
        </div>`;
  }

  return headTag({
    title: 'Products | Press Plates, Substrates, Flooring & Steel — Moldart India',
    desc: 'Explore Moldart\'s complete product portfolio: lamination press plates, engineered wood substrates, flooring systems, and decorative stainless steel for industrial and architectural use.',
    canonical: '/products/',
    ogImage: '/images/page5_img3.webp',
    ogImageAlt: 'Moldart product portfolio',
    schemas
  }) + '\n' + nav('products') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Full Portfolio</span></div>
            <h1 class="page-heading mb-6">PRODUCTS.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed">16 product categories across lamination tooling, engineered substrates, flooring, furniture, and decorative stainless steel.</p>
        </section>

        <section class="max-w mx-auto px py-16">
            ${categoryHtml}
        </section>

        ${ctaBlock('LOOKING FOR<br>SOMETHING SPECIFIC?', 'Share your application details, specifications, or volume requirements.', 'Share Requirement', '/contact/', 'Download Catalog', '/resources/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateProductPage(productId) {
  const p = getProduct(productId);
  const m = getMeta(productId);
  if (!p || !m) { console.error(`Missing data for ${productId}`); return; }

  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Products', url: '/products/' }, { name: p.name }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}/products/${m.slug}/#webpage`, url: `${SITE}/products/${m.slug}/`, name: m.seoTitle, description: m.metaDesc, isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema,
    { '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary, image: SITE + p.image, brand: { '@type': 'Brand', name: 'Moldart' }, manufacturer: { '@type': 'Organization', name: 'Moldart' }, category: `${p.stage} / ${p.use}` }
  ];

  const specsHtml = p.specs.map(s => `<li class="spec-item"><svg class="icon icon-sm text-zinc-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg><span class="text-sm text-zinc-600">${escHtml(s)}</span></li>`).join('\n');
  const appsHtml = p.applications.map(a => `<li class="text-sm text-zinc-600" style="padding:0.25rem 0;">• ${escHtml(a)}</li>`).join('\n');
  const downloadsHtml = m.downloads.length > 0 ? `<div class="mt-10"><h3 class="font-display font-bold text-lg tracking-wider mb-4">DOWNLOADS</h3><div class="flex flex-col gap-2">${m.downloads.map(d => downloadLink(d)).join('\n')}</div></div>` : '';

  const relatedHtml = m.relatedProducts.map(rid => productCard(rid)).filter(Boolean).join('\n');
  const relatedAppsHtml = m.relatedApps.map(slug => {
    const app = applications.find(a => a.slug === slug);
    return app ? `<a href="/applications/${app.slug}/" class="btn-outline text-sm">${escHtml(app.name)}</a>` : '';
  }).filter(Boolean).join('\n');

  return headTag({
    title: m.seoTitle,
    desc: m.metaDesc,
    canonical: `/products/${m.slug}/`,
    ogImage: p.image,
    ogImageAlt: p.name + ' — Moldart',
    schemas
  }) + '\n' + nav('products') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">${escHtml(p.stage)} · ${escHtml(p.use)}</span></div>
            <h1 class="page-heading mb-6">${escHtml(p.name.toUpperCase())}.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed">${escHtml(p.summary)}</p>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="grid md-grid-2 gap-16">
                <div>
                    <div class="overflow-hidden rounded-xl bg-zinc-100 mb-8" style="height:min(22rem, 50vw);">
                        <picture>
                            <source srcset="${p.image.replace('.webp','.avif')}" type="image/avif">
                            <img src="${p.image}" alt="${escHtml(p.name)}" width="800" height="600" loading="eager" class="w-full h-full object-cover">
                        </picture>
                    </div>
                    <h2 class="font-display font-bold text-xl tracking-wider mb-4">OVERVIEW</h2>
                    <p class="text-sm text-zinc-600 leading-relaxed mb-6">${escHtml(m.overview)}</p>
                    <h3 class="font-display font-bold text-base tracking-wider mb-3">WHERE IT FITS</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(m.workflow)}</p>
                </div>
                <div>
                    <h2 class="font-display font-bold text-xl tracking-wider mb-6">KEY SPECIFICATIONS</h2>
                    <ul class="flex flex-col gap-3 mb-10">${specsHtml}</ul>

                    <h3 class="font-display font-bold text-base tracking-wider mb-3">TYPICAL APPLICATIONS</h3>
                    <ul class="mb-8">${appsHtml}</ul>

                    <h3 class="font-display font-bold text-base tracking-wider mb-3">CUSTOMIZATION</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed mb-8">${escHtml(p.customization)}</p>

                    <h3 class="font-display font-bold text-base tracking-wider mb-3">COMMERCIAL NOTES</h3>
                    <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(m.commercialNotes)}</p>

                    ${downloadsHtml}
                </div>
            </div>
        </section>

        ${relatedAppsHtml ? `<section class="max-w mx-auto px py-12 border-b border-zinc-100 fade-up">
            <h2 class="font-display font-bold text-lg tracking-wider mb-6">RELATED APPLICATIONS</h2>
            <div class="flex gap-3 flex-wrap">${relatedAppsHtml}</div>
        </section>` : ''}

        ${relatedHtml ? `<section class="max-w mx-auto px py-16 fade-up">
            <h2 class="font-display font-bold text-xl tracking-wider mb-8">RELATED PRODUCTS</h2>
            <div class="grid md-grid-3 gap-4">${relatedHtml}</div>
        </section>` : ''}

        ${ctaBlock(`NEED ${escHtml(p.name.toUpperCase())}<br>SPECS OR PRICING?`, 'Share your requirements and our technical team will respond with the right guidance.', 'Request Information', '/contact/', 'View All Products', '/products/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateApplicationsHub() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Applications' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/applications/#webpage', url: SITE + '/applications/', name: 'Applications — Moldart India', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const appCards = applications.map(app => `
        <a href="/applications/${app.slug}/" class="border rounded-xl p-6 transition-colors group" style="display:block;">
            <h3 class="font-display font-bold text-xl tracking-wider mb-2">${escHtml(app.name.toUpperCase())}</h3>
            <p class="text-sm text-zinc-500 leading-relaxed mb-4">${escHtml(app.overview.substring(0, 180))}…</p>
            <div class="flex gap-2 flex-wrap">
                ${app.products.slice(0, 3).map(pid => { const pr = getProduct(pid); return pr ? `<span class="directory-pill">${escHtml(pr.name)}</span>` : ''; }).join('')}
            </div>
            <div class="mt-4 text-sm font-medium text-zinc-900">Learn more →</div>
        </a>`).join('\n');

  return headTag({
    title: 'Applications | Lamination, Furniture, Flooring, Architecture — Moldart',
    desc: 'Moldart supplies materials for lamination, furniture manufacturing, flooring, architecture, metal finishing, and PCB/CCL production. Find the right products for your application.',
    canonical: '/applications/',
    schemas
  }) + '\n' + nav('applications') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">By Application</span></div>
            <h1 class="page-heading mb-6">APPLICATIONS.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed">Find the right Moldart products for your application, industry, or production process.</p>
        </section>
        <section class="max-w mx-auto px py-16">
            <div class="grid md-grid-2 gap-6">${appCards}</div>
        </section>
        ${ctaBlock('NOT SURE WHICH<br>PRODUCTS YOU NEED?', 'Tell us about your application and we will recommend the right materials.', 'Share Requirement', '/contact/', 'View Products', '/products/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateApplicationPage(app) {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Applications', url: '/applications/' }, { name: app.name }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${SITE}/applications/${app.slug}/#webpage`, url: `${SITE}/applications/${app.slug}/`, name: app.seoTitle, description: app.metaDesc, isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const productCards = app.products.map(pid => productCard(pid)).filter(Boolean).join('\n');
  const considHtml = app.considerations.map(c => `<li class="flex gap-3 items-start"><svg class="icon icon-sm text-zinc-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z"/></svg><span class="text-sm text-zinc-600">${escHtml(c)}</span></li>`).join('\n');
  const dlHtml = app.downloads.map(d => downloadLink(d)).join('\n');

  return headTag({
    title: app.seoTitle,
    desc: app.metaDesc,
    canonical: `/applications/${app.slug}/`,
    schemas
  }) + '\n' + nav('applications') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Application</span></div>
            <h1 class="page-heading mb-6">${escHtml(app.name.toUpperCase())}.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed">${escHtml(app.overview)}</p>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <h2 class="font-display font-bold text-xl tracking-wider mb-8">RELEVANT PRODUCTS</h2>
            <div class="grid md-grid-3 gap-4">${productCards}</div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="grid md-grid-2 gap-16">
                <div>
                    <h2 class="font-display font-bold text-xl tracking-wider mb-6">TECHNICAL CONSIDERATIONS</h2>
                    <ul class="flex flex-col gap-4">${considHtml}</ul>
                </div>
                <div>
                    <h2 class="font-display font-bold text-xl tracking-wider mb-6">REFERENCE DOWNLOADS</h2>
                    <div class="flex flex-col gap-3">${dlHtml}</div>
                </div>
            </div>
        </section>

        ${ctaBlock(`DISCUSS YOUR<br>${escHtml(app.name.toUpperCase())} NEEDS`, 'Share your application details and our team will recommend the right products and specifications.', 'Share Requirement', '/contact/', 'View All Applications', '/applications/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateResourcesPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'Resources' }]);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/resources/#webpage', url: SITE + '/resources/', name: 'Resources & Downloads — Moldart India', description: 'Download product catalogs, material specifications, and finish references from Moldart.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const groupsHtml = resourceGroups.map(g => {
    const items = g.items.map(item => `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" download class="flex items-center justify-between p-4 rounded-lg transition-colors group" style="border:1px solid #f4f4f5;">
                    <div class="flex items-center gap-3">
                        <svg class="icon text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                        <div>
                            <div class="text-sm font-medium text-zinc-700">${escHtml(item.title)}</div>
                            <div class="text-xs text-zinc-500 mt-0.5">${escHtml(item.desc)}</div>
                        </div>
                    </div>
                    <svg class="icon icon-sm text-zinc-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </a>`).join('\n');
    return `
            <div class="mb-12 fade-up">
                <h2 class="font-display font-bold text-lg tracking-wider mb-4">${escHtml(g.title.toUpperCase())}</h2>
                <div class="flex flex-col gap-2">${items}</div>
            </div>`;
  }).join('\n');

  return headTag({
    title: 'Resources & Downloads | Product Catalogs — Moldart India',
    desc: 'Download product catalogs, material specifications, and finish references for press plates, substrates, flooring, and decorative stainless steel.',
    canonical: '/resources/',
    schemas
  }) + '\n' + nav('resources') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Downloads</span></div>
            <h1 class="page-heading mb-6">RESOURCES.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed">Download structured product catalogs, material specifications, and finish references.</p>
        </section>
        <section class="max-w mx-auto px py-16">
            ${groupsHtml}
        </section>
        <section class="max-w mx-auto px py-12 text-center fade-up" style="border-top:1px solid #f4f4f5;">
            <p class="text-sm text-zinc-500 mb-4">Need a specific data sheet or technical document not listed here?</p>
            <a href="/contact/" class="btn-primary">Request a Document →</a>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateFAQPage() {
  const bc = breadcrumb([{ name: 'Home', url: '/' }, { name: 'FAQ' }]);
  const faqItems = rawFaq.items;
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(q => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } })) },
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/faq/#webpage', url: SITE + '/faq/', name: 'FAQ — Moldart India', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  const faqHtml = faqItems.map(q => `
            <details class="faq-item border-b border-zinc-100 py-6">
                <summary class="font-display font-bold text-base tracking-wider cursor-pointer flex items-center justify-between gap-4">
                    <span>${escHtml(q.question)}</span>
                    <svg class="icon icon-sm text-zinc-400 flex-shrink-0 faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6"/></svg>
                </summary>
                <p class="text-sm text-zinc-500 leading-relaxed mt-4">${escHtml(q.answer)}</p>
            </details>`).join('\n');

  return headTag({
    title: 'Frequently Asked Questions — Moldart India',
    desc: 'Answers to common questions about Moldart product categories, custom specifications, export support, MOQ, and lead times.',
    canonical: '/faq/',
    schemas
  }) + '\n' + nav('faq') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Common Questions</span></div>
            <h1 class="page-heading mb-6">FAQ.</h1>
        </section>
        <section class="max-w mx-auto px py-8" style="max-width:48rem;">
            ${faqHtml}
        </section>
        ${ctaBlock('HAVE A SPECIFIC<br>QUESTION?', 'Our team can provide detailed technical and commercial guidance for your requirements.', 'Contact Us', '/contact/', 'View Products', '/products/')}
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

  const productOptions = rawProducts.products.map(p => `<option value="${escHtml(p.name)}">${escHtml(p.name)}</option>`).join('\n                                ');

  return headTag({
    title: 'Contact Moldart | Inquiry Form, WhatsApp, Phone & Meeting Booking',
    desc: 'Contact Moldart in Mumbai for product specifications, pricing, and industrial sourcing support. Reach us via form, WhatsApp, phone, email, or book a meeting.',
    canonical: '/contact/',
    schemas
  }) + '\n' + nav('contact') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Get in Touch</span></div>
            <h1 class="page-heading">LET'S WORK<br>TOGETHER.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed mt-6">Share your requirement below, or reach us directly via WhatsApp, phone, or email. We typically respond within one business day.</p>
        </section>

        <section id="form-success-alert" class="max-w mx-auto px py-6 hidden">
            <div class="form-success-banner">
                <div class="flex items-center gap-3">
                    <svg class="icon" viewBox="0 0 24 24" stroke="currentColor"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
                    <strong>Inquiry Submitted Successfully.</strong>
                </div>
                <p class="mt-2 text-sm">Thank you for reaching out. A member of our team will review your requirement and contact you shortly.</p>
            </div>
        </section>

        <section class="max-w mx-auto px py-20 border-b border-zinc-100 fade-up">
            <div class="grid md-grid-2 gap-20">
                <div>
                    <div class="section-label mb-6">Share a Requirement</div>
                    <form action="https://formsubmit.co/info@moldartindia.com" method="POST" class="flex flex-col gap-6" id="inquiry-form">
                        <input type="hidden" name="_subject" value="New Moldart Web Inquiry">
                        <input type="hidden" name="_next" value="${SITE}/contact/?submitted=true">
                        <input type="hidden" name="_captcha" value="false">
                        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true">

                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Full Name *</span><input type="text" name="name" class="form-input" required aria-required="true" placeholder="John Doe"></label>
                            <label class="form-group"><span class="form-label">Company</span><input type="text" name="company" class="form-input" placeholder="Acme Industries"></label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Email Address *</span><input type="email" name="email" class="form-input" required aria-required="true" placeholder="john@example.com"></label>
                            <label class="form-group"><span class="form-label">Phone / WhatsApp</span><input type="tel" name="phone" class="form-input" placeholder="+91 ..."></label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Country</span><input type="text" name="country" class="form-input" placeholder="India"></label>
                            <label class="form-group">
                                <span class="form-label">Primary Interest</span>
                                <select name="interest" class="form-select">
                                    <option value="General Inquiry">General Inquiry</option>
                                    ${productOptions}
                                </select>
                            </label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <fieldset class="form-group" style="border:none;padding:0;margin:0;">
                                <legend class="form-label">Requirement Type</legend>
                                <div class="form-radio-group">
                                    <label><input type="radio" name="requirement_type" value="Pricing" checked> Pricing</label>
                                    <label><input type="radio" name="requirement_type" value="Specifications"> Specifications</label>
                                    <label><input type="radio" name="requirement_type" value="Samples"> Samples</label>
                                    <label><input type="radio" name="requirement_type" value="Custom Project"> Custom Project</label>
                                </div>
                            </fieldset>
                            <label class="form-group"><span class="form-label">Application / End Use</span><input type="text" name="application" class="form-input" placeholder="e.g. Furniture manufacturing, Flooring..."></label>
                        </div>
                        <label class="form-group"><span class="form-label">Message *</span><textarea name="message" class="form-textarea" required aria-required="true" placeholder="Please describe your requirement: application, dimensions, finishes, expected volume, or any specific questions..."></textarea></label>
                        <button type="submit" class="btn-primary btn-lg" style="width:100%;justify-content:center;">Submit Inquiry</button>
                        <p class="text-xs text-zinc-400 text-center">Your data is secure and will only be used to process your commercial inquiry.</p>
                    </form>
                </div>

                <div>
                    <div class="section-label mb-6">Direct Contact</div>
                    <div class="flex flex-col gap-4 mb-10">
                        <div class="flex flex-col border rounded-xl overflow-hidden">
                            <div class="flex items-center gap-4 p-4 border-b border-zinc-100 bg-zinc-50">
                                <div style="width:40px;height:40px;background:#25d366;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                    <svg style="width:20px;height:20px;" fill="#fff" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.507-4.484-1.375l-.32-.195-2.867.852.852-2.867-.21-.336A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                                </div>
                                <div><div class="font-display font-bold tracking-wider text-sm">WHATSAPP</div><div class="text-xs text-zinc-500 mt-1">Quick commercial inquiry</div></div>
                            </div>
                            <div class="grid grid-2 p-3 gap-3 bg-white">
                                <a href="https://wa.me/917208088788" target="_blank" rel="noopener noreferrer" class="btn-outline text-xs justify-center" style="padding:0.5rem;">+91 7208088788</a>
                                <a href="https://wa.me/917208188788" target="_blank" rel="noopener noreferrer" class="btn-outline text-xs justify-center" style="padding:0.5rem;">+91 7208188788</a>
                            </div>
                        </div>
                        <a href="https://www.linkedin.com/in/thisisyashdoshi" target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-4 border rounded-xl" style="background:#fff;">
                            <div style="width:40px;height:40px;background:#0077b5;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <svg style="width:18px;height:18px;" fill="#fff" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </div>
                            <div><div class="font-display font-bold tracking-wider text-sm">LINKEDIN</div><div class="text-xs text-zinc-500 mt-1">Connect with Yash Doshi</div></div>
                        </a>
                        <a href="https://outlook.office.com/bookwithme/user/a07f98546e1e4f7fbb0f12f091a6e3ec@moldartindia.com?anonymous&ep=plink" target="_blank" rel="noopener noreferrer" class="flex items-center gap-4 p-4 border rounded-xl" style="background:#fff;">
                            <div style="width:40px;height:40px;background:#18181b;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <svg class="icon icon-sm" stroke="#fff" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M16 3v4M8 3v4M3 9h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/></svg>
                            </div>
                            <div><div class="font-display font-bold tracking-wider text-sm">BOOK A MEETING</div><div class="text-xs text-zinc-500 mt-1">Schedule via Microsoft Bookings</div></div>
                        </a>
                    </div>

                    <div class="section-label mb-6">Head Office</div>
                    <div style="border-left:4px solid #18181b;padding-left:1.5rem;margin-bottom:2.5rem;">
                        <div class="font-display font-bold text-xl tracking-wider mb-2">MUMBAI</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light mb-4">#7, Building No. 1, New Sonal Link Industrial Estate,<br>Link Road, Malad (West), Mumbai — 400064<br>Maharashtra, India</p>
                        <div class="flex flex-col gap-2">
                            <a href="tel:+917208088788" class="link-line text-sm text-zinc-700 font-medium">+91 7208088788</a>
                            <a href="mailto:info@moldartindia.com" class="link-line text-sm text-zinc-700 font-medium">info@moldartindia.com</a>
                        </div>
                    </div>
                    <div class="text-xs text-zinc-400">Business hours: Mon–Sat, 10:00 AM – 6:00 PM IST</div>
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
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': SITE + '/about/#webpage', url: SITE + '/about/', name: 'About Moldart | Integrated Industrial Supply Since 1989', description: 'Moldart: 35+ years of integrated supply for wood-working and metallurgical industries. Mumbai HQ, global sourcing, quality-first approach.', isPartOf: { '@id': SITE + '/#website' }, inLanguage: 'en-IN' },
    bc.schema
  ];

  return headTag({
    title: 'About Moldart | Integrated Industrial Supply Since 1989',
    desc: 'Moldart has operated from Mumbai since 1989, supplying press plates, engineered substrates, flooring, and decorative steel. Learn about our sourcing model, leadership, and quality approach.',
    canonical: '/about/',
    schemas
  }) + '\n' + nav('about') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Our Heritage</span></div>
            <h1 class="page-heading">35+ YEARS<br>OF PRECISION.</h1>
        </section>

        <section class="max-w mx-auto px py-20 border-b border-zinc-100 fade-up">
            <div class="grid md-grid-2 gap-20">
                <div>
                    <div class="section-label mb-6">Company Background</div>
                    <p class="text-zinc-600 leading-relaxed mb-6 font-light">Founded in 1989, Moldart has built an integrated supply ecosystem across two industrial sectors — wood-working and metallurgical. Operating from Mumbai, the company coordinates sourcing, quality control, and supply across a global manufacturing network.</p>
                    <p class="text-zinc-600 leading-relaxed mb-6 font-light">The operating model positions Moldart between Asian manufacturing capability and the quality expectations of end markets — aligning material selection, production coordination, and commercial support into a unified sourcing experience.</p>
                    <div class="flex items-center gap-6 mt-10 about-stats">
                        <div><div class="font-display font-black text-4xl">1989</div><div class="section-label mt-1">Founded</div></div>
                        <div class="w-px h-12 bg-zinc-200 stat-divider"></div>
                        <div><div class="font-display font-black text-4xl">Mumbai</div><div class="section-label mt-1">Headquarters</div></div>
                        <div class="w-px h-12 bg-zinc-200 stat-divider"></div>
                        <div><div class="font-display font-black text-4xl">16</div><div class="section-label mt-1">Product Categories</div></div>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;gap:1.5rem;">
                    <div style="border-left:4px solid #18181b;padding-left:1.5rem;padding-top:0.25rem;padding-bottom:0.25rem;">
                        <div class="font-display font-bold text-xl tracking-wide mb-2">WOOD ECOSYSTEM</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Precision lamination tooling (press plates, press pads, engraved cylinders), decor inputs, engineered panel substrates (plywood, MDF, HDF, OSB, particleboard), and finished products (flooring, furniture).</p>
                    </div>
                    <div style="border-left:4px solid #e4e4e7;padding-left:1.5rem;padding-top:0.25rem;padding-bottom:0.25rem;">
                        <div class="font-display font-bold text-xl tracking-wide mb-2">STEEL DIVISION</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Industrial press plates for HPL/CCL/PCB manufacturing, decorative PVD-coated stainless steel panels, precision profiles and trims, and stainless steel furniture.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-zinc-50 border-b border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-20">
                <div class="section-label mb-6">How We Operate</div>
                <h2 class="font-display font-black text-3xl mb-8">SOURCING & COORDINATION MODEL.</h2>
                <div class="grid md-grid-3 gap-8">
                    <div>
                        <h3 class="font-display font-bold text-base tracking-wider mb-3">MATERIAL SOURCING</h3>
                        <p class="text-sm text-zinc-500 leading-relaxed">Deep manufacturing relationships across Asia enable competitive pricing without compromising on quality specifications. Each material category is sourced through established, quality-verified supply partners.</p>
                    </div>
                    <div>
                        <h3 class="font-display font-bold text-base tracking-wider mb-3">QUALITY COORDINATION</h3>
                        <p class="text-sm text-zinc-500 leading-relaxed">Every order follows a structured review process — from specification alignment through production oversight to final quality validation. Materials are benchmarked against the standards required by the destination market.</p>
                    </div>
                    <div>
                        <h3 class="font-display font-bold text-base tracking-wider mb-3">COMMERCIAL SUPPORT</h3>
                        <p class="text-sm text-zinc-500 leading-relaxed">Technical guidance, sample coordination, documentation, and logistics support are included as part of the supply relationship. The goal is to reduce procurement friction across the entire order cycle.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-20 border-b border-zinc-100 fade-up">
            <div class="section-label mb-14">Leadership</div>
            <div class="grid md-grid-2 gap-14">
                <div>
                    <div class="mb-7 overflow-hidden rounded-xl bg-zinc-100" style="height:min(18rem, 50vw);">
                        <picture><source srcset="/images/lalit_doshi.avif" type="image/avif"><img src="/images/lalit_doshi.webp" alt="Mr. Lalit Doshi — Founder and Partner at Moldart" class="w-full h-full object-cover" style="object-position:top;" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <h3 class="font-display font-bold text-2xl tracking-wider mb-1">MR. LALIT DOSHI</h3>
                    <div class="section-label mb-5">Founder & Partner</div>
                    <p class="text-sm text-zinc-500 leading-relaxed font-light">The architect of Moldart's foundation, Mr. Lalit Doshi built the company across three and a half decades, establishing benchmark standards of quality and technical precision across the wood and steel supply industries.</p>
                </div>
                <div>
                    <div class="mb-7 overflow-hidden rounded-xl bg-zinc-100" style="height:min(18rem, 50vw);">
                        <picture><source srcset="/images/yash_doshi.avif" type="image/avif"><img src="/images/yash_doshi.webp" alt="Mr. Yash Doshi — Partner at Moldart" class="w-full h-full object-cover" style="object-position:top;" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <h3 class="font-display font-bold text-2xl tracking-wider mb-1">MR. YASH DOSHI</h3>
                    <div class="section-label mb-5">Partner</div>
                    <p class="text-sm text-zinc-500 leading-relaxed font-light">Carrying forward the Moldart legacy with modern strategy and vision, Mr. Yash Doshi drives expansion into domestic and international markets — combining deep technical knowledge of industrial materials with an eye for global business development.</p>
                </div>
            </div>
        </section>

        <section class="bg-zinc-50 border-b border-zinc-100 fade-up">
            <div class="max-w mx-auto px py-20">
                <div class="section-label mb-6">How Engagement Works</div>
                <h2 class="font-display font-black text-3xl mb-8">WORKING WITH MOLDART.</h2>
                <div class="grid md-grid-2 gap-8">
                    <div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-6">Moldart operates as a sourcing and supply partner — not a marketplace. Every inquiry is reviewed commercially and technically before a recommendation is made. This means buyers receive guidance aligned to their actual application, not just a product list.</p>
                        <p class="text-sm text-zinc-500 leading-relaxed">The typical engagement starts with a requirement discussion, moves through material recommendation and sample coordination where needed, and progresses to confirmed orders with documented quality specifications.</p>
                    </div>
                    <div>
                        <div class="process-timeline" style="margin-top:0;">
                            <div class="process-timeline-step"><div class="process-timeline-dot">01</div><div><div class="process-timeline-label">Share Requirement</div><div class="process-timeline-desc">Application, finish, volume, and timeline.</div></div></div>
                            <div class="process-timeline-step"><div class="process-timeline-dot">02</div><div><div class="process-timeline-label">Receive Recommendation</div><div class="process-timeline-desc">Grade, build-up, and supply path.</div></div></div>
                            <div class="process-timeline-step"><div class="process-timeline-dot">03</div><div><div class="process-timeline-label">Confirm & Produce</div><div class="process-timeline-desc">Sourcing, manufacturing, QC.</div></div></div>
                            <div class="process-timeline-step"><div class="process-timeline-dot">04</div><div><div class="process-timeline-label">Deliver</div><div class="process-timeline-desc">Documentation, packing, dispatch.</div></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        ${ctaBlock('READY TO<br>WORK TOGETHER?', 'Explore our product range or contact us to discuss your specific requirements.', 'Get in Touch', '/contact/', 'View Products', '/products/')}
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateLoginPage() {
  // Keep existing login page but with updated nav (no Login link)
  return headTag({
    title: 'Trade Portal Preview | Moldart',
    desc: 'Moldart trade portal preview — coming soon for verified trade partners.',
    canonical: '/login/',
    noindex: true,
    schemas: []
  }) + '\n' + nav('login') + `

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            <div class="inline-flex items-center gap-3 mb-10"><span style="width:2rem;height:1px;background:#d4d4d8;"></span><span class="section-label">Trade Portal Preview</span></div>
            <h1 class="page-heading">COMING<br>SOON.</h1>
            <p class="text-base text-zinc-500 font-light max-w-lg leading-relaxed mt-6">We are building a digital procurement platform for verified Moldart trade partners. This portal is not yet available. For immediate assistance, please <a href="/contact/" class="link-line text-zinc-700 font-medium">contact us directly</a>.</p>
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
                <a href="/products/" class="btn-outline">View Products</a>
                <a href="/contact/" class="btn-outline">Contact Us</a>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`;
}

function generateIndustryRedirect() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=/products/">
    <link rel="canonical" href="${SITE}/products/">
    <title>Redirecting to Products — Moldart</title>
</head>
<body>
    <p>This page has moved. <a href="/products/">View our products</a>.</p>
</body>
</html>`;
}

// ============================================================
// SITEMAP, ROBOTS, REDIRECTS
// ============================================================
function generateSitemap() {
  const pages = [
    { url: '/', priority: '1.0', freq: 'monthly' },
    { url: '/products/', priority: '0.9', freq: 'weekly' },
    { url: '/applications/', priority: '0.8', freq: 'monthly' },
    { url: '/about/', priority: '0.8', freq: 'monthly' },
    { url: '/resources/', priority: '0.7', freq: 'monthly' },
    { url: '/contact/', priority: '0.8', freq: 'monthly' },
    { url: '/faq/', priority: '0.6', freq: 'monthly' }
  ];
  // Add product pages
  for (const pid of Object.keys(productMeta)) {
    const m = productMeta[pid];
    pages.push({ url: `/products/${m.slug}/`, priority: '0.7', freq: 'monthly' });
  }
  // Add application pages
  for (const app of applications) {
    pages.push({ url: `/applications/${app.slug}/`, priority: '0.7', freq: 'monthly' });
  }

  const urls = pages.map(p => `  <url><loc>${SITE}${p.url}</loc><lastmod>${NOW}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function generateRobots() {
  return `User-agent: *
Allow: /
Disallow: /data/
Disallow: /login/
Disallow: /.tmp/

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/sitemap-images.xml`;
}

function generateRedirects() {
  return `/index.html               /                         301
/about.html               /about/                   301
/industry.html            /industry/                301
/contact.html             /contact/                 301
/login.html               /login/                   301
/about                    /about/                   301
/industry                 /products/                301
/industry/                /products/                301
/contact                  /contact/                 301
/login                    /login/                   301
/products                 /products/                301
/applications             /applications/            301
/resources                /resources/               301
/faq                      /faq/                     301
/*                        /404.html                 404`;
}

// ============================================================
// MAIN
// ============================================================
function main() {
  console.log('=== Moldart Page Generator ===\n');

  // Core pages
  console.log('Generating core pages...');
  writeFile(path.join(WORK, 'index.html'), generateHomepage());
  writeFile(path.join(WORK, 'about/index.html'), generateAboutPage());
  writeFile(path.join(WORK, 'contact/index.html'), generateContactPage());
  writeFile(path.join(WORK, 'login/index.html'), generateLoginPage());
  writeFile(path.join(WORK, '404.html'), generate404());

  // Products hub + product pages
  console.log('\nGenerating product pages...');
  writeFile(path.join(WORK, 'products/index.html'), generateProductsHub());
  for (const pid of Object.keys(productMeta)) {
    const m = productMeta[pid];
    writeFile(path.join(WORK, `products/${m.slug}/index.html`), generateProductPage(pid));
  }

  // Applications hub + application pages
  console.log('\nGenerating application pages...');
  writeFile(path.join(WORK, 'applications/index.html'), generateApplicationsHub());
  for (const app of applications) {
    writeFile(path.join(WORK, `applications/${app.slug}/index.html`), generateApplicationPage(app));
  }

  // Resources, FAQ
  console.log('\nGenerating utility pages...');
  writeFile(path.join(WORK, 'resources/index.html'), generateResourcesPage());
  writeFile(path.join(WORK, 'faq/index.html'), generateFAQPage());

  // Industry redirect
  writeFile(path.join(WORK, 'industry/index.html'), generateIndustryRedirect());

  // Sitemap, robots, redirects
  console.log('\nGenerating config files...');
  writeFile(path.join(WORK, 'sitemap.xml'), generateSitemap());
  writeFile(path.join(WORK, 'robots.txt'), generateRobots());
  writeFile(path.join(WORK, '_redirects'), generateRedirects());

  // Count generated pages
  const totalPages = 5 + Object.keys(productMeta).length + applications.length + 3 + 1; // core + products + apps + utility + industry redirect
  console.log(`\n=== Generated ${totalPages} pages ===`);
}

main();
