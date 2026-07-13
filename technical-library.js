"use strict";

// Dates are intentionally absent until a verifiable publication or technical-review record exists.
const ARTICLE_DATE = null;
const AUTHOR = "Moldart Technical Team";
const CTA =
	"Share product, application, size, finish/design, quantity, destination, incoterm, and document/sample requirements for review.";

const GUIDE_INDEX = [
	"RFQ & Sourcing Control",
	"Decorative Stainless Steel",
	"Lamination Tooling",
	"Printed Decor Paper & Cylinders",
	"Panel Systems",
	"Decorative Surfaces",
	"Flooring Systems",
	"Furniture Programmes",
	"Formwork / Shuttering",
	"Industrial Tooling",
];

const TAGS = {
	grade: "Grade selection",
	finish: "Finish approval",
	receiving: "Receiving checklist",
	rfq: "RFQ checklist",
	defect: "Defect troubleshooting",
	sample: "Sample approval",
	document: "Document check",
	cost: "Cost per use",
	site: "Site readiness",
	dispatch: "Dispatch control",
};

const PRODUCTS = {
	"press-plates": { title: "Press Plates", href: "/products/press-plates/" },
	"press-pads": { title: "Press Pads", href: "/products/press-pads/" },
	"engraved-cylinders": {
		title: "Engraved Cylinders",
		href: "/products/engraved-cylinders/",
	},
	"decor-paper": {
		title: "Printed Decor Paper",
		href: "/products/printed-decor-paper/",
	},
	plywood: { title: "Plywood", href: "/products/plywood/" },
	fiberboard: { title: "MDF / HDF Fiberboard", href: "/products/fiberboard/" },
	osb: { title: "OSB", href: "/products/osb/" },
	particleboard: {
		title: "Particleboard",
		href: "/products/particleboard/",
	},
	"wood-flooring": {
		title: "Laminate Flooring Systems",
		href: "/products/wood-flooring/",
	},
	"flooring-accessories": {
		title: "Flooring Accessories",
		href: "/products/flooring-accessories/",
	},
	"ready-made-furniture": {
		title: "Ready-Made Furniture",
		href: "/products/ready-made-furniture/",
	},
	"custom-furniture": {
		title: "Custom Furniture",
		href: "/products/custom-furniture/",
	},
	"decorative-panels": {
		title: "Decorative Stainless Steel Panels",
		href: "/products/decorative-ss-panels/",
	},
	"ss-profiles": {
		title: "Stainless Steel Profiles",
		href: "/products/ss-profiles/",
	},
	"ss-furniture": {
		title: "Stainless Steel Furniture",
		href: "/products/ss-furniture/",
	},
	"industrial-press-plates": {
		title: "Industrial Press Plates",
		href: "/products/industrial-press-plates/",
	},
};

const APPLICATIONS = {
	lamination: { title: "Lamination", href: "/solutions/lamination/" },
	furniture: { title: "Furniture Manufacturing", href: "/solutions/furniture/" },
	flooring: { title: "Flooring", href: "/solutions/flooring/" },
	architecture: {
		title: "Architecture & Interiors",
		href: "/solutions/architecture/",
	},
	"metal-finishing": {
		title: "Metal Finishing",
		href: "/solutions/metal-finishing/",
	},
	"pcb-ccl": { title: "PCB & CCL Manufacturing", href: "/solutions/pcb-ccl/" },
};

