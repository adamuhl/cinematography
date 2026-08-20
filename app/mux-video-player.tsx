"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";

type PortfolioMuxPlayerProps = {
  playbackId: string;
  title: string;
  thumbnailTime?: number;
};

export function PortfolioMuxPlayer({ playbackId, title, thumbnailTime }: PortfolioMuxPlayerProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <p className="mux-player-error" role="status">VIDEO UNAVAILABLE</p>;
  }

  return (
    <MuxPlayer
      className="mux-player"
      playbackId={playbackId}
      streamType="on-demand"
      playsInline
      preload="metadata"
      thumbnailTime={thumbnailTime}
      videoTitle={title}
      metadata={{ video_id: playbackId, video_title: title }}
      accentColor="#ffffff"
      primaryColor="#ffffff"
      secondaryColor="#000000"
      onError={() => setFailed(true)}
    />
  );
}
