import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Intellivora PDF Performance Report Generator
 * Generates branded, print-friendly PDF performance reports for all four assessment modules
 * (Mock Interview, Aptitude Testing, Group Discussion, ATS Resume Compatibility) using a
 * shared layout coordinate system to prevent content overlap and manage multi-page pagination.
 */

// Color Palette Constants (High-contrast, Print-Friendly)
const COLORS = {
  // Document Base
  bgWhite: [255, 255, 255],
  bgCard: [248, 250, 252],        // #F8FAFC
  bgSubtle: [241, 245, 249],      // #F1F5F9
  border: [226, 232, 240],        // #E2E8F0
  borderDark: [203, 213, 225],    // #CBD5E1

  // Brand Accents
  primaryBlue: [37, 99, 235],     // #2563EB Brand Blue
  skyBlue: [56, 189, 248],        // #38BDF8
  indigo: [79, 70, 229],          // #4F46E5

  // Typography
  textDark: [15, 23, 42],         // #0F172A Slate 900
  textSecondary: [51, 65, 85],    // #334155 Slate 700
  textMuted: [100, 116, 139],     // #64748B Slate 500
  textLight: [148, 163, 184],     // #94A3B8 Slate 400

  // Semantic Status / Tier Colors
  tierHigh: [22, 163, 74],        // #16A34A Green 600
  tierMedium: [217, 119, 6],      // #D97706 Amber 600
  tierLow: [225, 29, 72],         // #E11D48 Rose 600
};

// ============================================================================
// LAYOUT CONSTANTS — single source of truth for all spacing
// ============================================================================
const LAYOUT = {
  MARGIN: 15,
  LINE_HEIGHT: 4,          // mm per line of 8pt text
  ITEM_GAP: 5,             // vertical gap between bullet items
  SECTION_GAP: 8,          // gap between major sections
  BOX_PADDING_TOP: 7,      // top padding inside roundedRect boxes
  BOX_PADDING_BOTTOM: 5,   // bottom padding below last content in a box
  BOX_SIDE_PADDING: 5,     // left/right padding inside boxes
  FOOTER_RESERVED: 18,     // reserved space at page bottom for footer
  SECTION_TITLE_HEIGHT: 8, // height consumed by renderSectionTitle
};

// Cached Logo Data URL
let cachedLogoDataUrl = null;

/**
 * Loads logo as Base64 Data URL using browser Image and Canvas.
 */
export const loadLogoBase64 = async () => {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const dataUrl = await new Promise((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = "/logo-dark.png";
      });
      if (dataUrl) {
        cachedLogoDataUrl = dataUrl;
        return dataUrl;
      }
    } catch {
      // Fall through to return null
    }
  }

  return null;
};

/**
 * Formats a Date into standard readable string:
 * "Generated on 19 September 2026, 3:45 PM"
 */