const PROFILES = {
	steel: {
		category: "decorative-panels",
		section: "Decorative Stainless Steel",
		application: "metal-finishing",
		apps: [
			["Dry interior wall or lobby panel", "SS 201 or SS 304 with approved finish sample", "Medium", "Keep grade, finish direction, PVC film, and packing tied together."],
			["Humid, coastal, or public touch zone", "Review SS 304 or SS 316 with AFP/PVD limits confirmed", "High", "Confirm from supplier test report / approved sample / buyer's project requirement."],
			["Elevator, hospitality, or retail feature", "Sample-led panel plus matching profile route", "High", "Approve colour, reflection, and cleaning method before quantity."],
		],
		specs: [
			["Grade", "201 / 304 / 316 / 430 as applicable", "Grade changes corrosion and service expectation.", "MTC or supplier material declaration"],
			["Finish", "Hairline, No.4, mirror, etch, bead blast, PVD, or AFP", "Finish affects scratch visibility, reflection, and cleaning.", "Surface/finish sample"],
			["Protection", "PVC film, interleaving, corner and crate logic", "Decorative sheets are damaged more by handling than by quoting.", "Packing photos"],
		],
		docs: ["MTC", "surface/finish sample", "packing list", "product photos", "packing photos"],
		risks: [
			["Rust staining after installation", "Grade/environment mismatch or cleaning residue", "Check grade, environment, cleaner, and sample route", "Hold if grade or environment was not disclosed"],
			["Visible direction mismatch", "Hairline or No.4 direction not locked", "Compare sheet and profile direction under site light", "Hold mixed-direction packs"],
			["Scratches on receipt", "Weak film, interleaving, or handling", "Inspect before film removal where possible", "Photograph and hold affected packs"],
		],
		visual: "Finish map: grade -> finish family -> protection film -> sample approval -> receiving check.",
	},
	lamination: {
		category: "press-plates",
		section: "Lamination Tooling",
		application: "lamination",
		apps: [
			["Decorative laminate panel output", "Review plate, pad, paper, resin, substrate, temperature, pressure, and time together", "High", "Surface defects usually need stack-level diagnosis."],
			["Replacement tooling order", "Match old code, size, texture, chrome route, line condition, and approved board", "Medium", "Do not reorder from pattern name alone."],
			["Running-line troubleshooting", "Use defect map before naming the failed layer", "High", "Repeat, width-led, and edge-led defects point to different checks."],
		],
		specs: [
			["Working surface", "Texture, gloss, chrome condition, roughness if required", "This is what transfers into the board surface.", "Approved board sample or retained plate/sample"],
			["Stack condition", "Plate, pad, paper, resin, substrate moisture, temperature, pressure, time", "The route fails when one layer is reviewed alone.", "Line note or process requirement"],
			["Replacement trigger", "Cycles, visible wear, gloss drift, shrinkage, or defect history", "Timing prevents emergency reorders.", "Maintenance note or replacement log"],
		],
		docs: ["TDS", "test report", "surface/finish sample", "retained sample", "maintenance note", "packing photos"],
		risks: [
			["Dots, white spots, or pinholes", "Contamination, chrome wear, paper/resin issue, or local pressure loss", "Map if random, repeating, edge-led, or width-led", "Hold line release until cause is separated"],
			["Gloss drift", "Chrome wear, pad ageing, heat/pressure drift, or reference loss", "Compare against retained approved board", "Escalate before repeat order"],
			["Orange peel or uneven texture", "Stack imbalance or surface damage", "Check plate, pad, substrate moisture, and press window", "Hold affected production lot"],
		],
		visual: "Stack diagram: plate -> decor paper/resin -> substrate -> press pad -> heat/pressure/time -> receiving output check.",
	},
	decorPaper: {
		category: "decor-paper",
		section: "Printed Decor Paper & Cylinders",
		application: "lamination",
		apps: [
			["Printed decor paper before impregnation", "Lock design code, GSM, width, roll length, ink route, wet tensile, and master sample", "High", "Approval must survive impregnation and pressing."],
			["Repeat decor batch", "Compare master sample, batch sample, light source, and metamerism", "High", "Use Delta E only when buyer and supplier agree the method."],
			["Cylinder or artwork approval", "Confirm circumference, face length, repeat length, depth, proofing, and start-point mark", "Medium", "Start-point errors become downstream decor complaints."],
		],
		specs: [
			["Design control", "Design code, repeat length, print start point, approved artwork", "Prevents visual drift across batches.", "Master sample and retained sample"],
			["Paper route", "GSM, width, roll length, wet tensile, impregnation route", "Paper must run in the process, not only look correct.", "TDS or supplier test report"],
			["Colour approval", "Light source, batch sample, metamerism check, Delta E if agreed", "Colour changes after impregnation and pressing.", "Surface/finish sample"],
		],
		docs: ["TDS", "test report", "surface/finish sample", "retained sample", "packing list"],
		risks: [
			["Batch shade mismatch", "Weak master-sample control or light-source mismatch", "Compare under agreed light source", "Hold until buyer approves retained sample"],
			["Repeat break or visual jump", "Wrong repeat length or start-point mark", "Check artwork and proofing sample", "Reject if repeat cannot be aligned"],
			["Impregnation handling issue", "Paper strength or moisture mismatch", "Check supplier test report and plant feedback", "Hold rolls until process fit is resolved"],
		],
		visual: "Sample approval route: artwork -> master sample -> batch sample -> impregnation trial -> pressed reference -> retained sample.",
	},
	panel: {
		category: "fiberboard",
		section: "Panel Systems",
		application: "furniture",
		apps: [
			["Modular furniture boards", "Select MDF, HDF, particleboard, plywood, or OSB from use and conversion route", "Medium", "Do not choose from board name alone."],
			["Painted, laminated, or routed components", "Match density, swelling, screw holding, surface sanding, and edge route", "High", "Face readiness and edge behaviour decide rework."],
			["Emission-sensitive destination", "Confirm E1/E0/CARB/TSCA Title VI only where applicable", "High", "EPA TSCA Title VI applies to US-regulated composite wood and finished goods containing them."],
		],
		specs: [
			["Board type", "MDF, HDF, particleboard, plywood, or OSB class", "Each route handles load, edge, moisture, and finish differently.", "TDS"],
			["Performance points", "Density, swelling, internal bond, screw holding, sanding, edge finish", "These decide conversion fit more than brochure photos.", "Supplier test report"],
			["Emission route", "E1, E0, CARB, TSCA Title VI where required", "Destination rules and buyer policy change documents needed.", "Emission report"],
		],
		docs: ["TDS", "emission report", "test report", "surface/finish sample", "packing list"],
		risks: [
			["Edge breakout or weak screw holding", "Wrong board route for hardware or edge banding", "Test fastener and edge on approved sample", "Hold if conversion trial fails"],
			["Swelling or face telegraphing", "Moisture exposure or poor surface readiness", "Check storage, sealing, and finish sample", "Hold release until moisture route is clear"],
			["Document dispute", "Emission route not confirmed before order", "Match destination requirement to supplier documents", "Do not ship until document scope is agreed"],
		],
		visual: "Board route ladder: plywood -> MDF/HDF -> particleboard -> OSB, checked against strength, face, edge, moisture, and document needs.",
	},
	flooring: {
		category: "wood-flooring",
		section: "Flooring Systems",
		application: "flooring",
		apps: [
			["Residential or commercial floor area", "Select wear class, core, click system, underlay, accessories, and site readiness together", "High", "A good board still fails on a weak site handover."],
			["Stairs, junctions, and transitions", "Lock skirting, stair nosing, T-moulding, reducer, and end-cap route", "Medium", "Accessory mismatch makes the system look incomplete."],
			["Dispatch to site", "Confirm subfloor moisture, acclimatisation, wastage, expansion gap, storage, and underlay", "High", "Site condition should be checked before shipment pressure builds."],
		],
		specs: [
			["Floor build", "Wear layer/class, HDF/core route, click system, thickness", "Performance and installation are linked.", "TDS or approved sample"],
			["Accessories", "Skirting, stair nosing, T-moulding, reducers, end caps", "Finishing parts must match the floor and site detail.", "Surface/finish sample"],
			["Site readiness", "Subfloor moisture, storage, underlay, wastage, expansion gap", "Most disputes appear after dispatch, not at quotation.", "Site readiness checklist"],
		],
		docs: ["TDS", "surface/finish sample", "packing list", "maintenance note", "packing photos"],
		risks: [
			["Peaking or gaps", "Moisture, weak acclimatisation, or expansion gap miss", "Check subfloor and installation notes", "Hold installation if site is not ready"],
			["Accessory mismatch", "Accessory order not tied to decor route", "Compare skirting/nosing/reducer with floor sample", "Hold dispatch until matched"],
			["Surface claim after handover", "Wrong wear expectation or maintenance method", "Review traffic and maintenance note", "Escalate with site photos"],
		],
		visual: "Installation flow: site check -> floor sample -> accessory match -> dispatch pack -> storage -> installation -> receiving/handover check.",
	},
	furniture: {
		category: "custom-furniture",
		section: "Furniture Programmes",
		application: "furniture",
		apps: [
			["Custom furniture RFQ", "Lock room/use, dimensions, drawing status, finish, board route, hardware, quantity, packing, destination, and approval pack", "High", "A layout screenshot is not a specification."],
			["Ready-made or KD dispatch", "Confirm carton marking, assembly instruction, hardware count, spare parts, damage tolerance, and photos", "Medium", "Dispatch control prevents receiving disputes."],
			["Post-RFQ sample approval", "Freeze drawing, material route, surface sample, hardware, and retained reference", "High", "Approval must be separate from initial price discovery."],
		],
		specs: [
			["Brief", "Room/use, dimensions, drawings, finish/design, quantity", "Pricing fails when the use case is hidden.", "Drawing or layout reference"],
			["Build route", "Board route, edge banding, hardware, assembly, KD/flat-pack or assembled", "Build choices change packing and site handover.", "Sample/reference and hardware list"],
			["Dispatch pack", "Carton marking, spare parts, instructions, product/packing/loading photos", "Receiving teams need evidence before dispute.", "Packing list and photos"],
		],
		docs: ["surface/finish sample", "retained sample", "packing list", "product photos", "packing photos", "loading photos"],
		risks: [
			["Wrong size or room fit", "Dimensions or drawing revision not frozen", "Check drawing status before quote", "Hold production until revision is signed off"],
			["Missing hardware or spare parts", "Dispatch checklist not tied to carton marking", "Count hardware and spare set before loading", "Hold shipment photo release"],
			["Finish mismatch", "Sample approval skipped or old reference used", "Compare to retained sample", "Hold affected line items"],
		],
		visual: "Approval route: layout intent -> dimension check -> material route -> finish sample -> hardware list -> packing plan -> dispatch photos.",
	},
	formwork: {
		category: "plywood",
		section: "Formwork / Shuttering",
		application: "architecture",
		apps: [
			["Concrete-facing shuttering work", "Compare board build, face film, edge seal, handling, cleaning, oiling, and realistic reuse", "High", "Reuse depends on site discipline, not brochure promise."],
			["Cost-per-use review", "Use first cost divided by accepted uses plus repair and correction cost", "Medium", "Lowest first cost can be expensive after stripping."],
			["Premium finish route", "Use only when smoother concrete face has a project payback", "High", "Keep premium surface separate from generic plywood comparison."],
		],
		specs: [
			["Board route", "Thickness, core build, film/overlay, edge seal, face grade", "Surface and reuse come from the full board route.", "TDS or approved sample"],
			["Site discipline", "Stripping, cleaning, oiling, repair, stacking, storage", "Site handling can erase material advantage.", "Maintenance note"],
			["Cost-per-use", "First cost, expected accepted uses, correction cost, labour impact", "Commercial fit depends on real reuse.", "Buyer project requirement"],
		],
		docs: ["TDS", "surface/finish sample", "packing list", "product photos", "maintenance note"],
		risks: [
			["Low reuse count", "Poor stripping, cleaning, oiling, or edge damage", "Record site handling after each use", "Retire boards that mark concrete"],
			["Concrete face defects", "Face film damage, dirt, or wrong release method", "Inspect before pour and after stripping", "Hold damaged sheets from reuse"],
			["False lifecycle saving", "First cost compared without repair/correction cost", "Calculate cost per accepted use", "Do not approve route without project band"],
		],
		visual: "Cost-per-use table: first cost / accepted uses + repair + correction + handling = practical route cost.",
	},
	industrial: {
		category: "industrial-press-plates",
		section: "Industrial Tooling",
		application: "pcb-ccl",
		apps: [
			["PCB, CCL, or technical laminate pressing", "Confirm flatness, parallelism, roughness, hardness, burr-free edge, and protective packing", "High", "Grade alone is not a tolerance plan."],
			["Incoming inspection", "Check identification, pack condition, surface, flatness, and release status before plant circulation", "High", "Receiving damage can look like supplier failure later."],
			["Decorative route becoming technical", "Move from finish language to tolerance and process language", "Medium", "The route changes when tolerance drives acceptance."],
		],
		specs: [
			["Dimensional control", "Flatness, parallelism, thickness, burr-free edge", "Technical laminate work is less forgiving.", "Test report or buyer inspection record"],
			["Surface control", "Roughness, scratches, protective film, handling marks", "Small surface issues can become process issues.", "Surface photos and receiving record"],
			["Packing and release", "Rigid protection, separation, lifting/handling method", "Accepted plates can be damaged before use.", "Packing photos"],
		],
		docs: ["TDS", "MTC", "test report", "surface/finish sample", "packing photos", "maintenance note"],
		risks: [
			["Flatness or parallelism dispute", "Requirement not stated or checked late", "Measure against agreed buyer method", "Hold before release into production"],
			["Surface scratches", "Handling or packing damage", "Photograph before unprotected handling", "Reject or quarantine affected plate"],
			["Edge damage", "Weak protection or poor lifting", "Check burr-free edge and corner state", "Hold until risk to line is reviewed"],
		],
		visual: "Inspection flow: pack ID -> document match -> surface check -> flatness/parallelism check -> storage method -> production release.",
	},
	sourcing: {
		category: "rfq-sourcing-control",
		section: "RFQ & Sourcing Control",
		application: null,
		apps: [
			["FOB or import-linked RFQ", "Lock product, specification, documents, packing, destination, incoterm, and timeline before price", "High", "Commercial comparison fails when technical and logistics inputs are missing."],
			["Supplier document pack review", "Request TDS, COA, MTC, test report, packing list, HS discussion, and photos only where relevant", "Medium", "Documents should match material and destination, not a generic folder."],
			["Sample approval route", "Use buyer sample, counter sample, production sample, and retained sample as separate gates", "High", "Sample language must survive production and receiving."],
		],
		specs: [
			["RFQ identity", "Product/application, size, finish/design, quantity, destination, incoterm", "Missing inputs create false price comparison.", "RFQ sheet"],
			["Documents", "TDS, COA, MTC, test report, packing list, HS discussion as relevant", "Documents prove the agreed route before dispatch.", "Supplier document pack"],
			["Sample route", "Buyer sample, counter sample, production sample, retained sample", "Approval needs evidence, not only messages.", "Retained sample"],
		],
		docs: ["TDS", "COA", "MTC", "test report", "packing list", "HS discussion", "product photos", "packing photos"],
		risks: [
			["Price-only comparison", "Different specifications hidden behind similar descriptions", "Normalize RFQ inputs before comparison", "Hold decision until like-for-like"],
			["Wrong document expectation", "Document list copied from another material", "Request only relevant proof", "Hold dispatch if required proof is missing"],
			["Sample not tied to production", "Buyer sample and production sample treated as the same gate", "Keep retained sample with order record", "Hold if production sample deviates"],
		],
		visual: "RFQ control flow: requirement -> document scope -> sample gate -> quote basis -> packing proof -> dispatch check.",
	},
	surface: {
		category: "decorative-surfaces",
		section: "Decorative Surfaces",
		application: "lamination",
		apps: [
			["Decorative surface route selection", "Compare HPL, LPL, CPL, veneer, PET, PVC, acrylic, and melamine board by use case", "High", "Surface choice must follow use, substrate, edge, and document needs."],
			["Melamine-faced board / LPL programme", "Lock board core, decor, edge banding, quantity, emission route, and sample", "Medium", "LPL succeeds when board and edge route are controlled."],
			["High-wear or premium visible route", "Review HPL or compact laminate when surface must carry more duty", "High", "ISO 4586 references are anchors, not blanket compliance claims."],
		],
		specs: [
			["Surface route", "HPL, LPL, CPL, veneer, PET, PVC, acrylic, melamine board", "Each route carries different wear, edge, and substrate logic.", "TDS or surface sample"],
			["Substrate and edge", "Board type, thickness, edge banding, adhesive, finish direction", "Surface failure often starts at the edge or substrate.", "Approved sample"],
			["Reference standard", "ISO 4586-3 or ISO 4586-4 only when applicable", "Use standards as reference anchors, not unsupported claims.", "Supplier test report"],
		],
		docs: ["TDS", "test report", "surface/finish sample", "emission report", "retained sample"],
		risks: [
			["Wrong surface for duty", "Decorative route chosen for a high-wear use", "Check use, cleaning, heat, moisture, and impact", "Hold if use case changed"],
			["Edge failure", "Surface and board route not aligned", "Review edge band sample", "Hold until edge route passes trial"],
			["Unsupported compliance claim", "Standard cited without test report", "Ask for applicable supplier proof", "Do not publish claim in buyer pack"],
		],
		visual: "Surface route map: use condition -> substrate -> surface family -> edge route -> sample approval -> document check.",
	},
};

