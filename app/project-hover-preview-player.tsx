"use client";

import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useRef, useState } from "react";
import { hoverPreviewDuration } from "./project-hover-preview";

type ProjectHoverPreviewPlayerProps = {
  playbackId: string;
  startTime: number;
  title: string;
};

export function ProjectHoverPreviewPlayer({ playbackId, startTime, title }: ProjectHoverPreviewPlayerProps) {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const [playing, setPlaying] = useState(false);

  const restartSegment = () => {
    const player = playerRef.current;
    if (!player || player.currentTime < startTime + hoverPreviewDuration) return;
    player.currentTime = startTime;
  };
  const restartAfterEnd = () => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime = startTime;
    void player.play().catch(() => setPlaying(false));
  };

  return (
    <MuxPlayer
      ref={playerRef}
      className={`project-hover-player ${playing ? "playing" : ""}`}
      playbackId={playbackId}
      streamType="on-demand"
      startTime={startTime}
      autoPlay
      muted
      playsInline
      preload="auto"
      nohotkeys
      disableTracking
      disableCookies
      disablePictureInPicture
      proudlyDisplayMuxBadge={false}
      aria-hidden="true"
      videoTitle={`${title} preview`}
      metadata={{ video_id: playbackId, video_title: `${title} thumbnail preview` }}
      style={{ "--controls": "none", "--media-object-fit": "cover", "--media-object-position": "center" }}
      onPlaying={() => setPlaying(true)}
      onTimeUpdate={restartSegment}
      onEnded={restartAfterEnd}
      onError={() => setPlaying(false)}
    />
  );
}
