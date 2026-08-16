import { NextRequest, NextResponse } from "next/server";

const FDA_LABEL_URL = "https://api.fda.gov/drug/label.json";

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

function cleanHtml(input: string): string {
  return input
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|tr|td|th|section)>/gi, "\n")
    .replace(/<(br|hr)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

function sectionText(parts: string[] | undefined): string | null {
  if (!parts || parts.length === 0) return null;
  const cleaned = parts
    .map((p) => cleanHtml(p))
    .filter((s) => s.length > 0)
    .join("\n");
  return cleaned.length > 0 ? cleaned : null;
}

async function fetchLabel(id: string) {
  const url = `${FDA_LABEL_URL}?search=${encodeURIComponent(`id:"${id}"`)}&limit=1`;
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: FdaResult[] };
  const r = json.results?.[0];
  if (!r || !r.id && !r.openfda) return null;

  const of = r.openfda ?? {};
  const warnings = sectionText(r.warnings_and_cautions) ?? sectionText(r.warnings_and_precautions);

  return {
    id,
    brand: of.brand_name?.[0] ?? null,
    generic: of.generic_name?.[0] ?? null,
    manufacturer: of.manufacturer_name?.[0] ?? null,
    route: (of.route ?? []).join(", "),
    productType: of.product_type?.[0] ?? null,
    indications: sectionText(r.indications_and_usage),
    mechanismOfAction: sectionText(r.mechanism_of_action),
    dosage: sectionText(r.dosage_and_administration),
    sideEffects: sectionText(r.adverse_reactions),
    warnings,
    contraindications: sectionText(r.contraindications),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const label = await fetchLabel(id);
  if (!label) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(label);
}