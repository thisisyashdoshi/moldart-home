#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");
const { pathToFileURL } = require("url");
let sharp = null;
let chromium = null;
try {
	sharp = require("sharp");
} catch (_) {}
try {
	({ chromium } = require("playwright"));
} catch (_) {
	try {
		({ chromium } = require("playwright-core"));
	} catch (_) {}
}
const {
	importedInsights,
	insightDossiers,
} = require("./insight-enhancements.js");
const {
	technicalLibraryPublished,
	technicalLibraryDrafts,
	technicalLibraryDownloads,
	technicalLibraryAudit,
	GUIDE_INDEX,
	CTA: TECHNICAL_LIBRARY_CTA,
} = require("./technical-library.js");

const GENERATE_SOCIAL_PNG = process.env.GENERATE_SOCIAL_PNG !== "0";

const WORK = __dirname;
const SITE = "https://moldartindia.com";
const NOW = new Date().toISOString().split("T")[0];
function gitValue(args = "") {
	try {
		return execSync(`git ${args}`, { cwd: WORK, encoding: "utf8" })
			.trim()
			.replace(/\s+/g, " ");
	} catch (_) {
		return "";
	}
}
function publicSourceHash() {
	const hash = crypto.createHash("sha256");
	for (const relativePath of [
		"generate.js",
		"build.js",
		"main.js",
		"lead-forms.js",
		"styles.css",
		"pages.css",
		"site-overrides.css",
		"_headers",
	]) {
		const file = path.join(WORK, relativePath);
		if (!fs.existsSync(file)) continue;
		hash.update(relativePath);
		hash.update(fs.readFileSync(file));
	}
	return hash.digest("hex").slice(0, 10);
}
const BUILD_GIT_SHA =
	process.env.CF_PAGES_COMMIT_SHA || gitValue("rev-parse --short=12 HEAD") || "local";
const BUILD_GIT_BRANCH =
	process.env.CF_PAGES_BRANCH || gitValue("branch --show-current") || "local";
const BUILD_CONTENT_HASH = publicSourceHash();
const VER =
	process.env.BUILD_VERSION ||
	`${NOW.replace(/-/g, ".")}.${BUILD_GIT_SHA.slice(0, 12)}.${BUILD_CONTENT_HASH}`;
const COMPANY_LINKEDIN = "https://www.linkedin.com/company/moldartindia";
const YASH_LINKEDIN = "https://www.linkedin.com/in/thisisyashdoshi";
const WHATSAPP_PRIMARY = { number: "917208088788", display: "+91 7208088788" };
const WHATSAPP_SECONDARY = {
	number: "917208188788",
	display: "+91 7208188788",
};
const BRAND_LINE =
	"Technical RFQ coordination for wood-panel, decorative stainless steel, and electronics press systems from Mumbai.";
const NAV_SEARCH_META =
	"Products • Solutions • Resources • Insights • FAQ • Contact";
const LEGAL_NAME = "Mold Art (India) Private Limited";
const RELATED_PROFILE = "Deco Metal, GSTIN 27AAHFD0708K1ZI";
const COMPANY_ADDRESS =
	"#7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West), Mumbai 400064, Maharashtra, India";
const LEGAL_EFFECTIVE_DATE = "10 July 2026";
const SUPPLY_FLOW_ITEMS = [
	{
		step: "01",
		title: "Source",
		detail:
			"Start from the actual requirement, then align the likely supply route instead of quoting a generic equivalent.",
	},
	{
		step: "02",
		title: "Verify",
		detail:
			"Use reference decks and samples to validate fit before volume or price becomes the only conversation.",
	},
	{
		step: "03",
		title: "Supply",
		detail:
			"Confirm grade, finish, commercial route, and documentation only after the technical path is clear.",
	},
];
const PUBLIC_DOWNLOAD_BRANCH = "public-downloads";
const LARGE_DOWNLOAD_PATHS = new Set([
	"/downloads/HPL - OL - 4.pdf",
	"/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf",
	"/downloads/LPL - SPECIALTY DECORATIVE PANELS.pdf",
	"/downloads/WOOD - FURNITURE - 3.pdf",
	"/downloads/LPL - GB - 01.pdf",
	"/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf",
]);

// ============================================================
// READ EXISTING DATA
// ============================================================
function formatHumanDate(iso) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""))) return "";
	const [year, month, day] = String(iso).split("-").map(Number);
	const value = new Date(Date.UTC(year, month - 1, day));
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(value);
}

function normalizeInsightDates(articles = []) {
	return articles.map((article) => {
		const date = /^\d{4}-\d{2}-\d{2}$/.test(String(article.date || ""))
			? article.date
			: "";
		return { ...article, date, displayDate: date ? formatHumanDate(date) : "" };
	});
}

function articleDateLabel(article) {
	return article.displayDate || (article.date ? formatHumanDate(article.date) : "");
}

function whatsappHref(number, text = "") {
	return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
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

function youtubeVideoId(item = {}) {
	return String(item.id || (item.idParts || []).join(""))
		.trim()
		.replace(/^watch:/, "");
}

function youtubeItemUrl(item = {}) {
	if (item.url) return item.url;
	const id = youtubeVideoId(item);
	if (!id) return "";
	return item.type === "short"
		? `https://www.youtube.com/shorts/${id}`
		: `https://www.youtube.com/watch?v=${id}`;
}

function normalizeStringArray(values = []) {
	return Array.from(
		new Set(
			(values || [])
				.map((value) => String(value || "").trim())
				.filter(Boolean),
		),
	);
}

function normalizeYoutubeLibrary(raw = {}) {
	const items = (raw.items || [])
		.map((item) => {
			const id = youtubeVideoId(item);
			return {
				...item,
				id,
				url: youtubeItemUrl({ ...item, id }),
				primaryInsightSlugs: normalizeStringArray(item.primaryInsightSlugs),
				secondaryInsightSlugs: normalizeStringArray(item.secondaryInsightSlugs),
				productIds: normalizeStringArray(item.productIds),
			};
		})
		.filter((item) => item.id && item.url);
	return { ...raw, items };
}

const rawProducts = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/product-directory.json"), "utf8"),
);
const rawSolutions = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/solutions.json"), "utf8"),
);
const rawVisualPrototypeMedia = JSON.parse(
	fs.readFileSync(path.join(WORK, "internal/visual-prototype-media.json"), "utf8"),
);
const visualPrototypeMediaById = new Map(
	(rawVisualPrototypeMedia.records || []).map((record) => [record.id, record]),
);
const rawOpenLicenseMedia = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/open-license-media.json"), "utf8"),
);
const openLicenseMediaByRoute = new Map();
for (const item of rawOpenLicenseMedia.items || []) {
	for (const route of item.routes || []) {
		const records = openLicenseMediaByRoute.get(route) || [];
		records.push(item);
		openLicenseMediaByRoute.set(route, records);
	}
}
const rawInsightOptimization = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/insight-optimization.json"), "utf8"),
);
const rawFaq = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/faq.json"), "utf8"),
);
const rawInsightsBase = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/insights.json"), "utf8"),
);
const rawYoutubeLibrary = JSON.parse(
	fs.readFileSync(path.join(WORK, "data/youtube-library.json"), "utf8"),
);
const insightMediaManifest = (() => {
	try {
		return JSON.parse(
			fs.readFileSync(
				path.join(WORK, "technical-library-image-manifest.json"),
				"utf8",
			),
		);
	} catch (_) {
		return { selectedImages: [] };
	}
})();
const insightMediaBySlug = new Map(
	(insightMediaManifest.selectedImages || []).map((item) => [
		item.articleSlug,
		item,
	]),
);
const youtubeLibrary = normalizeYoutubeLibrary(rawYoutubeLibrary);
const insightOptimizationBySlug = new Map(
	(rawInsightOptimization.records || []).map((record) => [record.slug, record]),
);
function applyInsightOptimization(article = {}) {
	const record = insightOptimizationBySlug.get(article.slug);
	if (!record) return article;
	return {
		...article,
		title: record.title,
		seoTitle: compactSeoTitle(record.title),
		excerpt: record.decision || article.excerpt,
		packageDecision: record.decision,
		packagePriority: record.priority,
		packageHeroSubject: record.heroSubject,
		packageVideoRecommendation: record.videoRecommendation,
		packageRewriteControls: record.rewriteControls,
	};
}
const rawInsightsSource = {
	...rawInsightsBase,
	articles: mergeInsightArticles(rawInsightsBase.articles, [
		...technicalLibraryPublished,
		...importedInsights,
	]).map(applyInsightOptimization),
};
let rawInsights = {
	...rawInsightsSource,
	editorial: normalizeInsightDates(rawInsightsSource.articles),
	generated: [],
	articles: normalizeInsightDates(rawInsightsSource.articles),
};
const getAllResourceItems = () =>
	resourceGroups.flatMap((group) =>
		group.items.map((item) => ({ ...item, group: group.title })),
	);
const getTotalResourceItems = () => getAllResourceItems().length;
const getInstantResourceItems = () =>
	getAllResourceItems().filter((item) => !isRequestOnlyResource(item));
const getRequestResourceItems = () =>
	getAllResourceItems().filter((item) => isRequestOnlyResource(item));

// ============================================================
// EXTENDED PRODUCT METADATA
// ============================================================
const productMeta = Object.fromEntries(
	(rawProducts.products || []).map((product) => [
		product.id,
		{
			slug: product.slug || product.id,
			seoTitle: product.seoTitle || `${product.name} | Moldart`,
			metaDesc: product.metaDesc || product.summary,
			overview: product.overview || product.summary,
			workflow: product.workflow || "Define the application, review evidence, approve the reference, and record acceptance.",
			commercialNotes: product.commercialNotes || "Availability and commercial details are confirmed after RFQ review.",
			relatedProducts: product.relatedProducts || [],
			relatedApps: product.relatedApps || [],
			downloads: product.downloads || [],
		},
	]),
);

// ============================================================
// APPLICATION DATA
// ============================================================
const applications = rawSolutions.solutions || [];
const SOLUTION_PRODUCT_ROLES = Object.fromEntries(
	applications.map((solution) => [solution.slug, solution.productRoles || {}]),
);
const SOLUTION_AUDIENCES = Object.fromEntries(
	applications.map((solution) => [solution.slug, solution.audience || []]),
);
const SOLUTION_FLOWS = Object.fromEntries(
	applications.map((solution) => [solution.slug, solution.flow || []]),
);
const ROUTE_VISUAL_MODELS = Object.fromEntries(
	applications.map((solution) => [solution.slug, solution.visual || {}]),
);

// ============================================================
// RESOURCE/DOWNLOAD GROUPS
// ============================================================
const resourceGroups = [
	{
		title: "Company Overview",
		items: [
			{
				title: "Moldart Company Profile",
				desc: "Overview of operating model, sectors served, and product portfolio.",
				url: "/downloads/INTRODUCTION TO MOLDART.pdf",
				access: "instant",
			},
		],
	},
	{
		title: "Press Plates & Tooling",
		items: [
			{
				title: "Press Plate Standard Collection",
				desc: "Standard lamination press plate patterns and technical references.",
				url: "/downloads/PRESS PLATE - BASIC COLLECTION.pdf",
				access: "instant",
			},
			{
				title: "Press Plates for Shuttering Plywood",
				desc: "Press plate collection aligned to shuttering plywood production.",
				url: "/downloads/PRESS PLATE - SHUTTERING PLYWOOD.pdf",
				access: "instant",
			},
			{
				title: "Press Plate Texture Collection",
				desc: "Extended texture deck for surface-led approval work and pattern comparison.",
				url: "/downloads/PRESS PLATE - TEXTURE COLLECTION.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
		],
	},
	{
		title: "Decor & Lamination",
		items: [
			{
				title: "HPL Overlay Collection OL-01",
				desc: "High-pressure laminate overlay reference set.",
				url: "/downloads/HPL - OL - 1.pdf",
				access: "instant",
			},
			{
				title: "HPL Overlay Collection OL-02",
				desc: "High-pressure laminate overlay reference set.",
				url: "/downloads/HPL - OL - 2.pdf",
				access: "instant",
			},
			{
				title: "HPL Overlay Collection OL-03",
				desc: "High-pressure laminate overlay reference set.",
				url: "/downloads/HPL - OL - 3.pdf",
				access: "instant",
			},
			{
				title: "HPL Overlay Collection OL-04",
				desc: "Expanded overlay set for deeper texture and finish matching.",
				url: "/downloads/HPL - OL - 4.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
			{
				title: "LPL Decorative Collection GB-01",
				desc: "Low-pressure laminate decor reference set for broad visual matching.",
				url: "/downloads/LPL - GB - 01.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
			{
				title: "LPL Decorative Collection GB-02",
				desc: "Low-pressure laminate decor reference set.",
				url: "/downloads/LPL - GB - 02.pdf",
				access: "instant",
			},
			{
				title: "LPL PET Board Collection",
				desc: "PET-faced decorative board reference deck.",
				url: "/downloads/LPL - PET BOARD.pdf",
				access: "instant",
			},
			{
				title: "LPL Specialty Decorative Panels",
				desc: "Specialty decorative panel deck for broader LPL finish programmes.",
				url: "/downloads/LPL - SPECIALTY DECORATIVE PANELS.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
		],
	},
	{
		title: "Decor Paper & Gravure",
		items: [
			{
				title: "Gravure Cylinder & Printed Decor Paper Deck",
				desc: "Combined reference deck for gravure cylinders and decor paper programmes.",
				url: "/downloads/GRAVURE CYLINDER AND PRINTED DECOR PAPER FOR LOW AND HIGH PRESSURE LAMINATES.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
		],
	},
	{
		title: "Wood, Flooring & Furniture",
		items: [
			{
				title: "Flooring Systems Reference Deck",
				desc: "Flooring systems, constructions, and coordinated accessories. Confirm the actual construction and declared use class in the approved programme record.",
				url: "/downloads/WOOD - FLOORING.pdf",
				access: "instant",
			},
			{
				title: "Engineered Wood Doors Catalog",
				desc: "Wood door references and build options.",
				url: "/downloads/WOOD - DOOR.pdf",
				access: "instant",
			},
			{
				title: "Furniture Program Catalog 01",
				desc: "Ready-made and modular furniture references.",
				url: "/downloads/WOOD - FURNITURE - 1.pdf",
				access: "instant",
			},
			{
				title: "Furniture Program Catalog 02",
				desc: "Furniture assemblies, components, and range extension.",
				url: "/downloads/WOOD - FURNITURE - 2.pdf",
				access: "instant",
			},
			{
				title: "Furniture Program Catalog 03",
				desc: "Expanded furniture deck covering additional ranges and layouts.",
				url: "/downloads/WOOD - FURNITURE - 3.pdf",
				access: "request",
				note: "Large reference deck shared on request.",
			},
		],
	},
	{
		title: "Decorative Stainless Steel",
		items: [
			{
				title: "Decorative SS Antique Finishes",
				desc: "Antique-finish stainless steel reference sheet.",
				url: "/downloads/ANTIQUE.pdf",
				access: "instant",
			},
			{
				title: "Decorative SS Stamped Finishes",
				desc: "Stamped surface treatments and pattern references.",
				url: "/downloads/STAMPED.pdf",
				access: "instant",
			},
			{
				title: "Decorative SS Heat-Printed Finishes",
				desc: "Heat-printed decorative stainless steel references.",
				url: "/downloads/HEAT PRINTED.pdf",
				access: "instant",
			},
			{
				title: "Decorative SS Mosaic Finishes",
				desc: "Mosaic surface references for premium interiors.",
				url: "/downloads/MOSAIC.pdf",
				access: "instant",
			},
			{
				title: "Stainless Steel Profiles Catalog",
				desc: "Trim, inlay, and architectural profile references.",
				url: "/downloads/PROFILE.pdf",
				access: "instant",
			},
			{
				title: "Stainless Steel Divider Systems",
				desc: "Divider and partition references for interior applications.",
				url: "/downloads/DIVIDER.pdf",
				access: "instant",
			},
		],
	},
];

const RESOURCE_ROUTE_OVERRIDES = {
	"Moldart Company Profile": ["company"],
	"Press Plate Standard Collection": ["lamination", "pcb-ccl"],
	"Press Plates for Shuttering Plywood": ["lamination"],
	"Press Plate Texture Collection": ["lamination"],
	"HPL Overlay Collection OL-01": ["lamination"],
	"HPL Overlay Collection OL-02": ["lamination"],
	"HPL Overlay Collection OL-03": ["lamination"],
	"HPL Overlay Collection OL-04": ["lamination"],
	"LPL Decorative Collection GB-01": ["lamination"],
	"LPL Decorative Collection GB-02": ["lamination"],
	"LPL PET Board Collection": ["lamination"],
	"LPL Specialty Decorative Panels": ["lamination"],
	"Gravure Cylinder & Printed Decor Paper Deck": ["lamination"],
	"Flooring Systems Reference Deck": ["flooring"],
	"Engineered Wood Doors Catalog": ["furniture"],
	"Furniture Program Catalog 01": ["furniture"],
	"Furniture Program Catalog 02": ["furniture"],
	"Furniture Program Catalog 03": ["furniture"],
	"Decorative SS Antique Finishes": ["architecture", "metal-finishing"],
	"Decorative SS Stamped Finishes": ["architecture", "metal-finishing"],
	"Decorative SS Heat-Printed Finishes": ["architecture", "metal-finishing"],
	"Decorative SS Mosaic Finishes": ["architecture", "metal-finishing"],
	"Stainless Steel Profiles Catalog": ["architecture", "metal-finishing"],
	"Stainless Steel Divider Systems": ["architecture", "metal-finishing"],
};

// ============================================================
// PRODUCT CATEGORY GROUPS (for hub page)
// ============================================================
const productCategories = (rawProducts.systems || []).map((system) => ({
	title: system.name,
	desc: system.description,
	products: rawProducts.products
		.filter((product) => product.system === system.id)
		.map((product) => product.id),
}));

const portfolioFamilies = productCategories.map((category) => ({
	title: category.title,
	intro: category.desc,
	products: category.products,
	highlights: [],
	sectors: [],
}));

const applicationVisuals = Object.fromEntries(
	applications.map((solution) => {
		const product = (solution.products || [])
			.map((productId) => getProduct(productId))
			.find((item) => approvedProductImage(item));
		return [
			solution.slug,
			{
				image:
					approvedProductImage(product) ||
					"/images/social/moldart-solutions.webp",
				alt: `${solution.name} technical route`,
				eyebrow: solution.visual?.storyNote || solution.overview,
			},
		];
	}),
);

const companyMilestones = [
	{ year: "1989", title: "Business roots in Mumbai", detail: "The related Deco Metal partnership established its Mumbai trading presence. This date is presented as business history, not as the incorporation date of Mold Art (India) Private Limited." },
	{ year: "2005", title: "Mold Art (India) Private Limited", detail: "The current legal entity was incorporated in Mumbai under CIN U74994MH2005PTC153242." },
	{ year: "Today", title: "Technical RFQ coordination", detail: "Moldart coordinates product definition, sourcing, samples, evidence, packing and commercial execution across wood, decorative steel and electronics press routes." },
];

const primaryPages = [
	{
		title: "Products",
		url: "/products/",
		meta: "Seventeen product routes across three technical systems",
		keywords: ["products", "catalogue", "wood", "steel", "electronics"],
	},
	{
		title: "Explore",
		url: "/explore/",
		meta: "Search the full portfolio",
		keywords: ["explore", "search", "product sheets"],
	},
	{
		title: "Solutions",
		url: "/solutions/",
		meta: "Combined systems, product stacks, and product sheets",
		keywords: ["solutions", "systems", "product stack"],
	},
	{
		title: "Evidence & QC",
		url: "/evidence-qc/",
		meta: "Samples, documents, inspection, packing and receiving controls",
		keywords: ["evidence", "qc", "sample", "inspection", "packing"],
	},
	{
		title: "Process",
		url: "/process/",
		meta: "RFQ, qualification, approval, dispatch and repeat supply",
		keywords: ["process", "rfq", "approval", "dispatch"],
	},
	{
		title: "Resources",
		url: "/resources/",
		meta: "Catalogues, decks, and references",
		keywords: ["resources", "downloads", "catalogs"],
	},
	{
		title: "Insights",
		url: "/insights/",
		meta: "Technical guides and notes",
		keywords: ["insights", "guides", "notes"],
	},
	{
		title: "FAQ",
		url: "/faq/",
		meta: "Quick answers on products, documents, timing, and first contact",
		keywords: ["faq", "questions", "answers"],
	},
	{
		title: "About",
		url: "/about/",
		meta: "Company, team, and sourcing model",
		keywords: ["about", "company", "leadership"],
	},
	{
		title: "Start RFQ",
		url: "/contact/?intent=buyer-rfq",
		meta: "Submit a structured technical requirement",
		keywords: ["contact", "rfq", "whatsapp", "email"],
	},
];

const familyVisuals = Object.fromEntries(
	portfolioFamilies.map((family) => {
		const product = family.products.map((id) => getProduct(id)).find((item) => item?.image);
		return [
			family.title,
			{
				image: product?.image || "/images/social/moldart-products.webp",
				alt: `${family.title} product system`,
				label: family.intro,
			},
		];
	}),
);
familyVisuals["Lamination Tooling"] ||= Object.values(familyVisuals)[0];

function insightCategoryLabelForProduct(productId) {
	const product = getProduct(productId);
	if (!product) return "Technical Guides";
	if (product.system === "steel") return "Decorative Stainless Steel";
	if (product.system === "electronics") return "Industrial Tooling";
	if (product.id === "wood-flooring") return "Flooring Systems";
	if (["fiberboard", "particleboard", "osb", "plywood"].includes(product.id)) return "Panel Systems";
	if (["hpl-compact-laminated-boards", "decorative-films-foils"].includes(product.id)) return "Decorative Surfaces";
	return "Lamination Tooling";
}

function generatedInsightPatterns() {
	return [
		{
			suffix: "guide",
			type: "Technical Guide",
			title: (product) =>
				`${product.name}: technical guide for approvals, route fit, and enquiry planning`,
			excerpt: (product) =>
				`A product-specific technical guide to how ${product.name.toLowerCase()} should be read by buyers, technical teams, and approval stakeholders.`,
		},
		{
			suffix: "applications",
			type: "Application Guide",
			title: (product) =>
				`${product.name}: application fit, buyer use cases, and where the route makes sense`,
			excerpt: (product) =>
				`A practical application note for ${product.name.toLowerCase()}, focused on where the route fits well and what should be checked before approval.`,
		},
		{
			suffix: "buyers-guide",
			type: "Buyer's Guide",
			title: (product) =>
				`${product.name}: buyer checklist before the first RFQ or reorder`,
			excerpt: (product) =>
				`A buyer-focused checklist for ${product.name.toLowerCase()}, covering RFQ inputs, approval logic, receiving discipline, and reorder risk.`,
		},
		{
			suffix: "comparison",
			type: "Comparative Analysis",
			title: (product) =>
				`${product.name}: comparison checkpoints before choosing the final route`,
			excerpt: (product) =>
				`A comparison-led article for ${product.name.toLowerCase()} that shows what should stay like-for-like before commercial selection begins.`,
		},
		{
			suffix: "quality",
			type: "Quality & Standards",
			title: (product) =>
				`${product.name}: quality checks, receiving priorities, and approval discipline`,
			excerpt: (product) =>
				`A quality-led note on ${product.name.toLowerCase()}, focusing on incoming checks, surface or dimensional review, and approval stability.`,
		},
		{
			suffix: "specifications",
			type: "Specification Note",
			title: (product) =>
				`${product.name}: specification notes, technical checkpoints, and document structure`,
			excerpt: (product) =>
				`A specification-focused note for ${product.name.toLowerCase()}, built around the technical checkpoints that matter before quoting and dispatch.`,
		},
	];
}

function buildGeneratedInsightContent(product, meta, pattern) {
	const specs = product.specs
		.slice(0, 4)
		.map((spec) => `- ${spec}`)
		.join("\n");
	const applications = (product.applications || [])
		.slice(0, 4)
		.map((application) => `- ${application}`)
		.join("\n");
	const grades = (product.technical?.grades || []).length
		? (product.technical.grades || []).join(", ")
		: product.material;
	const standards = (product.technical?.certifications || []).length
		? product.technical.certifications.join(", ")
		: "Project-specific or enquiry-led";
	const relatedRoutes =
		relatedSolutionsForProduct(product.id)
			.map((app) => app.name)
			.join(", ") || insightCategoryLabelForProduct(product.id);
	const commercial =
		meta.commercialNotes ||
		product.customization ||
		"Final route, documents, and commercial timing are confirmed per enquiry.";
	const receiving = [
		"Match the dispatch to the approved reference, drawing, or sample.",
		"Check visible condition, pack integrity, and any dimensional or finish-sensitive points before release into use.",
		"Log deviations before the material becomes part of production or installation.",
		"Keep the receiving result attached to the next reorder conversation.",
	]
		.map((item) => `- ${item}`)
		.join("\n");

	if (pattern.suffix === "guide") {
		return `## What the route is actually doing

${product.summary} ${meta.workflow || ""}

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

	if (pattern.suffix === "applications") {
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

	if (pattern.suffix === "buyers-guide") {
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

- Lead time: ${product.technical?.leadTime || "On request"}
- MOQ: ${product.technical?.moq || "On request"}
- Origin route: ${product.technical?.origin || "On request"}
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

	if (pattern.suffix === "comparison") {
		const comparisonOptions = (
			product.technical?.grades ||
			product.applications ||
			[]
		).slice(0, 3);
		const optionLines = comparisonOptions.length
			? comparisonOptions.map((option) => `- ${option}`).join("\n")
			: `- ${product.name} versus a generic equivalent should only be judged against the same technical and commercial brief.`;
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

	if (pattern.suffix === "quality") {
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
	const reservedSlugs = new Set(
		(rawInsightsSource.articles || [])
			.map((article) => article.slug)
			.filter(Boolean),
	);
	return rawProducts.products.flatMap((product) => {
		const meta = productMeta[product.id];
		if (!meta) return [];
		return patterns
			.map((pattern) => ({
				id: `${product.id}-${pattern.suffix}`,
				slug: `${product.id}-${pattern.suffix}`,
				title: pattern.title(product),
				category: product.id,
				categoryLabel: insightCategoryLabelForProduct(product.id),
				tags: [
					product.name,
					product.use,
					product.stage,
					pattern.suffix.replace(/-/g, " "),
					...(product.industry || []),
					...(product.applications || []),
				].filter(Boolean),
				type: pattern.type,
				date: NOW,
				readTime: "7 min",
				excerpt: pattern.excerpt(product),
				author: "Moldart Technical Team",
				generated: true,
				content: buildGeneratedInsightContent(product, meta, pattern),
			}))
			.filter((article) => !reservedSlugs.has(article.slug));
	});
}

const editorialInsights = normalizeInsightDates(rawInsightsSource.articles);
const generatedInsights = [];
rawInsights = {
	...rawInsightsSource,
	editorial: editorialInsights,
	generated: generatedInsights,
	articles: [...editorialInsights, ...generatedInsights],
};

// ============================================================
// HELPERS
// ============================================================
function getProduct(id) {
	return rawProducts.products.find((p) => p.id === id);
}
function getMeta(id) {
	return productMeta[id];
}
function mkdirp(dir) {
	fs.mkdirSync(dir, { recursive: true });
}
function sleepSync(ms) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function writeFileSyncWithRetry(filePath, content, options) {
	const retryCodes = new Set(["UNKNOWN", "EBUSY", "EPERM", "EACCES"]);
	let lastError = null;
	for (let attempt = 0; attempt < 6; attempt += 1) {
		try {
			fs.writeFileSync(filePath, content, options);
			return;
		} catch (error) {
			lastError = error;
			if (!retryCodes.has(error.code) || attempt === 5) break;
			sleepSync(150 * (attempt + 1));
		}
	}
	throw lastError;
}
function normalizeTextOutput(content) {
	return String(content).replace(/[\t ]+$/gm, "");
}
function writeFile(filePath, content) {
	mkdirp(path.dirname(filePath));
	writeFileSyncWithRetry(filePath, normalizeTextOutput(content), "utf8");
	console.log(`  ✓ ${path.relative(WORK, filePath)}`);
}
function hasUsableFile(filePath) {
	try {
		const stats = fs.statSync(filePath);
		return stats.isFile() && stats.size > 0;
	} catch (_) {
		return false;
	}
}
function writeFileIfChanged(filePath, content) {
	mkdirp(path.dirname(filePath));
	const normalized = normalizeTextOutput(content);
	try {
		if (
			fs.existsSync(filePath) &&
			fs.readFileSync(filePath, "utf8") === normalized
		) {
			return false;
		}
	} catch (_) {}
	writeFileSyncWithRetry(filePath, normalized, "utf8");
	console.log(`  ✓ ${path.relative(WORK, filePath)}`);
	return true;
}
function escHtml(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
function writeBinaryFile(filePath, content) {
	mkdirp(path.dirname(filePath));
	writeFileSyncWithRetry(filePath, content);
	console.log(`  ✓ ${path.relative(WORK, filePath)}`);
}
function uniqueLinks(items = []) {
	const seen = new Set();
	const output = [];
	for (const item of items) {
		const href = String(item?.href || "").trim();
		if (!href || seen.has(href)) continue;
		seen.add(href);
		output.push(item);
	}
	return output;
}
function insightTheme(article, context = null) {
	const key = context?.product?.id || article.category || article.categoryLabel;
	if (
		[
			"press-plates",
			"press-pads",
			"engraved-cylinders",
			"decor-paper",
		].includes(key) ||
		article.categoryLabel === "Lamination Tooling"
	) {
		return {
			primary: "#18181b",
			soft: "#f4f4f5",
			accent: "#71717a",
			ink: "#18181b",
			glow: "#d4d4d8",
			image: "/images/page5_img3.webp",
		};
	}
	if (
		["plywood", "fiberboard", "osb", "particleboard"].includes(key) ||
		article.categoryLabel === "Panel Systems"
	) {
		return {
			primary: "#14532d",
			soft: "#f0fdf4",
			accent: "#15803d",
			ink: "#14532d",
			glow: "#bbf7d0",
			image: "/images/page6_img1.webp",
		};
	}
	if (
		["decorative-panels", "ss-profiles", "ss-furniture"].includes(key) ||
		article.categoryLabel === "Decorative Steel" ||
		article.categoryLabel === "Decorative Stainless Steel"
	) {
		return {
			primary: "#1f2937",
			soft: "#f8fafc",
			accent: "#475569",
			ink: "#111827",
			glow: "#cbd5e1",
			image: "/images/page9_img1.webp",
		};
	}
	if (
		["industrial-press-plates"].includes(key) ||
		article.categoryLabel === "Industrial Tooling"
	) {
		return {
			primary: "#1d4ed8",
			soft: "#eff6ff",
			accent: "#2563eb",
			ink: "#1e3a8a",
			glow: "#bfdbfe",
			image: "/images/page9_img4.webp",
		};
	}
	if (
		["wood-flooring", "flooring-accessories"].includes(key) ||
		article.categoryLabel === "Flooring Systems"
	) {
		return {
			primary: "#7c2d12",
			soft: "#fff7ed",
			accent: "#c2410c",
			ink: "#7c2d12",
			glow: "#fdba74",
			image: "/images/page7_img1.webp",
		};
	}
	return {
		primary: "#312e81",
		soft: "#eef2ff",
		accent: "#6366f1",
		ink: "#312e81",
		glow: "#c7d2fe",
		image: "/images/page7_img2.webp",
	};
}
function fallbackInsightReferences(article, context = null) {
	const category = article.categoryLabel;
	if (category === "Lamination Tooling") {
		return [
			{
				title: "How HPL panels are made",
				source: "Fundermax",
				href: "https://blog.fundermax.us/how-high-pressure-laminates-are-made",
				note: "Open process reference for laminate manufacturing context.",
			},
			{
				title: "Decorative laminate overview",
				source: "Wikipedia",
				href: "https://en.wikipedia.org/wiki/Decorative_laminate",
				note: "General background only; useful for open terminology alignment.",
			},
			{
				title: "Press plate product overview",
				source: "Outokumpu",
				href: "https://www.outokumpu.com/en/products/specialized-products/press-plate",
				note: "Public reference point for press-plate route language.",
			},
			{
				title: "BIS standards portal",
				source: "Bureau of Indian Standards",
				href: "https://www.bis.gov.in/standards/",
				note: "Public entry point for Indian standards lookup.",
			},
		];
	}
	if (category === "Industrial Tooling") {
		return [
			{
				title: "Press plate product overview",
				source: "Outokumpu",
				href: "https://www.outokumpu.com/en/products/specialized-products/press-plate",
				note: "Useful public reference for tolerance-led press plate positioning.",
			},
			{
				title: "BIS standards portal",
				source: "Bureau of Indian Standards",
				href: "https://www.bis.gov.in/standards/",
				note: "Helpful when translating process requirements into standards lookup.",
			},
			{
				title: "Stainless steels in architecture and design",
				source: "Euro Inox",
				href: "https://www.euro-inox.org/",
				note: "General stainless background for open reference only.",
			},
		];
	}
	if (category === "Decorative Steel" || category === "Decorative Stainless Steel") {
		return [
			{
				title: "Euro Inox surface finishes guide",
				source: "Euro Inox",
				href: "https://www.euro-inox.org/",
				note: "Public reference point for stainless surface terminology.",
			},
			{
				title: "Decorative stainless sourcing note",
				source: "LinkedIn / Moldart",
				href: "https://www.linkedin.com/company/moldartindia",
				note: "Company-level public positioning for decorative stainless routes.",
			},
			{
				title: "BIS standards portal",
				source: "Bureau of Indian Standards",
				href: "https://www.bis.gov.in/standards/",
				note: "Open reference entry point for standards lookup.",
			},
		];
	}
	if (category === "Panel Systems") {
		return [
			{
				title: "Formwork panels overview",
				source: "Doka",
				href: "https://www.doka.com/en/solutions/formwork-beams-panels-props",
				note: "Useful open reference for plywood/formwork orientation.",
			},
			{
				title: "Shuttering plywood reuse guide",
				source: "Haren Ply",
				href: "https://www.harenply.com/types-applications-of-shuttering-plywood/",
				note: "Public market reference for reuse behaviour.",
			},
			{
				title: "EPA composite wood standards",
				source: "US EPA",
				href: "https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products",
				note: "Helpful for emission and composite-wood compliance context.",
			},
		];
	}
	if (category === "Flooring Systems" || category === "Furniture Programmes") {
		return [
			{
				title: "EPA composite wood standards",
				source: "US EPA",
				href: "https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products",
				note: "Open compliance reference for many board-based furniture routes.",
			},
			{
				title: "BIS standards portal",
				source: "Bureau of Indian Standards",
				href: "https://www.bis.gov.in/standards/",
				note: "Public standards lookup entry point.",
			},
			{
				title: "Moldart company page",
				source: "LinkedIn",
				href: COMPANY_LINKEDIN,
				note: "Public company reference used alongside the deeper route notes.",
			},
		];
	}
	return [
		{
			title: "Moldart company page",
			source: "LinkedIn",
			href: COMPANY_LINKEDIN,
			note: "Public company reference.",
		},
		{
			title: "BIS standards portal",
			source: "Bureau of Indian Standards",
			href: "https://www.bis.gov.in/standards/",
			note: "Public standards lookup entry point.",
		},
	];
}
function defaultInsightCards(article, context = null) {
	const product = context?.product;
	const specRows = product
		? product.specs.slice(0, 3).map((spec, index) => specToRow(spec, index))
		: [];
	if (specRows.length) {
		return [
			{
				label: "Technical signal",
				value: specRows[0].label === specRows[0].value
					? specRows[0].value
					: `${specRows[0].label}: ${specRows[0].value}`,
				note: article.type,
			},
			{
				label: "Best-fit route",
				value: product.applications?.[0] || article.categoryLabel,
				note:
					(product.applications || []).slice(1, 3).join(" • ") ||
					"Requirement-led review",
			},
			{
				label: "Programme logic",
				value: product.stage || product.use || article.categoryLabel,
				note: product.summary,
			},
			{
				label: "Use this page for",
				value: article.type,
				note: "Read it against the actual brief, not as a generic substitute.",
			},
		];
	}
	return [
		{ label: "Category", value: article.categoryLabel, note: article.type },
		{
			label: "Use this page for",
			value: "Specification clarity",
			note: "Helpful when the brief is still being tightened.",
		},
		{
			label: "Best fit",
			value: "Buyer + technical review",
			note: "Built to support the next commercial conversation.",
		},
		{
			label: "Read with",
			value: "Actual requirement",
			note: "The article is strongest when read against the real enquiry.",
		},
	];
}
function defaultInsightChart(article, context = null) {
	return {
		title: "How to read this page",
		caption:
			"A practical weighting for the first review rather than a laboratory score.",
		items: [
			{
				label: "Application fit",
				score: 90,
				value: "Start here",
				note: "Check whether the route really fits the end use.",
			},
			{
				label: "Specification clarity",
				score: /Specification|Technical|Guide/i.test(article.type) ? 88 : 74,
				value: "Important",
				note: "Lock the terms before comparing price.",
			},
			{
				label: "Approval discipline",
				score: /Quality|Standards/i.test(article.type) ? 90 : 76,
				value: "Important",
				note: "Reference control reduces late-stage correction.",
			},
			{
				label: "Commercial alignment",
				score: /Buyer|Comparative/i.test(article.type) ? 86 : 70,
				value: "Next step",
				note: "Use the page to improve the RFQ, not replace it.",
			},
		],
	};
}
function getSpecWhyBrief(label, contextTitle = "") {
	const clean = String(label || "").trim().toLowerCase();
	
	if (clean.includes("grade")) {
		return "Ensures material compatibility and durability requirements are met.";
	}
	if (clean.includes("hardness")) {
		return "Directly affects tool lifetime and structural performance under load.";
	}
	if (clean.includes("surface") || clean.includes("roughness")) {
		return "Determines finish consistency and clean release during operation.";
	}
	if (clean.includes("width") || clean.includes("size") || clean.includes("dimension")) {
		return "Defines limit parameters for design and press layouts.";
	}
	if (clean.includes("depth")) {
		return "Controls the depth and detail of the final textured output.";
	}
	if (clean.includes("weight")) {
		return "Essential for logistics planning and substrate weight calculations.";
	}
	if (clean.includes("tensile")) {
		return "Ensures process stability before and during impregnation.";
	}
	if (clean.includes("density")) {
		return "Directly correlates with core strength, impact resistance, and durability.";
	}
	if (clean.includes("thickness")) {
		return "Critical for dimensional fit, alignment, and load capacity.";
	}
	if (clean.includes("strength") || clean.includes("bond")) {
		return "Controls structural integrity under high pressure and usage.";
	}
	if (clean.includes("wear")) {
		return "Determines the lifespan and application fit under daily traffic.";
	}
	if (clean.includes("swell") || clean.includes("moisture")) {
		return "Indicates moisture performance and long-term stability.";
	}
	if (clean.includes("scratch") || clean.includes("abrasion")) {
		return "Ensures the surface remains clean and unmarked in high-use environments.";
	}
	if (clean.includes("precision") || clean.includes("bending") || clean.includes("cnc") || clean.includes("tolerance")) {
		return "Guarantees correct tolerance alignment and seamless assembly.";
	}
	if (clean.includes("finish") || clean.includes("color") || clean.includes("colour")) {
		return "Aligns visual appearance with architectural and project styling.";
	}
	if (clean.includes("flatness")) {
		return "Prevents distortion and ensures even pressure distribution.";
	}
	
	return `Controls the ${clean} performance metric for this sourcing route.`;
}

function defaultInsightTable(article, context = null) {
	const product = context?.product;
	const specRows = product
		? product.specs.slice(0, 4).map((spec, index) => specToRow(spec, index))
		: [];
	if (specRows.length) {
		return {
			title: "Quick technical frame",
			columns: ["Checkpoint", "Reference", "Why it belongs in the brief"],
			rows: specRows.map((row) => [
				row.label,
				row.value,
				getSpecWhyBrief(row.label, article.title),
			]),
		};
	}
	return {
		title: "Review frame",
		columns: ["Step", "What to confirm", "Why it matters"],
		rows: [
			[
				"Application",
				"Where the route really fits",
				"Stops broad comparisons from becoming misleading.",
			],
			[
				"Reference",
				"Drawing, sample, or accepted benchmark",
				"Protects approval quality before order confirmation.",
			],
			[
				"Commercial fit",
				"Quantity, timing, destination, and documents",
				"Keeps the technical path attached to the real project.",
			],
		],
	};
}
function defaultInsightFlow(article, context = null) {
	return {
		title: "Use the article in this order",
		items: [
			"Read the page against the real application, not against a vague product name.",
			"Lock the strongest technical or approval checkpoints into the RFQ.",
			"Compare alternatives only after the route stays like-for-like.",
			"Carry the approved reference into receiving, supply, and repeat ordering.",
		],
	};
}
function resolveInsightDossier(article, context = null) {
	const productDossier = insightDossiers?.byProduct?.[article.category] || {};
	const slugDossier = insightDossiers?.bySlug?.[article.slug] || {};
	return {
		...productDossier,
		...slugDossier,
		cards:
			slugDossier.cards ||
			productDossier.cards ||
			defaultInsightCards(article, context),
		chart:
			slugDossier.chart ||
			productDossier.chart ||
			defaultInsightChart(article, context),
		table:
			slugDossier.table ||
			productDossier.table ||
			defaultInsightTable(article, context),
		flow:
			slugDossier.flow ||
			productDossier.flow ||
			defaultInsightFlow(article, context),
		references: uniqueLinks([
			...(slugDossier.references || []),
			...(productDossier.references || []),
			...fallbackInsightReferences(article, context),
		]),
	};
}
function insightPosterRelativePath(article, ext = "svg") {
	return `/images/insights/${article.slug}.${ext}`;
}
function insightPosterOutputPath(article, ext = "svg") {
	return path.join(WORK, "images", "insights", `${article.slug}.${ext}`);
}
function insightEditorialImageRelativePath(article) {
	const base = `/images/insights/editorial/${article.slug}`;
	for (const ext of ["webp", "jpg", "png"]) {
		const rel = `${base}.${ext}`;
		if (fs.existsSync(path.join(WORK, rel.replace(/^\//, "")))) return rel;
	}
	return "";
}
function insightPreviewImageRaw(article, context = null) {
	const svgPath = insightPosterRelativePath(article, "svg");
	const pngPath = insightPosterRelativePath(article, "png");
	return hasUsableFile(path.join(WORK, svgPath.replace(/^\//, "")))
		? svgPath
		: pngPath;
}
function insightPreviewImage(article, context = null) {
	return socialImageVersionedUrl(insightPreviewImageRaw(article, context));
}
function insightMediaStatus(article) {
	return {
		code: "DETERMINISTIC_DIAGRAM",
		label: "Deterministic editorial diagram — not product, facility, test, or project evidence.",
	};
}

function insightPreviewAlt(article, context = null) {
	return `${article.title} — ${insightMediaStatus(article).label}`;
}
function clampText(text = "", max = 72) {
	const value = String(text || "")
		.replace(/\s+/g, " ")
		.trim();
	if (!value || value.length <= max) return value;
	const cut = value.slice(0, max - 1);
	const safe = cut.includes(" ")
		? cut.slice(0, cut.lastIndexOf(" ")).trim()
		: cut;
	return `${safe || cut}…`;
}
function wrapPosterText(text = "", limit = 22, maxLines = 4) {
	const words = String(text || "")
		.split(/\s+/)
		.filter(Boolean);
	const lines = [];
	let line = "";
	for (let index = 0; index < words.length; index += 1) {
		const word = words[index];
		const next = line ? `${line} ${word}` : word;
		if (next.length <= limit || !line) {
			line = next;
			continue;
		}
		lines.push(line);
		if (lines.length === maxLines - 1) {
			const remaining = [word, ...words.slice(index + 1)].join(" ");
			lines.push(clampText(remaining, limit));
			return lines;
		}
		line = word;
	}
	if (line) lines.push(line);
	return lines.slice(0, maxLines);
}
function renderPosterMetricChips(cards = []) {
	return cards
		.slice(0, 3)
		.map((card, index) => {
			const x = 68 + index * 204;
			return `<rect x="${x}" y="496" width="182" height="64" rx="20" fill="rgba(255,255,255,0.94)" stroke="rgba(24,24,27,0.08)"/><text x="${x + 18}" y="520" font-family="Arial, sans-serif" font-size="12" fill="#71717a" letter-spacing="1.4">${escHtml(clampText(String(card.label || "").toUpperCase(), 18))}</text><text x="${x + 18}" y="546" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">${escHtml(clampText(card.value, 18))}</text>`;
		})
		.join("");
}
function buildInsightPosterSvg(article) {
	const context = articleProductContext(article);
	const dossier = resolveInsightDossier(article, context);
	const theme = insightTheme(article, context);
	const titleLines = wrapPosterText(article.title, 20, 4);
	const noteLines = wrapPosterText(
		clampText(dossier.posterNote || article.excerpt, 108),
		42,
		2,
	);
	const chartItems = (dossier.chart?.items || []).slice(0, 3);
	const titleFont = titleLines.length > 3 ? 44 : 50;
	const titleHtml = titleLines
		.map(
			(line, index) =>
				`<text x="68" y="${170 + index * 58}" font-family="Arial, sans-serif" font-size="${titleFont}" font-weight="700" fill="#18181b">${escHtml(line)}</text>`,
		)
		.join("");
	const noteHtml = noteLines
		.map(
			(line, index) =>
				`<text x="68" y="${422 + index * 28}" font-family="Arial, sans-serif" font-size="22" fill="#52525b">${escHtml(line)}</text>`,
		)
		.join("");
	const chartHtml = chartItems
		.map((item, index) => {
			const y = 180 + index * 108;
			const barWidth = Math.round(198 * ((item.score || 70) / 100));
			return `<text x="776" y="${y - 20}" font-family="Arial, sans-serif" font-size="17" font-weight="700" fill="#18181b">${escHtml(clampText(item.label, 26))}</text><rect x="776" y="${y}" width="214" height="12" rx="6" fill="#e4e4e7"/><rect x="776" y="${y}" width="${barWidth}" height="12" rx="6" fill="${theme.primary}"/><text x="1010" y="${y + 11}" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#18181b">${escHtml(clampText(item.value || `${item.score}`, 12))}</text><text x="776" y="${y + 38}" font-family="Arial, sans-serif" font-size="14" fill="#52525b">${escHtml(clampText(item.note || "", 44))}</text>`;
		})
		.join("");
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
	const browser = await chromium.launch({
		headless: true,
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
	});
	const page = await browser.newPage({
		viewport: { width: 1200, height: 630 },
		deviceScaleFactor: 1,
	});
	for (const task of tasks) {
		await page.goto(pathToFileURL(task.svgPath).href, {
			waitUntil: "domcontentloaded",
			timeout: 60000,
		});
		await page.screenshot({ path: task.pngPath, type: "png" });
		console.log(`  ✓ ${path.relative(WORK, task.pngPath)}`);
	}
	await browser.close();
}
async function generateInsightPosterAssets() {
	const allArticles = rawInsights.articles || [];
	if (!allArticles.length) return;
	mkdirp(path.join(WORK, "images", "insights"));
	const rasterTasks = [];
	for (const article of allArticles) {
		const svg = buildInsightPosterSvg(article);
		const svgPath = insightPosterOutputPath(article, "svg");
		const pngPath = insightPosterOutputPath(article, "png");
		const svgChanged = writeFileIfChanged(svgPath, svg);
		if (!GENERATE_SOCIAL_PNG) continue;
		if (!svgChanged && hasUsableFile(pngPath)) continue;
		if (sharp) {
			const input = Buffer.from(svg);
			await sharp(input).png().toFile(pngPath);
			console.log(`  ✓ ${path.relative(WORK, pngPath)}`);
		} else {
			rasterTasks.push({ svgPath, pngPath });
		}
	}
	await rasterizeSvgSet(rasterTasks);
}
const SITE_SOCIAL_POSTERS = [
	{
		name: "moldart-default",
		kicker: "Moldart",
		title: "One RFQ path for wood, steel + electronics",
		note: "Wood-panel lamination, decorative stainless steel and electronics press systems from a Mumbai technical RFQ desk.",
		chips: ["3 systems", "17 product routes", "Mumbai", "Technical RFQ"],
	},
	{
		name: "moldart-home",
		kicker: "Moldart",
		title: "One RFQ path for wood, steel + electronics",
		note: "PRODUCT, APPLICATION, CONSTRUCTION, QUANTITY, TIMING, DESTINATION AND EVIDENCE IN ONE TECHNICAL BRIEF.",
		chips: ["3 systems", "17 products", "8 solutions", "51 guides"],
	},
	{
		name: "moldart-solutions",
		kicker: "Solutions",
		title: "Application routes before product noise",
		note: "Use the solutions layer when the requirement is still being narrowed at programme level.",
		chips: ["Lamination", "Furniture", "Flooring", "Architecture"],
	},
	{
		name: "moldart-explore",
		kicker: "Explore",
		title: "Search routes, sheets, guides, and documents",
		note: "Use one discovery layer when the keyword is known but the right page still needs to be found.",
		chips: ["Search", "Solutions", "Guides", "Documents"],
	},
	{
		name: "moldart-evidence",
		kicker: "Evidence & QC",
		title: "Samples, documents, inspection and receiving",
		note: "Match each claim and acceptance point to the right product, method, sample, lot and revision.",
		chips: ["Evidence", "Samples", "QC", "Packing"],
	},
	{
		name: "moldart-resources",
		kicker: "Resources",
		title: "References, decks, and decision files",
		note: "A cleaner document layer for approvals, RFQs, and repeat technical checks.",
		chips: ["24 references", "Downloadable", "Searchable", "Support files"],
	},
	{
		name: "moldart-insights",
		kicker: "Insights",
		title: "Technical articles for buyers, teams, and suppliers",
		note: "Long-form guides, route notes, and public references built around real enquiries.",
		chips: [
			"Editorial",
			"Technical routes",
			"Public references",
			"Share-ready",
		],
	},
	{
		name: "moldart-process",
		kicker: "Process",
		title: "From RFQ inputs to approved repeat supply",
		note: "Lock the brief, narrow the route, confirm the reference, and keep the same controls through dispatch and reorder.",
		chips: ["RFQ", "Route", "Approval", "Repeat"],
	},
	{
		name: "moldart-faq",
		kicker: "FAQ",
		title: "Quick answers before the next review",
		note: "Buyer-facing answers on documents, timing, first contact, and what needs to be confirmed before quoting.",
		chips: ["Answers", "Documents", "Timing", "Contact"],
	},
	{
		name: "moldart-about",
		kicker: "About",
		title: "A Mumbai technical and commercial RFQ desk",
		note: "Company role, sourcing controls and contact routes without unsupported scale, facility or history claims.",
		chips: ["Mumbai", "India + China", "Technical review", "Commercial control"],
	},
	{
		name: "moldart-contact",
		kicker: "Contact",
		title: "Share the requirement, choose the channel",
		note: "Use the form, WhatsApp, email, or meeting route when the next step needs a real technical-commercial response.",
		chips: ["WhatsApp", "Email", "Meetings", "Mumbai"],
	},
];
function siteSocialPosterRelativePath(name, ext = "png") {
	if (ext === "png") {
		const pngPath = `/images/social/${name}.png`;
		if (hasUsableFile(path.join(WORK, pngPath.replace(/^\//, "")))) {
			return pngPath;
		}
		return `/images/social/${name}.svg`;
	}
	return `/images/social/${name}.${ext}`;
}
function siteSocialPosterOutputPath(name, ext = "svg") {
	return path.join(WORK, "images", "social", `${name}.${ext}`);
}
function solutionSocialPosterName(slug = "") {
	return `moldart-solution-${slug}`;
}
function productSocialPosterName(productId = "") {
	return `moldart-product-${productId}`;
}
function getSolutionSocialPosterConfigs() {
	return applications.map((app) => {
		const visual = ROUTE_VISUAL_MODELS[app.slug] || {};
		const productNames = app.products
			.map((productId) => getProduct(productId)?.name)
			.filter(Boolean)
			.slice(0, 3);
		const output = (visual.homeOutputs || visual.outputs || []).slice(0, 1);
		return {
			name: solutionSocialPosterName(app.slug),
			kicker: "Solution route",
			title: app.name,
			note: app.overview,
			chips: [...productNames, ...output].slice(0, 4),
			panelLabel: "WORKING STACK",
		};
	});
}
function getProductSocialPosterConfigs() {
	return rawProducts.products.map((product) => ({
		name: productSocialPosterName(product.id),
		kicker: "Product sheet",
		title: product.name,
		note: product.summary,
		chips: [
			product.stage,
			product.use,
			...(product.applications || []).slice(0, 2),
		]
			.filter(Boolean)
			.slice(0, 4),
		panelLabel: "PRODUCT FIT",
	}));
}
function buildHomeSocialSvg(config) {
	const chips = (config.chips || []).filter(Boolean).slice(0, 4);
	const titleLines = wrapPosterText(config.title, 28, 3);
	const noteLines = wrapPosterText(clampText(config.note, 116), 42, 3);
	const heroPrimary =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Crect width='2' height='2' fill='%2318181b'/%3E%3C/svg%3E";
	const heroFloor =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Crect width='2' height='2' fill='%2314532d'/%3E%3C/svg%3E";
	const heroSteel =
		"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Crect width='2' height='2' fill='%231d4ed8'/%3E%3C/svg%3E";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escHtml(config.title)}">
    <defs>
      <linearGradient id="homePosterBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f7f4ee"/>
        <stop offset="100%" stop-color="#efebe6"/>
      </linearGradient>
      <linearGradient id="homePosterPanel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#faf8f5"/>
      </linearGradient>
      <clipPath id="homePosterPrimaryClip"><rect x="706" y="56" width="438" height="302" rx="30"/></clipPath>
      <clipPath id="homePosterSecondaryClip"><rect x="706" y="374" width="212" height="200" rx="26"/></clipPath>
      <clipPath id="homePosterTertiaryClip"><rect x="932" y="374" width="212" height="200" rx="26"/></clipPath>
    </defs>
    <rect width="1200" height="630" rx="36" fill="url(#homePosterBg)"/>
    <rect x="28" y="28" width="1144" height="574" rx="32" fill="url(#homePosterPanel)" stroke="rgba(24,24,27,0.08)"/>
    <text x="70" y="94" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#71717a" letter-spacing="2.2">${escHtml(clampText(String(config.kicker || "Moldart").toUpperCase(), 22))}</text>
    <text x="70" y="124" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#18181b" letter-spacing="1.8">MUMBAI · TECHNICAL RFQ DESK</text>
    ${titleLines.map((line, index) => `<text x="70" y="${214 + index * 58}" font-family="Arial, sans-serif" font-size="50" font-weight="700" fill="#18181b">${escHtml(line)}</text>`).join("")}
    ${noteLines.map((line, index) => `<text x="70" y="${378 + index * 28}" font-family="Arial, sans-serif" font-size="22" fill="#52525b">${escHtml(line)}</text>`).join("")}
    <rect x="70" y="468" width="570" height="94" rx="24" fill="#18181b"/>
    ${chips.map((chip, index) => `<g transform="translate(${92 + (index % 2) * 266} ${495 + Math.floor(index / 2) * 30})"><text x="0" y="0" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="rgba(255,255,255,0.54)">${String(index + 1).padStart(2, "0")}</text><text x="42" y="0" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${escHtml(clampText(chip, 22))}</text></g>`).join("")}
    <text x="70" y="590" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#18181b">moldartindia.com</text>
    <rect x="690" y="40" width="470" height="550" rx="34" fill="#f3efe9" stroke="rgba(24,24,27,0.08)"/>
    <image href="${heroPrimary}" x="706" y="56" width="438" height="302" preserveAspectRatio="xMidYMid slice" clip-path="url(#homePosterPrimaryClip)"/>
    <image href="${heroFloor}" x="706" y="374" width="212" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#homePosterSecondaryClip)"/>
    <image href="${heroSteel}" x="932" y="374" width="212" height="200" preserveAspectRatio="xMidYMid slice" clip-path="url(#homePosterTertiaryClip)"/>
    <rect x="724" y="74" width="196" height="34" rx="17" fill="rgba(255,255,255,0.9)"/>
    <text x="746" y="96" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#18181b" letter-spacing="1.3">WOOD · STEEL · ELECTRONICS</text>
    <rect x="724" y="520" width="406" height="42" rx="21" fill="#ffffff" stroke="rgba(24,24,27,0.08)"/>
    <text x="746" y="546" font-family="Arial, sans-serif" font-size="16" fill="#18181b">Solutions · Resources · Insights · Search</text>
  </svg>`;
}
function buildSiteSocialSvg(config) {
	const chips = (config.chips || []).filter(Boolean).slice(0, 4);
	const titleLines = wrapPosterText(config.title, 26, 3);
	const noteLines = wrapPosterText(clampText(config.note, 108), 38, 2);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escHtml(config.title)}">
    <defs>
      <linearGradient id="posterGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f7f5f2"/>
        <stop offset="100%" stop-color="#ece7e2"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" rx="36" fill="#f5f3ef"/>
    <rect x="28" y="28" width="1144" height="574" rx="34" fill="url(#posterGlow)"/>
    <rect x="46" y="46" width="1108" height="538" rx="30" fill="#ffffff" stroke="rgba(24,24,27,0.08)"/>
    <rect x="70" y="72" width="220" height="36" rx="18" fill="#18181b"/>
    <text x="92" y="95" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="1.7">${escHtml(clampText(String(config.kicker || "Moldart").toUpperCase(), 28))}</text>
    <text x="70" y="146" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#71717a" letter-spacing="2.1">MOLDART</text>
    ${titleLines.map((line, index) => `<text x="70" y="${228 + index * 62}" font-family="Arial, sans-serif" font-size="52" font-weight="700" fill="#18181b">${escHtml(line)}</text>`).join("")}
    ${noteLines.map((line, index) => `<text x="70" y="${410 + index * 30}" font-family="Arial, sans-serif" font-size="23" fill="#52525b">${escHtml(line)}</text>`).join("")}
    <path d="M70 482H650" stroke="rgba(24,24,27,0.10)" stroke-width="1"/>
    <text x="70" y="522" font-family="Arial, sans-serif" font-size="16" fill="#71717a">SPECIFICATION-LED SUPPLY FROM MUMBAI.</text>
    <text x="70" y="554" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="#18181b">moldartindia.com</text>
    <rect x="758" y="72" width="372" height="486" rx="30" fill="#18181b"/>
    <text x="792" y="112" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="rgba(255,255,255,0.72)" letter-spacing="1.8">${escHtml(clampText(config.panelLabel || "PUBLIC PREVIEW", 22))}</text>
    <path d="M792 144H1096" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <path d="M820 180C878 196 944 204 1018 192" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="14" stroke-linecap="round"/>
    <path d="M820 180C872 182 930 188 986 198" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="6" stroke-dasharray="12 14" stroke-linecap="round"/>
    <circle cx="820" cy="180" r="12" fill="#ffffff"/>
    <circle cx="1018" cy="192" r="10" fill="none" stroke="#ffffff" stroke-width="3"/>
    ${chips.map((chip, index) => `<rect x="792" y="${242 + index * 72}" width="304" height="54" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/><text x="820" y="${276 + index * 72}" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.52)">${String(index + 1).padStart(2, "0")}</text><text x="868" y="${276 + index * 72}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${escHtml(clampText(chip, 24))}</text>`).join("")}
    <text x="792" y="534" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.72)">Built for search, sharing, and review.</text>
  </svg>`;
}
async function generateSiteSocialAssets() {
	mkdirp(path.join(WORK, "images", "social"));
	const rasterTasks = [];
	for (const config of [
		...SITE_SOCIAL_POSTERS,
		...getSolutionSocialPosterConfigs(),
		...getProductSocialPosterConfigs(),
	]) {
		const svg = buildSiteSocialSvg(config);
		const svgPath = siteSocialPosterOutputPath(config.name, "svg");
		const pngPath = siteSocialPosterOutputPath(config.name, "png");
		const svgChanged = writeFileIfChanged(svgPath, svg);
		if (!GENERATE_SOCIAL_PNG) continue;
		let hasExpectedPng = false;
		if (hasUsableFile(pngPath)) {
			try {
				const pngHeader = fs.readFileSync(pngPath);
				hasExpectedPng =
					pngHeader.slice(0, 8).toString("hex") === "89504e470d0a1a0a" &&
					pngHeader.readUInt32BE(16) === 1200 &&
					pngHeader.readUInt32BE(20) === 630;
			} catch {
				hasExpectedPng = false;
			}
		}
		if (!svgChanged && hasExpectedPng) continue;
		if (sharp) {
			const input = Buffer.from(svg);
			await sharp(input).png().toFile(pngPath);
			console.log(`  ✓ ${path.relative(WORK, pngPath)}`);
		} else {
			rasterTasks.push({ svgPath, pngPath });
		}
	}
	await rasterizeSvgSet(rasterTasks);
}
function renderInsightCoverCard(article, context = null, options = {}) {
	const src = insightPreviewImage(article, context);
	const loading = options.eager ? "eager" : "lazy";
	const poster = resolveInsightDossier(article, context);
	const media = insightMediaStatus(article);
	return `<figure class="article-cover-figure"><div class="article-cover-card"><img src="${src}" alt="${escHtml(insightPreviewAlt(article, context))}" width="1200" height="630" loading="${loading}"${options.eager ? ' fetchpriority="high"' : ""}><div class="article-cover-overlay"></div><div class="article-cover-badge">${escHtml(poster.posterKicker || article.categoryLabel)}</div></div><figcaption class="article-cover-caption"><strong>${escHtml(media.code.replace(/_/g, " "))}.</strong> ${escHtml(media.label)}</figcaption></figure>`;
}
function renderInsightCardMedia(article, context = null) {
	return `<div class="ui-insight-card-media"><img src="${insightPreviewImage(article, context)}" alt="${escHtml(insightPreviewAlt(article, context))}" width="1200" height="630" loading="lazy"><div class="ui-insight-card-badge">${escHtml(article.type)}</div></div>`;
}
function renderHomeInsightRow(article) {
	return `<a href="/insights/${article.slug}/" class="resource-library-row resource-library-row-guide"><div class="resource-library-row-preview resource-library-row-preview-guide"><img src="${insightPreviewImage(article)}" alt="${escHtml(insightPreviewAlt(article))}" width="1200" height="630" loading="lazy"></div><div class="resource-library-row-copy"><div class="resource-library-row-meta">${glyph("spark", "icon icon-sm")} ${escHtml(article.categoryLabel)}</div><div class="resource-library-row-title">${escHtml(article.title)}</div><div class="resource-library-row-desc">${escHtml(clampText(article.excerpt, 124))}</div></div><div class="resource-library-row-action">Open guide ${glyph("arrow", "icon icon-sm")}</div></a>`;
}
function renderInsightDashboardCards(cards = []) {
	if (!cards.length) return "";
	return `<div class="article-dashboard-grid">${cards.map((card) => `<article class="article-dashboard-card"><div class="article-dashboard-label">${escHtml(card.label)}</div><div class="article-dashboard-value">${escHtml(card.value)}</div><p class="article-dashboard-note">${escHtml(card.note || "")}</p></article>`).join("")}</div>`;
}
function renderInsightChart(chart = null) {
	if (!chart?.items?.length) return "";
	const items = chart.items.slice(0, 4);
	const rowGap = 78;
	const height = 84 + items.length * rowGap;
	const svg = `<svg class="article-chart-svg" viewBox="0 0 460 ${height}" role="img" aria-label="${escHtml(chart.title)}">${items
		.map((item, index) => {
			const y = 38 + index * rowGap;
			const width = Math.max(28, Math.round(248 * ((item.score || 70) / 100)));
			return `<text x="24" y="${y}" class="chart-label">${escHtml(item.label)}</text><rect x="24" y="${y + 14}" width="260" height="12" rx="6" fill="#e4e4e7"></rect><rect x="24" y="${y + 14}" width="${width}" height="12" rx="6" fill="#18181b"></rect><text x="302" y="${y + 25}" class="chart-value">${escHtml(item.value || `${item.score}`)}</text>`;
		})
		.join("")}</svg>`;
	return `<article class="article-visual-card"><div class="article-visual-label">SVG dashboard</div><h3 class="article-visual-title">${escHtml(chart.title)}</h3><p class="article-visual-copy">${escHtml(chart.caption || "")}</p>${svg}<div class="article-chart-notes">${items.map((item) => `<div class="article-chart-note"><strong>${escHtml(item.label)}:</strong> ${escHtml(item.note || "")}</div>`).join("")}</div></article>`;
}
function renderInsightTablePanel(table = null) {
	if (!table?.rows?.length) return "";
	return `<article class="article-visual-card"><div class="article-visual-label">Reference table</div><h3 class="article-visual-title">${escHtml(table.title)}</h3><div class="article-table-wrap"><table><tr>${(table.columns || []).map((column) => `<th>${escHtml(column)}</th>`).join("")}</tr>${table.rows.map((row) => `<tr>${row.map((value) => `<td>${escHtml(value)}</td>`).join("")}</tr>`).join("")}</table></div></article>`;
}
function renderInsightFlowPanel(flow = null) {
	if (!flow?.items?.length) return "";
	return `<section class="article-flow-section"><div class="article-section-head"><div class="ui-kicker mb-3">${glyph("route", "icon icon-sm")} Use this page</div><h2>${escHtml(flow.title)}</h2></div><div class="article-flow-grid">${flow.items.map((item, index) => `<article class="article-flow-card"><div class="article-flow-step">0${index + 1}</div><p>${escHtml(item)}</p></article>`).join("")}</div></section>`;
}
function renderInsightReferences(article, context = null) {
	const references = resolveInsightDossier(article, context).references || [];
	if (!references.length) return "";
	return `<section class="article-reference-section"><div class="article-section-head"><div class="ui-kicker mb-3">${glyph("book", "icon icon-sm")} Public references</div><h2>Reference links and standards context</h2></div><div class="article-reference-grid">${references.map((ref) => `<article class="article-reference-card"><div class="article-reference-source">${escHtml(ref.source || "Reference")}</div><h3>${escHtml(ref.title)}</h3><p>${escHtml(ref.note || "")}</p><a href="${ref.href}" target="_blank" rel="noopener noreferrer" class="site-inline-link">Open reference ${glyph("arrow", "icon icon-sm")}</a></article>`).join("")}</div></section>`;
}
function renderInsightLeadPanels(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	const dashboard = renderInsightDashboardCards(dossier.cards || []);
	const visuals = [
		renderInsightChart(dossier.chart),
		renderInsightTablePanel(dossier.table),
	]
		.filter(Boolean)
		.join("");
	const leadDeck = renderInsightCoverCard(article, context, { eager: true });
	return `${leadDeck}${dashboard ? `<section class="article-dashboard-section">${dashboard}</section>` : ""}${visuals ? `<section class="article-visual-grid">${visuals}</section>` : ""}`;
}

function renderInsightSupportPanels(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	return `${renderInsightFlowPanel(dossier.flow)}${renderInsightReferences(article, context)}`;
}

function renderTechnicalLibraryTable(headers = [], rows = []) {
	return `<table><thead><tr>${headers.map((header) => `<th>${escHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows
		.map(
			(row) =>
				`<tr>${row.map((cell) => `<td>${escHtml(cell)}</td>`).join("")}</tr>`,
		)
		.join("")}</tbody></table>`;
}

function renderTechnicalDecisionCards(cards = []) {
	return `<section class="article-panel"><h2>Decision cards</h2><div class="insight-intent-grid">${cards
		.map(
			(card) =>
				`<article class="insight-intent-card"><div class="ui-kicker mb-3">${escHtml(card.label)}</div><p>${escHtml(card.value)}</p></article>`,
		)
		.join("")}</div></section>`;
}

function renderTechnicalVisualBlock(visual = {}) {
	const steps = Array.isArray(visual.steps) ? visual.steps : [];
	return `<section class="article-panel"><div class="article-panel-label">${escHtml(visual.type || "Visual block")}</div><h2>${escHtml(visual.title || "Buyer control map")}</h2><p>${escHtml(visual.detail || "Use this block to keep the decision route visible before quotation.")}</p>${steps.length ? `<ol>${steps.map((step) => `<li>${escHtml(step)}</li>`).join("")}</ol>` : ""}</section>`;
}

function technicalLibraryDownloadById(id = "") {
	return technicalLibraryDownloads.find((item) => item.id === id) || null;
}

function renderDownloadChecklistCard(downloadId = "") {
	const item = technicalLibraryDownloadById(downloadId);
	if (!item) return "";
	const href = `/downloads/checklists/${item.filename}`;
	return `<section class="article-panel"><div class="article-panel-label">Downloadable checklist</div><h2>${escHtml(item.title)}</h2><p>${escHtml(item.appliesTo)}</p><ul>${item.rows.map((row) => `<li>${escHtml(row)}</li>`).join("")}</ul><a href="${escHtml(href)}" class="btn-outline" download>Download checklist</a></section>`;
}

function publicInsightBySlug(slug = "") {
	return (rawInsights.articles || []).find((item) => item.slug === slug) || null;
}

function relatedArticleLinksFor(article) {
	const related = article.technicalLibrary?.related?.articles || [];
	const links = [];
	const seen = new Set([article.slug]);
	for (const item of related) {
		const match = String(item.href || "").match(/\/insights\/([^/]+)\//);
		const slug = match?.[1] || "";
		const target = publicInsightBySlug(slug);
		if (!target || seen.has(target.slug)) continue;
		seen.add(target.slug);
		links.push({ title: target.title, href: `/insights/${target.slug}/` });
	}
	return links.slice(0, 4);
}

function youtubeVideoTypeLabel(item = {}) {
	return item.type === "short" ? "Short" : item.duration ? item.duration : "Video";
}

function sortYoutubeItems(items = [], slug = "") {
	return [...items].sort((a, b) => {
		const aPrimary = (a.primaryInsightSlugs || []).includes(slug) ? 0 : 1;
		const bPrimary = (b.primaryInsightSlugs || []).includes(slug) ? 0 : 1;
		if (aPrimary !== bPrimary) return aPrimary - bPrimary;
		if (a.type !== b.type) return a.type === "video" ? -1 : 1;
		return String(a.title || "").localeCompare(String(b.title || ""));
	});
}

function youtubeItemById(id) {
	return youtubeLibrary.items.find((item) => item.id === id) || null;
}

function productIdFromHref(href = "") {
	const match = String(href || "").match(/\/products\/([^/]+)\//);
	if (!match) return "";
	const slug = match[1];
	const entry = Object.entries(productMeta).find(([, meta]) => meta.slug === slug);
	return entry?.[0] || "";
}

function insightProductIds(article = {}) {
	const values = new Set();
	if (article.category && productMeta[article.category]) values.add(article.category);
	const relatedProductId = productIdFromHref(
		article.technicalLibrary?.related?.product?.href,
	);
	if (relatedProductId) values.add(relatedProductId);
	const haystack = `${article.slug || ""} ${article.title || ""} ${article.category || ""} ${article.categoryLabel || ""}`.toLowerCase();
	const addWhen = (pattern, ids) => {
		if (pattern.test(haystack)) ids.forEach((id) => values.add(id));
	};
	addWhen(/press[-\s]?pad|heat|pressure equal/i, ["press-pads"]);
	addWhen(/press[-\s]?plate|chrome|lamination|tooling|flatness|pcb|ccl/i, [
		"press-plates",
		"industrial-press-plates",
	]);
	addWhen(/decor paper|printed|gravure|cylinder|doctor blade|melamine|hpl|lpl|cpl|veneer|pet|acrylic/i, [
		"decor-paper",
		"engraved-cylinders",
	]);
	addWhen(/mdf|hdf|fiber|particle|plywood|osb|board|formwork|shuttering|furniture/i, [
		"fiberboard",
		"particleboard",
		"plywood",
		"osb",
	]);
	addWhen(/floor/i, ["wood-flooring", "flooring-accessories"]);
	addWhen(/steel|stainless|pvd|ss[-\s]?|anti-fingerprint/i, [
		"decorative-panels",
		"ss-profiles",
		"ss-furniture",
	]);
	return normalizeStringArray([...values]);
}

function videosForInsightSlug(slug, limit = 4) {
	if (!slug) return [];
	const matches = youtubeLibrary.items.filter((item) => {
		const primary = (item.primaryInsightSlugs || []).includes(slug);
		const genericBrandVideo = /corporate overview|integrated precision/i.test(
			`${item.title || ""} ${item.topic || ""}`,
		);
		return primary && !genericBrandVideo;
	});
	return sortYoutubeItems(matches, slug).slice(0, limit);
}

function videosForProduct(productId, limit = 4) {
	if (!productId) return [];
	const matches = youtubeLibrary.items.filter((item) =>
		(item.productIds || []).includes(productId),
	);
	return sortYoutubeItems(matches).slice(0, limit);
}

function fallbackYoutubeForInsight(article = {}) {
	const haystack = `${article.slug || ""} ${article.title || ""} ${article.category || ""} ${article.categoryLabel || ""}`.toLowerCase();
	const byId = (id) => youtubeItemById(id);
	if (/press[-\s]?pad|copper[-\s]?silicone/.test(haystack)) return byId("1qughskaUs4");
	if (/industrial|tooling|flatness|pcb|ccl|tolerance/.test(haystack)) return byId("R54Ad3j0-28");
	if (/chrome|press[-\s]?plate|texture|defect|lamination/.test(haystack)) return byId("cCvMAH7sxJI");
	if (/decor paper|printed|gravure|cylinder|doctor blade|print/.test(haystack)) return byId("jzC_qVBhlEs") || byId("MTlQYi_NWfk");
	if (/hpl|lpl|melamine|laminate|veneer|pet|acrylic/.test(haystack)) return byId("Evs0x1WbuL4");
	if (/floor/.test(haystack)) return byId("hBA8HDYfufM");
	if (/mdf|hdf|fiber|particle|plywood|osb|board|formwork|shuttering|furniture/.test(haystack)) return byId("89dWWwoYNCs");
	if (/steel|stainless|pvd|ss[-\s]?|anti-fingerprint/.test(haystack)) return byId("QoqM8_e9Kgw");
	if (/rfq|supplier|document|sample|china|price|fob|approval|sourcing/.test(haystack)) return byId("QoqM8_e9Kgw");
	return byId("QoqM8_e9Kgw") || youtubeLibrary.items[0] || null;
}

function bestVideoForInsight(article = {}) {
	// A specialist page must not inherit a generic corporate or product video.
	// Render a video only when the library maps that exact insight slug to it.
	return videosForInsightSlug(article.slug, 1)[0] || null;
}

function videoForInsight(article = {}) {
	const selected = bestVideoForInsight(article);
	return selected ? [selected] : [];
}

function renderRelatedYoutubeVideos(videos = [], options = {}) {
	if (!videos.length) return "";
	const title = options.title || "Related technical videos";
	const intro =
		options.intro ||
		"Use these Moldart YouTube explainers as quick visual context before reviewing the checklist or sending an RFQ.";
	return `<section class="youtube-panel article-panel">
      <div class="article-panel-label">YouTube reference</div>
      <h2>${escHtml(title)}</h2>
      <p>${escHtml(intro)}</p>
      <div class="youtube-card-grid">
        ${videos
			.map(
				(item) => `<a class="youtube-card" href="${escHtml(item.url)}" target="_blank" rel="noopener noreferrer">
          <span class="youtube-card-type">${escHtml(youtubeVideoTypeLabel(item))}</span>
          <strong>${escHtml(item.title)}</strong>
          <span>${escHtml(item.topic || "Moldart technical video")}</span>
          <em>Open on YouTube</em>
        </a>`,
			)
			.join("")}
      </div>
    </section>`;
}

function renderRelatedGuides(article) {
	const related = article.technicalLibrary?.related || {};
	const articleLinks = relatedArticleLinksFor(article);
	const linkRows = [
		related.product
			? `<a href="${escHtml(related.product.href)}" class="article-panel-chip">Product: ${escHtml(related.product.title)}</a>`
			: "",
		related.application
			? `<a href="${escHtml(related.application.href)}" class="article-panel-chip">Application: ${escHtml(related.application.title)}</a>`
			: "",
		...articleLinks.map(
			(item) =>
				`<a href="${escHtml(item.href)}" class="article-panel-chip">Guide: ${escHtml(item.title)}</a>`,
		),
		related.rfq
			? `<a href="${escHtml(related.rfq.href)}" class="article-panel-chip">${escHtml(related.rfq.title)}</a>`
			: `<a href="/contact/?intent=buyer-rfq" class="article-panel-chip">RFQ page</a>`,
	].filter(Boolean);
	return `<section class="article-panel"><h2>Related guides</h2><div class="article-panel-chip-row">${linkRows.join("")}</div></section>`;
}

function renderRfqInputCard(rfqInput = {}) {
	const rows = Object.entries(rfqInput || {});
	if (!rows.length) return "";
	return `<section class="article-panel"><h2>Article-specific RFQ inputs</h2>${renderTechnicalLibraryTable(
		["Input", "What to send"],
		rows,
	)}</section>`;
}

function renderTechnicalLibraryArticle(article) {
	const library = article.technicalLibrary;
	const workflow = library.approvalWorkflow || [];
	const mistakes = library.mistakes || [];
	const quickMetrics = [
		["Specification checks", library.specMatrix?.length || 0],
		["Risk conditions", library.defectRisk?.length || 0],
		["Document decisions", library.documentChecklist?.length || 0],
		["Approval steps", workflow.length],
	];
	return `
    <section class="article-quick-metrics" aria-label="Guide coverage">${quickMetrics.map(([label, value]) => `<article><strong>${escHtml(value)}</strong><span>${escHtml(label)}</span></article>`).join("")}</section>
    <section class="article-panel">
      <div class="article-panel-label">Decision summary</div>
      <h2>${escHtml(library.decisionHeadline)}</h2>
      <p><strong>${escHtml(library.buyerDecision)}</strong></p>
      <p>${escHtml(library.positioning)}</p>
    </section>
    <section class="article-panel article-evidence-panel">
      <div class="article-panel-label">Scope and evidence boundary</div>
      <p><strong>Applies to:</strong> ${escHtml(library.scope)}</p>
      <p><strong>Does not establish:</strong> ${escHtml(library.exclusions)}</p>
      <p><strong>Evidence status:</strong> ${escHtml(library.evidenceStatus)}</p>
    </section>
    ${renderTechnicalDecisionCards(library.decisionCards)}
    <section class="article-panel">
      <h2>Context checks</h2>
      ${renderTechnicalLibraryTable(["Context", "Recommended route", "Risk level", "Buyer check"], library.applicationFit)}
    </section>
    <section class="article-panel">
      <h2>Specification and evidence matrix</h2>
      ${renderTechnicalLibraryTable(["Parameter", "Decision or reference", "Why it matters", "Evidence before approval"], library.specMatrix)}
    </section>
    ${renderTechnicalVisualBlock(library.visualBlock)}
    ${!library.visualBlock && workflow.length ? `<section class="article-panel"><h2>Approval workflow</h2><ol>${workflow.map((step) => `<li>${escHtml(step)}</li>`).join("")}</ol></section>` : ""}
    <section class="article-panel">
      <h2>Defect and risk map</h2>
      ${renderTechnicalLibraryTable(["Issue", "Likely cause", "Buyer check", "Hold, reject, or rework action"], library.defectRisk)}
    </section>
    <section class="article-panel">
      <h2>Document applicability</h2>
      ${renderTechnicalLibraryTable(["Document", "Status", "Applies to", "Buyer check"], library.documentChecklist)}
    </section>
    ${renderRfqInputCard(library.rfqInput)}
    ${mistakes.length ? `<section class="article-panel"><h2>Article-specific watch-outs</h2><ul>${mistakes.slice(0, 6).map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></section>` : ""}
    ${renderRelatedGuides(article)}
    ${renderRelatedYoutubeVideos(videoForInsight(article), {
				title: "Article-specific video",
				intro: "This video is shown only because it is mapped to this exact guide. Confirm its scope against the approved programme record.",
			})}
    ${renderDownloadChecklistCard(library.download)}
    <section class="article-panel">
      <div class="article-panel-label">Next step</div>
      <p><strong>${escHtml(library.cta)}</strong></p>
      <a href="/contact/?intent=buyer-rfq" class="btn-primary">Share RFQ context</a>
    </section>`;
}
// safeJson() removed — search data now written to external JSON file

function getApplicationVisual(slug) {
	const app = applications.find((item) => item.slug === slug);
	for (const productId of app?.products || []) {
		const product = getProduct(productId);
		const review = reviewProductMedia(product);
		if (review?.image) {
			return {
				image: review.image,
				alt: `${product.name} — ${reviewMediaStatusLabel(review.status).toLowerCase()}`,
				eyebrow: reviewMediaStatusLabel(review.status),
				reviewStatus: review.status,
				productName: product.name,
			};
		}
	}
	return (
		applicationVisuals[slug] || {
			image: "/images/page5_img3.webp",
			alt: "Moldart application visual",
			eyebrow: "Application overview",
		}
	);
}

function safeProductMetaDesc(product) {
	const uses = (product.applications || []).slice(0, 1).join(", ");
	const fallback = `${product.name} from Moldart. Specification notes, document references, and RFQ-led supply support${uses ? ` for ${uses}` : ""}.`;
	const supplied = String(product.metaDesc || "").trim();
	return clampText(supplied.length >= 70 ? supplied : `${supplied} ${fallback}`.trim(), 158);
}

function approvedProductImage(product) {
	if (!product?.image) return "";
	return [
		"APPROVED_REAL",
		"APPROVED_EDITED_REAL",
		"APPROVED_DIAGRAM",
		"USE_EXISTING",
	].includes(String(product.mediaStatus || "").trim())
		? product.image
		: "";
}

function reviewProductMedia(product) {
	if (!product) return null;
	const record = visualPrototypeMediaById.get(product.id);
	if (!record?.image) return null;
	if (!["USE_EXISTING_REFERENCE", "DIAGRAM", "VIDEO_THUMBNAIL"].includes(record.status)) return null;
	return record;
}

function reviewMediaStatusLabel(status) {
	return status === "USE_EXISTING_REFERENCE"
		? "Representative image"
		: status === "VIDEO_THUMBNAIL"
			? "Video reference"
			: "Route diagram";
}

function renderOpenLicenseReferences(route) {
	const items = openLicenseMediaByRoute.get(route) || [];
	if (!items.length) return "";
	return `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up open-license-reference-section">
		<div class="ui-section-head mb-8">
			<div class="ui-kicker mb-4">${glyph("image", "icon icon-sm")} Open-license context</div>
			<h2 class="ui-section-title">MATERIAL REFERENCES, NOT STOCK EVIDENCE.</h2>
			<p class="ui-section-subtitle">These independently licensed images help explain the material or application. They do not depict Moldart inventory, a named supplier, an approved sample, test evidence or a completed project.</p>
		</div>
		<div class="open-license-reference-grid">${items.map((item) => `<figure class="product-media-figure open-license-reference-card"><picture><source srcset="${item.avif}" type="image/avif"><source srcset="${item.src}" type="image/webp"><img src="${item.jpg}" alt="${escHtml(item.alt)}" width="1600" height="1200" loading="lazy"></picture><figcaption><strong>${escHtml(item.caption)}</strong><span>Photo: ${escHtml(item.author)} · <a href="${escHtml(item.sourcePage)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a> · <a href="${escHtml(item.licenseUrl)}" target="_blank" rel="license noopener noreferrer">${escHtml(item.license)}</a> · ${escHtml(item.changes)}</span></figcaption></figure>`).join("")}</div>
	</section>`;
}

function reviewMediaBuyerCaption(status) {
	return status === "DIAGRAM"
		? "Illustrative route diagram — confirm the exact construction and acceptance basis in your RFQ."
		: "Representative family image — confirm the exact grade, construction, dimensions and availability in your RFQ.";
}

function productRfqInputs(product) {
	return [
		...(product.specs || []).map((item) => stripMarkdownInline(item)),
		"Required quantity and unit, target timing, destination and Incoterm if known",
		"Reference sample, drawing, finish master, pattern code or previous approval record",
		"Documents and inspection evidence required before order or dispatch",
	];
}

function productApprovalRisks(product) {
	const firstApp = product.applications?.[0] || "the final application";
	return [
		"Quoting before the approval reference is named",
		`Comparing options outside ${firstApp}`,
		"Treating finish, tolerance, or receiving checks as after-order details",
		"Losing the approved sample, drawing revision, or document trail before reorder",
	];
}

function renderProductRfqControlSection(product) {
	const inputs = productRfqInputs(product);
	const risks = productApprovalRisks(product);
	const confirms = [
		"whether the route should stay standard, custom, or sample-led",
		"which reference files should be reviewed before commercial closure",
		"which checks should remain visible for dispatch, receiving, and repeat supply",
	];
	return `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("message", "icon icon-sm")} RFQ readiness</div>
                <h2 class="ui-section-title">MAKE THE FIRST ENQUIRY<br>USEFUL.</h2>
                <p class="ui-section-subtitle">A stronger RFQ reduces quote revisions, approval drift, and repeat-order confusion. Use this checklist before sending ${escHtml(product.name.toLowerCase())} requirements.</p>
            </div>
            <div class="ui-library-grid">
                <article class="ui-library-card"><div class="ui-kicker mb-3">${glyph("check", "icon icon-sm")} Send first</div><ul class="ui-stack-list mt-5">${inputs.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article>
                <article class="ui-library-card"><div class="ui-kicker mb-3">${glyph("shield", "icon icon-sm")} Avoid</div><ul class="ui-stack-list mt-5">${risks.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article>
                <article class="ui-library-card"><div class="ui-kicker mb-3">${glyph("route", "icon icon-sm")} Moldart confirms</div><ul class="ui-stack-list mt-5">${confirms.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul><div class="mt-6"><a href="${withQuery("/contact/", { intent: "buyer-rfq", product: product.name })}" class="btn-outline">Start product RFQ</a></div></article>
            </div>
          </section>`;
}

function compactSeoTitle(value, suffix = " | Moldart", max = 68) {
	const clean = String(value || "")
		.replace(/\s+/g, " ")
		.trim();
	if (!clean) return `Moldart${suffix}`;
	if (`${clean}${suffix}`.length <= max) return `${clean}${suffix}`;
	const limit = Math.max(18, max - suffix.length - 1);
	const words = clean.split(" ");
	let out = "";
	for (const word of words) {
		const next = out ? `${out} ${word}` : word;
		if (next.length > limit) break;
		out = next;
	}
	return `${out || clean.slice(0, limit).trim()}${suffix}`;
}

function insightMetaDescription(article = {}) {
	const candidates = [
		article.metaDesc,
		article.excerpt,
		article.intent,
		article.confirmFirst
			? `Buyer decision sheet for ${article.title}: confirm ${article.confirmFirst} before RFQ, approval, or receiving review.`
			: "",
		article.title
			? `Buyer decision sheet for ${article.title}. Use it to confirm fit, documents, approval checks, and RFQ inputs before commercial review.`
			: "",
	];
	const clean = candidates
		.map((value) =>
			String(value || "")
				.replace(/\s+/g, " ")
				.trim(),
		)
		.find((value) => value.length >= 70);
	return clampText(
		clean ||
			candidates.find(Boolean) ||
			"Moldart buyer decision sheet for RFQ, approval, receiving, and specification control.",
		155,
	)
		.replace(/…$/, ".")
		.replace(/'/g, "’");
}

function standardsText(technical = {}) {
	const standards = (technical.certifications || []).filter(Boolean);
	return standards.length ? standards.join(", ") : "Confirmed per enquiry";
}

function slugify(value) {
	return String(value || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function safeHref(value = "") {
	return encodeURI(value);
}

function hostedDownloadHref(item = {}) {
	const url = String(item.url || "").trim();
	if (!url) return "";
	if (LARGE_DOWNLOAD_PATHS.has(url)) {
		return `https://github.com/thisisyashdoshi/moldart-home/raw/${PUBLIC_DOWNLOAD_BRANCH}${encodeURI(url)}`;
	}
	return safeHref(url);
}

function isRequestOnlyResource(item = {}) {
	return item.access === "request" && !hostedDownloadHref(item);
}

function requestDocumentHref(item = {}) {
	const title = item.title || "Document request";
	const message = item.note
		? `Please share the resource: ${title}. ${item.note}`
		: `Please share the resource: ${title}.`;
	return `/contact/?product=${encodeURIComponent(title)}&focus=document-request&message=${encodeURIComponent(message)}`;
}

function resourceHref(item = {}) {
	return isRequestOnlyResource(item)
		? requestDocumentHref(item)
		: hostedDownloadHref(item);
}

function glyph(name, className = "icon") {
	const icons = {
		spark:
			'<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/><path d="M19 15l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8.8-1.7z"/>',
		layers:
			'<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',
		compass:
			'<circle cx="12" cy="12" r="9"/><path d="m16 8-5.5 2.5L8 16l5.5-2.5L16 8z"/>',
		book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
		grid:
			'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
		message:
			'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
		shield:
			'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
		route:
			'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h4a4 4 0 0 0 4-4V7"/>',
		map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
		factory:
			'<path d="M3 21h18"/><path d="M5 21V9l5 3V9l5 3V6l4 3v12"/><path d="M9 21v-4h2v4"/>',
		building:
			'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h1"/><path d="M12 7h1"/><path d="M16 7h1"/><path d="M8 11h1"/><path d="M12 11h1"/><path d="M16 11h1"/><path d="M8 15h1"/><path d="M12 15h1"/><path d="M16 15h1"/>',
		globe:
			'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>',
		clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
		mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
		phone:
			'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.61a2 2 0 0 1-.45 2.11L8 9.62a16 16 0 0 0 6.38 6.38l1.18-1.23a2 2 0 0 1 2.11-.45c.84.29 1.71.5 2.61.62A2 2 0 0 1 22 16.92z"/>',
		calendar:
			'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
		"linkedin-brand":
			'<circle cx="4" cy="4" r="1.25"/><rect x="2.75" y="8" width="2.5" height="10" rx="1"/><path d="M9 8h2.5v1.8A3.3 3.3 0 0 1 14.3 8C17 8 18 9.7 18 12.3V18h-2.6v-5.1c0-1.4-.5-2.3-1.9-2.3-1 0-1.7.7-2 1.5-.1.2-.1.6-.1.9V18H9z"/>',
		"whatsapp-brand":
			'<path d="M20 11.2A8.8 8.8 0 0 1 7.3 19l-3.3.8.9-3.1A8.8 8.8 0 1 1 20 11.2Z"/><path d="M9 8.8c.2 1.8 1.7 3.8 3.8 5.1"/><path d="m12.7 13 1.3-.5"/><path d="m10.1 10.2.8-1"/>',
		"x-brand": '<path d="M4 4l16 16"/><path d="M20 4 4 20"/>',
		"facebook-brand":
			'<path d="M14 21v-7h3l1-4h-4V8.4c0-1.1.4-2.1 2.1-2.1H18V3.1c-.3 0-1.4-.1-2.7-.1-2.8 0-4.8 1.7-4.8 4.9V10H7v4h3.5v7"/>',
		copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><rect x="4" y="4" width="11" height="11" rx="2"/>',
		file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
		search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
		close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
		arrow: '<path d="M7 17 17 7"/><path d="M9 7h8v8"/>',
	};
	return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
}

function familyIconName(title) {
	if (title === "Lamination Tooling") return "layers";
	if (title === "Engineered Wood Substrates") return "factory";
	if (title === "Flooring & Furniture Programmes") return "compass";
	if (title === "Decorative Stainless Steel") return "spark";
	return "shield";
}

function applicationIconName(slug) {
	if (slug === "lamination") return "layers";
	if (slug === "furniture") return "factory";
	if (slug === "flooring") return "compass";
	if (slug === "architecture") return "building";
	if (slug === "metal-finishing") return "spark";
	return "shield";
}

function renderMetricCard({
	icon,
	label,
	value,
	note = "",
	suffix = "",
	animate = false,
}) {
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
      <div class="ui-proof-label">${glyph(familyIconName(family.title), "icon icon-sm")} ${escHtml(family.title)}</div>
      <div class="ui-proof-value">${escHtml(family.highlights[0])}</div>
      <p class="ui-proof-copy">${escHtml(family.intro)}</p>
  </a>`;
}

function getInsightSlugs() {
	return new Set(rawInsights.articles.map((article) => article.slug));
}

function decodeHtmlText(value = "") {
	return String(value || "")
		.replace(/<[^>]+>/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function getRetainedLegacyInsightArticles() {
	const currentSlugs = getInsightSlugs();
	const insightsDir = path.join(WORK, "insights");
	if (!fs.existsSync(insightsDir)) return [];
	return fs
		.readdirSync(insightsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !currentSlugs.has(entry.name))
		.map((entry) => {
			const file = path.join(insightsDir, entry.name, "index.html");
			if (!fs.existsSync(file)) return null;
			const html = fs.readFileSync(file, "utf8");
			const robots = (html.match(/<meta name="robots" content="([^"]+)"/i) || [])[1] || "";
			const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1] || "";
			const hasRefresh = /http-equiv=["']refresh["']/i.test(html);
			if (!/\bindex\s*,\s*follow\b/i.test(robots)) return null;
			if (hasRefresh) return null;
			if (canonical !== `${SITE}/insights/${entry.name}/`) return null;
			const title = decodeHtmlText((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || entry.name);
			const description = decodeHtmlText((html.match(/<meta name="description" content="([^"]+)"/i) || [])[1] || title);
			return {
				slug: entry.name,
				title: title.replace(/\s*\|\s*Moldart.*$/i, ""),
				categoryLabel: "Technical Insight",
				type: "Guide",
				tags: entry.name.split("-").filter(Boolean),
				excerpt: description,
				legacyRetained: true,
			};
		})
		.filter(Boolean)
		.sort((a, b) => a.slug.localeCompare(b.slug));
}

function getPublishedInsightArticles() {
	const currentSlugs = getInsightSlugs();
	const retained = getRetainedLegacyInsightArticles().filter(
		(article) => !currentSlugs.has(article.slug),
	);
	return [...rawInsights.articles, ...retained];
}

function escapeRegExp(value = "") {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function repairRetainedLegacyInsightFile(file) {
	if (!fs.existsSync(file)) return;
	let html = fs.readFileSync(file, "utf8");
	let next = html;
	const tocLinks = [
		...html.matchAll(/<a href="#([^"]+)" class="article-toc-link">([\s\S]*?)<\/a>/gi),
	];
	for (const match of tocLinks) {
		const id = match[1];
		const label = match[2];
		const exactH2 = `<h2>${label}</h2>`;
		const exactH3 = `<h3>${label}</h3>`;
		if (next.includes(exactH2)) {
			next = next.replace(exactH2, `<h2 id="${id}">${label}</h2>`);
			continue;
		}
		if (next.includes(exactH3)) {
			next = next.replace(exactH3, `<h3 id="${id}">${label}</h3>`);
			continue;
		}
		const headingPattern = new RegExp(
			`<h([2-3])((?:(?!id=)[^>])*)>${escapeRegExp(label)}<\\/h\\1>`,
			"i",
		);
		next = next.replace(headingPattern, `<h$1$2 id="${id}">${label}</h$1>`);
	}
	if (next !== html) writeFile(file, next);
}

function getSearchEntries() {
	const pageIconMap = {
		Home: "home",
		Solutions: "compass",
		Explore: "search",
		Resources: "book",
		Insights: "spark",
		FAQ: "message",
		About: "building",
		Contact: "message",
	};

	const productIcon = (product) => {
		if (product.id === "industrial-press-plates") return "shield";
		if (product.material === "Steel") return "spark";
		if (product.use === "Tooling") return "layers";
		if (product.use === "Panel") return "factory";
		if (product.use === "Surface") return "compass";
		return "layers";
	};

	const insightIcon = (article) => {
		if (article.categoryLabel === "Lamination Tooling") return "layers";
		if (article.categoryLabel === "Industrial Tooling") return "shield";
		if (
			article.categoryLabel === "Decorative Steel" ||
			article.categoryLabel === "Decorative Stainless Steel"
		)
			return "spark";
		if (article.categoryLabel === "Panel Systems") return "factory";
		if (article.categoryLabel === "Flooring Systems") return "compass";
		if (article.categoryLabel === "Furniture Programmes") return "building";
		if (article.categoryLabel === "RFQ & Sourcing Control") return "message";
		if (article.categoryLabel === "Printed Decor Paper & Cylinders") return "layers";
		if (article.categoryLabel === "Decorative Surfaces") return "compass";
		if (article.categoryLabel === "Formwork / Shuttering") return "building";
		return "book";
	};

	const pageEntries = [
		{
			group: "Page",
			title: "Home",
			url: "/",
			meta: "Home and overview",
			keywords: ["home", "overview"],
			icon: pageIconMap.Home,
		},
		...primaryPages.map((page) => ({
			group: "Page",
			...page,
			icon: pageIconMap[page.title] || "book",
		})),
		{
			group: "Page",
			title: "Privacy Notice",
			url: "/privacy/",
			meta: "How Moldart handles website and enquiry data",
			keywords: ["privacy", "personal data", "enquiry data", "DPDP"],
			icon: "shield",
		},
		{
			group: "Page",
			title: "Website Terms",
			url: "/terms/",
			meta: "Terms for using the Moldart public website",
			keywords: ["terms", "website use", "RFQ", "legal"],
			icon: "file",
		},
	];

	const familyEntries = portfolioFamilies.map((family) => ({
		group: "Product Family",
		title: family.title,
		url: "/solutions/",
		meta: family.highlights[0] || family.intro || "Technical product system",
		keywords: [...family.products, ...family.sectors],
		icon: familyIconName(family.title),
	}));

	const productEntries = rawProducts.products.map((product) => {
		const meta = getMeta(product.id);
		return {
			group: "Product",
			title: product.name,
			url: meta ? `/products/${meta.slug}/` : "/products/",
			meta: `${product.stage} · ${product.use}`,
			keywords: [
				product.material,
				product.stage,
				product.use,
				...product.industry,
				...product.applications,
				...product.specs,
			],
			icon: productIcon(product),
		};
	});

	const appEntries = applications.map((app) => ({
		group: "Solution",
		title: app.name,
		url: getSolutionHref(app.slug),
		meta: getApplicationVisual(app.slug).eyebrow,
		keywords: [...app.products, ...app.considerations],
		icon: applicationIconName(app.slug),
	}));

	const resourceEntries = resourceGroups.flatMap((group) =>
		group.items.map((item) => ({
			group: "Resource",
			title: item.title,
			url: resourceHref(item),
			meta: `${group.title} · ${isRequestOnlyResource(item) ? "Request file" : "PDF"}`,
			keywords: [
				group.title,
				item.desc,
				item.note || "",
				isRequestOnlyResource(item) ? "request file" : "download",
				"catalog",
				"pdf",
			],
			icon: "file",
			downloadable: !isRequestOnlyResource(item),
		})),
	);

	const insightEntries = getPublishedInsightArticles().map((article) => ({
		group: "Insight",
		title: article.title,
		url: `/insights/${article.slug}/`,
		meta: `${article.categoryLabel} · ${article.type}`,
		keywords: [
			article.categoryLabel,
			article.type,
			...article.tags,
			article.excerpt,
		],
		icon: insightIcon(article),
	}));

	const allEntries = [
		...pageEntries,
		...familyEntries,
		...productEntries,
		...appEntries,
		...resourceEntries,
		...insightEntries,
	];
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
	return `<div class="hero-network-card hero-world-map" aria-label="Directional programme map">
      <svg class="hero-network-svg" viewBox="0 0 960 620" role="img" aria-label="Directional world map placing Mumbai separately from India, with India and China as sourcing anchors and softer illustrative lanes in the background">
          <defs>
              <linearGradient id="routeFade" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#18181b" stop-opacity="0.96"></stop>
                  <stop offset="100%" stop-color="#71717a" stop-opacity="0.22"></stop>
              </linearGradient>
              <linearGradient id="routeSoft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#52525b" stop-opacity="0.28"></stop>
                  <stop offset="100%" stop-color="#d4d4d8" stop-opacity="0.08"></stop>
              </linearGradient>
          </defs>
          <rect x="0" y="0" width="960" height="620" rx="34" fill="#fafafa"></rect>
          <g class="hero-world-continents">
              <path d="M96 194c28-44 72-68 130-72 36-3 67 5 91 24 21 17 32 37 32 59 0 18-10 34-29 47-25 17-45 34-58 51-17 21-40 32-69 32-42 0-78-14-106-40-25-23-23-56 9-101z"></path>
              <path d="M238 342c27 12 47 35 59 67 12 31 11 63-2 92-12 26-28 50-46 73-11 14-25 20-41 17-14-5-20-20-20-45 0-29 7-57 21-85 9-17 14-35 16-54 2-21 8-42 13-65z"></path>
              <path d="M388 146c25-15 57-22 90-19 21 2 39 10 54 23 13 13 15 28 6 44-9 16-25 26-47 30-21 4-38 13-50 27-10 11-22 16-36 16-22 0-40-8-54-23-14-16-18-32-11-49 6-18 23-34 48-49z"></path>
              <path d="M456 272c29 5 54 18 73 40 22 23 35 52 39 86 3 26-1 49-14 70-14 21-33 32-58 31-24-2-44-15-60-38-16-23-24-52-24-87 0-36 6-64 18-82 8-10 17-17 26-20z"></path>
              <path d="M544 114c34-23 78-35 132-35 37 0 70 7 100 21 34 16 52 40 53 72 1 24-8 43-28 57-27 18-49 37-65 57-15 19-34 30-57 34-26 4-49-3-70-20-19-16-31-38-37-66-6-31 0-59 18-85 12-18 24-32 34-44 7-7 14-13 22-16z"></path>
              <path d="M762 360c24 3 45 13 63 29 20 16 31 38 34 65 2 18-3 34-14 46-14 13-32 17-54 12-22-5-40-18-55-39-14-20-20-42-17-66 2-20 11-37 27-51 6-5 12-8 16-8z"></path>
          </g>
          <g class="hero-world-india-shape-group">
              <path class="hero-india-shape" d="M606 240c10 6 16 16 18 30 3 12 10 22 21 30 3 2 3 7 1 11-8 10-17 20-26 30-7 9-10 20-9 32 1 9-3 14-10 12-8-2-15-9-22-21-6-12-12-22-18-29-5-6-6-12-3-19 4-7 9-15 15-23 7-8 10-18 12-29 2-11 9-20 21-24z"></path>
          </g>
          <g class="hero-world-routes">
              <path class="hero-world-route hero-world-route-primary" d="M590 292C603 272 614 255 622 244"></path>
              <path class="hero-world-route hero-world-route-primary" d="M590 292C629 278 670 258 714 234"></path>
              <path class="hero-world-route hero-world-route-soft" d="M590 292C476 246 336 206 154 186"></path>
              <path class="hero-world-route hero-world-route-soft" d="M590 292C442 308 326 355 228 434"></path>
              <path class="hero-world-route hero-world-route-soft" d="M590 292C524 248 468 200 410 152"></path>
              <path class="hero-world-route hero-world-route-soft" d="M590 292C674 316 752 362 836 414"></path>
          </g>
          <g class="hero-world-nodes">
              <circle class="hero-world-pulse" cx="590" cy="292" r="24"></circle>
              <circle class="hero-world-node hero-world-node-primary" cx="590" cy="292" r="10"></circle>
              <circle class="hero-world-node hero-world-node-source" cx="622" cy="244" r="9"></circle>
              <circle class="hero-world-node hero-world-node-source" cx="714" cy="234" r="9"></circle>
          </g>
          <g class="hero-label-group">
              <path class="hero-node-pointer" d="M590 278l-34-38"></path>
              <text x="524" y="228" class="hero-node-label hero-node-label-primary">Mumbai</text>
              <text x="524" y="209" class="hero-node-meta">Operating base</text>
              <path class="hero-node-pointer" d="M622 244l12-30"></path>
              <text x="676" y="202" class="hero-node-label">India</text>
              <text x="676" y="183" class="hero-node-meta">Sourcing anchor</text>
              <path class="hero-node-pointer" d="M714 234l26-24"></path>
              <text x="798" y="198" class="hero-node-label">China</text>
              <text x="798" y="179" class="hero-node-meta">Sourcing anchor</text>
          </g>
          <g class="hero-world-region-labels">
              <text x="138" y="170" class="hero-world-region-label">North America</text>
              <text x="198" y="500" class="hero-world-region-label">South America</text>
              <text x="394" y="140" class="hero-world-region-label">Europe</text>
              <text x="454" y="470" class="hero-world-region-label">Africa</text>
              <text x="618" y="112" class="hero-world-region-label">Asia</text>
              <text x="772" y="472" class="hero-world-region-label">Oceania</text>
          </g>
      </svg>
  </div>`;
}

function renderHomepageFamilyBento(family, index) {
	const visual =
		familyVisuals[family.title] || familyVisuals["Lamination Tooling"];
	const productLinks = family.products
		.slice(0, 4)
		.map((productId) => productTextLink(productId))
		.filter(Boolean)
		.join("");
	const large = index === 0 || index === 3;
	return `<article class="home-family-bento${large ? " home-family-bento-large" : ""}">
      <div class="home-family-media">
          <picture>
              <source srcset="${visual.image.replace(".webp", ".avif")}" type="image/avif">
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="720" height="520" ${large ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} class="w-full h-full object-cover">
          </picture>
          <div class="home-family-media-overlay"></div>
          <div class="home-family-media-label">${escHtml(visual.label)}</div>
      </div>
      <div class="home-family-content">
          <h3 class="font-display font-bold text-2xl mb-3">${escHtml(family.title)}</h3>
          <p class="text-sm text-zinc-500 leading-relaxed mb-5">${escHtml(family.intro)}</p>
          <div class="home-family-facts mb-5">
              ${family.highlights
								.slice(0, 3)
								.map((item) => `<span>${escHtml(item)}</span>`)
								.join("")}
          </div>
          <div class="portfolio-link-row">${productLinks}</div>
      </div>
  </article>`;
}

function renderProductTileMosaic(productIds = [], options = {}) {
	const { className = "", limit = 4, loading = "lazy" } = options;
	const cards = productIds
		.slice(0, limit)
		.map((productId) => {
			const product = getProduct(productId);
			if (!product) return "";
			const image = approvedProductImage(product);
			const media = image
				? `<img src="${image}" alt="${escHtml(product.name)}" width="320" height="240" loading="${loading}">`
				: `<div class="product-media-placeholder" role="img" aria-label="${escHtml(`${product.name}: specification route`)}">${glyph("layers", "icon")}<span>Open the product specification route</span></div>`;
			return `<div class="application-mosaic-tile">${media}<span>${escHtml(product.name)}</span></div>`;
		})
		.filter(Boolean)
		.join("");
	return `<div class="application-mosaic${className ? ` ${className}` : ""}">${cards}</div>`;
}

function renderApplicationMosaic(app, options = {}) {
	return renderProductTileMosaic(app.products, {
		limit: 4,
		loading: "eager",
		...options,
	});
}

function renderRouteStepRow(steps = []) {
	return `<div class="home-route-step-row">${steps.map((step) => `<span>${escHtml(step)}</span>`).join("")}</div>`;
}

const HOME_ROUTE_MEDIA = {
	lamination: { productId: "press-plates", alt: "Wood-panel lamination press-tooling reference" },
	furniture: { productId: "fiberboard", alt: "Furniture and cabinetry board reference" },
	flooring: { productId: "wood-flooring", alt: "Laminate flooring system reference" },
	"decorative-surfaces": { productId: "hpl-compact-laminated-boards", alt: "Decorative surface construction route" },
	"formwork-shuttering": { productId: "plywood", alt: "Formwork and shuttering panel reference" },
	architecture: { productId: "decorative-panels", alt: "Decorative stainless steel reference" },
	"metal-finishing": { productId: "decorative-panels", alt: "Decorative metal finishing reference" },
	"pcb-ccl": { productId: "industrial-press-plates", alt: "Electronics press-tooling reference" },
};
function homePreferredProductId(app) {
	return HOME_ROUTE_MEDIA[app.slug]?.productId || app.products[0];
}
function renderImageCard(
	src = "",
	className = "",
	alt = "",
	eager = false,
	size = {},
) {
	if (!src) return "";
	const width = Number(size.width) || 720;
	const height = Number(size.height) || 540;
	return `<div class="${className}"><img src="${src}" alt="${escHtml(alt)}" width="${width}" height="${height}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async"></div>`;
}
function renderProductImageCard(
	productId,
	className = "",
	alt = "",
	eager = false,
) {
	const product = getProduct(productId);
	const image = approvedProductImage(product);
	if (!image) return "";
	return renderImageCard(image, className, alt || product.name, eager);
}

function renderReviewProductImageCard(
	productId,
	className = "",
	alt = "",
	eager = false,
) {
	const product = getProduct(productId);
	const media = reviewProductMedia(product);
	if (!media) return "";
	return `<div class="${className} review-media-frame"><img src="${media.image}" alt="${escHtml(alt || product.name)}" width="720" height="540" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async"><span class="review-media-badge">${escHtml(reviewMediaStatusLabel(media.status))}</span></div>`;
}
function homeRouteMediaModel(app) {
	const media = HOME_ROUTE_MEDIA[app.slug] || {};
	if (media.productId) {
		const product = getProduct(media.productId);
		const image = approvedProductImage(product);
		if (image) {
			return {
				src: image,
				alt: media.alt || product.name,
				fit: media.fit || "cover",
				width: media.width || 720,
				height: media.height || 540,
			};
		}
	}
	if (media.src) return { ...media };
	const product = getProduct(homePreferredProductId(app));
	const image = approvedProductImage(product);
	return image
		? {
				src: image,
				alt: app.name,
				fit: "cover",
				width: 720,
				height: 540,
			}
		: null;
}
function renderHomeHeroBrowseRow({ href, icon, label, note }) {
	return `<a href="${href}" class="home-browse-row"><div class="home-browse-row-icon">${glyph(icon, "icon icon-sm")}</div><div class="home-browse-row-copy"><div class="home-browse-row-label">${escHtml(label)}</div><p>${escHtml(note)}</p></div></a>`;
}

function renderRouteTokenRow(items = [], options = {}) {
	const {
		className = "route-token-row",
		limit = Array.isArray(items) ? items.length : 0,
		numbered = false,
		emptyLabel = "Requirement-led",
	} = options;
	const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
	const visible = safeItems.slice(0, limit);
	const tokens = visible.map(
		(item, index) =>
			`<span>${numbered ? `<strong>${String(index + 1).padStart(2, "0")}</strong>` : ""}${escHtml(item)}</span>`,
	);
	if (!tokens.length)
		tokens.push(`<span class="is-muted">${escHtml(emptyLabel)}</span>`);
	if (safeItems.length > visible.length)
		tokens.push(
			`<span class="is-muted">+${safeItems.length - visible.length} more</span>`,
		);
	return `<div class="${className}">${tokens.join("")}</div>`;
}

function renderRouteSnapshotStage(label, items = [], options = {}) {
	return `<div class="home-route-visual-stage"><div class="home-route-visual-label">${escHtml(label)}</div>${renderRouteTokenRow(items, { className: "home-route-visual-pills", ...options })}</div>`;
}

function renderHomeRouteCard(app) {
	const visual = ROUTE_VISUAL_MODELS[app.slug] || {};
	const productNames = app.products
		.map((productId) => getProduct(productId)?.name)
		.filter(Boolean)
		.slice(0, 3);
	const outputs = (visual.homeOutputs || visual.outputs || [])
		.filter(Boolean)
		.slice(0, 2);
	const media = homeRouteMediaModel(app);
	const imageCard = media
		? renderImageCard(
				media.src,
				`home-route-row-media${media.fit === "contain" ? " is-diagram" : ""}`,
				media.alt || `${app.name} route preview`,
				true,
				media,
			)
		: "";
	return `<article class="home-route-row">
      <div class="home-route-row-main">
          <div class="home-route-kicker">${glyph(applicationIconName(app.slug), "icon icon-sm")} ${escHtml(app.name)}</div>
          <h3 class="home-route-row-title">${escHtml(visual.homeTitle || app.name)}</h3>
          <p class="home-route-row-copy">${escHtml(visual.homeSummary || app.overview)}</p>
      </div>
      ${imageCard}
      <div class="home-route-row-block">
          <div class="home-route-row-label">Working stack</div>
          <div class="home-route-row-chips">${(productNames.length ? productNames : ["Route-led mix"]).map((item) => `<span class="home-route-row-chip">${escHtml(item)}</span>`).join("")}</div>
      </div>
      <div class="home-route-row-block">
          <div class="home-route-row-label">Likely outputs</div>
          <div class="home-route-row-meta">${(outputs.length ? outputs : ["Programme-specific output"]).map((item) => `<span>${escHtml(item)}</span>`).join("")}</div>
      </div>
      <div class="home-route-row-action"><a href="${getSolutionHref(app.slug)}" class="btn-outline" aria-label="Open route: ${escHtml(app.name)}">Open route</a></div>
  </article>`;
}

function renderSolutionHeroSummary(app) {
	const visual = ROUTE_VISUAL_MODELS[app.slug] || {};
	const productNames = app.products
		.map((productId) => getProduct(productId)?.name)
		.filter(Boolean);
	const outputs = (visual.outputs || visual.homeOutputs || []).slice(0, 3);
	return `<div class="solution-hero-summary">
      <article class="solution-hero-summary-card solution-hero-summary-card-note">
          <div class="solution-hero-summary-label">Use this page</div>
          <p>Confirm route fit, working stack, and the next file or product sheet.</p>
      </article>
      <article class="solution-hero-summary-card">
          <div class="solution-hero-summary-label">Working stack</div>
          ${renderRouteTokenRow(productNames, { className: "solution-hero-summary-pills", limit: 4 })}
      </article>
      <article class="solution-hero-summary-card">
          <div class="solution-hero-summary-label">Likely outputs</div>
          ${renderRouteTokenRow(outputs, { className: "solution-hero-summary-pills", limit: 3, emptyLabel: "Project-specific output" })}
      </article>
  </div>`;
}

function renderSolutionStoryBand(app) {
	const visual = ROUTE_VISUAL_MODELS[app.slug];
	if (!visual) return "";
	return `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
      <div class="ui-section-head mb-8">
          <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Route snapshot</div>
          <h2 class="ui-section-title">${escHtml(visual.storyTitle)}</h2>
          <p class="ui-section-subtitle">${escHtml(visual.storyNote)}</p>
      </div>
      <div class="solution-system-band">
          <div class="solution-system-diagram">
              <article class="solution-system-stage">
                  <div class="solution-system-stage-label">Inputs</div>
                  <h3>What has to align</h3>
                  <p>The materials and conditions behind the route.</p>
                  <div class="solution-system-chip-row">${(visual.inputs || []).map((item) => `<span>${escHtml(item)}</span>`).join("")}</div>
              </article>
              <div class="solution-system-arrow" aria-hidden="true">→</div>
              <article class="solution-system-stage">
                  <div class="solution-system-stage-label">Controls</div>
                  <h3>What changes the result</h3>
                  <p>The process or approval points that shift the release outcome.</p>
                  <div class="solution-system-chip-row">${(visual.process || []).map((item) => `<span>${escHtml(item)}</span>`).join("")}</div>
              </article>
              <div class="solution-system-arrow" aria-hidden="true">→</div>
              <article class="solution-system-stage">
                  <div class="solution-system-stage-label">Outputs</div>
                  <h3>What gets approved</h3>
                  <p>The visible or measurable condition the team is actually signing off.</p>
                  <div class="solution-system-chip-row">${(visual.outputs || []).map((item) => `<span>${escHtml(item)}</span>`).join("")}</div>
              </article>
          </div>
      </div>
  </section>`;
}

function specToRow(spec, index = 0) {
	const parts = spec.split(":");
	if (parts.length > 1) {
		return {
			label: parts[0].trim(),
			value: parts.slice(1).join(":").trim(),
		};
	}
	const fallback = spec.split(",")[0].trim();
	const shortLabel = fallback.split(" ").slice(0, 4).join(" ");
	return {
		label: shortLabel || `Reference ${index + 1}`,
		value: spec,
	};
}

function stripMarkdownInline(value = "") {
	return String(value)
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(/`(.+?)`/g, "$1")
		.replace(/\[(.+?)\]\(.+?\)/g, "$1")
		.trim();
}

function estimateReadTime(article, renderedHtml = "") {
	const plain = stripMarkdownInline(
		(renderedHtml || article.content || article.excerpt || "").replace(
			/<[^>]+>/g,
			" ",
		),
	)
		.replace(/\s+/g, " ")
		.trim();
	const words = plain ? plain.split(" ").length : 0;
	const minutes = Math.max(3, Math.ceil(words / 180));
	return `${minutes} min`;
}

function renderShareBar(title, canonicalPath) {
	const fullUrl = `${SITE}${canonicalPath}`;
	const encodedUrl = encodeURIComponent(fullUrl);
	const encodedTitle = encodeURIComponent(title);
	return `<div class="share-bar" data-share-url="${fullUrl}" data-share-title="${escHtml(title)}">
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph("linkedin-brand", "icon icon-sm")} LinkedIn</a>
      <a href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph("whatsapp-brand", "icon icon-sm")} WhatsApp</a>
      <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph("x-brand", "icon icon-sm")} X</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener noreferrer" class="share-chip">${glyph("facebook-brand", "icon icon-sm")} Facebook</a>
      <a href="mailto:?subject=${encodedTitle}&body=${encodedUrl}" class="share-chip">${glyph("mail", "icon icon-sm")} Email</a>
      <button type="button" class="share-chip share-copy-btn" data-copy-link="${fullUrl}">${glyph("copy", "icon icon-sm")} Copy link</button>
  </div>`;
}

function renderArticleEndRail(article, context = null) {
	let supportCard = `<article class="article-end-card"><div class="article-end-label">Explore more</div><h2>Back to insights</h2><p>Return to the wider library of buyer guides, checklists, and decision support pages.</p><a href="/insights/" class="btn-outline">Open insights</a></article>`;
	if (context?.product && context?.meta) {
		const productHref = productPageHref(context.product.id);
		const downloads = context.meta.downloads
			.slice(0, 2)
			.map(
				(download) =>
					`<span class="article-end-link">${escHtml(download.title || "Reference")}</span>`,
			)
			.join("");
		const related = relatedSolutionsForProduct(context.product.id)
			.slice(0, 2)
			.map(
				(app) =>
					`<a href="${getSolutionHref(app.slug)}" class="article-end-link">${escHtml(app.name)}</a>`,
			)
			.join("");
		supportCard = `<article class="article-end-card"><div class="article-end-label">Supporting references</div><h2>Open the reference pack</h2><p>When this guide becomes a live brief, move into the product sheet for the cleaner document pack, system links, and next checks.</p>${downloads ? `<div class="article-end-links">${downloads}</div>` : ""}${related ? `<div class="article-end-links">${related}</div>` : ""}<a href="${productHref}" class="btn-outline">Open product sheet</a></article>`;
	}
	return `<div class="article-end-rail">${supportCard}<article class="article-end-card article-end-card-primary"><div class="article-end-label">Next step</div><h2>Share the actual requirement</h2><p>Use ${escHtml(context?.product?.name || article.categoryLabel)} only as the starting point. The brief, reference, quantity, timing, and destination make the next review faster.</p><a href="/contact/?product=${encodeURIComponent(context?.product?.name || article.category)}" class="btn-primary">Share your requirement</a></article></div>`;
}

function renderInsightRouteAssistCard(app) {
	const routeModel = ROUTE_VISUAL_MODELS[app.slug] || {};
	return `<article class="insight-route-card"><div class="ui-kicker mb-3">${glyph(applicationIconName(app.slug), "icon icon-sm")} ${escHtml(app.name)}</div><h3>${escHtml(routeModel.homeTitle || app.name)}</h3><p>${escHtml(clampText(routeModel.storyNote || app.overview, 170))}</p><div class="home-route-step-row home-route-step-row-compact">${(
		routeModel.process || []
	)
		.slice(0, 3)
		.map((item) => `<span>${escHtml(item)}</span>`)
		.join(
			"",
		)}</div><div class="insight-route-card-actions"><a href="${withQuery("/explore/", { type: "guide", route: app.slug })}" class="btn-outline">Open route shortlist</a><a href="${getSolutionHref(app.slug)}" class="btn-outline">Open solution</a></div></article>`;
}

// ============================================================
// CRITICAL CSS (shared across all pages)
// ============================================================
// ============================================================
// CRITICAL CSS (shared across all pages)
// ============================================================
function criticalCSS() {
	return `@font-face{font-family:'DM Sans';font-style:normal;font-weight:400;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'DM Sans';font-style:normal;font-weight:500;font-display:swap;src:url(/fonts/dm-sans-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:700;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:'Montserrat';font-style:normal;font-weight:900;font-display:swap;src:url(/fonts/montserrat-latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}`;
}

function pageEnhancementCSS() {
	return ``;
}

// ============================================================
// HTML PARTIALS
// ============================================================
function favicons() {
	return `<link rel="icon" href="/favicon.ico" sizes="any">
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

function socialImageMetaPath(image = "") {
	if (!image) return image;
	if (/\.(png|jpg|jpeg|svg)$/i.test(image)) return image;
	if (/\.webp$/i.test(image)) {
		const jpgPath = path.join(
			WORK,
			image.replace(/^\//, "").replace(/\.webp$/i, ".jpg"),
		);
		const pngPath = path.join(
			WORK,
			image.replace(/^\//, "").replace(/\.webp$/i, ".png"),
		);
		if (fs.existsSync(jpgPath)) return image.replace(/\.webp$/i, ".jpg");
		if (fs.existsSync(pngPath)) return image.replace(/\.webp$/i, ".png");
	}
	return image;
}

function socialImageVersionedUrl(image = "") {
	if (!image) return image;
	return `${image}${String(image).includes("?") ? "&" : "?"}v=${VER}`;
}

function socialImageMimeType(image = "") {
	const clean = String(image || "")
		.split("?")[0]
		.toLowerCase();
	if (clean.endsWith(".png")) return "image/png";
	if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
	if (clean.endsWith(".svg")) return "image/svg+xml";
	return "image/png";
}

function headTag({
	title,
	desc,
	canonical,
	ogType = "website",
	ogImage = "/images/social/moldart-default.png",
	ogImageAlt = "Moldart brand overview",
	noindex = false,
	schemas = [],
	prefetch = [],
	preloadImages = [],
	stylesheet = "/site.css",
	preloadFonts = true,
}) {
	const robotsMeta = noindex
		? "noindex, nofollow, noarchive"
		: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
	const schemaScripts = schemas
		.map(
			(s) =>
				`<script type="application/ld+json">\n    ${JSON.stringify(s)}\n    </script>`,
		)
		.join("\n    ");
	const preloadImageLinks = preloadImages
		.filter(Boolean)
		.map(
			(image) =>
				`<link rel="preload" as="image" href="${image}" fetchpriority="high">`,
		)
		.join("\n    ");
	const socialImage = socialImageMetaPath(ogImage);
	const socialImageUrl = /^https?:/i.test(socialImage)
		? socialImageVersionedUrl(socialImage)
		: `${SITE}${socialImageVersionedUrl(socialImage)}`;
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
    <meta name="moldart-build-version" content="${VER}">
    <script>document.documentElement.classList.add('js');</script>
    <link rel="canonical" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="en-IN" href="${SITE}${canonical}">
    <link rel="alternate" hreflang="x-default" href="${SITE}${canonical}">
    <link rel="image_src" href="${socialImageUrl}">
    ${favicons()}
    <link rel="dns-prefetch" href="https://wa.me">
    ${preloadFonts ? fontPreloads() : ""}
${preloadImageLinks ? `    ${preloadImageLinks}\n` : ""}    <link rel="stylesheet" href="${stylesheet}?v=${VER}">
    ${schemaScripts}
</head>`;
}

function nav(route) {
	return `<body data-route="${route}">
    <a href="#main-content" class="sr-only">Skip to content</a>
    <nav aria-label="Main site navigation" class="site-header fixed top-0 left-0 right-0 z-50 bg-white-90 backdrop-blur border-b border-zinc-100">
        <div class="max-w mx-auto px h-16 flex items-center site-nav-inner">
            <a href="/" class="site-brand flex items-center gap-3">
                <div>
                    <div class="font-display font-black text-base site-brand-word">MOLDART</div>
                    <div class="text-xs text-zinc-500 md-hidden site-brand-sub">Technical RFQ desk · Mumbai</div>
                </div>
            </a>
            <div class="site-nav-links md-hidden">
                <a href="/products/" class="site-nav-link ${route === 'products' ? 'is-active' : ''}">Products</a>
                <a href="/solutions/" class="site-nav-link ${route === 'solutions' ? 'is-active' : ''}">Solutions</a>
                <a href="/evidence-qc/" class="site-nav-link ${route === 'evidence' ? 'is-active' : ''}">Evidence & QC</a>
                <a href="/resources/" class="site-nav-link ${route === 'resources' ? 'is-active' : ''}">Resources</a>
                <a href="/insights/" class="site-nav-link ${route === 'insights' ? 'is-active' : ''}">Insights</a>
                <a href="/about/" class="site-nav-link ${route === 'about' ? 'is-active' : ''}">About</a>
                <a href="/contact/?intent=buyer-rfq" class="site-nav-link site-nav-rfq ${route === 'contact' ? 'is-active' : ''}">Start RFQ</a>
            </div>
            <button type="button" class="site-search-trigger site-search-trigger-compact site-search-push" data-open-command-palette aria-label="Search Moldart pages, products, resources, insights, FAQ, and contact routes">
                ${glyph("search", "icon site-search-trigger-icon")}
                <span class="site-search-trigger-copy">
                    <span class="site-search-trigger-label">Search</span>
                    <span class="site-search-trigger-meta">${NAV_SEARCH_META}</span>
                </span>
                <span class="site-search-trigger-shortcut cmd-k-hint"><kbd>Ctrl/⌘ K</kbd></span>
            </button>
            <button type="button" class="ui-mobile-toggle" data-mobile-menu-toggle aria-controls="mob-menu" aria-expanded="false" aria-label="Menu">
                ${glyph("menu", "ui-mobile-icon-menu")}
                ${glyph("close", "ui-mobile-icon-close")}
            </button>
        </div>
        <div id="mob-menu" class="ui-mobile-menu" inert>
            <div class="ui-mobile-menu-panel">
                <a href="/">Home</a>
                <a href="/products/">Products</a>
                <a href="/solutions/">Solutions</a>
                <a href="/explore/">Explore</a>
                <a href="/evidence-qc/">Evidence & QC</a>
                <a href="/resources/">Resources</a>
                <a href="/insights/">Insights</a>
                <a href="/process/">Process</a>
                <a href="/faq/">FAQ</a>
                <a href="/about/">About</a>
                <a href="/contact/?intent=buyer-rfq">Start RFQ</a>
            </div>
        </div>
    </nav>`;
}

function footer() {
	return `<footer class="ui-footer">
        <div class="max-w mx-auto px py-12">
            <div class="ui-footer-grid">
                <div class="ui-footer-card">
                    <div class="font-display font-black text-xl tracking-wider mb-4">MOLDART</div>
                    <p class="text-sm text-zinc-400 leading-relaxed font-light mb-5">${BRAND_LINE}</p>
                    <div class="ui-footer-meta">
                        <span class="ui-footer-pill">${glyph("layers", "icon icon-sm")} 3 product systems</span>
                        <span class="ui-footer-pill">${glyph("building", "icon icon-sm")} Mumbai</span>
                        <span class="ui-footer-pill">${glyph("route", "icon icon-sm")} India + China</span>
                    </div>
                </div>
                <div class="ui-footer-card">
                    <div class="section-label text-zinc-600 mb-5">Navigate</div>
                    <div class="ui-footer-nav">
                        <a href="/" class="ui-footer-link">Home</a>
                        <a href="/products/" class="ui-footer-link">Products</a>
                        <a href="/solutions/" class="ui-footer-link">Solutions</a>
                        <a href="/explore/" class="ui-footer-link">Explore</a>
                        <a href="/evidence-qc/" class="ui-footer-link">Evidence & QC</a>
                        <a href="/process/" class="ui-footer-link">Process</a>
                        <a href="/resources/" class="ui-footer-link">Resources</a>
                        <a href="/insights/" class="ui-footer-link">Insights</a>
                        <a href="/faq/" class="ui-footer-link">FAQ</a>
                        <a href="/about/" class="ui-footer-link">About</a>
                        <a href="/contact/" class="ui-footer-link">Contact</a>
                        <a href="/privacy/" class="ui-footer-link">Privacy Notice</a>
                        <a href="/terms/" class="ui-footer-link">Website Terms</a>
                    </div>
                </div>
                <div class="ui-footer-card">
                    <div class="section-label text-zinc-600 mb-5">Talk to Moldart</div>
                    <div class="flex flex-col gap-3">
                        <a href="mailto:info@moldartindia.com" class="ui-footer-link">${glyph("mail", "icon icon-sm")} info@moldartindia.com</a>
                        <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph("whatsapp-brand", "icon icon-sm")} ${WHATSAPP_PRIMARY.display}</a>
                        <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph("whatsapp-brand", "icon icon-sm")} ${WHATSAPP_SECONDARY.display}</a>
                        <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph("linkedin-brand", "icon icon-sm")} Moldart company page</a>
                        <a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="ui-footer-link">${glyph("linkedin-brand", "icon icon-sm")} Yash Doshi</a>
                        <a href="/contact/" class="ui-footer-link">${glyph("message", "icon icon-sm")} Share your requirement</a>
                    </div>
                    <p class="text-xs text-zinc-500 leading-relaxed mt-5">Use Contact for enquiry forms, WhatsApp, meetings, and address details.</p>
                </div>
            </div>
            <div class="ui-footer-bottom mt-8">© <span class="yr">2026</span> Moldart · ${LEGAL_NAME} · Mumbai, India · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></div>
        </div>
    </footer>`;
}

function closingElements(includeResourceGate = true) {
	return `
    <aside class="quick-contact-landmark" aria-label="Quick contact">
        <a href="${whatsappHref(WHATSAPP_PRIMARY.number, `Hi Moldart, I'm interested in your products.`)}" target="_blank" rel="noopener noreferrer" class="whatsapp-fab" aria-label="Chat on WhatsApp">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.507-4.484-1.375l-.32-.195-2.867.852.852-2.867-.21-.336A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
            </svg>
        </a>
    </aside>
    <button type="button" class="scroll-top-btn" aria-label="Scroll to top">
        <svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
    </button>
    <div class="lightbox-overlay" inert>
        <button type="button" class="lightbox-close" aria-label="Close lightbox">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
    </div>
    <div id="command-palette" class="cmd-palette-overlay" aria-modal="true" role="dialog" aria-label="Command Palette">
        <div class="cmd-palette">
            <div class="cmd-palette-input-wrap">
                <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input type="text" class="cmd-palette-input" id="cmd-input" aria-label="Search Moldart pages, products, resources, insights, FAQ, and contact routes" placeholder="Search pages, products, resources, insights, FAQ, and contact..." aria-autocomplete="list" autocomplete="off" spellcheck="false">
            </div>
            <div class="cmd-palette-results" id="cmd-results" role="listbox"></div>
            <div class="cmd-palette-footer">
                <div class="text-xs text-zinc-500">Use search as the primary navigation layer. Page routes appear first, then products, resources, and articles.</div>
            </div>
        </div>
    </div>
    ${includeResourceGate ? `
    <div id="resource-gate" class="resource-gate-overlay" inert>
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
            <form action="/api/lead-intake" method="POST" class="resource-gate-form" id="resource-gate-form" data-lead-form>
                <input type="hidden" name="lead_type" value="resource_download">
                <input type="hidden" name="source_page" value="/resources/">
                <input type="hidden" name="next" value="/resources/?access=confirmed">
                <input type="hidden" name="consent_context" value="Resource access form: user submitted contact details for document sharing and technical-commercial follow-up.">
                <input type="hidden" name="download_title" id="resource-download-title-field" value="">
                <input type="hidden" name="download_url" id="resource-download-url-field" value="">
                <input type="hidden" name="cf-turnstile-response" value="">
                <input type="text" name="_honey" class="is-hidden-field" tabindex="-1" autocomplete="off" aria-label="Leave this field blank">
                <label class="form-group"><span class="form-label">Full Name *</span><input type="text" name="name" class="form-input" required aria-required="true" autocomplete="name" placeholder="Your name"></label>
                <label class="form-group"><span class="form-label">Company *</span><input type="text" name="company" class="form-input" required aria-required="true" autocomplete="organization" placeholder="Company name"></label>
                <label class="form-group"><span class="form-label">Email Address *</span><input type="email" name="email" class="form-input" required aria-required="true" autocomplete="email" placeholder="name@company.com"></label>
                <label class="form-group"><span class="form-label">Phone / WhatsApp *</span><input type="tel" name="phone" class="form-input" required aria-required="true" autocomplete="tel" placeholder="+91 ..."></label>
                <label class="form-consent"><input type="checkbox" name="privacy_accepted" value="yes" required aria-required="true"><span>I have read the <a href="/privacy/" target="_blank" rel="noopener noreferrer" aria-label="Privacy Notice (opens in a new tab)">Privacy Notice</a> and agree to Moldart using these details for document access and relevant technical-commercial follow-up.</span></label>
                <div data-turnstile-slot class="turnstile-slot" aria-hidden="true"></div>
                <button type="submit" class="btn-primary btn-lg btn-full-centered">Continue to Download</button>
                <p class="text-xs text-zinc-400 text-center">No advertising list subscription is created by this form.</p>
            </form>
        </div>
    </div>
    ` : ""}

    <script src="/main.js?v=${VER}" defer></script>
    ${includeResourceGate ? `
    <script>
      (function(){
        var loaded = false;
        function loadLeadForms(){
          if (loaded) return;
          loaded = true;
          var script = document.createElement('script');
          var versionMeta = document.querySelector('meta[name="moldart-build-version"]');
          var versionSuffix = versionMeta && versionMeta.content ? '?v=' + encodeURIComponent(versionMeta.content) : '';
          script.src = '/lead-forms.js' + versionSuffix;
          script.defer = true;
          script.setAttribute('data-lead-forms-loaded', 'true');
          document.head.appendChild(script);
        }
        function maybeFormEvent(event){
          if (event.target && event.target.closest && event.target.closest('form[data-lead-form]')) loadLeadForms();
        }
        document.addEventListener('focusin', maybeFormEvent);
        document.addEventListener('pointerdown', maybeFormEvent, { passive: true });
      })();
    </script>
    ` : ""}
</body>
</html>`;
}

function breadcrumb(items) {
	const schemaItems = items.map((item, i) => ({
		"@type": "ListItem",
		position: i + 1,
		name: item.name,
		...(item.url ? { item: SITE + item.url } : {}),
	}));
	const htmlParts = items.map((item, i) => {
		if (i === items.length - 1)
			return `<span aria-current="page">${escHtml(item.name)}</span>`;
		return `<a href="${item.url}">${escHtml(item.name)}</a><span class="breadcrumb-sep">/</span>`;
	});
	return {
		html: `<nav class="breadcrumb" aria-label="Breadcrumb">${htmlParts.join("")}</nav>`,
		schema: {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: schemaItems,
		},
	};
}

function findResourceCatalogItem(item = {}) {
	const title = String(item.title || "").trim();
	const url = String(item.url || "").trim();
	return (
		getAllResourceItems().find(
			(entry) => (title && entry.title === title) || (url && entry.url === url),
		) || item
	);
}

function resourceToneForGroup(group = "") {
	if (/press|tooling/i.test(group)) return "is-tooling";
	if (/stainless/i.test(group)) return "is-steel";
	if (/wood|flooring|furniture/i.test(group)) return "is-wood";
	if (/lamination|decor/i.test(group)) return "is-lamination";
	if (/company/i.test(group)) return "is-company";
	return "is-neutral";
}

function resourcePreviewCode(item = {}) {
	const words = String(item.title || "Reference")
		.replace(/[^a-z0-9 ]/gi, " ")
		.split(/\s+/)
		.filter(Boolean)
		.filter(
			(word) =>
				!/^(for|and|of|the|collection|catalog|program|deck|decorative)$/i.test(
					word,
				),
		);
	return (
		words
			.slice(0, 3)
			.map((word) => word[0].toUpperCase())
			.join("") || "PDF"
	);
}

function resourcePreviewLabel(group = "") {
	if (/company/i.test(group)) return "Company";
	if (/press/i.test(group)) return "Press tooling";
	if (/decor & lamination/i.test(group)) return "Lamination";
	if (/decor paper|gravure/i.test(group)) return "Decor paper";
	if (/wood|flooring|furniture/i.test(group)) return "Wood / flooring";
	if (/stainless/i.test(group)) return "Steel finishes";
	return group || "Reference";
}

function renderResourcePreviewThumb(item = {}, options = {}) {
	const { compact = false } = options;
	const resolved = findResourceCatalogItem(item);
	const group = resolved.group || "Reference";
	const status = isRequestOnlyResource(resolved) ? "Request" : "PDF";
	const code = resourcePreviewCode(resolved);
	const previewLabel = resourcePreviewLabel(group);
	return `<div class="resource-thumb ${resourceToneForGroup(group)}${compact ? " is-compact" : ""}"><div class="resource-thumb-type">${escHtml(status)}</div><div class="resource-thumb-code">${escHtml(code)}</div>${compact ? "" : `<div class="resource-thumb-label">${escHtml(previewLabel)}</div>`}</div>`;
}

function renderResourceDocumentCard(item = {}, options = {}) {
	const { compact = false, showGroup = true, showNote = true } = options;
	const resolved = findResourceCatalogItem(item);
	const requestOnly = isRequestOnlyResource(resolved);
	const href = requestOnly
		? requestDocumentHref(resolved)
		: resourceHref(resolved);
	const title = resolved.title || item.title || "Reference";
	const desc = resolved.desc || item.desc || "Reference document.";
	const metaLine =
		showGroup && resolved.group
			? resolved.group
			: requestOnly
				? "Shared on request"
				: "";
	const attrs = requestOnly
		? ""
		: ` target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(title)}"`;
	return `<a href="${href}" class="resource-library-row${compact ? " is-compact" : ""}${requestOnly ? " is-request" : ""}"${attrs}><div class="resource-library-row-preview">${renderResourcePreviewThumb(resolved, { compact: true })}</div><div class="resource-library-row-copy">${metaLine ? `<div class="resource-library-row-meta">${glyph("file", "icon icon-sm")} ${escHtml(metaLine)}</div>` : ""}<div class="resource-library-row-title">${escHtml(title)}</div><div class="resource-library-row-desc">${escHtml(desc)}</div>${requestOnly && showNote && resolved.note ? `<div class="resource-library-row-note">${escHtml(resolved.note)}</div>` : ""}</div><div class="resource-library-row-action">${escHtml(requestOnly ? "Request file" : "Download PDF")} ${requestOnly ? glyph("message", "icon icon-sm") : glyph("arrow", "icon icon-sm")}</div></a>`;
}

function renderResourceListRow(item = {}, options = {}) {
	return renderResourceDocumentCard(item, options);
}

function downloadLink(dl) {
	const resolved = findResourceCatalogItem(dl);
	const requestOnly = isRequestOnlyResource(resolved);
	const href = requestOnly
		? requestDocumentHref(resolved)
		: resourceHref(resolved);
	const title = resolved.title || dl.title || "Reference";
	const attrs = requestOnly
		? ""
		: ` target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(title)}"`;
	return `<a href="${href}" class="article-download-link${requestOnly ? " is-request" : ""}"${attrs}><span>${escHtml(title)}</span><strong>${escHtml(requestOnly ? "Request" : "Download")}</strong></a>`;
}

function productTextLink(productId) {
	const product = getProduct(productId);
	const meta = getMeta(productId);
	if (!product || !meta) return "";
	return `<a href="/products/${meta.slug}/" class="portfolio-link-chip">${escHtml(product.name)}</a>`;
}

function renderPortfolioFamilyCard(family, options = {}) {
	const visual =
		familyVisuals[family.title] || familyVisuals["Lamination Tooling"];
	const productLinks = family.products
		.map((productId) => productTextLink(productId))
		.filter(Boolean)
		.join("");
	const anchor = `family-${slugify(family.title)}`;
	return `<article id="${anchor}" class="ui-family-card">
      <div class="ui-family-media">
          <picture>
              <source srcset="${visual.image.replace(".webp", ".avif")}" type="image/avif">
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="720" height="520" loading="lazy">
          </picture>
          <div class="ui-family-overlay"></div>
          <div class="ui-family-badge">${glyph(familyIconName(family.title), "icon icon-sm")} ${family.products.length} routes</div>
      </div>
      <div class="ui-family-body">
          <div class="ui-meta-list mb-4">${family.highlights
						.slice(0, 3)
						.map((item) => `<span class="ui-meta-pill">${escHtml(item)}</span>`)
						.join("")}</div>
          <h3 class="ui-family-title">${escHtml(family.title)}</h3>
          <p class="ui-family-copy">${escHtml(family.intro)}</p>
          <div class="ui-data-grid mb-4">
              <div class="ui-data-card">
                  <div class="ui-data-label">Key signal</div>
                  <div class="ui-data-value">${escHtml(family.highlights[0])}</div>
                  <p class="ui-data-note">${escHtml(family.highlights[1] || "")}</p>
              </div>
              <div class="ui-data-card">
                  <div class="ui-data-label">Best fit</div>
                  <div class="ui-data-value">${escHtml(family.sectors[0])}</div>
                  <p class="ui-data-note">${escHtml(family.sectors.slice(1, 3).join(" • "))}</p>
              </div>
          </div>
          <div class="ui-link-row">${productLinks}</div>
      </div>
  </article>`;
}

function withQuery(pathname = "", params = {}) {
	const query = new URLSearchParams(
		Object.entries(params).filter(
			([, value]) => value !== undefined && value !== null && value !== "",
		),
	).toString();
	return query ? `${pathname}?${query}` : pathname;
}

function getSolutionHref(slug) {
	return `/solutions/${slug}/`;
}

function productPageHref(productId, params = {}) {
	const meta = getMeta(productId);
	return meta ? withQuery(`/products/${meta.slug}/`, params) : "/products/";
}

function renderContextualReturn(relatedSolutions = []) {
	const solutionMap = JSON.stringify(
		Object.fromEntries(relatedSolutions.map((app) => [app.slug, app.name])),
	);
	return `<div class="ui-context-return"><a href="/solutions/" class="ui-context-return-link" data-context-return-link><span aria-hidden="true">←</span><span>Explore Solutions</span></a></div><script>(function(){var link=document.querySelector('[data-context-return-link]');if(!link)return;var params=new URLSearchParams(window.location.search);var map=${solutionMap};var href='/solutions/';var label='Explore Solutions';if(params.get('from')==='explore'){href='/explore/';label='Back to Explore';}else if(params.get('from')==='solution'&&params.get('solution')){var slug=params.get('solution');href='/solutions/'+slug+'/';label='Back to '+(map[slug]||'Solution');}else if(document.referrer&&document.referrer.indexOf('/explore/')!==-1){href='/explore/';label='Back to Explore';}link.setAttribute('href',href);var labelNode=link.querySelectorAll('span')[1];if(labelNode)labelNode.textContent=label;})();</script>`;
}

function renderProductPillLink(productId, className = "ui-link-pill") {
	const product = getProduct(productId);
	const meta = getMeta(productId);
	if (!product || !meta) return "";
	return `<a href="/products/${meta.slug}/" class="${className}">${escHtml(product.name)}</a>`;
}

function relatedSolutionsForProduct(productId) {
	return applications.filter((app) => app.products.includes(productId));
}

function productRoleForSolution(slug, productId) {
	const mapped = SOLUTION_PRODUCT_ROLES[slug]?.[productId];
	if (mapped) return mapped;
	return (
		getMeta(productId)?.workflow?.split(". ")[0] ||
		"Use the product sheet as the reference point, then confirm the final route against the programme."
	);
}

function solutionAudienceFor(slug) {
	return SOLUTION_AUDIENCES[slug] || ["Procurement", "Technical teams"];
}

function solutionFlowFor(slug) {
	return SOLUTION_FLOWS[slug] || [];
}

function relatedInsightsForSolution(app, limit = 3) {
	const productIds = new Set(app.products);
	const editorial = rawInsights.editorial.filter((article) =>
		productIds.has(article.category),
	);
	const generated = rawInsights.generated.filter((article) =>
		productIds.has(article.category),
	);
	return [...editorial, ...generated].slice(0, limit);
}

function routeNameForSlug(slug = "") {
	if (slug === "company") return "Company";
	return applications.find((item) => item.slug === slug)?.name || slug;
}

function routeSlugsForResourceGroup(title = "") {
	if (/company/i.test(title)) return ["company"];
	if (/press|tooling|lamination|decor paper|gravure/i.test(title))
		return ["lamination"];
	if (/flooring/i.test(title)) return ["flooring"];
	if (/wood|furniture/i.test(title)) return ["furniture"];
	if (/stainless/i.test(title)) return ["architecture", "metal-finishing"];
	return [];
}

function resourceRoutesFor(item = {}) {
	if (Array.isArray(item.routes) && item.routes.length) return item.routes;
	if (RESOURCE_ROUTE_OVERRIDES[item.title])
		return RESOURCE_ROUTE_OVERRIDES[item.title];
	return routeSlugsForResourceGroup(item.group || "");
}

function routeSlugsForArticle(article = {}) {
	const label = String(article.categoryLabel || "");
	if (/Lamination Tooling/i.test(label)) return ["lamination"];
	if (/Printed Decor Paper|Decorative Surfaces/i.test(label)) return ["lamination"];
	if (/RFQ & Sourcing Control/i.test(label))
		return ["furniture", "lamination", "metal-finishing", "flooring"];
	if (/Furniture/i.test(label)) return ["furniture"];
	if (/Flooring/i.test(label)) return ["flooring"];
	if (/Decorative Steel|Decorative Stainless Steel/i.test(label))
		return ["architecture", "metal-finishing"];
	if (/Formwork|Shuttering/i.test(label)) return ["architecture"];
	if (/Industrial Tooling/i.test(label)) return ["pcb-ccl"];
	if (/Panel Systems/i.test(label)) return ["furniture"];
	return [];
}

function renderExploreDiscoveryCard(entry = {}) {
	const routeChips = (entry.routeLabels || [])
		.slice(0, 2)
		.map((label) => `<span class="ui-meta-pill">${escHtml(label)}</span>`)
		.join("");
	return `<a href="${entry.href || "/explore/"}" class="explore-result-row" data-explore-card data-type="${escHtml(entry.type)}" data-routes="${escHtml((entry.routes || []).join(" "))}" data-search="${escHtml(entry.search || "")}"${entry.actionAttrs || ""}><div class="explore-result-row-media">${entry.media || `<div class="explore-card-media explore-card-media-icon">${glyph(entry.icon || "search")}</div>`}</div><div class="explore-result-row-copy"><div class="explore-result-row-top"><span class="ui-meta-pill">${escHtml(entry.typeLabel || "Entry")}</span>${routeChips}</div><div class="explore-result-row-title">${escHtml(entry.title || "Untitled")}</div><div class="explore-result-row-desc">${escHtml(entry.copy || "")}</div><div class="explore-result-row-meta">${escHtml(entry.meta || "")}</div></div><div class="explore-result-row-action">${escHtml(entry.action || "Open")} ${glyph("arrow", "icon icon-sm")}</div></a>`;
}

function getExploreDiscoveryEntries() {
	const entries = [];

	rawProducts.products.forEach((product) => {
		const meta = getMeta(product.id);
		const routes = [...new Set(meta?.relatedApps || [])];
		const image = approvedProductImage(product);
		entries.push({
			type: "product",
			typeLabel: "Product sheet",
			title: product.name,
			copy: clampText(product.summary, 180),
			meta: `${product.stage} · ${product.use}`,
			href: productPageHref(product.id, { from: "explore" }),
			action: "Open sheet",
			routes,
			routeLabels: routes.map((slug) => routeNameForSlug(slug)),
			search: [
				product.name,
				product.summary,
				product.stage,
				product.use,
				...(product.applications || []),
				...(product.specs || []),
			].join(" "),
			media: image
				? `<div class="explore-card-media"><img src="${image}" alt="${escHtml(product.name)}" width="320" height="220" loading="lazy"></div>`
				: "",
		});
	});

	applications.forEach((app) => {
		const visual = getApplicationVisual(app.slug);
		entries.push({
			type: "solution",
			typeLabel: "Solution",
			title: app.name,
			copy: clampText(app.overview, 180),
			meta: `${app.products.length} linked product sheet${app.products.length === 1 ? "" : "s"}`,
			href: getSolutionHref(app.slug),
			action: "Open system",
			routes: [app.slug],
			routeLabels: [app.name],
			search: [
				app.name,
				app.overview,
				...(app.considerations || []),
				...(app.products || []),
			].join(" "),
			media: `<div class="explore-card-media${visual.reviewStatus ? " review-media-frame" : ""}"><img src="${visual.image}" alt="${escHtml(visual.alt)}" width="320" height="220" loading="lazy">${visual.reviewStatus ? `<span class="review-media-badge">${escHtml(reviewMediaStatusLabel(visual.reviewStatus))}</span>` : ""}</div>`,
		});
	});

	resourceGroups.forEach((group) => {
		group.items.forEach((item) => {
			const resolved = { ...item, group: group.title };
			const requestOnly = isRequestOnlyResource(resolved);
			const title = resolved.title || "Reference";
			entries.push({
				type: "document",
				typeLabel: "Document",
				title,
				copy: clampText(
					resolved.desc || resolved.note || "Reference document.",
					180,
				),
				meta: `${group.title} · ${requestOnly ? "Request file" : "Downloadable PDF"}`,
				href: requestOnly
					? requestDocumentHref(resolved)
					: resourceHref(resolved),
				action: requestOnly ? "Request file" : "Download PDF",
				actionAttrs: requestOnly
					? ""
					: ` target="_blank" rel="noopener noreferrer" download data-gated-download="true" data-download-title="${escHtml(title)}"`,
				routes: resourceRoutesFor(resolved),
				routeLabels: resourceRoutesFor(resolved).map((slug) =>
					routeNameForSlug(slug),
				),
				search: [
					title,
					resolved.desc || "",
					resolved.note || "",
					group.title,
					requestOnly ? "request file" : "download pdf",
				].join(" "),
				media: `<div class="explore-card-media explore-card-media-doc">${renderResourcePreviewThumb(resolved, { compact: false })}</div>`,
			});
		});
	});

	rawInsights.editorial.forEach((article) => {
		const routes = routeSlugsForArticle(article);
		entries.push({
			type: "guide",
			typeLabel: "Guide",
			title: article.title,
			copy: clampText(article.excerpt, 180),
			meta: `${article.categoryLabel} · ${article.type}`,
			href: `/insights/${article.slug}/`,
			action: "Read guide",
			routes,
			routeLabels: routes.map((slug) => routeNameForSlug(slug)),
			search: [
				article.title,
				article.excerpt,
				article.categoryLabel,
				article.type,
				...(article.tags || []),
			].join(" "),
			media: `<div class="explore-card-media explore-card-media-guide"><img src="${insightPreviewImage(article)}" alt="${escHtml(insightPreviewAlt(article))}" width="320" height="168" loading="lazy"></div>`,
		});
	});

	const order = { solution: 0, product: 1, document: 2, guide: 3 };
	return entries.sort(
		(a, b) =>
			(order[a.type] ?? 99) - (order[b.type] ?? 99) ||
			String(a.title).localeCompare(String(b.title)),
	);
}

function articleStakeholderFallback(article) {
	const byCategory = {
		"Lamination Tooling": [
			"Procurement",
			"Production teams",
			"Quality teams",
			"Supplier partners",
			"Technical sales",
			"Management",
		],
		"Industrial Tooling": [
			"Technical buyers",
			"Production engineers",
			"Quality teams",
			"Operations",
			"Supplier partners",
			"Management",
		],
		"Decorative Steel": [
			"Architects",
			"Design teams",
			"Procurement",
			"Fabricators",
			"Site teams",
			"Management",
		],
		"Decorative Stainless Steel": [
			"Architects",
			"Design teams",
			"Procurement",
			"Fabricators",
			"Site teams",
			"Management",
		],
		"RFQ & Sourcing Control": [
			"Procurement",
			"Technical buyers",
			"Quality teams",
			"Commercial teams",
			"Logistics teams",
			"Management",
		],
		"Printed Decor Paper & Cylinders": [
			"Procurement",
			"Production teams",
			"Quality teams",
			"Artwork teams",
			"Supplier partners",
			"Management",
		],
		"Decorative Surfaces": [
			"Procurement",
			"Design teams",
			"Factory teams",
			"Quality teams",
			"Project teams",
			"Management",
		],
		"Formwork / Shuttering": [
			"Procurement",
			"Project teams",
			"Site teams",
			"Quality teams",
			"Commercial teams",
			"Management",
		],
		"Panel Systems": [
			"Procurement",
			"Factory teams",
			"Quality teams",
			"Project teams",
			"Supplier partners",
			"Management",
		],
		"Flooring Systems": [
			"Category buyers",
			"Project teams",
			"Installation partners",
			"Quality teams",
			"Commercial teams",
			"Management",
		],
		"Furniture Programmes": [
			"Procurement",
			"Design teams",
			"Production teams",
			"Sales partners",
			"Project teams",
			"Management",
		],
	};
	return (
		byCategory[article.categoryLabel] || [
			"Procurement",
			"Technical teams",
			"Quality teams",
			"Management",
		]
	);
}

function stakeholderNoteFor(role = "") {
	if (/procurement|buyer/i.test(role))
		return "Locks the RFQ, comparison frame, and commercial brief.";
	if (/production|factory|operations|installation/i.test(role))
		return "Checks whether the route stays practical in the real workflow.";
	if (/quality|receiving/i.test(role))
		return "Protects the approval points before release into use.";
	if (/design|architect/i.test(role))
		return "Keeps the visible-face or use-case intent clear.";
	if (/fabricator|supplier|sales/i.test(role))
		return "Helps keep route language and handover logic consistent.";
	return "Useful when commercial risk, approval clarity, and repeat stability all matter.";
}

function articleStakeholderGroups(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	if (Array.isArray(dossier.stakeholders) && dossier.stakeholders.length)
		return dossier.stakeholders.slice(0, 6);
	const merged = [
		...relatedSolutionsForProduct(article.category).flatMap((app) =>
			solutionAudienceFor(app.slug),
		),
		...articleStakeholderFallback(article),
		context?.product?.stage,
		"Management",
	].filter(Boolean);
	return [...new Set(merged)].slice(0, 6);
}

function articleAudienceFor(article, context = null) {
	const unique = articleStakeholderGroups(article, context);
	return unique.length
		? unique.slice(0, 4)
		: ["Procurement", "Technical teams"];
}

function articlePriorityItems(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	if (Array.isArray(dossier.priorities) && dossier.priorities.length)
		return dossier.priorities.slice(0, 3);
	const base = [...articleChecklistItems(article, context)];
	if (context?.product?.specs?.[1])
		base.push(
			`Reconfirm ${stripMarkdownInline(context.product.specs[1])} before approval closes.`,
		);
	return [...new Set(base)].slice(0, 3);
}

function articlePrimerNote(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	if (dossier.primerNote) return dossier.primerNote;
	const productName = context?.product?.name || article.categoryLabel;
	if (article.type.includes("Quality"))
		return `Use this page before ${productName.toLowerCase()} is received, accepted, or released into production.`;
	if (article.type.includes("Buyer"))
		return "Use this page when the first brief still needs application, reference, quantity, and approval language attached.";
	if (article.type.includes("Comparative"))
		return "Use this page when two routes look close on price but not yet on use, approval risk, or lifetime correction cost.";
	if (article.type.includes("Technical"))
		return "Use this page when the route depends on process conditions, tolerance, or specification language, not just a broad product name.";
	return "Use this page to tighten the brief before the technical, approval, and commercial conversations split apart.";
}

function articleFaqItems(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	if (Array.isArray(dossier.faqs) && dossier.faqs.length)
		return dossier.faqs.slice(0, 3);
	const productName = context?.product?.name || article.categoryLabel;
	const solutionName =
		relatedSolutionsForProduct(article.category)[0]?.name ||
		article.categoryLabel;
	if (article.type.includes("Comparative")) {
		return [
			{
				question: `When should ${productName} be compared more carefully?`,
				answer: `Compare ${productName.toLowerCase()} more carefully when the application, finish expectation, tolerance, receiving risk, or lifetime correction cost would make a generic equivalent misleading.`,
			},
			{
				question: "What should stay constant in the comparison?",
				answer:
					"Keep the same application, approval reference, dimensions, documentation need, quantity, timing, and destination context while the route itself changes.",
			},
			{
				question: "Who should be involved before the route is selected?",
				answer:
					"Procurement should align the commercial frame, the technical or design owner should align the fit, and quality or receiving should confirm how acceptance will be checked.",
			},
		];
	}
	if (article.type.includes("Quality")) {
		return [
			{
				question: `What should be checked first on ${productName.toLowerCase()}?`,
				answer: `Start with the approved benchmark, visible or dimensional condition, pack integrity, and any route-specific acceptance points that should be confirmed before production or installation release.`,
			},
			{
				question: "Why do receiving mistakes create bigger problems later?",
				answer:
					"Because weak receiving control allows the route to drift before the plant, site, or customer can separate approval failure from process failure.",
			},
			{
				question: "What protects repeat supply best?",
				answer:
					"Keep the inspection result, approved sample or drawing, and the exact route record attached to the next reorder instead of relying on memory.",
			},
		];
	}
	if (article.type.includes("Buyer")) {
		return [
			{
				question: `What should be in the first RFQ for ${productName.toLowerCase()}?`,
				answer:
					"Include application, size or build logic, finish or grade expectation, quantity, timing, destination, and the benchmark that will define acceptance.",
			},
			{
				question: "Why do buyer-led delays happen so often?",
				answer:
					"Most delays happen because the first brief is missing the real application, the approved reference, or the receiving logic that should already be attached to the route.",
			},
			{
				question: "Which teams should read this before a PO hardens?",
				answer:
					"Procurement, the approval owner, and the person who will receive or release the material should all be aligned before the order becomes difficult to change.",
			},
		];
	}
	return [
		{
			question: `When is ${productName.toLowerCase()} worth a deeper review?`,
			answer: `${productName} deserves a deeper review when the route is visible, tolerance-sensitive, process-critical, or expensive to correct after approval.`,
		},
		{
			question: "How should this page be used in practice?",
			answer: `Use it to tighten the brief for ${solutionName.toLowerCase()}, improve the RFQ, and keep the technical, approval, and commercial conversation attached to one route.`,
		},
		{
			question: "What reduces mistakes most consistently?",
			answer:
				"Keep the real application, the accepted benchmark, the receiving checkpoints, and the reorder trail tied together instead of letting each step create its own version of the route.",
		},
	];
}

function renderInsightPrimer(article, context = null) {
	const stakeholders = articleStakeholderGroups(article, context);
	const priorities = articlePriorityItems(article, context);
	const risks = articleRiskItems(article, context).slice(0, 3);
	return `<section class="article-primer-grid"><article class="article-primer-card article-primer-card-wide"><div class="article-primer-label">Use this guide for</div><div class="article-stakeholder-pills">${stakeholders.map((role) => `<span class="article-stakeholder-pill" title="${escHtml(stakeholderNoteFor(role))}">${escHtml(role)}</span>`).join("")}</div><p class="article-primer-copy">${escHtml(articlePrimerNote(article, context))}</p></article><article class="article-primer-card"><div class="article-primer-label">Lock first</div><ul class="article-primer-list">${priorities.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article><article class="article-primer-card"><div class="article-primer-label">Avoid this</div><ul class="article-primer-list">${risks.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article></section>`;
}

function renderInsightFAQSection(article, context = null) {
	const faqs = articleFaqItems(article, context);
	if (!faqs.length) return "";
	return `<section class="article-faq-section"><div class="article-section-head"><div class="ui-kicker mb-3">${glyph("message", "icon icon-sm")} Quick answers</div><h2>Questions that shape the next review</h2></div><div class="article-faq-grid">${faqs.map((item) => `<article class="article-faq-card"><h3>${escHtml(item.question)}</h3><p>${escHtml(item.answer)}</p></article>`).join("")}</div></section>`;
}

function renderApplicationPreviewCard(app, options = {}) {
	const { compact = false, priority = false } = options;
	const visual = getApplicationVisual(app.slug);
	const productLinks = app.products
		.slice(0, compact ? 4 : 5)
		.map((productId) => renderProductPillLink(productId))
		.filter(Boolean)
		.join("");
	const checkpoints = app.considerations
		.slice(0, compact ? 1 : 2)
		.map((item) => `<li>${escHtml(item)}</li>`)
		.join("");
	const audienceBadges = solutionAudienceFor(app.slug)
		.slice(0, compact ? 2 : 4)
		.map((item) => `<span>${escHtml(item)}</span>`)
		.join("");
	const summary = clampText(app.overview, compact ? 116 : 142);
	return `<article class="ui-solution-card${compact ? " ui-solution-card-compact" : ""}">
      <div class="ui-solution-media${visual.reviewStatus ? " review-media-frame" : ""}">
          <picture>
              ${visual.image.endsWith(".webp") ? `<source srcset="${visual.image.replace(".webp", ".avif")}" type="image/avif">` : ""}
              <img src="${visual.image}" alt="${escHtml(visual.alt)}" width="800" height="520" ${priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} class="w-full h-full object-cover">
          </picture>
          <div class="ui-solution-overlay"></div>
          ${visual.reviewStatus ? `<span class="review-media-badge">${escHtml(reviewMediaStatusLabel(visual.reviewStatus))}</span>` : ""}
      </div>
      <div class="ui-solution-body">
          <div class="ui-kicker mb-3">${glyph(applicationIconName(app.slug), "icon icon-sm")} ${escHtml(visual.eyebrow)}</div>
          <h3 class="ui-family-title">${escHtml(app.name)}</h3>
          <p class="ui-family-copy">${escHtml(summary)}</p>
          <div class="ui-solution-block">
              <div class="ui-solution-stack-label">Working stack</div>
              <div class="ui-link-row ui-link-row-roomy mt-4">${productLinks}</div>
          </div>
          <div class="ui-solution-block">
              <div class="ui-solution-stack-label">Typical reviewers</div>
              <div class="ui-app-badges ui-app-badges-roomy mt-4">${audienceBadges}</div>
          </div>
          ${compact ? "" : `<div class="ui-solution-block"><div class="ui-solution-stack-label">What usually decides the route</div><ul class="ui-stack-list ui-stack-list-compact mt-4">${checkpoints}</ul></div>`}
          <div class="ui-solution-card-action mt-6"><a href="${getSolutionHref(app.slug)}" class="btn-outline" aria-label="Open route: ${escHtml(app.name)}">Open route</a></div>
      </div>
  </article>`;
}

function renderSolutionProductCard(app, productId) {
	const product = getProduct(productId);
	const meta = getMeta(productId);
	if (!product || !meta) return "";
	const review = reviewProductMedia(product);
	const image = review?.image || approvedProductImage(product);
	const media = image
		? `<picture>${image.endsWith(".webp") ? `<source srcset="${image.replace(".webp", ".avif")}" type="image/avif">` : ""}<img src="${image}" alt="${escHtml(product.name)}" width="320" height="220" loading="lazy"></picture>${review ? `<span class="review-media-badge">${escHtml(reviewMediaStatusLabel(review.status))}</span>` : ""}`
		: `<div class="product-media-placeholder" role="img" aria-label="${escHtml(`${product.name}: specification route`)}">${glyph("layers", "icon")}<span>Open the product specification route</span></div>`;
	return `<article class="ui-stack-product-card">
      <div class="ui-stack-product-media">${media}</div>
      <div class="ui-stack-product-head">
          <div>
              <div class="ui-data-label">Product sheet</div>
              <h3 class="font-display font-bold text-xl mt-2">${escHtml(product.name)}</h3>
          </div>
          <span class="ui-meta-pill">${escHtml(product.stage)}</span>
      </div>
      <p class="text-sm text-zinc-500 leading-relaxed mt-4">${escHtml(productRoleForSolution(app.slug, productId))}</p>
      ${review ? `<p class="review-media-caption">${escHtml(reviewMediaBuyerCaption(review.status))}</p>` : ""}
      <div class="ui-app-badges mt-5">${(product.applications || [])
				.slice(0, 3)
				.map((item) => `<span>${escHtml(item)}</span>`)
				.join("")}</div>
      <div class="mt-6"><a href="${productPageHref(productId, { from: "solution", solution: app.slug })}" class="btn-outline">Open product sheet</a></div>
  </article>`;
}

function renderProductSolutionCard(productId, appSlug) {
	const app = applications.find((item) => item.slug === appSlug);
	if (!app) return "";
	const routeModel = ROUTE_VISUAL_MODELS[app.slug] || {};
	return `<article class="ui-note-card ui-note-card-solid product-solution-card product-solution-card-plain">
      <div class="product-solution-icon">${glyph(applicationIconName(app.slug))}</div>
      <div class="product-solution-body">
          <div class="ui-data-label">Solution system</div>
          <div class="ui-data-value">${escHtml(app.name)}</div>
          <p class="ui-data-note">${escHtml(productRoleForSolution(app.slug, productId))}</p>
          <div class="home-route-step-row home-route-step-row-compact">${(
						routeModel.process || []
					)
						.slice(0, 3)
						.map((item) => `<span>${escHtml(item)}</span>`)
						.join("")}</div>
          <div class="ui-link-row mt-5">${(routeModel.outputs || [])
						.slice(0, 2)
						.map((item) => `<span class="ui-link-pill">${escHtml(item)}</span>`)
						.join("")}</div>
          <div class="mt-6"><a href="${getSolutionHref(app.slug)}" class="btn-outline">Explore system</a></div>
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
	const beforeColon = title.split(":")[0];
	const normalized = beforeColon.includes(" for ")
		? beforeColon.split(" for ").slice(1).join(" for ")
		: beforeColon;
	const hasVs = beforeColon.includes(" vs ");
	const titleOptions = hasVs
		? normalized
				.split(" vs ")
				.map((part) => part.trim())
				.filter(Boolean)
		: [];
	if (titleOptions.length >= 2) return titleOptions.slice(0, 4);
	if (product.technical?.grades?.length >= 2)
		return product.technical.grades.slice(0, 4);
	return product.specs
		.slice(0, 3)
		.map((spec) => spec.split(":")[0].trim())
		.filter(Boolean);
}

function articleDecisionLens(article) {
	if (article.type.includes("Comparative"))
		return "Compare like-for-like before choosing a route.";
	if (article.type.includes("Quality"))
		return "Inspect the approval-critical points before release.";
	if (article.type.includes("Buyer"))
		return "Lock the RFQ inputs before asking for a quote.";
	if (article.type.includes("Technical"))
		return "Read the specification against the actual process.";
	if (article.type.includes("Field"))
		return "Use operating symptoms, not brochure language, to diagnose the issue.";
	return "Match the product route to the real application before the commercial step.";
}

function articleChecklistLabel(article) {
	if (article.type.includes("Quality")) return "Inspection checklist";
	if (article.type.includes("Comparative")) return "Comparison checklist";
	if (article.type.includes("Buyer")) return "RFQ checklist";
	if (article.type.includes("Technical")) return "Technical review checklist";
	return "Approval checklist";
}

function articleChecklistItems(article, context = null) {
	const product = context?.product;
	const base = [
		"Confirm the actual application, finish expectation, quantity, and timing before comparing prices.",
		"Keep the approved sample, drawing, or accepted technical record tied to the order.",
		"Check how the receiving team will inspect the material before production or installation release.",
	];
	if (article.type.includes("Quality"))
		base.unshift(
			"Define the acceptance points before the goods reach receiving.",
		);
	if (article.type.includes("Comparative"))
		base.unshift(
			"Match both options against the same end use, tolerance, and approval benchmark.",
		);
	if (article.type.includes("Technical"))
		base.unshift(
			"Treat the process condition as part of the specification, not as a separate discussion.",
		);
	if (article.type.includes("Buyer"))
		base.unshift(
			"Write down the non-negotiables so the first quote is not built on assumptions.",
		);
	if (product?.specs?.length)
		base.push(
			`Use ${stripMarkdownInline(product.specs[0])} as one of the first comparison checkpoints.`,
		);
	return base.slice(0, 4);
}

function articleRiskItems(article, context = null) {
	const dossier = resolveInsightDossier(article, context);
	if (Array.isArray(dossier.risks) && dossier.risks.length)
		return dossier.risks.slice(0, 4);
	const product = context?.product;
	const risks = [
		"Generic equivalents replacing a product-specific route too early.",
		"Weak reference control between the approved sample and the actual supply.",
		"Late-stage corrections caused by missing receiving or dispatch discipline.",
	];
	if (article.category === "industrial-press-plates")
		risks.unshift(
			"Flatness, parallelism, or surface condition being reduced to grade-only discussion.",
		);
	if (
		article.category === "decorative-panels" ||
		article.category === "ss-profiles"
	)
		risks.unshift(
			"Visual approval happening without a real sample or environment context.",
		);
	if (article.category === "press-pads" || article.category === "press-plates")
		risks.unshift(
			"Process drift being blamed on one layer when the stack should be reviewed together.",
		);
	if (product?.applications?.length)
		risks.push(
			`The route being judged outside its actual use case, such as ${product.applications[0]}.`,
		);
	return risks.slice(0, 4);
}

function renderInsightSignalStrip(article, context) {
	const product = context?.product;
	const meta = context?.meta;
	const specRows = product
		? product.specs.slice(0, 2).map((spec, index) => specToRow(spec, index))
		: [];
	const related = relatedSolutionsForProduct(article.category);
	const cards = [
		{
			label: "Decision lens",
			value: articleDecisionLens(article),
			note: article.type,
		},
		{
			label: "Critical signal",
			value: specRows[0]
				? `${specRows[0].label}: ${specRows[0].value}`
				: article.excerpt,
			note: product ? product.name : article.categoryLabel,
		},
		{
			label: "Best fit",
			value: product?.applications?.[0] || article.categoryLabel,
			note:
				product?.applications?.slice(1, 3).join(" • ") ||
				"Requirement-led review",
		},
		{
			label: "Linked references",
			value: meta
				? `${Math.min(3, meta.downloads.length)} file${meta.downloads.length === 1 ? "" : "s"}`
				: `${related.length} solution view${related.length === 1 ? "" : "s"}`,
			note: meta
				? "Downloads and routes are attached on this page."
				: "Use the linked routes for the next step.",
		},
	];
	return `<div class="article-signal-grid mt-8">${cards.map((card) => `<article class="article-signal-card"><div class="article-signal-label">${escHtml(card.label)}</div><div class="article-signal-value">${escHtml(card.value)}</div><p class="article-signal-note">${escHtml(card.note)}</p></article>`).join("")}</div>`;
}

function renderInsightTechnicalAppendix(article, context) {
	if (!context) return "";
	const { product, meta } = context;
	const specRows = product.specs
		.slice(0, 4)
		.map((spec, index) => specToRow(spec, index));
	const related = relatedSolutionsForProduct(article.category).slice(0, 3);
	const checklist = articleChecklistItems(article, context);
	const risks = articleRiskItems(article, context);
	const downloads = meta.downloads
		.slice(0, 2)
		.map((download) => downloadLink(download))
		.join("");
	return `
    <section class="article-appendix">
      <h2 id="technical-checkpoints-at-a-glance">Technical checkpoints at a glance</h2>
      <div class="article-appendix-grid">
        <article class="article-panel">
          <div class="article-panel-label">Technical reference</div>
          <table>
            <tr><th>Checkpoint</th><th>Reference</th></tr>
            ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join("")}
            <tr><td>Lead time</td><td>${escHtml(product.technical?.leadTime || "On request")}</td></tr>
            <tr><td>Origin route</td><td>${escHtml(product.technical?.origin || "On request")}</td></tr>
          </table>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">${escHtml(articleChecklistLabel(article))}</div>
          <ul>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">Where mistakes happen</div>
          <ul>${risks.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul>
        </article>
        <article class="article-panel">
          <div class="article-panel-label">Turn this into the next review</div>
          <div class="article-panel-chip-row">${related.length ? related.map((app) => `<a href="${getSolutionHref(app.slug)}" class="article-panel-chip">${escHtml(app.name)}</a>`).join("") : `<span class="article-panel-chip">${escHtml(article.categoryLabel)}</span>`}</div>
          <p class="text-sm text-zinc-500 leading-relaxed mt-4">Move into the product sheet or the linked solution view when this guide needs an actual reference file, quotation trail, or approval benchmark.</p>
          ${downloads ? `<div class="article-panel-links mt-4">${downloads}</div>` : ""}
        </article>
      </div>
    </section>`;
}

function renderInsightArticleBody(article) {
	if (article.technicalLibrary) {
		const context = articleProductContext(article);
		return renderInsightCoverCard(article, context, { eager: true }) + renderTechnicalLibraryArticle(article);
	}

	const context = articleProductContext(article);
	const leadPanels = renderInsightLeadPanels(article, context);
	const supportPanels = renderInsightSupportPanels(article, context);
	const authoredContent = String(article.content || "").trim();
	if (authoredContent) {
		return (
			renderInsightPrimer(article, context) +
			leadPanels +
			markdownToHtml(authoredContent) +
			supportPanels +
			renderInsightTechnicalAppendix(article, context) +
			renderInsightFAQSection(article, context)
		);
	}

	if (!context) {
		return (
			renderInsightPrimer(article, context) +
			leadPanels +
			markdownToHtml(article.content) +
			supportPanels +
			renderInsightFAQSection(article, context)
		);
	}

	const { product, meta } = context;
	const specRows = product.specs.map((spec, index) => specToRow(spec, index));
	const commercialRows = [
		["Lead time", product.technical?.leadTime || "On request"],
		["MOQ", product.technical?.moq || "On request"],
		["Origin", product.technical?.origin || "On request"],
		[
			"Standards",
			(product.technical?.certifications || []).join(", ") || "On request",
		],
	];
	const checklist = [
		"Define the application, finish expectation, and end-use environment before requesting a quote.",
		"Lock dimensional requirements, grade, and compliance expectations in the RFQ.",
		"Confirm sampling or reference approval when finish fidelity or surface consistency matters.",
		"Review supply timing, documentation, and packing requirements before order confirmation.",
	];
	const safeOverview =
		`${product.summary} ${product.customization || ""}`.trim();
	const safeWorkflow = meta.workflow || product.summary;
	const safeCommercial = `${product.customization || "Final configuration is confirmed per enquiry."} Lead time, MOQ, origin, and supporting documents are confirmed against the actual programme.`;
	let body = "";

	if (article.type === "Buyer's Guide") {
		body = `
      <h2>Why This Matters</h2>
      <p>${escHtml(product.name)} buying decisions affect not only landed cost, but also finish quality, production stability, and downstream rework. The strongest RFQs align technical expectations, commercial timing, and inspection checkpoints before production begins.</p>
      <h2>Commercial Baseline</h2>
      <table>
        <tr><th>Parameter</th><th>Reference</th></tr>
        ${commercialRows.map(([label, value]) => `<tr><td>${escHtml(label)}</td><td>${escHtml(value)}</td></tr>`).join("")}
      </table>
      <h2>What To Lock Before Inquiry</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> ${escHtml(row.value)}</li>`).join("")}</ul>
      <h2>Supplier Evaluation Frame</h2>
      <ul>
        <li><strong>Technical fit:</strong> Can the supplier align grade, build-up, finish, and application performance instead of quoting a generic equivalent?</li>
        <li><strong>Quality controls:</strong> Are inspections, approvals, and reference documents defined before dispatch?</li>
        <li><strong>Commercial discipline:</strong> Are lead time assumptions, quantity expectations, and logistics responsibilities clear?</li>
        <li><strong>Communication speed:</strong> Does the supplier respond fast enough for iterative specification work?</li>
      </ul>
      <h2>RFQ Checklist</h2>
      <ol>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ol>
      <h2>How Moldart Usually Engages</h2>
      <p>${escHtml(safeOverview)}</p>
      <p>${escHtml(safeCommercial)}</p>`;
	} else if (article.type === "Quality & Standards") {
		body = `
      <h2>Quality Scope</h2>
      <p>${escHtml(product.name)} quality should be reviewed through the combined lens of dimensional control, surface acceptance, certification support, and consistency against the approved reference.</p>
      <h2>Applicable Standards</h2>
      <table>
        <tr><th>Control Area</th><th>Reference</th></tr>
        <tr><td>Primary standards</td><td>${escHtml((product.technical?.certifications || []).join(", ") || "Project-specific")}</td></tr>
        <tr><td>Material platform</td><td>${escHtml((product.technical?.grades || []).join(", ") || product.material)}</td></tr>
        <tr><td>Typical supply route</td><td>${escHtml(product.technical?.origin || "On request")}</td></tr>
      </table>
      <h2>Inspection Priorities</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> Verify against approved technical reference and supply documentation.</li>`).join("")}</ul>
      <h2>Receiving Checklist</h2>
      <ol>
        <li>Match order line, product description, and quantity against shipping documents.</li>
        <li>Confirm surface condition, dimensional integrity, and pack protection immediately on receipt.</li>
        <li>Review material certificates, compliance references, and any special quality commitments.</li>
        <li>Escalate deviations before installation, conversion, or production release.</li>
      </ol>
      <h2>Common Quality Risks</h2>
      <p>The most common failures happen when reference approval is weak, specifications are incomplete, or incoming inspection is delayed until after processing begins.</p>`;
	} else if (article.type === "Application Guide") {
		body = `
      <h2>Application Context</h2>
      <p>${escHtml(safeWorkflow)}</p>
      <h2>Typical Use Cases</h2>
      <ul>${product.applications.map((application) => `<li><strong>${escHtml(application)}:</strong> Evaluate the product against finish requirement, production load, and installation or conversion method.</li>`).join("")}</ul>
      <h2>Selection Priorities</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> ${escHtml(row.value)}</li>`).join("")}</ul>
      <h2>Common Mistakes</h2>
      <ol>
        <li>Choosing on price before aligning the technical requirement.</li>
        <li>Skipping reference validation when finish or tolerance is surface-critical.</li>
        <li>Ignoring production timing, storage, or handling conditions before use.</li>
        <li>Under-specifying documentation for export, compliance, or customer approval.</li>
      </ol>
      <h2>Execution Note</h2>
      <p>${escHtml(safeCommercial)}</p>`;
	} else if (article.type === "Technical Deep-Dive") {
		body = `
      <h2>Technical Scope</h2>
      <p>${escHtml(safeOverview)}</p>
      <h2>Specification Reference</h2>
      <table>
        <tr><th>Technical item</th><th>Reference</th></tr>
        ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join("")}
        <tr><td>Material grades</td><td>${escHtml((product.technical?.grades || []).join(", ") || product.material)}</td></tr>
        <tr><td>Standards</td><td>${escHtml((product.technical?.certifications || []).join(", ") || "Project-specific")}</td></tr>
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
	} else if (article.type === "Comparative Analysis") {
		const options = extractComparisonOptions(article.title, product);
		const comparisonRows = options
			.map((option, index) => {
				const note =
					index === 0
						? "Best when commercial efficiency and broad availability are the primary drivers."
						: index === 1
							? "Best when performance, finish control, or service life justify the tighter specification."
							: "Best when the requirement is application-specific or tied to an existing approval route.";
				return `<tr><td>${escHtml(option)}</td><td>${escHtml(product.applications[index % product.applications.length] || product.use)}</td><td>${escHtml(note)}</td></tr>`;
			})
			.join("");
		body = `
      <h2>Decision Frame</h2>
      <p>${escHtml(product.name)} comparisons are rarely just material-versus-material decisions. The right answer depends on tolerance, finish expectation, conversion route, volume, and commercial timing.</p>
      <h2>Comparison Table</h2>
      <table>
        <tr><th>Option</th><th>Typical fit</th><th>Decision note</th></tr>
        ${comparisonRows}
      </table>
      <h2>Shared Evaluation Criteria</h2>
      <ul>${specRows.map((row) => `<li><strong>${escHtml(row.label)}:</strong> Use this as a like-for-like comparison checkpoint.</li>`).join("")}</ul>
      <h2>Commercial Overlay</h2>
      <p>Even when multiple options are technically viable, lead time, MOQ, origin, documentation, and approval risk can materially change the best commercial choice.</p>
      <table>
        <tr><th>Commercial item</th><th>Reference</th></tr>
        ${commercialRows.map(([label, value]) => `<tr><td>${escHtml(label)}</td><td>${escHtml(value)}</td></tr>`).join("")}
      </table>`;
	} else if (article.type === "Comprehensive Guide") {
		body = `
      <h2>Overview</h2>
      <p>${escHtml(safeOverview)}</p>
      <h2>Where It Fits</h2>
      <p>${escHtml(safeWorkflow)}</p>
      <h2>Core Technical References</h2>
      <table>
        <tr><th>Reference area</th><th>Details</th></tr>
        ${specRows.map((row) => `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td></tr>`).join("")}
      </table>
      <h2>Typical Applications</h2>
      <ul>${product.applications.map((application) => `<li>${escHtml(application)}</li>`).join("")}</ul>
      <h2>Commercial Notes</h2>
      <p>${escHtml(safeCommercial)}</p>
      <h2>Selection Checklist</h2>
      <ol>${checklist.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ol>
      <h2>When To Talk To Moldart</h2>
      <p>Bring Moldart in early when the programme involves finish-sensitive approvals, multi-step sourcing, compliance-sensitive exports, or recurring supply that needs a stable technical-commercial reference.</p>`;
	} else {
		body = markdownToHtml(article.content);
	}

	return (
		renderInsightPrimer(article, context) +
		leadPanels +
		body +
		supportPanels +
		renderInsightTechnicalAppendix(article, context) +
		renderInsightFAQSection(article, context)
	);
}

function productCard(productId, { reviewMedia = false } = {}) {
	const p = getProduct(productId);
	const m = getMeta(productId);
	if (!p || !m) return "";
	const review = reviewMedia ? reviewProductMedia(p) : null;
	const approvedImage = approvedProductImage(p);
	const image = review?.image || approvedImage;
	const pictureSource = image?.endsWith(".webp")
		? `<source srcset="${image.replace(".webp", ".avif")}" type="image/avif">`
		: "";
	const media = image
		? `<picture>${pictureSource}<img src="${image}" alt="${escHtml(p.name)}" width="720" height="540" loading="lazy" class="w-full h-full object-cover"></picture>${review ? `<span class="review-media-badge">${escHtml(reviewMediaStatusLabel(review.status))}</span>` : ""}`
		: `<div class="product-media-placeholder" role="img" aria-label="${escHtml(`${p.name}: specification route`)}">${glyph("layers", "icon")}<span>Open the product specification route</span></div>`;
	const statusClass = p.publicStatus === "In stock" ? " is-stocked" : "";
	return `<a href="/products/${m.slug}/" class="product-card border rounded-xl overflow-hidden transition-colors group">
    <div class="product-card-img relative overflow-hidden product-card-img-fixed">${media}</div>
    <div class="p-4">
        <div class="product-card-status${statusClass}">${escHtml(p.publicStatus || "Current RFQ Route")}</div>
        <h3 class="font-display font-bold text-base tracking-wider mb-1">${escHtml(p.name)}</h3>
        <p class="text-xs text-zinc-500 leading-relaxed">${escHtml(p.summary)}</p>
        ${review ? `<p class="review-media-caption">${escHtml(reviewMediaBuyerCaption(review.status))}</p>` : ""}
        <div class="mt-3 flex gap-2 flex-wrap">
            ${(p.applications || []).slice(0, 2).map((item) => `<span class="directory-pill">${escHtml(item)}</span>`).join("")}
        </div>
    </div>
</a>`;
}

function ctaBlock(
	heading,
	subtext,
	primaryLabel,
	primaryHref,
	secondaryLabel,
	secondaryHref,
) {
	return `<section class="max-w mx-auto px py-24 fade-up">
    <div class="ui-cta-band">
        <div class="ui-cta-copy">
            <h2 class="font-display font-black text-3xl mb-3 heading-tight">${heading}</h2>
            <p>${subtext}</p>
        </div>
        <div class="ui-cta-actions">
            <a href="${primaryHref}" class="btn-primary btn-lg">${primaryLabel} →</a>
            ${secondaryLabel ? `<a href="${secondaryHref}" class="btn-outline btn-lg">${secondaryLabel}</a>` : ""}
        </div>
    </div>
</section>`;
}

// ============================================================
// PAGE GENERATORS
// ============================================================

function generateHomepage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": ["Organization", "LocalBusiness"],
			name: "Moldart",
			url: SITE + "/",
			logo: {
				"@type": "ImageObject",
				url: SITE + "/favicon-192x192.png",
				width: 192,
				height: 192,
			},
			sameAs: [COMPANY_LINKEDIN, YASH_LINKEDIN],
			address: {
				"@type": "PostalAddress",
				streetAddress:
					"#7, Building No. 1, New Sonal Link Industrial Estate, Link Road, Malad (West)",
				addressLocality: "Mumbai",
				addressRegion: "Maharashtra",
				postalCode: "400064",
				addressCountry: "IN",
			},
			contactPoint: {
				"@type": "ContactPoint",
				telephone: "+917208088788",
				contactType: "sales",
				email: "info@moldartindia.com",
				areaServed: "IN",
				availableLanguage: ["English", "Hindi"],
			},
			description:
				"Technical RFQ coordination for wood-panel lamination, decorative stainless steel, and electronics press systems from Mumbai.",
		},
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			"@id": SITE + "/#website",
			name: "Moldart",
			url: SITE + "/",
			inLanguage: "en-IN",
		},
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/#webpage",
			url: SITE + "/",
			name: "Moldart | Wood, Steel & Electronics Technical RFQs",
			description:
				"One technical RFQ path for wood-panel lamination, decorative stainless steel, and electronics press systems.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const homeBrowseRows = [
		{
			href: "/contact/?intent=buyer-rfq",
			icon: "message",
			label: "Send an RFQ",
			note: "Requirement, quantity, timeline, destination.",
		},
		{
			href: "#fit-matrix",
			icon: "grid",
			label: "Find the route",
			note: "Match the job to the right material path.",
		},
		{
			href: "/resources/",
			icon: "book",
			label: "Use documents",
			note: "Catalogues, checklists, and approval files.",
		},
	]
		.map((item) => renderHomeHeroBrowseRow(item))
		.join("");
	const homeProofPoints = [
		["3", "product systems"],
		["17", "technical product routes"],
		["1", "structured RFQ path"],
	]
		.map(
			([value, label]) =>
				`<span><strong>${escHtml(value)}</strong>${escHtml(label)}</span>`,
		)
		.join("");
	const homeHeroVisual = `<div class="home-command-visual" role="img" aria-label="Moldart RFQ supply control preview">
        <div class="home-command-card home-command-card-light">
            <div class="home-command-card-head"><span>How your RFQ moves</span><strong>Brief → Route → Proof → Delivery</strong></div>
            <div class="home-command-track" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            <div class="home-command-nodes" aria-hidden="true"><span>Brief</span><span>Matrix</span><span>Samples</span><span>Ship</span></div>
        </div>
        <div class="home-command-collage">
            ${renderReviewProductImageCard("press-plates", "home-command-photo home-command-photo-large", "Wood lamination press plate existing reference", true)}
            ${renderReviewProductImageCard("decorative-panels", "home-command-photo", "Decorative stainless steel existing reference", false)}
            ${renderReviewProductImageCard("industrial-press-plates", "home-command-photo", "Electronics press tooling existing reference", false)}
        </div>
        <div class="home-command-proof-line">Representative product references · exact grade, construction and availability are confirmed in your RFQ</div>
    </div>`;
	const homeFlowGraph = [
		["01", "Brief", "Application, quantity, timing, destination."],
		["02", "Route", "Product family, source fit, approval pack."],
		["03", "Proof", "Sample, quote, document, payment milestone."],
		["04", "Delivery", "Dispatch, logistics, repeat supply record."],
	]
		.map(
			([step, title, copy]) =>
				`<article class="home-flow-node"><span>${escHtml(step)}</span><strong>${escHtml(title)}</strong><p>${escHtml(copy)}</p></article>`,
		)
		.join("");
	const homeFitRows = [
		["Wood-panel lamination", "Lamination", "Stack · construction · sample · QC", getSolutionHref("lamination")],
		["Furniture components", "Furniture & cabinetry", "Drawing · board · surface · packing", getSolutionHref("furniture")],
		["Laminate flooring", "Flooring", "Construction · joint · site · accessories", getSolutionHref("flooring")],
		["Decorative surfaces", "HPL / LPL / films", "Substrate · process · master sample", getSolutionHref("decorative-surfaces")],
		["Decorative stainless", "Architecture / metal", "Grade · finish · drawing · packing", getSolutionHref("architecture")],
		["Electronics pressing", "PCB / CCL / FPC", "Stack · role · process · metrology", getSolutionHref("pcb-ccl")],
	];
	const homeFitMatrix = `<div class="home-fit-matrix-wrap"><table class="home-fit-matrix"><caption class="sr-only">Moldart route fit matrix</caption><thead><tr><th scope="col">Need</th><th scope="col">Route</th><th scope="col">Proof to request</th><th scope="col">Start</th></tr></thead><tbody>${homeFitRows
		.map(
			([need, route, proof, href]) =>
				`<tr><td>${escHtml(need)}</td><td>${escHtml(route)}</td><td>${escHtml(proof)}</td><td><a href="${href}" class="home-fit-link">Open</a></td></tr>`,
		)
		.join("")}</tbody></table></div>`;
	const homeVisualCards = [
		["press-plates", "Wood-panel systems", "Press tooling, papers, films, boards and laminates", getSolutionHref("lamination")],
		["decorative-panels", "Decorative stainless steel", "Sheets, profiles, finish approval and packing", getSolutionHref("architecture")],
		["industrial-press-plates", "Electronics press systems", "Precision tooling, cushion materials and process films", getSolutionHref("pcb-ccl")],
	]
		.map(
			([productId, title, note, href]) =>
				`<a class="home-visual-card" href="${href}">${renderReviewProductImageCard(productId, "home-visual-card-media", `${title} representative product reference`, false)}<span>${escHtml(title)}</span><p>${escHtml(note)}</p><small>Representative image — confirm the exact specification and availability in your RFQ.</small></a>`,
		)
		.join("");

	return (
		headTag({
			title: "Moldart | Wood, Steel & Electronics Technical RFQs",
			desc: "One technical RFQ path for wood-panel lamination, decorative stainless steel, and electronics press systems.",
			canonical: "/",
			ogImage: siteSocialPosterRelativePath("moldart-home"),
			ogImageAlt: "Moldart homepage overview",
			schemas,
			prefetch: ["/solutions/", "/resources/", "/insights/", "/contact/"],
			preloadImages: [],
			stylesheet: "/home.css",
			preloadFonts: false,
		}) +
		"\n" +
		nav("home") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 home-hero-section home-hero-section-premium">
            <div class="home-hero-shell-modern home-hero-shell-premium">
                <div class="home-hero-copy-column">
                    <div class="home-hero-kicker-line mb-4">${glyph("shield", "icon icon-sm")} Mumbai technical RFQ desk</div>
                    <h1 class="home-hero-heading">ONE RFQ PATH FOR WOOD, STEEL + ELECTRONICS.</h1>
                    <p class="home-hero-intro mt-6">Send the product, application, grade or construction, quantity, timing and destination. Moldart then aligns the supply route, approval evidence, sample requirements and packing basis before quotation.</p>
                    <div class="home-proof-strip mt-7" aria-label="Moldart route overview">${homeProofPoints}</div>
                    <div class="home-hero-actions mt-8">
                        <a href="/contact/?intent=buyer-rfq" class="btn-primary btn-lg">Start Technical RFQ</a>
                        <a href="/products/" class="btn-outline btn-lg">Browse Product Systems</a>
                    </div>
                    <p class="home-hero-action-note">Start with the product, quantity, timing, and destination. No account is required.</p>
                    <a href="${whatsappHref(WHATSAPP_PRIMARY.number, "Hi Moldart, I would like to discuss a product requirement.")}" target="_blank" rel="noopener noreferrer" class="home-hero-mobile-chat">${glyph("whatsapp-brand", "icon icon-sm")} Prefer WhatsApp? Start a quick chat</a>
                </div>
                <div class="home-hero-stage">
                    ${homeHeroVisual}
                    <div class="home-browse-panel">
                        <div class="ui-kicker mb-3">${glyph("search", "icon icon-sm")} Choose the next move</div>
                        <div class="home-browse-list">${homeBrowseRows}</div>
                    </div>
                </div>
            </div>
        </section>

        <section id="fit-matrix" class="max-w mx-auto px py-16 border-y border-zinc-100 fade-up home-fit-section">
            <div class="home-section-split mb-8">
                <div>
                    <div class="ui-kicker mb-4">${glyph("grid", "icon icon-sm")} Fit matrix</div>
                    <h2 class="home-section-title">LESS READING. FASTER ROUTING.</h2>
                </div>
                <p class="ui-section-subtitle">Use the need-first table to pick the right route, then send only the proof details that affect approval.</p>
            </div>
            ${homeFitMatrix}
        </section>

        <section class="max-w mx-auto px py-16 fade-up home-flow-section">
            <div class="home-section-split mb-8">
                <div>
                    <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Control graph</div>
                    <h2 class="home-section-title">FROM BRIEF TO DELIVERY.</h2>
                </div>
                <p class="ui-section-subtitle">See how a requirement moves from route selection and sample approval to documents, dispatch, and repeat supply.</p>
            </div>
            <div class="home-flow-graph">${homeFlowGraph}</div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up home-visual-section">
            <div class="home-section-split mb-8">
                <div>
                    <div class="ui-kicker mb-4">${glyph("layers", "icon icon-sm")} Visual shortlist</div>
                    <h2 class="home-section-title">THREE PRODUCT SYSTEMS.</h2>
                </div>
                <p class="ui-section-subtitle">Start with wood-panel lamination, decorative stainless steel or electronics press systems. Product construction and evidence are confirmed inside the selected route.</p>
            </div>
            <div class="home-visual-grid">${homeVisualCards}</div>
        </section>

        <section class="max-w mx-auto px py-16 home-final-cta-section">
            <div class="home-final-cta">
                <div>
                    <div class="ui-kicker mb-3">${glyph("message", "icon icon-sm")} Ready</div>
                    <h2>Send one clean brief.</h2>
                    <p>Application, quantity, timeline, destination, and reference files are enough to start.</p>
                </div>
                <a href="/contact/?intent=buyer-rfq" class="btn-primary btn-lg">Share Requirement</a>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements(false)}`
	);
}

function generateExplorePage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Explore" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/explore/#webpage",
			url: SITE + "/explore/",
			name: "Explore Moldart | Search the full portfolio",
			description:
				"Search solutions, product sheets, technical guides, and resources across the full Moldart portfolio.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const exploreEntries = getExploreDiscoveryEntries();
	const typeCounts = {
		product: exploreEntries.filter((entry) => entry.type === "product").length,
		solution: exploreEntries.filter((entry) => entry.type === "solution")
			.length,
		document: exploreEntries.filter((entry) => entry.type === "document")
			.length,
		guide: exploreEntries.filter((entry) => entry.type === "guide").length,
	};
	const routeFilters = [
		"all",
		...new Set(exploreEntries.flatMap((entry) => entry.routes || [])),
	];
	const typeButtons = [
		["all", `All ${exploreEntries.length}`],
		["product", `Products ${typeCounts.product}`],
		["solution", `Solutions ${typeCounts.solution}`],
		["guide", `Guides ${typeCounts.guide}`],
		["document", `Documents ${typeCounts.document}`],
	]
		.map(
			([value, label], index) =>
				`<button type="button" class="explore-filter-chip${index === 0 ? " is-active" : ""}" data-explore-type="${value}">${escHtml(label)}</button>`,
		)
		.join("");
	const routeButtons = routeFilters
		.map(
			(slug, index) =>
				`<button type="button" class="explore-filter-chip${index === 0 ? " is-active" : ""}" data-explore-route="${slug}">${escHtml(slug === "all" ? "All routes" : routeNameForSlug(slug))}</button>`,
		)
		.join("");
	const exploreTypeMeta = {
		solution: {
			title: "Solutions",
			copy: "Application-led system pages that already group the relevant product stack.",
		},
		product: {
			title: "Product sheets",
			copy: "Item-level reference pages when the route is known and the product check is next.",
		},
		document: {
			title: "Documents",
			copy: "Catalogues, finish decks, and downloadable files tied to the current route.",
		},
		guide: {
			title: "Guides",
			copy: "Editorial notes for approvals, fit, receiving checks, and route comparison.",
		},
	};
	const exploreStartCards = [
		{
			icon: "layers",
			title: "Product known",
			copy: "Start with product sheets when the item family is already clear.",
			href: "/explore/?type=product",
		},
		{
			icon: "compass",
			title: "Application known",
			copy: "Start with solutions when the requirement belongs to a programme route.",
			href: "/explore/?type=solution",
		},
		{
			icon: "book",
			title: "Need documents",
			copy: "Start with catalogues, finish decks, and reference downloads.",
			href: "/explore/?type=document",
		},
		{
			icon: "message",
			title: "Need a shortlist",
			copy: "Send the brief when the product, route, and documents are not obvious.",
			href: "/contact/?intent=buyer-rfq",
		},
	]
		.map(
			(card) =>
				`<a href="${card.href}" class="explore-start-card"><div class="ui-kicker mb-3">${glyph(card.icon, "icon icon-sm")} ${escHtml(card.title)}</div><p>${escHtml(card.copy)}</p></a>`,
		)
		.join("");
	const groupedExploreHtml = ["solution", "product", "document", "guide"]
		.map((type) => {
			const items = exploreEntries.filter((entry) => entry.type === type);
			if (!items.length) return "";
			const meta = exploreTypeMeta[type];
			return `<section class="explore-results-group" data-explore-group data-group-type="${type}"><div class="explore-results-group-head"><div><h2 class="explore-results-group-title">${escHtml(meta.title)}</h2><p class="explore-results-group-copy">${escHtml(meta.copy)}</p></div><div class="explore-results-group-count">${items.length}</div></div><div class="explore-results-stack">${items.map((entry) => renderExploreDiscoveryCard(entry)).join("")}</div></section>`;
		})
		.join("");
	const directoryScript = `<script>(function(){var root=document.querySelector('[data-explore-directory]');if(!root)return;var input=root.querySelector('[data-explore-search]');var summary=root.querySelector('[data-explore-summary]');var empty=root.querySelector('[data-explore-empty]');var cards=Array.from(root.querySelectorAll('[data-explore-card]'));var groups=Array.from(root.querySelectorAll('[data-explore-group]'));var params=new URLSearchParams(window.location.search);var state={q:params.get('q')||'',type:params.get('type')||'',route:params.get('route')||'all'};if(state.type&&!root.querySelector('[data-explore-type="'+state.type+'"]'))state.type='';if(!root.querySelector('[data-explore-route="'+state.route+'"]'))state.route='all';if(input)input.value=state.q;cards.forEach(function(card){if(!card.dataset.display){var display=window.getComputedStyle(card).display;card.dataset.display=display&&display!=='none'?display:'flex';}});function setVisible(node, show){node.hidden=!show;node.style.display=show?(node.dataset.display||'block'):'none';}function updateButtons(){root.querySelectorAll('[data-explore-type]').forEach(function(btn){btn.classList.toggle('is-active', btn.getAttribute('data-explore-type')===state.type);});root.querySelectorAll('[data-explore-route]').forEach(function(btn){btn.classList.toggle('is-active', btn.getAttribute('data-explore-route')===state.route);});}function apply(){var q=(state.q||'').trim().toLowerCase();var visible=0;cards.forEach(function(card){var type=(card.getAttribute('data-type')||'').trim();var routes=(card.getAttribute('data-routes')||'').split(/\\s+/).map(function(value){return value.trim();}).filter(Boolean);var haystack=(card.getAttribute('data-search')||'').toLowerCase();var typeOk=!!state.type&&(state.type==='all'||type===state.type);var routeOk=state.route==='all'||routes.indexOf(state.route)!==-1;var searchOk=!q||haystack.indexOf(q)!==-1;var show=typeOk&&routeOk&&searchOk;setVisible(card, show);if(show)visible+=1;});groups.forEach(function(group){var groupCards=Array.from(group.querySelectorAll('[data-explore-card]'));var hasVisible=groupCards.some(function(card){return !card.hidden;});group.hidden=!hasVisible;group.style.display=hasVisible?'grid':'none';});if(summary)summary.textContent=!state.type&&!q?'Choose a product, solution, guide, document, or search to begin.':visible+' of '+cards.length+' visible';if(empty){var starter=!state.type&&!q;empty.hidden=visible!==0&&!starter;empty.textContent=starter?'Choose a starting path or search to see matching items.':'No matching items. Try a broader keyword or another filter.';}updateButtons();var next=new URLSearchParams();if(state.q)next.set('q',state.q);if(state.type&&state.type!=='all')next.set('type',state.type);if(state.route&&state.route!=='all')next.set('route',state.route);var query=next.toString();history.replaceState({},'',window.location.pathname+(query?'?'+query:''));}if(input)input.addEventListener('input',function(){state.q=input.value||'';apply();});root.addEventListener('click',function(event){var typeBtn=event.target.closest('[data-explore-type]');var routeBtn=event.target.closest('[data-explore-route]');if(typeBtn){state.type=typeBtn.getAttribute('data-explore-type')||'all';apply();}if(routeBtn){state.route=routeBtn.getAttribute('data-explore-route')||'all';apply();}});apply();})();</script>`;

	return (
		headTag({
			title: "Explore Moldart | Search solutions, product sheets, and guides",
			desc: "Search and filter Moldart solutions, product sheets, technical resources, and guides from one discovery page.",
			canonical: "/explore/",
			ogImage: siteSocialPosterRelativePath("moldart-explore"),
			ogImageAlt: "Moldart explore preview",
			schemas,
			prefetch: ["/resources/", "/solutions/", "/insights/"],
		}) +
		"\n" +
		nav("explore") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("search", "icon icon-sm")} Search the full portfolio</div>
                    <h1 class="ui-section-title">SEARCH PRODUCTS,<br>SOLUTIONS, GUIDES,<br>AND DOCUMENTS.</h1>
                    <p class="ui-section-subtitle">Explore is the master discovery layer. Filter by result type, route, and keyword when you want one place to shortlist the right sheet, guide, or document without losing the dedicated page behind it.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph("search", "icon icon-sm")} Search on-page</span>
                        <span class="ui-chip">${glyph("layers", "icon icon-sm")} Typed results</span>
                        <span class="ui-chip">${glyph("spark", "icon icon-sm")} Ctrl/⌘ K palette</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-metric-grid">
                        ${renderMetricCard({ icon: "compass", label: "Solutions", value: typeCounts.solution, note: "System views that already include the relevant product stack." })}
                        ${renderMetricCard({ icon: "layers", label: "Product sheets", value: typeCounts.product, note: "Reference-led pages for individual products and categories." })}
                        ${renderMetricCard({ icon: "book", label: "Documents", value: typeCounts.document, note: "Catalogues, finish decks, and downloadable reference files." })}
                        ${renderMetricCard({ icon: "spark", label: "Guides", value: typeCounts.guide, note: "Edited insights covering approvals, fit, quality, and buying decisions." })}
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-12 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Start by task</div>
                <h2 class="ui-section-title">DO NOT SCROLL THE WHOLE LIBRARY FIRST.</h2>
                <p class="ui-section-subtitle">Choose the route that matches what you already know. Search remains available, but the first decision should be simple.</p>
            </div>
            <div class="explore-start-grid">${exploreStartCards}</div>
        </section>

        <section class="max-w mx-auto px py-16">
            <div class="explore-shell" data-explore-directory>
                <div class="explore-toolbar">
                    <div>
                        <div class="ui-kicker mb-3">${glyph("map", "icon icon-sm")} Typed discovery</div>
                        <p class="text-sm text-zinc-500 leading-relaxed">Use type filters when you already know the kind of answer you want. Use route filters when the requirement still belongs to a broader programme.</p>
                    </div>
                    <div class="explore-summary" data-explore-summary>${exploreEntries.length} of ${exploreEntries.length} visible</div>
                </div>
                <div class="explore-controls">
                    <input type="search" class="ui-directory-search explore-search-input" data-explore-search placeholder="Search products, systems, guides, documents, specs, or application terms..." aria-label="Search explore results">
                    <div class="explore-filter-group">
                        <div class="explore-filter-label">Type</div>
                        <div class="explore-filter-row">${typeButtons}</div>
                    </div>
                    <div class="explore-filter-group">
                        <div class="explore-filter-label">Route</div>
                        <div class="explore-filter-row">${routeButtons}</div>
                    </div>
                </div>
                <div class="explore-results-list">${groupedExploreHtml}</div>
                <div class="explore-empty" data-explore-empty hidden>No result matches this filter yet. Try a broader keyword, switch the route, or return to all result types.</div>
            </div>
        </section>

        ${ctaBlock("NEED A HUMAN<br>SHORTLIST?", "If search gets you close but not all the way there, send the requirement and let the team align the right path directly.", "Share your requirement", "/contact/")}
    </main>

    ${footer()}
    ${directoryScript}
    ${closingElements()}`
	);
}

function generateSolutionsHub() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Solutions" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/solutions/#webpage",
			url: SITE + "/solutions/",
			name: "Solutions — Moldart",
			description:
				"Programme views across lamination, furniture, flooring, architecture, decorative stainless steel, and industrial press applications.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const solutionCards = applications
		.map((app, index) =>
			renderApplicationPreviewCard(app, { priority: index < 3 }),
		)
		.join("\n");

	return (
		headTag({
			title: "B2B Sourcing Solutions | Moldart",
			desc: "Start with the programme and see the relevant product stack, guides, and downloads together.",
			canonical: "/solutions/",
			ogImage: siteSocialPosterRelativePath("moldart-solutions"),
			ogImageAlt: "Moldart solutions overview",
			schemas,
		}) +
		"\n" +
		nav("solutions") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} Solutions</div>
                    <h1 class="ui-section-title">START WITH THE PROGRAMME.</h1>
                    <p class="ui-section-subtitle">Each solution page keeps the relevant products, practical checkpoints, related guides, and reference downloads together so the next step is easier to judge.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph("compass", "icon icon-sm")} ${applications.length} programme views</span>
                        <span class="ui-chip">${glyph("layers", "icon icon-sm")} Product sheets linked where needed</span>
                        <span class="ui-chip">${glyph("book", "icon icon-sm")} Guides and downloads attached</span>
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
            <h2 class="sr-only">Solution programme routes</h2>
            <div class="ui-solution-grid">${solutionCards}</div>
        </section>

        ${ctaBlock("NEED A CLEANER<br>SHORTLIST?", "Open the solution that matches the requirement, review the stack, and then move into direct discussion when the brief is ready.", "Share your requirement", "/contact/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateProductsHub() {
	const bc = breadcrumb([
		{ name: "Home", url: "/" },
		{ name: "Products" },
	]);
	const systemSections = (rawProducts.systems || [])
		.map((system) => {
			const products = rawProducts.products.filter(
				(product) => product.system === system.id,
			);
			return `<section class="product-system-section" id="system-${escHtml(system.id)}"><div class="ui-section-head mb-8"><div class="ui-kicker mb-3">${glyph("layers", "icon icon-sm")} ${products.length} product routes</div><h2 class="ui-section-title">${escHtml(system.name)}</h2><p class="ui-section-subtitle">${escHtml(system.description)}</p></div><div class="ui-library-grid">${products.map((product) => productCard(product.id, { reviewMedia: true })).filter(Boolean).join("\n")}</div></section>`;
		})
		.join("\n");
	const systemChips = (rawProducts.systems || [])
		.map((system) => {
			const count = rawProducts.products.filter((product) => product.system === system.id).length;
			return `<a class="ui-chip" href="#system-${escHtml(system.id)}">${glyph("layers", "icon icon-sm")} ${escHtml(system.name)} · ${count}</a>`;
		})
		.join("");
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			"@id": `${SITE}/products/#webpage`,
			url: `${SITE}/products/`,
			name: "17 Technical Product Routes | Moldart",
			description:
				"Seventeen product routes grouped into wood-panel lamination, decorative stainless steel, and electronics press systems.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Moldart product sheets",
			itemListElement: rawProducts.products.map((product, index) => {
				const meta = getMeta(product.id);
				return {
					"@type": "ListItem",
					position: index + 1,
					name: product.name,
					url: `${SITE}/products/${meta?.slug || product.id}/`,
				};
			}),
		},
	];

	return (
		headTag({
			title: "17 Product Routes | Wood, Steel & Electronics | Moldart",
			desc: "Browse 17 technical product routes across wood-panel lamination, decorative stainless steel, and electronics press systems.",
			canonical: "/products/",
			ogImageAlt: "Moldart product sheet overview",
			schemas,
			prefetch: ["/solutions/", "/resources/", "/contact/"],
		}) +
		"\n" +
		nav("products") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("layers", "icon icon-sm")} Product sheets</div>
                    <h1 class="ui-page-title">17 PRODUCT ROUTES.<br>THREE TECHNICAL SYSTEMS.</h1>
                    <p class="ui-page-lede">Choose the actual product family before comparing quotations. Each page states scope, exclusions, RFQ inputs, evidence, sample controls, QC and packing.</p>
                    <p class="buyer-media-note"><strong>Visual guide:</strong> Images identify the product family. Final grade, construction, finish, dimensions, evidence and availability are confirmed against your RFQ.</p>
                    <div class="ui-chip-row mt-6">${systemChips}</div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-metric-grid">
                        ${renderMetricCard({ icon: "layers", label: "Product sheets", value: rawProducts.products.length, note: "Individual product pages with RFQ context and related routes." })}
                        ${renderMetricCard({ icon: "route", label: "Solution routes", value: applications.length, note: "Application-first paths remain available when the requirement is still open." })}
                        ${renderMetricCard({ icon: "book", label: "Decision sheets", value: rawInsights.articles.length, note: "Published guides linked through the Technical Library." })}
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 product-systems-list">
            ${systemSections}
        </section>

        ${ctaBlock("NEED PRODUCT<br>CONFIRMATION?", "Share the application, target finish, quantity, destination, and documents needed. Moldart can point the enquiry to the right sheet before quoting.", "Share requirement", "/contact/", "Compare solution routes", "/solutions/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateProductPage(productId) {
	const p = getProduct(productId);
	const m = getMeta(productId);
	if (!p || !m) {
		console.error(`Missing data for ${productId}`);
		return;
	}
	const approvedImage = approvedProductImage(p);
	const reviewMedia = approvedImage ? null : reviewProductMedia(p);
	const image = approvedImage || reviewMedia?.image || "";
	const isReviewMedia = Boolean(image && !approvedImage && reviewMedia);
	const productRoute = `/products/${m.slug}/`;
	const openLicenseReferenceSection = renderOpenLicenseReferences(productRoute);
	const rawPageTitle = String(p.seoShortTitle || m.seoTitle || p.name)
		.replace(/\s*\|\s*Moldart\s*$/i, "")
		.trim();
	const pageTitleBase =
		`${rawPageTitle} | Moldart`.length <= 68
			? rawPageTitle
			: rawPageTitle.replace(/\s*\|\s*Technical RFQ\s*$/i, "");
	const pageTitle = compactSeoTitle(pageTitleBase, " | Moldart", 68);
	const metaDescription = safeProductMetaDesc(p);

	const bc = breadcrumb([
		{ name: "Home", url: "/" },
		{ name: "Products", url: "/products/" },
		{ name: p.name },
	]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": `${SITE}/products/${m.slug}/#webpage`,
			url: `${SITE}/products/${m.slug}/`,
			name: pageTitle,
			description: metaDescription,
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
		{
			"@context": "https://schema.org",
			"@type": "Product",
			name: p.name,
			description: p.summary,
			...(image ? { image: SITE + image } : {}),
			category: `${p.stage} / ${p.use}`,
		},
	];

	const claimStatus =
		"Programme-specific — confirm source, test method, conditions, product/lot scope, revision, and contractual status before approval.";
	const specTableRows = [
		...p.specs.map((spec, index) => {
			const row = specToRow(spec, index);
			return `<tr><td>${escHtml(row.label)}</td><td>${escHtml(row.value)}</td><td>${escHtml(claimStatus)}</td></tr>`;
		}),
		`<tr><td>Material grades</td><td>${escHtml((p.technical?.grades || []).join(", ") || p.material)}</td><td>${escHtml(claimStatus)}</td></tr>`,
		`<tr><td>Reference standard</td><td>${escHtml(standardsText(p.technical))}</td><td>${escHtml(claimStatus)}</td></tr>`,
		`<tr><td>Supply route</td><td>${escHtml(p.technical?.origin || "Programme-dependent")}</td><td>Commercial route confirmed per enquiry.</td></tr>`,
		`<tr><td>Commercial schedule</td><td>${escHtml(p.technical?.leadTime || "On request")}</td><td>Confirmed only after RFQ review.</td></tr>`,
	].join("");

	const productDecisionRows = [
		["Good fit", p.applications.slice(0, 2).join(" / ") || p.use, "Confirm grade, finish, size, and route before price comparison."],
		["Needs proof", "Sample, drawing, finish reference, or document requirement", "Use when shade, tolerance, certificate, or packing can affect acceptance."],
		["Wrong fit", "Unknown application, unclear MOQ, or unsupported timing", "Send the brief first instead of assuming this product sheet is enough."],
	]
		.map(
			(row) =>
				`<tr><td>${escHtml(row[0])}</td><td>${escHtml(row[1])}</td><td>${escHtml(row[2])}</td></tr>`,
		)
		.join("");
	const relatedSolutions = m.relatedApps
		.map((slug) => applications.find((item) => item.slug === slug))
		.filter(Boolean);
	const relatedSolutionPills = relatedSolutions
		.map(
			(app) =>
				`<a href="${getSolutionHref(app.slug)}" class="ui-link-pill">${escHtml(app.name)}</a>`,
		)
		.join("");
	const relatedSolutionCards = relatedSolutions
		.map((app) => renderProductSolutionCard(productId, app.slug))
		.join("");
	const referenceCards = m.downloads
		.slice(0, 3)
		.map((download) =>
			renderResourceDocumentCard(download, {
				compact: true,
				showGroup: false,
				showNote: true,
			}),
		)
		.join("");
	const productVideoSection = renderRelatedYoutubeVideos(videosForProduct(productId), {
		title: `${p.name} video references`,
		intro:
			"Use a video only when it explains this exact product decision. Final acceptance still depends on the approved sample, evidence and purchase specification.",
	});
	const rfqHref = withQuery("/contact/", {
		intent: "buyer-rfq",
		product: p.name,
	});
	const statusClass = p.publicStatus === "In stock" ? " is-stocked" : "";
	const reviewCaption = reviewMedia?.caption || p.mediaCaption || "Representative review reference; confirm the exact product through the RFQ.";
	const rasterSource = image.endsWith(".webp")
		? `<source srcset="${image.replace(".webp", ".avif")}" type="image/avif">`
		: "";
	const heroMedia = image
		? `<figure class="product-media-figure"${isReviewMedia ? ' data-media-state="noindex-review-reference"' : ""}><picture>${rasterSource}<img src="${image}" alt="${escHtml(`${p.name} ${isReviewMedia ? "review reference" : "product reference"}`)}" width="900" height="700" loading="eager" class="w-full h-full object-cover"></picture><figcaption>${isReviewMedia ? `<strong>${escHtml(reviewMediaStatusLabel(reviewMedia.status))}</strong> ` : ""}${escHtml(reviewCaption)}</figcaption></figure>`
		: `<div class="product-media-placeholder product-media-placeholder-large" data-media-state="text-first-product-page" role="img" aria-label="${escHtml(`${p.name}: specification overview`)}">${glyph("layers", "icon")}<strong>SPECIFY THIS PRODUCT</strong><span>Use the application, grade or construction, dimensions, quantity and destination to confirm the exact route.</span></div>`;
	const listCard = (label, title, items, icon = "check") => `<article class="ui-library-card product-control-card"><div class="ui-kicker mb-3">${glyph(icon, "icon icon-sm")} ${escHtml(label)}</div><h3>${escHtml(title)}</h3><ul class="ui-stack-list mt-5">${(items || []).map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article>`;
	const controlCards = [
		listCard("Evidence", "Evidence and test methods", p.evidence, "file"),
		listCard("Approval", "Sample and trial route", p.approval, "route"),
		listCard("QC", "Receiving and hold criteria", p.qc, "shield"),
		listCard("Packing", "Storage, handling and packing", p.packing, "layers"),
	].join("");

	return (
		headTag({
			title: pageTitle,
			desc: metaDescription,
			canonical: `/products/${m.slug}/`,
			ogImage: siteSocialPosterRelativePath(productSocialPosterName(productId)),
			ogImageAlt: `${p.name} — Moldart product sheet`,
			schemas,
			preloadImages: image ? [image] : [],
		}) +
		"\n" +
		nav("products") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            ${renderContextualReturn(relatedSolutions)}
            <div class="ui-product-hero">
                <div class="ui-product-media overflow-hidden">${heroMedia}</div>
                <div class="ui-product-side">
                    <div class="ui-page-hero-copy">
                        <div class="ui-kicker mb-4">${glyph("layers", "icon icon-sm")} ${escHtml(p.stage)} · ${escHtml(p.use)}</div>
                        <div class="product-public-status${statusClass}">${escHtml(p.publicStatus || "Current RFQ Route")}</div>
                        <h1 class="ui-section-title">${escHtml(p.name)}.</h1>
                        <p class="ui-section-subtitle">${escHtml(p.summary)}</p>
                        <p class="ui-claim-notice">Public technical references are for initial route selection only. Confirm every final value, unit, test method, condition, product/lot scope, source, revision, and contractual status in the approved TDS, sample record, test evidence, and purchase specification.</p>
                        <div class="ui-chip-row mt-8">
                            ${p.applications
															.slice(0, 3)
															.map(
																(application) =>
																	`<span class="ui-chip">${glyph("check", "icon icon-sm")} ${escHtml(application)}</span>`,
															)
															.join("")}
                        </div>
                    </div>
                    <div class="ui-fact-grid">
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Where it fits</div>
                            <div class="ui-data-value">${escHtml(p.applications[0] || "Project-specific")}</div>
                            <p class="ui-data-note">${escHtml(p.applications.slice(1, 3).join(" • ") || "Fit is confirmed against the final application.")}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">What it does</div>
                            <div class="ui-data-value">${escHtml((m.workflow || "").split(". ")[0] || "Supports the process")}</div>
                            <p class="ui-data-note">${escHtml(m.workflow)}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Key checks</div>
                            <div class="ui-data-value">${escHtml(specToRow(p.specs[0] || "Confirmed per enquiry").value || "Confirmed per enquiry")}</div>
                            <p class="ui-data-note">${escHtml(p.specs.slice(1, 3).join(" • "))}</p>
                        </article>
                        <article class="ui-fact-card">
                            <div class="ui-data-label">Commercial status</div>
                            <div class="ui-data-value">${escHtml(p.publicStatus || "Current RFQ Route")}</div>
                            <p class="ui-data-note">${escHtml(p.stockNote || p.commercialNotes || p.customization)}</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        ${openLicenseReferenceSection}

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} Scope and boundary</div>
                <h2 class="ui-section-title">USE THE RIGHT PRODUCT ROUTE.</h2>
            </div>
            <div class="ui-library-grid product-scope-grid">
                ${listCard("Public scope", "What this page covers", [p.scope, ...(p.options || [])], "check")}
                ${listCard("Use this route", "When it fits", [p.useWhen], "route")}
                ${listCard("Not covered", "Do not assume", p.exclusions, "shield")}
            </div>
        </section>

        ${renderProductRfqControlSection(p)}

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("check", "icon icon-sm")} Fit matrix</div>
                <h2 class="ui-section-title">CONFIRM FIT BEFORE PRICE.</h2>
                <p class="ui-section-subtitle">This product sheet is a starting point. Use the matrix to decide when to proceed, when to ask for proof, and when to send the broader brief first.</p>
            </div>
            <div class="decision-matrix-wrap"><table class="decision-matrix"><thead><tr><th>Decision</th><th>Signal</th><th>Next action</th></tr></thead><tbody>${productDecisionRows}</tbody></table></div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-spotlight">
                <div class="ui-table-card">
                    <div class="ui-kicker mb-4">${glyph("file", "icon icon-sm")} Technical reference</div>
                    <table class="ui-table">
                        <thead><tr><th>Reference</th><th>Details</th><th>Status before approval</th></tr></thead>
                        <tbody>${specTableRows}</tbody>
                    </table>
                </div>
                <div class="ui-stack-card">
                    <div class="ui-kicker mb-4">${glyph("book", "icon icon-sm")} Reference pack</div>
                    <p class="text-sm text-zinc-500 leading-relaxed">Use the related documents as the first filter, then confirm the final specification against the real programme.</p>
                    <div class="resource-library-list resource-library-list-compact mt-6">${referenceCards || '<p class="text-sm text-zinc-500 leading-relaxed">No public product document is attached yet. Request the applicable TDS, test or inspection pack in the RFQ.</p>'}</div>
                    ${relatedSolutionPills ? `<div class="mt-8"><div class="ui-data-label mb-3">Used in systems</div><div class="ui-related-row">${relatedSolutionPills}</div></div>` : ""}
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} Evidence and release controls</div>
                <h2 class="ui-section-title">APPROVE BEFORE SCALE-UP.</h2>
                <p class="ui-section-subtitle">The RFQ, sample, test method, receiving check and packing basis must describe the same product construction.</p>
            </div>
            <div class="ui-library-grid product-control-grid">${controlCards}</div>
        </section>

        ${productVideoSection ? `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">${productVideoSection}</section>` : ""}

        ${relatedSolutionCards ? `<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} System fit</div><h2 class="ui-section-title">SEE WHERE THIS PRODUCT FITS.</h2><p class="ui-section-subtitle">Use the solution views below when the requirement is still being narrowed at the system level and the product sheet alone is not enough.</p></div><div class="ui-library-grid">${relatedSolutionCards}</div></section>` : ""}

        ${ctaBlock(`START A ${escHtml(p.name.toUpperCase())}<br>RFQ.`, "Send the application, construction, dimensions, quantity, timing, destination and required evidence.", "Start technical RFQ", rfqHref, "Review Evidence & QC", "/evidence-qc/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateApplicationsHub() {
	return generatePageRedirect(
		"/solutions/",
		"Redirecting to Solutions — Moldart",
		"Explore solutions",
	);
}

function generateSolutionPage(app) {
	const bc = breadcrumb([
		{ name: "Home", url: "/" },
		{ name: "Solutions", url: "/solutions/" },
		{ name: app.name },
	]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": `${SITE}${getSolutionHref(app.slug)}#webpage`,
			url: `${SITE}${getSolutionHref(app.slug)}`,
			name: `${app.name} Solution — Moldart`,
			description: app.metaDesc,
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const flowItems = solutionFlowFor(app.slug)
		.map(
			(item, index) =>
				`<div class="ui-flow-pill"><div class="ui-flow-step">${String(index + 1).padStart(2, "0")}</div><div class="ui-flow-title">${escHtml(item.title)}</div><p class="ui-flow-copy">${escHtml(item.detail)}</p></div>`,
		)
		.join("");
	const solutionDecisionRows = [
		["Use this route", app.name, "The requirement matches the application and needs a grouped product stack."],
		["Open product sheet", "Specific item, size, finish, or grade is known", "Move from route-level fit to item-level confirmation."],
		["Send RFQ first", "Application, quantity, destination, or timing is unclear", "Let the team shortlist product and sourcing route together."],
	]
		.map(
			(row) =>
				`<tr><td>${escHtml(row[0])}</td><td>${escHtml(row[1])}</td><td>${escHtml(row[2])}</td></tr>`,
		)
		.join("");
	const stackCards = app.products
		.map((productId) => renderSolutionProductCard(app, productId))
		.join("");
	const guideCards = relatedInsightsForSolution(app, 3)
		.map(
			(article) =>
				`<div class="ui-list-row"><div class="ui-list-copy"><div class="ui-list-title">${escHtml(article.title)}</div><div class="ui-list-meta">${escHtml(article.categoryLabel)} · ${escHtml(article.type)}</div></div><a href="/insights/${article.slug}/" class="ui-list-link" aria-label="Open guide: ${escHtml(article.title)}">${glyph("arrow", "icon icon-sm")}<span class="sr-only">Open guide: ${escHtml(article.title)}</span></a></div>`,
		)
		.join("");
	const referenceCards = app.downloads
		.slice(0, 3)
		.map((download) =>
			renderResourceDocumentCard(download, {
				compact: true,
				showGroup: false,
				showNote: true,
			}),
		)
		.join("");
	const audience = solutionAudienceFor(app.slug)
		.map((item) => `<span>${escHtml(item)}</span>`)
		.join("");
	const visual = getApplicationVisual(app.slug);
	const heroSummaryHtml = renderSolutionHeroSummary(app);

	return (
		headTag({
			title: `${app.name} Solution | Moldart`,
			desc: app.metaDesc,
			canonical: getSolutionHref(app.slug),
			ogImage: siteSocialPosterRelativePath(solutionSocialPosterName(app.slug)),
			ogImageAlt: `${app.name} route preview`,
			schemas,
		}) +
		"\n" +
		nav("solutions") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph(applicationIconName(app.slug), "icon icon-sm")} ${escHtml(visual.eyebrow)}</div>
                    <h1 class="ui-section-title">${escHtml(app.name)}.</h1>
                    <p class="ui-section-subtitle">${escHtml(app.overview)}</p>
                    <div class="ui-app-badges mt-8">${audience}</div>
                    <div class="flex gap-4 flex-wrap mt-8">
                        <a href="/contact/" class="btn-primary btn-lg">Share your requirement →</a>
                    </div>
                </div>
                <div class="ui-page-hero-panel solution-hero-summary-panel">
                    ${heroSummaryHtml}
                </div>
            </div>
        </section>

        ${renderSolutionStoryBand(app)}

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} Route matrix</div>
                <h2 class="ui-section-title">CHOOSE THE RIGHT LEVEL OF DETAIL.</h2>
                <p class="ui-section-subtitle">Use the route first when the application is known. Open product sheets only when the narrower item-level decision is ready.</p>
            </div>
            <div class="decision-matrix-wrap"><table class="decision-matrix"><thead><tr><th>Decision</th><th>Signal</th><th>Next action</th></tr></thead><tbody>${solutionDecisionRows}</tbody></table></div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("layers", "icon icon-sm")} Product sheets in this route</div>
                <h2 class="ui-section-title">OPEN THE RIGHT PRODUCT SHEET ONLY WHEN NEEDED.</h2>
                <p class="ui-section-subtitle">The route comes first. Open the narrower sheet only when item-level specification is actually needed.</p>
            </div>
            <div class="ui-stack-product-grid">${stackCards}</div>
        </section>

        ${renderOpenLicenseReferences(getSolutionHref(app.slug))}

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-stack-card ui-stack-card-wide">
                <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Route decision points</div>
                <p class="ui-data-note mb-6">Use these checks to decide whether the route is right before opening more files or comparing quotations.</p>
                <div class="ui-flow-band">${flowItems}</div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="ui-library-grid">
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph("spark", "icon icon-sm")} Technical guides</div>
                    <div class="ui-list-compact">${guideCards || '<p class="text-sm text-zinc-500 leading-relaxed">Related guides are shown when they help the next decision.</p>'}</div>
                </article>
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph("book", "icon icon-sm")} Reference files</div>
                    <div class="resource-library-list resource-library-list-compact">${referenceCards}</div>
                </article>
            </div>
        </section>

    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateApplicationPage(app) {
	return generatePageRedirect(
		getSolutionHref(app.slug),
		`Redirecting to ${app.name} — Moldart`,
		`Open ${app.name}`,
	);
}

function generateEvidencePage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Evidence & QC" }]);
	const evidenceStates = [
		{ number: "01", icon: "file", title: "Supplier declaration", status: "Screening evidence", copy: "A scoped statement from the proposed source. Useful for screening; not independent test proof." },
		{ number: "02", icon: "shield", title: "Third-party report", status: "Method + sample scope", copy: "A report tied to the product, method, sample or lot, laboratory and valid revision." },
		{ number: "03", icon: "check", title: "Buyer-approved sample", status: "Physical acceptance", copy: "The physical or documented reference used to judge colour, texture, fit or function." },
		{ number: "04", icon: "search", title: "Inspection record", status: "Order-specific", copy: "An inspection record only when Moldart has actually performed or commissioned the agreed check." },
		{ number: "05", icon: "book", title: "Purchase specification", status: "Contractual basis", copy: "The agreed grade, construction, dimensions, tolerances, evidence and acceptance basis." },
	];
	const sampleStages = [
		["01", "Buyer master", "Record the source, condition and revision of the buyer's reference."],
		["02", "Counter-sample", "Compare the proposed construction, colour, finish or fit against the master."],
		["03", "Production sample", "Confirm the actual production route before quantity release where required."],
		["04", "Retained reference", "Keep the accepted sample, drawing and revision for receiving and reorder checks."],
	];
	const documentRows = [
		["TDS", "Product construction, declared properties and conditions", "Required when technical values or process fit affect approval"],
		["COA", "Order or lot results against stated checks", "Conditional; only where the product and supplier issue one"],
		["MTC", "Material and heat or batch identity", "Applicable mainly to metal and tooling routes"],
		["Test report", "Result, method, sample scope and laboratory", "Required only for the claim or acceptance point it supports"],
		["Inspection report", "Order-specific dimensions, condition, packing or witnessed checks", "Conditional to the agreed inspection plan"],
		["Packing list", "Package count, weight, dimensions and marks", "Required for dispatch and receiving reconciliation"],
	].map((row) => `<tr>${row.map((cell) => `<td>${escHtml(cell)}</td>`).join("")}</tr>`).join("");
	const qcCards = [
		["Pre-production", ["Confirm approved specification and drawing", "Check sample and document revisions", "Record hold points and inspection responsibility"]],
		["In process", ["Check the agreed product and process characteristics", "Record deviations without inventing pass values", "Stop or escalate when the approved basis is missing"]],
		["Pre-dispatch", ["Reconcile identity, quantity, condition and documents", "Inspect protection, labels and packing", "Release only against the agreed acceptance record"]],
		["Receiving", ["Check damage, identity and package count before use", "Compare sample, lot and documents", "Quarantine disputed material and preserve evidence"]],
	].map(([title, items]) => `<article class="ui-library-card"><div class="ui-kicker mb-3">${glyph("shield", "icon icon-sm")} QC stage</div><h3>${escHtml(title)}</h3><ul class="ui-stack-list mt-5">${items.map((item) => `<li>${escHtml(item)}</li>`).join("")}</ul></article>`).join("");
	const schemas = [{
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${SITE}/evidence-qc/#webpage`,
		url: `${SITE}/evidence-qc/`,
		name: "Evidence & QC | Moldart",
		description: "How Moldart scopes product evidence, samples, inspection, packing and receiving controls without exposing private suppliers.",
		isPartOf: { "@id": SITE + "/#website" },
		inLanguage: "en-IN",
	}, bc.schema];
	return headTag({
		title: "Evidence & QC | Samples, Documents & Receiving | Moldart",
		desc: "Understand Moldart evidence states, sample control, document applicability, inspection stages, packing and receiving controls.",
		canonical: "/evidence-qc/",
		ogImage: siteSocialPosterRelativePath("moldart-evidence"),
		ogImageAlt: "Moldart Evidence and QC control overview",
		schemas,
	}) + "\n" + nav("evidence") + `
	<main id="main-content" class="pt-16">
		<section class="max-w mx-auto px py-20 border-b border-zinc-100">
			${bc.html}
			<div class="ui-page-hero"><div class="ui-page-hero-copy"><div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} Evidence & QC</div><h1 class="ui-page-title">PROVE THE RIGHT THING.<br>AT THE RIGHT STAGE.</h1><p class="ui-page-lede">A certificate name alone is not enough. Evidence must match the product construction, test method, sample or lot, revision and purchase specification.</p></div><div class="ui-page-hero-panel"><div class="ui-proof-grid"><article class="ui-proof-card"><div class="ui-proof-label">Evidence</div><div class="ui-proof-value">Scoped</div><p class="ui-proof-copy">Match each claim to the applicable product and method.</p></article><article class="ui-proof-card"><div class="ui-proof-label">Samples</div><div class="ui-proof-value">Retained</div><p class="ui-proof-copy">Keep the accepted master, counter-sample and revision.</p></article><article class="ui-proof-card"><div class="ui-proof-label">QC</div><div class="ui-proof-value">Order-specific</div><p class="ui-proof-copy">Define inspection and hold points before dispatch.</p></article></div></div></div>
		</section>
		<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("file", "icon icon-sm")} Evidence states</div><h2 class="ui-section-title">KNOW WHAT EACH RECORD PROVES.</h2><p class="ui-section-subtitle">Five evidence types, each with a different level of independence and acceptance value.</p></div><div class="ui-library-grid evidence-state-grid">${evidenceStates.map((item) => `<article class="ui-library-card evidence-state-card"><div class="evidence-state-head"><span class="evidence-state-icon">${glyph(item.icon, "icon")}</span><span class="evidence-state-number">${escHtml(item.number)}</span></div><div class="ui-meta-pill">${escHtml(item.status)}</div><h3>${escHtml(item.title)}</h3><p>${escHtml(item.copy)}</p></article>`).join("")}</div></section>
		<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Sample control</div><h2 class="ui-section-title">MASTER. COUNTER-SAMPLE. PRODUCTION. RETAIN.</h2></div><div class="process-stage-grid-minimal">${sampleStages.map(([number, title, detail]) => `<article class="process-stage-card-minimal"><div class="process-note-step">${number}</div><h3>${escHtml(title)}</h3><p>${escHtml(detail)}</p></article>`).join("")}</div></section>
		<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("book", "icon icon-sm")} Document applicability</div><h2 class="ui-section-title">REQUIRED DOES NOT MEAN UNIVERSAL.</h2><p class="ui-section-subtitle">Ask for the document that proves the actual acceptance point. Do not request or publish every certificate for every product.</p></div><div class="decision-matrix-wrap"><table class="decision-matrix"><thead><tr><th>Document</th><th>What it can show</th><th>When it applies</th></tr></thead><tbody>${documentRows}</tbody></table></div></section>
		<section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up"><div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} QC sequence</div><h2 class="ui-section-title">CHECK BEFORE, DURING, DISPATCH AND RECEIPT.</h2></div><div class="ui-library-grid">${qcCards}</div></section>
		<section class="max-w mx-auto px py-16 fade-up"><div class="ui-cta-band"><div class="ui-cta-copy"><div class="ui-kicker mb-3">Confidentiality</div><h2>Private evidence stays private.</h2><p>Supplier and buyer identities, drawings, prices, bank data and private qualification records are segregated from the public website.</p></div><div class="ui-cta-actions"><a href="/contact/?intent=buyer-rfq" class="btn-primary btn-lg">Request evidence checklist →</a><a href="/process/" class="btn-outline btn-lg">Review Process</a></div></div></section>
	</main>${footer()}${closingElements()}`;
}

function generateResourcesPage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Resources" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/resources/#webpage",
			url: SITE + "/resources/",
			name: "Resources & Downloads — Moldart",
			description:
				"Download product catalogues, material references, and finish decks from Moldart.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const groupsHtml = resourceGroups
		.map((group) => {
			const requestCount = group.items.filter(isRequestOnlyResource).length;
			return `
      <article id="${slugify(group.title)}" class="ui-resource-card fade-up">
          <div class="ui-resource-head">
              <div>
                  <div class="ui-kicker mb-3">${glyph("file", "icon icon-sm")} ${escHtml(group.title)}</div>
                  <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(group.items[0]?.desc || "Reference documents.")}</p>
              </div>
              <div class="ui-resource-head-meta">
                  <span class="ui-resource-count">${group.items.length}</span>
                  <span class="ui-resource-status${requestCount ? " is-request" : ""}">${requestCount ? `${requestCount} request-only` : "All downloadable"}</span>
              </div>
          </div>
          <div class="resource-library-list mt-6">
              ${group.items.map((item) => renderResourceDocumentCard({ ...item, group: group.title }, { compact: false, showGroup: false, showNote: true })).join("")}
          </div>
      </article>`;
		})
		.join("\n");

	return (
		headTag({
			title: "Resources & Downloads | Product Catalogues — Moldart",
			desc: "Download product catalogues, material references, and finish decks for lamination tooling, panels, flooring, furniture, and decorative stainless steel.",
			canonical: "/resources/",
			ogImage: siteSocialPosterRelativePath("moldart-resources"),
			ogImageAlt: "Moldart resources library",
			schemas,
		}) +
		"\n" +
		nav("resources") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("book", "icon icon-sm")} Reference library</div>
                    <h1 class="ui-section-title">RESOURCES.</h1>
                    <p class="ui-section-subtitle">Browse the full reference library in one place. Each group stays organized by route so the right file is easier to spot before download.</p>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-metric-grid">
                        ${renderMetricCard({ icon: "file", label: "Documents", value: getTotalResourceItems(), note: "Every reference currently available in the public library." })}
                        ${renderMetricCard({ icon: "arrow", label: "Downloadable PDFs", value: getTotalResourceItems(), note: "All listed files now open as downloadable documents." })}
                        ${renderMetricCard({ icon: "layers", label: "Sections", value: resourceGroups.length, note: "Grouped by buying route instead of by file name alone." })}
                        ${renderMetricCard({ icon: "clock", label: "Unlock once", value: "1 form", note: "Share details once and this browser keeps the full library unlocked." })}
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
        ${ctaBlock("NEED A SPECIFIC<br>DATA SHEET?", "If the exact document is not listed here, send the product, application, or finish route and the team can route the right file directly.", "Request a Document", "/contact/?focus=document-request")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateFAQPage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "FAQ" }]);
	const allFaqItems = rawFaq.categories.flatMap((category) => category.items);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: allFaqItems.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: { "@type": "Answer", text: item.answer },
			})),
		},
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/faq/#webpage",
			url: SITE + "/faq/",
			name: "FAQ — Moldart",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const faqMeta = {
		"Company & Reach": {
			icon: "building",
			intro:
				"Location, company background, sourcing geography, and how Moldart supports domestic and export programmes.",
		},
		"Product Fit & Customisation": {
			icon: "layers",
			intro:
				"How to approach product selection when multiple categories, finishes, or custom routes could fit the requirement.",
		},
		"Samples, Approvals & Documents": {
			icon: "book",
			intro:
				"Catalogues, finish decks, samples, approvals, and why some specifications stay requirement-led instead of fixed across every programme.",
		},
		"Orders, Timing & Logistics": {
			icon: "route",
			intro:
				"How lead time, MOQ, route planning, and dispatch expectations are handled once the requirement becomes specific.",
		},
		"Enquiries & Next Steps": {
			icon: "message",
			intro:
				"What to include in the first enquiry, which contact route to use, and what usually happens after the brief is shared.",
		},
	};

	const quickStarts = [
		{
			href: "/contact/",
			title: "Need a fast first response?",
			detail:
				"Use the enquiry form for a structured brief, or WhatsApp when the first step is simply getting routed correctly.",
			meta: "Contact",
			icon: "message",
		},
		{
			href: "/solutions/",
			title: "Comparing more than one route?",
			detail:
				"Open Solutions first when the requirement could move across multiple products or finish systems.",
			meta: "Solutions",
			icon: "compass",
		},
		{
			href: "/resources/",
			title: "Need documents before deciding?",
			detail:
				"Open the reference library for catalogues, finish decks, and shortlist material before the commercial discussion.",
			meta: "Resources",
			icon: "book",
		},
		{
			href: "/insights/",
			title: "Need practical technical context?",
			detail:
				"Use the guide library when the decision depends on approval logic, finish behaviour, or product fit.",
			meta: "Insights",
			icon: "spark",
		},
	];

	const jumpLinks = rawFaq.categories
		.map((category) => {
			const meta = faqMeta[category.name] || { icon: "book" };
			return `<a href="#${slugify(category.name)}" class="ui-faq-jump-link">${glyph(meta.icon, "icon icon-sm")} <span>${escHtml(category.name)}</span><strong>${category.items.length}</strong></a>`;
		})
		.join("");

	const faqHtml = rawFaq.categories
		.map((category) => {
			const meta = faqMeta[category.name] || {
				icon: "book",
				intro: "Frequently asked questions.",
			};
			return `
      <article class="ui-faq-card" id="${slugify(category.name)}">
          <div class="ui-faq-head">
              <div>
                  <div class="ui-kicker mb-3">${glyph(meta.icon, "icon icon-sm")} ${escHtml(category.name)}</div>
                  <p class="text-sm text-zinc-500 leading-relaxed">${escHtml(meta.intro)}</p>
              </div>
              <span class="ui-resource-count">${category.items.length}</span>
          </div>
          <div class="ui-faq-list mt-6">
              ${category.items
								.map(
									(item) => `
                <details class="ui-faq-item">
                    <summary>
                        <span>${escHtml(item.question)}</span>
                        ${glyph("arrow", "icon icon-sm")}
                    </summary>
                    <p>${escHtml(item.answer)}</p>
                </details>`,
								)
								.join("")}
          </div>
      </article>`;
		})
		.join("");

	return (
		headTag({
			title: "Sourcing & RFQ FAQ | Moldart",
			desc: "Buyer-facing answers on Moldart product groups, documents, enquiries, order planning, and next-step review.",
			canonical: "/faq/",
			ogImage: siteSocialPosterRelativePath("moldart-faq"),
			ogImageAlt: "Moldart FAQ preview",
			schemas,
		}) +
		"\n" +
		nav("faq") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("book", "icon icon-sm")} FAQ</div>
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
            <div class="ui-action-grid">${quickStarts.map((card) => renderActionCard(card)).join("")}</div>
        </section>

        <section class="max-w mx-auto px py-16 border-t border-zinc-100 fade-up">
            <div class="ui-resource-group">${faqHtml}</div>
        </section>
        ${ctaBlock("HAVE A SPECIFIC<br>QUESTION?", "If the answer depends on the exact requirement, move from FAQ to a direct review with the team.", "Share your requirement", "/contact/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateContactPage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Contact" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/contact/#webpage",
			url: SITE + "/contact/",
			name: "Start a Technical RFQ | Moldart",
			description:
				"Start a buyer RFQ, supplier capability introduction or general contact with structured technical and commercial context.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
		{
			"@context": "https://schema.org",
			"@type": "ContactPage",
			mainEntity: {
				"@type": ["Organization", "LocalBusiness"],
				name: "Moldart",
				url: SITE + "/",
				contactPoint: {
					"@type": "ContactPoint",
					telephone: "+917208088788",
					contactType: "sales",
					email: "info@moldartindia.com",
				},
			},
		},
	];

	const productOptions = rawProducts.products
		.map(
			(p) => `<option value="${escHtml(p.name)}">${escHtml(p.name)}</option>`,
		)
		.join("\n                                ");

	return (
		headTag({
			title:
				"Start a Technical RFQ | Buyer, Supplier or General Contact | Moldart",
			desc: "Submit a structured buyer RFQ, supplier capability introduction or general enquiry to Moldart's Mumbai technical desk.",
			canonical: "/contact/",
			ogImage: siteSocialPosterRelativePath("moldart-contact"),
			ogImageAlt: "Moldart contact preview",
			schemas,
		}) +
		"\n" +
		nav("contact") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("message", "icon icon-sm")} Contact Moldart</div>
                    <h1 class="ui-section-title">START WITH A BRIEF<br>THAT CAN BE REVIEWED.</h1>
                    <p class="ui-section-subtitle">Choose Buyer RFQ, Supplier Capability Introduction or General Contact. The public form records the first brief; confidential drawings, prices and private evidence stay outside it.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph("whatsapp-brand", "icon icon-sm")} WhatsApp</span>
                        <span class="ui-chip">${glyph("mail", "icon icon-sm")} Email</span>
                        <span class="ui-chip">${glyph("calendar", "icon icon-sm")} Meetings</span>
                        <span class="ui-chip">${glyph("linkedin-brand", "icon icon-sm")} LinkedIn</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">RFQ</div><div class="ui-proof-value">Product + quantity</div><p class="ui-proof-copy">Application, finish, timing, destination, and documents needed.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Sourcing</div><div class="ui-proof-value">India + China</div><p class="ui-proof-copy">Supplier capability and route fit are reviewed before next steps.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Execution</div><div class="ui-proof-value">Payment + logistics</div><p class="ui-proof-copy">Milestones and documents are controlled in the private portal after approval.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-12 border-b border-zinc-100 fade-up" aria-labelledby="contact-route-heading">
            <div class="ui-section-head mb-8"><div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Choose the contact route</div><h2 id="contact-route-heading" class="ui-section-title">ONE FORM. THREE CLEAR INTENTS.</h2></div>
            <div class="ui-action-grid">
                ${renderActionCard({ href: "/contact/?intent=buyer-rfq", title: "Buyer RFQ", detail: "Product, application, construction, quantity, timing, destination and evidence needs.", meta: "Technical and commercial brief", icon: "message" })}
                ${renderActionCard({ href: "/contact/?intent=supplier-intro", title: "Supplier Capability Introduction", detail: "Legal identity, product scope, manufacturer or trader role, evidence, export and confidentiality context.", meta: "Separate supplier route", icon: "building" })}
                ${renderActionCard({ href: "/contact/?intent=general", title: "General Contact", detail: "Use this only when the request is not yet a buyer RFQ or supplier capability introduction.", meta: "General enquiry", icon: "mail" })}
            </div>
        </section>

        <section id="form-success-alert" class="max-w mx-auto px py-6 hidden">
            <div class="form-success-banner">
                <div class="flex items-center gap-3">
                    ${glyph("check", "icon")}
                    <strong>Inquiry submitted successfully.</strong>
                </div>
                <p class="mt-2 text-sm">Thank you for reaching out. A member of the Moldart team will review the requirement and reply directly.</p>
            </div>
        </section>

        <section id="after-rfq" class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-contact-grid">
                <div class="ui-contact-routes">
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph("whatsapp-brand")}</div><div><div class="ui-data-label">WhatsApp</div><div class="ui-data-value">Fast first contact</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Best for first contact, brief sharing, and quick commercial routing. Both WhatsApp lines stay visible so the enquiry can be routed on the faster available number.</p>
                        <div class="flex flex-col gap-2">
                            <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph("whatsapp-brand", "icon icon-sm")} ${WHATSAPP_PRIMARY.display}</a>
                            <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph("whatsapp-brand", "icon icon-sm")} ${WHATSAPP_SECONDARY.display}</a>
                        </div>
                    </article>
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph("mail")}</div><div><div class="ui-data-label">Email</div><div class="ui-data-value">Best for files</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Use email when drawings, specifications, and reference files matter from the first message.</p>
                        <a href="mailto:info@moldartindia.com" class="site-inline-link">${glyph("mail", "icon icon-sm")} info@moldartindia.com</a>
                    </article>
                    <article class="ui-contact-route">
                        <div class="ui-contact-route-head"><div class="ui-contact-route-icon">${glyph("calendar")}</div><div><div class="ui-data-label">Meetings</div><div class="ui-data-value">Scheduled review</div></div></div>
                        <p class="text-sm text-zinc-500 leading-relaxed mb-4">Book a meeting when the requirement needs a detailed technical-commercial discussion.</p>
                        <a href="https://outlook.office.com/bookwithme/user/a07f98546e1e4f7fbb0f12f091a6e3ec@moldartindia.com?anonymous&ep=plink" target="_blank" rel="noopener noreferrer" class="site-inline-link">${glyph("calendar", "icon icon-sm")} Schedule a meeting</a>
                    </article>
                    <article class="ui-office-card">
                        <div class="ui-kicker mb-4">${glyph("building", "icon icon-sm")} Head office</div>
                        <div class="font-bold text-xl mb-2">Mumbai</div>
                        <address class="ui-address mb-3">${escHtml(COMPANY_ADDRESS)}</address>
                        <div class="flex flex-col gap-2 mb-4">
                            <a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-700 font-medium">WhatsApp · ${WHATSAPP_PRIMARY.display}</a>
                            <a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="link-line text-sm text-zinc-700 font-medium">WhatsApp · ${WHATSAPP_SECONDARY.display}</a>
                            <a href="mailto:info@moldartindia.com" class="link-line text-sm text-zinc-700 font-medium">info@moldartindia.com</a>
                        </div>
                        <div class="contact-social-row">
                            <a href="${COMPANY_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="contact-social-chip">${glyph("linkedin-brand", "icon icon-sm")} Moldart company page</a>
                            <a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="contact-social-chip is-personal">${glyph("linkedin-brand", "icon icon-sm")} Yash Doshi</a>
                        </div>
                    </article>
                </div>
                <div class="ui-contact-form">
                    <div class="ui-kicker mb-6">${glyph("message", "icon icon-sm")} Share a requirement</div>
                    <div class="contact-next-steps mb-6" role="list" aria-label="What happens after submit">
                        <span role="listitem"><strong>1</strong> Route</span>
                        <span role="listitem"><strong>2</strong> Review</span>
                        <span role="listitem"><strong>3</strong> Clarify</span>
                        <span role="listitem"><strong>4</strong> Quote path</span>
                    </div>
                    <form action="/api/lead-intake" method="POST" class="flex flex-col gap-5 contact-form-compact" id="inquiry-form" data-lead-form>
                        <input type="hidden" name="lead_type" value="contact_inquiry">
                        <input type="hidden" name="source_page" value="/contact/">
                        <input type="hidden" name="next" value="/contact/?submitted=true">
                        <input type="hidden" name="consent_context" value="Contact form: user submitted details for requirement review, qualification, and Moldart follow-up.">
                        <input type="hidden" name="cf-turnstile-response" value="">
                        <input type="text" name="_honey" class="is-hidden-field" tabindex="-1" autocomplete="off" aria-label="Leave this field blank">

                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Full Name *</span><input type="text" name="name" class="form-input" required aria-required="true" autocomplete="name" placeholder="John Doe"></label>
                            <label class="form-group"><span class="form-label">Company *</span><input type="text" name="company" class="form-input" required aria-required="true" autocomplete="organization" placeholder="Company name"></label>
                        </div>
                        <div class="grid grid-2 gap-4">
                            <label class="form-group"><span class="form-label">Email Address *</span><input type="email" name="email" class="form-input" required aria-required="true" autocomplete="email" placeholder="john@example.com"></label>
                            <label class="form-group"><span class="form-label">Phone / WhatsApp *</span><input type="tel" name="phone" class="form-input" required aria-required="true" autocomplete="tel" placeholder="+91 ..."></label>
                        </div>
                        <div class="grid md-grid-3 gap-4">
                            <label class="form-group">
                                <span class="form-label">Inquiry Route *</span>
                                <select name="inquiry_route" class="form-select" required aria-required="true">
                                    <option value="Buyer RFQ">Buyer RFQ</option>
                                    <option value="Supplier Capability Introduction">Supplier capability introduction</option>
                                    <option value="Portal Access Request" hidden>Portal access request</option>
                                    <option value="General Contact">General contact</option>
                                </select>
                            </label>
                            <label class="form-group">
                                <span class="form-label">Primary Interest</span>
                                <select name="interest" class="form-select">
                                    <option value="General Inquiry">General Inquiry</option>
                                    ${productOptions}
                                </select>
                            </label>
                            <label class="form-group"><span class="form-label">Requirement Focus</span><input type="text" name="application" class="form-input" autocomplete="off" placeholder="Application, product family, or supplier category..."></label>
                        </div>
                        <details class="contact-advanced-details">
                            <summary>Add trade details: quantity, timing, destination, Incoterm, HS code, files</summary>
                            <div class="contact-advanced-body">
                                <div class="grid md-grid-3 gap-4">
                                    <label class="form-group"><span class="form-label">Quantity / MOQ Context</span><input type="text" name="quantity_context" class="form-input" autocomplete="off" placeholder="Trial, container, project, repeat, MOQ..."></label>
                                    <label class="form-group"><span class="form-label">Target Timing</span><input type="text" name="target_timing" class="form-input" autocomplete="off" placeholder="Urgent, this month, Q3..."></label>
                                    <label class="form-group"><span class="form-label">Destination / Port or City</span><input type="text" name="destination" class="form-input" autocomplete="shipping address-level2" placeholder="Country, port, city, or destination region..."></label>
                                </div>
                                <div class="grid md-grid-3 gap-4">
                                    <label class="form-group"><span class="form-label">Incoterm / Trade Term, if known</span><input type="text" name="incoterm" class="form-input" autocomplete="off" placeholder="FOB, FCA, CIF, EXW, not sure..."></label>
                                    <label class="form-group"><span class="form-label">HS / HSN Code, if known</span><input type="text" name="hs_code" class="form-input" autocomplete="off" placeholder="Optional"></label>
                                    <label class="form-group"><span class="form-label">Files or Documents Available?</span><input type="text" name="files_available" class="form-input" autocomplete="off" placeholder="Drawing, catalogue, sample photo, certificates..."></label>
                                </div>
                            </div>
                        </details>
                        <label class="form-group"><span class="form-label">Message *</span><textarea name="message" class="form-textarea" required aria-required="true" autocomplete="off" placeholder="Buyer RFQ: product/application, dimensions, finish, quantity, timing, destination, payment/logistics context, and documents needed. Supplier intro: company type, category, certifications, MOQ, capacity, export markets, Incoterms, and documents available."></textarea></label>
                        <p class="text-xs text-zinc-500">Your details are used only to review the requirement or supplier capability, qualify the next step, and respond through Moldart. Do not upload or share sensitive private transaction documents through the public form.</p>
                        <label class="form-consent"><input type="checkbox" name="privacy_accepted" value="yes" required aria-required="true"><span>I have read the <a href="/privacy/" target="_blank" rel="noopener noreferrer" aria-label="Privacy Notice (opens in a new tab)">Privacy Notice</a> and agree to Moldart using these details to review and respond to this request.</span></label>
                        <div data-turnstile-slot class="turnstile-slot" aria-hidden="true"></div>
                        <button type="submit" class="btn-primary btn-lg btn-full-centered">Submit Inquiry</button>
                        <p class="text-xs text-zinc-500">Lead time, MOQ, and final commercial timing are confirmed after the requirement is reviewed.</p>
                    </form>
                    <script>(function(){var form=document.getElementById('inquiry-form');if(!form)return;var params=new URLSearchParams(window.location.search);var intent=(params.get('intent')||'').toLowerCase();var product=(params.get('product')||'').trim();var routeMap={'buyer-rfq':'Buyer RFQ','portal-access':'Portal Access Request','supplier-intro':'Supplier Capability Introduction','general':'General Contact'};var route=routeMap[intent];if(route&&form.elements.inquiry_route){form.elements.inquiry_route.value=route;}if(product&&form.elements.interest){var option=Array.from(form.elements.interest.options).find(function(item){return item.value===product||item.textContent.trim()===product;});if(option)form.elements.interest.value=option.value;}if(intent==='supplier-intro'&&form.elements.lead_type){form.elements.lead_type.value='supplier_introduction';}if(intent==='portal-access'&&form.elements.lead_type){form.elements.lead_type.value='portal_access_request';}if(form.elements.message&&!form.elements.message.value){if(intent==='portal-access')form.elements.message.value='Portal access request: company name, user role, buyer/seller/internal relationship, and reason for access.';else if(intent==='supplier-intro')form.elements.message.value='Supplier capability introduction: legal entity, manufacturer or trader role, product scope, factory/equipment, evidence, export markets, MOQ, packing and confidentiality contact.';else if(intent==='general')form.elements.message.value='General contact: purpose of the enquiry and the best next step.';else form.elements.message.value='Buyer RFQ: '+(product?product+'; ':'')+'application, construction or grade, dimensions, quantity, timing, destination, Incoterm, sample/evidence needs and packing.';}})();</script>
                </div>
            </div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateLegalPage({ route, title, description, kicker, heading, intro, sections }) {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: title }]);
	const schema = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${SITE}${route}#webpage`,
		url: `${SITE}${route}`,
		name: `${title} | Moldart`,
		description,
		isPartOf: { "@id": SITE + "/#website" },
		inLanguage: "en-IN",
		dateModified: NOW,
	};
	const toc = sections
		.map(
			(section, index) =>
				`<a href="#${section.id}"><span>${String(index + 1).padStart(2, "0")}</span>${escHtml(section.title)}</a>`,
		)
		.join("");
	const content = sections
		.map(
			(section, index) =>
				`<section id="${section.id}" class="legal-section"><div class="legal-section-index">${String(index + 1).padStart(2, "0")}</div><div><h2>${escHtml(section.title)}</h2>${section.html}</div></section>`,
		)
		.join("");

	return (
		headTag({
			title: `${title} | Moldart`,
			desc: description,
			canonical: route,
			schemas: [schema, bc.schema],
		}) +
		"\n" +
		nav("legal") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100 legal-hero">
            ${bc.html}
            <div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} ${escHtml(kicker)}</div>
            <h1 class="ui-section-title">${escHtml(heading)}</h1>
            <p class="ui-section-subtitle mt-6">${escHtml(intro)}</p>
            <div class="legal-meta mt-8"><span>Effective ${LEGAL_EFFECTIVE_DATE}</span><span>${LEGAL_NAME}</span><span>Mumbai, India</span></div>
        </section>
        <section class="max-w mx-auto px py-16 legal-layout">
            <aside class="legal-toc" aria-label="On this page"><div class="section-label">On this page</div>${toc}</aside>
            <div class="legal-content">${content}<section class="legal-contact"><div class="ui-kicker mb-3">Privacy and website questions</div><h2>Contact Moldart in writing.</h2><p>Email <a href="mailto:info@moldartindia.com">info@moldartindia.com</a> and include enough detail for the request to be reviewed.</p></section></div>
        </section>
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generatePrivacyPage() {
	return generateLegalPage({
		route: "/privacy/",
		title: "Privacy Notice",
		description:
			"How Moldart collects, uses, stores, and protects personal information submitted through moldartindia.com.",
		kicker: "Privacy notice",
		heading: "YOUR DETAILS STAY TIED TO A CLEAR PURPOSE.",
		intro:
			"This notice explains what the Moldart public website collects, why it is used, where it may be processed, and how to ask a privacy question or request action on your information.",
		sections: [
			{
				id: "scope",
				title: "Who this notice covers",
				html: `<p>This notice applies to personal information handled through <strong>moldartindia.com</strong> by ${LEGAL_NAME}, trading publicly as Moldart. It covers the public contact form, resource-access form, website security signals, and direct website-originated follow-up.</p><p>It does not replace the separate privacy terms of WhatsApp, LinkedIn, Microsoft meeting booking, email providers, or another external service you choose to open.</p>`,
			},
			{
				id: "data-collected",
				title: "Information collected",
				html: `<p>Depending on the route you use, Moldart may receive:</p><ul><li>Name, company, business email, and phone or WhatsApp number.</li><li>Product interest, application, quantity, timing, destination, Incoterm, HS code, available-file context, and your message.</li><li>The page, referral, and campaign parameters associated with the request.</li><li>Basic security and delivery metadata such as browser user agent and country. An IP address is stored only when the lead-intake environment is explicitly configured to do so.</li><li>For resource access, the browser may retain the submitted name, company, email, phone, lead reference, and unlock time in local storage so the same browser does not repeatedly ask for access details.</li></ul><p>Please do not submit passwords, payment credentials, confidential transaction documents, or sensitive personal information through a public form.</p>`,
			},
			{
				id: "purpose",
				title: "Why the information is used",
				html: `<p>Moldart uses submitted information to review and route an RFQ or supplier introduction, answer a question, provide requested documents, prevent abuse, maintain a record of the interaction, and follow up on the same technical-commercial context.</p><p>The public forms do not automatically subscribe you to an advertising list. Any materially different marketing use should have its own clear notice and choice.</p>`,
			},
			{
				id: "processing",
				title: "Storage and service providers",
				html: `<p>The website is delivered through Cloudflare. Form requests may be checked by Cloudflare Turnstile, stored in a configured Cloudflare D1 database, and/or forwarded to a configured Moldart lead workflow. Hosting, security, email, and workflow providers may process limited data on Moldart's instructions and under their own infrastructure terms.</p><p>Cloudflare Web Analytics or equivalent privacy-oriented aggregate measurement may be used to understand website performance. Moldart does not intentionally run third-party advertising trackers on the public site. If non-essential tracking is added later, an appropriate consent control should be introduced before activation.</p>`,
			},
			{
				id: "retention",
				title: "Retention and protection",
				html: `<p>Information is kept only as long as reasonably needed for the enquiry, document access, commercial record, security review, or applicable legal obligation. Records that are no longer needed should be deleted or de-identified through the relevant system.</p><p>Moldart uses access controls, bounded request sizes, origin checks, anti-spam controls, secure transport, and restricted website headers. No internet service can guarantee absolute security, so public forms should contain only the minimum information needed to start the discussion.</p>`,
			},
			{
				id: "choices",
				title: "Your choices and requests",
				html: `<p>You may ask whether Moldart holds your website-originated personal information, request a correction, ask for deletion where applicable, withdraw a consent that is still relevant, or raise a grievance about handling.</p><p>Send the request from the relevant email address to <a href="mailto:info@moldartindia.com">info@moldartindia.com</a>. Moldart may need to verify identity and preserve information that must be retained for legal, fraud-prevention, or contractual reasons. You can clear the resource-access record stored on your own device by removing site data for moldartindia.com in your browser.</p>`,
			},
			{
				id: "children-changes",
				title: "Children and notice changes",
				html: `<p>The website is intended for business users and is not directed to children. Do not submit a child's personal information through the public forms.</p><p>This notice may be updated when the website, lead workflow, or applicable requirements change. The effective date at the top identifies the current public version.</p>`,
			},
		],
	});
}

function generateTermsPage() {
	return generateLegalPage({
		route: "/terms/",
		title: "Website Terms",
		description:
			"Terms governing use of the Moldart public website, technical content, downloads, and enquiry routes.",
		kicker: "Website terms",
		heading: "PUBLIC INFORMATION. FORMAL TERMS COME LATER.",
		intro:
			"These terms set the boundary between public website information and a confirmed quotation, specification, approval, order, or supply contract.",
		sections: [
			{
				id: "use",
				title: "Using this website",
				html: `<p>By using moldartindia.com, you agree to use it lawfully and not to interfere with the site, probe protected systems, submit false enquiries, introduce malicious material, scrape personal contact data, or misrepresent a relationship with Moldart.</p><p>The public website is intended to help business users understand product routes, prepare better requirements, access selected references, and start a direct discussion.</p>`,
			},
			{
				id: "no-offer",
				title: "No quotation or supply commitment",
				html: `<p>Website text, images, technical ranges, checklists, guides, and form responses are general information. They are not a binding quotation, product warranty, availability promise, credit approval, delivery commitment, or supply contract.</p><p>Final grade, dimensions, tolerances, finish, quantity, MOQ, sample approval, price, tax, Incoterm, payment milestone, documentation, lead time, and delivery route must be confirmed in the applicable written commercial documents.</p>`,
			},
			{
				id: "accuracy",
				title: "Technical and editorial accuracy",
				html: `<p>Moldart aims to keep public information useful and current, but product routes and supplier capabilities can change. Buyers and sellers remain responsible for checking the current drawing, sample, technical data sheet, certificate, test method, and agreed acceptance criteria before relying on a specification.</p><p>Editorial guides are decision aids, not engineering, legal, tax, customs, safety, or professional design advice.</p>`,
			},
			{
				id: "downloads",
				title: "Downloads and intellectual property",
				html: `<p>Unless a file states otherwise, website content and Moldart-created materials may be used internally to evaluate a genuine requirement. They may not be republished, sold, altered to create a misleading claim, or used to imply Moldart approval without written permission.</p><p>Supplier catalogues, trademarks, photographs, and referenced standards may remain the property of their respective owners. Access to a file does not transfer ownership or a licence beyond the permitted evaluation use.</p>`,
			},
			{
				id: "links",
				title: "External links and services",
				html: `<p>The site may link to WhatsApp, LinkedIn, Microsoft meeting booking, video platforms, standards bodies, or other external services. Moldart does not control their availability, security, content, or privacy practices. Opening an external service is your choice and is governed by that service's terms.</p>`,
			},
			{
				id: "liability",
				title: "Availability and responsibility",
				html: `<p>The public site may be changed, suspended, or corrected without notice. To the extent permitted by applicable law, Moldart is not responsible for indirect loss caused solely by reliance on general website content, an unavailable external service, or an interrupted public website.</p><p>Nothing in these terms excludes a responsibility that cannot legally be excluded or changes the obligations in a separately signed or accepted commercial agreement.</p>`,
			},
			{
				id: "privacy-law",
				title: "Privacy, changes, and applicable law",
				html: `<p>Personal information submitted through the website is handled as described in the <a href="/privacy/">Privacy Notice</a>. These website terms may be updated with the effective date shown above.</p><p>These public website terms are governed by the laws of India. Courts with appropriate jurisdiction in Mumbai, Maharashtra will have jurisdiction, subject to any different dispute term in a binding commercial agreement.</p>`,
			},
		],
	});
}

function generateAboutPage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "About" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/about/#webpage",
			url: SITE + "/about/",
			name: "About Moldart | Technical RFQ Coordination",
			description: `Moldart coordinates technical and commercial RFQs from Mumbai across wood-panel, decorative stainless steel and electronics press systems.`,
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	return (
		headTag({
			title: "About Moldart | Technical RFQ Coordination",
			desc: "Moldart coordinates product definition, sourcing, samples, evidence, inspection and commercial execution from Mumbai.",
			canonical: "/about/",
			ogImage: siteSocialPosterRelativePath("moldart-about"),
			ogImageAlt: "Moldart about preview",
			schemas,
		}) +
		"\n" +
		nav("about") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} About Moldart</div>
                    <h1 class="ui-section-title">A MUMBAI TECHNICAL<br>AND COMMERCIAL RFQ DESK.</h1>
                    <p class="ui-section-subtitle">Moldart coordinates product definition, sourcing, samples, evidence, inspection, packing and commercial execution across wood-panel, decorative stainless steel and electronics press systems.</p>
                    <div class="ui-chip-row mt-8">
                        <span class="ui-chip">${glyph("building", "icon icon-sm")} Malad West, Mumbai</span>
                        <span class="ui-chip">${glyph("route", "icon icon-sm")} India + China coordination</span>
                        <span class="ui-chip">${glyph("layers", "icon icon-sm")} 3 product systems</span>
                    </div>
                </div>
                <div class="ui-page-hero-panel">
                    <div class="ui-proof-grid">
                        <article class="ui-proof-card"><div class="ui-proof-label">Head office</div><div class="ui-proof-value">Mumbai</div><p class="ui-proof-copy">The Malad West office remains the primary commercial and technical contact point.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Product systems</div><div class="ui-proof-value">3</div><p class="ui-proof-copy">Wood-panel lamination, decorative stainless steel and electronics pressing remain technically separate.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Coordination</div><div class="ui-proof-value">India + China</div><p class="ui-proof-copy">Each route is aligned to product construction, evidence, sample and commercial requirements.</p></article>
                        <article class="ui-proof-card"><div class="ui-proof-label">Public catalogue</div><div class="ui-proof-value">17 routes</div><p class="ui-proof-copy">Product pages state scope, exclusions and RFQ inputs without exposing private suppliers.</p></article>
                    </div>
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Company timeline</div>
                <h2 class="ui-section-title">ROOTS. INCORPORATION. TODAY.</h2>
                <p class="ui-section-subtitle">A concise, evidence-bounded timeline. Moldart is a sourcing, trading and coordination partner; supplier facilities are not presented as Moldart-owned.</p>
            </div>
            <div class="ui-timeline">
                ${companyMilestones.map((milestone) => renderMilestone(milestone)).join("")}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph("check", "icon icon-sm")} Evidence discipline</div>
                <h2 class="ui-section-title">PROOF BEFORE PROMISE.</h2>
                <p class="ui-section-subtitle">Moldart keeps public claims tied to what can be checked: office identity, category scope, document flow, approval checkpoints, and the limits of each sourcing route.</p>
            </div>
            <div class="ui-library-grid">
                <article class="ui-library-card"><div class="ui-kicker mb-3">RFQ review</div><h3 class="ui-family-title family-title-large">Requirement first, price second.</h3><p class="text-sm text-zinc-500 leading-relaxed mt-3">Dimensions, surface, grade, quantity, destination, documents, Incoterm, and timing are checked before supplier comparison or commercial guidance.</p></article>
                <article class="ui-library-card"><div class="ui-kicker mb-3">Approval control</div><h3 class="ui-family-title family-title-large">Samples and documents reduce mistakes.</h3><p class="text-sm text-zinc-500 leading-relaxed mt-3">For suitable programmes, samples, drawings, finish references, certificates, packing notes, and dispatch documents are treated as approval gates rather than afterthoughts.</p></article>
                <article class="ui-library-card"><div class="ui-kicker mb-3">Route honesty</div><h3 class="ui-family-title family-title-large">Not every route fits every requirement.</h3><p class="text-sm text-zinc-500 leading-relaxed mt-3">India and China sourcing routes are recommended only where the category, MOQ, lead time, documentation, and quality-control context make sense.</p></article>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-library-grid">
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph("building", "icon icon-sm")} Operating base</div>
                    <h3 class="ui-family-title family-title-large">Mumbai remains the primary coordination point.</h3>
                    <address class="ui-address mt-3">${escHtml(COMPANY_ADDRESS)}</address>
                    <div class="ui-link-row mt-5"><a href="${whatsappHref(WHATSAPP_PRIMARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-link-pill">WhatsApp ${WHATSAPP_PRIMARY.display}</a><a href="${whatsappHref(WHATSAPP_SECONDARY.number)}" target="_blank" rel="noopener noreferrer" class="ui-link-pill">WhatsApp ${WHATSAPP_SECONDARY.display}</a><a href="mailto:info@moldartindia.com" class="ui-link-pill">info@moldartindia.com</a></div>
                </article>
                <article class="ui-library-card">
                    <div class="ui-kicker mb-3">${glyph("route", "icon icon-sm")} How Moldart works</div>
                    <div class="ui-flow-band">
                        ${SUPPLY_FLOW_ITEMS.map((item) => `<div class="ui-flow-pill"><div class="ui-flow-step">${escHtml(item.step)}</div><div class="ui-flow-title">${escHtml(item.title)}</div><p class="ui-flow-copy">${escHtml(item.detail)}</p></div>`).join("")}
                    </div>
                </article>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-kicker mb-6">${glyph("building", "icon icon-sm")} Leadership</div>
            <div class="ui-profile-grid">
                <article class="ui-family-card">
                    <div class="ui-family-media family-media-tall">
                        <picture><source srcset="/images/lalit_doshi.avif" type="image/avif"><img src="/images/lalit_doshi.webp" alt="Mr. Lalit Doshi — Founder and Partner at Moldart" class="w-full h-full object-cover object-top" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <div class="ui-family-body">
                        <h3 class="ui-family-title">MR. LALIT DOSHI</h3>
                        <div class="ui-proof-label mb-3">Founder &amp; Partner</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Leads commercial relationships and category experience across Moldart's wood-panel and decorative-surface programmes. Historical dates and entity continuity are published only after primary records are approved.</p>
                    </div>
                </article>
                <article class="ui-family-card">
                    <div class="ui-family-media family-media-tall">
                        <picture><source srcset="/images/yash_doshi.avif" type="image/avif"><img src="/images/yash_doshi.webp" alt="Mr. Yash Doshi — Partner at Moldart" class="w-full h-full object-cover object-top" loading="lazy" width="600" height="400"></picture>
                    </div>
                    <div class="ui-family-body">
                        <h3 class="ui-family-title">MR. YASH DOSHI</h3>
                        <div class="ui-proof-label mb-3">Partner</div>
                        <p class="text-sm text-zinc-500 leading-relaxed font-light">Partner driving category development, technical sourcing, and customer coordination. Focused on modernising supply chain operations and expanding Moldart's cross-border sourcing capabilities between India and China.</p>
                        <div class="mt-5 contact-social-row"><a href="${YASH_LINKEDIN}" target="_blank" rel="noopener noreferrer" class="contact-social-chip is-personal">${glyph("linkedin-brand", "icon icon-sm")} Yash Doshi</a></div>
                    </div>
                </article>
            </div>
        </section>

        ${ctaBlock("READY TO WORK<br>FROM A CLEARER BRIEF?", "Open Solutions, review the relevant references, or send the requirement directly for confirmation.", "Explore Solutions", "/solutions/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateProcessPage() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Process" }]);
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/process/#webpage",
			url: SITE + "/process/",
			name: "How Moldart Works | RFQ, Approval, Dispatch & Repeat Supply",
			description:
				"A concise view of how Moldart moves from RFQ inputs to route alignment, approval control, dispatch, and repeat supply.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const stages = [
		{ number: "01", title: "Define", detail: "Record product, application, construction, dimensions, quantity, timing and destination." },
		{ number: "02", title: "Qualify", detail: "Review source fit, evidence, sample route, packing and commercial basis." },
		{ number: "03", title: "Approve", detail: "Lock the sample, drawing, document revision, test method and hold criteria." },
		{ number: "04", title: "Supply", detail: "Coordinate order records, inspection, packing, dispatch and the retained reorder reference." },
	];
	schemas.splice(1, 0, {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name: "Moldart RFQ to controlled delivery process",
		description:
			"Define, qualify, approve and supply sequence for Moldart technical RFQs.",
		step: stages.map((stage, index) => ({
			"@type": "HowToStep",
			position: index + 1,
			name: stage.title,
			text: stage.detail,
		})),
	});
	const firstReviewItems = [
		"Application",
		"Size / thickness / finish",
		"Quantity and timing",
		"Destination",
		"Incoterm / port if known",
		"Payment or document requirement",
		"Reference sample, drawing, or file",
		"Required certificates or documents",
	];
	const processDecisionRows = [
		["Define", "Product, application, construction, quantity and destination", "The quote is based on an incomplete or wrong product route"],
		["Qualify", "Evidence, source fit, sample, packing and timing", "Options are compared without the same technical and commercial basis"],
		["Approve", "Sample, drawing, revision, method and hold criteria", "Production or dispatch proceeds against an ambiguous reference"],
		["Supply", "Inspection, packing, documents, dispatch and reorder record", "Receiving disputes or repeat-order drift cannot be traced"],
	]
		.map(
			(row) =>
				`<tr><td>${escHtml(row[0])}</td><td>${escHtml(row[1])}</td><td>${escHtml(row[2])}</td></tr>`,
		)
		.join("");
	const processVisual = `<div class="process-mini-flow" aria-label="RFQ to supply sequence">${stages.map((stage) => `<div class="process-mini-step"><span>${stage.number}</span><strong>${escHtml(stage.title)}</strong></div>`).join("")}</div>`;

	return (
		headTag({
			title: "How Moldart Works | RFQ, Approval, Dispatch & Repeat Supply",
			desc: "A concise view of how Moldart moves from RFQ inputs to route alignment, approval control, dispatch, and repeat supply.",
			canonical: "/process/",
			ogImage: siteSocialPosterRelativePath("moldart-process"),
			ogImageAlt: "Moldart process overview",
			schemas,
		}) +
		"\n" +
		nav("process") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="ui-page-hero process-hero-minimal">
                <div class="ui-page-hero-copy">
                    <div class="ui-kicker mb-4">${glyph("route", "icon icon-sm")} Process</div>
                    <h1 class="ui-section-title">FROM INQUIRY<span class="sr-only"> </span><br>TO CONTROLLED DELIVERY.</h1>
                    <p class="ui-section-subtitle">A usable RFQ, scoped evidence, an approved reference and controlled dispatch reduce avoidable technical and commercial errors.</p>
                    <div class="home-hero-actions mt-8">
                        <a href="/contact/" class="btn-primary btn-lg">Share Requirement →</a>
                    </div>
                </div>
                <div class="ui-page-hero-panel process-mini-panel">
                    ${processVisual}
                </div>
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-10">
                <div class="ui-kicker mb-4">${glyph("clock", "icon icon-sm")} Working sequence</div>
                <h2 class="ui-section-title">DEFINE. QUALIFY. APPROVE. SUPPLY.</h2>
            </div>
            <div class="process-stage-grid-minimal">
                ${stages.map((stage) => `<article class="process-stage-card-minimal"><div class="process-note-step">${stage.number}</div><h3>${escHtml(stage.title)}</h3><p>${escHtml(stage.detail)}</p></article>`).join("")}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 border-b border-zinc-100 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("check", "icon icon-sm")} First review</div>
                <h2 class="ui-section-title">WHAT TO SEND FIRST.</h2>
            </div>
            <div class="process-checklist-minimal">
                ${firstReviewItems.map((item) => `<span>${escHtml(item)}</span>`).join("")}
            </div>
        </section>

        <section class="max-w mx-auto px py-16 fade-up">
            <div class="ui-section-head mb-8">
                <div class="ui-kicker mb-4">${glyph("shield", "icon icon-sm")} Decision gates</div>
                <h2 class="ui-section-title">WHERE MISTAKES ARE PREVENTED.</h2>
                <p class="ui-section-subtitle">The process is not a decorative flowchart. Each gate exists to stop a common sourcing mistake before it becomes a commercial or logistics problem.</p>
            </div>
            <div class="decision-matrix-wrap">
                <table class="decision-matrix"><thead><tr><th>Gate</th><th>Confirm before moving</th><th>Risk if skipped</th></tr></thead><tbody>${processDecisionRows}</tbody></table>
            </div>
        </section>

        ${ctaBlock("READY TO START?", "Send the application, quantity, timing, destination, and any reference file.", "Share your requirement", "/contact/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generatePortalShell({
	title = "",
	desc = "",
	canonical = "/portal/",
	heading = "",
	intro = "",
	body = "",
	label = "PRIVATE PORTAL ACCESS",
}) {
	return (
		headTag({
			title,
			desc,
			canonical,
			ogImage: siteSocialPosterRelativePath("moldart-portal"),
			ogImageAlt: "Moldart private portal access boundary",
			noindex: true,
			schemas: [],
		}) +
		"\n" +
		nav("portal") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            <div class="inline-flex items-center gap-3 mb-8"><span class="section-kicker-rule"></span><span class="section-label">${escHtml(label)}</span></div>
            <h1 class="page-heading portal-page-heading mt-8">${heading}</h1>
            <p class="text-base text-zinc-500 font-light max-w-3xl leading-relaxed mt-6">${intro}</p>
        </section>
        ${body}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generatePortalBoundaryBody() {
	const cards = [
		{
			title: "Buyer workspace",
			detail:
				"RFQs, buyer-visible offers, approved documents, payment milestones, logistics milestones, and order status.",
		},
		{
			title: "Seller workspace",
			detail:
				"Assigned inquiries, quote submission, approved document sharing, and execution milestones.",
		},
		{
			title: "Internal ops",
			detail:
				"Moldart reviews companies, routes inquiries, controls approvals, reconciles mock payments, and maintains logistics records.",
		},
	];
	const controls = [
		"Public access is not open.",
		"All access is company, role, approval, and document-rule scoped.",
		"Payment gateway and carrier APIs remain adapter-ready in internal review mode.",
		"The authenticated portal remains private until security, data, and workflow checks pass.",
	];
	return `<section class="max-w mx-auto px py-16 fade-up">
            <div class="portal-status-card mb-8">
              <div class="portal-status-copy">
                <div class="section-label mb-3">Private approval boundary</div>
                <p class="text-sm text-zinc-500 leading-relaxed">The portal is the internal operating layer for India inquiries, China sourcing, quotes, orders, payment milestones, logistics, documents, and audit history.</p>
              </div>
              <div class="flex gap-3 flex-wrap"><a href="/contact/?intent=portal-access" class="btn-primary">Request Access</a><a href="/process/" class="btn-outline">View Process</a><a href="/contact/?intent=buyer-rfq" class="btn-outline">Share Requirement</a></div>
            </div>
            <div class="signal-grid signal-grid-portal mb-8">
              ${cards.map((card) => `<article class="signal-card portal-card"><div class="section-label mb-4">${escHtml(card.title)}</div><p class="text-sm text-zinc-500 leading-relaxed">${escHtml(card.detail)}</p></article>`).join("")}
            </div>
            <div class="resource-access-note">
              <div class="resource-access-note-title mb-3">Portal release controls</div>
              <div class="resource-access-note-grid">${controls.map((item) => `<span>${escHtml(item)}</span>`).join("")}</div>
            </div>
          </section>`;
}

function generateLoginPage() {
	return generatePortalShell({
		title: "Private Portal Access | Moldart",
		desc: "The Moldart portal is a private approved-company workflow. Public sign-in and registration are not open.",
		canonical: "/portal/",
		heading: "PRIVATE TRADE OPERATIONS WORKSPACE.",
		intro:
			"Approved buyers, sellers, and Moldart internal users work through scoped RFQs, quotes, orders, payment milestones, logistics, documents, and audit records. Public access is closed while the internal review build is tested.",
		body: generatePortalBoundaryBody(),
		label: "PRIVATE PORTAL ACCESS",
	});
}

function generatePortalPrivateRedirectPage() {
	return generatePageRedirect(
		"/portal/",
		"Private Portal Access | Moldart",
		"Open private portal boundary",
		true,
	);
}

function generatePortalSignInPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalSignUpPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalDashboardPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalCatalogPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalRfqPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalApprovalsPage() {
	return generatePortalPrivateRedirectPage();
}

function generatePortalOrdersPage() {
	return generatePortalPrivateRedirectPage();
}

function generate404() {
	return (
		headTag({
			title: "404 — Page Not Found | Moldart",
			desc: "The requested Moldart page could not be found. Use search, product routes, resources, or contact links to continue your sourcing review.",
			canonical: "/404.html",
			noindex: true,
			schemas: [],
		}) +
		"\n" +
		nav("404") +
		`

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
    ${closingElements()}`
	);
}

function generatePageRedirect(target, title, label, noindex = false) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, nofollow, noarchive">
    <meta name="description" content="This legacy Moldart page redirects to the current website route.">
    <meta http-equiv="refresh" content="0;url=${target}">
    <link rel="canonical" href="${SITE}${target}">
    <title>${escHtml(title)}</title>
</head>
<body>
    <h1>${escHtml(title)}</h1>
    <p>This page has moved. <a href="${target}">${escHtml(label)}</a>.</p>
</body>
</html>`;
}

function generateIndustryRedirect() {
	return generatePageRedirect(
		"/solutions/",
		"Redirecting to Solutions — Moldart",
		"Explore solutions",
	);
}

function generateInsightRedirect(slug) {
	return generatePageRedirect(
		"/insights/",
		"Redirecting to Insights — Moldart",
		"Open the current insights library",
		true,
	);
}

// ============================================================
// INSIGHTS
// ============================================================
// ============================================================
// INSIGHTS
// ============================================================
function extractArticleHeadings(md) {
	return String(md || "")
		.replace(/\r/g, "")
		.split("\n")
		.map((line) => line.trim())
		.map((line) => {
			const match = line.match(/^(#{2,3})\s+(.*)$/);
			if (!match) return null;
			const text = stripMarkdownInline(match[2]);
			return { level: match[1].length, text, id: slugify(text) };
		})
		.filter(Boolean);
}

function extractHtmlHeadings(html = "") {
	const headings = [];
	const regex = /<h([23])(?:[^>]*id="([^"]+)")?[^>]*>([\s\S]*?)<\/h\1>/g;
	let match;
	while ((match = regex.exec(String(html || "")))) {
		const text = String(match[3] || "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim();
		headings.push({
			level: Number(match[1]),
			text,
			id: match[2] || slugify(text),
		});
	}
	return headings;
}

function injectHtmlHeadingIds(html = "", headings = []) {
	let next = String(html || "");
	for (const heading of headings) {
		const level = heading.level === 3 ? 3 : 2;
		const exact = `<h${level}>${heading.text}</h${level}>`;
		if (next.includes(exact)) {
			next = next.replace(exact, `<h${level} id="${heading.id}">${heading.text}</h${level}>`);
			continue;
		}
		const pattern = new RegExp(
			`<h${level}((?:(?!id=)[^>])*)>${escapeRegExp(heading.text)}<\\/h${level}>`,
			"i",
		);
		next = next.replace(
			pattern,
			`<h${level}$1 id="${heading.id}">${heading.text}</h${level}>`,
		);
	}
	return next;
}

function decorateResponsiveTables(html = "") {
	return String(html || "").replace(
		/<table([^>]*)>([\s\S]*?)<\/table>/gi,
		(match, attrs = "", inner = "") => {
			const rows = [...inner.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
			if (!rows.length) return match;
			let headers = [];
			const rebuiltRows = rows
				.map((row, rowIndex) => {
					const cells = [
						...String(row[1] || "").matchAll(
							/<(th|td)([^>]*)>([\s\S]*?)<\/\1>/gi,
						),
					];
					if (!cells.length) return "";
					const hasHeaderCells = cells.some(
						(cell) => String(cell[1] || "").toLowerCase() === "th",
					);
					if (rowIndex === 0 && hasHeaderCells) {
						headers = cells.map(
							(cell, index) =>
								stripMarkdownInline(
									String(cell[3] || "")
										.replace(/<[^>]+>/g, " ")
										.replace(/\s+/g, " ")
										.trim(),
								) || `Column ${index + 1}`,
						);
						return `<tr class="responsive-table-head">${cells.map((cell) => `<th${cell[2] || ""} scope="col">${cell[3] || ""}</th>`).join("")}</tr>`;
					}
					if (!headers.length)
						headers = cells.map((_, index) => `Column ${index + 1}`);
					return `<tr class="responsive-table-row">${cells
						.map((cell, index) => {
							const cleanedAttrs = String(cell[2] || "").replace(
								/\sdata-label=("[^"]*"|'[^']*')/gi,
								"",
							);
							const label = headers[index] || `Column ${index + 1}`;
							return `<td${cleanedAttrs} data-label="${escHtml(label)}">${cell[3] || ""}</td>`;
						})
						.join("")}</tr>`;
				})
				.filter(Boolean)
				.join("");
			const classMatch = attrs.match(/class\s*=\s*["']([^"']*)["']/i);
			const nextAttrs = classMatch
				? attrs.replace(
						classMatch[0],
						`class="${classMatch[1].includes("responsive-data-table") ? classMatch[1] : `${classMatch[1]} responsive-data-table`.trim()}"`,
					)
				: `${attrs} class="responsive-data-table"`;
			return `<table${nextAttrs}><tbody>${rebuiltRows}</tbody></table>`;
		},
	);
}

function markdownToHtml(md) {
	const source = String(md || "").replace(/\r/g, "");
	const lines = source.split("\n");
	const html = [];
	let listMode = null;

	const formatInline = (value) =>
		escHtml(value)
			.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
			.replace(/`(.+?)`/g, "<code>$1</code>");

	const closeList = () => {
		if (listMode === "ul") html.push("</ul>");
		if (listMode === "ol") html.push("</ol>");
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
			const level = heading[1].length === 2 ? "h2" : "h3";
			const id = slugify(stripMarkdownInline(heading[2]));
			html.push(`<${level} id="${id}">${formatInline(heading[2])}</${level}>`);
			continue;
		}

		const unordered = line.match(/^[-*]\s+(.*)$/);
		if (unordered) {
			if (listMode !== "ul") {
				closeList();
				html.push("<ul>");
				listMode = "ul";
			}
			html.push(`<li>${formatInline(unordered[1])}</li>`);
			continue;
		}

		const ordered = line.match(/^\d+\.\s+(.*)$/);
		if (ordered) {
			if (listMode !== "ol") {
				closeList();
				html.push("<ol>");
				listMode = "ol";
			}
			html.push(`<li>${formatInline(ordered[1])}</li>`);
			continue;
		}

		closeList();
		html.push(`<p>${formatInline(line)}</p>`);
	}

	closeList();
	return html.join("\n");
}

function insightCategoryGlyph(label = "") {
	if (label === "Lamination Tooling") return "layers";
	if (label === "Industrial Tooling") return "shield";
	if (label === "Decorative Steel" || label === "Decorative Stainless Steel") return "spark";
	if (label === "Panel Systems") return "factory";
	if (label === "Flooring Systems") return "compass";
	if (label === "RFQ & Sourcing Control") return "message";
	if (label === "Printed Decor Paper & Cylinders") return "book";
	if (label === "Decorative Surfaces") return "layers";
	if (label === "Formwork / Shuttering") return "building";
	if (label === "Furniture Programmes") return "check";
	return "building";
}

function generateInsightsHub() {
	const bc = breadcrumb([{ name: "Home", url: "/" }, { name: "Insights" }]);
	const articles = rawInsights.articles;
	const editorialArticles = rawInsights.editorial;
	const categorySet = new Set(editorialArticles.map((a) => a.categoryLabel));
	const categories = [
		...GUIDE_INDEX.filter((category) => categorySet.has(category)),
		...[...categorySet].filter((category) => !GUIDE_INDEX.includes(category)),
	];
	const [featuredArticle, ...otherArticles] = editorialArticles;

	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": SITE + "/insights/#webpage",
			url: SITE + "/insights/",
			name: "Technical Library — Buyer Decision Sheets | Moldart",
			description:
				"Buyer-useful decision sheets for RFQs, approvals, receiving checks, documents, defects, and specification control.",
			isPartOf: { "@id": SITE + "/#website" },
			inLanguage: "en-IN",
		},
		bc.schema,
	];

	const filterBtns = `<div class="insights-filter-row"><button type="button" class="insights-filter-btn is-active" data-filter="all">All</button>${categories.map((c) => `<button type="button" class="insights-filter-btn" data-filter="${escHtml(c)}">${escHtml(c)}</button>`).join("")}</div>`;
	const collectionCards = [
		{
			icon: "message",
			title: "RFQ planning",
			copy: "Use these when the next action is a cleaner buyer brief.",
			filter: "RFQ & Sourcing Control",
		},
		{
			icon: "shield",
			title: "Quality checks",
			copy: "Use these before samples, acceptance, or receiving decisions.",
			filter: "Panel Systems",
		},
		{
			icon: "layers",
			title: "Product comparisons",
			copy: "Use these when two routes or materials look similar on paper.",
			filter: "Decorative Surfaces",
		},
		{
			icon: "book",
			title: "Buyer guides",
			copy: "Use these as the first read before a route-specific shortlist.",
			filter: "all",
		},
	]
		.map(
			(card) =>
				`<button type="button" class="insight-collection-card" data-filter="${escHtml(card.filter)}"><span class="ui-kicker mb-3">${glyph(card.icon, "icon icon-sm")} ${escHtml(card.title)}</span><span class="insight-collection-card-copy">${escHtml(card.copy)}</span></button>`,
		)
		.join("");
	const intentCards = [
		{
			icon: "message",
			title: "Build the RFQ",
			copy: "Use the decision cards and RFQ input sections before comparing price or supplier replies.",
		},
		{
			icon: "layers",
			title: "Lock the specification",
			copy: "Use the matrices to define grade, finish, size, tolerance, sample, packing, and document requirements.",
		},
		{
			icon: "shield",
			title: "Protect approval",
			copy: "Use workflow and defect maps when samples, documents, or receiving checks can decide acceptance.",
		},
		{
			icon: "book",
			title: "Use evidence",
			copy: "Treat the guide as a decision framework; final values and acceptance must be confirmed in the approved programme record.",
		},
	]
		.map(
			(card) =>
				`<article class="insight-intent-card"><div class="ui-kicker mb-3">${glyph(card.icon, "icon icon-sm")} ${escHtml(card.title)}</div><p>${escHtml(card.copy)}</p></article>`,
		)
		.join("");
	const topicPills = categories
		.map(
			(category) =>
				`<span class="insight-topic-pill">${escHtml(category)}</span>`,
		)
		.join("");
	const guideIndexCards = GUIDE_INDEX.filter((category) => categories.includes(category))
		.map(
			(category) =>
				`<article class="insight-intent-card"><div class="ui-kicker mb-3">${glyph(insightCategoryGlyph(category), "icon icon-sm")} ${escHtml(category)}</div><p>Open the guides that match this material and buyer-decision route.</p></article>`,
		)
		.join("");
	const featureHtml = featuredArticle
		? `<a href="/insights/${featuredArticle.slug}/" class="ui-insight-feature insight-card" data-category="${escHtml(featuredArticle.categoryLabel)}">${renderInsightCardMedia(featuredArticle)}<div class="ui-insight-card-body"><div class="ui-kicker mb-3">${glyph("spark", "icon icon-sm")} Start here</div><div class="font-display font-black text-3xl mb-3 insight-feature-title">${escHtml(featuredArticle.title)}</div><p class="text-sm text-zinc-500 leading-relaxed mb-6">${escHtml(featuredArticle.excerpt)}</p><div class="ui-meta-inline"><span>${escHtml(featuredArticle.type)}</span><span>${escHtml(featuredArticle.categoryLabel)}</span><span>${escHtml(articleDateLabel(featuredArticle))}</span></div></div></a>`
		: "";
	const renderInsightListCard = (article) =>
		`<a href="/insights/${article.slug}/" class="ui-insight-card insight-card" data-category="${escHtml(article.categoryLabel)}">${renderInsightCardMedia(article)}<div class="ui-insight-card-body"><div class="ui-kicker mb-3">${glyph("book", "icon icon-sm")} ${escHtml(article.type)}</div><div class="font-display font-bold text-xl mb-3 insight-card-title">${escHtml(article.title)}</div><p class="text-sm text-zinc-500 leading-relaxed">${escHtml(article.excerpt)}</p><div class="ui-meta-inline mt-5"><span>${escHtml(article.categoryLabel)}</span><span>${escHtml(articleDateLabel(article))}</span></div></div></a>`;
	const priorityArticles = otherArticles.slice(0, 11);
	const secondaryArticles = otherArticles.slice(11);
	const cardsHtml = `${priorityArticles.map(renderInsightListCard).join("")}${secondaryArticles.length ? `<details class="insight-more-details"><summary>Show ${secondaryArticles.length} more decision sheets</summary><div class="ui-insight-grid insight-more-grid">${secondaryArticles.map(renderInsightListCard).join("")}</div></details>` : ""}`;
	const routeAssistCards = applications
		.map((app) => renderInsightRouteAssistCard(app))
		.join("");

	return (
		headTag({
			title: "Technical Library | Buyer Decision Sheets — Moldart",
			desc: "Buyer-useful Moldart guides for RFQs, specification matrices, approval packs, receiving checks, defect maps, and document control.",
			canonical: "/insights/",
			ogImage: siteSocialPosterRelativePath("moldart-insights"),
			ogImageAlt: "Moldart insights overview",
			schemas,
		}) +
		"\n" +
		nav("insights") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
			<div class="ui-page-hero">
				<div class="ui-page-hero-copy">
					<div class="ui-kicker mb-4">${glyph("spark", "icon icon-sm")} Buyer technical library</div>
					<h1 class="ui-section-title">GUIDES FOR RFQS,<br>APPROVALS, RECEIVING,<br>AND REPEAT SUPPLY.</h1>
					<p class="ui-section-subtitle">Choose a guide by the buyer task: specify, compare, approve, inspect, receive, or prepare a cleaner RFQ. Each guide states its evidence boundary rather than presenting a generic product promise.</p>
				</div>
				<div class="ui-page-hero-panel">
					<div class="ui-proof-grid">
						<article class="ui-proof-card"><div class="ui-proof-label">Decision guides</div><div class="ui-proof-value">${articles.length}</div><p class="ui-proof-copy">Start with the material and buyer decision that match the live requirement.</p></article>
						<article class="ui-proof-card"><div class="ui-proof-label">Control stages</div><div class="ui-proof-value">Specify · Approve · Inspect</div><p class="ui-proof-copy">Use the relevant guide before commercial comparison, dispatch, or release.</p></article>
						<article class="ui-proof-card"><div class="ui-proof-label">Final basis</div><div class="ui-proof-value">Approved evidence</div><p class="ui-proof-copy">Final values and acceptance stay tied to the approved TDS, sample, test method, and purchase specification.</p></article>
					</div>
				</div>
			</div>
        </section>

		<section class="max-w mx-auto px py-12 border-b border-zinc-100">
			<div class="ui-section-head mb-8">
				<div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} Start by buyer question</div>
				<h2 class="ui-section-title">READ BY TASK, NOT BY VOLUME.</h2>
				<p class="ui-section-subtitle">Collections reduce the article wall into the four decisions buyers usually need to make first.</p>
			</div>
			<div class="insight-collection-grid mb-8">${collectionCards}</div>
			<div class="insight-intent-grid mb-8">${intentCards}</div>
			<div class="insight-topic-row mb-6">${topicPills}</div>
			<div class="ui-kicker mb-4">${glyph("book", "icon icon-sm")} Published buyer decision sheets</div>
			${filterBtns}
			<div class="ui-insight-grid" id="insights-grid">
				${featureHtml}
                ${cardsHtml}
            </div>
        </section>

		<section class="max-w mx-auto px py-16 fade-up">
			<div class="ui-section-head mb-10">
				<div class="ui-kicker mb-4">${glyph("layers", "icon icon-sm")} Guide index</div>
				<h2 class="ui-section-title">START WITH THE BUYER<br>QUESTION, NOT A BLOG TOPIC.</h2>
				<p class="ui-section-subtitle">The index keeps RFQ control, decorative steel, lamination tooling, panel systems, flooring, furniture, formwork, and industrial tooling separated so articles do not duplicate each other.</p>
			</div>
			<div class="insight-intent-grid mb-10">${guideIndexCards}</div>
			<div class="ui-kicker mb-4">${glyph("compass", "icon icon-sm")} Application entry points</div>
			<div class="insight-route-card-grid">${routeAssistCards}</div>
		</section>
        ${ctaBlock("NEED SPECIFIC<br>GUIDANCE?", "Use a guide as the starting point, then send the actual requirement for a product-aligned review.", "Share your requirement", "/contact/")}
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

function generateInsightArticle(article) {
	const bc = breadcrumb([
		{ name: "Home", url: "/" },
		{ name: "Insights", url: "/insights/" },
		{
			name:
				article.title.length > 50
					? article.title.substring(0, 47) + "..."
					: article.title,
		},
	]);

	let contentHtml = decorateResponsiveTables(
		renderInsightArticleBody(article),
	);
	const context = articleProductContext(article);
	const readTime = estimateReadTime(article, contentHtml);
	const faqItems = articleFaqItems(article, context);
	const articleOgImage = insightPreviewImageRaw(article, context);
	const articleOgImageUrl = `${SITE}${socialImageVersionedUrl(articleOgImage)}`;
	const seoTitle = article.seoTitle || compactSeoTitle(article.title);
	const metaDescription = insightMetaDescription(article);
	const categoryIcon = insightCategoryGlyph(article.categoryLabel);
	const articleMetadata = [
		articleDateLabel(article) ? `Published: ${articleDateLabel(article)}` : "",
		readTime || "",
		article.author ? `Prepared by ${article.author}` : "",
		article.technicalReviewer
			? `Technical review: ${article.technicalReviewer}`
			: "",
	]
		.filter(Boolean)
		.map((item) => `<span>${escHtml(item)}</span>`)
		.join("");
	const schemas = [
		{
			"@context": "https://schema.org",
			"@type": "Article",
			headline: article.title,
			description: metaDescription,
			image: articleOgImageUrl,
			...(article.author
				? { author: { "@type": "Organization", name: article.author } }
				: {}),
			...(article.date ? { datePublished: article.date } : {}),
			...(article.technicalReviewedDate
				? { dateModified: article.technicalReviewedDate }
				: {}),
			publisher: {
				"@type": ["Organization", "LocalBusiness"],
				name: "Moldart",
				url: SITE,
				logo: {
					"@type": "ImageObject",
					url: SITE + "/favicon-192x192.png",
					width: 192,
					height: 192,
				},
			},
			mainEntityOfPage: SITE + `/insights/${article.slug}/`,
		},
		...(faqItems.length
			? [
					{
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: faqItems.map((item) => ({
							"@type": "Question",
							name: item.question,
							acceptedAnswer: { "@type": "Answer", text: item.answer },
						})),
					},
				]
			: []),
		bc.schema,
	];

	const audiences = articleAudienceFor(article, context).slice(0, 4);
	const headings = extractHtmlHeadings(contentHtml)
		.filter((heading) => heading.level === 2)
		.filter(
			(heading) =>
				![
					"Questions that shape the next review",
					"Reference links and standards context",
					"Technical checkpoints at a glance",
				].includes(heading.text),
		)
		.slice(0, 10);
	contentHtml = injectHtmlHeadingIds(contentHtml, headings);
	const tocRail = headings.length
		? `<div class="article-toc-band"><div class="article-toc-label">In this guide</div><div class="article-toc-row">${headings.map((heading) => `<a href="#${heading.id}" class="article-toc-link${heading.level === 3 ? " is-sub" : ""}">${escHtml(heading.text)}</a>`).join("")}</div></div>`
		: "";

	return (
		headTag({
			title: seoTitle,
			desc: metaDescription,
			canonical: `/insights/${article.slug}/`,
			ogImage: articleOgImage,
			ogImageAlt: insightPreviewAlt(article, context),
			schemas,
			preloadImages: [articleOgImage],
		}) +
		"\n" +
		nav("insights") +
		`

    <main id="main-content" class="pt-16">
        <section class="max-w mx-auto px py-20 border-b border-zinc-100">
            ${bc.html}
            <div class="inline-flex items-center gap-3 mb-8"><span class="section-kicker-rule"></span><span class="section-label">${escHtml(article.categoryLabel)} · ${escHtml(article.type)}</span></div>
            <h1 class="page-heading article-page-heading article-heading-tight">${escHtml(article.title)}</h1>
            ${articleMetadata ? `<div class="article-meta-row flex items-center gap-4 mt-6 text-sm text-zinc-500">${articleMetadata}</div>` : ""}
			<p class="text-base text-zinc-500 font-light max-w-3xl leading-relaxed mt-6">${escHtml(article.excerpt)}</p>
			<div class="ui-chip-row mt-6">
				<span class="ui-chip">${glyph(categoryIcon, "icon icon-sm")} ${escHtml(article.categoryLabel)}</span>
                ${audiences.map((item) => `<span class="ui-chip">${glyph("check", "icon icon-sm")} ${escHtml(item)}</span>`).join("")}
            </div>
            ${article.technicalLibrary ? "" : renderInsightSignalStrip(article, context)}
        </section>
        <section class="max-w mx-auto px py-12">
            <div class="insight-layout insight-layout-single">
                <article class="insight-article">
                    ${tocRail}
                    ${contentHtml}
                    ${renderShareBar(article.title, `/insights/${article.slug}/`)}
                </article>
            </div>
        </section>
        <section class="max-w mx-auto px py-16 border-t border-zinc-100 fade-up">
            ${renderArticleEndRail(article, context)}
        </section>
    </main>

    ${footer()}
    ${closingElements()}`
	);
}

// ============================================================
// SITEMAP, ROBOTS, REDIRECTS
// ============================================================
// ============================================================
// SITEMAP, ROBOTS, REDIRECTS
// ============================================================
function generateSitemap() {
	const pages = [
		{ url: "/", priority: "1.0", freq: "monthly" },
		{ url: "/explore/", priority: "0.8", freq: "weekly" },
		{ url: "/solutions/", priority: "0.9", freq: "weekly" },
		{ url: "/products/", priority: "0.8", freq: "weekly" },
		{ url: "/about/", priority: "0.8", freq: "monthly" },
		{ url: "/insights/", priority: "0.8", freq: "weekly" },
		{ url: "/evidence-qc/", priority: "0.8", freq: "monthly" },
		{ url: "/process/", priority: "0.7", freq: "monthly" },
		{ url: "/resources/", priority: "0.7", freq: "monthly" },
		{ url: "/contact/", priority: "0.8", freq: "monthly" },
		{ url: "/faq/", priority: "0.6", freq: "monthly" },
		{ url: "/privacy/", priority: "0.3", freq: "yearly" },
		{ url: "/terms/", priority: "0.3", freq: "yearly" },
	];
	for (const pid of Object.keys(productMeta)) {
		const m = productMeta[pid];
		pages.push({
			url: `/products/${m.slug}/`,
			priority: "0.7",
			freq: "monthly",
		});
	}
	for (const app of applications) {
		pages.push({
			url: getSolutionHref(app.slug),
			priority: "0.7",
			freq: "monthly",
		});
	}
	for (const article of getPublishedInsightArticles()) {
		pages.push({
			url: `/insights/${article.slug}/`,
			priority: article.legacyRetained ? "0.45" : "0.5",
			freq: "monthly",
		});
	}

	const urls = pages
		.map(
			(p) =>
				`  <url><loc>${SITE}${p.url}</loc><lastmod>${NOW}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>`,
		)
		.join("\n");
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateRobots() {
	return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /portal/
Disallow: /open-wood-science/
Disallow: /data/
Disallow: /sw.js
Disallow: /offline.html
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
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE}/sitemap.xml`;
}

function markdownLink(label, url) {
	const safeLabel = String(label || "")
		.replace(/\\/g, "\\\\")
		.replace(/\[/g, "\\[")
		.replace(/\]/g, "\\]");
	return `[${safeLabel}](${url})`;
}

function generateLlmsTxt() {
	const guideLines = GUIDE_INDEX.map(
		(category) => `- ${markdownLink(category, `${SITE}/insights/`)}`,
	).join("\n");
	return `# Moldart

## Canonical Identity
- Legal name: ${LEGAL_NAME}
- Related profile: ${RELATED_PROFILE}
- Website: ${markdownLink("moldartindia.com", `${SITE}/`)}
- Email: ${markdownLink("info@moldartindia.com", "mailto:info@moldartindia.com")}
- WhatsApp: ${markdownLink(WHATSAPP_PRIMARY.display, whatsappHref(WHATSAPP_PRIMARY.number))}
- Base: ${COMPANY_ADDRESS}
- Positioning: ${BRAND_LINE}

## Primary Pages
- ${markdownLink("Home", `${SITE}/`)}
- ${markdownLink("Solutions", `${SITE}/solutions/`)}
- ${markdownLink("Products", `${SITE}/products/`)}
- ${markdownLink("Resources", `${SITE}/resources/`)}
- ${markdownLink("Insights", `${SITE}/insights/`)}
- ${markdownLink("Contact", `${SITE}/contact/`)}
- ${markdownLink("About", `${SITE}/about/`)}
- ${markdownLink("Privacy Notice", `${SITE}/privacy/`)}
- ${markdownLink("Website Terms", `${SITE}/terms/`)}

## Key Topics
- Solution systems and product stacks
- Product sheets and technical references
- Technical library decision sheets for RFQs, approvals, receiving, documents, and defects
- Downloadable catalogues, finish decks, and PDFs

## Technical Library Index
${guideLines}
`;
}

function generateLlmsFullTxt() {
	const productLines = Object.keys(productMeta)
		.map(
			(pid) =>
				`- ${markdownLink(getProduct(pid)?.name, `${SITE}/products/${productMeta[pid].slug}/`)}`,
		)
		.join("\n");
	const solutionLines = applications
		.map((app) => `- ${markdownLink(app.name, `${SITE}${getSolutionHref(app.slug)}`)}`)
		.join("\n");
	const insightLines = getPublishedInsightArticles()
		.map(
			(article) =>
				`- ${markdownLink(article.title, `${SITE}/insights/${article.slug}/`)}`,
		)
		.join("\n");
	return `# Moldart Full Index

## Canonical Identity
- Legal name: ${LEGAL_NAME}
- Related profile: ${RELATED_PROFILE}
- Website: ${markdownLink("moldartindia.com", `${SITE}/`)}
- Email: ${markdownLink("info@moldartindia.com", "mailto:info@moldartindia.com")}
- WhatsApp primary: ${markdownLink(WHATSAPP_PRIMARY.display, whatsappHref(WHATSAPP_PRIMARY.number))}
- WhatsApp secondary: ${markdownLink(WHATSAPP_SECONDARY.display, whatsappHref(WHATSAPP_SECONDARY.number))}
- Base: ${COMPANY_ADDRESS}
- Positioning: ${BRAND_LINE}

## Pages
- ${markdownLink("Home", `${SITE}/`)}
- ${markdownLink("Solutions", `${SITE}/solutions/`)}
- ${markdownLink("Products", `${SITE}/products/`)}
- ${markdownLink("Resources", `${SITE}/resources/`)}
- ${markdownLink("Insights", `${SITE}/insights/`)}
- ${markdownLink("Contact", `${SITE}/contact/`)}
- ${markdownLink("About", `${SITE}/about/`)}
- ${markdownLink("Privacy Notice", `${SITE}/privacy/`)}
- ${markdownLink("Website Terms", `${SITE}/terms/`)}

## Solutions
${solutionLines}

## Products
${productLines}

## Technical Library
${insightLines}
`;
}

const LEGACY_INSIGHT_REDIRECT_TARGETS = {
	"custom-furniture-applications": "/insights/custom-furniture-brief-guide/",
	"custom-furniture-buyers-guide": "/insights/custom-furniture-brief-guide/",
	"custom-furniture-comparison": "/insights/custom-furniture-brief-guide/",
	"custom-furniture-guide": "/insights/custom-furniture-brief-guide/",
	"custom-furniture-quality": "/insights/custom-furniture-brief-guide/",
	"custom-furniture-specifications": "/insights/custom-furniture-brief-guide/",
	"decor-paper-applications": "/products/printed-decor-paper/",
	"decor-paper-buyers-guide": "/products/printed-decor-paper/",
	"decor-paper-comparison": "/products/printed-decor-paper/",
	"decor-paper-guide": "/products/printed-decor-paper/",
	"decor-paper-quality": "/products/printed-decor-paper/",
	"decor-paper-specifications": "/products/printed-decor-paper/",
	"decorative-panels-applications": "/products/decorative-ss-panels/",
	"decorative-panels-buyers-guide": "/products/decorative-ss-panels/",
	"decorative-panels-comparison": "/products/decorative-ss-panels/",
	"decorative-panels-guide": "/products/decorative-ss-panels/",
	"decorative-panels-quality": "/products/decorative-ss-panels/",
	"decorative-panels-specifications": "/products/decorative-ss-panels/",
	"engraved-cylinders-applications": "/products/printed-decor-paper/",
	"engraved-cylinders-buyers-guide": "/insights/engraved-cylinders-repeat-accuracy-guide/",
	"engraved-cylinders-comparison": "/insights/engraved-cylinders-repeat-accuracy-guide/",
	"engraved-cylinders-guide": "/insights/engraved-cylinders-repeat-accuracy-guide/",
	"engraved-cylinders-quality": "/insights/engraved-cylinders-repeat-accuracy-guide/",
	"engraved-cylinders-specifications": "/products/printed-decor-paper/",
	"fiberboard-applications": "/products/fiberboard/",
	"fiberboard-buyers-guide": "/insights/mdf-vs-hdf-surface-readiness-guide/",
	"fiberboard-comparison": "/insights/mdf-vs-hdf-surface-readiness-guide/",
	"fiberboard-guide": "/products/fiberboard/",
	"fiberboard-quality": "/products/fiberboard/",
	"fiberboard-specifications": "/products/fiberboard/",
	"flooring-accessories-applications": "/products/wood-flooring/",
	"flooring-accessories-buyers-guide": "/products/wood-flooring/",
	"flooring-accessories-comparison": "/products/wood-flooring/",
	"flooring-accessories-guide": "/products/wood-flooring/",
	"flooring-accessories-quality": "/products/wood-flooring/",
	"flooring-accessories-specifications": "/products/wood-flooring/",
	"industrial-press-plates-applications": "/products/industrial-press-plates/",
	"industrial-press-plates-buyers-guide": "/insights/industrial-press-plates-quality-priorities/",
	"industrial-press-plates-comparison": "/insights/standard-vs-industrial-press-plates/",
	"industrial-press-plates-guide": "/insights/industrial-press-plates-quality-priorities/",
	"industrial-press-plates-quality": "/insights/industrial-press-plates-quality-priorities/",
	"industrial-press-plates-specifications": "/products/industrial-press-plates/",
	"osb-applications": "/products/osb/",
	"osb-buyers-guide": "/insights/osb-application-fit-guide/",
	"osb-comparison": "/insights/osb-application-fit-guide/",
	"osb-guide": "/products/osb/",
	"osb-quality": "/products/osb/",
	"osb-specifications": "/products/osb/",
	"particleboard-applications": "/products/particleboard/",
	"particleboard-comparison": "/insights/particleboard-buyers-guide/",
	"particleboard-guide": "/insights/particleboard-buyers-guide/",
	"particleboard-quality": "/products/particleboard/",
	"particleboard-specifications": "/products/particleboard/",
	"plywood-applications": "/products/plywood/",
	"plywood-buyers-guide": "/insights/plywood-vs-fiberboard-substrate-guide/",
	"plywood-comparison": "/insights/plywood-vs-fiberboard-substrate-guide/",
	"plywood-guide": "/products/plywood/",
	"plywood-quality": "/products/plywood/",
	"plywood-specifications": "/products/plywood/",
	"press-pads-applications": "/products/press-pads/",
	"press-pads-buyers-guide": "/insights/press-pads-quality-replacement-checks/",
	"press-pads-comparison": "/insights/press-pads-heat-pressure-note/",
	"press-pads-guide": "/insights/press-pads-heat-pressure-note/",
	"press-pads-quality": "/insights/press-pads-quality-replacement-checks/",
	"press-pads-specifications": "/products/press-pads/",
	"press-plates-applications": "/products/press-plates/",
	"press-plates-buyers-guide": "/insights/press-plates-replacement-programme-guide/",
	"press-plates-comparison": "/insights/standard-vs-industrial-press-plates/",
	"press-plates-guide": "/insights/press-plates-panel-quality-guide/",
	"press-plates-quality": "/insights/press-plates-panel-quality-guide/",
	"press-plates-specifications": "/products/press-plates/",
	"ready-made-furniture-applications": "/insights/ready-made-furniture-procurement-guide/",
	"ready-made-furniture-buyers-guide": "/insights/ready-made-furniture-procurement-guide/",
	"ready-made-furniture-comparison": "/insights/ready-made-furniture-procurement-guide/",
	"ready-made-furniture-guide": "/insights/ready-made-furniture-procurement-guide/",
	"ready-made-furniture-quality": "/insights/ready-made-furniture-procurement-guide/",
	"ready-made-furniture-specifications": "/insights/ready-made-furniture-procurement-guide/",
	"ss-furniture-applications": "/solutions/architecture/",
	"ss-furniture-buyers-guide": "/solutions/architecture/",
	"ss-furniture-comparison": "/solutions/architecture/",
	"ss-furniture-guide": "/solutions/architecture/",
	"ss-furniture-quality": "/solutions/architecture/",
	"ss-furniture-specifications": "/solutions/architecture/",
	"ss-profiles-applications": "/products/ss-profiles/",
	"ss-profiles-buyers-guide": "/insights/ss-profiles-application-guide/",
	"ss-profiles-comparison": "/insights/ss-profiles-application-guide/",
	"ss-profiles-guide": "/products/ss-profiles/",
	"ss-profiles-quality": "/products/ss-profiles/",
	"ss-profiles-specifications": "/products/ss-profiles/",
	"wood-flooring-applications": "/products/wood-flooring/",
	"wood-flooring-buyers-guide": "/insights/engineered-flooring-selection-guide/",
	"wood-flooring-comparison": "/insights/engineered-flooring-selection-guide/",
	"wood-flooring-guide": "/products/wood-flooring/",
	"wood-flooring-quality": "/products/wood-flooring/",
	"wood-flooring-specifications": "/insights/engineered-flooring-selection-guide/",
};

function getLegacyInsightRedirectRules() {
	return Object.keys(LEGACY_INSIGHT_REDIRECT_TARGETS)
		.flatMap((slug) => {
			const target = LEGACY_INSIGHT_REDIRECT_TARGETS[slug];
			return [
				`/insights/${slug} ${target} 301`,
				`/insights/${slug}/ ${target} 301`,
			];
		})
		.sort();
}

function generateRedirects() {
	const legacyInsightRedirects = getLegacyInsightRedirectRules().join("\n");
	const immutablePdfCommit = "3c7f0ea885d0801d6155177fb668e45f6f73963e";
	const externalPdfRedirects = [
		"ANTIQUE.pdf",
		"DIVIDER.pdf",
		"HEAT PRINTED.pdf",
		"HPL - OL - 1.pdf",
		"HPL - OL - 2.pdf",
		"HPL - OL - 3.pdf",
		"INTRODUCTION TO MOLDART.pdf",
		"LPL - GB - 02.pdf",
		"LPL - PET BOARD.pdf",
		"MOSAIC.pdf",
		"PRESS PLATE - BASIC COLLECTION.pdf",
		"PRESS PLATE - SHUTTERING PLYWOOD.pdf",
		"PROFILE.pdf",
		"STAMPED.pdf",
		"WOOD - DOOR.pdf",
		"WOOD - FLOORING.pdf",
		"WOOD - FURNITURE - 1.pdf",
		"WOOD - FURNITURE - 2.pdf",
	]
		.map((name) => {
			const encoded = encodeURIComponent(name).replace(/%2F/gi, "/");
			return `/downloads/${encoded} https://media.githubusercontent.com/media/thisisyashdoshi/moldart-home/${immutablePdfCommit}/downloads/${encoded} 302`;
		})
		.join("\n");
	return `/index.html               /                         301
/about.html               /about/                   301
/industry.html            /industry/                301
/contact.html             /contact/                 301
/login.html               /contact/?intent=portal-access 301
/portal.html              /contact/?intent=portal-access 301
/about                    /about/                   301
/industry                 /solutions/               301
/industry/                /solutions/               301
/contact                  /contact/                 301
/login                    /contact/?intent=portal-access 301
/portal                   /contact/?intent=portal-access 302
/portal/                  /contact/?intent=portal-access 302
/portal/*                 /contact/?intent=portal-access 302
/explore                  /explore/                 301
/solutions                /solutions/               301
/products                 /products/                301
/applications             /solutions/               301
/applications/            /solutions/               301
/applications/*           /solutions/:splat/        301
/resources                /resources/               301
/evidence-qc              /evidence-qc/             301
/faq                      /faq/                     301
/process                  /process/                 301
/products/engraved-cylinders        /products/printed-decor-paper/ 301
/products/engraved-cylinders/       /products/printed-decor-paper/ 301
/products/flooring-accessories      /products/wood-flooring/ 301
/products/flooring-accessories/     /products/wood-flooring/ 301
/products/custom-furniture          /solutions/furniture/ 301
/products/custom-furniture/         /solutions/furniture/ 301
/products/ready-made-furniture      /solutions/furniture/ 301
/products/ready-made-furniture/     /solutions/furniture/ 301
/products/ss-furniture              /solutions/architecture/ 301
/products/ss-furniture/             /solutions/architecture/ 301
/open-wood-science        /resources/               301
/open-wood-science/       /resources/               301
/open-wood-science/*      /resources/               301
${legacyInsightRedirects}
${externalPdfRedirects}
/insights                 /insights/                301
/*                        /404.html                 404`;
}

function renderTechnicalLibraryDownloadText(item) {
	return `${item.title}
Moldart buyer checklist

Applies to: ${item.appliesTo}

Use this checklist to prepare a cleaner RFQ, approval pack, receiving check, or dispatch review. Confirm exact values from supplier test report, approved sample, or buyer project requirement.

Checklist
${item.rows.map((row) => `- ${row}`).join("\n")}

RFQ CTA
${TECHNICAL_LIBRARY_CTA}
`;
}

function youtubeCoverageReport() {
	const publishedInsightSlugs = new Set(
		(rawInsights.articles || []).map((article) => article.slug).filter(Boolean),
	);
	const knownProductIds = new Set((rawProducts.products || []).map((item) => item.id));
	const mappedInsightSlugs = new Set();
	const videoRows = youtubeLibrary.items.map((item) => {
		const requestedInsightSlugs = [
			...(item.primaryInsightSlugs || []),
			...(item.secondaryInsightSlugs || []),
		];
		const validInsightSlugs = requestedInsightSlugs.filter((slug) =>
			publishedInsightSlugs.has(slug),
		);
		const genericBrandVideo = /corporate overview|integrated precision/i.test(
			`${item.title || ""} ${item.topic || ""}`,
		);
		for (const slug of (item.primaryInsightSlugs || []).filter((slug) =>
			publishedInsightSlugs.has(slug),
		)) {
			if (!genericBrandVideo) mappedInsightSlugs.add(slug);
		}
		const validProductIds = (item.productIds || []).filter((id) =>
			knownProductIds.has(id),
		);
		return {
			id: item.id,
			type: item.type,
			title: item.title,
			url: item.url,
			topic: item.topic,
			contentAction: item.contentAction || "attach-existing",
			recommendedInsight: item.recommendedInsight || null,
			validInsightSlugs,
			missingInsightSlugs: requestedInsightSlugs.filter(
				(slug) => !publishedInsightSlugs.has(slug),
			),
			validProductIds,
			missingProductIds: (item.productIds || []).filter(
				(id) => !knownProductIds.has(id),
			),
		};
	});
	const selectedInsightMedia = (rawInsights.articles || []).map((article) => {
		const selectedVideo = bestVideoForInsight(article);
		const image = insightPreviewImageRaw(article);
		return {
			slug: article.slug,
			title: article.title,
			category: article.categoryLabel || article.category || "Technical Library",
			url: `${SITE}/insights/${article.slug}/`,
			image,
			imageSource: "deterministic-poster",
			mediaStatus: insightMediaStatus(article).code,
			selectedVideo: selectedVideo
				? {
						id: selectedVideo.id,
						type: selectedVideo.type,
						title: selectedVideo.title,
						url: selectedVideo.url,
						topic: selectedVideo.topic,
					}
				: null,
		};
	});
	const insightsWithoutVideo = selectedInsightMedia
		.filter((item) => !item.selectedVideo)
		.map(({ slug, title, category, url }) => ({ slug, title, category, url }));
	const insightsWithoutImage = selectedInsightMedia
		.filter((item) => !item.image)
		.map(({ slug, title, category, url }) => ({ slug, title, category, url }));
	const videosNeedingNewInsight = videoRows.filter((row) =>
		["new-insight-recommended", "brand-route-only"].includes(row.contentAction),
	);
	return {
		generatedAt: NOW,
		channel: youtubeLibrary.channel,
		counts: {
			publicVideos: youtubeLibrary.items.length,
			longForm: youtubeLibrary.items.filter((item) => item.type === "video").length,
			shorts: youtubeLibrary.items.filter((item) => item.type === "short").length,
			publishedInsights: rawInsights.articles.length,
			directlyMappedInsights: mappedInsightSlugs.size,
			insightsWithVideo: selectedInsightMedia.filter((item) => item.selectedVideo).length,
			insightsWithoutVideo: insightsWithoutVideo.length,
			insightsWithImage: selectedInsightMedia.filter((item) => item.image).length,
			insightsWithoutImage: insightsWithoutImage.length,
			insightsWithEditorialImage: selectedInsightMedia.filter(
				(item) => item.imageSource === "editorial",
			).length,
			videosNeedingNewInsight: videosNeedingNewInsight.length,
		},
		videoRows,
		selectedInsightMedia,
		videosNeedingNewInsight,
		insightsWithoutVideo,
		insightsWithoutImage,
		recommendedNewInsights: youtubeLibrary.recommendedNewInsights || [],
		recommendedNewVideos: youtubeLibrary.recommendedNewVideos || [],
	};
}

function renderYoutubeCoverageMarkdown(report) {
	const missingVideoLines = report.insightsWithoutVideo
		.map((item) => `- [${item.title}](${item.url}) — ${item.category}`)
		.join("\n");
	const missingImageLines = report.insightsWithoutImage
		.map((item) => `- [${item.title}](${item.url}) — ${item.category}`)
		.join("\n");
	const newInsightLines = report.recommendedNewInsights
		.map((item) => `- ${item.title}: ${item.reason}`)
		.join("\n");
	const newVideoLines = report.recommendedNewVideos
		.map(
			(item) =>
				`- ${item.title} (${item.priority}): ${item.insightSlugs.join(", ")}`,
		)
		.join("\n");
	const videoGapLines = report.videosNeedingNewInsight
		.map(
			(item) =>
				`- ${item.title}: ${item.recommendedInsight || "Create a tighter matching article."}`,
		)
		.join("\n");
	return `# Moldart YouTube / Technical Library Coverage Report

Generated: ${report.generatedAt}

## Counts

- Public videos mapped: ${report.counts.publicVideos}
- Long-form videos: ${report.counts.longForm}
- Shorts: ${report.counts.shorts}
- Published insights checked: ${report.counts.publishedInsights}
- Directly mapped insights: ${report.counts.directlyMappedInsights}
- Insights with video coverage: ${report.counts.insightsWithVideo}
- Insights without video coverage: ${report.counts.insightsWithoutVideo}
- Insights with image coverage: ${report.counts.insightsWithImage}
- Insights without image coverage: ${report.counts.insightsWithoutImage}
- Insights using imported editorial images: ${report.counts.insightsWithEditorialImage}
- Videos recommending a new insight: ${report.counts.videosNeedingNewInsight}

## Videos That Need A Tighter Insight

${videoGapLines || "- None"}

## Recommended New Insights

${newInsightLines || "- None"}

## Recommended New Videos For Uncovered Insight Clusters

${newVideoLines || "- None"}

## Published Insights Without Video Coverage

${missingVideoLines || "- None"}

## Published Insights Without Image Coverage

${missingImageLines || "- None"}
`;
}

function renderInsightMediaCoverageMarkdown(report) {
	const rows = report.selectedInsightMedia
		.map(
			(item) =>
				`- [${item.title}](${item.url}) — image: ${item.image || "missing"} (${item.imageSource}); video: ${item.selectedVideo ? item.selectedVideo.title : "missing"}`,
		)
		.join("\n");
	return `# Moldart Insight Media Coverage

Generated: ${report.generatedAt}

Every published insight renders one labelled lead image. A YouTube card appears only when a directly mapped, article-specific video is available.

## Counts

- Published insights checked: ${report.counts.publishedInsights}
- Insights with image coverage: ${report.counts.insightsWithImage}
- Insights without image coverage: ${report.counts.insightsWithoutImage}
- Insights with directly mapped video coverage: ${report.counts.insightsWithVideo}
- Insights awaiting an article-specific video: ${report.counts.insightsWithoutVideo}

## Selected Media By Insight

${rows}
`;
}

function writeYoutubeIntegrationReports() {
	const report = youtubeCoverageReport();
	writeFile(
		path.join(WORK, "youtube-insight-integration-report.generated.json"),
		JSON.stringify(report, null, 2),
	);
	writeFile(
		path.join(WORK, "youtube-insight-integration-report.generated.md"),
		renderYoutubeCoverageMarkdown(report),
	);
	writeFile(
		path.join(WORK, "insight-media-coverage.generated.json"),
		JSON.stringify(
			{
				generatedAt: report.generatedAt,
				counts: report.counts,
				selectedInsightMedia: report.selectedInsightMedia,
			},
			null,
			2,
		),
	);
	writeFile(
		path.join(WORK, "insight-media-coverage.generated.md"),
		renderInsightMediaCoverageMarkdown(report),
	);
}

function writeTechnicalLibraryDownloads() {
	for (const item of technicalLibraryDownloads) {
		writeFile(
			path.join(WORK, "downloads/checklists", item.filename),
			renderTechnicalLibraryDownloadText(item),
		);
	}
	writeFile(
		path.join(WORK, "technical-library-audit.generated.json"),
		JSON.stringify(
			{
				...technicalLibraryAudit,
				generatedAt: NOW,
				publishedInsightCount: rawInsights.articles.length,
				draftInsightCount: technicalLibraryDrafts.length,
			},
			null,
			2,
		),
	);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
	console.log("=== Moldart Page Generator ===\n");

	console.log("Generating social preview assets...");
	await generateSiteSocialAssets();
	await generateInsightPosterAssets();

	console.log("\nGenerating core pages...");
	writeFile(path.join(WORK, "index.html"), generateHomepage());
	writeFile(path.join(WORK, "explore/index.html"), generateExplorePage());
	writeFile(path.join(WORK, "about/index.html"), generateAboutPage());
	writeFile(path.join(WORK, "contact/index.html"), generateContactPage());
	writeFile(path.join(WORK, "evidence-qc/index.html"), generateEvidencePage());
	writeFile(path.join(WORK, "privacy/index.html"), generatePrivacyPage());
	writeFile(path.join(WORK, "terms/index.html"), generateTermsPage());
	// Portal and login stubs are handled by server-side redirects in _redirects
	writeFile(path.join(WORK, "404.html"), generate404());

	console.log("\nGenerating solution pages...");
	writeFile(path.join(WORK, "solutions/index.html"), generateSolutionsHub());
	for (const app of applications) {
		writeFile(
			path.join(WORK, `solutions/${app.slug}/index.html`),
			generateSolutionPage(app),
		);
	}

	console.log("\nGenerating product pages...");
	writeFile(path.join(WORK, "products/index.html"), generateProductsHub());
	for (const pid of Object.keys(productMeta)) {
		const m = productMeta[pid];
		writeFile(
			path.join(WORK, `products/${m.slug}/index.html`),
			generateProductPage(pid),
		);
	}

	// Legacy applications redirects are handled by server-side redirects in _redirects

	// Utility pages
	writeFile(path.join(WORK, "resources/index.html"), generateResourcesPage());
	writeFile(path.join(WORK, "faq/index.html"), generateFAQPage());
	writeFile(path.join(WORK, "process/index.html"), generateProcessPage());

	console.log("\nGenerating technical-library downloads...");
	writeTechnicalLibraryDownloads();
	writeYoutubeIntegrationReports();

	console.log("\nGenerating insights pages...");
	writeFile(path.join(WORK, "insights/index.html"), generateInsightsHub());
	for (const article of rawInsights.articles) {
		writeFile(
			path.join(WORK, `insights/${article.slug}/index.html`),
			generateInsightArticle(article),
		);
	}
	const currentInsightSlugs = getInsightSlugs();
	const retainedInsightSlugs = new Set(
		getRetainedLegacyInsightArticles().map((article) => article.slug),
	);
	const insightsDir = path.join(WORK, "insights");
	if (fs.existsSync(insightsDir)) {
		for (const entry of fs.readdirSync(insightsDir, { withFileTypes: true })) {
			if (!entry.isDirectory() || currentInsightSlugs.has(entry.name)) continue;
			const insightFile = path.join(insightsDir, entry.name, "index.html");
			if (retainedInsightSlugs.has(entry.name)) {
				repairRetainedLegacyInsightFile(insightFile);
				continue;
			}
			// Legacy insight stubs are handled by server-side redirects in _redirects
		}
	}

	// Industry redirect is handled by server-side redirects in _redirects

	console.log("\nGenerating search index...");
	writeFile(
		path.join(WORK, "data/search-index.json"),
		JSON.stringify(getSearchEntries()),
	);

	console.log("\nGenerating config files...");
	writeFile(path.join(WORK, "sitemap.xml"), generateSitemap());
	writeFile(path.join(WORK, "robots.txt"), generateRobots());
	writeFile(path.join(WORK, "llms.txt"), generateLlmsTxt());
	writeFile(path.join(WORK, "llms-full.txt"), generateLlmsFullTxt());
	writeFile(
		path.join(WORK, "build.json"),
		JSON.stringify(
			{
				version: VER,
				generatedAt: new Date().toISOString(),
				git: {
					sha: BUILD_GIT_SHA,
					branch: BUILD_GIT_BRANCH,
				},
				site: SITE,
				generator: "moldart-static-generator",
			},
			null,
			2,
		),
	);
	writeFile(path.join(WORK, "_redirects"), generateRedirects());

	const totalPages =
		16 +
		(1 + applications.length) +
		(1 + Object.keys(productMeta).length) +
		(1 + applications.length) +
		3 +
		1 +
		1 +
		getPublishedInsightArticles().length;
	console.log(`\n=== Generated ${totalPages} pages ===`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
