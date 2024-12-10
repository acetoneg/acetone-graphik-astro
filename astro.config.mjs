import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  output: "static",
  adapter: netlify(),
  image: {
    service: netlify(),
  },
});