export const formatDateTime = (dateObj) => {
  const d = dateObj ? new Date(dateObj) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const day = validDate.getDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = months[validDate.getMonth()];
  const year = validDate.getFullYear();

  let hours = validDate.getHours();
  const minutes = String(validDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `Generated on ${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

// ============================================================================
// PAGE-BREAK HELPER — checks if neededHeight fits, adds page if not
// ============================================================================
/**
 * Checks whether `neededHeight` mm fits on the current page below `currentY`.
 * If not, adds a new page and returns the top margin Y.
 * @returns {number} The Y coordinate to start drawing at.
 */
const checkPageBreak = (doc, currentY, neededHeight) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableBottom = pageHeight - LAYOUT.FOOTER_RESERVED;
  if (currentY + neededHeight > usableBottom) {
    doc.addPage();
    return LAYOUT.MARGIN + 5; // small top margin on continuation pages
  }
  return currentY;
};

/**
 * Renders consistent print-friendly header on page 1 of any report.
 * Left: Logo image + Brand Wordmark + Subtitle
 * Right: Report Title + Formatted Timestamp
 * Bottom: Horizontal divider rule
 */
const renderReportHeader = async (doc, { title, date }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = LAYOUT.MARGIN;
  const logoData = await loadLogoBase64();

  let textStartX = margin;

  // Render logo image if available
  if (logoData) {
    try {
      // logo-dark.png aspect ratio: 1550x1015 (1.527 : 1)
      const logoW = 12;
      const logoH = 12 / 1.527; // ~7.86mm
      doc.addImage(logoData, "PNG", margin, 12, logoW, logoH);
      textStartX = margin + logoW + 3;
    } catch {
      textStartX = margin;
    }
  }

  // Brand Wordmark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primaryBlue);
  doc.text("INTELLIVORA", textStartX, 17);

  // Platform Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text("AI CAREER TRAINING & ASSESSMENT PLATFORM", textStartX, 22);

  // Right Side: Report Title & Date
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textDark);
  doc.text(title.toUpperCase(), pageWidth - margin, 17, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(formatDateTime(date), pageWidth - margin, 22, { align: "right" });

  // Subtle Horizontal Divider Rule
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.6);
  doc.line(margin, 27, pageWidth - margin, 27);

  return 33; // Next Y coordinate
};

/**
 * Renders Candidate and Session Information Section
 */
const renderUserDetails = (doc, { startY, candidateName, candidateEmail, sessionId, attributes = [] }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = LAYOUT.MARGIN;
  const contentWidth = pageWidth - margin * 2;

  const hasFourthRow = Boolean(attributes[3]);
  const boxHeight = hasFourthRow ? 30 : 24;
  startY = checkPageBreak(doc, startY, boxHeight + 5);

  // Box Background
  doc.setFillColor(...COLORS.bgCard);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, startY, contentWidth, boxHeight, 2, 2, "FD");

  const col1X = margin + 6;
  const col2X = margin + (contentWidth / 2) + 6;

  // Row 1: Candidate Name & Attribute 1
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(`Candidate: ${candidateName || "Candidate"}`, col1X, startY + 7);

  if (attributes[0]) {
    doc.text(`${attributes[0].label}: ${attributes[0].value}`, col2X, startY + 7);
  }

  // Row 2: Candidate Email & Attribute 2
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  doc.text(`Email: ${candidateEmail || "Not provided"}`, col1X, startY + 13);

  if (attributes[1]) {
    doc.text(`${attributes[1].label}: ${attributes[1].value}`, col2X, startY + 13);
  }

  // Row 3: Session Ref & Attribute 3
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textMuted);
  const sessionRef = sessionId ? `#${String(sessionId).slice(-8).toUpperCase()}` : "ASSESSMENT-VERIFIED";
  doc.text(`Session ID: ${sessionRef}`, col1X, startY + 19);

  if (attributes[2]) {
    doc.text(`${attributes[2].label}: ${attributes[2].value}`, col2X, startY + 19);
  }

  // Row 4: Attribute 4 (e.g. Target Company)
  if (attributes[3]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${attributes[3].label}: ${attributes[3].value}`, col2X, startY + 25);
  }

  return startY + boxHeight + LAYOUT.ITEM_GAP;
};

/**
 * Renders an Executive Scorecard Callout Card with Prominent Score, Performance Tier, and Metrics.
 * Uses a strict 3-column non-overlapping layout:
 * - Column 1 (Score Block): X = 15 to 63 (width 48mm)
 * - Column 2 (Tier Title & Description): X = 66 to 134 (width 68mm)
 * - Column 3 (Telemetry / Stat Badges): X = 138 to 195 (width 57mm)
 * Columns are mathematically disjoint (no overlapping X-ranges at any Y).
 */
const renderScorecardCard = (doc, { startY, score, maxScore = 100, scoreLabel = "Overall Score", tierText, tierDescription, metrics = [] }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = LAYOUT.MARGIN; // 15
  const contentWidth = pageWidth - margin * 2; // 180

  const numScore = Number(score) || 0;
  const ratio = maxScore > 0 ? numScore / maxScore : 0;
  const percentage = Math.round(ratio * 100);

  // Determine Tier Color
  let tierColor = COLORS.tierMedium;
  if (ratio >= 0.8) {
    tierColor = COLORS.tierHigh;
  } else if (ratio < 0.5) {
    tierColor = COLORS.tierLow;
  }

  // Pre-calculate Column 2 (Middle) height to size the card dynamically
  const col2X = margin + 51; // 66mm
  const col2Width = 68; // strictly ends at 134mm (before Col 3 at 138mm)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const splitTitle = doc.splitTextToSize(tierText || "Assessment Complete", col2Width);
  const titleHeight = splitTitle.length * 4.2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const splitDesc = doc.splitTextToSize(tierDescription || "", col2Width);
  const descHeight = splitDesc.length * 3.4;

  const middleContentHeight = 8 + titleHeight + (splitDesc.length > 0 ? 2 + descHeight : 0) + 4;
  const cardHeight = Math.max(34, middleContentHeight);

  startY = checkPageBreak(doc, startY, cardHeight + LAYOUT.SECTION_GAP);

  // Card Background
  doc.setFillColor(...COLORS.bgCard);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, startY, contentWidth, cardHeight, 2.5, 2.5, "FD");

  // Left Colored Accent Bar
  doc.setFillColor(...tierColor);
  doc.roundedRect(margin, startY, 4, cardHeight, 1.5, 1.5, "F");

  // =========================================================================
  // COLUMN 1: Score Block (X = 15 to 63)
  // =========================================================================
  const scoreText = `${score}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...tierColor);
  doc.text(scoreText, margin + 8, startY + 16);

  const scoreTextWidth = doc.getTextWidth(scoreText);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(` / ${maxScore}`, margin + 8 + scoreTextWidth + 1.5, startY + 16);

  // Score Subtext
  doc.setFontSize(7.5);
  doc.text(`${scoreLabel} (${percentage}%)`, margin + 8, startY + 23);

  // =========================================================================
  // COLUMN 2: Tier Title & Description Safe Zone (X = 66 to 134, width = 68mm)
  // =========================================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textDark);
  doc.text(splitTitle, col2X, startY + 10);

  if (splitDesc.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.textSecondary);
    doc.text(splitDesc, col2X, startY + 10 + titleHeight + 1.5);
  }

  // =========================================================================
  // COLUMN 3: Metrics Safe Zone (X = 138 to 195, width = 57mm)
  // =========================================================================
  const col3X = 138;
  const col3Width = 57;

  if (metrics.length === 4) {
    // 2x2 Grid for 4 metrics (GD, Aptitude) - eliminates horizontal squeeze
    const halfColW = col3Width / 2; // 28.5mm each
    const cellCenters = [
      { x: col3X + halfColW * 0.5, yVal: startY + 9.5, yLbl: startY + 14.5 },
      { x: col3X + halfColW * 1.5, yVal: startY + 9.5, yLbl: startY + 14.5 },
      { x: col3X + halfColW * 0.5, yVal: startY + 21.5, yLbl: startY + 26.5 },
      { x: col3X + halfColW * 1.5, yVal: startY + 21.5, yLbl: startY + 26.5 },
    ];

    metrics.forEach((m, idx) => {
      if (idx >= 4) return;
      const cell = cellCenters[idx];

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.textDark);
      doc.text(String(m.value), cell.x, cell.yVal, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(m.label, cell.x, cell.yLbl, { align: "center" });
    });
  } else if (metrics.length === 3) {
    // 3 metrics in one row (Interview)
    const colW = col3Width / 3; // 19mm each
    metrics.forEach((m, idx) => {
      const centerX = col3X + colW * (idx + 0.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.textDark);
      doc.text(String(m.value), centerX, startY + 13, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(m.label, centerX, startY + 19, { align: "center" });
    });
  } else if (metrics.length > 0) {
    // 1 or 2 metrics (ATS)
    const colW = col3Width / metrics.length;
    metrics.forEach((m, idx) => {
      const centerX = col3X + colW * (idx + 0.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.textDark);
      doc.text(String(m.value), centerX, startY + 13, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(m.label, centerX, startY + 19, { align: "center" });
    });
  }

  return startY + cardHeight + LAYOUT.SECTION_GAP;
};

/**
 * Section Title Renderer
 */
const renderSectionTitle = (doc, title, startY) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = LAYOUT.MARGIN;

  // Ensure at least ~20mm available for the title + some content below it
  startY = checkPageBreak(doc, startY, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textDark);
  doc.text(title.toUpperCase(), margin, startY);

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, startY + 2.5, pageWidth - margin, startY + 2.5);

  return startY + LAYOUT.SECTION_TITLE_HEIGHT;
};

