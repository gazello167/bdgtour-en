// @ts-check
import { defineConfig } from 'astro/config';

import icon from 'astro-icon';

import relativeLinks from "astro-relative-links";

// https://astro.build/config
export default defineConfig({
  // --- TAMBAHKAN DUA BARIS INI ---
  site: "https://www.bandung-tour.com",
  base: "/en/",
  // --------------------------------
  devToolbar: {
    enabled: false,
  },
  compressHTML: false,
  output: "static",
  integrations: [
    relativeLinks(),
    icon({
      iconDir: "src/assets/icons",
      svgoOptions: {
        plugins: [
          {
            name: "removeAttrs",
            params: { attrs: "(fill|stroke)" },
          },
          { name: "removeDimensions" },
        ],
      },
    })
  ],
});