const PROFILE_WORKFLOWS = {
	steel: ["Define environment and use", "Approve grade and finish sample", "Confirm protection and packing", "Inspect before installation release"],
	lamination: ["Map the output or defect", "Confirm the relevant stack inputs", "Approve a retained reference", "Release only after the line check"],
	decorPaper: ["Freeze artwork and repeat reference", "Approve the sample under agreed conditions", "Run the agreed process trial", "Retain the approved production reference"],
	panel: ["Define the component and destination", "Select the board route", "Check the approved sample and documents", "Release against the agreed acceptance basis"],
	flooring: ["Define the floor system and use condition", "Confirm site and accessory requirements", "Approve the sample and installation route", "Dispatch only after site-readiness confirmation"],
	furniture: ["Freeze the brief or drawing revision", "Approve material, hardware, and finish references", "Confirm packing and dispatch evidence", "Release against the approved record"],
	formwork: ["Define the concrete-face and reuse requirement", "Approve the board and handling route", "Track use and condition on site", "Retire or hold damaged sheets"],
	industrial: ["Define tolerance and acceptance method", "Confirm document and packing scope", "Inspect before plant circulation", "Release under the agreed handling controls"],
	sourcing: ["Define the product-specific annex", "Set the commercial and document basis", "Control samples and production references", "Verify packing and receiving evidence"],
	surface: ["Define the use condition and substrate", "Approve the surface and edge reference", "Confirm applicable evidence", "Release only against the approved sample"],
};

const PROFILE_RFQ_INPUTS = {
	steel: { "Use environment": "State interior/exterior, humidity, chloride, touch, cleaning, and fabrication conditions.", "Material and finish": "State grade route, finish direction, coating/film, size, and approved sample.", "Protection": "State interleaving, PVC film, corner protection, crate/pallet, and receiving-photo requirements." },
	lamination: { "Line or application": "State press or conversion route, board output, and the symptom or approval objective.", "Stack reference": "State plate, pad, paper/resin, substrate, and approved board or retained reference.", "Control basis": "State the agreed process, inspection, and release record required for this programme." },
	decorPaper: { "Artwork and repeat": "State design code, repeat, start point, and approved artwork or master sample.", "Paper/process route": "State width, roll, impregnation or proofing context, and the production reference.", "Colour approval": "State viewing condition, batch comparison method, and retained-sample requirement." },
	panel: { "Component and use": "State the component, load, moisture exposure, surface route, and destination.", "Board route": "State board type, thickness, edge/hardware or conversion requirement, and approved sample.", "Evidence": "State only the destination-specific documents and tests that are required for the actual programme." },
	flooring: { "Floor system": "State room/use, board construction, accessory set, and approved finish reference.", "Site condition": "State subfloor, storage, acclimatisation, underlay, expansion, and installation requirements.", "Acceptance basis": "State the product-specific TDS, sample, site-readiness record, and receiving checks required." },
	furniture: { "Brief or drawing": "State room/use, drawing revision, dimensions, quantity, and approval owner.", "Build and finish": "State board, hardware, finish, sample, assembly, and packing route.", "Dispatch evidence": "State carton marking, spares, photos, loading checks, and receiving acceptance basis." },
	formwork: { "Concrete-facing requirement": "State finish target, board route, edge treatment, and site handling conditions.", "Lifecycle basis": "State expected accepted-use basis, cleaning, oiling, repair, storage, and rejection conditions.", "Evidence": "State the approved sample, trial, inspection, and cost-comparison assumptions." },
	industrial: { "Tolerance requirement": "State plate size, support condition, surface requirement, and agreed acceptance method.", "Inspection route": "State document, sampling, measurement, protection, storage, and release requirements.", "Handling": "State lifting, separation, packing, and plant-circulation controls." },
	sourcing: { "Product annex": "State the specific product family and attach only material-relevant technical inputs.", "Commercial basis": "State quantity, named Incoterm place, destination, currency, timeline, and inspection basis.", "Evidence by stage": "Mark each document Required, Conditional, or Not applicable for RFQ, approval, dispatch, and receiving.", "Sample control": "State buyer, counter, production, retained-sample, revision, and approval-owner requirements." },
	surface: { "Use and substrate": "State duty, cleaning/moisture/heat exposure, substrate, edge, and finished component.", "Surface reference": "State the approved finish, visual direction, sample, and acceptance conditions.", "Evidence": "State only the applicable product, emission, test, or approval evidence for the route." },
};

function words(value) {
	return String(value || "")
		.replace(/\s+/g, " ")
		.trim();
}