/**
 * Renders a text block inside a dynamically-sized roundedRect box.
 * Computes height from actual splitTextToSize output.
 * @returns {number} Updated currentY after the box + spacing.
 */
const renderTextBox = (doc, { startY, text, contentWidth }) => {
  const margin = LAYOUT.MARGIN;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const splitText = doc.splitTextToSize(text, contentWidth - 10);
  const textHeight = splitText.length * LAYOUT.LINE_HEIGHT;
  const boxHeight = LAYOUT.BOX_PADDING_TOP + textHeight + LAYOUT.BOX_PADDING_BOTTOM;

  startY = checkPageBreak(doc, startY, boxHeight + LAYOUT.SECTION_GAP);

  doc.setFillColor(...COLORS.bgCard);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, startY, contentWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textDark);
  doc.text(splitText, margin + LAYOUT.BOX_SIDE_PADDING, startY + LAYOUT.BOX_PADDING_TOP);

  return startY + boxHeight + LAYOUT.SECTION_GAP;
};

/**
 * Renders a side-by-side Strengths + Improvements grid with dynamic heights and wrapped bullet text.
 * Uses doc.splitTextToSize to ensure long text never overflows or truncates mid-word.
 * @returns {number} Updated currentY.
 */
const renderStrengthsImprovementsGrid = (doc, { startY, strengths, improvements, strengthsTitle = "Observed Strengths", improvementsTitle = "Areas for Elevation", contentWidth }) => {
  const margin = LAYOUT.MARGIN;
  const halfWidth = (contentWidth - 6) / 2; // 87mm
  const bulletIndent = 4; // mm for bullet dot
  const textMaxWidth = halfWidth - LAYOUT.BOX_SIDE_PADDING * 2 - bulletIndent; // 87 - 10 - 4 = 73mm
  const titleOffset = 6.5;
  const contentStart = titleOffset + 5.5; // 12mm from box top
  const lineHeight = 3.8;
  const itemGap = 2.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Pre-calculate wrapped lines and exact height for Column 1
  const strWrapped = strengths.map((s) => doc.splitTextToSize(s, textMaxWidth));
  const strTotalHeight = strWrapped.reduce((acc, lines) => acc + lines.length * lineHeight + itemGap, 0);

  // Pre-calculate wrapped lines and exact height for Column 2
  const impWrapped = improvements.map((imp) => doc.splitTextToSize(imp, textMaxWidth));
  const impTotalHeight = impWrapped.reduce((acc, lines) => acc + lines.length * lineHeight + itemGap, 0);

  const maxContentHeight = Math.max(strTotalHeight, impTotalHeight, 15);
  const boxHeight = contentStart + maxContentHeight + LAYOUT.BOX_PADDING_BOTTOM;

  startY = checkPageBreak(doc, startY, boxHeight + LAYOUT.SECTION_GAP);

  // --- Column 1: Strengths Box (X = 15 to 102) ---
  doc.setFillColor(...COLORS.bgCard);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, startY, halfWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.tierHigh);
  doc.text(strengthsTitle, margin + LAYOUT.BOX_SIDE_PADDING, startY + titleOffset);

  let strY = startY + contentStart;
  strWrapped.forEach((lines) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.tierHigh);
    doc.text("•", margin + LAYOUT.BOX_SIDE_PADDING, strY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    doc.text(lines, margin + LAYOUT.BOX_SIDE_PADDING + bulletIndent, strY);
    strY += lines.length * lineHeight + itemGap;
  });

  // --- Column 2: Improvements Box (X = 108 to 195) ---
  const impX = margin + halfWidth + 6;
  doc.setFillColor(...COLORS.bgCard);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(impX, startY, halfWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.tierMedium);
  doc.text(improvementsTitle, impX + LAYOUT.BOX_SIDE_PADDING, startY + titleOffset);

  let impY = startY + contentStart;
  impWrapped.forEach((lines) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.tierMedium);
    doc.text("•", impX + LAYOUT.BOX_SIDE_PADDING, impY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    doc.text(lines, impX + LAYOUT.BOX_SIDE_PADDING + bulletIndent, impY);
    impY += lines.length * lineHeight + itemGap;
  });

  return startY + boxHeight + LAYOUT.SECTION_GAP;
};

