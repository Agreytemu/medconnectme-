import { NextRequest, NextResponse } from "next/server";
import { cleanDrugQuery, searchCandidates } from "@/lib/fda/drug-search";

const FDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const SEARCH_FIELDS = [
  "openfda.generic_name",
  "openfda.brand_name",
  "openfda.substance_name",
] as const;
const MAX_PER_TERM = 60;
const MAX_TOTAL = 200;

type FdaResult = {
  id?: string;
  set_id?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    route?: string[];
    product_type?: string[];
  };
};

interface DrugHit {
  id: string;
  brand: string;
  generic: string;
  manufacturer: string | null;
  route: string;
  productType: string | null;
}

const cache = new Map<string, { items: DrugHit[]; at: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const CACHE_MAX = 300;

function readCache(key: string): DrugHit[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.items;
}

function writeCache(key: string, items: DrugHit[]) {
  if (cache.size >= CACHE_MAX) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { items, at: Date.now() });
}

function buildSearch(term: string): string {
  const parts = SEARCH_FIELDS.map((f) => `${f}:"${term}"`);
  return `(${parts.join(" OR ")})`;
}

async function fetchTerm(term: string): Promise<DrugHit[]> {
  const url = `${FDA_LABEL_URL}?search=${encodeURIComponent(
    buildSearch(term)
  )}&limit=${MAX_PER_TERM}`;
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: FdaResult[] };
  if (!json.results) return [];

  const out: DrugHit[] = [];
  for (const r of json.results) {
    const generic = (r.openfda?.generic_name?.[0] ?? "").trim();
    const brand = r.openfda?.brand_name?.[0]?.trim() ?? "";
    const id = r.id ?? r.set_id;
    if (!generic || !id) continue;
    out.push({
      id,
      brand,
      generic,
      manufacturer: r.openfda?.manufacturer_name?.[0] ?? null,
      route: (r.openfda?.route ?? []).join(", "),
      productType: r.openfda?.product_type?.[0] ?? null,
    });
  }
  return out;
}

function dedupe(items: DrugHit[]): DrugHit[] {
  const seen = new Set<string>();
  const out: DrugHit[] = [];
  for (const item of items) {
    const key = `${item.generic.toLowerCase()}|${item.route.toLowerCase()}|${item.brand.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= MAX_TOTAL) break;
  }
  return out;
}

async function searchAll(q: string): Promise<DrugHit[]> {
  const terms = searchCandidates(q);
  const batches = await Promise.all(terms.map((term) => fetchTerm(term)));
  return dedupe(batches.flat());
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const raw = cleanDrugQuery(params.get("q") ?? "");
  if (raw.length < 2) return NextResponse.json({ results: [], hasMore: false });

  const skip = Math.max(0, Number(params.get("skip") ?? 0) || 0);
  const limit = Math.min(50, Math.max(5, Number(params.get("limit") ?? 25) || 25));

  let items = readCache(raw);
  if (!items) {
    items = await searchAll(raw);
    writeCache(raw, items);
  }

  const slice = items.slice(skip, skip + limit);
  return NextResponse.json({ results: slice, hasMore: skip + limit < items.length });
}