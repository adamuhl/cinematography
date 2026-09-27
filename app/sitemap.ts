import type { MetadataRoute } from "next";
import { getHomepageContent } from "../sanity/lib/projects";

const siteUrl = "https://adamuhl.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, photographyEnabled } = await getHomepageContent();
  const pages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  if (photographyEnabled) {
    pages.push({
      url: `${siteUrl}/photos`,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  pages.push(...projects.map((project) => ({
    url: `${siteUrl}/work/${encodeURIComponent(project.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    images: project.thumbnail ? [project.thumbnail.src] : undefined,
  })));

  return pages;
}
