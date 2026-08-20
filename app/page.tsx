import { Portfolio } from "./portfolio";
import { getHomepageContent } from "../sanity/lib/projects";

export default async function Home() {
  const { projects, siteSettings } = await getHomepageContent();

  return <Portfolio projects={projects} siteSettings={siteSettings} />;
}
