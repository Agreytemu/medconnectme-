import { chromium } from "playwright";

const BASE = "http://localhost:3000";

const browser = await chromium.launch({ channel: "msedge", headless: true });

const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await desktop.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForSelector(".tabular-nums", { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(600);

const panelCount = await page.locator("[data-panel]").count();
check("9 panels present", panelCount === 9, `count=${panelCount}`);

const progress = await page.locator("text=/\\d{2} \\/ 09/").first().innerText();
check("progress shows 01 / 09", progress.trim() === "01 / 09", progress.trim());

const track = page.locator("div[data-panel-track]").count();
await page.waitForTimeout(300);

const initialLeft = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? el.scrollLeft : -1;
});
check("track starts at 0", initialLeft === 0, `left=${initialLeft}`);

await page.mouse.move(720, 450);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(900);
let left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("one wheel notch -> next page", left === 1, `panelIdx=${left}`);

await page.mouse.wheel(0, 400);
await page.waitForTimeout(400);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(60);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(700);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("first notch advances, rapid notches blocked", left === 2, `panelIdx=${left}`);

await page.waitForTimeout(700);
await page.mouse.wheel(0, 400);
await page.waitForTimeout(900);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("after cooldown, next notch advances", left === 3, `panelIdx=${left}`);

await page.waitForTimeout(700);
await page.mouse.wheel(0, -400);
await page.waitForTimeout(900);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("wheel up -> previous page", left === 2, `panelIdx=${left}`);

await page.keyboard.press("End");
await page.waitForTimeout(1100);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("End key -> last panel", left === 8, `panelIdx=${left}`);
const lastProgress = await page.locator("text=/\\d{2} \\/ 09/").first().innerText();
check("progress shows 09 / 09", lastProgress.trim() === "09 / 09", lastProgress.trim());

await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(1100);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("ArrowLeft -> previous panel", left === 7, `panelIdx=${left}`);

await page.keyboard.press("Home");
await page.waitForTimeout(1100);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("Home key -> first panel", left === 0, `panelIdx=${left}`);

await page.mouse.move(1200, 450);
await page.mouse.down();
await page.mouse.move(400, 450, { steps: 8 });
await page.waitForTimeout(150);
await page.mouse.up();
await page.waitForTimeout(900);
left = await page.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? Math.round(el.scrollLeft / el.clientWidth) : -1;
});
check("drag snaps to a panel", left > 0, `panelIdx=${left}`);

await page.screenshot({ path: "C:/Users/brayan/AppData/Local/Temp/opencode/verify/panel-1.png" });
await page.keyboard.press("ArrowRight");
await page.waitForTimeout(1100);
await page.screenshot({ path: "C:/Users/brayan/AppData/Local/Temp/opencode/verify/panel-2.png" });

const activeLink = await page
  .locator("nav button")
  .filter({ hasText: "How it works" })
  .evaluate((el) => el.className)
  .catch(() => "n/a");
check("nav active class present", /after:scale-x-100/.test(activeLink), activeLink.slice(0, 60));

await desktop.close();

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mobile.newPage();
await mpage.goto(BASE, { waitUntil: "networkidle" });
await mpage.waitForTimeout(800);

const trackCount = await mpage.locator("div[data-panel-track]").count();
const trackEl = await mpage.evaluate(() => {
  const el = document.querySelector("div[data-panel-track]");
  return el ? { exists: true, left: el.scrollLeft } : { exists: false };
});
check("mobile: track exists but no horizontal", trackEl.exists === true && trackEl.left === 0, JSON.stringify(trackEl));

const docHeight = await mpage.evaluate(() => document.body.scrollHeight);
const winHeight = await mpage.evaluate(() => window.innerHeight);
check("mobile: page is vertically scrollable", docHeight > winHeight * 2, `h=${docHeight}/${winHeight}`);

await mpage.mouse.move(195, 420);
await mpage.mouse.wheel(0, 500);
await mpage.waitForTimeout(600);
const scrollY = await mpage.evaluate(() => window.scrollY);
check("mobile: wheel scrolls page vertically", scrollY > 0, `y=${scrollY}`);

await mobile.close();

await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
