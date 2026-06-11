/**
 * openFDA device/event (MAUDE) queries for surgical staplers.
 *
 * Scope: product codes GAG (Stapler, Surgical) and GDW (Staple, Implantable) —
 * the same families FDA analyzed in its 2019 surgical stapler safety review.
 * All data is public. https://open.fda.gov/apis/device/event/
 */

const BASE = "https://api.fda.gov/device/event.json";
const SCOPE = 'device.device_report_product_code:(GAG+OR+GDW)';
const REVALIDATE = 60 * 60 * 24; // refresh from openFDA daily

interface CountResult {
  time: string; // YYYYMMDD
  count: number;
}

async function fdaJson(query: string): Promise<unknown> {
  const res = await fetch(`${BASE}?${query}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`openFDA ${res.status} for ${query}`);
  return res.json();
}

async function countByDate(extraSearch = ""): Promise<CountResult[]> {
  const search = extraSearch ? `${SCOPE}+AND+${extraSearch}` : SCOPE;
  const data = (await fdaJson(`search=${search}&count=date_received`)) as {
    results: CountResult[];
  };
  return data.results;
}

function toYearly(days: CountResult[], fromYear: number): Map<number, number> {
  const years = new Map<number, number>();
  for (const d of days) {
    const y = parseInt(d.time.slice(0, 4), 10);
    if (y >= fromYear) years.set(y, (years.get(y) ?? 0) + d.count);
  }
  return years;
}

export interface YearlyByType {
  year: number;
  malfunction: number;
  injury: number;
  death: number;
}

export interface Totals {
  all: number;
  malfunction: number;
  injury: number;
  death: number;
  lastUpdated: string;
}

export async function getYearlyByType(fromYear = 2008): Promise<YearlyByType[]> {
  const [mal, inj, death] = await Promise.all([
    countByDate('event_type:Malfunction'),
    countByDate('event_type:Injury'),
    countByDate('event_type:Death'),
  ]);
  const m = toYearly(mal, fromYear);
  const i = toYearly(inj, fromYear);
  const d = toYearly(death, fromYear);
  const years = [...new Set([...m.keys(), ...i.keys(), ...d.keys()])].sort();
  // Drop the current partial year only if it has barely started
  return years.map((year) => ({
    year,
    malfunction: m.get(year) ?? 0,
    injury: i.get(year) ?? 0,
    death: d.get(year) ?? 0,
  }));
}

export async function getTotals(): Promise<Totals> {
  const data = (await fdaJson(`search=${SCOPE}&count=event_type.exact`)) as {
    meta: { last_updated: string };
    results: { term: string; count: number }[];
  };
  const get = (t: string) =>
    data.results.find((r) => r.term === t)?.count ?? 0;
  const all = data.results.reduce((s, r) => s + r.count, 0);
  return {
    all,
    malfunction: get("Malfunction"),
    injury: get("Injury"),
    death: get("Death"),
    lastUpdated: data.meta.last_updated,
  };
}

/**
 * Use-error lens: phrases that frequently indicate use-related (rather than
 * purely device-intrinsic) failure modes in stapler narratives. This is a
 * keyword heuristic for surfacing candidates to read — not a validated
 * classifier. See the Limitations section.
 */
export const USE_ERROR_PATTERNS: { phrase: string; label: string; why: string }[] = [
  { phrase: "failed to fire", label: "Failed to fire", why: "Often entangled with loading, positioning, or tissue-thickness selection" },
  { phrase: "misfire", label: "Misfire", why: "Frequently involves firing sequence or reload handling" },
  { phrase: "wrong size", label: "Wrong size", why: "Cartridge/tissue mismatch is a classic perception-stage use error" },
  { phrase: "inadvertently", label: "Inadvertent action", why: "Marker for unintended activation or release — action-stage errors" },
  { phrase: "user error", label: "Labeled 'user error'", why: "How reporters themselves attribute the event" },
  { phrase: "difficult to remove", label: "Difficult to remove", why: "Post-fire release problems often involve technique interaction" },
];

export interface KeywordSignal {
  label: string;
  phrase: string;
  why: string;
  total: number;
}

export async function getUseErrorSignals(): Promise<KeywordSignal[]> {
  const results = await Promise.all(
    USE_ERROR_PATTERNS.map(async (p) => {
      const search = `${SCOPE}+AND+mdr_text.text:"${encodeURIComponent(p.phrase)}"`;
      try {
        const data = (await fdaJson(`search=${search}&count=event_type.exact`)) as {
          results: { count: number }[];
        };
        const total = data.results.reduce((s, r) => s + r.count, 0);
        return { ...p, total };
      } catch {
        return { ...p, total: 0 };
      }
    })
  );
  return results.sort((a, b) => b.total - a.total);
}

export interface RecentReport {
  date: string;
  eventType: string;
  brand: string;
  manufacturer: string;
  text: string;
}

export async function getRecentReports(limit = 6): Promise<RecentReport[]> {
  const data = (await fdaJson(
    `search=${SCOPE}&sort=date_received:desc&limit=60`
  )) as {
    results: {
      date_received?: string;
      event_type?: string;
      device?: { brand_name?: string; manufacturer_d_name?: string }[];
      mdr_text?: { text?: string; text_type_code?: string }[];
    }[];
  };
  const reports: RecentReport[] = [];
  for (const r of data.results) {
    const narrative = (r.mdr_text ?? []).find(
      (t) => t.text_type_code === "Description of Event or Problem" && t.text
    );
    if (!narrative?.text || narrative.text.length < 80) continue;
    const d = r.date_received ?? "";
    reports.push({
      date: d ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : "—",
      eventType: r.event_type || "Unknown",
      brand: r.device?.[0]?.brand_name || "Unknown device",
      manufacturer: r.device?.[0]?.manufacturer_d_name || "Unknown manufacturer",
      text: narrative.text,
    });
    if (reports.length >= limit) break;
  }
  return reports;
}
