import type { Project } from "./project-data";

export const hoverPreviewDuration = 5;

export function getHoverPreviewConfig(project: Project) {
  if (!project.enableHoverPreview || project.video?.status !== "ready" || !project.video.playbackId) {
    return null;
  }

  return {
    playbackId: project.video.playbackId,
    startTime: Number.isFinite(project.hoverPreviewStartTime)
      ? Math.max(0, project.hoverPreviewStartTime ?? 0)
      : 0,
  };
}
