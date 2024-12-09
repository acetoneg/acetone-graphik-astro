import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "server", // Required for Netlify Edge Functions
  adapter: netlify({
    imageCDN: true,
  }),
  image: {
    domains: [], // Add any external domains you want to allow
    remotePatterns: [], // Add any remote patterns you want to allow
  },
});
