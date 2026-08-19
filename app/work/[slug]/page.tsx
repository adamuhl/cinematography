import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getProject, projects, type ProjectVideo } from "../../project-data";
import { ProjectScrollTop } from "../../project-scroll-top";
import { SiteHeader } from "../../site-header";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: `${project.title} — Adam Uhl`,
    description: project.description ?? `${project.title}, cinematography by Adam Uhl.`,
  };
}

function VideoPlayer({ video, title }: { video: ProjectVideo; title: string }) {
  return (
    <section className="project-video-stage" aria-label={`${title} video`}>
      <div
        className="project-video"
        data-playback-id={video.playbackId}
        style={{ "--video-aspect": video.aspectRatio } as CSSProperties}
      >
        <img src={video.poster} alt="" />
        <span>VIDEO FORTHCOMING</span>
      </div>
    </section>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  return (
    <main className="project-page">
      <ProjectScrollTop />
      <SiteHeader projectPage />

      <article className={`project-viewer ${project.video ? "has-video" : "no-video"}`}>
        {project.video && <VideoPlayer video={project.video} title={project.title} />}

        <section className="project-details" aria-label="Project information">
          <h1>{project.title}</h1>
          <div className="project-details-body">
            <dl className="project-facts">
              {project.director && (
                <div>
                  <dt>Director</dt>
                  <dd>{project.director}</dd>
                </div>
              )}
              {project.productionCompany && (
                <div>
                  <dt>Production</dt>
                  <dd>{project.productionCompany}</dd>
                </div>
              )}
              <div>
                <dt>Year</dt>
                <dd>{project.year}</dd>
              </div>
            </dl>
            {project.description && <p>{project.description}</p>}
            {project.credits?.length ? (
              <dl className="project-credits">
                {project.credits.map((credit) => (
                  <div key={`${credit.label}-${credit.value}`}>
                    <dt>{credit.label}</dt>
                    <dd>{credit.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>

        {project.gallery?.length ? (
          <section className="project-gallery" aria-label={`${project.title} stills`}>
            {project.gallery.map((image) => (
              <figure className={`gallery-image ${image.presentation ?? "wide"}`} key={`${image.src}-${image.alt}`}>
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                />
              </figure>
            ))}
          </section>
        ) : null}
      </article>
    </main>
  );
}
