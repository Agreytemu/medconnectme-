const MASK = "#e2e8f0";

const HELPERS = `
  const MASK = "#e2e8f0";
  function bar(el, h = 14, w = null) {
    if (!el || !el.isConnected) return;
    const len = (el.textContent || "").trim().length;
    const pw = el.parentElement ? el.parentElement.clientWidth : 0;
    const bw = Math.round(Math.min(pw || 400, Math.max(h * 4, len * 8.5 + 24)));
    el.textContent = "";
    el.style.display = "inline-block";
    el.style.height = h + "px";
    el.style.width = (w || bw) + "px";
    el.style.borderRadius = "9999px";
    el.style.background = MASK;
    el.style.verticalAlign = "middle";
    el.style.lineHeight = h + "px";
    el.style.overflow = "hidden";
    el.style.whiteSpace = "nowrap";
  }
  function blankBadge(el) {
    if (!el || !el.isConnected) return;
    el.textContent = "";
    el.style.background = MASK;
    el.style.borderColor = MASK;
    el.style.color = "transparent";
    el.style.width = "48px";
    el.style.height = "20px";
    el.style.display = "inline-flex";
  }
  function chartSkeleton(el) {
    if (!el || !el.isConnected) return;
    el.innerHTML = "";
    el.style.display = "flex";
    el.style.alignItems = "flex-end";
    el.style.gap = "12px";
    el.style.padding = "20px 8px 4px";
    const hs = [42, 68, 34, 82, 56, 90, 48, 62];
    for (const h of hs) {
      const b = document.createElement("div");
      b.style.flex = "1";
      b.style.height = h + "%";
      b.style.maxHeight = "170px";
      b.style.borderRadius = "8px 8px 0 0";
      b.style.background = MASK;
      el.appendChild(b);
    }
  }
  function noFill(el) {
    if (el && el.isConnected) el.style.width = "0";
  }
  function grayBox(el, w, h) {
    if (!el || !el.isConnected) return;
    el.textContent = "";
    el.style.background = MASK;
    el.style.color = "transparent";
    el.style.width = (w || 48) + "px";
    el.style.height = (h || 20) + "px";
    el.style.borderRadius = "6px";
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
  }
  function cardByTitle(txt) {
    return [...document.querySelectorAll("main h3")].find(
      (h) => h.textContent && h.textContent.includes(txt)
    )?.closest("main .rounded-2xl.bg-white");
  }
  function maskInlineTexts(el) {
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3 && n.textContent && n.textContent.trim()) n.textContent = "";
    });
  }
`;

function mk(extra) {
  return (page) => page.evaluate(`${HELPERS}\n${extra}`);
}

