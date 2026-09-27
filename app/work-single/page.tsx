import type { Metadata } from "next";
import { getHomepageContent } from "../../sanity/lib/projects";
import { Portfolio } from "../portfolio";

export const metadata: Metadata = {
  title: "Single-column Work Study — Adam Uhl",
  robots: { index: false, follow: false },
};

export default async function SingleColumnWorkPreview() {
  const { projects, siteSettings, photography, photographyEnabled } = await getHomepageContent();
  const previewPhotography = photographyEnabled && photography.length
    ? photography
    : photographyEnabled
      ? projects.flatMap((project) => project.gallery ?? []).slice(0, 12)
      : [];

  return <Portfolio projects={projects} siteSettings={siteSettings} photography={previewPhotography} workLayout="full-bleed" />;
}
