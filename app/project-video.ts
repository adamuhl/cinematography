import type { ProjectVideo } from "./project-data";

export type PlayableProjectVideo = ProjectVideo & {
  status: "ready";
  playbackId: string;
};

export function getPlayableVideo(video?: ProjectVideo): PlayableProjectVideo | undefined {
  return video?.status === "ready" && video.playbackId ? video as PlayableProjectVideo : undefined;
}
