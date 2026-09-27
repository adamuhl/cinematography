"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";

type PortfolioMuxPlayerProps = {
  playbackId: string;
  title: string;
  thumbnailTime?: number;
  poster?: string;
  showTitle?: boolean;
};

export function PortfolioMuxPlayer({ playbackId, title, thumbnailTime, poster, showTitle = false }: PortfolioMuxPlayerProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <p className="mux-player-error" role="status">VIDEO UNAVAILABLE</p>;
  }

  return (
    <MuxPlayer
      className="mux-player"
      playbackId={playbackId}
      streamType="on-demand"
      maxAutoResolution="1080p"
      renditionOrder="desc"
      capRenditionToPlayerSize={false}
      playsInline
      preload="metadata"
      thumbnailTime={thumbnailTime}
      poster={poster}
      videoTitle={showTitle ? title : undefined}
      metadata={{ video_id: playbackId, ...(showTitle ? { video_title: title } : {}) }}
      accentColor="#ffffff"
      primaryColor="#ffffff"
      secondaryColor="#000000"
      onError={() => setFailed(true)}
    />
  );
}