/**
 * Appends standard running footers with pagination across all pages
 */
const applyReportFooters = (doc, reportTitle) => {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = LAYOUT.MARGIN;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);

    // Divider rule
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    // Left: Brand Platform
    doc.text("Generated by Intellivora — AI Career Training Platform", margin, pageHeight - 7);

    // Center: Report Title
    doc.text(reportTitle, pageWidth / 2, pageHeight - 7, { align: "center" });

    // Right: Page X of Y
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }
};

// ============================================================================
// 1. INTERVIEW PERFORMANCE REPORT GENERATOR
// ============================================================================
export const generateInterviewReportPdf = async ({
  report,
  candidateName = "Candidate",
  candidateEmail = "candidate@intellivora.app",
  date,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = LAYOUT.MARGIN;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const {
    _id,
    id,
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    role = "Technical Role",
    experience = "Mid Level",
    mode = "Technical",
    targetCompany,
    questionWiseScore = [],
  } = report || {};

  const score10 = Number(finalScore).toFixed(1);

  let tier = "Developing Competency";
  let tierDesc = "Demonstrated foundational skills with clear growth vectors in technical depth and articulation.";
  if (finalScore >= 8) {
    tier = "Placement-Ready Performance";
    tierDesc = "Exemplary domain architecture, concise verbal delivery, and strong problem-solving composure.";
  } else if (finalScore < 5) {
    tier = "Needs Directed Revision";
    tierDesc = "Focus on fundamental problem patterns, structured STAR articulation, and steady cadence.";
  }

  // 1. Header
  let currentY = await renderReportHeader(doc, {
    title: "AI Interview Performance Report",
    date,
  });

  // 2. User & Session Details
  currentY = renderUserDetails(doc, {
    startY: currentY,
    candidateName,
    candidateEmail,
    sessionId: _id || id,
    attributes: [
      { label: "Target Role", value: role },
      { label: "Seniority", value: experience },
      { label: "Evaluation Mode", value: mode },
      ...(targetCompany ? [{ label: "Target Company", value: targetCompany }] : []),
    ],
  });

  // 3. Prominent Scorecard
  currentY = renderScorecardCard(doc, {
    startY: currentY,
    score: score10,
    maxScore: 10,
    scoreLabel: "Overall Score",
    tierText: tier,
    tierDescription: tierDesc,
    metrics: [
      { label: "Confidence", value: `${confidence}/10` },
      { label: "Communication", value: `${communication}/10` },
      { label: "Correctness", value: `${correctness}/10` },
    ],
  });

  // 4. Evaluator Verdict & Observations
  currentY = renderSectionTitle(doc, "Evaluator Assessment & Summary Verdict", currentY);

  const verdictText =
    finalScore >= 8
      ? "Candidate demonstrated high poise and articulate problem deconstruction. Technical answers were precise with strong architectural rationale. Recommended for competitive technical interview rounds."
      : finalScore >= 5
      ? "Candidate exhibited solid foundational domain competence. Answers were structured but could benefit from deeper exploration of edge cases and trade-offs using quantifiable STAR examples."
      : "Candidate demonstrated introductory familiarity with core principles but exhibited hesitation under technical inquiry. Targeted drills in system architecture and verbal structuring are advised.";

  currentY = renderTextBox(doc, { startY: currentY, text: verdictText, contentWidth });

  // 5. Strengths & Areas for Improvement
  currentY = renderSectionTitle(doc, "Key Strengths & Growth Vectors", currentY);

  const strengths = [
    confidence >= 7 ? "High composure and structured verbal delivery" : "Steady and clear response cadence",
    correctness >= 7 ? "Strong algorithmic and architectural reasoning" : "Solid conceptual baseline across prompts",
    communication >= 7 ? "Effective answer structuring with concise summaries" : "Polite, active, and responsive interaction",
  ];
  const improvements = [
    correctness < 8 ? "Elaborate systematically on edge cases and failure modes" : "Incorporate cross-functional leadership precedents",
    communication < 8 ? "Quantify project impact with specific metrics (e.g. latency, scale)" : "Practice high-level executive summaries before deep dives",
    confidence < 8 ? "Minimize hesitation fillers through timed response practice" : "Continue challenging advanced distributed design drills",
  ];

  currentY = renderStrengthsImprovementsGrid(doc, {
    startY: currentY,
    strengths,
    improvements,
    contentWidth,
  });

  // 6. Question-by-Question Rubric Table
  currentY = renderSectionTitle(doc, "Question-by-Question Evaluation Breakdown", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Interview Question", "Score", "Evaluator Critique & Feedback"]],
    body: questionWiseScore.map((q, i) => [
      `${i + 1}`,
      q.question || `Interview Question ${i + 1}`,
      `${q.score ?? 0}/10`,
      q.feedback || "Evaluated against technical precision, structural clarity, and response relevance.",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      valign: "top",
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: COLORS.textDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: COLORS.bgCard,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 68 },
      2: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: COLORS.primaryBlue },
      3: { cellWidth: "auto" },
    },
  });

  // 7. Footer
  applyReportFooters(doc, "AI Interview Performance Report");

  const todayStr = new Date().toISOString().split("T")[0];
  const roleSlug = (role || "Interview").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`Intellivora_Interview_Report_${roleSlug}_${todayStr}.pdf`);
  return doc;
};

