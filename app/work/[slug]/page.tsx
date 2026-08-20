import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import type { ProjectVideo } from "../../project-data";
import { PortfolioMuxPlayer } from "../../mux-video-player";
import { getPlayableVideo } from "../../project-video";
import { ProjectScrollTop } from "../../project-scroll-top";
import { SiteHeader } from "../../site-header";
import { getProject, getProjectSlugs } from "../../../sanity/lib/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) return {};

  return {
    title: `${project.title} — Adam Uhl`,
    description: project.description ?? `${project.title}, cinematography by Adam Uhl.`,
  };
}

function VideoPlayer({ video, title }: { video: ProjectVideo; title: string }) {
  if (video.status !== "ready" || !video.playbackId) return null;

  return (
    <section className="project-video-stage" aria-label={`${title} video`}>
      <div
        className="project-video"
        style={{ "--video-aspect": video.aspectRatio ?? 16 / 9 } as CSSProperties}
      >
        <PortfolioMuxPlayer
          playbackId={video.playbackId}
          title={title}
          thumbnailTime={video.thumbnailTime}
        />
      </div>
    </section>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const playableVideo = getPlayableVideo(project.video);
  const gallery = project.gallery;
  const hasFacts = Boolean(project.director || project.productionCompany || project.year);
  const hasCredits = Boolean(project.credits?.length);
  const hasDetails = hasFacts || Boolean(project.description) || hasCredits;
  const viewerState = playableVideo ? "has-video" : "no-media";

  return (
    <main className="project-page">
      <ProjectScrollTop />
      <SiteHeader projectPage />

      <article className={`project-viewer ${viewerState}`}>
        {playableVideo ? <VideoPlayer video={playableVideo} title={project.title} /> : null}

        <section className={`project-details ${hasDetails ? "" : "title-only"}`} aria-label="Project information">
          <h1>{project.title}</h1>
          {hasDetails ? (
            <div className="project-details-body">
              {hasFacts ? (
                <dl className="project-facts">
                  {project.director ? (
                    <div>
                      <dt>Director</dt>
                      <dd>{project.director}</dd>
                    </div>
                  ) : null}
                  {project.productionCompany ? (
                    <div>
                      <dt>Production</dt>
                      <dd>{project.productionCompany}</dd>
                    </div>
                  ) : null}
                  {project.year ? (
                    <div className="project-year">
                      <dt>Year</dt>
                      <dd>{project.year}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
              {project.description ? <p>{project.description}</p> : null}
              {hasCredits ? (
              <dl className="project-credits">
                {project.credits?.map((credit) => (
                  <div key={`${credit.label}-${credit.value}`}>
                    <dt>{credit.label}</dt>
                    <dd>{credit.value}</dd>
                  </div>
                ))}
              </dl>
              ) : null}
            </div>
          ) : null}
        </section>

        {gallery?.length ? (
          <section className="project-gallery" aria-label={`${project.title} stills`}>
            {gallery.map((image) => (
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
