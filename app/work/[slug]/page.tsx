import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <section className="project-video" aria-label={`${title} video`} data-playback-id={video.playbackId}>
      <img src={video.poster} alt="" />
      <span>VIDEO FORTHCOMING</span>
    </section>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const hasNotes = Boolean(project.description || project.credits?.length);

  return (
    <main className="project-page">
      <ProjectScrollTop />
      <SiteHeader projectPage />

      <article className="project-viewer">
        <header className="project-intro">
          <h1>{project.title}</h1>
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
        </header>

        {project.video && <VideoPlayer video={project.video} title={project.title} />}

        {hasNotes && (
          <section className="project-notes" aria-label="Project information">
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
          </section>
        )}

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
