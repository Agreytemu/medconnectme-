import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const load = async () => {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForSelector(".tabular-nums", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);
  };
  const idx = () =>
    page.evaluate(() => {
      const el = document.querySelector("div[data-panel-track]");
      return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
    });
  const goFaq = async () => {
    await page.keyboard.press("Home");
    await page.waitForTimeout(1100);
    await page.keyboard.press("End");
    await page.waitForTimeout(1100);
  };

  await load();

  // 1. FAQ accordion expands + collapses
  await goFaq();
  const faqBtn = page.locator('[data-panel="faq"] button').first();
  const state = () =>
    faqBtn.evaluate((el) => {
      const row = el.nextElementSibling;
      return row ? row.className : "none";
    });
  const initially = await state();
  check("FAQ item 0 open by default", /grid-rows-\[1fr\]/.test(initially), initially);
  await faqBtn.click();
  await page.waitForTimeout(600);
  const closed = await state();
  check("FAQ collapses on click", /grid-rows-\[0fr\]/.test(closed), closed);
  await faqBtn.click();
  await page.waitForTimeout(600);
  const opened = await state();
  check("FAQ re-expands on second click", /grid-rows-\[1fr\]/.test(opened), opened);

  // 2. Pricing monthly/yearly toggle
  await page.keyboard.press("Home");
  await page.waitForTimeout(1100);
  await page.keyboard.press("End");
  await page.waitForTimeout(500);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(1100);
  const has6 = await page.locator('[data-panel="pricing"]').locator("text=$6").count();
  await page.locator('[data-panel="pricing"] button', { hasText: "Monthly" }).first().click();
  await page.waitForTimeout(500);
  const has8 = await page.locator('[data-panel="pricing"]').locator("text=$8").count();
  check("pricing monthly/yearly toggle", has6 > 0 && has8 > 0, `yearly:$6=${has6} monthly:$8=${has8}`);

  // 3. Nav button scrolls to a panel
  await page.keyboard.press("Home");
  await page.waitForTimeout(1100);
  await page.locator("nav button", { hasText: "How it works" }).click();
  await page.waitForTimeout(1100);
  check("nav 'How it works' scrolls to daily", (await idx()) === 1, `panelIdx=${await idx()}`);

  // 4. Nav Login link -> /login
  await page.locator('header a[href="/login"]').filter({ hasText: "Sign in" }).click();
  await page.waitForTimeout(1200);
  check("nav Sign in -> /login", page.url().includes("/login"), page.url());

  // 5. Hero CTA -> /login
  await load();
  await page.locator('[data-panel="intro"] a[href="/login"]').first().click();
  await page.waitForTimeout(1200);
  check("hero CTA -> /login", page.url().includes("/login"), page.url());

  // 6. Hero secondary button scrolls to daily
  await load();
  await page.locator('[data-panel="intro"] button').click();
  await page.waitForTimeout(1100);
  check("hero 'see it' scrolls to daily", (await idx()) === 1, `panelIdx=${await idx()}`);

  // 7. Pricing card CTA href
  await goFaq();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(1100);
  const href = await page.locator('[data-panel="pricing"] a').first().getAttribute("href");
  check("pricing CTA href -> /login", href === "/login", href);

  // 8. Lang toggle -> Kiswahili
  await page.keyboard.press("Home");
  await page.waitForTimeout(1100);
  await page.locator("header button", { hasText: "Kiswahili" }).first().click();
  await page.waitForTimeout(800);
  const swText = await page.locator("nav button").first().innerText();
  check("lang toggle -> Kiswahili", /Jinsi/i.test(swText), swText);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll button checks passed");
process.exit(failed ? 1 : 0);