function clip(value, max = 150) {
	const clean = words(value);
	if (clean.length <= max) return clean;
	return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}...`;
}

function titleTags(spec, profile) {
	const base = [
		...(spec.tags || []),
		profile.section,
		TAGS.rfq,
		TAGS.sample,
		TAGS.document,
	];
	return [...new Set(base)].slice(0, 8);
}

function makeDecision(spec) {
	return `Use this guide when ${spec.intent}`;
}

function buildRelated(spec, profile) {
	const productKey = Object.prototype.hasOwnProperty.call(spec, "relatedProduct")
		? spec.relatedProduct
		: spec.product || spec.category || profile.category;
	const applicationKey = Object.prototype.hasOwnProperty.call(spec, "relatedApplication")
		? spec.relatedApplication
		: spec.application || profile.application;
	const product = productKey ? PRODUCTS[productKey] || null : null;
	const app = applicationKey ? APPLICATIONS[applicationKey] || null : null;
	const articleLinks = (spec.relatedSlugs || [])
		.slice(0, 4)
		.map((slug) => ({ title: slug.replace(/-/g, " "), href: `/insights/${slug}/` }));
	return {
		product,
		application: app,
		articles: articleLinks,
		rfq: { title: "Share an RFQ", href: "/contact/?intent=buyer-rfq" },
	};
}

function documentStatus(spec, doc) {
	if ((spec.requiredDocs || []).includes(doc)) return "Required";
	if ((spec.notApplicableDocs || []).includes(doc)) return "Not applicable";
	return "Conditional";
}

function makeArticle(spec) {
	const profile = PROFILES[spec.profile];
	if (!profile) throw new Error(`Unknown technical library profile: ${spec.profile}`);
	const category = spec.category || spec.product || profile.category;
	const status = spec.status || "published";
	const confirms = spec.confirms || profile.specs.map((row) => row[0]).slice(0, 3);
	const workflow = spec.workflow || PROFILE_WORKFLOWS[spec.profile] || [];
	const rfqInput = spec.rfqInput || PROFILE_RFQ_INPUTS[spec.profile] || {};
	const excerpt =
		spec.excerpt ||
		clip(`Use this guide when ${spec.intent}`, 155);
	const articleApplicationFit = spec.applications || profile.apps || [];
	const articleSpecMatrix = spec.specs || profile.specs || [];
	const articleRiskMap = spec.risks || profile.risks || [];
	return {
		id: spec.slug,
		slug: spec.slug,
		title: spec.title,
		category,
		categoryLabel: spec.section || profile.section,
		tags: titleTags(spec, profile),
		type: spec.type || "Buyer Decision Sheet",
		date: spec.date || ARTICLE_DATE,
		readTime: spec.readTime || "7 min",
		excerpt,
		author: spec.author || AUTHOR,
		technicalReviewer: spec.technicalReviewer || "",
		content: "",
		libraryStatus: status,
		libraryGroup: spec.group || "new",
		buyerIntent: spec.intent,
		seoTitle: clip(spec.seoTitle || `${spec.title} | Moldart Buyer Guide`, 68),
		metaDesc: clip(spec.metaDesc || excerpt, 155),
		technicalLibrary: {
			status,
			publishGate: spec.publishGate || (status === "draft" ? "Evidence and non-duplication review required before publication." : "Retain this URL; confirm programme-specific evidence before using any value as an acceptance criterion."),
			decisionHeadline: spec.decisionHeadline || spec.title,
			buyerDecision: makeDecision(spec),
			scope: spec.scope || `This guide applies only when ${spec.intent}`,
			exclusions: spec.exclusions || "It is buyer guidance, not a product TDS, test report, certificate, or contractual acceptance specification.",
			evidenceStatus: spec.evidenceStatus || "Confirm actual values, documents, test methods, sample/lot scope, and acceptance criteria in the approved programme record.",
			positioning: spec.positioning || "Use the stated buyer decision to determine the next evidence, sample, document, or RFQ action.",
			decisionCards: [
				{ label: "Use when", value: spec.useWhen || spec.intent },
				{ label: "Confirm first", value: spec.confirmFirst || confirms.join("; ") },
			],
			applicationFit: articleApplicationFit,
			specMatrix: articleSpecMatrix,
			visualBlock: {
				type: spec.visualType || "decision flow",
				title: spec.visualTitle || "Decision flow",
				detail: spec.visual || profile.visual,
				steps: spec.visualSteps || workflow,
			},
			approvalWorkflow: workflow,
			defectRisk: articleRiskMap,
			documentChecklist: (spec.docs || profile.docs).map((doc) => [
				doc,
				documentStatus(spec, doc),
				spec.docAppliesTo || PRODUCTS[category]?.title || profile.section,
				"Confirm applicability, issuer, stage, scope, validity, and buyer acceptance before relying on this document.",
			]),
			rfqInput,
			mistakes: spec.mistakes || [],
			related: buildRelated(spec, profile),
			cta: spec.cta || CTA,
			download: spec.download || null,
		},
	};
}

const existingSpecs = [
	{ group: "existing", profile: "furniture", slug: "custom-furniture-brief-guide", title: "Custom Furniture Briefs: Turning Layout Intent into a Usable RFQ", intent: "a custom furniture idea needs room/use, dimensions, drawing status, finish, board route, hardware, quantity, packing, destination, and approval-pack language before pricing.", useWhen: "layout intent exists but the RFQ still needs dimensions, drawings, finish route, board choice, hardware, quantity, packing, destination, and approval pack.", confirmFirst: "room/use, drawing revision, board route, finish sample, hardware list, packing route", relatedSlugs: ["custom-furniture-brief-drawing-sample-guide", "ready-made-furniture-procurement-guide", "particleboard-vs-mdf-vs-plywood-modular-furniture", "what-buyers-should-not-compare-only-by-price"], download: "furniture-dispatch-checklist" },
	{ group: "existing", profile: "furniture", slug: "ready-made-furniture-procurement-guide", title: "Ready-Made Furniture Procurement: What to Lock Before Dispatch", intent: "ready-made or modular furniture is moving toward dispatch and cartons, hardware, spares, damage tolerance, packing photos, and loading photos need to be controlled.", category: "ready-made-furniture", type: "Dispatch Control Checklist", confirmFirst: "carton marking, assembly instruction, hardware count, spare parts, damage tolerance, packing photos, loading photos", relatedSlugs: ["furniture-packing-kd-flat-pack-carton-marking-site-handover", "furniture-hardware-checklist-before-dispatch", "custom-furniture-brief-guide", "buyer-inspection-plan"], download: "furniture-dispatch-checklist" },
	{ group: "existing", profile: "furniture", slug: "custom-furniture-brief-drawing-sample-guide", title: "Custom Furniture Briefs: Drawing, Material Route, and Sample Approval", intent: "the initial furniture RFQ has moved into post-RFQ approval and drawing, material route, surface sample, hardware, and retained reference need to be frozen.", type: "Approval Pack Guide", confirmFirst: "drawing revision, board route, finish sample, hardware reference, retained sample", relatedSlugs: ["custom-furniture-brief-guide", "china-sample-approval-route-buyer-counter-production-sample", "edge-banding-match-board-decor-paper-laminate-furniture-route", "ready-made-furniture-procurement-guide"] },
	{ group: "existing", profile: "steel", slug: "decorative-ss-panel-approval-guide", title: "Decorative Stainless Steel Panel Approval: Grade, Finish, Sample, Environment", intent: "a decorative stainless panel is being approved for dry interior, humid interior, coastal, elevator, hospitality, retail, or public touch-zone use.", type: "Finish Approval Guide", confirmFirst: "dry/humid/coastal environment, touch level, grade, finish, sample, AFP/PVD need", relatedSlugs: ["decorative-stainless-steel-sourcing-note", "decorative-stainless-steel-201-304-316-430", "anti-fingerprint-stainless-steel-use-case-limits-cleaning", "decorative-stainless-steel-packing-receiving-checklist"] },
	{ group: "existing", profile: "steel", slug: "decorative-stainless-steel-sourcing-note", title: "Decorative Stainless Steel: Grades, Finishes, and Sourcing Routes", intent: "grade, finish family, protection, document proof, and commercial route need to be aligned without relying on a supplier-name or brochure-only comparison.", type: "Pillar Guide", confirmFirst: "201/304/316/430 grade ladder, hairline/No.4/mirror/etch/bead blast/PVD/AFP finish map", relatedSlugs: ["decorative-stainless-steel-201-304-316-430", "pvd-stainless-steel-buyer-checklist", "mirror-stainless-steel-scratch-distortion-pvc-film-packing", "ss-profiles-application-guide"] },
	{ group: "existing", profile: "steel", slug: "ss-201-vs-304-panels", title: "SS 201 vs SS 304: Decorative Stainless Steel Panel Selection", intent: "SS 201 and SS 304 are being compared for decorative panels and the buyer needs to separate dry interior cost-sensitive use from humid, coastal, public, or longer-service expectations.", type: "Comparative Analysis", confirmFirst: "dry interior versus humid/coastal/public touch zone, finish route, cleaning method, document need", relatedSlugs: ["decorative-stainless-steel-201-304-316-430", "decorative-ss-panel-approval-guide", "anti-fingerprint-stainless-steel-use-case-limits-cleaning", "decorative-stainless-steel-finish-family-guide"] },
	{ group: "existing", profile: "steel", slug: "ss-profiles-application-guide", title: "Stainless Steel Profiles: Why the Trim Route Should Follow the Panel Route", intent: "U, T, L, channel, skirting, divider, inlay, or edge trim needs to match the panel grade, finish, thickness, direction, and site detail.", category: "ss-profiles", type: "Application Fit Guide", confirmFirst: "profile shape, visible face, panel finish, thickness, direction, fixing method", relatedSlugs: ["decorative-ss-panel-approval-guide", "decorative-stainless-steel-finish-family-guide", "decorative-steel-for-elevators-panels-profiles-grade-finish-protection", "decorative-stainless-steel-packing-receiving-checklist"] },
	{ group: "existing", profile: "steel", slug: "decorative-stainless-steel-finish-family-guide", title: "Decorative Stainless Steel Finish Families: What Buyers Should Compare", intent: "hairline, No.4, mirror, etch, bead blast, PVD, or AFP finishes must be compared by scratch visibility, fingerprint risk, reflection, cleaning, coating fit, and packing sensitivity.", type: "Finish Map", confirmFirst: "scratch visibility, fingerprint risk, reflection, cleaning difficulty, PVD suitability, packing sensitivity", relatedSlugs: ["pvd-stainless-steel-buyer-checklist", "mirror-stainless-steel-scratch-distortion-pvc-film-packing", "matte-bead-blasted-stainless-steel-ra-uniformity-handling", "anti-fingerprint-stainless-steel-use-case-limits-cleaning"] },
	{ group: "existing", profile: "flooring", slug: "engineered-flooring-selection-guide", title: "Laminate Flooring Selection: Construction, Use Class, and System Approval", intent: "an HDF-core laminate flooring system must be selected with its construction, declared use class, locking profile, underlay, accessories, and site-readiness conditions together.", type: "Pillar Guide", confirmFirst: "declared construction, use class, locking profile, underlay, accessory set, site-readiness record", relatedSlugs: ["flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps", "flooring-site-readiness-before-dispatch", "wood-flooring-core-moisture-wear-class-guide", "what-buyers-should-not-compare-only-by-price"], download: "flooring-site-readiness-checklist" },
	{ group: "existing", profile: "flooring", slug: "wood-flooring-core-moisture-wear-class-guide", title: "Laminate Flooring Core, Moisture, and Wear: What Buyers Should Verify", intent: "a laminate flooring dispatch is being considered before the approved core data, site moisture, acclimatisation, storage, expansion, and underlay requirements are settled.", type: "Site Readiness Guide", confirmFirst: "approved core data, subfloor moisture, acclimatisation, storage, expansion allowance, underlay", relatedSlugs: ["flooring-site-readiness-before-dispatch", "engineered-flooring-selection-guide", "flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion"], download: "flooring-site-readiness-checklist" },
	{ group: "existing", profile: "decorPaper", slug: "engraved-cylinders-repeat-accuracy-guide", title: "Engraved Cylinders: Repeat Accuracy, Depth, and Why the Print Start Point Matters", intent: "a decor-print cylinder needs circumference, face length, repeat length, engraving depth, proofing sample, start-point mark, and artwork requirement confirmed before production pressure builds.", category: "engraved-cylinders", type: "Technical Decision Sheet", confirmFirst: "circumference, face length, repeat length, engraving depth, proof sample, start-point mark, artwork file", relatedSlugs: ["engraved-cylinder-approval-decor-paper-printing", "printed-decor-paper-selection-guide", "printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", "printed-decor-paper-batch-repeat-approval-guide"] },
	{ group: "existing", profile: "lamination", slug: "press-pads-heat-pressure-note", title: "Press Pads: Why Heat Transfer and Pressure Equalisation Matter More Than Brochure Claims", intent: "a lamination line is reviewing pad fit and needs heat transfer, pressure equalisation, stack position, and failure symptoms linked to the finished board output.", category: "press-pads", type: "Stack Decision Sheet", confirmFirst: "pad construction, line size, temperature window, pressure balance, visible board symptoms", relatedSlugs: ["press-pad-failure-symptoms-lamination-lines", "press-pads-quality-replacement-checks", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plates-pads-smart-tooling-perfect-panels"], download: "press-pad-replacement-log" },
	{ group: "existing", profile: "lamination", slug: "press-pads-quality-replacement-checks", title: "Press Pads Quality & Replacement Checks for Running Lamination Lines", intent: "a running line needs pad cycles, temperature, visible wear, board symptoms, gloss drift, shrinkage, and replacement trigger recorded before panel output drifts further.", category: "press-pads", type: "Replacement Checklist", confirmFirst: "cycles, temperature, visible wear, board symptoms, gloss drift, shrinkage, replacement trigger", relatedSlugs: ["press-pad-failure-symptoms-lamination-lines", "press-pads-heat-pressure-note", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plate-defect-troubleshooting-guide"], download: "press-pad-replacement-log" },
	{ group: "existing", profile: "lamination", slug: "press-plates-panel-quality-guide", title: "Press Plates and Panel Quality: What Actually Changes the Surface", intent: "dots, scratches, gloss variation, uneven texture, orange peel, pressure marks, contamination, and chrome wear need to be mapped before changing the tooling route.", type: "Pillar Guide", confirmFirst: "defect pattern, plate surface, chrome condition, pad state, press window, retained board sample", relatedSlugs: ["press-plate-defect-troubleshooting-guide", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plate-chrome-condition-guide", "press-plates-replacement-programme-guide"], download: "press-plate-receiving-checklist" },
	{ group: "existing", profile: "lamination", slug: "press-plates-replacement-programme-guide", title: "Press Plates Replacement Programmes: What Buyers Should Lock Before Reordering", intent: "an old plate is being reordered and the buyer needs old plate code, texture, size, chrome route, hardness, press line, approved board sample, and earlier defect notes in one record.", type: "Replacement Programme Guide", confirmFirst: "old plate code, texture, size, chrome route, hardness, press line, approved board sample, earlier defect notes", relatedSlugs: ["press-plate-storage-handling-sop", "press-plate-re-chroming-vs-replacement", "press-plate-hardness-chrome-what-buyers-should-ask", "press-plates-panel-quality-guide"], download: "press-plate-receiving-checklist" },
	{ group: "existing", profile: "decorPaper", slug: "printed-decor-paper-selection-guide", title: "Printed Decor Paper: What to Lock Before Impregnation and Pressing", intent: "decor paper needs GSM, width, roll length, design code, ink route, wet tensile, repeat continuity, and master sample locked before impregnation.", type: "Selection Guide", confirmFirst: "GSM, width, roll length, design code, ink route, wet tensile, repeat continuity, master sample", relatedSlugs: ["printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", "printed-decor-paper-batch-repeat-approval-guide", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "engraved-cylinders-repeat-accuracy-guide"] },
	{ group: "existing", profile: "lamination", slug: "press-plate-chrome-condition-guide", title: "Press Plate Chrome Condition: Why Surface Wear Changes Panel Output", intent: "scratches, pinholes, dullness, edge wear, handling marks, and cleaning marks need to be separated from wider process problems.", type: "Troubleshooting Guide", confirmFirst: "scratches, pinholes, dullness, edge wear, handling marks, cleaning marks, cleaning method", relatedSlugs: ["press-plate-defect-troubleshooting-guide", "press-plates-replacement-programme-guide", "press-plate-storage-handling-sop", "press-plate-re-chroming-vs-replacement"] },
	{ group: "existing", profile: "lamination", slug: "press-plates-pads-smart-tooling-perfect-panels", title: "Press Plates and Press Pads: Smart Tooling for Better Panel Consistency", intent: "plate, pad, paper, resin, board moisture, temperature, pressure, and time must be reviewed as one lamination stack instead of isolated product claims.", type: "Lamination Stack Guide", confirmFirst: "plate, pad, paper, resin, board moisture, temperature, pressure, time", relatedSlugs: ["lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plate-defect-troubleshooting-guide", "press-pad-failure-symptoms-lamination-lines", "printed-decor-paper-selection-guide"] },
	{ group: "existing", profile: "decorPaper", slug: "printed-decor-paper-batch-repeat-approval-guide", title: "Printed Decor Paper Batch Repeat: Approval Before Impregnation", intent: "a repeat decor batch needs master sample, batch sample, light source, Delta E if available, metamerism check, and retained sample before impregnation.", type: "Sample Approval Guide", confirmFirst: "master sample, batch sample, light source, Delta E if agreed, metamerism, retained sample", relatedSlugs: ["printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", "printed-decor-paper-selection-guide", "engraved-cylinders-repeat-accuracy-guide", "china-sample-approval-route-buyer-counter-production-sample"] },
	{ group: "existing", profile: "industrial", slug: "industrial-press-plates-pcb-ccl-note", title: "Industrial Press Plates for PCB and CCL: Flatness, Parallelism, and Surface Control", intent: "industrial press plates are being reviewed for PCB, CCL, or technical laminate work where flatness, parallelism, roughness, hardness, burr-free edge, and protective packing decide acceptance.", type: "Technical Decision Sheet", confirmFirst: "flatness, parallelism, roughness, hardness, burr-free edge, protective packing", relatedSlugs: ["industrial-press-plates-quality-priorities", "standard-vs-industrial-press-plates", "industrial-press-plates-receiving-flatness-checklist", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion"] },
	{ group: "existing", profile: "industrial", slug: "industrial-press-plates-quality-priorities", title: "Industrial Press Plates: Flatness, Parallelism, and Incoming Inspection Priorities", intent: "incoming inspection needs to focus on flatness, parallelism, surface condition, document match, and handling release without duplicating the receiving checklist.", type: "Inspection Logic Guide", confirmFirst: "inspection method, flatness, parallelism, surface state, packing state, release owner", relatedSlugs: ["industrial-press-plates-receiving-flatness-checklist", "industrial-press-plates-pcb-ccl-note", "standard-vs-industrial-press-plates", "press-plate-receiving-checklist"] },
	{ group: "existing", profile: "industrial", slug: "standard-vs-industrial-press-plates", title: "Standard Press Plates vs Industrial Press Plates: When the Requirement Changes", intent: "a buyer needs to decide when decorative lamination, PCB/CCL, security laminate, or technical laminate requirements move from finish approval into tolerance-led tooling control.", type: "Comparative Analysis", confirmFirst: "decorative versus technical route, finish versus tolerance driver, acceptance method, document proof", relatedSlugs: ["industrial-press-plates-pcb-ccl-note", "industrial-press-plates-quality-priorities", "press-plates-panel-quality-guide", "what-buyers-should-not-compare-only-by-price"] },
	{ group: "existing", profile: "industrial", slug: "industrial-press-plates-receiving-flatness-checklist", title: "Industrial Press Plate Receiving Checklist: Flatness, Surface, and Handling", intent: "receiving needs a checklist-format decision page for pack ID, documents, flatness, surface, edge, handling, and release status before the plate enters plant circulation.", type: "Receiving Checklist", confirmFirst: "pack ID, document match, surface condition, flatness, edge condition, storage method, release status", relatedSlugs: ["industrial-press-plates-quality-priorities", "industrial-press-plates-pcb-ccl-note", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "buyer-inspection-plan"], download: "press-plate-receiving-checklist" },
	{ group: "existing", profile: "panel", slug: "mdf-vs-hdf-surface-readiness-guide", title: "MDF vs HDF: Surface Readiness, Density, and Conversion Fit", intent: "MDF and HDF need to be compared by density, swelling, internal bond, screw holding, sanding, edge finish, lamination, painting, and routing fit.", type: "Comparative Analysis", confirmFirst: "density, swelling, internal bond, screw holding, sanding, edge finish, lamination/painting/routing fit", relatedSlugs: ["mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi", "mdf-hdf-painting-lamination-routing", "particleboard-vs-mdf-vs-plywood-modular-furniture", "edge-banding-match-board-decor-paper-laminate-furniture-route"] },
	{ group: "existing", profile: "panel", slug: "osb-application-fit-guide", title: "OSB: When It Fits, When It Doesn't, and What to Confirm Early", intent: "OSB is being considered and the buyer needs an OSB/1 to OSB/4 use map, moisture expectation, fastening route, and visual limitation before overbuilding the decision.", category: "osb", type: "Application Fit Guide", confirmFirst: "OSB/1 to OSB/4 classification logic, moisture exposure, load path, fastening, visible-face expectation", relatedSlugs: ["osb-vs-plywood-structural-fit-moisture-fastening-cost", "plywood-face-grade-core-gap-glue-line-bond-route", "plywood-vs-fiberboard-substrate-guide", "what-buyers-should-not-compare-only-by-price"] },
	{ group: "existing", profile: "panel", slug: "particleboard-buyers-guide", title: "Particleboard Buying Basics for Commercial Furniture Programmes", intent: "particleboard is being reviewed for commercial furniture and P2/P3/P5 logic, density, swelling, screw holding, edge banding, and emission document route need to be specified.", category: "particleboard", type: "Buyer Guide", confirmFirst: "P2/P3/P5 logic, density, swelling, screw holding, edge banding, emission document route", relatedSlugs: ["particleboard-vs-mdf-vs-plywood-modular-furniture", "particleboard-screw-holding-edge-banding-risk", "melamine-faced-board-lpl-buying-guide", "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi"] },
	{ group: "existing", profile: "panel", slug: "plywood-vs-fiberboard-substrate-guide", title: "Plywood vs Fiberboard: Substrate Choice for Furniture Programmes", intent: "plywood and fiberboard need to be compared by screw holding, flatness, painting, lamination, routing, moisture, weight, and final furniture use.", category: "plywood", type: "Comparative Analysis", confirmFirst: "screw holding, flatness, painting, lamination, routing, moisture, weight", relatedSlugs: ["particleboard-vs-mdf-vs-plywood-modular-furniture", "mdf-vs-hdf-surface-readiness-guide", "plywood-face-grade-core-gap-glue-line-bond-route", "custom-furniture-brief-guide"] },
	{ group: "existing", profile: "formwork", slug: "shuttering-plywood-surface-finish-note", title: "Shuttering Plywood Surface Finish and Reuse: What Buyers Should Compare", intent: "shuttering plywood is being compared by cost-per-use, concrete face, stripping, cleaning, oiling, handling, site discipline, and realistic reuse rather than first cost only.", type: "Cost Per Use Guide", confirmFirst: "face finish, reuse expectation, stripping, cleaning, oiling, handling, edge sealing, site discipline", relatedSlugs: ["formwork-plywood-cost-per-use-vs-first-cost", "shuttering-plywood-receiving-checklist", "super-mirror-shuttering-plywood-guide", "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork"], download: "shuttering-plywood-receiving-checklist" },
	{ group: "existing", profile: "formwork", slug: "super-mirror-shuttering-plywood-guide", title: "Super-Mirror Shuttering Plywood: Surface Finish, Reuse, and Practical Fit", intent: "a premium concrete-facing plywood route is already under review and the buyer needs to confirm when smoother face quality pays back instead of treating it as a default upgrade.", type: "Premium Route Decision Sheet", confirmFirst: "premium surface need, concrete finish target, realistic reuse, handling discipline, correction cost", relatedSlugs: ["shuttering-plywood-surface-finish-note", "formwork-plywood-cost-per-use-vs-first-cost", "super-mirror-shuttering-plywood-premium-surface-payback", "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork"] },
	{ group: "existing", profile: "formwork", slug: "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork", title: "Upgraded Shuttering Plywood vs Aluminium and Plastic Formwork: A Practical Comparison", intent: "formwork options need to be compared by first cost, cost per use, labour, repairability, repeatability, concrete finish, and project repetition instead of material name.", type: "Comparative Analysis", confirmFirst: "first cost, cost/use, labour, repairability, repeatability, concrete finish, project repetition", relatedSlugs: ["formwork-plywood-cost-per-use-vs-first-cost", "shuttering-plywood-surface-finish-note", "shuttering-plywood-receiving-checklist", "what-buyers-should-not-compare-only-by-price"] },
	{ group: "existing", profile: "surface", slug: "hpl-vs-lpl-material-selection-guide", title: "HPL vs LPL Material Selection: Use Case Before Surface Choice", intent: "HPL, LPL, CPL, veneer, PET, PVC, acrylic, and melamine board routes need to be mapped from use case, substrate, edge, and approval requirement before price comparison.", type: "Decorative Surface Pillar", confirmFirst: "use case, HPL/LPL/CPL/veneer/PET/PVC/acrylic/melamine route, substrate, edge, sample, document proof", relatedSlugs: ["hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic", "melamine-faced-board-lpl-buying-guide", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion"] },
];

const mustPublishSpecs = [
	{ profile: "sourcing", slug: "fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", title: "FOB China RFQ Checklist for Wood, Steel, Flooring, Furniture, and Tooling", intent: "an FOB China enquiry needs product, application, specification, document, packing, inspection, destination, incoterm, and timeline inputs normalized before price comparison.", type: "RFQ Checklist", relatedSlugs: ["supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "china-sample-approval-route-buyer-counter-production-sample", "what-buyers-should-not-compare-only-by-price", "buyer-inspection-plan"], download: "fob-china-rfq-checklist" },
	{ profile: "sourcing", slug: "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", title: "Supplier Document Pack: TDS, COA, MTC, Test Report, Packing List, HS Discussion", intent: "a buyer needs to request only relevant supplier documents and connect each document to the material, approval, import, packing, or receiving decision it supports.", type: "Document Checklist", relatedSlugs: ["fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", "document-readiness-wood-steel-surface-material-imports", "decorative-stainless-steel-packing-receiving-checklist", "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi"], download: "supplier-document-pack" },
	{ profile: "steel", slug: "decorative-stainless-steel-201-304-316-430", title: "Decorative Stainless Steel: 201 vs 304 vs 316 vs 430", intent: "201, 304, 316, and 430 need to be compared by environment, finish, magnetic expectation, touch level, document proof, and service expectation.", type: "Grade Selection Guide", relatedSlugs: ["ss-201-vs-304-panels", "decorative-ss-panel-approval-guide", "pvd-stainless-steel-buyer-checklist", "decorative-stainless-steel-sourcing-note"] },
	{ profile: "steel", slug: "pvd-stainless-steel-buyer-checklist", title: "PVD Stainless Steel Buyer Checklist", intent: "PVD stainless steel needs colour, substrate grade, finish base, sample, film, cleaning, batch, and receiving controls before project quantity.", type: "Finish Approval Checklist", relatedSlugs: ["decorative-stainless-steel-finish-family-guide", "anti-fingerprint-stainless-steel-use-case-limits-cleaning", "mirror-stainless-steel-scratch-distortion-pvc-film-packing", "decorative-stainless-steel-packing-receiving-checklist"] },
	{ profile: "steel", slug: "anti-fingerprint-stainless-steel-use-case-limits-cleaning", title: "Anti-Fingerprint Stainless Steel: Use Case, Limits, Cleaning", intent: "anti-fingerprint stainless steel is being specified for a touch zone and the buyer needs use case, coating limit, cleaning method, sample, and receiving checks defined.", type: "Use-Case Decision Sheet", relatedSlugs: ["decorative-ss-panel-approval-guide", "pvd-stainless-steel-buyer-checklist", "decorative-stainless-steel-finish-family-guide", "decorative-steel-hotels-retail-interiors"] },
	{ profile: "steel", slug: "mirror-stainless-steel-scratch-distortion-pvc-film-packing", title: "Mirror Stainless Steel: Scratch, Distortion, PVC Film, Packing", intent: "mirror stainless steel is being reviewed and scratch visibility, reflection distortion, PVC film, interleaving, and packing evidence need to be controlled.", type: "Receiving Risk Guide", relatedSlugs: ["decorative-stainless-steel-finish-family-guide", "decorative-stainless-steel-packing-receiving-checklist", "pvd-stainless-steel-buyer-checklist", "ss-profiles-application-guide"] },
	{ profile: "steel", slug: "decorative-stainless-steel-packing-receiving-checklist", title: "Decorative Stainless Steel Packing and Receiving Checklist", intent: "decorative stainless sheets, panels, or profiles are being received and pack condition, PVC film, interleaving, corner protection, finish direction, and photo evidence need to be checked before release.", type: "Receiving Checklist", relatedSlugs: ["decorative-ss-panel-approval-guide", "mirror-stainless-steel-scratch-distortion-pvc-film-packing", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "buyer-inspection-plan"], download: "decorative-ss-receiving-checklist" },
	{ profile: "panel", slug: "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi", title: "MDF/HDF Emission Grades: E1, E0, CARB, TSCA Title VI", intent: "MDF/HDF emission language needs to be tied to destination, buyer requirement, E1/E0/CARB references, and EPA TSCA Title VI only where US-regulated composite wood rules apply.", type: "Document Check Guide", category: "fiberboard", relatedSlugs: ["mdf-vs-hdf-surface-readiness-guide", "particleboard-buyers-guide", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "particleboard-vs-mdf-vs-plywood-modular-furniture"] },
	{ profile: "panel", slug: "particleboard-vs-mdf-vs-plywood-modular-furniture", title: "Particleboard vs MDF vs Plywood for Modular Furniture", intent: "modular furniture substrate options need to be compared by load, screw holding, surface finish, edge banding, moisture exposure, weight, emission route, and cost-to-correct.", type: "Comparative Analysis", category: "particleboard", relatedSlugs: ["particleboard-buyers-guide", "mdf-vs-hdf-surface-readiness-guide", "plywood-vs-fiberboard-substrate-guide", "custom-furniture-brief-guide"] },
	{ profile: "surface", slug: "melamine-faced-board-lpl-buying-guide", title: "Melamine-Faced Board / LPL Buying Guide", intent: "melamine-faced board or LPL needs board core, decor, edge banding, emission document, quantity, packing, and sample approval defined before programme comparison.", type: "Buyer Guide", category: "particleboard", relatedSlugs: ["hpl-vs-lpl-material-selection-guide", "hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic", "particleboard-buyers-guide", "edge-banding-match-board-decor-paper-laminate-furniture-route"] },
	{ profile: "surface", slug: "hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic", title: "HPL vs LPL vs CPL vs Veneer vs PET/PVC/Acrylic", intent: "decorative surface families need to be compared by use case, substrate, edge, wear, cleaning, sample, and document proof rather than appearance alone.", type: "Surface Route Map", relatedSlugs: ["hpl-vs-lpl-material-selection-guide", "melamine-faced-board-lpl-buying-guide", "overlay-paper-wear-layer-basics", "edge-banding-match-board-decor-paper-laminate-furniture-route"] },
	{ profile: "lamination", slug: "press-plate-defect-troubleshooting-guide", title: "Press Plate Defect Troubleshooting Guide", intent: "surface defects such as dots, scratches, gloss drift, orange peel, pressure marks, contamination, or chrome wear need a hold/reject map before replacement decisions.", type: "Troubleshooting Guide", relatedSlugs: ["press-plates-panel-quality-guide", "press-plate-chrome-condition-guide", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plates-replacement-programme-guide"], download: "buyer-inspection-plan" },
	{ profile: "lamination", slug: "press-pad-failure-symptoms-lamination-lines", title: "Press Pad Failure Symptoms in Lamination Lines", intent: "a lamination line is seeing symptoms that may indicate pad ageing, compression loss, heat imbalance, or pressure transfer issues.", category: "press-pads", type: "Troubleshooting Guide", relatedSlugs: ["press-pads-heat-pressure-note", "press-pads-quality-replacement-checks", "lamination-stack-control-plate-pad-paper-substrate-press-cycle", "press-plate-defect-troubleshooting-guide"], download: "press-pad-replacement-log" },
	{ profile: "lamination", slug: "lamination-stack-control-plate-pad-paper-substrate-press-cycle", title: "Lamination Stack Control: Plate + Pad + Paper + Substrate + Press Cycle", intent: "plate, pad, paper, substrate, resin, board moisture, temperature, pressure, and time need to be aligned before the buyer treats one item as the root cause.", type: "Pillar Guide", relatedSlugs: ["press-plates-pads-smart-tooling-perfect-panels", "press-plate-defect-troubleshooting-guide", "press-pad-failure-symptoms-lamination-lines", "printed-decor-paper-selection-guide"] },
	{ profile: "decorPaper", slug: "printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", title: "Printed Decor Paper Colour Matching: Master Sample, Batch Repeat, Metamerism", intent: "decor paper colour approval needs master sample, batch sample, agreed light source, metamerism check, Delta E if available, and retained sample control.", type: "Colour Approval Guide", relatedSlugs: ["printed-decor-paper-batch-repeat-approval-guide", "printed-decor-paper-selection-guide", "engraved-cylinders-repeat-accuracy-guide", "china-sample-approval-route-buyer-counter-production-sample"] },
	{ profile: "flooring", slug: "flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps", title: "Flooring Accessories: Skirting, Stair Nosing, T-Moulding, Reducers, End Caps", intent: "flooring accessories need to be specified with the floor board, decor, height transition, stair detail, expansion gap, and site handover requirement.", category: "flooring-accessories", type: "System Completion Guide", relatedSlugs: ["engineered-flooring-selection-guide", "flooring-site-readiness-before-dispatch", "wood-flooring-core-moisture-wear-class-guide", "what-buyers-should-not-compare-only-by-price"] },
	{ profile: "flooring", slug: "flooring-site-readiness-before-dispatch", title: "Laminate Flooring Site Readiness Before Dispatch", intent: "laminate flooring should not be dispatched until subfloor moisture, storage, acclimatisation, underlay, expansion allowance, accessories, and installation limits are checked.", type: "Site Readiness Checklist", relatedSlugs: ["engineered-flooring-selection-guide", "wood-flooring-core-moisture-wear-class-guide", "flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps", "buyer-inspection-plan"], download: "flooring-site-readiness-checklist" },
	{ profile: "formwork", slug: "formwork-plywood-cost-per-use-vs-first-cost", title: "Formwork Plywood: Cost Per Use vs First Cost", intent: "formwork plywood needs to be compared by cost per accepted use, repair effort, stripping, cleaning, oiling, concrete finish, and site discipline rather than first invoice value.", type: "Cost Per Use Guide", relatedSlugs: ["shuttering-plywood-surface-finish-note", "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork", "shuttering-plywood-receiving-checklist", "what-buyers-should-not-compare-only-by-price"], download: "shuttering-plywood-receiving-checklist" },
	{ profile: "sourcing", slug: "china-sample-approval-route-buyer-counter-production-sample", title: "China Sample Approval Route: Buyer Sample, Counter Sample, Production Sample", intent: "a sample-led import or sourcing requirement needs buyer sample, counter sample, production sample, retained sample, approval owner, and receiving check separated into clear gates.", type: "Sample Approval Guide", relatedSlugs: ["fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", "custom-furniture-brief-drawing-sample-guide"], download: "buyer-inspection-plan" },
	{ profile: "sourcing", slug: "what-buyers-should-not-compare-only-by-price", title: "What Buyers Should Not Compare Only by Price", intent: "two quotes look cheaper or costlier but the buyer has not normalized specification, sample, document, packing, inspection, destination, incoterm, and correction risk.", type: "Decision Control Guide", relatedSlugs: ["fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", "supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "particleboard-vs-mdf-vs-plywood-modular-furniture", "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork"] },
];

const draftSpecs = [
	{ status: "draft", profile: "steel", slug: "decorative-steel-for-elevators-panels-profiles-grade-finish-protection", title: "Decorative Steel for Elevators: Panels, Profiles, Grade, Finish, Protection", intent: "an elevator interior steel package needs panels, profiles, grade, finish direction, film, AFP/PVD limits, and site protection confirmed before publication as a standalone guide.", relatedSlugs: ["decorative-ss-panel-approval-guide", "ss-profiles-application-guide", "pvd-stainless-steel-buyer-checklist"] },
	{ status: "draft", profile: "steel", slug: "decorative-steel-hotels-retail-interiors", title: "Decorative Steel for Hotels and Retail Interiors", intent: "hotel or retail decorative steel needs a project-use matrix before it can avoid overlapping the broader decorative stainless guides.", relatedSlugs: ["decorative-stainless-steel-sourcing-note", "anti-fingerprint-stainless-steel-use-case-limits-cleaning", "decorative-stainless-steel-finish-family-guide"] },
	{ status: "draft", profile: "steel", category: "ss-furniture", slug: "ss-furniture-grade-weld-frame-pvd-afp-approval", title: "SS Furniture: Grade, Weld, Frame, PVD/AFP Approval", intent: "stainless furniture needs frame, weld, grade, PVD/AFP, top material, packing, and site handover controls before publication.", relatedSlugs: ["decorative-ss-panel-approval-guide", "pvd-stainless-steel-buyer-checklist", "furniture-packing-kd-flat-pack-carton-marking-site-handover"] },
	{ status: "draft", profile: "steel", slug: "stainless-steel-etched-sheets-pattern-depth-pvd-cleaning", title: "Stainless Steel Etched Sheets: Pattern, Depth, PVD, Cleaning", intent: "etched stainless sheets need pattern, depth, coating, cleaning, and sample proof separated from generic finish-family content.", relatedSlugs: ["decorative-stainless-steel-finish-family-guide", "pvd-stainless-steel-buyer-checklist", "decorative-stainless-steel-packing-receiving-checklist"] },
	{ status: "draft", profile: "steel", slug: "matte-bead-blasted-stainless-steel-ra-uniformity-handling", title: "Matte / Bead-Blasted Stainless Steel: Ra, Uniformity, Handling", intent: "matte or bead-blasted stainless needs roughness language, uniformity, handling, cleaning, and packing checks before publication.", relatedSlugs: ["decorative-stainless-steel-finish-family-guide", "mirror-stainless-steel-scratch-distortion-pvc-film-packing", "decorative-stainless-steel-packing-receiving-checklist"] },
	{ status: "draft", profile: "lamination", slug: "press-plate-hardness-chrome-what-buyers-should-ask", title: "Press Plate Hardness and Chrome: What Buyers Should Ask", intent: "hardness and chrome questions need to stay practical and avoid becoming an unsupported performance claim.", relatedSlugs: ["press-plates-replacement-programme-guide", "press-plate-chrome-condition-guide", "press-plates-panel-quality-guide"] },
	{ status: "draft", profile: "lamination", slug: "press-plate-storage-handling-sop", title: "Press Plate Storage and Handling SOP", intent: "storage and handling needs a real SOP format with hold/reject triggers before it should be public.", relatedSlugs: ["press-plate-chrome-condition-guide", "press-plates-replacement-programme-guide", "industrial-press-plates-receiving-flatness-checklist"] },
	{ status: "draft", profile: "lamination", slug: "press-plate-re-chroming-vs-replacement", title: "Press Plate Re-Chroming vs Replacement", intent: "re-chroming versus replacement needs buyer-specific defect history and economics before publication.", relatedSlugs: ["press-plate-chrome-condition-guide", "press-plates-replacement-programme-guide", "press-plate-defect-troubleshooting-guide"] },
	{ status: "draft", profile: "decorPaper", slug: "engraved-cylinder-approval-decor-paper-printing", title: "Engraved Cylinder Approval for Decor Paper Printing", intent: "engraved cylinder approval needs proofing, repeat, start-point, and artwork gates distinct from the existing repeat-accuracy guide.", relatedSlugs: ["engraved-cylinders-repeat-accuracy-guide", "printed-decor-paper-selection-guide", "printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism"] },
	{ status: "draft", profile: "surface", slug: "overlay-paper-wear-layer-basics", title: "Overlay Paper and Wear Layer Basics", intent: "overlay paper and wear layer content needs enough distinct buyer demand before it is published separately from surface-route and flooring guides.", relatedSlugs: ["hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic", "engineered-flooring-selection-guide", "printed-decor-paper-selection-guide"] },
	{ status: "draft", profile: "surface", slug: "edge-banding-match-board-decor-paper-laminate-furniture-route", title: "Edge Banding Match: Board, Decor Paper, Laminate, Furniture Route", intent: "edge banding needs a cross-route match guide before publication and must avoid duplicating furniture dispatch content.", relatedSlugs: ["melamine-faced-board-lpl-buying-guide", "particleboard-vs-mdf-vs-plywood-modular-furniture", "custom-furniture-brief-drawing-sample-guide"] },
	{ status: "draft", profile: "panel", slug: "mdf-hdf-painting-lamination-routing", title: "MDF/HDF for Painting vs Lamination vs Routing", intent: "MDF/HDF conversion needs separate painting, lamination, and routing proof points before publication.", relatedSlugs: ["mdf-vs-hdf-surface-readiness-guide", "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi", "particleboard-vs-mdf-vs-plywood-modular-furniture"] },
	{ status: "draft", profile: "panel", category: "particleboard", slug: "particleboard-screw-holding-edge-banding-risk", title: "Particleboard Screw Holding and Edge Banding Risk", intent: "particleboard screw and edge risks need sample-test detail before publication as a narrow troubleshooting guide.", relatedSlugs: ["particleboard-buyers-guide", "particleboard-vs-mdf-vs-plywood-modular-furniture", "melamine-faced-board-lpl-buying-guide"] },
	{ status: "draft", profile: "panel", category: "plywood", slug: "plywood-face-grade-core-gap-glue-line-bond-route", title: "Plywood Face Grade, Core Gap, Glue Line, Bond Route", intent: "plywood face/core/bond content needs document and sample proof before publication as a separate technical page.", relatedSlugs: ["plywood-vs-fiberboard-substrate-guide", "osb-vs-plywood-structural-fit-moisture-fastening-cost", "shuttering-plywood-surface-finish-note"] },
	{ status: "draft", profile: "panel", category: "osb", slug: "osb-vs-plywood-structural-fit-moisture-fastening-cost", title: "OSB vs Plywood: Structural Fit, Moisture, Fastening, Cost", intent: "OSB versus plywood needs a distinct structural-fit decision matrix before publication.", relatedSlugs: ["osb-application-fit-guide", "plywood-vs-fiberboard-substrate-guide", "plywood-face-grade-core-gap-glue-line-bond-route"] },
	{ status: "draft", profile: "formwork", slug: "shuttering-plywood-receiving-checklist", title: "Shuttering Plywood Receiving Checklist", intent: "shuttering plywood receiving needs a checklist/download asset and should be published only if it is not duplicating the cost-per-use guide.", relatedSlugs: ["shuttering-plywood-surface-finish-note", "formwork-plywood-cost-per-use-vs-first-cost", "upgraded-shuttering-plywood-vs-aluminium-plastic-formwork"], download: "shuttering-plywood-receiving-checklist" },
	{ status: "draft", profile: "formwork", slug: "super-mirror-shuttering-plywood-premium-surface-payback", title: "Super-Mirror Shuttering Plywood: When Premium Surface Pays Back", intent: "premium shuttering plywood needs human confirmation of active commercial focus before it is published as a new page.", relatedSlugs: ["super-mirror-shuttering-plywood-guide", "formwork-plywood-cost-per-use-vs-first-cost", "shuttering-plywood-surface-finish-note"] },
	{ status: "draft", profile: "furniture", slug: "furniture-hardware-checklist-before-dispatch", title: "Furniture Hardware Checklist Before Dispatch", intent: "furniture hardware needs counts, spare logic, assembly instruction, and carton marking before publication outside the broader dispatch guide.", category: "ready-made-furniture", relatedSlugs: ["ready-made-furniture-procurement-guide", "furniture-packing-kd-flat-pack-carton-marking-site-handover", "custom-furniture-brief-guide"], download: "furniture-dispatch-checklist" },
	{ status: "draft", profile: "furniture", slug: "furniture-packing-kd-flat-pack-carton-marking-site-handover", title: "Furniture Packing, KD/Flat-Pack, Carton Marking, Site Handover", intent: "KD and flat-pack furniture content needs stronger non-duplicate packing and site handover evidence before publication.", category: "ready-made-furniture", relatedSlugs: ["ready-made-furniture-procurement-guide", "furniture-hardware-checklist-before-dispatch", "buyer-inspection-plan"], download: "furniture-dispatch-checklist" },
	{ status: "draft", profile: "sourcing", slug: "document-readiness-wood-steel-surface-material-imports", title: "Document Readiness for Wood, Steel, and Surface Material Imports", intent: "import document readiness needs stronger differentiation from the supplier document pack before publication.", relatedSlugs: ["supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi"] },
];

const technicalLibraryPublished = [...existingSpecs, ...mustPublishSpecs].map(makeArticle);
const technicalLibraryDrafts = draftSpecs.map(makeArticle);

const technicalLibraryDownloads = [
	{ id: "fob-china-rfq-checklist", title: "FOB China RFQ Checklist", filename: "fob-china-rfq-checklist.txt", appliesTo: "Wood, steel, flooring, furniture, tooling", rows: ["Product/application", "Size/thickness/drawing", "Grade/type/finish", "Quantity and packing", "Destination and incoterm", "Document/sample requirements", "Inspection and photo evidence"] },
	{ id: "supplier-document-pack", title: "Supplier Document Pack", filename: "supplier-document-pack.txt", appliesTo: "Material and import document checks", rows: ["TDS when technical specification is needed", "COA when batch chemical/quality data applies", "MTC for metal route proof", "Test report only for agreed performance point", "Packing list and HS discussion for import review", "Product, packing, and loading photos where receiving needs evidence"] },
	{ id: "decorative-ss-receiving-checklist", title: "Decorative SS Receiving Checklist", filename: "decorative-ss-receiving-checklist.txt", appliesTo: "Decorative stainless sheets, panels, profiles", rows: ["Match grade and finish label", "Check PVC film and interleaving", "Inspect corners and crates before handling", "Photograph scratches or direction mismatch", "Hold packs with damaged protection", "Keep sample and receiving photos together"] },
	{ id: "press-plate-receiving-checklist", title: "Press Plate Receiving Checklist", filename: "press-plate-receiving-checklist.txt", appliesTo: "Decorative and industrial press plates", rows: ["Check plate ID and order reference", "Match size, texture, and route", "Inspect surface, chrome, edge, and packing", "Record flatness/parallelism if specified", "Hold damaged or undocumented plates", "Attach storage and handling note"] },
	{ id: "press-pad-replacement-log", title: "Press Pad Replacement Log", filename: "press-pad-replacement-log.txt", appliesTo: "Lamination press pad maintenance", rows: ["Record install date and line", "Track cycles or runtime", "Record temperature/pressure window", "Map board symptoms and gloss drift", "Record shrinkage or visible wear", "Set replacement trigger and next check"] },
	{ id: "flooring-site-readiness-checklist", title: "Flooring Site Readiness Checklist", filename: "flooring-site-readiness-checklist.txt", appliesTo: "Flooring dispatch and installation", rows: ["Check subfloor moisture and flatness", "Confirm acclimatisation/storage plan", "Lock underlay and expansion gap", "Match skirting, nosing, reducers, end caps", "Confirm wastage and spare boards", "Hold dispatch if site is not ready"] },
	{ id: "buyer-inspection-plan", title: "Buyer Inspection Plan", filename: "buyer-inspection-plan.txt", appliesTo: "Sample, dispatch, and receiving checks", rows: ["Define acceptance benchmark", "List measurement/document/photo evidence", "Separate hold, reject, and concession actions", "Assign approval owner", "Record retained sample or drawing revision", "Keep receiving result with reorder record"] },
	{ id: "furniture-dispatch-checklist", title: "Furniture Dispatch Checklist", filename: "furniture-dispatch-checklist.txt", appliesTo: "Ready-made, KD, and custom furniture", rows: ["Check drawing/order reference", "Confirm finish and board route", "Count hardware and spare parts", "Check carton marking and assembly instruction", "Photograph product, packing, and loading", "Hold shipment if damage tolerance is exceeded"] },
	{ id: "shuttering-plywood-receiving-checklist", title: "Shuttering Plywood Receiving Checklist", filename: "shuttering-plywood-receiving-checklist.txt", appliesTo: "Formwork and shuttering plywood", rows: ["Match thickness, face, and edge seal", "Inspect film/overlay and corners", "Record pack condition and board count", "Check storage and handling before use", "Track stripping, cleaning, oiling, repair", "Calculate cost per accepted use"] },
];

const technicalLibraryAudit = {
	guideIndex: GUIDE_INDEX,
	existing31: technicalLibraryPublished
		.filter((article) => article.libraryGroup === "existing")
		.map((article) => ({ slug: article.slug, title: article.title, status: "upgraded-published", buyerIntent: article.buyerIntent })),
	new40: [...technicalLibraryPublished.filter((article) => article.libraryGroup !== "existing"), ...technicalLibraryDrafts].map((article) => ({
		slug: article.slug,
		title: article.title,
		status: article.libraryStatus === "draft" ? "complete-draft-not-public" : "published",
		buyerIntent: article.buyerIntent,
	})),
	downloads: technicalLibraryDownloads.map((item) => ({ id: item.id, title: item.title, filename: item.filename })),
};

module.exports = {
	technicalLibraryPublished,
	technicalLibraryDrafts,
	technicalLibraryDownloads,
	technicalLibraryAudit,
	GUIDE_INDEX,
	CTA,
};
