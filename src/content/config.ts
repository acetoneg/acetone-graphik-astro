// src/content/config.ts
import { z, defineCollection } from "astro:content";

// Define the schema type separately
export type ProjectSchema = {
  backgroundColor: string;
  creationDate: Date;
  description: string;
  images: {
    default: string;
    description: string | null;
    mobile: string | null;
    title: string;
  }[];
  metaDescription: string | null;
  metaKeywords: string | null;
  metaTitle: string | null;
  order: number;
  title: string;
  videos: string[];
};

// Define the collection
const projectsCollection = defineCollection({
  type: "content",
  schema: z.object({
    backgroundColor: z.string(),
    creationDate: z.string().transform((str: string) => new Date(str)),
    description: z.string(),
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
    videos: z.array(z.string()),
  }),
});

export const collections = {
  projects: projectsCollection,
};
