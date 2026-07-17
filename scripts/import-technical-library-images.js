const fs = require("fs");
const path = require("path");

let sharp = null;
try {
	sharp = require("sharp");
} catch (_) {}

const WORK = path.resolve(__dirname, "..");
const SOURCE_ROOT = "C:/Users/Yash/OneDrive - Deco Metal/OTHERS/Desktop/codex-website";
const OUTPUT_DIR = path.join(WORK, "images", "insights", "editorial");
const MANIFEST_PATH = path.join(WORK, "technical-library-image-manifest.json");
const PUBLIC_PREFIX = "/images/insights/editorial";
const GENERATE_AVIF = process.env.GENERATE_LIBRARY_AVIF === "1";

const { technicalLibraryPublished } = require(path.join(WORK, "technical-library.js"));
const titleBySlug = new Map(technicalLibraryPublished.map((article) => [article.slug, article.title]));

const selected = [
	// Existing 31 insight covers from the labeled April 28 contact sheets.
	["press-plates-pads-smart-tooling-perfect-panels", "website/ChatGPT Image Apr 28, 2026, 12_09_22 PM (1).png", "existing-article-hero", "Press Plates & Pads"],
	["hpl-vs-lpl-material-selection-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_22 PM (2).png", "existing-article-hero", "HPL vs LPL"],
	["super-mirror-shuttering-plywood-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_23 PM (3).png", "existing-article-hero", "Super-Mirror Shuttering Plywood"],
	["upgraded-shuttering-plywood-vs-aluminium-plastic-formwork", "website/ChatGPT Image Apr 28, 2026, 12_09_23 PM (4).png", "existing-article-hero", "Upgraded Plywood vs Formwork"],
	["press-plate-chrome-condition-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_23 PM (5).png", "existing-article-hero", "Press Plate Chrome Condition"],
	["printed-decor-paper-batch-repeat-approval-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_24 PM (6).png", "existing-article-hero", "Printed Decor Paper Batch Control"],
	["decorative-stainless-steel-finish-family-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_24 PM (7).png", "existing-article-hero", "Decorative Stainless Finishes"],
	["wood-flooring-core-moisture-wear-class-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_24 PM (8).png", "existing-article-hero", "Wood Flooring System"],
	["custom-furniture-brief-drawing-sample-guide", "website/ChatGPT Image Apr 28, 2026, 12_09_25 PM (9).png", "existing-article-hero", "Custom Furniture Approval"],
	["industrial-press-plates-receiving-flatness-checklist", "website/ChatGPT Image Apr 28, 2026, 12_09_25 PM (10).png", "existing-article-hero", "Industrial Press Plate Receiving"],
	["press-plates-panel-quality-guide", "website/ChatGPT Image Apr 28, 2026, 02_09_02 PM (1).png", "existing-article-hero", "Press Plates and Panel Quality"],
	["press-plates-replacement-programme-guide", "website/ChatGPT Image Apr 28, 2026, 02_09_02 PM (2).png", "existing-article-hero", "Press Plate Replacement Programmes"],
	["press-pads-heat-pressure-note", "website/ChatGPT Image Apr 28, 2026, 02_09_03 PM (3).png", "existing-article-hero", "Press Pad Heat and Pressure"],
	["press-pads-quality-replacement-checks", "website/ChatGPT Image Apr 28, 2026, 02_09_03 PM (4).png", "existing-article-hero", "Press Pad Replacement Checks"],
	["engraved-cylinders-repeat-accuracy-guide", "website/ChatGPT Image Apr 28, 2026, 02_09_03 PM (5).png", "existing-article-hero", "Engraved Cylinders"],
	["printed-decor-paper-selection-guide", "website/ChatGPT Image Apr 28, 2026, 02_09_06 PM (6).png", "existing-article-hero", "Printed Decor Paper Before Pressing"],
	["industrial-press-plates-pcb-ccl-note", "website/ChatGPT Image Apr 28, 2026, 02_09_06 PM (7).png", "existing-article-hero", "PCB and CCL Press Plates"],
	["standard-vs-industrial-press-plates", "website/ChatGPT Image Apr 28, 2026, 02_09_06 PM (8).png", "existing-article-hero", "Standard vs Industrial Press Plates"],
	["industrial-press-plates-quality-priorities", "website/ChatGPT Image Apr 28, 2026, 02_09_07 PM (9).png", "existing-article-hero", "Industrial Plate Flatness Inspection"],
	["decorative-stainless-steel-sourcing-note", "website/ChatGPT Image Apr 28, 2026, 02_09_07 PM (10).png", "existing-article-hero", "Decorative Stainless Steel Sourcing"],
	["decorative-ss-panel-approval-guide", "website/ChatGPT Image Apr 28, 2026, 02_11_58 PM (1).png", "existing-article-hero", "Decorative Stainless Panel Approval"],
	["ss-201-vs-304-panels", "website/ChatGPT Image Apr 28, 2026, 02_11_58 PM (2).png", "existing-article-hero", "SS 201 vs SS 304"],
	["ss-profiles-application-guide", "website/ChatGPT Image Apr 28, 2026, 02_11_58 PM (3).png", "existing-article-hero", "Stainless Steel Profiles"],
	["shuttering-plywood-surface-finish-note", "website/ChatGPT Image Apr 28, 2026, 02_11_58 PM (4).png", "existing-article-hero", "Shuttering Plywood Reuse"],
	["plywood-vs-fiberboard-substrate-guide", "website/ChatGPT Image Apr 28, 2026, 02_11_58 PM (5).png", "existing-article-hero", "Plywood vs Fiberboard"],
	["mdf-vs-hdf-surface-readiness-guide", "website/ChatGPT Image Apr 28, 2026, 02_11_59 PM (6).png", "existing-article-hero", "MDF vs HDF"],
	["osb-application-fit-guide", "website/ChatGPT Image Apr 28, 2026, 02_11_59 PM (7).png", "existing-article-hero", "OSB Application Fit"],
	["particleboard-buyers-guide", "1/ChatGPT Image May 12, 2026, 01_27_10 PM (9).png", "existing-article-hero", "Particleboard Buying Basics"],
	["engineered-flooring-selection-guide", "2/ChatGPT Image May 12, 2026, 01_33_09 PM (6).png", "existing-article-hero", "Engineered Flooring Selection"],
	["ready-made-furniture-procurement-guide", "2/ChatGPT Image May 12, 2026, 01_33_06 PM (3).png", "existing-article-hero", "Ready-Made Furniture Procurement"],
	["custom-furniture-brief-guide", "5/ChatGPT Image May 12, 2026, 01_42_38 PM (10).png", "existing-article-hero", "Custom Furniture RFQ"],

	// New 20 published article covers selected from the May 16 and May 12 sheets.
	["fob-china-rfq-checklist-wood-steel-flooring-furniture-tooling", "website/New folder/ChatGPT Image May 16, 2026, 12_35_47 PM (2).png", "new-article-hero", "FOB China RFQ pack"],
	["supplier-document-pack-tds-coa-mtc-test-report-packing-list-hs-discussion", "website/New folder/ChatGPT Image May 16, 2026, 01_04_00 PM (9).png", "new-article-hero", "Supplier document pack"],
	["decorative-stainless-steel-201-304-316-430", "website/New folder/ChatGPT Image May 16, 2026, 12_35_48 PM (3).png", "new-article-hero", "Decorative stainless grade set"],
	["pvd-stainless-steel-buyer-checklist", "website/New folder/ChatGPT Image May 16, 2026, 12_35_48 PM (4).png", "new-article-hero", "PVD stainless finish samples"],
	["anti-fingerprint-stainless-steel-use-case-limits-cleaning", "website/New folder/ChatGPT Image May 16, 2026, 12_35_49 PM (5).png", "new-article-hero", "Anti-fingerprint stainless cleaning"],
	["mirror-stainless-steel-scratch-distortion-pvc-film-packing", "website/New folder/ChatGPT Image May 16, 2026, 12_35_50 PM (6).png", "new-article-hero", "Mirror stainless receiving surface"],
	["decorative-stainless-steel-packing-receiving-checklist", "website/New folder/ChatGPT Image May 16, 2026, 12_35_52 PM (7).png", "new-article-hero", "Decorative stainless packed crate"],
	["mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi", "website/New folder/ChatGPT Image May 16, 2026, 12_35_53 PM (8).png", "new-article-hero", "MDF HDF emission document check"],
	["particleboard-vs-mdf-vs-plywood-modular-furniture", "website/New folder/ChatGPT Image May 16, 2026, 12_35_54 PM (9).png", "new-article-hero", "Panel substrate comparison"],
	["melamine-faced-board-lpl-buying-guide", "website/New folder/ChatGPT Image May 16, 2026, 01_03_52 PM (1).png", "new-article-hero", "Melamine faced board samples"],
	["hpl-vs-lpl-vs-cpl-vs-veneer-pet-pvc-acrylic", "website/New folder/ChatGPT Image May 16, 2026, 12_35_55 PM (10).png", "new-article-hero", "Decorative surface stack"],
	["press-plate-defect-troubleshooting-guide", "website/New folder/ChatGPT Image May 16, 2026, 12_49_08 PM (1).png", "new-article-hero", "Press plate defect review"],
	["press-pad-failure-symptoms-lamination-lines", "2/ChatGPT Image May 12, 2026, 01_33_05 PM (1).png", "new-article-hero", "Press pad fabric surface"],
	["lamination-stack-control-plate-pad-paper-substrate-press-cycle", "website/New folder/ChatGPT Image May 16, 2026, 01_03_53 PM (3).png", "new-article-hero", "Lamination stack control"],
	["printed-decor-paper-colour-matching-master-sample-batch-repeat-metamerism", "website/New folder/ChatGPT Image May 16, 2026, 01_03_54 PM (5).png", "new-article-hero", "Printed decor paper sample set"],
	["flooring-accessories-skirting-stair-nosing-t-moulding-reducers-end-caps", "website/New folder/ChatGPT Image May 16, 2026, 01_03_58 PM (6).png", "new-article-hero", "Flooring accessory profiles"],
	["flooring-site-readiness-before-dispatch", "website/New folder/ChatGPT Image May 16, 2026, 01_03_58 PM (7).png", "new-article-hero", "Flooring site readiness check"],
	["formwork-plywood-cost-per-use-vs-first-cost", "website/New folder/ChatGPT Image May 16, 2026, 01_03_59 PM (8).png", "new-article-hero", "Formwork plywood cost per use"],
	["china-sample-approval-route-buyer-counter-production-sample", "website/New folder/ChatGPT Image May 16, 2026, 01_04_02 PM (10).png", "new-article-hero", "Sample approval route"],
	["what-buyers-should-not-compare-only-by-price", "5/ChatGPT Image May 12, 2026, 01_42_32 PM (5).png", "new-article-hero", "Quote comparison control"],
];

