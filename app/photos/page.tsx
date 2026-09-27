import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHomepageContent } from "../../sanity/lib/projects";
import { SiteHeader, type NavigationSectionId } from "../site-header";

export const metadata: Metadata = {
  title: "Photography",
  description: "Personal photography by cinematographer Adam Uhl.",
  alternates: { canonical: "/photos" },
  openGraph: {
    title: "Photography — Adam Uhl",
    description: "Personal photography by cinematographer Adam Uhl.",
    url: "/photos",
  },
};

const sections: NavigationSectionId[] = ["work", "photos", "about", "contact"];

export default async function PhotographyPreview() {
  const { projects, photography, photographyEnabled } = await getHomepageContent();
  if (!photographyEnabled) notFound();
  const photos = photography.length
    ? photography
    : projects.flatMap((project) => project.gallery ?? []).slice(0, 12);

  return (
    <main className="portfolio-full-bleed photography-page">
      <SiteHeader
        activeSection="photos"
        projectPage
        homeHref="/"
        sections={sections}
        sectionHrefs={{
          work: "/#work",
          photos: "/photos",
          about: "/#about",
          contact: "/#contact",
        }}
      />
      <section className="photography" aria-label="Photography">
        <div className="photography-gallery">
          {photos.map((photo) => (
            <figure className={`photography-image ${photo.presentation ?? "wide"}`} key={`${photo.src}-${photo.alt}`}>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
              {photo.title ? <figcaption>{photo.title}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
