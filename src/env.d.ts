/// <reference path="../.astro/types.d.ts" />
// src/env.d.ts
/// <reference types="astro/client" />
declare module "astro:content" {
  interface Render {
    ".md": Promise<{
      Content: import("astro").MarkdownInstance<{}>["Content"];
      headings: import("astro").MarkdownHeading[];
    }>;
  }
}
