import { queryD1 } from "./d1";

// ---------------------------------------------------------------------------
// Struktur situs. Ubah teks "intro" sesuka hati; key (kiri) jangan diubah
// karena dipakai di URL dan di kolom category / destination di D1.
// ---------------------------------------------------------------------------
export const CATEGORIES = {
  destinations: {
    label: "Destinations",
    intro: "Where to go around Bandung, from the highlands of Lembang to the tea country of Pangalengan.",
  },
  "things-to-do": {
    label: "Things to Do",
    intro: "Attractions, activities and day trips that are worth your time.",
  },
  food: {
    label: "Food",
    intro: "What to eat in Bandung and where to find it.",
  },
  hotels: {
    label: "Hotels",
    intro: "Places to stay, by area and budget.",
  },
  "travel-tips": {
    label: "Travel Tips",
    intro: "Practical advice on getting around, timing your trip and saving money.",
  },
  itineraries: {
    label: "Itineraries",
    intro: "Ready-made plans for one to four days in Bandung.",
  },
} as const;

export const DESTINATIONS = {
  lembang: {
    label: "Lembang",
    intro: "Cool highland air, gardens, farms and the road up to Tangkuban Perahu.",
  },
  ciwidey: {
    label: "Ciwidey",
    intro: "Kawah Putih crater lake, tea gardens and strawberry farms south of the city.",
  },
  pangalengan: {
    label: "Pangalengan",
    intro: "Tea plantations, Situ Cileunca lake and quiet mountain roads.",
  },
  "bandung-city": {
    label: "Bandung City",
    intro: "Food, cafes, shopping streets and colonial-era architecture.",
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export type DestinationKey = keyof typeof DESTINATIONS;

export interface Fact {
  label: string;
  value: string;
}

export interface Item {
  name: string;
  price?: string;
  address?: string;
  map_url?: string;
  note?: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  category: CategoryKey;
  destination: DestinationKey | null;
  days: number | null;
  created_at: string;
  updated_at: string | null;
  facts: Fact[];
  items: Item[];
}

// ---------------------------------------------------------------------------
// Ambil data (satu kali query per build, lalu dipakai ulang oleh semua halaman)
// ---------------------------------------------------------------------------
function parseList<T>(value: unknown): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

let cache: Promise<Post[]> | undefined;

export function getAllPosts(): Promise<Post[]> {
  cache ??= queryD1(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC"
  ).then((rows) =>
    rows
      .filter((r) => {
        const ok = r.category in CATEGORIES;
        if (!ok) console.warn(`[posts] "${r.slug}" dilewati: category "${r.category}" tidak dikenal`);
        return ok;
      })
      .map(
        (r) =>
          ({
            ...r,
            destination: r.destination in DESTINATIONS ? r.destination : null,
            facts: parseList<Fact>(r.facts),
            items: parseList<Item>(r.items),
          }) as Post
      )
  );
  return cache;
}

// ---------------------------------------------------------------------------
// URL
// ---------------------------------------------------------------------------
const rawBase = import.meta.env.BASE_URL;
const BASE = rawBase.endsWith("/") ? rawBase : rawBase + "/";

export const categoryUrl = (category: string) => `${BASE}${category}/`;
export const destinationUrl = (destination: string) => `${BASE}destinations/${destination}/`;

// Artikel kategori "destinations" yang slug-nya sama dengan nama destinasi
// (mis. slug "lembang") adalah panduan utama, dan tampil sebagai halaman hub destinasi.
export const isDestinationGuide = (p: Pick<Post, "category" | "slug">) =>
  p.category === "destinations" && p.slug in DESTINATIONS;

export const postUrl = (p: Pick<Post, "category" | "slug">) =>
  isDestinationGuide(p) ? destinationUrl(p.slug) : `${BASE}${p.category}/${p.slug}/`;

// ---------------------------------------------------------------------------
// Tanggal & waktu baca
// ---------------------------------------------------------------------------
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value?: string | null, long = false): string {
  const d = parseDate(value);
  return d
    ? d.toLocaleDateString("en-GB", { day: "numeric", month: long ? "long" : "short", year: "numeric" })
    : "";
}

export const isoDate = (value?: string | null) => parseDate(value)?.toISOString();

export function readingMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