// ============================================================================
// 2. APTITUDE ASSESSMENT PERFORMANCE REPORT GENERATOR
// ============================================================================
export const generateAptitudeReportPdf = async ({
  result,
  topicName = "Aptitude Drill",
  candidateName = "Candidate",
  candidateEmail = "candidate@intellivora.app",
  date,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = LAYOUT.MARGIN;

  const scoreNum = Number(result?.score ?? 0).toFixed(2);
  const totalMarks = result?.totalMarks || 10;
  const accuracy = Number(result?.accuracy ?? 0).toFixed(1);
  const timeTakenSec = result?.timeTakenSeconds || 0;
  const mins = Math.floor(timeTakenSec / 60);
  const secs = timeTakenSec % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  let tier = "Satisfactory Analytical Baseline";
  let tierDesc = "Demonstrated consistent problem-solving accuracy with room to optimize speed on complex analytical items.";
  if (Number(accuracy) >= 80) {
    tier = "Exemplary Analytical Speed";
    tierDesc = "High quantitative agility and precision under timed examination constraints.";
  } else if (Number(accuracy) < 50) {
    tier = "Needs Systematic Revision";
    tierDesc = "Review foundational formulas, shortcut heuristics, and time allocation across question types.";
  }

  // 1. Header
  let currentY = await renderReportHeader(doc, {
    title: "Aptitude Assessment Scorecard",
    date,
  });

  // 2. User Details
  currentY = renderUserDetails(doc, {
    startY: currentY,
    candidateName,
    candidateEmail,
    sessionId: result?._id || result?.attemptId,
    attributes: [
      { label: "Assessment Topic", value: topicName },
      { label: "Difficulty Level", value: result?.difficulty || "Medium" },
      { label: "Total Duration", value: timeFormatted },
      ...(result?.targetCompany ? [{ label: "Target Company", value: result.targetCompany }] : []),
    ],
  });

  // 3. Prominent Scorecard
  const correctVal = result?.correct ?? result?.correctCount ?? 0;
  const incorrectVal = result?.incorrect ?? result?.incorrectCount ?? 0;
  const skippedVal = result?.skipped ?? result?.unansweredCount ?? 0;

  currentY = renderScorecardCard(doc, {
    startY: currentY,
    score: scoreNum,
    maxScore: totalMarks,
    scoreLabel: "Candidate Net Score",
    tierText: tier,
    tierDescription: tierDesc,
    metrics: [
      { label: "Accuracy", value: `${accuracy}%` },
      { label: "Correct", value: String(correctVal) },
      { label: "Incorrect", value: String(incorrectVal) },
      { label: "Skipped", value: String(skippedVal) },
    ],
  });

  // 4. Performance Diagnostics Overview
  currentY = renderSectionTitle(doc, "Performance Analysis & Marking Scheme", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Metric Parameter", "Result Value", "Benchmark Target", "Marking Weight"]],
    body: [
      ["Net Score", `${scoreNum} / ${totalMarks}`, ">= 8.00 pts", "Standard Scoring"],
      ["Accuracy Percentage", `${accuracy}%`, ">= 75.0%", "Correct / Attempted"],
      ["Correct Answers", `${correctVal} Questions`, `${Math.round(totalMarks * 0.8)}+ Questions`, "+1.00 Mark Each"],
      ["Incorrect Answers", `${incorrectVal} Questions`, "<= 2 Questions", "-0.25 Mark Penalty"],
      ["Skipped Items", `${skippedVal} Questions`, "Selective Pass", "0.00 No Penalty"],
      ["Average Time / Question", `${result?.questions?.length ? Math.round(timeTakenSec / result.questions.length) : 0} seconds`, "<= 60 seconds", "Pacing Metric"],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: COLORS.textDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.bgCard,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 35, fontStyle: "bold", textColor: COLORS.primaryBlue },
      2: { cellWidth: 45 },
      3: { cellWidth: "auto", textColor: COLORS.textMuted },
    },
  });

  currentY = doc.lastAutoTable.finalY + LAYOUT.SECTION_GAP;

  // 5. Itemized Question Diagnostic & Solution Key
  currentY = renderSectionTitle(doc, "Itemized Question Diagnostic & Key", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["#", "Question Text", "Your Selection", "Correct Key", "Status", "Solution Derivation"]],
    body: (result?.questions || []).map((q) => [
      `${q.questionNumber || "-"}`,
      q.question || "Assessment item",
      q.selectedAnswer || "Skipped",
      q.correctAnswer || "-",
      (q.result || "SKIPPED").toUpperCase(),
      q.explanation || "Direct formula solution verified against topic test bank.",
    ]),
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      valign: "top",
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: COLORS.textDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.bgCard,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 62 },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: COLORS.primaryBlue },
      4: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      5: { cellWidth: "auto", fontSize: 7 },
    },
    didParseCell: (data) => {
      if (data.column.index === 4 && data.section === "body") {
        const val = String(data.cell.raw).toUpperCase();
        if (val === "CORRECT") {
          data.cell.styles.textColor = COLORS.tierHigh;
        } else if (val === "INCORRECT") {
          data.cell.styles.textColor = COLORS.tierLow;
        } else {
          data.cell.styles.textColor = COLORS.textMuted;
        }
      }
    },
  });

  // 6. Footer
  applyReportFooters(doc, "Aptitude Assessment Scorecard");

  const todayStr = new Date().toISOString().split("T")[0];
  const topicSlug = (topicName || "Aptitude").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`Intellivora_Aptitude_Report_${topicSlug}_${todayStr}.pdf`);
  return doc;
};