export const masks = {
  dashboard: mk(`
    const h1 = document.querySelector("main h1");
    bar(h1, 24);
    const sub = h1?.parentElement?.querySelector("p.text-sm");
    bar(sub, 12);
    document.querySelectorAll("p.text-lg.font-bold").forEach((el) => {
      bar(el, 18);
      const sib = el.parentElement?.querySelector("span");
      if (sib) bar(sib, 11);
    });

    const sched = cardByTitle("Today's Schedule");
    if (sched) {
      sched.querySelectorAll("div.h-10.w-12 span").forEach((s, i) => bar(s, i === 0 ? 10 : 8, i === 0 ? 40 : 26));
      sched.querySelectorAll("p.text-sm.font-medium.text-slate-800").forEach((el) => bar(el, 13));
      sched.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 90));
    }
    const notices = cardByTitle("Latest Notices");
    if (notices) {
      notices.querySelectorAll("p.text-sm.font-medium.text-slate-800").forEach((el) => bar(el, 13));
      notices.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 80));
    }
    const results = cardByTitle("Recent Results");
    if (results) {
      results.querySelectorAll("p.text-sm.font-medium.text-slate-800").forEach((el) => bar(el, 13));
      results.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 80));
      results.querySelectorAll("span.text-sm.font-bold.text-slate-800").forEach((el) => bar(el, 14, 44));
      results.querySelectorAll(".inline-flex.items-center.px-2").forEach((el) => blankBadge(el));
    }
    const reminders = cardByTitle("Reminders");
    if (reminders) {
      reminders.querySelectorAll("p.text-sm.font-medium.text-slate-800").forEach((el) => bar(el, 13));
      reminders.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 70));
    }
  `),

  timetable: mk(`
    document.querySelectorAll("div.h-14.w-16 span").forEach((s, i) => bar(s, i === 0 ? 14 : 10, i === 0 ? 46 : 30));
    document.querySelectorAll("main .rounded-2xl.bg-white p.text-sm.font-semibold.text-slate-800").forEach((el) => bar(el, 13));
    document.querySelectorAll("span.inline-flex.items-center.gap-1").forEach((el) => {
      maskInlineTexts(el);
      const b = document.createElement("span");
      b.style.cssText = "display:inline-block;height:11px;width:72px;border-radius:9999px;background:#e2e8f0;vertical-align:middle";
      el.appendChild(b);
    });
    document.querySelectorAll("div.flex.flex-wrap.items-center > span").forEach((el) => {
      if (!el.querySelector("svg")) bar(el, 11, 80);
    });
  `),

  grades: mk(`
    document.querySelectorAll("p.text-lg.font-bold").forEach((el) => bar(el, 18));
    const chart = document.querySelector("main .h-56");
    if (chart) chartSkeleton(chart);
    document.querySelectorAll("tbody tr").forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 6) return;
      bar(tds[0], 13);
      bar(tds[1], 13);
      const badge = tds[4].querySelector(".inline-flex");
      if (badge) blankBadge(badge);
      bar(tds[3], 13, 44);
      bar(tds[5], 13, 70);
    });
  `),

  rotations: mk(`
    document.querySelectorAll("p.text-lg.font-bold").forEach((el) => bar(el, 18));
    const chart = document.querySelector("main .h-56");
    if (chart) chartSkeleton(chart);
    document.querySelectorAll("main .rounded-2xl.bg-white").forEach((card) => {
      card.querySelectorAll("p.text-sm.font-semibold.text-slate-800").forEach((el) => bar(el, 13));
      card.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 90));
      card.querySelectorAll("p.text-xs.font-semibold.text-slate-700").forEach((el) => bar(el, 12, 64));
      const comp = card.querySelector("span.text-slate-500");
      if (comp) {
        const b = comp.querySelector("b");
        if (b) bar(b, 12, 30);
        maskInlineTexts(comp);
      }
      const pct = card.querySelector("span.font-semibold.text-emerald-600");
      if (pct) bar(pct, 11, 34);
      noFill(card.querySelector("div.bg-emerald-500"));
      card.querySelectorAll("span.text-slate-700.font-medium").forEach((el) => bar(el, 11, 70));
      card.querySelectorAll("div.rounded-lg.px-3.py-2 span.text-slate-400").forEach((el) => bar(el, 11, 120));
      card.querySelectorAll("div.rounded-lg.px-3.py-2 span.font-semibold.text-emerald-600").forEach((el) => bar(el, 11, 24));
    });
  `),

  "case-logs": mk(`
    document.querySelectorAll("p.text-lg.font-bold").forEach((el) => bar(el, 18));
    document.querySelectorAll("main .rounded-2xl.bg-white").forEach((card) => {
      card.querySelectorAll("p.text-sm.font-semibold.text-slate-800").forEach((el) => bar(el, 13));
      card.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 140));
      card.querySelectorAll(".inline-flex.items-center.px-2").forEach((el) => {
        if (/bg-blue-50/.test(el.className)) blankBadge(el);
      });
      card.querySelectorAll("p.text-xs.text-slate-500.mt-2").forEach((el) => {
        maskInlineTexts(el);
        const b = document.createElement("span");
        b.style.cssText = "display:inline-block;height:11px;width:160px;border-radius:9999px;background:#e2e8f0;vertical-align:middle";
        el.appendChild(b);
      });
      card.querySelectorAll("p.text-xs.text-slate-500.line-clamp-2").forEach((el) => bar(el, 11, 240));
    });
  `),

  formulary: mk(`
    document.querySelectorAll("main button.w-full.text-left").forEach((btn) => {
      btn.querySelectorAll("p.text-sm.font-semibold").forEach((el) => bar(el, 13));
      btn.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 90));
      btn.querySelectorAll(".inline-flex.items-center.px-2").forEach((el) => blankBadge(el));
    });
  `),

  "id-card": mk(`
    const avatar = document.querySelector("div.h-12.w-12");
    if (avatar) grayBox(avatar, 48, 48);
    const name = document.querySelector("p.text-lg.font-bold");
    bar(name, 18, 150);
    const email = document.querySelector("p.text-xs.text-slate-400.mb-4");
    bar(email, 11, 180);
    document.querySelectorAll("p.font-semibold.text-slate-700").forEach((el) => bar(el, 12, 80));
    const expires = document.querySelector("p.text-xs.font-semibold.text-slate-600");
    bar(expires, 11, 70);
    const qr = document.querySelector('img[alt="QR"]');
    if (qr) {
      qr.removeAttribute("src");
      qr.style.background = "#e2e8f0";
      qr.style.border = "none";
    }
  `),

  admin: mk(`
    document.querySelectorAll("p.text-lg.font-bold").forEach((el) => {
      bar(el, 18);
      const sib = el.parentElement?.querySelector("span");
      if (sib) bar(sib, 11);
    });
    document.querySelectorAll("main div.h-8.w-8").forEach((av) => {
      grayBox(av, 32, 32);
      const row = av.parentElement;
      if (!row) return;
      row.querySelectorAll("p.text-sm").forEach((el) => bar(el, 13, 220));
      row.querySelectorAll("p.text-xs.text-slate-400").forEach((el) => bar(el, 11, 90));
    });
  `),
};

export async function maskPage(page, key) {
  const fn = masks[key];
  if (!fn) throw new Error(`no mask rule for "${key}"`);
  await fn(page);
  await page.waitForTimeout(150);
}
