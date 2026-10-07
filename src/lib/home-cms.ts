// Membaca manifest foto yang dikelola CMS PHP (public_html/en/images/<folder>/manifest.json).
// Dibaca SAAT BUILD lewat HTTP dari situs live, jadi foto masuk HTML dan tampil di slider Splide
// yang sama seperti sebelumnya. CMS memicu build otomatis setiap kali Anda menyimpan foto.

const ORIGIN = (process.env.CMS_ORIGIN || "https://www.bandung-tour.com").replace(/\/$/, "");
const rawBase = import.meta.env.BASE_URL;
const BASE = rawBase.endsWith("/") ? rawBase : rawBase + "/";

export interface CmsDestination {
  src: string;
  alt: string;
  href?: string;
}

export interface CmsTestimonial {
  src: string;
  name: string;
  position: string;
  rating: number;
  text: string;
}

const FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const MAX_ITEMS = 12;

async function loadManifest(dir: string): Promise<any[]> {
  try {
    const res = await fetch(`${ORIGIN}${BASE}images/${dir}/manifest.json?t=${Date.now()}`, {
      signal: AbortSignal.timeout(10000),
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) {
      console.warn(`[home-cms] manifest ${dir}: HTTP ${res.status}, section dilewati`);
      return [];
    }
    const data = await res.json();
    const list = Array.isArray(data?.images) ? data.images : [];
    return list
      .filter((r: any) => r && typeof r.file === "string" && FILE_RE.test(r.file))
      .sort((a: any, b: any) => (Number(a.sort) || 0) - (Number(b.sort) || 0));
  } catch (e) {
    console.warn(`[home-cms] manifest ${dir} tidak terbaca (${(e as Error).message}), section dilewati`);
    return [];
  }
}

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const safeLink = (v: unknown) => (/^\/(?!\/)[^\s"'<>]*$/.test(String(v ?? "").trim()) ? String(v).trim() : undefined);

// Foto tanpa alt text tidak ditampilkan di home.
export async function getDestinationImages(): Promise<CmsDestination[]> {
  return (await loadManifest("destinations"))
    .map((r) => ({
      src: `${BASE}images/destinations/${r.file}`,
      alt: text(r.alt, 200),
      href: safeLink(r.link),
    }))
    .filter((r) => r.alt)
    .slice(0, MAX_ITEMS);
}

// Testimoni tanpa nama atau teks tidak ditampilkan di home.
export async function getTestimonials(): Promise<CmsTestimonial[]> {
  return (await loadManifest("testimonials"))
    .map((r) => ({
      src: `${BASE}images/testimonials/${r.file}`,
      name: text(r.name, 80),
      position: text(r.position, 100),
      rating: Math.min(5, Math.max(1, Math.round(Number(r.rating)) || 5)),
      text: text(r.text, 600),
    }))
    .filter((r) => r.name && r.text)
    .slice(0, MAX_ITEMS);
}