// ============================================================================
// 3. GROUP DISCUSSION EVALUATION REPORT GENERATOR
// ============================================================================
export const generateGDReportPdf = async ({
  session,
  candidateName = "Candidate",
  candidateEmail = "candidate@intellivora.app",
  date,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = LAYOUT.MARGIN;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const evaluation = session?.evaluation || {};
  const overallScore = evaluation.overallScore ?? 0;
  const breakdown = evaluation.breakdown || {};
  const strengths = evaluation.strengths || [];
  const improvements = evaluation.improvements || [];
  const detailedFeedback =
    evaluation.detailedFeedback ||
    "The candidate contributed steadily throughout the debate. Continued deliberate focus on active listening and summarizing peer perspectives will further enhance your executive presence.";

  const topic = session?.topic || "Deliberation Session";
  const category = session?.category || "General Discussion";
  const duration = session?.durationMinutes ? `${session.durationMinutes} mins` : "10 mins";

  let tier = "Balanced Discussion Contributor";
  let tierDesc = "Demonstrated constructive participation, respectful interjections, and coherent reasoning.";
  if (overallScore >= 80) {
    tier = "Executive Discussion Lead";
    tierDesc = "Exceptional synthesis of peer arguments, balanced airtime, and persuasive framing.";
  } else if (overallScore < 60) {
    tier = "Developing Executive Presence";
    tierDesc = "Focus on earlier participation, active listening summaries, and contrarian challenge management.";
  }

  // 1. Header
  let currentY = await renderReportHeader(doc, {
    title: "Group Discussion Evaluation",
    date,
  });

  // 2. User Details
  currentY = renderUserDetails(doc, {
    startY: currentY,
    candidateName,
    candidateEmail,
    sessionId: session?._id || session?.id,
    attributes: [
      { label: "Discussion Topic", value: topic.length > 30 ? `${topic.slice(0, 30)}...` : topic },
      { label: "Category & Difficulty", value: `${category} • ${session?.difficulty || "Mid"}` },
      { label: "Duration & Cohort", value: `${duration} • 3 AI Peers + You` },
    ],
  });

  // 3. Prominent Scorecard
  currentY = renderScorecardCard(doc, {
    startY: currentY,
    score: overallScore,
    maxScore: 100,
    scoreLabel: "Discussion Benchmark",
    tierText: tier,
    tierDescription: tierDesc,
    metrics: [
      { label: "Articulation", value: `${breakdown.articulation ?? 0}/100` },
      { label: "Leadership", value: `${breakdown.leadership ?? 0}/100` },
      { label: "Listening", value: `${breakdown.listening ?? 0}/100` },
      { label: "Crit. Thinking", value: `${breakdown.criticalThinking ?? 0}/100` },
    ],
  });

  // 4. 4-Pillar Evaluation Matrix Table
  currentY = renderSectionTitle(doc, "4-Pillar Evaluation Matrix", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Competency Dimension", "Score", "Benchmark Level", "Evaluation Criterion"]],
    body: [
      [
        "Articulation & Clarity",
        `${breakdown.articulation ?? 0} / 100`,
        breakdown.articulation >= 80 ? "Crisp Delivery" : "Clear Delivery",
        "Speech clarity, conciseness, structured argumentation, and minimal filler words.",
      ],
      [
        "Leadership & Initiative",
        `${breakdown.leadership ?? 0} / 100`,
        breakdown.leadership >= 80 ? "Proactive Lead" : "Balanced Initiative",
        "Floor claiming, steering deliberation, and facilitating group consensus.",
      ],
      [
        "Active Listening & Empathy",
        `${breakdown.listening ?? 0} / 100`,
        breakdown.listening >= 80 ? "High Empathy" : "Constructive Rebuttal",
        "Referencing peer arguments by name, smooth yields, and synthesis.",
      ],
      [
        "Critical Thinking & Depth",
        `${breakdown.criticalThinking ?? 0} / 100`,
        breakdown.criticalThinking >= 80 ? "Data Driven" : "Logical Reasoning",
        "Grounding assertions in empirical precedents and stress-testing edge cases.",
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLORS.textDark,
      lineColor: COLORS.border,
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: COLORS.textDark,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: COLORS.bgCard,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 30, fontStyle: "bold", textColor: COLORS.primaryBlue },
      2: { cellWidth: 35 },
      3: { cellWidth: "auto", textColor: COLORS.textSecondary },
    },
  });

  currentY = doc.lastAutoTable.finalY + LAYOUT.SECTION_GAP;

  // 5. Strengths & Improvements Grid
  currentY = renderSectionTitle(doc, "Key Discussion Observations", currentY);

  const defaultStrengths = [
    "Constructive opening statement framing the debate",
    "Maintained respectful discourse throughout all turns",
    "Articulate and well-paced delivery",
  ];
  const defaultImprovements = [
    "Summarize peer perspectives before introducing counterpoints",
    "Balance talking duration to leave space for collaborative consensus",
    "Introduce concrete empirical case studies or precedents",
  ];

  currentY = renderStrengthsImprovementsGrid(doc, {
    startY: currentY,
    strengths: strengths.length > 0 ? strengths.slice(0, 3) : defaultStrengths,
    improvements: improvements.length > 0 ? improvements.slice(0, 3) : defaultImprovements,
    contentWidth,
  });

  // 6. Detailed AI Coach Synthesis
  currentY = renderSectionTitle(doc, "AI Coach Diagnostic Synthesis", currentY);
  currentY = renderTextBox(doc, { startY: currentY, text: detailedFeedback, contentWidth });

  // 7. Full Turn Transcript Breakdown Table
  if (session?.transcript && session.transcript.length > 0) {
    currentY = renderSectionTitle(doc, "Deliberation Turn Transcript Log", currentY);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Turn", "Speaker", "Transcript Excerpt"]],
      body: session.transcript.map((t, i) => [
        `#${t.turnNumber || i + 1}`,
        t.speakerId === "candidate" ? "Candidate (You)" : t.speakerName || `Agent (${t.speakerId})`,
        t.content || "-",
      ]),
      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        valign: "top",
        textColor: COLORS.textDark,
        lineColor: COLORS.border,
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: COLORS.textDark,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLORS.bgCard,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 35, fontStyle: "bold" },
        2: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.section === "body") {
          if (String(data.cell.raw).includes("Candidate")) {
            data.cell.styles.textColor = COLORS.primaryBlue;
          }
        }
      },
    });
  }

  // 8. Footer
  applyReportFooters(doc, "Group Discussion Evaluation");

  const todayStr = new Date().toISOString().split("T")[0];
  const topicSlug = (topic || "GD").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`Intellivora_GD_Report_${topicSlug}_${todayStr}.pdf`);
  return doc;
};

