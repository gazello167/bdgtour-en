// Membaca manifest.json dari folder foto yang dikelola CMS PHP.
export interface HomeImage {
  file: string;
  alt: string;
  caption: string;
  link: string;
  sort: number;
}

export async function loadGallery(dir: string, max: number): Promise<HomeImage[]> {
  try {
    const res = await fetch(`${dir}manifest.json`, { cache: "no-cache" });
    if (!res.ok) return [];
    const data = await res.json();
    const list: unknown[] = Array.isArray(data?.images) ? data.images : [];
    return list
      .map((r: any, i: number) => ({
        file: String(r?.file ?? ""),
        alt: String(r?.alt ?? "").trim(),
        caption: String(r?.caption ?? "").trim(),
        link: String(r?.link ?? "").trim(),
        sort: Number.isFinite(Number(r?.sort)) ? Number(r.sort) : i,
      }))
      .filter((r) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(r.file)) // nama file aman, tanpa path
      .sort((a, b) => a.sort - b.sort)
      .slice(0, max);
  } catch {
    return [];
  }
}

// Tautan hanya boleh path di situs sendiri, mis. /en/destinations/lembang/
export function safePath(link: string): string | null {
  return /^\/(?!\/)[^\s"'<>]*$/.test(link) ? link : null;
}
