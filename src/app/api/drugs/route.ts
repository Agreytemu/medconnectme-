import { NextRequest, NextResponse } from "next/server";

const FDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const SEARCH_FIELDS = ["openfda.generic_name", "openfda.brand_name"] as const;
const LIMIT = 30;

type FdaResult = {
  id?: string;
  set_id?: string;
  indications_and_usage?: string[];
  mechanism_of_action?: string[];
  dosage_and_administration?: string[];
  adverse_reactions?: string[];
  warnings_and_cautions?: string[];
  warnings_and_precautions?: string[];
  contraindications?: string[];
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    route?: string[];
    product_type?: string[];
  };
};

async function fetchFda(url: string): Promise<{ status: number; results?: FdaResult[] }> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  } catch {
    return { status: 0 };
  }
  if (!res.ok) return { status: res.status };
  const json = (await res.json()) as { results?: FdaResult[] };
  return { status: res.status, results: json.results };
}

async function queryOpenFda(q: string) {
  const out: Array<Record<string, unknown>> = [];
  const seen = new Set<string>();

  for (const field of SEARCH_FIELDS) {
    for (const quoted of [true, false] as const) {
      const term = quoted ? `"${q}"` : q;
      const url = `${FDA_LABEL_URL}?search=${encodeURIComponent(`${field}:${term}`)}&limit=${LIMIT}`;
      const { status, results } = await fetchFda(url);
      if (!results || results.length === 0) continue;

      for (const r of results) {
        const generic = (r.openfda?.generic_name?.[0] ?? "").trim().toLowerCase();
        const brand = r.openfda?.brand_name?.[0]?.trim() ?? "";
        const route = (r.openfda?.route?.[0] ?? "").trim().toLowerCase();
        const key = `${generic}|${route}|${brand.toLowerCase()}`;
        if (!generic || seen.has(key)) continue;
        seen.add(key);
        out.push({
          id: r.id ?? r.set_id,
          brand,
          generic: r.openfda?.generic_name?.[0] ?? "",
          manufacturer: r.openfda?.manufacturer_name?.[0] ?? null,
          route: (r.openfda?.route ?? []).join(", "),
          productType: r.openfda?.product_type?.[0] ?? null,
        });
      }

      if (status === 200) return out;
      if (out.length > 0) return out;
    }
  }

  return out;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().replace(/\s+/g, " ") ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const results = await queryOpenFda(q);
  return NextResponse.json({ results });
}