// ============================================================================
// 4. ATS RESUME SCORECARD REPORT GENERATOR
// ============================================================================
export const generateATSReportPdf = async ({
  analysis,
  targetRole = "Software Engineer",
  experienceLevel = "Mid Level",
  candidateName = "Candidate",
  candidateEmail = "candidate@intellivora.app",
  fileName = "Resume.pdf",
  date,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = LAYOUT.MARGIN;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  const overallScore = analysis?.resumeScore ?? analysis?.score ?? analysis?.overallScore ?? analysis?.atsScore ?? 75;
  const formatScore = analysis?.atsScore ?? analysis?.formatScore ?? analysis?.formattingScore ?? 80;
  const keywordScore = analysis?.interviewReadinessScore ?? analysis?.keywordScore ?? analysis?.relevanceScore ?? 70;
  const summary =
    analysis?.summary ||
    analysis?.executiveSummary ||
    "Resume evaluated against recruiting applicant tracking systems, parsing algorithms, and role keyword benchmarks.";
  const strengths = analysis?.strengths || [];
  const improvements = analysis?.improvements || analysis?.weaknesses || [];
  const recommendations = analysis?.recommendations || analysis?.actionableRecommendations || analysis?.improvementSuggestions || [];
  const missingSkills = analysis?.missingSkills || [];

  let tier = "Competitive Match";
  let tierDesc = "Good structural alignment with standard applicant tracking systems and target role expectations.";
  if (overallScore >= 80) {
    tier = "Optimized ATS Tier";
    tierDesc = "High keyword density, clean semantic hierarchy, and standard typography.";
  } else if (overallScore < 60) {
    tier = "Formatting & Keyword Gaps";
    tierDesc = "Significant gaps identified in recruiting keyword density or structural parseability.";
  }

  // 1. Header
  let currentY = await renderReportHeader(doc, {
    title: "ATS Resume Compatibility Audit",
    date,
  });

  // 2. User Details
  currentY = renderUserDetails(doc, {
    startY: currentY,
    candidateName,
    candidateEmail,
    sessionId: analysis?.uploadId || "ATS-AUDIT",
    attributes: [
      { label: "Target Role", value: targetRole },
      { label: "Seniority Level", value: experienceLevel },
      { label: "Evaluated Document", value: fileName },
    ],
  });

  // 3. Prominent Scorecard
  currentY = renderScorecardCard(doc, {
    startY: currentY,
    score: overallScore,
    maxScore: 100,
    scoreLabel: "ATS Benchmark Score",
    tierText: tier,
    tierDescription: tierDesc,
    metrics: [
      { label: "ATS Parsing", value: `${formatScore}/100` },
      { label: "Interview Read.", value: `${keywordScore}/100` },
    ],
  });

  // 4. Executive Summary
  currentY = renderSectionTitle(doc, "Executive ATS Diagnostic Summary", currentY);
  currentY = renderTextBox(doc, { startY: currentY, text: summary, contentWidth });

  // 5. Strengths & Improvements
  currentY = renderSectionTitle(doc, "Key ATS Strengths & Areas for Improvement", currentY);

  const defaultStrengths = [
    "Standard section headers detected (Experience, Skills, Education)",
    "Contact information and email correctly parsed",
    "Clean single-column chronological layout",
  ];
  const defaultImprovements = [
    "Incorporate more role-specific action verbs and tech keywords",
    "Quantify project accomplishments with measurable metrics",
    "Ensure reverse-chronological order across experience entries",
  ];

  currentY = renderStrengthsImprovementsGrid(doc, {
    startY: currentY,
    strengths: strengths.length > 0 ? strengths.slice(0, 3) : defaultStrengths,
    improvements: improvements.length > 0 ? improvements.slice(0, 3) : defaultImprovements,
    strengthsTitle: "What Passed ATS Screening",
    improvementsTitle: "Recommended ATS Enhancements",
    contentWidth,
  });

  // 6. Missing Target Skills (if present)
  if (missingSkills && missingSkills.length > 0) {
    currentY = renderSectionTitle(doc, `Missing Target Skills for ${targetRole}`, currentY);

    const skillsText = missingSkills.join("  •  ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const splitSkills = doc.splitTextToSize(skillsText, contentWidth - 10);
    const skillsTextHeight = splitSkills.length * LAYOUT.LINE_HEIGHT;
    // title line (6mm) + skills text + bottom padding
    const skillsBoxHeight = 6 + skillsTextHeight + LAYOUT.BOX_PADDING_BOTTOM;

    currentY = checkPageBreak(doc, currentY, skillsBoxHeight + LAYOUT.SECTION_GAP);

    doc.setFillColor(...COLORS.bgCard);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, contentWidth, skillsBoxHeight, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.tierLow);
    doc.text("High-Priority Keywords Absent from Resume:", margin + LAYOUT.BOX_SIDE_PADDING, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    doc.text(splitSkills, margin + LAYOUT.BOX_SIDE_PADDING, currentY + 6 + LAYOUT.LINE_HEIGHT + 2);

    currentY += skillsBoxHeight + LAYOUT.SECTION_GAP;
  }

  // 7. Actionable Recommendations Table
  if (recommendations.length > 0) {
    currentY = renderSectionTitle(doc, "Actionable ATS Optimization Plan", currentY);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Priority", "Recommended Action Plan"]],
      body: recommendations.map((rec, i) => [`0${i + 1}`, rec]),
      styles: {
        fontSize: 8,
        cellPadding: 3.5,
        valign: "top",
        textColor: COLORS.textDark,
        lineColor: COLORS.border,
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: COLORS.textDark,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLORS.bgCard,
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center", fontStyle: "bold", textColor: COLORS.primaryBlue },
        1: { cellWidth: "auto" },
      },
    });
  }

  // 8. Footer
  applyReportFooters(doc, "ATS Resume Compatibility Audit");

  const todayStr = new Date().toISOString().split("T")[0];
  const roleSlug = (targetRole || "Resume").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`Intellivora_ATS_Report_${roleSlug}_${todayStr}.pdf`);
  return doc;
};
