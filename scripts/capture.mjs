import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { maskPage } from "./mask.mjs";

const BASE = "http://localhost:3000";
const OUT = "public/screenshots";

const shots = [
  { path: "dashboard", url: "/dashboard" },
  { path: "timetable", url: "/timetable" },
  { path: "grades", url: "/grades" },
  { path: "rotations", url: "/rotations" },
  { path: "case-logs", url: "/case-logs" },
  { path: "formulary", url: "/formulary" },
  { path: "id-card", url: "/id-card" },
];

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
});

async function waitStable(page, timeout = 25000) {
  const start = Date.now();
  let last = "";
  let stableSince = 0;
  while (Date.now() - start < timeout) {
    const len = await page.evaluate(
      () => document.querySelector("main")?.innerText?.length ?? 0
    );
    const now = Date.now();
    if (len === last) {
      if (!stableSince) stableSince = now;
      if (now - stableSince > 600) return;
    } else {
      last = len;
      stableSince = 0;
    }
    await page.waitForTimeout(200);
  }
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");
  await page.waitForTimeout(2500);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard$|\/admin$/, { timeout: 15000 });
  await waitStable(page);
}

await mkdir(OUT, { recursive: true });

const studentCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const student = await studentCtx.newPage();
await login(student, "student@med.local", "student123");

for (const s of shots) {
  await student.goto(`${BASE}${s.url}`, { waitUntil: "domcontentloaded" });
  await waitStable(student);
  await maskPage(student, s.path);
  await student.screenshot({ path: `${OUT}/${s.path}.png` });
  console.log("captured", s.path);
}

await studentCtx.close();

const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const admin = await adminCtx.newPage();
await login(admin, "admin@med.local", "admin123");
await admin.waitForURL(/\/admin$/, { timeout: 15000 });
await admin.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
await waitStable(admin);
await maskPage(admin, "admin");
await admin.screenshot({ path: `${OUT}/admin.png` });
console.log("captured admin");
await adminCtx.close();

await browser.close();
console.log("done");