function walkPngFiles(dir, base = dir) {
	if (!fs.existsSync(dir)) return [];
	const files = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkPngFiles(full, base));
		} else if (/\.png$/i.test(entry.name)) {
			files.push(path.relative(base, full).replace(/\\/g, "/"));
		}
	}
	return files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function fileSize(filePath) {
	return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

async function writeImage(entry) {
	const [slug, sourceRelative, role, contactSheetLabel] = entry;
	const title = titleBySlug.get(slug);
	if (!title) throw new Error(`No published article found for image slug: ${slug}`);
	const sourcePath = path.join(SOURCE_ROOT, sourceRelative);
	console.log(`Importing ${slug} from ${sourceRelative}`);
	if (!fs.existsSync(sourcePath)) throw new Error(`Missing source image for ${slug}: ${sourceRelative}`);
	if (!sharp) throw new Error("sharp is required to import technical-library images");

	const webpPath = path.join(OUTPUT_DIR, `${slug}.webp`);
	const avifPath = path.join(OUTPUT_DIR, `${slug}.avif`);
	fs.mkdirSync(path.dirname(webpPath), { recursive: true });

	if (!fs.existsSync(webpPath) || fileSize(webpPath) === 0) {
		await sharp(sourcePath)
			.rotate()
			.resize({ width: 1440, withoutEnlargement: true })
			.webp({ quality: 82, effort: 2 })
			.toFile(webpPath);
	}
	if (GENERATE_AVIF && (!fs.existsSync(avifPath) || fileSize(avifPath) === 0)) {
		await sharp(sourcePath)
			.rotate()
			.resize({ width: 1440, withoutEnlargement: true })
			.avif({ quality: 52, effort: 1 })
			.toFile(avifPath);
	}

	const sourceMeta = await sharp(sourcePath).metadata();
	const outputMeta = await sharp(webpPath).metadata();
	return {
		articleSlug: slug,
		articleTitle: title,
		role,
		status: "selected-imported",
		contactSheetLabel,
		sourceRoot: "codex-website",
		sourceRelative,
		sourceWidth: sourceMeta.width || null,
		sourceHeight: sourceMeta.height || null,
		destinationWebp: `${PUBLIC_PREFIX}/${slug}.webp`,
		destinationAvif: fs.existsSync(avifPath) ? `${PUBLIC_PREFIX}/${slug}.avif` : null,
		outputWidth: outputMeta.width || null,
		outputHeight: outputMeta.height || null,
		webpBytes: fileSize(webpPath),
		avifBytes: fileSize(avifPath),
		alt: `${title} - Moldart buyer decision sheet image`,
	};
}

async function main() {
	const selectedRelatives = new Set(selected.map((entry) => entry[1]));
	const inventory = walkPngFiles(SOURCE_ROOT).filter((file) => !file.includes("_contact_sheet"));
	const selectedImages = [];
	for (const entry of selected) selectedImages.push(await writeImage(entry));

	const unselectedCandidates = inventory
		.filter((sourceRelative) => !selectedRelatives.has(sourceRelative))
		.map((sourceRelative) => ({
			sourceRoot: "codex-website",
			sourceRelative,
			status: "not-selected-candidate",
			reason: "Not selected for the current 51 public technical-library article hero set.",
		}));

	const manifest = {
		generatedAt: new Date().toISOString(),
		sourceRoot: SOURCE_ROOT,
		outputDirectory: "images/insights/editorial",
		selectionPolicy:
			"Use the labeled April 28 contact-sheet images for the existing 31 preserved slugs, then use the most relevant May 16/May 12 generated images for the 20 new published decision sheets. Draft articles are intentionally not assigned public hero images.",
		selectedCount: selectedImages.length,
		unusedCandidateCount: unselectedCandidates.length,
		selectedImages,
		unselectedCandidates,
	};
	fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
	console.log(`Imported ${selectedImages.length} technical-library images`);
	console.log(`Tracked ${unselectedCandidates.length} unused candidates`);
	console.log(path.relative(WORK, MANIFEST_PATH));
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
