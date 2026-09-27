import { Portfolio } from "./portfolio";
import { getHomepageContent } from "../sanity/lib/projects";

export default async function Home() {
  const { projects, siteSettings, photography, photographyEnabled } = await getHomepageContent();
  const previewPhotography = photographyEnabled && photography.length
    ? photography
    : photographyEnabled
      ? projects.flatMap((project) => project.gallery ?? []).slice(0, 12)
      : [];

  return <Portfolio projects={projects} siteSettings={siteSettings} photography={previewPhotography} workLayout="hybrid" />;
}
