import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // 1. Import loader bawaan Astro

const blogCollection = defineCollection({
  // 2. Tambahkan loader untuk menentukan lokasi file markdown/json artikel
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.date().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};