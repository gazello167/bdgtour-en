// Data produk untuk artikel kategori Itineraries (kolom `product` di D1, berisi JSON).
// Halaman memakai tata letak produk hanya kalau kolom ini terisi dan valid.

export interface PricePoint {
  pax: string;          // "2", "7", atau rentang seperti "8-12"
  vehicle: string;      // "Avanza (4)"
  price: number;        // harga per orang, rupiah
  pickup?: number;      // tambahan per orang untuk jemput di luar Bandung
}

export interface PriceTable {
  hotel?: string;       // mis. "Hyper Square Paskal 23 or similar"
  pickup_label?: string;
  rows: PricePoint[];
  notes: string[];
}

export interface DayStep {
  text: string;                                   // boleh memakai **tebal**
  pick?: { title?: string; options: string[] };   // daftar pilihan destinasi di bawah langkah ini
}

export interface ItineraryDay {
  day: number;
  title?: string;
  steps: DayStep[];
}

export interface Fleet {
  name: string;
  seats: string;
}

export interface Product {
  duration?: string;                // "3 days / 2 nights"
  price_table?: PriceTable;
  days: ItineraryDay[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  fleet: Fleet[];
  note?: string;
  cta?: { label: string; url: string };
}

const str = (v: unknown, max = 400) => String(v ?? "").trim().slice(0, max);
const strList = (v: unknown, maxItems = 30): string[] =>
  (Array.isArray(v) ? v : []).map((x) => str(x)).filter(Boolean).slice(0, maxItems);

export function parseProduct(value: unknown): Product | null {
  if (!value) return null;
  let p: any;
  try {
    p = JSON.parse(String(value));
  } catch {
    return null;
  }
  if (!p || typeof p !== "object") return null;

  const days: ItineraryDay[] = (Array.isArray(p.days) ? p.days : [])
    .map((d: any, i: number) => ({
      day: Number.isFinite(Number(d?.day)) ? Number(d.day) : i + 1,
      title: str(d?.title, 120) || undefined,
      steps: (Array.isArray(d?.steps) ? d.steps : [])
        .map((s: any) => {
          const options = strList(s?.pick?.options, 24);
          return {
            text: str(s?.text),
            pick: options.length ? { title: str(s.pick.title, 120) || undefined, options } : undefined,
          };
        })
        .filter((s: DayStep) => s.text),
    }))
    .filter((d: ItineraryDay) => d.steps.length);

  const rows: PricePoint[] = (Array.isArray(p.price_table?.rows) ? p.price_table.rows : [])
    .map((r: any) => ({
      pax: str(r?.pax, 20),
      vehicle: str(r?.vehicle, 80),
      price: Math.round(Number(r?.price)),
      pickup: Number.isFinite(Number(r?.pickup)) && Number(r.pickup) > 0 ? Math.round(Number(r.pickup)) : undefined,
    }))
    .filter((r: PricePoint) => r.pax && Number.isFinite(r.price) && r.price > 0);

  const price_table: PriceTable | undefined = rows.length
    ? {
        hotel: str(p.price_table.hotel, 160) || undefined,
        pickup_label: str(p.price_table.pickup_label, 160) || undefined,
        rows,
        notes: strList(p.price_table.notes, 8),
      }
    : undefined;

  if (!days.length && !price_table) return null;

  const ctaUrl = str(p.cta?.url, 500);
  const cta = /^(https:\/\/|\/(?!\/))/.test(ctaUrl) ? { label: str(p.cta?.label, 60) || "Ask about this trip", url: ctaUrl } : undefined;

  return {
    duration: str(p.duration, 60) || undefined,
    price_table,
    days,
    includes: strList(p.includes),
    excludes: strList(p.excludes),
    highlights: strList(p.highlights),
    fleet: (Array.isArray(p.fleet) ? p.fleet : [])
      .map((f: any) => ({ name: str(f?.name, 60), seats: str(f?.seats, 60) }))
      .filter((f: Fleet) => f.name)
      .slice(0, 8),
    note: str(p.note, 600) || undefined,
    cta,
  };
}

// ---------------------------------------------------------------------------
// Pembantu tampilan
// ---------------------------------------------------------------------------
// Kurs untuk harga dalam dolar di kartu home
export const USD_RATE = 18000;
export const usd = (idr: number) => Math.round(idr / USD_RATE);
export const rp = (n: number) => `Rp ${n.toLocaleString("en-US")}`;

// Teks polos -> HTML aman; **x** menjadi <strong>x</strong>
export function inline(text: string): string {
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function priceRange(p: Product): { low: PricePoint; high: PricePoint } | null {
  const rows = p.price_table?.rows;
  if (!rows?.length) return null;
  const sorted = [...rows].sort((a, b) => a.price - b.price);
  return { low: sorted[0], high: sorted[sorted.length - 1] };
}
