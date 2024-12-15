// src/content/config.ts
import { z, defineCollection } from "astro:content";

const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    backgroundColor: z.string(),
    creationDate: z.string().transform((str: string) => new Date(str)),
    description: z.string().nullable(),
    images: z.array(
      z.object({
        default: z.string(),
        description: z.string().nullable(),
        mobile: z.string().nullable(),
        title: z.string(),
      }),
    ),
    metaDescription: z.string().nullable(),
    metaKeywords: z.string().nullable(),
    metaTitle: z.string().nullable(),
    order: z.number(),
    title: z.string(),
    videos: z.array(
      z.object({
        description: z.string().nullable(),
        title: z.string(),
        vimeoId: z.string(),
      }),
    ),
  }),
});

const pagesCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  projects: projectsCollection,
  pages: pagesCollection,
};
