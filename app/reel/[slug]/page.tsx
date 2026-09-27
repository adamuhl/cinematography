import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getPrivateReel } from "../../../sanity/lib/projects";
import { PortfolioMuxPlayer } from "../../mux-video-player";
import { reelCookieName, verifyReelSession } from "../../reel-auth";

type ReelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export const metadata: Metadata = {
  title: "Private Reel — Adam Uhl",
  robots: { index: false, follow: false, noarchive: true },
};

export default async function ReelPage({ params, searchParams }: ReelPageProps) {
  const { slug } = await params;
  const reel = await getPrivateReel(slug);
  if (!reel) notFound();

  const cookieStore = await cookies();
  const authorized = !reel.passwordHash
    || verifyReelSession(slug, cookieStore.get(reelCookieName(slug))?.value);

  if (!authorized) {
    const { error } = await searchParams;
    return (
      <main className="reel-gate">
        <div className="reel-gate-inner">
          <p className="reel-wordmark">ADAM UHL</p>
          <h1>{reel.title}</h1>
          <form action={`/api/reels/${encodeURIComponent(slug)}/unlock`} method="post">
            <label htmlFor="reel-password">Password</label>
            <input id="reel-password" name="password" type="password" autoComplete="current-password" autoFocus required />
            {error ? <p className="reel-error" role="alert">Incorrect password.</p> : null}
            <button type="submit">View reel</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="private-reel">
      <header className="private-reel-header">
        <p>ADAM UHL</p>
        <div>
          <h1>{reel.title}</h1>
          {reel.intro ? <p>{reel.intro}</p> : null}
        </div>
      </header>

      <div className="private-reel-projects">
        {reel.projects.map((project) => {
          const videos = (project.videos ?? (project.video ? [project.video] : []))
            .filter((video) => video.status === "ready" && video.playbackId);
          if (!videos.length) return null;

          return (
            <section className="private-reel-project" key={project.slug}>
              <h2>
                {project.title}
                {project.detail ? <span> / {project.detail}</span> : null}
              </h2>
              <div className="private-reel-videos">
                {videos.map((video, index) => (
                  <div className="private-reel-video-entry" key={`${video.playbackId}-${index}`}>
                    <div
                      className="private-reel-video"
                      style={{ "--video-aspect": video.aspectRatio ?? 16 / 9 } as CSSProperties}
                    >
                      <PortfolioMuxPlayer
                        playbackId={video.playbackId!}
                        title={video.title || project.title}
                        thumbnailTime={video.thumbnailTime}
                        poster={video.poster}
                        showTitle={false}
                      />
                    </div>
                    {video.title ? <p>{video.title}</p> : null}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
