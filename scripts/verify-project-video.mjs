import assert from "node:assert/strict";
import { getPlayableVideo } from "../app/project-video.ts";
import { getHoverPreviewConfig } from "../app/project-hover-preview.ts";

assert.equal(getPlayableVideo(undefined), undefined);
assert.equal(getPlayableVideo({ status: "preparing", playbackId: "processing" }), undefined);
assert.equal(getPlayableVideo({ status: "errored", playbackId: "failed" }), undefined);
assert.equal(getPlayableVideo({ status: "ready" }), undefined);
assert.equal(getPlayableVideo({ playbackId: "missing-status" }), undefined);

const ready = { status: "ready", playbackId: "public-playback-id", aspectRatio: 2.39 };
assert.equal(getPlayableVideo(ready), ready);

const project = (overrides = {}) => ({
  title: "Preview test",
  slug: "preview-test",
  categories: [],
  showOnFrontPage: false,
  frontPageOrder: 0,
  featured: false,
  featuredOrder: 0,
  ...overrides,
});

assert.equal(getHoverPreviewConfig(project()), null, "Photo-only projects should not preview.");
assert.equal(
  getHoverPreviewConfig(project({ enableHoverPreview: false, video: ready })),
  null,
  "Disabled video projects should not preview.",
);
assert.equal(
  getHoverPreviewConfig(project({ enableHoverPreview: true, video: { status: "preparing", playbackId: "processing" } })),
  null,
  "Processing videos should not preview.",
);
assert.equal(
  getHoverPreviewConfig(project({ enableHoverPreview: true, video: { status: "errored", playbackId: "failed" } })),
  null,
  "Failed videos should not preview.",
);
assert.deepEqual(
  getHoverPreviewConfig(project({ enableHoverPreview: true, hoverPreviewStartTime: 12.5, video: ready })),
  { playbackId: "public-playback-id", startTime: 12.5 },
  "Ready public videos should use their configured start time.",
);

console.log("Project video states verified.");
