import { chromium } from "file:///C:/Users/LENOVO/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs";

async function runBrowserVerification() {
  console.log("Starting Playwright browser verification...");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Users\\LENOVO\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

  try {
    // 1. Load Home and set authenticated user state
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
    console.log("1. Loaded Home at:", page.url());
    await page.waitForFunction(() => typeof window.__store !== "undefined");
    await page.evaluate(() => {
      window.__store.dispatch({
        type: "user/setUserData",
        payload: {
          _id: "test_candidate_01",
          email: "candidate@intellivora.ai",
          name: "Test Candidate",
          credits: 100,
        },
      });
    });
    console.log("   Authenticated test candidate session.");
    await page.waitForTimeout(300);

    // 2. Open Prepare dropdown in DesktopNav
    console.log("2. Testing DSA navigation on Desktop...");
    const prepareTrigger = page.locator('nav[aria-label="Primary Navigation"] button:has-text("Prepare")');
    await prepareTrigger.click();
    await page.waitForTimeout(500);

    const dsaLink = page.locator('nav[aria-label="Primary Navigation"] a[href="/prepare/dsa"]');
    await dsaLink.waitFor({ state: "visible", timeout: 5000 });
    await dsaLink.click();
    await page.waitForURL("**/prepare/dsa");
    console.log("   DSA URL:", page.url());

    // Verify DSA Page content
    const dsaHeadingLocator = page.locator("h1:has-text('Data Structures & Algorithms')");
    await dsaHeadingLocator.waitFor({ state: "visible", timeout: 10000 });
    const dsaHeading = await dsaHeadingLocator.textContent();
    console.log("   DSA Heading:", dsaHeading.trim());

    const dsaBadge = await page.locator("text=Algorithmic Mastery").first().textContent();
    console.log("   DSA Badge:", dsaBadge.trim());

    // Wait for problems table
    await page.waitForSelector("table tbody tr, text=No problems found", { timeout: 10000 });
    const problemRows = await page.locator("table tbody tr").count();
    console.log("   DSA Problem Rows count:", problemRows);
    if (problemRows === 0) {
      throw new Error("Expected DSA problems to load in the table");
    }
    const firstProblemTitle = await page.locator("table tbody tr td a").first().textContent();
    console.log("   First DSA Problem Title:", firstProblemTitle.trim());

    // 3. Open Prepare dropdown and click Coding Practice
    console.log("3. Testing Coding Practice navigation on Desktop...");
    await prepareTrigger.click();
    await page.waitForTimeout(300);

    const codingLink = page.locator('nav[aria-label="Primary Navigation"] a[href="/prepare/coding"]');
    await codingLink.waitFor({ state: "visible", timeout: 5000 });
    await codingLink.click();
    await page.waitForURL("**/prepare/coding");
    console.log("   Coding Practice URL:", page.url());

    // Verify Coding Practice Page content
    const codingHeadingLocator = page.locator("h1:has-text('Coding Practice')");
    await codingHeadingLocator.waitFor({ state: "visible", timeout: 10000 });
    const codingHeading = await codingHeadingLocator.textContent();
    console.log("   Coding Practice Heading:", codingHeading.trim());

    const codingBadge = await page.locator("text=Hands-on Programming").first().textContent();
    console.log("   Coding Practice Badge:", codingBadge.trim());

    // Verify distinct URL and distinct context
    if (page.url().includes("/prepare/dsa")) {
      throw new Error("Coding Practice navigated to /prepare/dsa instead of /prepare/coding");
    }

    // Wait for problems table
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
    const codingProblemRows = await page.locator("table tbody tr").count();
    console.log("   Coding Practice Problem Rows count:", codingProblemRows);
    if (codingProblemRows === 0) {
      throw new Error("Expected Coding Practice problems to load in the table");
    }
    const firstCodingProblemTitle = await page.locator("table tbody tr td a").first().textContent();
    console.log("   First Coding Problem Title:", firstCodingProblemTitle.trim());

    // 4. Test Problem Workspace from Coding context
    console.log("4. Testing Problem Workspace back navigation...");
    await page.goto("http://localhost:5173/prepare/coding/two-sum", { waitUntil: "networkidle" });
    console.log("   Opened:", page.url());

    const backButtonCoding = page.locator('header a:has-text("Coding Practice")');
    await backButtonCoding.waitFor({ state: "visible", timeout: 5000 });
    const backButtonTextCoding = await backButtonCoding.textContent();
    console.log("   Back link text in coding workspace:", backButtonTextCoding.trim());
    const backHrefCoding = await backButtonCoding.getAttribute("href");
    console.log("   Back link href in coding workspace:", backHrefCoding);
    if (backHrefCoding !== "/prepare/coding") {
      throw new Error(`Expected back link to /prepare/coding, got: ${backHrefCoding}`);
    }

    await backButtonCoding.click();
    await page.waitForURL("**/prepare/coding");
    console.log("   Returned to:", page.url());

    // 5. Test Problem Workspace from DSA context
    await page.goto("http://localhost:5173/prepare/dsa/two-sum", { waitUntil: "networkidle" });
    console.log("   Opened:", page.url());

    const backButtonDsa = page.locator('header a:has-text("Problem List")');
    await backButtonDsa.waitFor({ state: "visible", timeout: 5000 });
    const backButtonTextDsa = await backButtonDsa.textContent();
    console.log("   Back link text in DSA workspace:", backButtonTextDsa.trim());
    const backHrefDsa = await backButtonDsa.getAttribute("href");
    console.log("   Back link href in DSA workspace:", backHrefDsa);
    if (backHrefDsa !== "/prepare/dsa") {
      throw new Error(`Expected back link to /prepare/dsa, got: ${backHrefDsa}`);
    }

    await backButtonDsa.click();
    await page.waitForURL("**/prepare/dsa");
    console.log("   Returned to:", page.url());

    // 6. Test Mobile Viewport
    console.log("6. Testing Mobile navigation drawer...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

    const menuButton = page.locator('button[aria-label="Open navigation menu"]');
    await menuButton.click();
    await page.waitForTimeout(300);

    const mobilePrepareAccordion = page.locator('div[role="dialog"] button:has-text("Prepare")');
    await mobilePrepareAccordion.click();
    await page.waitForTimeout(300);

    const mobileCodingBtn = page.locator('div[role="dialog"] button:has-text("Coding Practice")');
    await mobileCodingBtn.click();
    await page.waitForURL("**/prepare/coding");
    console.log("   Mobile navigated to Coding Practice URL:", page.url());

    console.log("\nALL RUNTIME BROWSER CHECKS PASSED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification failed:", err);
  process.exit(1);
});
