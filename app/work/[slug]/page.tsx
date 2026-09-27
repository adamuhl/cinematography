import type { Metadata } from "next";
import Link from "next/link";
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
    title: project.title,
    description: project.description ?? `${project.title}, cinematography by Adam Uhl.`,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: project.thumbnail
      ? {
          type: "video.other",
          url: `/work/${project.slug}`,
          title: `${project.title} — Adam Uhl`,
          description: project.description ?? `${project.title}, cinematography by Adam Uhl.`,
          images: [{ url: project.thumbnail.src, alt: project.thumbnail.alt || project.title }],
        }
      : {
          type: "website",
          url: `/work/${project.slug}`,
          title: `${project.title} — Adam Uhl`,
          description: project.description ?? `${project.title}, cinematography by Adam Uhl.`,
        },
    twitter: project.thumbnail
      ? { card: "summary_large_image", images: [{ url: project.thumbnail.src, alt: project.thumbnail.alt || project.title }] }
      : undefined,
  };
}

function VideoPlayer({ video, title }: { video: ProjectVideo; title: string }) {
  if (video.status !== "ready" || !video.playbackId) return null;

  return (
    <section className="project-video-stage" aria-label={`${video.title || title} video`}>
      <div
        className="project-video"
        style={{ "--video-aspect": video.aspectRatio ?? 16 / 9 } as CSSProperties}
      >
        <PortfolioMuxPlayer
          playbackId={video.playbackId}
          title={video.title || title}
          thumbnailTime={video.thumbnailTime}
          poster={video.poster}
        />
      </div>
    </section>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const playableVideos = (project.videos ?? (project.video ? [project.video] : []))
    .flatMap((video) => {
      const playableVideo = getPlayableVideo(video);
      return playableVideo ? [playableVideo] : [];
    });
  const gallery = project.gallery;
  const hasAdditionalCinematographyCredit = project.cinematographyRole === "additionalCinematography";
  const hasFacts = Boolean(hasAdditionalCinematographyCredit || project.director || project.productionCompany);
  const hasCredits = Boolean(project.credits?.length);
  const hasDetails = hasFacts || Boolean(project.description) || hasCredits;
  const viewerState = playableVideos.length ? "has-video" : "no-media";
  const hasMultipleVideos = playableVideos.length > 1;
  const projectDetails = (
    <section className={`project-details ${hasDetails ? "" : "title-only"}`} aria-label="Project information">
      <h1>{project.title}</h1>
      {hasDetails ? (
        <div className="project-details-body">
          {hasFacts ? (
            <dl className="project-facts">
              {hasAdditionalCinematographyCredit ? (
                <div>
                  <dt>Credit</dt>
                  <dd>Additional Cinematography</dd>
                </div>
              ) : null}
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
  );

  return (
    <main className="project-page">
      <ProjectScrollTop />
      <SiteHeader projectPage />
      <Link className="project-back" href="/#work" scroll={false}>Back to Work</Link>

      <article className={`project-viewer ${viewerState} ${hasMultipleVideos ? "multi-video" : ""}`}>
        {hasMultipleVideos ? projectDetails : null}

        {playableVideos.length ? (
          <div className="project-videos">
            {playableVideos.map((video, index) => (
              <div className="project-video-entry" key={`${video.playbackId}-${index}`}>
                <VideoPlayer video={video} title={project.title} />
                {hasMultipleVideos && video.title ? <p className="project-video-title">{video.title}</p> : null}
              </div>
            ))}
          </div>
        ) : null}

        {!hasMultipleVideos ? projectDetails : null}

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
