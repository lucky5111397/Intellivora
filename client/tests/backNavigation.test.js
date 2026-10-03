import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientSrcDir = path.resolve(__dirname, "../src");

/**
 * Pure helper reproducing BackButton navigation resolution priority
 */
function resolveBackDestination({ from, to, historyIdx, fallback = "/" }) {
    if (from) {
        return { type: "from", target: from };
    }
    if (to) {
        return { type: "to", target: to };
    }
    if (typeof historyIdx === "number" && historyIdx > 0) {
        return { type: "history", target: -1 };
    }
    return { type: "fallback", target: fallback };
}

/**
 * Pure helper reproducing BackButton display label and aria-label resolution
 */
function resolveBackLabels({ from, label = "Back", ariaLabel = "Go back" }) {
    const isHistoryOrigin = from === "/history";
    const isRecognizedTarget =
        label.toLowerCase().includes("hub") ||
        label.toLowerCase().includes("overview") ||
        label.toLowerCase().includes("interview") ||
        label.toLowerCase().includes("catalog") ||
        label.toLowerCase().includes("setup") ||
        label.toLowerCase().includes("directory") ||
        label.toLowerCase().includes("report");

    const displayLabel = isHistoryOrigin && isRecognizedTarget ? "Back to History" : label;
    const accessibleAriaLabel = ariaLabel === "Go back" && displayLabel !== "Back" ? displayLabel : ariaLabel;

    return { displayLabel, accessibleAriaLabel };
}

describe("Back Navigation UX & Decision Architecture", () => {
    describe("Resolution Priority Matrix", () => {
        it("prioritizes location.state.from over explicit 'to' prop and history", () => {
            const result = resolveBackDestination({
                from: "/history",
                to: "/prepare/quiz",
                historyIdx: 3,
                fallback: "/",
            });
            assert.deepEqual(result, { type: "from", target: "/history" });
        });

        it("prioritizes explicit 'to' prop over browser history when 'from' is absent", () => {
            const result = resolveBackDestination({
                from: undefined,
                to: "/prepare/quiz",
                historyIdx: 2,
                fallback: "/",
            });
            assert.deepEqual(result, { type: "to", target: "/prepare/quiz" });
        });

        it("uses navigate(-1) browser history when no 'from' and no 'to' are specified", () => {
            const result = resolveBackDestination({
                from: undefined,
                to: undefined,
                historyIdx: 1,
                fallback: "/",
            });
            assert.deepEqual(result, { type: "history", target: -1 });
        });

        it("falls back to safe static route when entered via bookmark or direct URL (idx === 0)", () => {
            const result = resolveBackDestination({
                from: undefined,
                to: undefined,
                historyIdx: 0,
                fallback: "/assess/placement",
            });
            assert.deepEqual(result, { type: "fallback", target: "/assess/placement" });
        });

        it("defaults fallback to root ('/') when unspecified", () => {
            const result = resolveBackDestination({
                from: undefined,
                to: undefined,
                historyIdx: 0,
            });
            assert.deepEqual(result, { type: "fallback", target: "/" });
        });
    });

    describe("Contextual Label and Accessibility Resolution", () => {
        it("returns default labels when no special context is present", () => {
            const { displayLabel, accessibleAriaLabel } = resolveBackLabels({
                from: undefined,
                label: "Back",
            });
            assert.equal(displayLabel, "Back");
            assert.equal(accessibleAriaLabel, "Go back");
        });

        it("dynamically adapts label to 'Back to History' when navigating from /history", () => {
            const testLabels = [
                "Back to Quiz Catalog",
                "Back to Placement Setup",
                "Back to Interview Hub",
                "Back to Problem Directory",
                "Back to Report",
            ];

            for (const label of testLabels) {
                const { displayLabel, accessibleAriaLabel } = resolveBackLabels({
                    from: "/history",
                    label,
                });
                assert.equal(displayLabel, "Back to History");
                assert.equal(accessibleAriaLabel, "Back to History");
            }
        });

        it("preserves explicit custom label and syncs aria-label", () => {
            const { displayLabel, accessibleAriaLabel } = resolveBackLabels({
                from: "/prepare",
                label: "Back to Catalog",
            });
            assert.equal(displayLabel, "Back to Catalog");
            assert.equal(accessibleAriaLabel, "Back to Catalog");
        });

        it("preserves explicit custom aria-label when passed", () => {
            const { displayLabel, accessibleAriaLabel } = resolveBackLabels({
                from: "/prepare",
                label: "Back to Catalog",
                ariaLabel: "Return to DSA Problem Catalog",
            });
            assert.equal(displayLabel, "Back to Catalog");
            assert.equal(accessibleAriaLabel, "Return to DSA Problem Catalog");
        });
    });

    describe("Route & Page Integration Audit", () => {
        const auditedPages = [
            { file: "pages/credits/CreditHistoryPage.jsx", expectedPattern: /<BackButton fallback="\/pricing"/ },
            { file: "pages/Pricing.jsx", expectedPattern: /<BackButton fallback="\/"/ },
            { file: "pages/Progress.jsx", expectedPattern: /<BackButton fallback="\/"/ },
            { file: "pages/InterviewHistory.jsx", expectedPattern: /<BackButton fallback="\/"/ },
            { file: "aptitude/pages/AptitudeDashboard.jsx", expectedPattern: /<BackButton/ },
            { file: "gd/pages/GDOverview.jsx", expectedPattern: /<BackButton/ },
            { file: "pages/Resume.jsx", expectedPattern: /<BackButton/ },
            { file: "components/Step1SetUp.jsx", expectedPattern: /<BackButton/ },
        ];

        for (const { file, expectedPattern } of auditedPages) {
            it(`verifies back navigation implementation in ${file}`, () => {
                const fullPath = path.join(clientSrcDir, file);
                assert.ok(fs.existsSync(fullPath), `Target file exists: ${file}`);
                const content = fs.readFileSync(fullPath, "utf8");
                assert.match(content, expectedPattern, `${file} contains expected BackButton implementation`);
            });
        }

        const activeExamScreens = [
            "pages/prepare/QuizScreen.jsx",
            "aptitude/pages/TestScreen.jsx",
            "pages/assess/MockPlacementChamber.jsx",
            "components/Step2Interview.jsx",
            "gd/pages/GDRoom.jsx",
        ];

        for (const file of activeExamScreens) {
            it(`verifies deliberate omission of generic BackButton in active workflow ${file}`, () => {
                const fullPath = path.join(clientSrcDir, file);
                assert.ok(fs.existsSync(fullPath), `Target file exists: ${file}`);
                const content = fs.readFileSync(fullPath, "utf8");
                assert.ok(
                    !content.includes("<BackButton"),
                    `${file} does not contain generic <BackButton> (protects active timed/media session)`
                );
            });
        }
    });
});
