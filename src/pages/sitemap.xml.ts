// src/pages/sitemap.xml.ts  ->  https://www.bandung-tour.com/en/sitemap.xml
// Dibuat saat build dari D1: semua halaman + lastmod + foto (hero & galeri) untuk Google Images.
import type { APIRoute } from "astro";
import {
  getAllPosts,
  CATEGORIES,
  DESTINATIONS,
  categoryUrl,
  destinationUrl,
  postUrl,
  isoDate,
  type Post,
} from "../lib/posts";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

interface Entry {
  path: string;
  lastmod?: string;
  images?: string[];
}

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + "/";
  const abs = (p: string) => new URL(p, site ?? "https://www.bandung-tour.com").href;

  const posts = await getAllPosts();
  const last = (list: Post[]) =>
    list.map((p) => isoDate(p.updated_at ?? p.created_at)).filter(Boolean).sort().pop();
  const imagesOf = (p: Post) =>
    [p.image_url, ...p.gallery.map((g) => g.url)].filter((u): u is string => !!u).filter((u, i, a) => a.indexOf(u) === i).slice(0, 20);

  const entries: Entry[] = [{ path: base, lastmod: last(posts) }];

  // Halaman daftar: hanya yang punya artikel (halaman kosong tidak masuk sitemap)
  if (posts.length) entries.push({ path: `${base}blog/`, lastmod: last(posts) });
  for (const c of Object.keys(CATEGORIES)) {
    const list = posts.filter((p) => p.category === c);
    if (list.length) entries.push({ path: categoryUrl(c), lastmod: last(list) });
  }
  // Halaman destinasi: hanya yang punya panduan atau artikel terkait
  for (const d of Object.keys(DESTINATIONS)) {
    const list = posts.filter((p) => p.destination === d || (p.category === "destinations" && p.slug === d));
    if (list.length) {
      const guide = list.find((p) => p.category === "destinations" && p.slug === d);
      entries.push({ path: destinationUrl(d), lastmod: last(list), images: guide ? imagesOf(guide) : undefined });
    }
  }
  // Artikel (panduan destinasi sudah masuk di atas lewat destinationUrl)
  const seen = new Set(entries.map((e) => e.path));
  for (const p of posts) {
    const path = postUrl(p);
    if (seen.has(path)) continue;
    seen.add(path);
    entries.push({ path, lastmod: isoDate(p.updated_at ?? p.created_at), images: imagesOf(p) });
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    entries
      .map(
        (e) =>
          `  <url>\n    <loc>${esc(abs(e.path))}</loc>\n` +
          (e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : "") +
          (e.images ?? []).map((u) => `    <image:image><image:loc>${esc(abs(u))}</image:loc></image:image>\n`).join("") +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
